// Database Connection Module
// Handles PostgreSQL connection and query execution

import { Pool } from 'pg'

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'syntex82',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'liftplanner_db',
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * Execute a query against the database
 */
export async function query(
  text: string,
  params?: any[]
): Promise<any> {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

/**
 * Get a single row from query result
 */
export async function queryOne(
  text: string,
  params?: any[]
): Promise<any | null> {
  const result = await query(text, params)
  return result.rows[0] || null
}

/**
 * Get all rows from query result
 */
export async function queryAll(
  text: string,
  params?: any[]
): Promise<any[]> {
  const result = await query(text, params)
  return result.rows
}

/**
 * Execute a transaction
 */
export async function transaction(
  callback: (client: any) => Promise<any>
): Promise<any> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end()
}

export default pool

