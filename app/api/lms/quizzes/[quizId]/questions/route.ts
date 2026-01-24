import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// POST - Add a question to a quiz
export async function POST(
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
    const { question, questionType, options, explanation, points } = body

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Question and at least 2 options are required' }, { status: 400 })
    }

    // Get next order number
    const maxOrder = await prisma.quizQuestion.aggregate({
      where: { quizId },
      _max: { order: true }
    })

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question,
        questionType: questionType || 'multiple_choice',
        options: options,
        explanation: explanation || null,
        points: points || 1,
        order: (maxOrder._max.order || 0) + 1
      }
    })

    return NextResponse.json({ question: quizQuestion })
  } catch (error) {
    console.error('Error adding question:', error)
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 })
  }
}

// GET - List questions for a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    
    const questions = await prisma.quizQuestion.findMany({
      where: { quizId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error listing questions:', error)
    return NextResponse.json({ error: 'Failed to list questions' }, { status: 500 })
  }
}

