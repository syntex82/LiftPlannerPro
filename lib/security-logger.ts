import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export interface SecurityLogData {
  userId?: string
  action: SecurityAction
  resource?: string
  ipAddress: string
  userAgent: string
  success: boolean
  details?: any
  riskLevel?: RiskLevel
}

export enum SecurityAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETE = 'DATA_DELETE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_ACCESS = 'API_ACCESS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  CAD_ACCESS = 'CAD_ACCESS',
  LMS_ACCESS = 'LMS_ACCESS',
  RIGGING_LOFT_ACCESS = 'RIGGING_LOFT_ACCESS',
  USER_CREATED = 'USER_CREATED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Security Logger Class
export class SecurityLogger {
  static async log(data: SecurityLogData): Promise<void> {
    try {
      await prisma.securityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success,
          details: data.details ? JSON.stringify(data.details) : null,
          riskLevel: data.riskLevel || RiskLevel.LOW,
          createdAt: new Date()
        }
      })

      // Alert on high-risk activities
      if (data.riskLevel === RiskLevel.HIGH || data.riskLevel === RiskLevel.CRITICAL) {
        await this.sendSecurityAlert(data)
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  static async logLoginAttempt(
    email: string,
    success: boolean,
    req: NextRequest,
    userId?: string
  ): Promise<void> {
    const ipAddress = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'

    await this.log({
      userId,
      action: success ? SecurityAction.LOGIN_SUCCESS : SecurityAction.LOGIN_FAILED,
      resource: `email:${email}`,
      ipAddress,
      userAgent,
      success,
      details: { email, timestamp: new Date().toISOString() },
      riskLevel: success ? RiskLevel.LOW : RiskLevel.MEDIUM
    })

    // Track failed attempts for account locking
    if (!success) {
      await this.trackFailedAttempt(email, ipAddress)
    }
  }

  static async logDataAccess(
    userId: string,
    resource: string,
    req: NextRequest,
    details?: any
  ): Promise<void> {
    const ipAddress = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'

    await this.log({
      userId,
      action: SecurityAction.DATA_ACCESS,
      resource,
      ipAddress,
      userAgent,
      success: true,
      details,
      riskLevel: RiskLevel.LOW
    })
  }

  static async logSuspiciousActivity(
    userId: string | undefined,
    activity: string,
    req: NextRequest,
    details?: any
  ): Promise<void> {
    const ipAddress = this.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'

    await this.log({
      userId,
      action: SecurityAction.SUSPICIOUS_ACTIVITY,
      resource: activity,
      ipAddress,
      userAgent,
      success: false,
      details,
      riskLevel: RiskLevel.HIGH
    })
  }

  static async trackFailedAttempt(email: string, ipAddress: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        const attempts = user.loginAttempts + 1
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
        
        if (attempts >= maxAttempts) {
          const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '900000') // 15 minutes
          const lockedUntil = new Date(Date.now() + lockoutDuration)

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              lockedUntil
            }
          })

          await this.log({
            userId: user.id,
            action: SecurityAction.ACCOUNT_LOCKED,
            resource: `email:${email}`,
            ipAddress,
            userAgent: 'System',
            success: true,
            details: { attempts, lockedUntil },
            riskLevel: RiskLevel.HIGH
          })
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: attempts }
          })
        }
      }
    } catch (error) {
      console.error('Failed to track failed attempt:', error)
    }
  }

  static async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loginAttempts: 0,
          lockedUntil: null
        }
      })
    } catch (error) {
      console.error('Failed to reset failed attempts:', error)
    }
  }

  static getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }

  static async sendSecurityAlert(data: SecurityLogData): Promise<void> {
    // In production, implement email alerts or webhook notifications
    console.warn('SECURITY ALERT:', {
      action: data.action,
      riskLevel: data.riskLevel,
      ipAddress: data.ipAddress,
      timestamp: new Date().toISOString(),
      details: data.details
    })

    // TODO: Implement email notification system
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `Security Alert: ${data.action}`,
    //   body: `High-risk security event detected...`
    // })
  }

  static async getSecurityLogs(
    userId?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    try {
      return await prisma.securityLog.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Failed to get security logs:', error)
      return []
    }
  }

  static async getSecurityStats(): Promise<any> {
    try {
      const [
        totalLogs,
        failedLogins,
        suspiciousActivities,
        recentHighRisk
      ] = await Promise.all([
        prisma.securityLog.count(),
        prisma.securityLog.count({
          where: { action: SecurityAction.LOGIN_FAILED }
        }),
        prisma.securityLog.count({
          where: { action: SecurityAction.SUSPICIOUS_ACTIVITY }
        }),
        prisma.securityLog.count({
          where: {
            riskLevel: { in: [RiskLevel.HIGH, RiskLevel.CRITICAL] },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
          }
        })
      ])

      return {
        totalLogs,
        failedLogins,
        suspiciousActivities,
        recentHighRisk
      }
    } catch (error) {
      console.error('Failed to get security stats:', error)
      return {
        totalLogs: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        recentHighRisk: 0
      }
    }
  }
}

// Session Management
export class SessionManager {
  static async createSession(
    userId: string,
    req: NextRequest
  ): Promise<string> {
    const sessionToken = this.generateSessionToken()
    const ipAddress = SecurityLogger.getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const expiresAt = new Date(Date.now() + parseInt(process.env.SESSION_TIMEOUT || '3600000'))

    try {
      await prisma.userSession.create({
        data: {
          userId,
          sessionToken,
          ipAddress,
          userAgent,
          expiresAt,
          isActive: true
        }
      })

      // Update user last login
      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }
      })

      return sessionToken
    } catch (error) {
      console.error('Failed to create session:', error)
      throw new Error('Session creation failed')
    }
  }

  static async validateSession(sessionToken: string): Promise<any> {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionToken },
        include: { user: true }
      })

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null
      }

      // Update last activity
      await prisma.userSession.update({
        where: { sessionToken },
        data: { lastActivity: new Date() }
      })

      return session
    } catch (error) {
      console.error('Failed to validate session:', error)
      return null
    }
  }

  static async invalidateSession(sessionToken: string): Promise<void> {
    try {
      await prisma.userSession.update({
        where: { sessionToken },
        data: { isActive: false }
      })
    } catch (error) {
      console.error('Failed to invalidate session:', error)
    }
  }

  static generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex')
  }
}
