'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, comparePassword, signJWT, verifyJWT, UserSession } from '@/lib/auth';
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
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Failed to logout.' };
  }
}

/**
 * Get current authenticated user session helper
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;

    const session = await verifyJWT(token);
    if (!session) return null;

    // Verify user exists in DB to prevent stale session cookie bugs (e.g. after prisma db push)
    const userExists = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!userExists) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Update user profile details (name and role)
 */
export async function updateUserProfile(name: string, role: string): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: { name, role },
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
