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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { formData, model = 'huggingface' } = await req.json()

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 })
    }

    // Build the prompt with user's form data
    const userDataSummary = `
PROJECT: ${formData.jobName || 'Not specified'} at ${formData.projectLocation || 'Not specified'}
CLIENT: ${formData.clientName || 'Not specified'}
CONTRACTOR: ${formData.contractorName || 'Not specified'}
LIFT DATE: ${formData.plannedLiftDate || 'TBC'}

LOAD: ${formData.loadDescription || 'Not specified'}
- Weight: ${formData.loadWeight || '?'} ${formData.loadWeightUnit || 'kg'}
- Dimensions: ${formData.loadLength || '?'}m x ${formData.loadWidth || '?'}m x ${formData.loadHeight || '?'}m
- Type: ${formData.loadType || 'general'}

CRANE: ${formData.equipmentManufacturer || ''} ${formData.equipmentModel || formData.equipmentType || 'Not specified'}
- Capacity: ${formData.equipmentCapacity || '?'} ${formData.equipmentCapacityUnit || 'tonnes'}

RIGGING: ${formData.riggingConfiguration || 'Not specified'}
- Slings: ${formData.slingCount || '?'} x ${formData.slingType || 'Not specified'}, ${formData.slingCapacity || '?'} capacity
- Sling Angle: ${formData.slingAngle || '?'}°

GEOMETRY:
- Pick Radius: ${formData.pickRadius || '?'}m, Set Radius: ${formData.setRadius || '?'}m
- Pick Height: ${formData.pickHeight || '?'}m, Set Height: ${formData.setHeight || '?'}m
- Swing Angle: ${formData.swingAngle || '?'}°

GROUND: ${formData.groundType || 'Not specified'}, Bearing: ${formData.groundBearing || '?'} ${formData.groundBearingUnit || 'kPa'}

WEATHER: Wind ${formData.windSpeed || '?'} ${formData.windSpeedUnit || 'km/h'}, ${formData.weatherConditions || 'Not specified'}

NOTES: ${formData.additionalNotes || 'None'}`

    // Explicit prompt demanding real content - NO placeholders
    const systemPrompt = `You are an expert lift planner. Generate COMPLETE HTML lift plan with REAL DATA.

CRITICAL: NEVER write "to be determined" or "TBD" - make professional assumptions based on the data provided.
Return ONLY valid HTML starting with <!DOCTYPE html>. Include professional CSS with colors #1e3a5f (blue) and #f97316 (orange).`

    const userPrompt = `Create HTML lift plan using this EXACT data:\n${userDataSummary}\n\nGENERATE REAL CONTENT FOR:
- 8+ SPECIFIC hazards with risk levels (H/M/L) and control measures in a styled table
- 12+ numbered method statement steps with actual instructions
- 10+ pre-lift checklist items with checkbox styling
- Specific crane config based on load weight (if 1000kg, assume 50t mobile crane at 12m radius)
- Rigging calculations (4-leg chain sling, 60° angle, SWL per leg)
- Exclusion zone radius calculation
- Emergency procedures with actual numbered steps
- Signature boxes with CSS borders

NO PLACEHOLDERS. Make professional engineering assumptions for anything not specified.`

    let htmlContent: string | null = null

    // Try Hugging Face
    if (model === 'huggingface' && huggingface) {
      try {
        const response = await huggingface.chatCompletion({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.3
        })
        htmlContent = response.choices[0]?.message?.content || null
      } catch (hfError) {
        console.error('Hugging Face error:', hfError)
        if (!openai && !deepseek) throw hfError
      }
    }

    // Fallback to OpenAI/DeepSeek
    if (!htmlContent) {
      const client = model === 'deepseek' && deepseek ? deepseek : openai
      const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4'

      if (!client) {
        return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
      }

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
      htmlContent = completion.choices[0]?.message?.content
    }

    if (!htmlContent) {
      return NextResponse.json({ error: 'Failed to generate lift plan' }, { status: 500 })
    }

    // Clean up HTML
    htmlContent = htmlContent.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim()
    if (!htmlContent.toLowerCase().startsWith('<!doctype')) {
      const idx = htmlContent.toLowerCase().indexOf('<!doctype')
      if (idx > 0) htmlContent = htmlContent.substring(idx)
    }

    return NextResponse.json({ success: true, html: htmlContent })
  } catch (error) {
    console.error('Lift plan generation error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to generate'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

