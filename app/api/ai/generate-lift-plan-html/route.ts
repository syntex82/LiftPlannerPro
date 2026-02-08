import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { InferenceClient } from '@huggingface/inference'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  : null

const huggingface = process.env.HUGGINGFACE_API_KEY
  ? new InferenceClient(process.env.HUGGINGFACE_API_KEY)
  : null

const HTML_LIFT_PLAN_PROMPT = `Generate a professional HTML lift plan. Return ONLY HTML starting with <!DOCTYPE html>.

Include CSS styling (colors: #1e3a5f blue, #f97316 orange), tables, print styles.

Sections: Header, Project Details, Load Info, Equipment, Rigging Calculations, Lift Geometry, Ground Conditions, Hazards Table, Exclusion Zone, Personnel, Method Statement, Emergency Procedures, Checklist, Signatures.

Reference BS 7121/LOLER 1998. Make professional assumptions for missing details.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, model = 'openai', huggingfaceModel } = await req.json() as {
      prompt: string
      model: 'openai' | 'deepseek' | 'huggingface'
      huggingfaceModel?: string
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let htmlContent: string | null = null
    let usedModel = model

    // Try Hugging Face first if selected
    if (model === 'huggingface' && huggingface) {
      const hfModel = huggingfaceModel || 'mistralai/Mixtral-8x7B-Instruct-v0.1'
      // Adjust max_tokens based on model context size
      const maxTokens = hfModel.includes('DeepSeek') ? 3000 : 6000
      try {
        const response = await huggingface.chatCompletion({
          model: hfModel,
          messages: [
            { role: 'system', content: HTML_LIFT_PLAN_PROMPT },
            { role: 'user', content: `Create HTML lift plan: ${prompt}` }
          ],
          max_tokens: maxTokens,
          temperature: 0.3
        })
        htmlContent = response.choices[0]?.message?.content || null
        usedModel = 'huggingface'
      } catch (hfError) {
        console.error('Hugging Face error:', hfError)
        if (openai) usedModel = 'openai'
        else throw hfError
      }
    }

    // OpenAI/DeepSeek fallback
    if (!htmlContent) {
      const selectedModel = model === 'deepseek' && deepseek ? deepseek : openai
      const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

      if (!selectedModel) {
        const missingKey = model === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY'
        return NextResponse.json({
          error: `No AI provider configured. Please add ${missingKey} to your environment variables.`,
          availableProviders: {
            openai: !!openai,
            deepseek: !!deepseek,
            huggingface: !!huggingface
          }
        }, { status: 500 })
      }

      const completion = await selectedModel.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: HTML_LIFT_PLAN_PROMPT },
          { role: 'user', content: `Generate a complete HTML lift plan for: ${prompt}` }
        ],
        max_tokens: 8000,
        temperature: 0.3
      })

      htmlContent = completion.choices[0]?.message?.content
      usedModel = model === 'deepseek' && deepseek ? 'deepseek' : 'openai'
    }

    if (!htmlContent) {
      return NextResponse.json({ error: 'Failed to generate lift plan' }, { status: 500 })
    }

    // Clean up the HTML - remove markdown code blocks if present
    htmlContent = htmlContent
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()

    // Ensure it starts with DOCTYPE
    if (!htmlContent.toLowerCase().startsWith('<!doctype')) {
      const doctypeIndex = htmlContent.toLowerCase().indexOf('<!doctype')
      if (doctypeIndex > 0) {
        htmlContent = htmlContent.substring(doctypeIndex)
      }
    }

    return NextResponse.json({
      success: true,
      html: htmlContent,
      model: usedModel,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Lift plan generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate lift plan'
    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

