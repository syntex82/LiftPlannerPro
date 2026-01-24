import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// DELETE - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Verify the question belongs to the quiz
    const question = await prisma.quizQuestion.findFirst({
      where: { id: questionId, quizId }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Delete the question
    await prisma.quizQuestion.delete({
      where: { id: questionId }
    })

    // Reorder remaining questions
    await prisma.quizQuestion.updateMany({
      where: { quizId, order: { gt: question.order } },
      data: { order: { decrement: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}

// PUT - Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { questionId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { question, questionType, options, explanation, points, order } = body

    const quizQuestion = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(question !== undefined && { question }),
        ...(questionType !== undefined && { questionType }),
        ...(options !== undefined && { options }),
        ...(explanation !== undefined && { explanation }),
        ...(points !== undefined && { points }),
        ...(order !== undefined && { order })
      }
    })

    return NextResponse.json({ question: quizQuestion })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

