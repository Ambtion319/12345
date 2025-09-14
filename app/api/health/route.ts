import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database/connection'
import { logger } from '@/lib/services/logger'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database health
    const dbHealth = await checkDatabaseHealth()
    
    // Check application health
    const appHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    // Overall health status
    const overallStatus = dbHealth.postgres && dbHealth.mongodb && dbHealth.redis ? 'healthy' : 'degraded'
    
    const healthCheck = {
      ...appHealth,
      status: overallStatus,
      databases: dbHealth,
      responseTime: Date.now() - startTime
    }

    // Log health check
    logger.logSystemHealth('api', overallStatus, {
      responseTime: healthCheck.responseTime,
      memoryUsage: healthCheck.memory.percentage
    })

    const statusCode = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(healthCheck, { status: statusCode })

  } catch (error) {
    logger.error('Health check failed', error as Error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: Date.now() - Date.now()
    }, { status: 503 })
  }
}
