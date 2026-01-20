import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const { projectData, liftType, environment, equipment } = await req.json()

    const prompt = `
You are an expert safety engineer specializing in lifting operations. Generate a comprehensive Risk Assessment and Method Statement (RAMS) based on the following project details:

Project Type: ${liftType}
Environment: ${environment}
Equipment: ${equipment}
Additional Details: ${JSON.stringify(projectData)}

Please provide:

1. HAZARD IDENTIFICATION: List all potential hazards specific to this lifting operation
2. RISK ASSESSMENT: Evaluate the likelihood and severity of each hazard
3. CONTROL MEASURES: Detailed control measures for each identified hazard
4. METHOD STATEMENT: Step-by-step procedure for safe execution
5. EMERGENCY PROCEDURES: Specific emergency response procedures
6. PERSONNEL REQUIREMENTS: Required qualifications and roles
7. EQUIPMENT INSPECTION: Specific inspection requirements
8. ENVIRONMENTAL CONSIDERATIONS: Weather and site-specific factors

Format the response as a structured document with clear sections. Be specific to the lifting operation described and include relevant safety standards (BS 7121, LOLER 1998).

Focus on practical, actionable safety measures that can be implemented on-site.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert safety engineer with 20+ years of experience in lifting operations, crane safety, and risk assessment. You provide detailed, practical safety guidance that complies with UK and international lifting standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.3, // Lower temperature for more consistent, safety-focused responses
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Failed to generate AI response' },
        { status: 500 }
      )
    }

    // Parse the AI response into structured sections
    const sections = parseAIResponse(aiResponse)

    return NextResponse.json({
      success: true,
      aiGenerated: true,
      sections,
      rawResponse: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI RAMS generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI-powered RAMS' },
      { status: 500 }
    )
  }
}

function parseAIResponse(response: string) {
  const sections = {
    hazardIdentification: '',
    riskAssessment: '',
    controlMeasures: '',
    methodStatement: '',
    emergencyProcedures: '',
    personnelRequirements: '',
    equipmentInspection: '',
    environmentalConsiderations: ''
  }

  // Simple parsing logic - in production, you might want more sophisticated parsing
  const lines = response.split('\n')
  let currentSection = ''
  let currentContent = ''

  for (const line of lines) {
    const upperLine = line.toUpperCase()
    
    if (upperLine.includes('HAZARD IDENTIFICATION')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'hazardIdentification'
      currentContent = ''
    } else if (upperLine.includes('RISK ASSESSMENT')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'riskAssessment'
      currentContent = ''
    } else if (upperLine.includes('CONTROL MEASURES')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'controlMeasures'
      currentContent = ''
    } else if (upperLine.includes('METHOD STATEMENT')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'methodStatement'
      currentContent = ''
    } else if (upperLine.includes('EMERGENCY PROCEDURES')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'emergencyProcedures'
      currentContent = ''
    } else if (upperLine.includes('PERSONNEL REQUIREMENTS')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'personnelRequirements'
      currentContent = ''
    } else if (upperLine.includes('EQUIPMENT INSPECTION')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'equipmentInspection'
      currentContent = ''
    } else if (upperLine.includes('ENVIRONMENTAL CONSIDERATIONS')) {
      if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.trim()
      currentSection = 'environmentalConsiderations'
      currentContent = ''
    } else if (currentSection) {
      currentContent += line + '\n'
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections[currentSection as keyof typeof sections] = currentContent.trim()
  }

  return sections
}
