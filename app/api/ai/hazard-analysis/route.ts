import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// Initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Initialize DeepSeek (uses OpenAI-compatible API)
const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  : null

export async function POST(req: NextRequest) {
  try {
    // Check authentication (optional in development)
    const session = await getServerSession(authOptions)

    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { cadElements, projectInfo, model = 'openai' } = await req.json()

    // Select AI provider
    const selectedModel = model === 'deepseek' && deepseek ? deepseek : openai
    const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

    if (!selectedModel) {
      console.error(`${model === 'deepseek' ? 'DEEPSEEK' : 'OPENAI'}_API_KEY not configured`)
      return NextResponse.json(
        { error: `AI service not configured. Please add ${model === 'deepseek' ? 'DEEPSEEK' : 'OPENAI'}_API_KEY to .env` },
        { status: 500 }
      )
    }

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

    const completion = await selectedModel.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are an expert safety engineer who can analyze technical drawings and identify potential hazards in lifting operations. You have extensive knowledge of crane operations, rigging, construction site safety, and UK/EU regulations including BS 7121, LOLER 1998, and PUWER."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 2500,
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
      model: model === 'deepseek' && deepseek ? 'deepseek' : 'openai',
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
