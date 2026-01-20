import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Check for OpenAI API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured. Please add OPENAI_API_KEY to .env' },
        { status: 500 }
      )
    }

    // Check authentication (optional in development)
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.warn('No authenticated session for AI analysis')
      // Allow in development, require in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const { cadElements, projectInfo } = await req.json()

    console.log('AI Analysis Request:', {
      elementsCount: cadElements?.length || 0,
      projectName: projectInfo?.name,
      timestamp: new Date().toISOString()
    })

    // Analyze CAD elements to identify potential hazards
    const analysisPrompt = `
Analyze this CAD drawing data for potential lifting operation hazards:

CAD Elements: ${JSON.stringify(cadElements)}
Project Info: ${JSON.stringify(projectInfo)}

Based on the drawing elements (lines, rectangles, circles, dimensions, text), identify:

1. SPATIAL HAZARDS:
   - Proximity to buildings/structures
   - Overhead obstacles
   - Underground utilities (if indicated)
   - Confined spaces
   - Public access areas

2. OPERATIONAL HAZARDS:
   - Load swing paths
   - Crane positioning constraints
   - Ground conditions (if shown)
   - Access routes
   - Exclusion zones needed

3. ENVIRONMENTAL HAZARDS:
   - Weather exposure
   - Visibility issues
   - Noise considerations
   - Dust/debris concerns

4. EQUIPMENT HAZARDS:
   - Crane stability
   - Load capacity vs. radius
   - Rigging complexity
   - Equipment interference

5. HUMAN FACTORS:
   - Communication challenges
   - Visibility between operators
   - Escape routes
   - Personnel positioning

For each identified hazard, provide:
- Risk level (Low/Medium/High)
- Potential consequences
- Recommended control measures
- Monitoring requirements

Format as a structured JSON response with hazard categories and specific recommendations.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert safety engineer who can analyze technical drawings and identify potential hazards in lifting operations. You have extensive knowledge of crane operations, rigging, and construction site safety."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Failed to generate hazard analysis' },
        { status: 500 }
      )
    }

    // Try to parse as JSON, fallback to text analysis
    let structuredAnalysis
    try {
      structuredAnalysis = JSON.parse(aiResponse)
    } catch {
      // If not valid JSON, create structured response from text
      structuredAnalysis = {
        analysis: aiResponse,
        hazards: extractHazardsFromText(aiResponse),
        recommendations: extractRecommendationsFromText(aiResponse),
        riskLevel: assessOverallRisk(aiResponse)
      }
    }

    return NextResponse.json({
      success: true,
      analysis: structuredAnalysis,
      cadElementsAnalyzed: cadElements.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI hazard analysis error:', error)

    // Provide detailed error information
    let errorMessage = 'Failed to perform hazard analysis'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or expired'
        statusCode = 401
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.'
        statusCode = 429
      } else if (error.message.includes('timeout')) {
        errorMessage = 'AI analysis request timed out. Please try again.'
        statusCode = 504
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: statusCode }
    )
  }
}

function extractHazardsFromText(text: string): string[] {
  const hazards: string[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.includes('hazard') || line.includes('risk') || line.includes('danger')) {
      const cleaned = line.replace(/^[-*•]\s*/, '').trim()
      if (cleaned.length > 10) {
        hazards.push(cleaned)
      }
    }
  }
  
  return hazards
}

function extractRecommendationsFromText(text: string): string[] {
  const recommendations: string[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.includes('recommend') || line.includes('should') || line.includes('ensure')) {
      const cleaned = line.replace(/^[-*•]\s*/, '').trim()
      if (cleaned.length > 10) {
        recommendations.push(cleaned)
      }
    }
  }
  
  return recommendations
}

function assessOverallRisk(text: string): 'Low' | 'Medium' | 'High' {
  const highRiskKeywords = ['high risk', 'critical', 'severe', 'major hazard', 'immediate danger']
  const mediumRiskKeywords = ['medium risk', 'moderate', 'significant', 'caution']
  
  const lowerText = text.toLowerCase()
  
  for (const keyword of highRiskKeywords) {
    if (lowerText.includes(keyword)) {
      return 'High'
    }
  }
  
  for (const keyword of mediumRiskKeywords) {
    if (lowerText.includes(keyword)) {
      return 'Medium'
    }
  }
  
  return 'Low'
}
