import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      email,
      name,
      company,
      source,
      interests = [],
      leadMagnet,
      phone,
      notes
    } = data

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({ 
        error: 'Email and name are required' 
      }, { status: 400 })
    }

    // Get IP address for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email }
    })

    let lead
    if (existingLead) {
      // Update existing lead with new information
      lead = await prisma.lead.update({
        where: { email },
        data: {
          name: name || existingLead.name,
          company: company || existingLead.company,
          phone: phone || existingLead.phone,
          interests: [...new Set([...existingLead.interests, ...interests])],
          lastContactDate: new Date(),
          leadScore: Math.min(existingLead.leadScore + 10, 100), // Increase score for repeat engagement
          notes: notes ? `${existingLead.notes || ''}\n${new Date().toISOString()}: ${notes}` : existingLead.notes
        }
      })
    } else {
      // Create new lead
      lead = await prisma.lead.create({
        data: {
          email,
          name,
          company,
          phone,
          source,
          interests,
          leadMagnet,
          ipAddress,
          status: 'NEW',
          leadScore: calculateLeadScore({ source, company, interests }),
          notes
        }
      })
    }

    // Log the lead capture activity
    await prisma.securityLog.create({
      data: {
        action: 'LEAD_CAPTURED',
        resource: source || 'unknown',
        details: JSON.stringify({
          leadId: lead.id,
          source,
          leadMagnet,
          interests
        }),
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        riskLevel: 'LOW'
      }
    })

    // Send welcome email (you can implement this later)
    await sendWelcomeEmail(lead, leadMagnet)

    // Track in analytics
    await trackLeadCapture(lead, source)

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Lead captured successfully'
    })

  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ 
      error: 'Failed to capture lead' 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve leads (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            interactions: true
          }
        }
      }
    })

    const total = await prisma.lead.count({ where })

    // Calculate conversion metrics
    const conversionStats = await calculateConversionStats()

    return NextResponse.json({
      leads,
      total,
      stats: conversionStats
    })

  } catch (error) {
    console.error('Lead retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve leads' 
    }, { status: 500 })
  }
}

// Helper function to calculate lead score
function calculateLeadScore({ source, company, interests }: { 
  source?: string, 
  company?: string, 
  interests: string[] 
}): number {
  let score = 20 // Base score

  // Source scoring
  const sourceScores: Record<string, number> = {
    'free_load_calculator': 30,
    'free_tension_calculator': 25,
    'exit_intent': 15,
    'homepage': 10,
    'organic_search': 20,
    'referral': 25
  }
  score += sourceScores[source || ''] || 10

  // Company scoring
  if (company) {
    score += 15
    // Bonus for known industry companies
    const industryKeywords = ['crane', 'lifting', 'rigging', 'heavy', 'transport', 'engineering']
    if (industryKeywords.some(keyword => company.toLowerCase().includes(keyword))) {
      score += 20
    }
  }

  // Interest scoring
  score += interests.length * 5

  return Math.min(score, 100)
}

// Helper function to send welcome email
async function sendWelcomeEmail(lead: any, leadMagnet?: string) {
  // Implement email sending logic here
  // For now, just log it
  console.log(`Welcome email sent to ${lead.email} for ${leadMagnet}`)
}

// Helper function to track lead capture
async function trackLeadCapture(lead: any, source?: string) {
  // Implement analytics tracking here
  console.log(`Lead captured: ${lead.email} from ${source}`)
}

// Helper function to calculate conversion statistics
async function calculateConversionStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalLeads,
    recentLeads,
    convertedLeads,
    leadsBySource
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.lead.count({
      where: {
        status: 'CONVERTED'
      }
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })
  ])

  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

  return {
    totalLeads,
    recentLeads,
    convertedLeads,
    conversionRate,
    leadsBySource
  }
}
