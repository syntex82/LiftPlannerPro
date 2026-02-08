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

const HTML_LIFT_PLAN_PROMPT = `You are an expert crane lift planning engineer. Generate a COMPLETE, DETAILED HTML lift plan document.

CRITICAL: Return ONLY valid HTML starting with <!DOCTYPE html>. No markdown, no code blocks.

Based on the user's description, generate a FULLY POPULATED lift plan with REALISTIC, SPECIFIC data:
- Calculate actual SWL, rigging requirements, sling angles
- Specify real crane models with actual capacities at given radii
- Include specific rigging gear (sling sizes, shackle ratings, spreader beams)
- Calculate ground bearing pressures for outriggers
- List specific hazards relevant to the described lift
- Write detailed step-by-step method statement
- Include proper exclusion zone calculations

HTML STRUCTURE:
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; margin: 20px; }
    h1 { color: #1e3a5f; border-bottom: 3px solid #f97316; }
    h2 { color: #1e3a5f; background: #f0f4f8; padding: 8px; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #1e3a5f; color: white; padding: 10px; text-align: left; }
    td { border: 1px solid #ddd; padding: 8px; }
    .warning { background: #fff3cd; border-left: 4px solid #f97316; padding: 10px; }
    .signature-box { border: 1px solid #333; height: 60px; margin: 5px 0; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  [FULL CONTENT WITH ALL SECTIONS POPULATED]
</body>
</html>

REQUIRED SECTIONS (all must have REAL DATA, not placeholders):
1. HEADER - Title, Document Ref, Date, Revision
2. PROJECT DETAILS - Client, Site, Lift Supervisor, AP name
3. LOAD DETAILS - Description, Weight (kg), Dimensions (LxWxH), CoG location
4. CRANE SELECTION - Make/Model, Configuration, Capacity at radius, % utilization
5. RIGGING GEAR - Slings (type, SWL, length), Shackles (size, SWL), Spreader beams
6. LIFT GEOMETRY - Pick radius, Set radius, Boom length, Hook height, Slew angle
7. GROUND CONDITIONS - Surface type, Bearing capacity, Outrigger loads, Mat sizes
8. HAZARDS & CONTROLS - Table with 8+ specific hazards, risk ratings, control measures
9. EXCLUSION ZONE - Radius calculation, Barrier requirements, Signage
10. PERSONNEL - Roles table: AP, Lift Supervisor, Crane Operator, Slinger, Banksman
11. COMMUNICATIONS - Radio channel, Hand signals, Emergency signals
12. METHOD STATEMENT - 15+ numbered steps from setup to completion
13. EMERGENCY PROCEDURES - Abort procedure, Emergency contacts, Muster point
14. PRE-LIFT CHECKLIST - 12+ checkbox items
15. SIGNATURES - Boxes for AP, Lift Supervisor, Crane Operator, Client Rep

Reference BS 7121 and LOLER 1998. Make professional engineering assumptions for any missing details.`

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

