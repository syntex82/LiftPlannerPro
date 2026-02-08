import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
const deepseek = process.env.DEEPSEEK_API_KEY ? new OpenAI({ 
  apiKey: process.env.DEEPSEEK_API_KEY, 
  baseURL: 'https://api.deepseek.com/v1' 
}) : null

interface LiftPackRequest {
  projectName: string
  projectNumber?: string
  client?: string
  location?: string
  liftDescription: string
  loadWeight: string
  loadDimensions?: string
  craneType?: string
  riggingEquipment?: string
  liftRadius?: string
  liftHeight?: string
  groundConditions?: string
  weatherRestrictions?: string
  hazards?: string[]
  personnel?: string[]
  drawingDataUrl?: string // Base64 CAD drawing
  includeDrawing?: boolean
  includeRams?: boolean
  includeStepPlan?: boolean
  includeLiftPlan?: boolean
  model?: 'openai' | 'deepseek'
}

const LIFT_PACK_SYSTEM_PROMPT = `You are an expert lift planning engineer. Generate a professional HTML lift pack document.

Include sections: Cover Page, Lift Plan, Risk Assessment, Method Statement, Step Plan, Equipment Checklist, Personnel, Emergency Procedures, Signatures.

Use this CSS:
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;color:#1a1a2e;line-height:1.6}.document{max-width:210mm;margin:20px auto;background:white;box-shadow:0 4px 20px rgba(0,0,0,0.15)}.cover-page{min-height:297mm;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:white;text-align:center;padding:40px;page-break-after:always}.cover-title{font-size:42px;font-weight:700;margin-bottom:20px;text-transform:uppercase;letter-spacing:3px}.cover-subtitle{font-size:24px;margin-bottom:40px;opacity:0.9}.cover-info{background:rgba(255,255,255,0.1);padding:30px 50px;border-radius:10px;margin-top:40px}.page{padding:25mm 20mm;page-break-after:always}.section-header{background:linear-gradient(90deg,#1a1a2e,#16213e);color:white;padding:15px 25px;margin:25px -20mm 20px;font-size:20px;font-weight:600}.subsection{background:#e8f4f8;padding:10px 15px;margin:15px 0 10px;font-weight:600;color:#0f3460;border-left:4px solid #e94560}table{width:100%;border-collapse:collapse;margin:15px 0}th{background:#1a1a2e;color:white;padding:12px;text-align:left}td{padding:10px 12px;border:1px solid #ddd}tr:nth-child(even){background:#f8f9fa}.risk-high{background:#ffebee!important;color:#c62828;font-weight:600}.risk-medium{background:#fff8e1!important;color:#f57f17;font-weight:600}.risk-low{background:#e8f5e9!important;color:#2e7d32;font-weight:600}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0}.info-box{background:#f8f9fa;padding:15px;border-left:4px solid #e94560}.info-label{font-size:12px;color:#666;text-transform:uppercase;margin-bottom:5px}.info-value{font-size:16px;font-weight:600;color:#1a1a2e}.checklist{list-style:none}.checklist li{padding:8px 0;border-bottom:1px solid #eee}.checklist li::before{content:'☐';margin-right:12px;font-size:18px;color:#e94560}.sig-box{border:2px solid #1a1a2e;padding:20px;margin:10px 0;background:#fafafa}.sig-box .role{font-weight:600;margin-bottom:30px}.sig-box .sig-line{border-bottom:1px solid #333;height:30px;margin-bottom:10px}.warning-box{background:#fff3cd;border:2px solid #ffc107;padding:15px;margin:15px 0;border-radius:5px}.danger-box{background:#f8d7da;border:2px solid #dc3545;padding:15px;margin:15px 0;border-radius:5px}.step-number{display:inline-block;width:30px;height:30px;background:#e94560;color:white;border-radius:50%;text-align:center;line-height:30px;margin-right:10px;font-weight:600}.drawing-placeholder{border:2px dashed #ccc;padding:40px;text-align:center;background:#f9f9f9;margin:20px 0;min-height:200px}@media print{.document{box-shadow:none;margin:0}}
</style>

Generate specific content with real calculations. Signature boxes: role title + empty line + Date:___ (NO fake names).`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: LiftPackRequest = await req.json()
    
    if (!data.projectName || !data.liftDescription) {
      return NextResponse.json({ error: 'Project name and lift description are required' }, { status: 400 })
    }

    const model = data.model || 'openai'
    const client = model === 'deepseek' && deepseek ? deepseek : openai
    // Use gpt-4o for larger context window (128K tokens)
    const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4o'

    if (!client) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
    }

    // Build the user prompt with all details
    const userPrompt = buildUserPrompt(data)

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: LIFT_PACK_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.3
    })

    let htmlContent = completion.choices[0]?.message?.content
    if (!htmlContent) {
      return NextResponse.json({ error: 'Failed to generate lift pack' }, { status: 500 })
    }

    // Clean up HTML
    htmlContent = htmlContent
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()

    // Insert drawing if provided
    if (data.drawingDataUrl && data.includeDrawing) {
      htmlContent = insertDrawingIntoHtml(htmlContent, data.drawingDataUrl)
    }

    return NextResponse.json({
      success: true,
      html: htmlContent,
      model: modelName,
      generatedAt: new Date().toISOString(),
      documentNumber: `LP-${Date.now().toString().slice(-8)}`
    })

  } catch (error) {
    console.error('Lift pack generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate lift pack'
    }, { status: 500 })
  }
}

function buildUserPrompt(data: LiftPackRequest): string {
  const sections = []

  sections.push(`Generate a COMPLETE LIFT PACK document for:`)
  sections.push(``)
  sections.push(`PROJECT DETAILS:`)
  sections.push(`- Project Name: ${data.projectName}`)
  if (data.projectNumber) sections.push(`- Project Number: ${data.projectNumber}`)
  if (data.client) sections.push(`- Client: ${data.client}`)
  if (data.location) sections.push(`- Location: ${data.location}`)
  sections.push(``)
  sections.push(`LIFT DETAILS:`)
  sections.push(`- Description: ${data.liftDescription}`)
  sections.push(`- Load Weight: ${data.loadWeight}`)
  if (data.loadDimensions) sections.push(`- Load Dimensions: ${data.loadDimensions}`)
  if (data.craneType) sections.push(`- Crane Type: ${data.craneType}`)
  if (data.riggingEquipment) sections.push(`- Rigging Equipment: ${data.riggingEquipment}`)
  if (data.liftRadius) sections.push(`- Lift Radius: ${data.liftRadius}`)
  if (data.liftHeight) sections.push(`- Lift Height: ${data.liftHeight}`)
  sections.push(``)
  sections.push(`SITE CONDITIONS:`)
  if (data.groundConditions) sections.push(`- Ground Conditions: ${data.groundConditions}`)
  if (data.weatherRestrictions) sections.push(`- Weather Restrictions: ${data.weatherRestrictions}`)
  if (data.hazards && data.hazards.length > 0) {
    sections.push(`- Identified Hazards: ${data.hazards.join(', ')}`)
  }
  sections.push(``)
  sections.push(`PERSONNEL:`)
  if (data.personnel && data.personnel.length > 0) {
    sections.push(`- Required Personnel: ${data.personnel.join(', ')}`)
  } else {
    sections.push(`- Required Personnel: Appointed Person, Crane Operator, Slinger/Signaller, Banksman`)
  }
  sections.push(``)
  sections.push(`SECTIONS TO INCLUDE:`)
  sections.push(`1. Cover Page with project details`)
  sections.push(`2. Table of Contents`)
  if (data.includeLiftPlan !== false) sections.push(`3. Complete Lift Plan with calculations`)
  if (data.includeRams !== false) sections.push(`4. Risk Assessment & Method Statement`)
  if (data.includeStepPlan !== false) sections.push(`5. Step-by-Step Execution Plan with timeline`)
  sections.push(`6. Equipment Checklist`)
  sections.push(`7. Personnel Briefing Sheet`)
  sections.push(`8. Emergency Procedures`)
  sections.push(`9. Approval & Signature Page`)
  if (data.includeDrawing && data.drawingDataUrl) {
    sections.push(`10. CAD Drawing (will be inserted automatically)`)
  }
  sections.push(``)
  sections.push(`Generate complete, professional HTML with all sections. Use realistic calculations and specific details.`)

  return sections.join('\n')
}

function insertDrawingIntoHtml(html: string, drawingDataUrl: string): string {
  // Find a good place to insert the drawing - after lift plan section or before signatures
  const drawingHtml = `
    <div class="page">
      <div class="section-header">CAD DRAWING</div>
      <div style="text-align: center; padding: 20px;">
        <img src="${drawingDataUrl}" style="max-width: 100%; max-height: 250mm; border: 1px solid #ddd;" alt="Lift Plan CAD Drawing" />
        <p style="margin-top: 15px; color: #666; font-size: 14px;">CAD Drawing - Generated from Lift Planner Pro</p>
      </div>
    </div>
  `

  // Try to insert before the signatures/approval section
  const approvalIndex = html.toLowerCase().indexOf('approval')
  if (approvalIndex > 0) {
    // Find the page div before approval
    const pageStart = html.lastIndexOf('<div class="page">', approvalIndex)
    if (pageStart > 0) {
      return html.slice(0, pageStart) + drawingHtml + html.slice(pageStart)
    }
  }

  // Fallback: insert before closing </div> of document
  const lastDivIndex = html.lastIndexOf('</div>')
  if (lastDivIndex > 0) {
    return html.slice(0, lastDivIndex) + drawingHtml + html.slice(lastDivIndex)
  }

  return html + drawingHtml
}

