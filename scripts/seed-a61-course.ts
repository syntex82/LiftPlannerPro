/**
 * Seed script for A61 Appointed Person (Lifting Operations) Course
 * Run with: npx ts-node scripts/seed-a61-course.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COURSE_DATA = {
  title: 'A61 Appointed Person (Lifting Operations)',
  slug: 'a61-appointed-person-lifting-operations',
  description: `Welcome to the A61 Appointed Person (Lifting Operations) course.

This course has been designed to give you the knowledge, confidence, and practical skills required to plan, manage, and supervise lifting operations safely and in full compliance with UK legislation.

As an Appointed Person, you hold a legal and moral responsibility for ensuring lifting operations are properly planned, risks are controlled, and teams are managed effectively.

Throughout this course, you'll learn to:
• Understand the legal duties and responsibilities of an Appointed Person under LOLER, PUWER, and associated guidance
• Conduct and document thorough risk assessments
• Prepare compliant lift plans and RAMS
• Use CAD-based lift planning software (Lift Planner Pro)
• Select appropriate cranes and calculate safe working loads
• Manage and communicate effectively with your lifting team
• Monitor and review lifting operations to ensure ongoing safety and compliance

By the end of this course, you will be able to:
✓ Confidently act as an Appointed Person
✓ Produce compliant lift plans and RAMS
✓ Use CAD software to visually plan lifting operations
✓ Select suitable cranes and equipment
✓ Manage lifting teams safely and professionally

Welcome to the course, and let's begin your journey toward becoming a competent and trusted Appointed Person. 💪`,
  shortDescription: 'Master the skills to plan, manage, and supervise lifting operations safely and in compliance with UK legislation.',
  category: 'Lifting Operations',
  difficulty: 'advanced',
  price: 299,
  currency: 'GBP',
  isPublished: false,
  isFeatured: true,
  requirements: ['Basic understanding of construction or industrial site operations', 'Familiarity with lifting equipment terminology', 'Access to a computer for CAD exercises'],
  learningOutcomes: ['Understand the legal duties of an Appointed Person under LOLER and PUWER', 'Conduct and document thorough risk assessments', 'Prepare compliant lift plans and RAMS', 'Use CAD-based lift planning software', 'Select appropriate cranes and calculate safe working loads', 'Manage and communicate effectively with lifting teams', 'Monitor and review lifting operations for ongoing safety'],
  tags: ['LOLER', 'PUWER', 'Lifting Operations', 'Appointed Person', 'A61', 'Crane Operations', 'RAMS', 'Lift Planning']
}

const LESSONS = [
  { title: 'Module 1: Role of the Appointed Person', description: 'Understand who the Appointed Person is, their legal standing, and their key responsibilities in lifting operations.', videos: ['1.1 Introduction to the Appointed Person Role', '1.2 Legal Standing and Authority', '1.3 Key Responsibilities Overview', '1.4 Working with the Lifting Team'], quizTitle: 'Module 1 Quiz: Role of the Appointed Person' },
  { title: 'Module 2: Legislation & Compliance', description: 'Learn about LOLER 1998, PUWER 1998, BS 7121, and other critical regulations governing lifting operations.', videos: ['2.1 Introduction to LOLER 1998', '2.2 PUWER 1998 Requirements', '2.3 BS 7121 Code of Practice', '2.4 HSE Guidance and Best Practice'], quizTitle: 'Module 2 Quiz: Legislation & Compliance' },
  { title: 'Module 3: Lift Planning Fundamentals', description: 'Master the principles of lift planning including load assessment, site surveys, and planning documentation.', videos: ['3.1 What is a Lift Plan?', '3.2 Site Surveys and Assessment', '3.3 Load Assessment Principles', '3.4 Creating the Lift Plan Document'], quizTitle: 'Module 3 Quiz: Lift Planning Fundamentals' },
  { title: 'Module 4: Risk Assessment & RAMS', description: 'Develop skills in hazard identification, risk assessment methodologies, and creating comprehensive RAMS.', videos: ['4.1 Hazard Identification for Lifting Operations', '4.2 Risk Assessment Methodology', '4.3 Creating Method Statements', '4.4 RAMS Review and Approval Process'], quizTitle: 'Module 4 Quiz: Risk Assessment & RAMS' },
  { title: 'Module 5: CAD Lift Planning with Lift Planner Pro', description: 'Hands-on training using Lift Planner Pro software to create professional, visual lift plans.', videos: ['5.1 Introduction to Lift Planner Pro', '5.2 Setting Up Your Lift Plan', '5.3 Adding Cranes and Equipment', '5.4 Creating Site Layouts', '5.5 Generating Reports and Documentation'], quizTitle: 'Module 5 Quiz: CAD Lift Planning' },
  { title: 'Module 6: Crane Selection & Load Calculations', description: 'Learn to select appropriate cranes, understand load charts, and perform accurate load calculations.', videos: ['6.1 Types of Cranes and Their Applications', '6.2 Understanding Load Charts', '6.3 Load Calculation Methods', '6.4 Rigging and Sling Selection', '6.5 Crane Positioning and Ground Conditions'], quizTitle: 'Module 6 Quiz: Crane Selection & Load Calculations' },
  { title: 'Module 7: Managing the Lift Team', description: 'Develop leadership skills for briefing, coordinating, and communicating with your lifting team.', videos: ['7.1 Team Roles and Responsibilities', '7.2 Pre-Lift Briefings', '7.3 Communication Protocols', '7.4 Coordination and Supervision'], quizTitle: 'Module 7 Quiz: Managing the Lift Team' },
  { title: 'Module 8: Monitoring & Reviewing Lifting Operations', description: 'Learn to monitor lifts in progress, respond to issues, and conduct post-lift reviews for continuous improvement.', videos: ['8.1 Monitoring Lifts in Progress', '8.2 Responding to Issues and Incidents', '8.3 Post-Lift Reviews and Debriefs', '8.4 Continuous Improvement and Lessons Learned'], quizTitle: 'Module 8 Quiz: Monitoring & Reviewing' }
]

async function seedA61Course() {
  console.log('🎓 Creating A61 Appointed Person Course...\n')
  try {
    const instructor = await prisma.user.findFirst({ where: { email: 'mickyblenk@gmail.com' } })
    if (!instructor) { console.error('❌ Admin user not found.'); process.exit(1) }
    const existing = await prisma.course.findUnique({ where: { slug: COURSE_DATA.slug } })
    if (existing) {
      console.log('⚠️  Course already exists. Deleting and recreating...')
      await prisma.course.delete({ where: { id: existing.id } })
    }
    const course = await prisma.course.create({ data: { ...COURSE_DATA, instructorId: instructor.id } })
    console.log(`✅ Created course: ${course.title}\n   ID: ${course.id}\n`)

    for (let i = 0; i < LESSONS.length; i++) {
      const lessonData = LESSONS[i]
      const lesson = await prisma.courseLesson.create({
        data: { courseId: course.id, title: lessonData.title, description: lessonData.description, order: i + 1, isPublished: true, isFree: i === 0 }
      })
      console.log(`📚 Created: ${lessonData.title}`)
      for (let v = 0; v < lessonData.videos.length; v++) {
        await prisma.lessonVideo.create({ data: { lessonId: lesson.id, title: lessonData.videos[v], videoUrl: 'PLACEHOLDER', videoType: 'youtube', order: v + 1 } })
        console.log(`   ▶️ ${lessonData.videos[v]}`)
      }
      await prisma.quiz.create({ data: { courseId: course.id, lessonId: lesson.id, title: lessonData.quizTitle, passingScore: 80, maxAttempts: 3, isRequired: true, order: i + 1 } })
      console.log(`   📝 ${lessonData.quizTitle}`)
    }
    await prisma.quiz.create({ data: { courseId: course.id, title: 'Final Assessment: A61 Appointed Person', description: 'Complete this final assessment to receive your certificate.', passingScore: 80, maxAttempts: 3, isRequired: true, order: 100 } })
    console.log('\n✅ A61 Course created successfully!')
    console.log(`\n🔗 Admin URL: /admin/lms/courses/${course.id}`)
    console.log('   Go there to add video URLs to each lesson.\n')
  } catch (error) { console.error('❌ Error:', error); throw error }
  finally { await prisma.$disconnect() }
}

seedA61Course()

