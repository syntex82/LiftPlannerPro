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
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  IP_BLOCKED = 'IP_BLOCKED',
  BLOCKED_REQUEST = 'BLOCKED_REQUEST',
  UNAUTHORIZED_PENTEST = 'UNAUTHORIZED_PENTEST'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Actions that REQUIRE a valid userId - cannot be logged without one
const ACTIONS_REQUIRING_USER_ID = [
  SecurityAction.LOGIN_SUCCESS,
  SecurityAction.LOGOUT,
  SecurityAction.PASSWORD_CHANGE,
  SecurityAction.EMAIL_CHANGE,
  SecurityAction.ACCOUNT_LOCKED,
  SecurityAction.ACCOUNT_UNLOCKED,
  SecurityAction.DATA_ACCESS,
  SecurityAction.DATA_MODIFICATION,
  SecurityAction.DATA_DELETE,
  SecurityAction.FILE_UPLOAD,
  SecurityAction.FILE_DOWNLOAD,
  SecurityAction.CAD_ACCESS,
  SecurityAction.LMS_ACCESS,
  SecurityAction.RIGGING_LOFT_ACCESS,
  SecurityAction.USER_CREATED,
  SecurityAction.USER_REACTIVATED
]

// Security Logger Class
export class SecurityLogger {
  static async log(data: SecurityLogData): Promise<void> {
    try {
      // SECURITY: Reject LOGIN_SUCCESS and other sensitive actions without valid userId
      if (ACTIONS_REQUIRING_USER_ID.includes(data.action)) {
        if (!data.userId || data.userId === 'anonymous' || data.userId.trim() === '') {
          console.error(`🚨 SECURITY VIOLATION: Attempted to log ${data.action} without valid userId from IP ${data.ipAddress}`)

          // Log this as suspicious activity instead
          await prisma.securityLog.create({
            data: {
              userId: null,
              action: SecurityAction.SUSPICIOUS_ACTIVITY,
              resource: `invalid_${data.action.toLowerCase()}_attempt`,
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
              success: false,
              details: JSON.stringify({
                originalAction: data.action,
                originalDetails: data.details,
                reason: 'Attempted to log authenticated action without valid userId',
                timestamp: new Date().toISOString()
              }),
              riskLevel: RiskLevel.CRITICAL,
              createdAt: new Date()
            }
          })

          // Auto-block the IP if trying to fake login success
          if (data.action === SecurityAction.LOGIN_SUCCESS) {
            await this.blockIP(data.ipAddress, 'Attempted to log fake LOGIN_SUCCESS without userId', 24 * 60 * 60 * 1000) // 24 hour block
          }

          return // Don't log the original action
        }
      }

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

  // ==================== IP BLOCKING SYSTEM ====================

  static async blockIP(
    ipAddress: string,
    reason: string,
    durationMs?: number, // null = permanent
    blockedBy?: string
  ): Promise<boolean> {
    try {
      const expiresAt = durationMs ? new Date(Date.now() + durationMs) : null

      await prisma.blockedIP.upsert({
        where: { ipAddress },
        update: {
          reason,
          blockedAt: new Date(),
          blockedBy,
          expiresAt,
          isActive: true,
          hitCount: { increment: 1 }
        },
        create: {
          ipAddress,
          reason,
          blockedBy,
          expiresAt,
          isActive: true,
          hitCount: 0
        }
      })

      console.log(`🚫 IP BLOCKED: ${ipAddress} - Reason: ${reason}`)

      // Log the block action
      await prisma.securityLog.create({
        data: {
          userId: blockedBy,
          action: SecurityAction.IP_BLOCKED,
          resource: `ip:${ipAddress}`,
          ipAddress,
          userAgent: 'System',
          success: true,
          details: JSON.stringify({ reason, expiresAt, blockedBy }),
          riskLevel: RiskLevel.HIGH,
          createdAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error('Failed to block IP:', error)
      return false
    }
  }

  static async unblockIP(ipAddress: string, unblockedBy?: string): Promise<boolean> {
    try {
      await prisma.blockedIP.update({
        where: { ipAddress },
        data: { isActive: false }
      })

      console.log(`✅ IP UNBLOCKED: ${ipAddress}`)
      return true
    } catch (error) {
      console.error('Failed to unblock IP:', error)
      return false
    }
  }

  static async isIPBlocked(ipAddress: string): Promise<{ blocked: boolean; reason?: string }> {
    try {
      const blockedIP = await prisma.blockedIP.findUnique({
        where: { ipAddress }
      })

      if (!blockedIP || !blockedIP.isActive) {
        return { blocked: false }
      }

      // Check if block has expired
      if (blockedIP.expiresAt && blockedIP.expiresAt < new Date()) {
        // Auto-unblock expired entries
        await prisma.blockedIP.update({
          where: { ipAddress },
          data: { isActive: false }
        })
        return { blocked: false }
      }

      // Update hit count
      await prisma.blockedIP.update({
        where: { ipAddress },
        data: {
          hitCount: { increment: 1 },
          lastHitAt: new Date()
        }
      })

      return { blocked: true, reason: blockedIP.reason }
    } catch (error) {
      console.error('Failed to check IP block status:', error)
      return { blocked: false }
    }
  }

  static async getBlockedIPs(): Promise<any[]> {
    try {
      return await prisma.blockedIP.findMany({
        where: { isActive: true },
        orderBy: { blockedAt: 'desc' }
      })
    } catch (error) {
      console.error('Failed to get blocked IPs:', error)
      return []
    }
  }

  // ==================== SECURITY INCIDENT REPORTING ====================

  static async createSecurityIncident(data: {
    incidentType: string
    ipAddresses: string[]
    startTime: Date
    endTime?: Date
    description: string
    evidence: any
    severity?: string
    createdBy?: string
  }): Promise<string | null> {
    try {
      const incident = await prisma.securityIncident.create({
        data: {
          incidentType: data.incidentType,
          ipAddresses: JSON.stringify(data.ipAddresses),
          startTime: data.startTime,
          endTime: data.endTime,
          description: data.description,
          evidence: JSON.stringify(data.evidence),
          severity: data.severity || 'HIGH',
          status: 'OPEN',
          createdBy: data.createdBy
        }
      })

      console.log(`📋 Security Incident Created: ${incident.id}`)
      return incident.id
    } catch (error) {
      console.error('Failed to create security incident:', error)
      return null
    }
  }

  static async generateIncidentReport(incidentId: string): Promise<string | null> {
    try {
      const incident = await prisma.securityIncident.findUnique({
        where: { id: incidentId }
      })

      if (!incident) return null

      const ipAddresses = JSON.parse(incident.ipAddresses)
      const evidence = JSON.parse(incident.evidence)

      // Generate formal report for authorities
      const report = `
================================================================================
                    UNAUTHORIZED CYBER SECURITY TESTING REPORT
================================================================================

INCIDENT REFERENCE: ${incident.id}
DATE GENERATED: ${new Date().toISOString()}
STATUS: ${incident.status}
SEVERITY: ${incident.severity}

--------------------------------------------------------------------------------
                              INCIDENT DETAILS
--------------------------------------------------------------------------------

INCIDENT TYPE: ${incident.incidentType}
START TIME: ${incident.startTime.toISOString()}
END TIME: ${incident.endTime?.toISOString() || 'Ongoing'}

DESCRIPTION:
${incident.description}

--------------------------------------------------------------------------------
                           OFFENDING IP ADDRESSES
--------------------------------------------------------------------------------

${ipAddresses.map((ip: string, i: number) => `${i + 1}. ${ip}`).join('\n')}

--------------------------------------------------------------------------------
                              LEGAL NOTICE
--------------------------------------------------------------------------------

This report documents unauthorized access attempts and/or security testing
conducted WITHOUT the explicit written permission of the system owner.

Under the Computer Misuse Act 1990 (UK), unauthorized access to computer
systems is a criminal offense punishable by:
- Up to 2 years imprisonment for unauthorized access
- Up to 10 years imprisonment for unauthorized access with intent to commit
  further offenses
- Up to 14 years imprisonment for unauthorized acts causing serious damage

The system owner reserves the right to:
1. Report this incident to law enforcement authorities
2. Report to the Internet Service Provider (ISP) of the offending IP addresses
3. Report to the UK Information Commissioner's Office (ICO)
4. Pursue civil damages for any harm caused

--------------------------------------------------------------------------------
                              EVIDENCE SUMMARY
--------------------------------------------------------------------------------

${JSON.stringify(evidence, null, 2)}

--------------------------------------------------------------------------------
                           REPORTING STATUS
--------------------------------------------------------------------------------

Reported to ISP: ${incident.reportedToISP ? 'YES' : 'NO'}
Reported to Police: ${incident.reportedToPolice ? 'YES' : 'NO'}
Reported to ICO: ${incident.reportedToICO ? 'YES' : 'NO'}
Legal Reference: ${incident.legalReference || 'N/A'}

================================================================================
                              END OF REPORT
================================================================================
`

      return report
    } catch (error) {
      console.error('Failed to generate incident report:', error)
      return null
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
