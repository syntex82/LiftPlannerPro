import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  : null

interface LiftPlanData {
  jobName?: string
  projectLocation?: string
  clientName?: string
  contractorName?: string
  plannedLiftDate?: string
  loadDescription?: string
  loadWeight?: string
  loadWeightUnit?: string
  loadDimensions?: { length?: string; width?: string; height?: string }
  centerOfGravity?: { x?: string; y?: string; z?: string }
  equipmentType?: string
  equipmentCapacity?: string
  equipmentModel?: string
  slingType?: string
  slingCount?: string
  slingCapacity?: string
  slingAngle?: string
  riggingConfiguration?: string
  pickRadius?: string
  setRadius?: string
  pickHeight?: string
  setHeight?: string
  groundType?: string
  groundBearing?: string
  accessRestrictions?: string
  windSpeed?: string
  weatherConditions?: string
  exclusionZoneRadius?: string
  hazardsIdentified?: string[]
  mitigationMeasures?: string[]
}

const REPORT_PROMPT = `You are an expert lift planning engineer. Based on the conversation and data provided, generate a comprehensive lift plan with the following sections:

1. PROJECT SUMMARY - Brief overview of the lift operation
2. LOAD SPECIFICATIONS - Complete load details with verified calculations
3. EQUIPMENT SELECTION - Crane/equipment details with capacity verification
4. RIGGING PLAN - Sling configuration, angles, and capacity calculations
5. LIFT GEOMETRY - Pick and set positions, radii, heights
6. SITE CONDITIONS - Ground bearing, access, obstacles
7. HAZARD IDENTIFICATION - All identified hazards with risk ratings (Low/Medium/High)
8. CONTROL MEASURES - Specific measures for each hazard
9. METHOD STATEMENT - Step-by-step lift procedure
10. EMERGENCY PROCEDURES - Response procedures for incidents
11. PERSONNEL REQUIREMENTS - Roles and responsibilities
12. PRE-LIFT CHECKLIST - Verification items before lift

Reference BS 7121 and LOLER 1998 where applicable. Be specific and detailed.
Format your response as JSON with these section keys.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { liftPlanData, conversationHistory, model = 'openai' } = await req.json() as {
      liftPlanData: LiftPlanData
      conversationHistory: { role: string; content: string }[]
      model: 'openai' | 'deepseek'
    }

    const selectedModel = model === 'deepseek' && deepseek ? deepseek : openai
    const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

    if (!selectedModel) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Build context from conversation
    const conversationContext = conversationHistory
      ?.map(m => `${m.role}: ${m.content}`)
      .join('\n\n') || ''

    const completion = await selectedModel.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: REPORT_PROMPT },
        { role: 'user', content: `
Lift Plan Data:
${JSON.stringify(liftPlanData, null, 2)}

Conversation History:
${conversationContext}

Generate a complete professional lift plan report.` }
      ],
      max_tokens: 4000,
      temperature: 0.2
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }

    // Try to parse as JSON, fallback to sections
    let sections: Record<string, string>
    try {
      sections = JSON.parse(aiResponse)
    } catch {
      sections = parseTextToSections(aiResponse)
    }

    return NextResponse.json({
      success: true,
      sections,
      liftPlanData,
      generatedAt: new Date().toISOString(),
      model: model === 'deepseek' && deepseek ? 'deepseek' : 'openai'
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function parseTextToSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const sectionNames = [
    'PROJECT SUMMARY', 'LOAD SPECIFICATIONS', 'EQUIPMENT SELECTION',
    'RIGGING PLAN', 'LIFT GEOMETRY', 'SITE CONDITIONS',
    'HAZARD IDENTIFICATION', 'CONTROL MEASURES', 'METHOD STATEMENT',
    'EMERGENCY PROCEDURES', 'PERSONNEL REQUIREMENTS', 'PRE-LIFT CHECKLIST'
  ]

  let currentSection = 'summary'
  let currentContent = ''

  for (const line of text.split('\n')) {
    const foundSection = sectionNames.find(s => line.toUpperCase().includes(s))
    if (foundSection) {
      if (currentContent.trim()) sections[currentSection] = currentContent.trim()
      currentSection = foundSection.toLowerCase().replace(/\s+/g, '_')
      currentContent = ''
    } else {
      currentContent += line + '\n'
    }
  }
  if (currentContent.trim()) sections[currentSection] = currentContent.trim()

  return sections
}

