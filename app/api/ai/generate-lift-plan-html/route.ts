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

const HTML_LIFT_PLAN_PROMPT = `You are an expert lift planner. Generate a COMPLETE HTML lift plan with REAL DATA - NO "to be determined" or placeholders.

CRITICAL RULES:
1. Return ONLY valid HTML starting with <!DOCTYPE html>
2. NEVER write "to be determined" - make professional assumptions
3. Generate SPECIFIC crane models, rigging specs, hazards, method steps
4. Include professional CSS styling with colors #1e3a5f (blue) and #f97316 (orange)

For a 1000kg load, assume: 50t mobile crane at 12m radius, 4-leg chain sling 2t SWL each leg, 60° sling angle, concrete hardstanding.

MUST INCLUDE with REAL content:
- 8+ specific hazards with risk levels (H/M/L) and control measures in a table
- 12+ numbered method statement steps
- 10+ pre-lift checklist items with checkboxes
- Specific crane config, rigging calcs, exclusion zone radius
- Emergency procedures with actual steps
- Signature boxes with borders`

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
      // DeepSeek R1 has 8k context, others have more - be conservative
      const maxTokens = hfModel.includes('DeepSeek-R1') ? 2500 : 4000
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
        max_tokens: 4000,
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

