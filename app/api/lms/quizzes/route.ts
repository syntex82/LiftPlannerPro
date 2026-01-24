import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - List quizzes (admin only for full list, students see their progress)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userIsAdmin = isAdmin(session?.user?.email)
    const { searchParams } = new URL(request.url)
    
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (lessonId) where.lessonId = lessonId

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
  }
}

// POST - Create quiz (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      courseId, lessonId, title, description, 
      passingScore, maxAttempts, timeLimit,
      shuffleQuestions, showResults, isRequired, questions 
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!courseId && !lessonId) {
      return NextResponse.json({ error: 'Either courseId or lessonId is required' }, { status: 400 })
    }

    // Get the next order number
    const lastQuiz = await prisma.quiz.findFirst({
      where: courseId ? { courseId } : { lessonId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        lessonId,
        title,
        description,
        passingScore: passingScore || 80,
        maxAttempts: maxAttempts || 3,
        timeLimit,
        shuffleQuestions: shuffleQuestions || false,
        showResults: showResults !== false,
        isRequired: isRequired !== false,
        order: (lastQuiz?.order || 0) + 1
      }
    })

    // Create questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            question: q.question,
            questionType: q.questionType || 'multiple_choice',
            options: q.options, // [{text: string, isCorrect: boolean}]
            explanation: q.explanation,
            points: q.points || 1,
            order: i + 1
          }
        })
      }
    }

    const createdQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: true }
    })

    return NextResponse.json({ quiz: createdQuiz }, { status: 201 })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }
}

