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

const HTML_LIFT_PLAN_PROMPT = `Generate a PROFESSIONAL HTML lift plan. Return ONLY valid HTML starting with <!DOCTYPE html>.

NEVER write "to be determined" or "TBD" - make professional assumptions.

USE THIS EXACT CSS in <style>:
body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}
.container{max-width:900px;margin:0 auto;background:white;padding:30px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#1e3a5f,#2d5a87);color:white;padding:20px;margin:-30px -30px 20px;text-align:center}
.header h1{margin:0;font-size:24px}
.header p{margin:5px 0 0;opacity:0.9}
h2{color:#1e3a5f;border-left:4px solid #f97316;padding-left:12px;margin-top:25px}
table{width:100%;border-collapse:collapse;margin:15px 0;font-size:14px}
th{background:#1e3a5f;color:white;padding:12px;text-align:left;font-weight:600}
td{border:1px solid #ddd;padding:10px}
tr:nth-child(even){background:#f9f9f9}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0}
.info-box{background:#f0f4f8;padding:15px;border-radius:8px;border-left:3px solid #f97316}
.info-box label{font-weight:bold;color:#1e3a5f;display:block;margin-bottom:5px}
.risk-high{background:#fee2e2;color:#991b1b}
.risk-medium{background:#fef3c7;color:#92400e}
.risk-low{background:#d1fae5;color:#065f46}
.checklist{list-style:none;padding:0}
.checklist li{padding:8px 0;border-bottom:1px solid #eee}
.checklist li:before{content:"☐";margin-right:10px;color:#f97316}
.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
.sig-box{border:2px solid #1e3a5f;padding:15px;text-align:center}
.sig-box p{margin:0 0 30px;font-weight:bold}
.sig-line{border-top:1px solid #333;margin-top:40px;padding-top:5px}
.warning{background:#fff3cd;border-left:4px solid #f97316;padding:15px;margin:15px 0}
@media print{body{background:white}.container{box-shadow:none}}

STRUCTURE: Use .container div, .header for title, .info-grid with .info-box for data pairs, TABLES for hazards/personnel, .checklist for checkboxes, .signature-grid with .sig-box for signatures.

REQUIRED TABLES:
1. Hazards table: columns Hazard|Risk Level|Control Measures - 8+ rows, use .risk-high/.risk-medium/.risk-low classes
2. Personnel table: columns Role|Name|Responsibilities
3. Equipment table: columns Item|Specification|SWL/Capacity

Generate 12+ method statement steps as numbered list, 10+ checklist items.`

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

