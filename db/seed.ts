// Database Seed Script
// Populates database with sample scenarios and data

import { query } from '@/lib/db'

async function seed() {
  try {
    console.log('Starting database seed...')

    // Insert sample scenarios
    const scenarios = [
      {
        title: 'Urban Building Lift',
        description: 'Lift a 2-tonne load onto a 3-storey building in a confined urban site',
        difficulty: 'beginner',
        category: 'Urban',
        estimated_time_minutes: 15,
        learning_objectives: 'Learn to identify obstructions, assess ground conditions, and select appropriate equipment',
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
        description: 'Position a mobile crane on soft ground with machinery and fragile load',
        difficulty: 'intermediate',
        category: 'Industrial',
        estimated_time_minutes: 20,
        learning_objectives: 'Learn to handle fragile loads, assess soft ground, and work in confined spaces',
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
        description: 'Lift heavy equipment to a high-rise building rooftop with power lines',
        difficulty: 'advanced',
        category: 'Urban',
        estimated_time_minutes: 30,
        learning_objectives: 'Master complex scenarios with multiple hazards and constraints',
        site_width: 40,
        site_length: 50,
        load_weight: 5000,
        load_width: 4,
        load_length: 3,
        load_height: 2.5,
        load_fragile: false
      }
    ]

    for (const scenario of scenarios) {
      const result = await query(
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
      console.log(`Created scenario: ${scenario.title} (ID: ${scenarioId})`)

      // Add sample obstructions for first scenario
      if (scenarioId === 1) {
        await query(
          `INSERT INTO scenario_obstructions (scenario_id, type, x, y, width, height, hazard_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [scenarioId, 'building', 5, 10, 8, 12, 'high']
        )
        await query(
          `INSERT INTO scenario_obstructions (scenario_id, type, x, y, width, height, hazard_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [scenarioId, 'power_line', 15, 0, 20, 1, 'critical']
        )
      }
    }

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()

