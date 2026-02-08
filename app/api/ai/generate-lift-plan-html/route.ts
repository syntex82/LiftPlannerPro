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

const HTML_LIFT_PLAN_PROMPT = `You are an expert lift planning engineer. Generate a COMPLETE, PROFESSIONAL HTML lift plan document.

IMPORTANT: Return ONLY the HTML content, no markdown, no code blocks, just pure HTML starting with <!DOCTYPE html>.

The HTML should be:
- Professional, print-ready design
- Clean modern styling with CSS included in <style> tags
- Company branding colors (dark blue #1e3a5f, safety orange #f97316)
- Clear section headers with icons/emojis
- Tables for data presentation
- Signature boxes at the bottom
- Print-friendly (@media print styles)

Include these sections:
1. HEADER - Company logo area, document title, reference number, date
2. PROJECT DETAILS - Client, location, lift supervisor, date/time
3. LOAD INFORMATION - Description, weight, dimensions, CoG
4. EQUIPMENT - Crane type, capacity, model, configuration
5. RIGGING - Slings, shackles, spreader beams, calculations
6. LIFT GEOMETRY - Pick/set positions, radii, heights, boom config
7. GROUND CONDITIONS - Surface type, bearing capacity, outrigger setup
8. HAZARDS & CONTROLS - Table with hazard, risk level, control measure
9. EXCLUSION ZONE - Radius, barriers, signage
10. PERSONNEL - Table with role, name field, responsibilities
11. COMMUNICATIONS - Radio channels, signals
12. METHOD STATEMENT - Numbered step-by-step procedure
13. EMERGENCY PROCEDURES - Abort signal, emergency contacts
14. PRE-LIFT CHECKLIST - Checkbox items
15. APPROVAL SIGNATURES - Lift Supervisor, Crane Operator, Client Rep

Reference BS 7121 and LOLER 1998. Make reasonable professional assumptions for any missing details.`

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
      // Use Mixtral by default as it has 32k context window (DeepSeek R1 only has 8k)
      const hfModel = huggingfaceModel || 'mistralai/Mixtral-8x7B-Instruct-v0.1'
      try {
        const response = await huggingface.chatCompletion({
          model: hfModel,
          messages: [
            { role: 'system', content: HTML_LIFT_PLAN_PROMPT },
            { role: 'user', content: `Generate a complete HTML lift plan for: ${prompt}` }
          ],
          max_tokens: 4000,
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

