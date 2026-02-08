import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// Initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// DeepSeek API configuration (uses OpenAI-compatible API)
const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  : null

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: 'openai' | 'deepseek'
  context?: {
    cadElements?: unknown[]
    projectInfo?: Record<string, unknown>
    liftPlanData?: Record<string, unknown>
  }
}

const SYSTEM_PROMPT = `You are an expert lift planning and safety engineer assistant for LiftPlanner Pro. You have 20+ years of experience in:
- Crane operations and selection
- Rigging and sling configurations
- Risk assessment and method statements (RAMS)
- UK/EU safety standards (BS 7121, LOLER 1998, PUWER)
- Site safety and hazard identification

Your role is to guide users through the lift planning process conversationally:

1. Ask about the load specifications (weight, dimensions, center of gravity)
2. Help select appropriate crane/equipment based on load and site conditions
3. Guide rigging configuration (sling types, angles, capacity calculations)
4. Identify site hazards and environmental factors
5. Generate comprehensive safety documentation

Be professional but approachable. Provide specific, actionable advice. Always prioritize safety.
When you have enough information, offer to generate a professional lift plan report.

For calculations, show your working. Reference relevant safety standards where applicable.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, model = 'openai', context }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    // Select AI provider
    const selectedModel = model === 'deepseek' && deepseek ? deepseek : openai
    const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

    if (!selectedModel) {
      return NextResponse.json(
        { error: `${model === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API not configured` },
        { status: 500 }
      )
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT
    if (context?.cadElements) {
      systemPrompt += `\n\nCAD Drawing Context:\nThe user has a CAD drawing with ${context.cadElements.length} elements. Use this context for spatial awareness.`
    }
    if (context?.liftPlanData) {
      systemPrompt += `\n\nCurrent Lift Plan Data:\n${JSON.stringify(context.liftPlanData, null, 2)}`
    }

    const completion = await selectedModel.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 2000,
      temperature: 0.4,
      stream: false
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }

    // Check if AI is ready to generate a report
    const readyToGenerate = aiResponse.toLowerCase().includes('generate') && 
                           (aiResponse.toLowerCase().includes('report') || 
                            aiResponse.toLowerCase().includes('lift plan'))

    return NextResponse.json({
      success: true,
      message: aiResponse,
      model: model === 'deepseek' && deepseek ? 'deepseek' : 'openai',
      readyToGenerate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'AI chat failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

