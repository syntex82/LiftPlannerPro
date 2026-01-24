import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - Get quiz with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const session = await getServerSession(authOptions)
    const userIsAdmin = isAdmin(session?.user?.email)

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // For students, remove correct answers from response
    let questions: any[] = quiz.questions
    if (!userIsAdmin) {
      questions = quiz.questions.map(q => ({
        ...q,
        options: (q.options as any[]).map((opt: any) => ({
          text: opt.text,
          // Don't expose isCorrect to students
        })),
        explanation: null // Don't show explanation before answering
      }))
    }

    // Get user's attempt history
    let attempts: any[] = []
    let remainingAttempts = quiz.maxAttempts
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        attempts = await prisma.quizAttempt.findMany({
          where: { userId: user.id, quizId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
        if (quiz.maxAttempts > 0) {
          remainingAttempts = Math.max(0, quiz.maxAttempts - attempts.length)
        }
      }
    }

    return NextResponse.json({
      quiz: { ...quiz, questions },
      attempts,
      remainingAttempts,
      canAttempt: quiz.maxAttempts === 0 || remainingAttempts > 0
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

// PUT - Update quiz (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, passingScore, maxAttempts, timeLimit, 
            shuffleQuestions, showResults, isRequired, questions } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (passingScore !== undefined) updateData.passingScore = passingScore
    if (maxAttempts !== undefined) updateData.maxAttempts = maxAttempts
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit
    if (shuffleQuestions !== undefined) updateData.shuffleQuestions = shuffleQuestions
    if (showResults !== undefined) updateData.showResults = showResults
    if (isRequired !== undefined) updateData.isRequired = isRequired

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData
    })

    // If questions are provided, update them
    if (questions && Array.isArray(questions)) {
      // Delete existing questions and recreate
      await prisma.quizQuestion.deleteMany({ where: { quizId } })
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await prisma.quizQuestion.create({
          data: {
            quizId,
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

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
  }
}

// DELETE - Delete quiz (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.quiz.delete({ where: { id: quizId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}

