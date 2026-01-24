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

  // =====================================================
  // CREATE LESSONS AND VIDEOS FOR EACH COURSE
  // =====================================================

  // Course 1: Crane Setup & Operation - Lessons
  const lesson1_1 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-crane-intro' },
    update: {},
    create: {
      id: 'lesson-crane-intro',
      courseId: course1.id,
      title: 'Introduction to Crane Safety',
      description: 'Learn the fundamental principles of crane safety, including hazard awareness and the importance of proper planning.',
      order: 1,
      duration: 900 // 15 minutes
    }
  })

  const lesson1_2 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-crane-setup' },
    update: {},
    create: {
      id: 'lesson-crane-setup',
      courseId: course1.id,
      title: 'Crane Setup Procedures',
      description: 'Step-by-step guide to setting up a mobile crane, including outrigger deployment and ground bearing checks.',
      order: 2,
      duration: 1200 // 20 minutes
    }
  })

  const lesson1_3 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-crane-operation' },
    update: {},
    create: {
      id: 'lesson-crane-operation',
      courseId: course1.id,
      title: 'Safe Crane Operation',
      description: 'Operating procedures, load charts, and communication protocols for safe lifting.',
      order: 3,
      duration: 1500 // 25 minutes
    }
  })

  console.log('Created lessons for Course 1')

  // Course 2: AP Standards - Lessons
  const lesson2_1 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-ap-role' },
    update: {},
    create: {
      id: 'lesson-ap-role',
      courseId: course2.id,
      title: 'The Role of the Appointed Person',
      description: 'Understanding the legal responsibilities and duties of an Appointed Person for lifting operations.',
      order: 1,
      duration: 1200
    }
  })

  const lesson2_2 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-ap-planning' },
    update: {},
    create: {
      id: 'lesson-ap-planning',
      courseId: course2.id,
      title: 'Lift Planning Essentials',
      description: 'How to create comprehensive lift plans that meet BS7121 requirements.',
      order: 2,
      duration: 1800 // 30 minutes
    }
  })

  console.log('Created lessons for Course 2')

  // Course 3: LOLER & BS7121 - Lessons
  const lesson3_1 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-loler-overview' },
    update: {},
    create: {
      id: 'lesson-loler-overview',
      courseId: course3.id,
      title: 'LOLER Requirements Overview',
      description: 'Understanding the Lifting Operations and Lifting Equipment Regulations 1998.',
      order: 1,
      duration: 1500
    }
  })

  const lesson3_2 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-bs7121-overview' },
    update: {},
    create: {
      id: 'lesson-bs7121-overview',
      courseId: course3.id,
      title: 'BS7121 Code of Practice',
      description: 'British Standard for safe use of cranes - key requirements and implementation.',
      order: 2,
      duration: 1500
    }
  })

  console.log('Created lessons for Course 3')

  // Course 4: Safe Lifting Equipment - Lessons
  const lesson4_1 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-slings-shackles' },
    update: {},
    create: {
      id: 'lesson-slings-shackles',
      courseId: course4.id,
      title: 'Slings, Shackles & Lifting Accessories',
      description: 'Selection, inspection and safe use of lifting accessories.',
      order: 1,
      duration: 1200
    }
  })

  const lesson4_2 = await prisma.courseLesson.upsert({
    where: { id: 'lesson-hand-signals' },
    update: {},
    create: {
      id: 'lesson-hand-signals',
      courseId: course4.id,
      title: 'Hand Signals & Communication',
      description: 'Standard crane hand signals and effective communication during lifting operations.',
      order: 2,
      duration: 900
    }
  })

  console.log('Created lessons for Course 4')

  // =====================================================
  // CREATE VIDEOS FOR EACH LESSON
  // =====================================================

  // Course 1 Videos
  await prisma.lessonVideo.upsert({
    where: { id: 'video-crane-safety-intro' },
    update: {},
    create: {
      id: 'video-crane-safety-intro',
      lessonId: lesson1_1.id,
      title: 'Crane Safety Fundamentals',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder - replace with actual training video
      duration: 480,
      order: 1
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-hazard-awareness' },
    update: {},
    create: {
      id: 'video-hazard-awareness',
      lessonId: lesson1_1.id,
      title: 'Hazard Awareness on Site',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 420,
      order: 2
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-outrigger-setup' },
    update: {},
    create: {
      id: 'video-outrigger-setup',
      lessonId: lesson1_2.id,
      title: 'Outrigger Setup & Ground Bearing',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 720,
      order: 1
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-load-charts' },
    update: {},
    create: {
      id: 'video-load-charts',
      lessonId: lesson1_3.id,
      title: 'Understanding Load Charts',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 900,
      order: 1
    }
  })

  // Course 2 Videos
  await prisma.lessonVideo.upsert({
    where: { id: 'video-ap-responsibilities' },
    update: {},
    create: {
      id: 'video-ap-responsibilities',
      lessonId: lesson2_1.id,
      title: 'AP Legal Responsibilities',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 720,
      order: 1
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-lift-plan-creation' },
    update: {},
    create: {
      id: 'video-lift-plan-creation',
      lessonId: lesson2_2.id,
      title: 'Creating a Lift Plan Step by Step',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 1080,
      order: 1
    }
  })

  // Course 3 Videos
  await prisma.lessonVideo.upsert({
    where: { id: 'video-loler-explained' },
    update: {},
    create: {
      id: 'video-loler-explained',
      lessonId: lesson3_1.id,
      title: 'LOLER 1998 Explained',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 900,
      order: 1
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-bs7121-guide' },
    update: {},
    create: {
      id: 'video-bs7121-guide',
      lessonId: lesson3_2.id,
      title: 'BS7121 Practical Guide',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 900,
      order: 1
    }
  })

  // Course 4 Videos
  await prisma.lessonVideo.upsert({
    where: { id: 'video-sling-inspection' },
    update: {},
    create: {
      id: 'video-sling-inspection',
      lessonId: lesson4_1.id,
      title: 'Sling Inspection & Selection',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 720,
      order: 1
    }
  })

  await prisma.lessonVideo.upsert({
    where: { id: 'video-hand-signals-demo' },
    update: {},
    create: {
      id: 'video-hand-signals-demo',
      lessonId: lesson4_2.id,
      title: 'Standard Crane Hand Signals',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 540,
      order: 1
    }
  })

  console.log('Created videos for all lessons')

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

