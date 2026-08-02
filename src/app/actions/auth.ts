'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, comparePassword, signJWT, verifyJWT, UserSession } from '@/lib/auth';
import { auth, currentUser } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Register a new user
 */
export async function register(formData: FormData): Promise<ActionResponse> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = (formData.get('role') as string) || 'STUDENT';

    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: 'Email is already registered.' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
      },
    });

    // Create session JWT
    const sessionPayload: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await signJWT(sessionPayload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

/**
 * Login an existing user
 */
export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Create session JWT
    const sessionPayload: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await signJWT(sessionPayload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    cookieStore.delete('__session');
    cookieStore.delete('__client_uat');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Failed to logout.' };
  }
}

/**
 * Get current authenticated user session helper (Clerk integrated)
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const { userId } = await auth();
    console.log('[getCurrentUser] Clerk userId:', userId);
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    // Find user by Clerk ID
    let dbUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      // Check if user exists by email (pre-Clerk migration)
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!existingUser) {
        // Auto-create new user
        dbUser = await db.user.create({
          data: {
            id: userId,
            name,
            email: email.toLowerCase(),
            password: 'clerk_managed',
            role: 'STUDENT',
          },
        });
      } else {
        // Migrate existing user to Clerk ID
        // To prevent unique constraint violation on email, update the old user's email first
        const tempEmail = `migrated_${existingUser.id}_${Date.now()}@temp.local`;
        await db.user.update({
          where: { id: existingUser.id },
          data: { email: tempEmail },
        });

        // Create the new user with Clerk ID and the original email
        dbUser = await db.user.create({
          data: {
            id: userId,
            name,
            email: email.toLowerCase(),
            password: 'clerk_managed',
            role: existingUser.role,
            profilePicture: existingUser.profilePicture,
          },
        });

        // Update all related records
        await db.application.updateMany({
          where: { userId: existingUser.id },
          data: { userId: userId },
        });

        await db.notification.updateMany({
          where: { userId: existingUser.id },
          data: { userId: userId },
        });

        // Delete the old user
        await db.user.delete({ where: { id: existingUser.id } });
      }
    }

    return {
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

/**
 * Update user profile details (name and role)
 */
export async function updateUserProfile(name: string, role: string, profilePicture?: string): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: { name, role, ...(profilePicture !== undefined ? { profilePicture } : {}) },
    });

    // Re-issue JWT session token
    const sessionPayload: UserSession = {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    };
    const token = await signJWT(sessionPayload);

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}

/**
 * Query complete User record from database based on current session
 */
export async function getCompleteUserRecord() {
  try {
    const session = await getCurrentUser();
    if (!session) return null;
    return await db.user.findUnique({
      where: { id: session.userId }
    });
  } catch (e) {
    return null;
  }
}

/**
 * Auto-login developer test user server action
 */
export async function loginDevTestUser(): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    
    // Ensure test user exists in DB
    let defaultUser = await db.user.findFirst({
      where: { email: 'test@applyhub.com' }
    });
    
    if (!defaultUser) {
      defaultUser = await db.user.create({
        data: {
          name: 'Developer Test',
          email: 'test@applyhub.com',
          password: 'test_password_hash',
          role: 'STUDENT',
        },
      });
    }

    const sessionPayload: UserSession = {
      userId: defaultUser.id,
      email: defaultUser.email,
      name: defaultUser.name,
    };
    
    const token = await signJWT(sessionPayload);
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error: any) {
    console.error('loginDevTestUser error:', error);
    return { success: false, error: 'Failed to auto-login.' };
  }
}

/**
 * Reset password for a user
 */
export async function resetPassword(formData: FormData): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

/**
 * Login or automatically register a user using Google authentication details
 */
export async function loginWithGoogle(email: string, name: string): Promise<ActionResponse> {
  try {
    if (!email || !name) {
      return { success: false, error: 'Email and Name are required.' };
    }

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create user automatically
      const passwordHash = await hashPassword(Math.random().toString(36).slice(-10));
      user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: passwordHash,
          role: 'STUDENT',
        },
      });

      // Create welcome notification
      await db.notification.create({
        data: {
          userId: user.id,
          message: `Welcome to MyTraks, ${name}! Your account has been automatically created via Google.`,
        }
      });
    }

    // Create session JWT
    const sessionPayload: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await signJWT(sessionPayload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    return { success: false, error: 'Failed to authenticate with Google.' };
  }
}

/**
 * Get user notification preference settings
 */
export async function getNotificationPreferences(): Promise<ActionResponse<any>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        emailNotificationsEnabled: true,
        deadlineRemindersEnabled: true,
        dailyMotivationEnabled: true,
        monthlyReportEnabled: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    return { success: true, data: user };
  } catch (error: any) {
    console.error('getNotificationPreferences error:', error);
    return { success: false, error: 'Failed to retrieve notification settings.' };
  }
}

/**
 * Update user notification preference settings
 */
export async function updateNotificationPreferences(payload: {
  emailNotificationsEnabled?: boolean;
  deadlineRemindersEnabled?: boolean;
  dailyMotivationEnabled?: boolean;
  monthlyReportEnabled?: boolean;
}): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db.user.update({
      where: { id: session.userId },
      data: payload,
    });

    return { success: true };
  } catch (error: any) {
    console.error('updateNotificationPreferences error:', error);
    return { success: false, error: 'Failed to update notification settings.' };
  }
}

