import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'

// Helper function to check if user is admin
function isAdmin(email: string): boolean {
  const adminEmails = ['mickyblenk@gmail.com']
  return adminEmails.includes(email)
}

// GET - Retrieve current firewall configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get current firewall configuration from database
    const firewallConfig = await prisma.systemConfig.findFirst({
      where: { key: 'firewall_config' }
    })

    if (!firewallConfig) {
      // Return default configuration if none exists
      return NextResponse.json({
        standardRulesApplied: false,
        customRulesApplied: false,
        lastUpdated: null,
        activeRules: [],
        totalRules: 0
      })
    }

    const config = JSON.parse(firewallConfig.value)
    return NextResponse.json(config)

  } catch (error) {
    console.error('Error fetching firewall config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firewall configuration' },
      { status: 500 }
    )
  }
}

// POST - Apply firewall rules
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ruleType, rules } = body

    if (action === 'initialize') {
      // Initialize default WAF rules
      const defaultRules = [
        {
          id: 'waf-001',
          name: 'SQL Injection Protection',
          type: 'WAF',
          enabled: true,
          description: 'Blocks SQL injection attempts'
        },
        {
          id: 'waf-002',
          name: 'XSS Protection',
          type: 'WAF',
          enabled: true,
          description: 'Prevents cross-site scripting attacks'
        },
        {
          id: 'net-001',
          name: 'Rate Limiting',
          type: 'Network',
          enabled: true,
          description: 'Limits request rate per IP'
        }
      ]

      const config = {
        standardRulesApplied: true,
        customRulesApplied: false,
        activeRules: defaultRules,
        lastUpdated: new Date().toISOString()
      }

      await prisma.systemConfig.upsert({
        where: { key: 'firewall_config' },
        update: { value: JSON.stringify(config) },
        create: { key: 'firewall_config', value: JSON.stringify(config) }
      })

      return NextResponse.json({ success: true, config })
    }

    if (action === 'toggle') {
      if (!ruleType) {
        return NextResponse.json(
          { error: 'Rule type is required for toggle action' },
          { status: 400 }
        )
      }
    } else if (!ruleType || !rules) {
      return NextResponse.json(
        { error: 'Rule type and rules are required' },
        { status: 400 }
      )
    }

    // Get current configuration
    let firewallConfig = await prisma.systemConfig.findFirst({
      where: { key: 'firewall_config' }
    })

    let currentConfig = {
      standardRulesApplied: false,
      customRulesApplied: false,
      lastUpdated: null,
      activeRules: []
    }

    if (firewallConfig) {
      currentConfig = JSON.parse(firewallConfig.value)
    }

    // Update configuration based on action and rule type
    if (action === 'toggle') {
      if (ruleType === 'standard') {
        currentConfig.standardRulesApplied = !currentConfig.standardRulesApplied
        if (!currentConfig.standardRulesApplied) {
          // Remove standard rules when disabled
          currentConfig.activeRules = currentConfig.activeRules.filter(
            (rule: any) => rule.type !== 'WAF' && rule.type !== 'Network'
          )
        } else {
          // Add default standard rules when enabled
          const standardRules = [
            {
              id: 'waf-001',
              name: 'SQL Injection Protection',
              type: 'WAF',
              enabled: true,
              description: 'Blocks SQL injection attempts'
            },
            {
              id: 'waf-002',
              name: 'XSS Protection',
              type: 'WAF',
              enabled: true,
              description: 'Prevents cross-site scripting attacks'
            },
            {
              id: 'net-001',
              name: 'Rate Limiting',
              type: 'Network',
              enabled: true,
              description: 'Limits request rate per IP'
            }
          ]
          currentConfig.activeRules = [...(currentConfig.activeRules as any[]), ...standardRules] as any
        }
      } else if (ruleType === 'custom') {
        currentConfig.customRulesApplied = !currentConfig.customRulesApplied
        if (!currentConfig.customRulesApplied) {
          // Remove custom rules when disabled
          currentConfig.activeRules = currentConfig.activeRules.filter(
            (rule: any) => rule.type !== 'Application'
          )
        }
      }
    } else {
      // Original rule application logic
      if (ruleType === 'standard') {
        currentConfig.standardRulesApplied = true
        // Remove existing standard rules and add new ones
        currentConfig.activeRules = currentConfig.activeRules.filter(
          (rule: any) => rule.type !== 'WAF' && rule.type !== 'Network'
        )
        currentConfig.activeRules = [...(currentConfig.activeRules as any[]), ...rules] as any
      } else if (ruleType === 'custom') {
        currentConfig.customRulesApplied = true
        // Remove existing custom rules and add new ones
        currentConfig.activeRules = currentConfig.activeRules.filter(
          (rule: any) => rule.type !== 'Application'
        )
        currentConfig.activeRules = [...(currentConfig.activeRules as any[]), ...rules] as any
      }
    }

    (currentConfig as any).lastUpdated = new Date().toISOString()

    // Save to database
    if (firewallConfig) {
      await prisma.systemConfig.update({
        where: { id: firewallConfig.id },
        data: { value: JSON.stringify(currentConfig) }
      })
    } else {
      await prisma.systemConfig.create({
        data: {
          key: 'firewall_config',
          value: JSON.stringify(currentConfig)
        }
      })
    }

    // Log the security action
    await SecurityLogger.log({
      userId: session.user.id || 'admin-user',
      action: 'system_change' as any,
      resource: `firewall_${ruleType}_rules`,
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: JSON.stringify({
        ruleType,
        rulesApplied: rules.length,
        totalActiveRules: currentConfig.activeRules.length,
        adminUser: session.user.email,
        timestamp: new Date().toISOString()
      }),
      riskLevel: 'LOW' as any
    })

    return NextResponse.json({
      success: true,
      message: `${ruleType} firewall rules applied successfully`,
      config: currentConfig
    })

  } catch (error) {
    console.error('Error applying firewall rules:', error)
    return NextResponse.json(
      { error: 'Failed to apply firewall rules' },
      { status: 500 }
    )
  }
}

// DELETE - Reset firewall configuration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Reset firewall configuration
    const resetConfig = {
      standardRulesApplied: false,
      customRulesApplied: false,
      lastUpdated: new Date().toISOString(),
      activeRules: []
    }

    const firewallConfig = await prisma.systemConfig.findFirst({
      where: { key: 'firewall_config' }
    })

    if (firewallConfig) {
      await prisma.systemConfig.update({
        where: { id: firewallConfig.id },
        data: { value: JSON.stringify(resetConfig) }
      })
    }

    // Log the security action
    await SecurityLogger.log({
      userId: session.user.id || 'admin-user',
      action: 'system_change' as any,
      resource: 'firewall_reset',
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: JSON.stringify({
        action: 'firewall_reset',
        adminUser: session.user.email,
        timestamp: new Date().toISOString()
      }),
      riskLevel: 'MEDIUM' as any
    })

    return NextResponse.json({
      success: true,
      message: 'Firewall configuration reset successfully',
      config: resetConfig
    })

  } catch (error) {
    console.error('Error resetting firewall config:', error)
    return NextResponse.json(
      { error: 'Failed to reset firewall configuration' },
      { status: 500 }
    )
  }
}

// PATCH - Toggle individual rule
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { ruleId, enabled } = body

    if (!ruleId || enabled === undefined) {
      return NextResponse.json(
        { error: 'Rule ID and enabled status are required' },
        { status: 400 }
      )
    }

    // Get current configuration
    const firewallConfig = await prisma.systemConfig.findFirst({
      where: { key: 'firewall_config' }
    })

    if (!firewallConfig) {
      return NextResponse.json(
        { error: 'Firewall configuration not found' },
        { status: 404 }
      )
    }

    const config = JSON.parse(firewallConfig.value)

    // Find and update the specific rule
    const ruleIndex = config.activeRules.findIndex((rule: any) => rule.id === ruleId)
    if (ruleIndex === -1) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }

    config.activeRules[ruleIndex].enabled = enabled
    config.lastUpdated = new Date().toISOString()

    // Update configuration in database
    await prisma.systemConfig.update({
      where: { id: firewallConfig.id },
      data: { value: JSON.stringify(config) }
    })

    return NextResponse.json({
      success: true,
      message: `Rule ${enabled ? 'enabled' : 'disabled'} successfully`,
      config
    })

  } catch (error) {
    console.error('Error toggling rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
