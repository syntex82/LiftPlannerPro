import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { InferenceClient } from '@huggingface/inference'

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

// Hugging Face Inference Client
const huggingface = process.env.HUGGINGFACE_API_KEY
  ? new InferenceClient(process.env.HUGGINGFACE_API_KEY)
  : null

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: 'openai' | 'deepseek' | 'huggingface'
  huggingfaceModel?: string // e.g., 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', 'mistralai/Mixtral-8x7B-v0.1'
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

    const { messages, model = 'openai', huggingfaceModel, context }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT
    if (context?.cadElements) {
      systemPrompt += `\n\nCAD Drawing Context:\nThe user has a CAD drawing with ${context.cadElements.length} elements. Use this context for spatial awareness.`
    }
    if (context?.liftPlanData) {
      systemPrompt += `\n\nCurrent Lift Plan Data:\n${JSON.stringify(context.liftPlanData, null, 2)}`
    }

    let aiResponse: string | null = null
    let usedModel = model

    // Handle Hugging Face models
    if (model === 'huggingface' && huggingface) {
      const hfModel = huggingfaceModel || 'mistralai/Mixtral-8x7B-Instruct-v0.1'

      try {
        const chatMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
        ]

        const response = await huggingface.chatCompletion({
          model: hfModel,
          messages: chatMessages,
          max_tokens: 2000,
          temperature: 0.4
        })

        aiResponse = response.choices[0]?.message?.content || null
        usedModel = 'huggingface'
      } catch (hfError) {
        console.error('Hugging Face API error:', hfError)
        // Fall back to OpenAI if available
        if (openai) {
          console.log('Falling back to OpenAI...')
          usedModel = 'openai'
        } else {
          throw hfError
        }
      }
    }

    // Handle OpenAI/DeepSeek if not using Hugging Face or as fallback
    if (!aiResponse) {
      const selectedModel = model === 'deepseek' && deepseek ? deepseek : openai
      const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

      if (!selectedModel) {
        const providerName = model === 'huggingface' ? 'Hugging Face' :
                            model === 'deepseek' ? 'DeepSeek' : 'OpenAI'
        return NextResponse.json(
          { error: `${providerName} API not configured. Add ${model === 'huggingface' ? 'HUGGINGFACE_API_KEY' : model === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'} to your .env file.` },
          { status: 500 }
        )
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

      aiResponse = completion.choices[0]?.message?.content
      usedModel = model === 'deepseek' && deepseek ? 'deepseek' : 'openai'
    }

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
      model: usedModel,
      huggingfaceModel: model === 'huggingface' ? huggingfaceModel : undefined,
      readyToGenerate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'AI chat failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

