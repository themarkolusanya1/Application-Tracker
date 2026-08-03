'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './auth';

/**
 * Fetch all applications for the logged-in user
 */
export async function getApplications(): Promise<ActionResponse<any[]>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const applications = await db.application.findMany({
      where: { userId: session.userId },
      orderBy: { appliedDate: 'desc' },
    });

    return { success: true, data: applications };
  } catch (error: any) {
    console.error('getApplications error:', error);
    return { success: false, error: 'Failed to retrieve applications.' };
  }
}

/**
 * Fetch a single application by ID
 */
export async function getApplicationById(id: string): Promise<ActionResponse<any>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const application = await db.application.findFirst({
      where: { id, userId: session.userId },
    });

    if (!application) {
      return { success: false, error: 'Application not found.' };
    }

    return { success: true, data: application };
  } catch (error: any) {
    console.error('getApplicationById error:', error);
    return { success: false, error: 'Failed to retrieve application details.' };
  }
}

/**
 * Create a new application
 */
export async function createApplication(payload: {
  applicationType?: string;
  organization: string;
  title: string;
  status: string;
  url?: string;
  notes?: string;
  salary?: string;
  locationType?: string;
  appliedDate?: string;
  fundingType?: string;
  stipendAmount?: string;
  openingDate?: string;
  deadline?: string;
  hasSop?: boolean;
  hasTranscripts?: boolean;
  hasReferences?: boolean;
  hasTestScores?: boolean;
  hasCvResume?: boolean;
  hasPersonalStatement?: boolean;
  hasCoverLetter?: boolean;
  currency?: string;
  degreeLevel?: string;
  potentialAdvisor?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const { 
      applicationType, organization, title, status, url, notes, salary, locationType, appliedDate,
      fundingType, stipendAmount, openingDate, deadline, hasSop, hasTranscripts, hasReferences, hasTestScores,
      hasCvResume, hasPersonalStatement, hasCoverLetter, currency, degreeLevel, potentialAdvisor
    } = payload;

    if (!organization || !title) {
      return { success: false, error: 'Organization/Institution and Title/Program Name are required.' };
    }

    const parsedAppliedDate = appliedDate ? new Date(appliedDate) : new Date();
    const parsedOpeningDate = openingDate ? new Date(openingDate) : null;
    const parsedDeadline = deadline ? new Date(deadline) : null;

    // Create the application
    const application = await db.application.create({
      data: {
        userId: session.userId,
        applicationType: applicationType || 'job',
        organization,
        title,
        status,
        url: url || null,
        notes: notes || null,
        salary: salary || null,
        locationType: locationType || 'ON_SITE',
        appliedDate: parsedAppliedDate,
        fundingType: fundingType || null,
        stipendAmount: stipendAmount || null,
        openingDate: parsedOpeningDate,
        deadline: parsedDeadline,
        hasSop: hasSop || false,
        hasTranscripts: hasTranscripts || false,
        hasReferences: hasReferences || false,
        hasTestScores: hasTestScores || false,
        hasCvResume: hasCvResume || false,
        hasPersonalStatement: hasPersonalStatement || false,
        hasCoverLetter: hasCoverLetter || false,
        currency: currency || 'USD',
        degreeLevel: degreeLevel || null,
        potentialAdvisor: potentialAdvisor || null,
      },
    });

    // Create a notification for the creation
    const typeLabel = applicationType === 'scholarship' ? 'scholarship program' : 'job';
    await db.notification.create({
      data: {
        userId: session.userId,
        message: `Added new ${typeLabel}: ${title} at ${organization}.`,
      },
    });

    revalidatePath('/');
    return { success: true, data: application };
  } catch (error: any) {
    console.error('createApplication error:', error);
    return { success: false, error: 'Failed to create application.' };
  }
}

/**
 * Update an existing application
 */
export async function updateApplication(
  id: string,
  payload: {
    applicationType?: string;
    organization?: string;
    title?: string;
    status?: string;
    url?: string;
    notes?: string;
    salary?: string;
    locationType?: string;
    appliedDate?: string;
    fundingType?: string;
    stipendAmount?: string;
    openingDate?: string;
    deadline?: string;
    hasSop?: boolean;
    hasTranscripts?: boolean;
    hasReferences?: boolean;
    hasTestScores?: boolean;
    hasCvResume?: boolean;
    hasPersonalStatement?: boolean;
    hasCoverLetter?: boolean;
    currency?: string;
    degreeLevel?: string;
    potentialAdvisor?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Verify ownership
    const existing = await db.application.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return { success: false, error: 'Application not found or unauthorized.' };
    }

    const { 
      applicationType, organization, title, status, url, notes, salary, locationType, appliedDate,
      fundingType, stipendAmount, openingDate, deadline, hasSop, hasTranscripts, hasReferences, hasTestScores,
      hasCvResume, hasPersonalStatement, hasCoverLetter, currency, degreeLevel, potentialAdvisor
    } = payload;

    const updateData: any = {};
    if (applicationType !== undefined) updateData.applicationType = applicationType;
    if (organization !== undefined) updateData.organization = organization;
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (url !== undefined) updateData.url = url || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (salary !== undefined) updateData.salary = salary || null;
    if (locationType !== undefined) updateData.locationType = locationType;
    if (appliedDate !== undefined) updateData.appliedDate = new Date(appliedDate);
    if (fundingType !== undefined) updateData.fundingType = fundingType || null;
    if (stipendAmount !== undefined) updateData.stipendAmount = stipendAmount || null;
    if (openingDate !== undefined) updateData.openingDate = openingDate ? new Date(openingDate) : null;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (hasSop !== undefined) updateData.hasSop = hasSop;
    if (hasTranscripts !== undefined) updateData.hasTranscripts = hasTranscripts;
    if (hasReferences !== undefined) updateData.hasReferences = hasReferences;
    if (hasTestScores !== undefined) updateData.hasTestScores = hasTestScores;
    if (hasCvResume !== undefined) updateData.hasCvResume = hasCvResume;
    if (hasPersonalStatement !== undefined) updateData.hasPersonalStatement = hasPersonalStatement;
    if (hasCoverLetter !== undefined) updateData.hasCoverLetter = hasCoverLetter;
    if (currency !== undefined) updateData.currency = currency;
    if (degreeLevel !== undefined) updateData.degreeLevel = degreeLevel || null;
    if (potentialAdvisor !== undefined) updateData.potentialAdvisor = potentialAdvisor || null;

    const updated = await db.application.update({
      where: { id },
      data: updateData,
    });

    // If status changed, create a notification
    if (status && status !== existing.status) {
      const statusLabels: Record<string, string> = {
        WISH_LIST: 'Wish List',
        APPLIED: 'Applied',
        INTERVIEWING: 'Interviewing',
        OFFERED: 'Offered',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
      };
      const label = statusLabels[status] || status;
      await db.notification.create({
        data: {
          userId: session.userId,
          message: `Application for ${updated.title} at ${updated.organization} updated to "${label}".`,
        },
      });
    }

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updateApplication error:', error);
    return { success: false, error: 'Failed to update application.' };
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Verify ownership
    const existing = await db.application.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return { success: false, error: 'Application not found or unauthorized.' };
    }

    await db.application.delete({
      where: { id },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: session.userId,
        message: `Deleted application: ${existing.title} at ${existing.organization}.`,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('deleteApplication error:', error);
    return { success: false, error: 'Failed to delete application.' };
  }
}

/**
 * Fetch recent notifications for current user
 */
export async function getNotifications(): Promise<ActionResponse<any[]>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Keep list to recent 20
    });

    return { success: true, data: notifications };
  } catch (error: any) {
    console.error('getNotifications error:', error);
    return { success: false, error: 'Failed to retrieve notifications.' };
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(id: string): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db.notification.updateMany({
      where: { id, userId: session.userId },
      data: { isRead: true },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('markNotificationAsRead error:', error);
    return { success: false, error: 'Failed to update notification.' };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('markAllNotificationsAsRead error:', error);
    return { success: false, error: 'Failed to update notifications.' };
  }
}

/**
 * Create a simulated notification for progress report or daily email motivation
 */
export async function sendSimulatedNotification(message: string): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db.notification.create({
      data: {
        userId: session.userId,
        message,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('sendSimulatedNotification error:', error);
    return { success: false, error: 'Failed to trigger simulated notification.' };
  }
}

/**
 * Scans the database and generates a daily reminder & activity summary notification for the logged-in user.
 */
export async function generateDailyNotificationSummary(): Promise<ActionResponse> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    const userId = session.userId;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all user applications
    const apps = await db.application.findMany({
      where: { userId },
    });

    // 1. Calculate activities done today (created or updated today)
    const updatedToday = apps.filter(app => {
      const updatedDate = new Date(app.updatedAt);
      return updatedDate >= todayStart && updatedDate <= todayEnd;
    });

    // 2. Identify upcoming scholarship deadlines (in next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = apps.filter(app => {
      if (!app.deadline) return false;
      const dl = new Date(app.deadline);
      return dl >= now && dl <= sevenDaysFromNow;
    });

    // 3. Identify active interviews
    const activeInterviews = apps.filter(app => 
      app.status === 'INTERVIEWING' || app.status === 'Interview'
    );

    // Construct Summary Message
    let activityText = '';
    if (updatedToday.length > 0) {
      const itemsList = updatedToday.map(a => `${a.title} (${a.organization})`).join(', ');
      activityText = `📊 Activity Summary: You updated/logged ${updatedToday.length} applications today (${itemsList}).`;
    } else {
      activityText = `📊 Activity Summary: No applications logged or updated today.`;
    }

    // Construct Reminders Message
    let reminderText = '';
    const reminders: string[] = [];
    if (upcomingDeadlines.length > 0) {
      reminders.push(`${upcomingDeadlines.length} upcoming deadlines this week`);
    }
    if (activeInterviews.length > 0) {
      reminders.push(`${activeInterviews.length} active interview loops in progress`);
    }

    if (reminders.length > 0) {
      reminderText = `⏰ Reminders: You have ${reminders.join(' and ')}. Keep preparing!`;
    } else {
      reminderText = `⏰ Reminders: No urgent deadlines or scheduled interviews this week.`;
    }

    // Construct final message simulating email delivery + app notification
    const fullMessage = `✉️ [Email Sent & Inbox Summary] ${activityText} ${reminderText}`;

    // Write to notifications database
    await db.notification.create({
      data: {
        userId,
        message: fullMessage,
      },
    });

    revalidatePath('/');
    return { success: true, data: fullMessage };
  } catch (error: any) {
    console.error('generateDailyNotificationSummary error:', error);
    return { success: false, error: 'Failed to generate notification summary.' };
  }
}
