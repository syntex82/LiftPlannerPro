// API Route: GET /api/scenarios
// Retrieves all training scenarios from database

import { NextRequest, NextResponse } from 'next/server'
import { queryAll } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const difficulty = searchParams.get('difficulty')
    const category = searchParams.get('category')

    let query = 'SELECT * FROM training_scenarios WHERE 1=1'
    const params: any[] = []

    // Add filters if provided
    if (difficulty) {
      query += ' AND difficulty = $' + (params.length + 1)
      params.push(difficulty)
    }

    if (category) {
      query += ' AND category = $' + (params.length + 1)
      params.push(category)
    }

    query += ' ORDER BY difficulty, title'

    const scenarios = await queryAll(query, params)

    return NextResponse.json({
      success: true,
      data: scenarios,
      count: scenarios.length
    })
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      difficulty,
      category,
      estimated_time_minutes,
      learning_objectives,
      site_width,
      site_length,
      load_weight,
      load_width,
      load_length,
      load_height,
      load_fragile
    } = body

    const query = `
      INSERT INTO training_scenarios (
        title, description, difficulty, category, estimated_time_minutes,
        learning_objectives, site_width, site_length, load_weight,
        load_width, load_length, load_height, load_fragile
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `

    const params = [
      title,
      description,
      difficulty,
      category,
      estimated_time_minutes,
      learning_objectives,
      site_width,
      site_length,
      load_weight,
      load_width,
      load_length,
      load_height,
      load_fragile
    ]

    const result = await queryAll(query, params)

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}

