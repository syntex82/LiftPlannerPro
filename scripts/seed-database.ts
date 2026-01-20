#!/usr/bin/env node

// Database Seeding Script
// Run with: npx ts-node scripts/seed-database.ts

import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'syntex82',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'liftplanner_db',
})

async function seed() {
  const client = await pool.connect()
  try {
    console.log('🌱 Starting database seed...')

    // Sample scenarios
    const scenarios = [
      {
        title: 'Urban Building Lift',
        description: 'Lift a 2-tonne load onto a 3-storey building in a confined urban site with power lines and narrow street',
        difficulty: 'beginner',
        category: 'Urban',
        estimated_time_minutes: 15,
        learning_objectives: 'Learn to identify obstructions, assess ground conditions, and select appropriate equipment for urban environments',
        site_width: 30,
        site_length: 40,
        load_weight: 2000,
        load_width: 2,
        load_length: 2,
        load_height: 1.5,
        load_fragile: false
      },
      {
        title: 'Industrial Site Lift',
        description: 'Position a mobile crane on soft ground with machinery and fragile load in confined space',
        difficulty: 'intermediate',
        category: 'Industrial',
        estimated_time_minutes: 20,
        learning_objectives: 'Learn to handle fragile loads, assess soft ground bearing capacity, and work in confined industrial spaces',
        site_width: 50,
        site_length: 60,
        load_weight: 3500,
        load_width: 3,
        load_length: 2,
        load_height: 2,
        load_fragile: true
      },
      {
        title: 'High-Rise Rooftop Lift',
        description: 'Lift heavy equipment to a high-rise building rooftop with multiple hazards including power lines and wind exposure',
        difficulty: 'advanced',
        category: 'Urban',
        estimated_time_minutes: 30,
        learning_objectives: 'Master complex scenarios with multiple hazards, constraints, and critical decision-making',
        site_width: 40,
        site_length: 50,
        load_weight: 5000,
        load_width: 4,
        load_length: 3,
        load_height: 2.5,
        load_fragile: false
      }
    ]

    // Insert scenarios
    for (const scenario of scenarios) {
      const result = await client.query(
        `INSERT INTO training_scenarios (
          title, description, difficulty, category, estimated_time_minutes,
          learning_objectives, site_width, site_length, load_weight,
          load_width, load_length, load_height, load_fragile
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          scenario.title,
          scenario.description,
          scenario.difficulty,
          scenario.category,
          scenario.estimated_time_minutes,
          scenario.learning_objectives,
          scenario.site_width,
          scenario.site_length,
          scenario.load_weight,
          scenario.load_width,
          scenario.load_length,
          scenario.load_height,
          scenario.load_fragile
        ]
      )

      const scenarioId = result.rows[0].id
      console.log(`✓ Created scenario: ${scenario.title} (ID: ${scenarioId})`)

      // Add obstructions for Urban Building Lift
      if (scenarioId === 1) {
        await client.query(
          `INSERT INTO scenario_obstructions (scenario_id, type, x, y, width, height, hazard_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [scenarioId, 'building', 5, 10, 8, 12, 'high']
        )
        await client.query(
          `INSERT INTO scenario_obstructions (scenario_id, type, x, y, width, height, hazard_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [scenarioId, 'power_line', 15, 0, 20, 1, 'critical']
        )
        console.log('  ✓ Added obstructions')
      }

      // Add ground conditions
      if (scenarioId === 2) {
        await client.query(
          `INSERT INTO ground_conditions (scenario_id, x, y, width, height, type, bearing_capacity, risk_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [scenarioId, 10, 20, 15, 20, 'soft', 50, 'high']
        )
        console.log('  ✓ Added ground conditions')
      }
    }

    console.log('\n✅ Database seed completed successfully!')
    console.log(`📊 Created ${scenarios.length} training scenarios`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()

