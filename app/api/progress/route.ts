// API Route: GET /api/progress
// Retrieves user progress and statistics

import { NextRequest, NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get all attempts for user
    const attemptsQuery = `
      SELECT 
        sa.id,
        sa.scenario_id,
        ts.title as scenario_title,
        ts.difficulty,
        sa.score,
        sa.passed,
        sa.completed_at,
        COUNT(*) OVER (PARTITION BY sa.scenario_id) as attempt_count
      FROM scenario_attempts sa
      JOIN training_scenarios ts ON sa.scenario_id = ts.id
      WHERE sa.user_id = $1
      ORDER BY sa.completed_at DESC
    `

    const attempts = await queryAll(attemptsQuery, [parseInt(userId)])

    // Calculate statistics
    const totalAttempts = attempts.length
    const passedAttempts = attempts.filter((a: any) => a.passed).length
    const averageScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / totalAttempts)
      : 0
    const bestScore = totalAttempts > 0
      ? Math.max(...attempts.map((a: any) => a.score || 0))
      : 0

    // Group by difficulty
    const byDifficulty = {
      beginner: attempts.filter((a: any) => a.difficulty === 'beginner'),
      intermediate: attempts.filter((a: any) => a.difficulty === 'intermediate'),
      advanced: attempts.filter((a: any) => a.difficulty === 'advanced')
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        averageScore,
        bestScore,
        byDifficulty,
        recentAttempts: attempts.slice(0, 5)
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

