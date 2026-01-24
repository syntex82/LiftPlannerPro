import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: { select: { id: true, title: true } }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Check attempt limits
    if (quiz.maxAttempts > 0) {
      const attemptCount = await prisma.quizAttempt.count({
        where: { userId: user.id, quizId }
      })
      if (attemptCount >= quiz.maxAttempts) {
        return NextResponse.json({ 
          error: 'Maximum attempts reached',
          maxAttempts: quiz.maxAttempts
        }, { status: 403 })
      }
    }

    const body = await request.json()
    const { answers, timeSpent } = body // answers: {questionId: selectedOptions[]}

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const answerResults: { questionId: string; isCorrect: boolean }[] = []

    for (const question of quiz.questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id] || []
      const options = question.options as { text: string; isCorrect: boolean }[]
      
      // Find correct answers
      const correctIndices = options
        .map((opt, idx) => opt.isCorrect ? idx : -1)
        .filter(idx => idx !== -1)
      
      // Check if user's answer matches
      const userIndices = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
      const isCorrect = 
        userIndices.length === correctIndices.length &&
        userIndices.every(idx => correctIndices.includes(idx)) &&
        correctIndices.every(idx => userIndices.includes(idx))

      if (isCorrect) {
        earnedPoints += question.points
      }

      answerResults.push({ questionId: question.id, isCorrect })
    }

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = scorePercent >= quiz.passingScore

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        score: scorePercent,
        passed,
        completedAt: new Date(),
        timeSpent: timeSpent || null
      }
    })

    // Create answer records
    for (const result of answerResults) {
      await prisma.quizAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: result.questionId,
          selectedOptions: answers[result.questionId] || [],
          isCorrect: result.isCorrect
        }
      })
    }

    // Update course progress if quiz is part of a course
    if (quiz.courseId) {
      await updateCourseProgress(user.id, quiz.courseId)
      
      // Generate certificate if passed and course is complete
      if (passed) {
        await checkAndGenerateCertificate(user.id, quiz.courseId, user.name || 'Student')
      }
    }

    // Get detailed results if showResults is true
    let detailedResults = null
    if (quiz.showResults) {
      detailedResults = quiz.questions.map(q => {
        const options = q.options as { text: string; isCorrect: boolean }[]
        return {
          questionId: q.id,
          question: q.question,
          explanation: q.explanation,
          options: options.map((opt, idx) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            wasSelected: (answers[q.id] || []).includes(idx)
          })),
          isCorrect: answerResults.find(r => r.questionId === q.id)?.isCorrect || false
        }
      })
    }

    return NextResponse.json({
      attempt,
      score: scorePercent,
      passed,
      passingScore: quiz.passingScore,
      earnedPoints,
      totalPoints,
      results: detailedResults
    })
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 })
  }
}

// Helper functions
async function updateCourseProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { select: { id: true } },
      quizzes: { where: { lessonId: null }, select: { id: true } }
    }
  })
  if (!course) return

  const totalLessons = course.lessons.length
  const [completedLessons, passedQuizzes] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId, lessonId: { in: course.lessons.map(l => l.id) }, completed: true }
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: { in: course.quizzes.map(q => q.id) },
        passed: true
      },
      distinct: ['quizId']
    })
  ])

  const progress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0
  const allQuizzesPassed = passedQuizzes.length >= course.quizzes.length
  const completed = progress >= 100 && allQuizzesPassed

  await prisma.lMSProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      progress,
      lessonsCompleted: completedLessons,
      totalLessons,
      quizzesPassed: passedQuizzes.length,
      totalQuizzes: course.quizzes.length,
      completed,
      completedAt: completed ? new Date() : null
    },
    update: {
      progress,
      lessonsCompleted: completedLessons,
      totalLessons,
      quizzesPassed: passedQuizzes.length,
      totalQuizzes: course.quizzes.length,
      completed,
      completedAt: completed ? new Date() : undefined,
      lastAccessedAt: new Date()
    }
  })
}

async function checkAndGenerateCertificate(userId: string, courseId: string, studentName: string) {
  const progress = await prisma.lMSProgress.findUnique({
    where: { userId_courseId: { userId, courseId } }
  })

  if (!progress?.completed) return null

  // Check if certificate already exists
  const existing = await prisma.certificate.findFirst({
    where: { userId, courseId }
  })
  if (existing) return existing

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true }
  })
  if (!course) return null

  // Generate unique certificate number
  const certNumber = `LPP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber: certNumber,
      studentName,
      courseName: course.title,
      score: progress.quizzesPassed > 0 ? 100 : null,
      verificationUrl: `https://liftplannerpro.org/verify/${certNumber}`
    }
  })

  return certificate
}

