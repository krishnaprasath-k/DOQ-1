import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';

/**
 * Health Check API Endpoint
 * 
 * This endpoint provides comprehensive health status for the application
 * including database connectivity, external services, and system metrics.
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    external_services: {
      openrouter: 'up' | 'down' | 'unknown';
      clerk: 'up' | 'down' | 'unknown';
      vapi: 'up' | 'down' | 'unknown';
    };
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Initialize health status
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'down' },
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        },
        external_services: {
          openrouter: 'unknown',
          clerk: 'unknown',
          vapi: 'unknown'
        }
      }
    };

    // Check database connectivity
    try {
      const dbStartTime = Date.now();
      
      // Simple database query to check connectivity
      await db.execute('SELECT 1');
      
      health.checks.database = {
        status: 'up',
        responseTime: Date.now() - dbStartTime
      };
    } catch (error) {
      health.checks.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      health.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };

    // Check external services (basic connectivity)
    const serviceChecks = await Promise.allSettled([
      // OpenRouter API check
      fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }).then(() => 'up').catch(() => 'down'),

      // Clerk API check (simple ping)
      fetch('https://api.clerk.com/v1/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      }).then(() => 'up').catch(() => 'down'),

      // VAPI check
      fetch('https://api.vapi.ai/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      }).then(() => 'up').catch(() => 'down')
    ]);

    health.checks.external_services.openrouter = serviceChecks[0].status === 'fulfilled' ? serviceChecks[0].value : 'down';
    health.checks.external_services.clerk = serviceChecks[1].status === 'fulfilled' ? serviceChecks[1].value : 'down';
    health.checks.external_services.vapi = serviceChecks[2].status === 'fulfilled' ? serviceChecks[2].value : 'down';

    // Determine overall health status
    const hasDownServices = Object.values(health.checks.external_services).some(status => status === 'down');
    const memoryUsageHigh = health.checks.memory.percentage > 90;
    
    if (health.checks.database.status === 'down') {
      health.status = 'unhealthy';
    } else if (hasDownServices || memoryUsageHigh) {
      health.status = 'degraded';
    }

    // Return appropriate HTTP status code
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    // Critical error in health check itself
    const errorHealth: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'down', error: 'Health check failed' },
        memory: { used: 0, total: 0, percentage: 0 },
        external_services: {
          openrouter: 'unknown',
          clerk: 'unknown',
          vapi: 'unknown'
        }
      }
    };

    return NextResponse.json(errorHealth, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Simple HEAD request for basic health check
export async function HEAD() {
  try {
    // Quick database check
    await db.execute('SELECT 1');
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
