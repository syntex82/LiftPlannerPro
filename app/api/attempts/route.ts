// API Route: GET/POST /api/attempts
// Manages training scenario attempts

import { NextRequest, NextResponse } from 'next/server'
import { queryAll, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const scenarioId = searchParams.get('scenarioId')

    let query = 'SELECT * FROM scenario_attempts WHERE 1=1'
    const params: any[] = []

    if (userId) {
      query += ' AND user_id = $' + (params.length + 1)
      params.push(parseInt(userId))
    }

    if (scenarioId) {
      query += ' AND scenario_id = $' + (params.length + 1)
      params.push(parseInt(scenarioId))
    }

    query += ' ORDER BY completed_at DESC'

    const attempts = await queryAll(query, params)

    return NextResponse.json({
      success: true,
      data: attempts,
      count: attempts.length
    })
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attempts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      scenario_id,
      selected_crane_id,
      crane_x,
      crane_y,
      capacity_checked,
      radius_verified,
      ground_bearing_checked,
      obstacles_reviewed,
      outriggers_checked,
      score,
      passed,
      total_time_seconds
    } = body

    const query = `
      INSERT INTO scenario_attempts (
        user_id, scenario_id, selected_crane_id, crane_x, crane_y,
        capacity_checked, radius_verified, ground_bearing_checked,
        obstacles_reviewed, outriggers_checked, score, passed, total_time_seconds,
        completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `

    const params = [
      user_id,
      scenario_id,
      selected_crane_id,
      crane_x,
      crane_y,
      capacity_checked,
      radius_verified,
      ground_bearing_checked,
      obstacles_reviewed,
      outriggers_checked,
      score,
      passed,
      total_time_seconds
    ]

    const result = await queryAll(query, params)

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating attempt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create attempt' },
      { status: 500 }
    )
  }
}

