import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned existing data.');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Developer',
      email: 'demo@example.com',
      password: passwordHash,
    },
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Create mock applications (mix of job and scholarship)
  const mockApplications = [
    // --- JOB APPLICATIONS ---
    {
      applicationType: 'job',
      organization: 'Google',
      title: 'Senior Software Engineer',
      status: 'INTERVIEWING',
      url: 'https://careers.google.com/jobs/results/123456/',
      notes: 'Initial HR screening completed. Technical screen scheduled for next Tuesday.',
      salary: '185000',
      currency: 'USD',
      locationType: 'HYBRID',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    },
    {
      applicationType: 'job',
      organization: 'Stripe',
      title: 'Full Stack Engineer',
      status: 'APPLIED',
      url: 'https://stripe.com/jobs/careers/556677',
      notes: 'Applied through internal referral from Sarah.',
      salary: '175000',
      currency: 'USD',
      locationType: 'REMOTE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    },
    {
      applicationType: 'internship',
      organization: 'Vercel',
      title: 'Frontend Intern',
      status: 'OFFERED',
      url: 'https://vercel.com/careers/frontend-engineer',
      notes: 'Received written offer! Deciding on salary/equity package details.',
      salary: '45 / hour',
      currency: 'USD',
      locationType: 'REMOTE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    },
    {
      applicationType: 'job',
      organization: 'Netflix',
      title: 'UI Engineer',
      status: 'REJECTED',
      url: 'https://jobs.netflix.com/jobs/889900',
      notes: 'Completed final round virtual onsite. Position was closed and filled internally.',
      salary: '250000',
      currency: 'USD',
      locationType: 'ON_SITE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), // 25 days ago
    },

    // --- UNIVERSITY APPLICATIONS ---
    {
      applicationType: 'scholarship',
      organization: 'Stanford University', // Institution
      title: 'Computer Science', // Program Name
      status: 'Admitted',
      url: 'https://cs.stanford.edu/admissions/mscs',
      notes: 'Received formal admission email! Funding packages include fully funded tuition + TA stipend.',
      fundingType: 'fully funded',
      stipendAmount: '45000',
      currency: 'USD',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days from now
      locationType: 'ON_SITE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
      degreeLevel: 'Masters',
      hasSop: true,
      hasTranscripts: true,
      hasReferences: true,
      hasTestScores: true,
      hasCvResume: true,
      hasPersonalStatement: false,
    },
    {
      applicationType: 'scholarship',
      organization: 'MIT', // Institution
      title: 'Machine Learning', // Program Name
      status: 'Documents in Progress',
      url: 'https://eecs.mit.edu/academics-admissions/graduate-program/',
      notes: 'Drafting SOP. Transcripts uploaded. Need to follow up with Professor Vance and Professor Cho for letters.',
      fundingType: 'fully funded',
      stipendAmount: '50000',
      currency: 'USD',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now (Upcoming!)
      locationType: 'ON_SITE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      degreeLevel: 'PhD',
      potentialAdvisor: 'Professor Cho (EECS)',
      hasSop: true,
      hasTranscripts: true,
      hasReferences: false,
      hasTestScores: false,
      hasCvResume: true,
      hasPersonalStatement: false,
    },
    {
      applicationType: 'scholarship',
      organization: 'University of Cambridge', // Institution
      title: 'Advanced Computer Science', // Program Name
      status: 'Submitted',
      url: 'https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmphil',
      notes: 'Submitted via Gates Cambridge Trust gateway. Interview invitations will be sent out in November.',
      fundingType: 'partial',
      stipendAmount: '25000',
      currency: 'GBP',
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      locationType: 'ON_SITE',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
      degreeLevel: 'Masters',
      hasSop: true,
      hasTranscripts: true,
      hasReferences: true,
      hasTestScores: true,
      hasCvResume: true,
      hasPersonalStatement: false,
    },
    {
      applicationType: 'scholarship',
      organization: 'University of Oxford', // Institution
      title: 'Mathematical Sciences', // Program Name
      status: 'Researching',
      url: 'https://www.ox.ac.uk/admissions/graduate/courses/msc-mathematical-sciences',
      notes: 'Checking eligibility criteria and reviewing scholarship deadlines. The primary funding deadline is in January.',
      fundingType: 'self-funded',
      stipendAmount: '0',
      currency: 'GBP',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      locationType: 'ON_SITE',
      appliedDate: new Date(), // Today
      degreeLevel: 'Bachelors',
      hasSop: false,
      hasTranscripts: false,
      hasReferences: false,
      hasTestScores: false,
      hasCvResume: false,
      hasPersonalStatement: true,
    },
  ];

  for (const app of mockApplications) {
    await prisma.application.create({
      data: {
        userId: demoUser.id,
        ...app,
      },
    });
  }

  console.log(`Created ${mockApplications.length} mock applications.`);

  // Create mock notifications
  const mockNotifications = [
    {
      userId: demoUser.id,
      message: 'Welcome to Application Tracker! Track both job and scholarship pipelines now.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    },
    {
      userId: demoUser.id,
      message: 'Application for MSc Computer Science at Stanford University updated to "Admitted".',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      userId: demoUser.id,
      message: 'Application for PhD Machine Learning at MIT is due in 15 days.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  for (const notification of mockNotifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`Created ${mockNotifications.length} mock notifications.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
