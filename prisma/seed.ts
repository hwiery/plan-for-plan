import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '테스트 사용자',
      planType: 'free',
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create sample project
  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      userId: testUser.id,
      name: '비행기표 예약 서비스',
      initialIdea: '비행기표를 쉽게 예약할 수 있는 서비스를 만들고 싶습니다.',
      status: 'draft',
    },
  });

  console.log('✅ Created sample project:', sampleProject.name);

  // Create sample interview session
  const sampleQuestions = [
    {
      id: '1',
      question: '이 서비스의 주요 타겟 사용자는 누구인가요?',
      type: 'text',
      explanation: '타겟 사용자를 명확히 하여 서비스 방향을 설정합니다.',
    },
    {
      id: '2',
      question: '기존 비행기표 예약 서비스와 어떤 차별점을 가질 예정인가요?',
      type: 'text',
      explanation: '경쟁 우위를 파악하여 핵심 기능을 정의합니다.',
    },
  ];

  const sampleAnswers = [
    {
      questionId: '1',
      answer: '20-30대 직장인들이 주요 타겟입니다.',
    },
  ];

  await prisma.interviewSession.upsert({
    where: { projectId: sampleProject.id },
    update: {},
    create: {
      projectId: sampleProject.id,
      questions: sampleQuestions,
      answers: sampleAnswers,
      currentStep: 1,
    },
  });

  console.log('✅ Created sample interview session');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });