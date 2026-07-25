import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/app/actions/auth';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationType, organization, title, notes, status, appliedDate } = body;

    if (!organization || !title) {
      return NextResponse.json(
        { success: false, error: 'Organization and title are required.' },
        { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // Determine target user
    let userId = '';
    const session = await getCurrentUser();
    if (session) {
      userId = session.userId;
    } else {
      // Local fallback: assign to the first registered user
      const firstUser = await db.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      } else {
        return NextResponse.json(
          { success: false, error: 'No user registered. Please sign up in MyTraks first.' },
          { 
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }
    }

    // Create the application record
    const newApp = await db.application.create({
      data: {
        userId,
        applicationType: applicationType || 'job',
        organization,
        title,
        status: status || 'WISH_LIST',
        notes: notes || '',
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      },
    });

    // Create a notification about the synced application
    await db.notification.create({
      data: {
        userId,
        message: `Synced new ${applicationType === 'scholarship' ? 'university application' : 'job posting'} for "${title}" at "${organization}" via Chrome Scraper extension.`,
      },
    });

    return NextResponse.json(
      { success: true, data: newApp },
      { 
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  } catch (error: any) {
    console.error('API create application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save application.' },
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
