import { PrismaClient, NotificationLevel, MemberRole, MembershipStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const password = await bcrypt.hash('Password123!', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        passwordHash: password,
        firstName: 'Alice',
        lastName: 'Anderson',
        displayName: 'Alice A.',
        bio: 'Mental health advocate and facilitator',
        consentGiven: true,
        consentDate: new Date(),
        dataProcessingConsent: true,
        marketingConsent: false,
        notificationPreference: NotificationLevel.MINIMAL,
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        passwordHash: password,
        firstName: 'Bob',
        lastName: 'Brown',
        displayName: 'Bob B.',
        bio: 'Looking for supportive community',
        consentGiven: true,
        consentDate: new Date(),
        dataProcessingConsent: true,
        marketingConsent: false,
        notificationPreference: NotificationLevel.MINIMAL,
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@example.com' },
      update: {},
      create: {
        email: 'carol@example.com',
        passwordHash: password,
        firstName: 'Carol',
        lastName: 'Chen',
        displayName: 'Carol C.',
        bio: 'Mindfulness practitioner',
        consentGiven: true,
        consentDate: new Date(),
        dataProcessingConsent: true,
        marketingConsent: true,
        notificationPreference: NotificationLevel.NORMAL,
        isVerified: true,
      },
    }),
  ]);

  console.log('✅ Created 3 test users');

  // Create a test group
  const group = await prisma.group.create({
    data: {
      name: 'Mindfulness & Wellbeing',
      description: 'A safe space for sharing experiences and practicing mindfulness together',
      purpose: 'Support mental health through community and mindfulness practices',
      maxMembers: 10,
      isPrivate: true,
      requireApproval: true,
      memberships: {
        create: [
          {
            userId: users[0].id,
            role: MemberRole.FACILITATOR,
            status: MembershipStatus.ACTIVE,
          },
          {
            userId: users[1].id,
            role: MemberRole.MEMBER,
            status: MembershipStatus.ACTIVE,
          },
          {
            userId: users[2].id,
            role: MemberRole.MEMBER,
            status: MembershipStatus.ACTIVE,
          },
        ],
      },
    },
  });

  console.log('✅ Created test group with 3 members');

  // Create some posts
  await prisma.post.createMany({
    data: [
      {
        groupId: group.id,
        authorId: users[0].id,
        content: 'Welcome to our mindfulness group! Feel free to share your thoughts and experiences.',
      },
      {
        groupId: group.id,
        authorId: users[1].id,
        content: 'Thank you for creating this space. Looking forward to connecting with everyone.',
      },
    ],
  });

  console.log('✅ Created test posts');

  // Create an event
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 7); // Next week
  startTime.setHours(18, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(19, 30, 0, 0);

  await prisma.event.create({
    data: {
      groupId: group.id,
      title: 'Weekly Mindfulness Session',
      description: 'Join us for guided meditation and reflection',
      location: 'Community Center',
      locationDetails: 'Room 101',
      startTime,
      endTime,
      maxParticipants: 8,
      isOnline: false,
    },
  });

  console.log('✅ Created test event');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\nTest credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: alice@example.com | Password: Password123!');
  console.log('Email: bob@example.com   | Password: Password123!');
  console.log('Email: carol@example.com | Password: Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
