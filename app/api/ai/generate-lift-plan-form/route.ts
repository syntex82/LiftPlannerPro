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

    // Professional styling prompt with exact CSS
    const systemPrompt = `Generate PROFESSIONAL HTML lift plan. Return ONLY <!DOCTYPE html>. NEVER write "to be determined".

USE THIS CSS in <style>:
body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}
.container{max-width:900px;margin:0 auto;background:white;padding:30px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#1e3a5f,#2d5a87);color:white;padding:20px;margin:-30px -30px 20px;text-align:center}
h2{color:#1e3a5f;border-left:4px solid #f97316;padding-left:12px}
table{width:100%;border-collapse:collapse;margin:15px 0}
th{background:#1e3a5f;color:white;padding:12px;text-align:left}
td{border:1px solid #ddd;padding:10px}
tr:nth-child(even){background:#f9f9f9}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.info-box{background:#f0f4f8;padding:15px;border-radius:8px;border-left:3px solid #f97316}
.risk-high{background:#fee2e2;color:#991b1b}
.risk-medium{background:#fef3c7;color:#92400e}
.risk-low{background:#d1fae5;color:#065f46}
.checklist li:before{content:"☐";margin-right:10px;color:#f97316}
.sig-box{border:2px solid #1e3a5f;padding:15px;text-align:center}

Use tables for hazards (8+ rows with risk classes), personnel, equipment. Numbered method steps (12+). Checklist (10+). Signature boxes.`

    const userPrompt = `Create professional HTML lift plan:\n${userDataSummary}\n\nUse .container, .header, .info-grid, tables with th/td styling, .risk-high/medium/low classes, .checklist, .sig-box. Generate REAL specific content - no placeholders.`

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

