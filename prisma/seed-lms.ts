import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding LMS courses...')

  // Find or create a system admin user for course ownership
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@liftplannerpro.org' }
  })

  if (!adminUser) {
    adminUser = await prisma.user.findFirst({
      where: { email: 'mickyblenk@gmail.com' }
    })
  }

  if (!adminUser) {
    // Create a system user for courses
    adminUser = await prisma.user.create({
      data: {
        email: 'system@liftplannerpro.org',
        name: 'LiftPlannerPro Training',
      }
    })
    console.log('Created system user for course ownership')
  }

  // Course 1: Crane Setup & Operation
  const course1 = await prisma.course.upsert({
    where: { slug: 'crane-setup-operation' },
    update: {},
    create: {
      title: 'Crane Setup & Operation',
      slug: 'crane-setup-operation',
      description: 'Essential knowledge for safe crane setup and operation. Learn about SWL margins, BS7121 requirements, outrigger setup, load moment indicators, and proper crane operation procedures.',
      price: 0,
      currency: 'GBP',
      category: 'Crane Operations',
      difficulty: 'Beginner',
      isPublished: true,
      isFeatured: true,
      instructor: { connect: { id: adminUser.id } },
    }
  })

  // Course 2: AP Standards & Procedures
  const course2 = await prisma.course.upsert({
    where: { slug: 'ap-standards-procedures' },
    update: {},
    create: {
      title: 'Appointed Person (AP) Standards & Procedures',
      slug: 'ap-standards-procedures',
      description: 'Comprehensive training on Appointed Person responsibilities and standards. Covers lift planning, supervision, documentation, and BS7121 compliance requirements.',
      price: 0,
      currency: 'GBP',
      category: 'Appointed Person',
      difficulty: 'Intermediate',
      isPublished: true,
      isFeatured: true,
      instructor: { connect: { id: adminUser.id } },
    }
  })

  // Course 3: LOLER & BS7121 Compliance
  const course3 = await prisma.course.upsert({
    where: { slug: 'loler-bs7121-compliance' },
    update: {},
    create: {
      title: 'LOLER & BS7121 Compliance',
      slug: 'loler-bs7121-compliance',
      description: 'Legal requirements and British Standards for lifting operations. Learn about thorough examinations, documentation requirements, and compliance procedures.',
      price: 0,
      currency: 'GBP',
      category: 'Compliance',
      difficulty: 'Intermediate',
      isPublished: true,
      isFeatured: false,
      instructor: { connect: { id: adminUser.id } },
    }
  })

  // Course 4: Safe Use of Lifting Equipment
  const course4 = await prisma.course.upsert({
    where: { slug: 'safe-lifting-equipment' },
    update: {},
    create: {
      title: 'Safe Use of Lifting Equipment',
      slug: 'safe-lifting-equipment',
      description: 'Best practices for safe lifting operations. Covers sling angles, exclusion zones, hand signals, lifting accessories, and emergency procedures.',
      price: 0,
      currency: 'GBP',
      category: 'Safety',
      difficulty: 'Beginner',
      isPublished: true,
      isFeatured: false,
      instructor: { connect: { id: adminUser.id } },
    }
  })

  console.log('Created courses:', course1.title, course2.title, course3.title, course4.title)

  // Create quizzes for each course
  const quizzes = [
    { courseId: course1.id, title: 'Crane Setup & Operation Quiz', passingScore: 80 },
    { courseId: course2.id, title: 'AP Standards Quiz', passingScore: 85 },
    { courseId: course3.id, title: 'LOLER & BS7121 Quiz', passingScore: 85 },
    { courseId: course4.id, title: 'Lifting Safety Quiz', passingScore: 80 },
  ]

  for (const q of quizzes) {
    const quiz = await prisma.quiz.upsert({
      where: { id: `quiz-${q.courseId}` },
      update: {},
      create: {
        id: `quiz-${q.courseId}`,
        courseId: q.courseId,
        title: q.title,
        description: `Assessment for ${q.title}`,
        passingScore: q.passingScore,
        maxAttempts: 3,
        timeLimit: 30,
      }
    })
    console.log(`Created quiz: ${quiz.title}`)
  }

  // Add sample questions to the first quiz (Crane Setup)
  const quiz1Id = `quiz-${course1.id}`
  const existingQuestions = await prisma.quizQuestion.count({ where: { quizId: quiz1Id } })

  if (existingQuestions === 0) {
    const sampleQuestions = [
      {
        question: "What is the minimum safe working load (SWL) margin that should be maintained when planning a lift?",
        options: [
          { text: "10% below SWL", isCorrect: false },
          { text: "25% below SWL", isCorrect: true },
          { text: "50% below SWL", isCorrect: false },
          { text: "No margin required if calculations are correct", isCorrect: false }
        ],
        explanation: "A 25% safety margin below SWL is industry standard to account for dynamic loads and safety factors."
      },
      {
        question: "According to BS7121, what must be done before any lifting operation begins?",
        options: [
          { text: "Check weather conditions only", isCorrect: false },
          { text: "Complete a lift plan and risk assessment", isCorrect: true },
          { text: "Test the crane's maximum capacity", isCorrect: false },
          { text: "Notify local authorities", isCorrect: false }
        ],
        explanation: "BS7121 requires a comprehensive lift plan and risk assessment before any lifting operation."
      },
      {
        question: "What is the maximum wind speed for safe crane operation (typical mobile crane)?",
        options: [
          { text: "15 mph (24 km/h)", isCorrect: false },
          { text: "20 mph (32 km/h)", isCorrect: true },
          { text: "25 mph (40 km/h)", isCorrect: false },
          { text: "30 mph (48 km/h)", isCorrect: false }
        ],
        explanation: "Most mobile cranes have a maximum operating wind speed of 20 mph (32 km/h) as per manufacturer specifications."
      },
      {
        question: "When setting up outriggers, what is the most critical factor?",
        options: [
          { text: "Speed of deployment", isCorrect: false },
          { text: "Ground bearing capacity and level surface", isCorrect: true },
          { text: "Distance from the load", isCorrect: false },
          { text: "Weather conditions", isCorrect: false }
        ],
        explanation: "Ground bearing capacity and level surface are critical for crane stability and safe operation."
      },
      {
        question: "What does LOLER stand for?",
        options: [
          { text: "Lifting Operations and Lifting Equipment Regulations", isCorrect: true },
          { text: "Load Operations and Lifting Equipment Rules", isCorrect: false },
          { text: "Lifting Operations and Load Equipment Regulations", isCorrect: false },
          { text: "Load Operations and Load Equipment Rules", isCorrect: false }
        ],
        explanation: "LOLER stands for Lifting Operations and Lifting Equipment Regulations 1998."
      }
    ]

    for (let i = 0; i < sampleQuestions.length; i++) {
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz1Id,
          question: sampleQuestions[i].question,
          questionType: 'multiple_choice',
          options: sampleQuestions[i].options,
          explanation: sampleQuestions[i].explanation,
          order: i + 1,
          points: 1
        }
      })
    }
    console.log('Added sample questions to Crane Setup quiz')
  }

  console.log('LMS seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

