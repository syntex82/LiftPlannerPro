import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    let dbStatus = 'unknown'
    let dbLatency = 0
    
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbLatency = Date.now() - start
      dbStatus = 'healthy'
    } catch (error) {
      dbStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    }

    // Return 503 if unhealthy for load balancer health checks
    const statusCode = dbStatus === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }, 
      { status: 503 }
    )
  }
}

