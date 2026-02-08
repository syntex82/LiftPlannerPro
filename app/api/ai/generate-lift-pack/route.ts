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
  drawingDataUrl?: string
  includeDrawing?: boolean
  includeRams?: boolean
  includeStepPlan?: boolean
  includeLiftPlan?: boolean
  model?: 'openai' | 'deepseek'
}

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

    const documentNumber = `LP-${Date.now().toString().slice(-8)}`
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

    // Generate AI content for risk assessment and method statement
    let aiContent = { riskAssessment: '', methodStatement: '', stepPlan: '' }

    const model = data.model || 'openai'
    const client = model === 'deepseek' && deepseek ? deepseek : openai
    const modelName = model === 'deepseek' && deepseek ? 'deepseek-chat' : 'gpt-4o'

    if (client) {
      try {
        aiContent = await generateAIContent(client, modelName, data)
      } catch (e) {
        console.error('AI content generation failed, using defaults:', e)
        aiContent = generateDefaultContent(data)
      }
    } else {
      aiContent = generateDefaultContent(data)
    }

    // Build the complete HTML document
    const htmlContent = buildLiftPackHtml(data, documentNumber, currentDate, aiContent)

    return NextResponse.json({
      success: true,
      html: htmlContent,
      model: modelName,
      generatedAt: new Date().toISOString(),
      documentNumber
    })

  } catch (error) {
    console.error('Lift pack generation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate lift pack'
    }, { status: 500 })
  }
}

async function generateAIContent(client: OpenAI, modelName: string, data: LiftPackRequest) {
  const prompt = `You are a lift planning expert. Generate content for a lift pack document.

LIFT DETAILS:
- Description: ${data.liftDescription}
- Load Weight: ${data.loadWeight}
- Crane: ${data.craneType || 'To be confirmed'}
- Rigging: ${data.riggingEquipment || 'To be confirmed'}
- Radius: ${data.liftRadius || 'TBC'}
- Height: ${data.liftHeight || 'TBC'}
- Hazards: ${data.hazards?.join(', ') || 'Standard lifting hazards'}
- Ground: ${data.groundConditions || 'To be assessed'}
- Weather: ${data.weatherRestrictions || 'Standard restrictions apply'}

Generate JSON with these fields:
1. "riskAssessment": Array of 6-8 hazard objects with: hazard, likelihood (1-5), severity (1-5), riskLevel (High/Medium/Low), controlMeasures (detailed)
2. "methodStatement": Array of 8-12 detailed method steps
3. "stepPlan": Array of 10-15 execution steps with: step, action, responsibility, duration, safetyCheck

Return ONLY valid JSON, no markdown.`

  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.3
  })

  const content = completion.choices[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    return {
      riskAssessment: formatRiskAssessment(parsed.riskAssessment || []),
      methodStatement: formatMethodStatement(parsed.methodStatement || []),
      stepPlan: formatStepPlan(parsed.stepPlan || [])
    }
  } catch {
    return generateDefaultContent(data)
  }
}

function generateDefaultContent(data: LiftPackRequest) {
  const hazards = data.hazards || ['Suspended loads', 'Moving machinery', 'Working at height']

  const riskRows = hazards.map(h => `
    <tr>
      <td>${h}</td>
      <td>3</td>
      <td>4</td>
      <td class="risk-medium">Medium (12)</td>
      <td>Implement exclusion zones, use trained personnel, conduct toolbox talk, ensure all equipment inspected</td>
    </tr>
  `).join('')

  return {
    riskAssessment: riskRows,
    methodStatement: `
      <ol class="method-steps">
        <li>Conduct pre-lift briefing with all personnel</li>
        <li>Verify crane setup and ground conditions</li>
        <li>Inspect all lifting equipment and rigging gear</li>
        <li>Establish exclusion zones and barriers</li>
        <li>Attach rigging to load at designated lift points</li>
        <li>Perform trial lift (load 150mm off ground)</li>
        <li>Check load stability and rigging security</li>
        <li>Execute main lift to required height</li>
        <li>Slew/travel to set-down position</li>
        <li>Lower load and secure in final position</li>
        <li>Remove rigging and stand down exclusion zones</li>
        <li>Conduct post-lift debrief</li>
      </ol>
    `,
    stepPlan: `
      <tr><td>1</td><td>Pre-lift meeting and safety briefing</td><td>Appointed Person</td><td>15 mins</td><td>All personnel signed in</td></tr>
      <tr><td>2</td><td>Crane setup inspection</td><td>Crane Operator</td><td>10 mins</td><td>Outriggers fully extended</td></tr>
      <tr><td>3</td><td>Rigging equipment inspection</td><td>Slinger/Signaller</td><td>10 mins</td><td>All certificates valid</td></tr>
      <tr><td>4</td><td>Establish exclusion zone</td><td>Banksman</td><td>5 mins</td><td>Barriers in place</td></tr>
      <tr><td>5</td><td>Attach rigging to load</td><td>Slinger/Signaller</td><td>15 mins</td><td>Correct attachment points</td></tr>
      <tr><td>6</td><td>Trial lift - 150mm</td><td>Crane Operator</td><td>5 mins</td><td>Load stable and level</td></tr>
      <tr><td>7</td><td>Main lift execution</td><td>Crane Operator</td><td>10 mins</td><td>Smooth controlled lift</td></tr>
      <tr><td>8</td><td>Slew to set position</td><td>Crane Operator</td><td>5 mins</td><td>Clear swing path</td></tr>
      <tr><td>9</td><td>Lower and position load</td><td>Slinger/Signaller</td><td>10 mins</td><td>Load secure on supports</td></tr>
      <tr><td>10</td><td>Remove rigging</td><td>Slinger/Signaller</td><td>10 mins</td><td>All gear accounted for</td></tr>
      <tr><td>11</td><td>Stand down and debrief</td><td>Appointed Person</td><td>10 mins</td><td>Lessons learned recorded</td></tr>
    `
  }
}

function formatRiskAssessment(risks: Array<{hazard: string, likelihood: number, severity: number, riskLevel: string, controlMeasures: string}>) {
  if (!risks.length) return ''
  return risks.map(r => `
    <tr>
      <td>${r.hazard}</td>
      <td>${r.likelihood}</td>
      <td>${r.severity}</td>
      <td class="${r.riskLevel === 'High' ? 'risk-high' : r.riskLevel === 'Medium' ? 'risk-medium' : 'risk-low'}">${r.riskLevel} (${r.likelihood * r.severity})</td>
      <td>${r.controlMeasures}</td>
    </tr>
  `).join('')
}

function formatMethodStatement(steps: string[]) {
  if (!steps.length) return ''
  return `<ol class="method-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>`
}

function formatStepPlan(steps: Array<{step: number, action: string, responsibility: string, duration: string, safetyCheck: string}>) {
  if (!steps.length) return ''
  return steps.map(s => `
    <tr>
      <td>${s.step}</td>
      <td>${s.action}</td>
      <td>${s.responsibility}</td>
      <td>${s.duration}</td>
      <td>${s.safetyCheck}</td>
    </tr>
  `).join('')
}

function buildLiftPackHtml(
  data: LiftPackRequest,
  documentNumber: string,
  currentDate: string,
  aiContent: { riskAssessment: string; methodStatement: string; stepPlan: string }
): string {
  const personnel = data.personnel?.length ? data.personnel : ['Appointed Person', 'Crane Operator', 'Slinger/Signaller', 'Banksman']
  const hazards = data.hazards?.length ? data.hazards : ['Suspended loads', 'Moving machinery', 'Working at height']

  // Parse weight for calculations
  const weightMatch = data.loadWeight?.match(/(\d+(?:\.\d+)?)/);
  const loadWeight = weightMatch ? parseFloat(weightMatch[1]) : 10;
  const slingCapacity = Math.ceil(loadWeight * 1.5 / 4);

  const drawingSection = data.drawingDataUrl && data.includeDrawing ? `
    <div class="page">
      <div class="section-header">📐 CAD DRAWING</div>
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <img src="${data.drawingDataUrl}" style="max-width: 100%; max-height: 220mm; border: 2px solid #1a1a2e; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="Lift Plan CAD Drawing" />
        <p style="margin-top: 15px; color: #666; font-size: 14px; font-style: italic;">CAD Drawing - Generated from Lift Planner Pro</p>
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lift Pack - ${data.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; color: #1a1a2e; line-height: 1.6; }
    .document { max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 0 30px rgba(0,0,0,0.1); }

    /* Cover Page */
    .cover-page { min-height: 297mm; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%); color: white; text-align: center; padding: 50px; page-break-after: always; position: relative; overflow: hidden; }
    .cover-page::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(233,69,96,0.1) 0%, transparent 50%); animation: pulse 15s infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .cover-logo { width: 120px; height: 120px; background: linear-gradient(135deg, #e94560, #ff6b6b); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; margin-bottom: 40px; box-shadow: 0 10px 40px rgba(233,69,96,0.4); }
    .cover-title { font-size: 48px; font-weight: 800; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .cover-subtitle { font-size: 24px; margin-bottom: 50px; opacity: 0.9; font-weight: 300; }
    .cover-info { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px 60px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); }
    .cover-info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .cover-info-row:last-child { border-bottom: none; }
    .cover-info-label { opacity: 0.7; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .cover-info-value { font-weight: 600; font-size: 16px; }
    .cover-doc-number { position: absolute; top: 30px; right: 30px; background: rgba(233,69,96,0.9); padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cover-date { position: absolute; bottom: 30px; font-size: 14px; opacity: 0.7; }

    /* Pages */
    .page { padding: 20mm; page-break-after: always; min-height: 297mm; }
    .section-header { background: linear-gradient(90deg, #1a1a2e, #16213e); color: white; padding: 18px 30px; margin: 30px -20mm 25px; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .subsection { background: linear-gradient(90deg, #e8f4f8, #f0f7fa); padding: 12px 18px; margin: 20px 0 15px; font-weight: 700; color: #0f3460; border-left: 5px solid #e94560; font-size: 16px; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    th { background: linear-gradient(90deg, #1a1a2e, #16213e); color: white; padding: 14px 16px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    tr:nth-child(even) { background: #f8f9fa; }
    tr:hover { background: #f0f4f8; }
    .risk-high { background: linear-gradient(90deg, #ffebee, #ffcdd2) !important; color: #c62828; font-weight: 700; }
    .risk-medium { background: linear-gradient(90deg, #fff8e1, #ffecb3) !important; color: #f57f17; font-weight: 700; }
    .risk-low { background: linear-gradient(90deg, #e8f5e9, #c8e6c9) !important; color: #2e7d32; font-weight: 700; }

    /* Info Grid */
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 25px 0; }
    .info-box { background: linear-gradient(135deg, #f8f9fa, #ffffff); padding: 20px; border-left: 5px solid #e94560; border-radius: 0 8px 8px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
    .info-value { font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .info-box.full-width { grid-column: span 2; }

    /* Checklists */
    .checklist { list-style: none; margin: 20px 0; }
    .checklist li { padding: 14px 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px; transition: background 0.2s; }
    .checklist li:hover { background: #f8f9fa; }
    .checklist li::before { content: '☐'; font-size: 22px; color: #e94560; }

    /* Method Steps */
    .method-steps { counter-reset: step; list-style: none; margin: 20px 0; }
    .method-steps li { padding: 15px 20px 15px 70px; position: relative; border-left: 3px solid #e94560; margin-left: 20px; margin-bottom: 10px; background: #f8f9fa; border-radius: 0 8px 8px 0; }
    .method-steps li::before { counter-increment: step; content: counter(step); position: absolute; left: -22px; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: linear-gradient(135deg, #e94560, #ff6b6b); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; box-shadow: 0 3px 10px rgba(233,69,96,0.3); }

    /* Signatures */
    .sig-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin: 30px 0; }
    .sig-box { border: 2px solid #1a1a2e; padding: 25px; background: linear-gradient(135deg, #fafafa, #ffffff); border-radius: 8px; }
    .sig-role { font-weight: 700; font-size: 16px; color: #1a1a2e; margin-bottom: 8px; }
    .sig-name { font-size: 14px; color: #666; margin-bottom: 25px; }
    .sig-line { border-bottom: 2px solid #333; height: 40px; margin-bottom: 8px; }
    .sig-date { font-size: 12px; color: #666; }

    /* Warning/Danger Boxes */
    .warning-box { background: linear-gradient(135deg, #fff3cd, #ffeeba); border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px; display: flex; align-items: flex-start; gap: 15px; }
    .danger-box { background: linear-gradient(135deg, #f8d7da, #f5c6cb); border: 2px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 8px; display: flex; align-items: flex-start; gap: 15px; }
    .warning-icon, .danger-icon { font-size: 28px; }

    /* TOC */
    .toc { margin: 30px 0; }
    .toc-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dotted #ccc; }
    .toc-item:hover { background: #f8f9fa; }
    .toc-section { font-weight: 600; color: #1a1a2e; }
    .toc-page { color: #e94560; font-weight: 700; }

    /* Emergency */
    .emergency-step { display: flex; align-items: flex-start; gap: 20px; padding: 20px; background: #f8f9fa; margin: 15px 0; border-radius: 8px; border-left: 5px solid #dc3545; }
    .emergency-number { width: 50px; height: 50px; background: linear-gradient(135deg, #dc3545, #c82333); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; flex-shrink: 0; }

    /* Print Styles */
    @media print {
      body { background: white; }
      .document { box-shadow: none; margin: 0; }
      .cover-page::before { display: none; }
      .page { page-break-after: always; }
    }
  </style>
</head>
<body>
<div class="document">

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-doc-number">${documentNumber}</div>
    <div class="cover-logo">🏗️</div>
    <h1 class="cover-title">LIFT PACK</h1>
    <p class="cover-subtitle">${data.projectName}</p>
    <div class="cover-info">
      <div class="cover-info-row">
        <span class="cover-info-label">Project Number</span>
        <span class="cover-info-value">${data.projectNumber || 'N/A'}</span>
      </div>
      <div class="cover-info-row">
        <span class="cover-info-label">Client</span>
        <span class="cover-info-value">${data.client || 'N/A'}</span>
      </div>
      <div class="cover-info-row">
        <span class="cover-info-label">Location</span>
        <span class="cover-info-value">${data.location || 'N/A'}</span>
      </div>
      <div class="cover-info-row">
        <span class="cover-info-label">Load Weight</span>
        <span class="cover-info-value">${data.loadWeight}</span>
      </div>
      <div class="cover-info-row">
        <span class="cover-info-label">Crane</span>
        <span class="cover-info-value">${data.craneType || 'TBC'}</span>
      </div>
    </div>
    <p class="cover-date">Document Generated: ${currentDate}</p>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="page">
    <div class="section-header">📋 TABLE OF CONTENTS</div>
    <div class="toc">
      <div class="toc-item"><span class="toc-section">1. Lift Plan Details</span><span class="toc-page">3</span></div>
      <div class="toc-item"><span class="toc-section">2. Risk Assessment</span><span class="toc-page">4</span></div>
      <div class="toc-item"><span class="toc-section">3. Method Statement</span><span class="toc-page">5</span></div>
      <div class="toc-item"><span class="toc-section">4. Step-by-Step Execution Plan</span><span class="toc-page">6</span></div>
      <div class="toc-item"><span class="toc-section">5. Equipment Checklist</span><span class="toc-page">7</span></div>
      <div class="toc-item"><span class="toc-section">6. Personnel Briefing</span><span class="toc-page">8</span></div>
      <div class="toc-item"><span class="toc-section">7. Emergency Procedures</span><span class="toc-page">9</span></div>
      ${data.includeDrawing && data.drawingDataUrl ? '<div class="toc-item"><span class="toc-section">8. CAD Drawing</span><span class="toc-page">10</span></div>' : ''}
      <div class="toc-item"><span class="toc-section">${data.includeDrawing && data.drawingDataUrl ? '9' : '8'}. Approval & Signatures</span><span class="toc-page">${data.includeDrawing && data.drawingDataUrl ? '11' : '10'}</span></div>
    </div>

    <div class="warning-box">
      <span class="warning-icon">⚠️</span>
      <div>
        <strong>Important Notice</strong><br>
        This lift pack must be reviewed and approved by all relevant personnel before lifting operations commence.
        Any changes to the lift plan require re-assessment and re-approval.
      </div>
    </div>

    <div style="margin-top: 40px; padding: 25px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="margin-bottom: 15px; color: #1a1a2e;">Document Control</h3>
      <table>
        <tr><th>Document Number</th><td>${documentNumber}</td></tr>
        <tr><th>Revision</th><td>A (Initial Issue)</td></tr>
        <tr><th>Date</th><td>${currentDate}</td></tr>
        <tr><th>Prepared By</th><td>Lift Planner Pro</td></tr>
        <tr><th>Status</th><td><span style="background: #ffc107; padding: 4px 12px; border-radius: 4px; font-weight: 600;">DRAFT - AWAITING APPROVAL</span></td></tr>
      </table>
    </div>
  </div>

  <!-- LIFT PLAN DETAILS -->
  <div class="page">
    <div class="section-header">🏗️ 1. LIFT PLAN DETAILS</div>

    <div class="subsection">1.1 Project Information</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Project Name</div>
        <div class="info-value">${data.projectName}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Project Number</div>
        <div class="info-value">${data.projectNumber || 'N/A'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Client</div>
        <div class="info-value">${data.client || 'N/A'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Location</div>
        <div class="info-value">${data.location || 'N/A'}</div>
      </div>
    </div>

    <div class="subsection">1.2 Lift Description</div>
    <div class="info-box full-width" style="grid-column: span 2;">
      <div class="info-label">Description of Lift</div>
      <div class="info-value" style="font-size: 16px; line-height: 1.8;">${data.liftDescription}</div>
    </div>

    <div class="subsection">1.3 Load Details</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Load Weight</div>
        <div class="info-value" style="color: #e94560;">${data.loadWeight}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Load Dimensions</div>
        <div class="info-value">${data.loadDimensions || 'TBC'}</div>
      </div>
    </div>

    <div class="subsection">1.4 Crane & Rigging</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Crane Type</div>
        <div class="info-value">${data.craneType || 'TBC'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Lift Radius</div>
        <div class="info-value">${data.liftRadius || 'TBC'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Lift Height</div>
        <div class="info-value">${data.liftHeight || 'TBC'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Min Sling SWL Required</div>
        <div class="info-value">${slingCapacity}t per leg (4-leg system)</div>
      </div>
    </div>

    <div class="info-box full-width" style="margin-top: 15px;">
      <div class="info-label">Rigging Equipment</div>
      <div class="info-value" style="font-size: 15px;">${data.riggingEquipment || 'To be confirmed by Appointed Person'}</div>
    </div>

    <div class="subsection">1.5 Site Conditions</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Ground Conditions</div>
        <div class="info-value">${data.groundConditions || 'To be assessed prior to lift'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Weather Restrictions</div>
        <div class="info-value">${data.weatherRestrictions || 'Abort if wind >25mph'}</div>
      </div>
    </div>
  </div>

  <!-- RISK ASSESSMENT -->
  <div class="page">
    <div class="section-header">⚠️ 2. RISK ASSESSMENT</div>

    <div class="danger-box">
      <span class="danger-icon">🚨</span>
      <div>
        <strong>Critical Safety Notice</strong><br>
        All identified hazards must be controlled before lifting operations commence.
        Stop work immediately if new hazards are identified.
      </div>
    </div>

    <div class="subsection">2.1 Hazard Identification & Control Measures</div>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Hazard</th>
          <th style="width: 8%;">L</th>
          <th style="width: 8%;">S</th>
          <th style="width: 14%;">Risk Level</th>
          <th style="width: 50%;">Control Measures</th>
        </tr>
      </thead>
      <tbody>
        ${aiContent.riskAssessment}
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
      <strong>Risk Matrix Key:</strong><br>
      <span style="margin-right: 20px;"><strong>L</strong> = Likelihood (1-5)</span>
      <span style="margin-right: 20px;"><strong>S</strong> = Severity (1-5)</span>
      <span><strong>Risk</strong> = L × S</span><br>
      <span class="risk-low" style="padding: 2px 8px; margin-right: 10px;">Low (1-6)</span>
      <span class="risk-medium" style="padding: 2px 8px; margin-right: 10px;">Medium (7-14)</span>
      <span class="risk-high" style="padding: 2px 8px;">High (15-25)</span>
    </div>

    <div class="subsection">2.2 Identified Site Hazards</div>
    <ul class="checklist">
      ${hazards.map(h => `<li>${h}</li>`).join('')}
    </ul>
  </div>

  <!-- METHOD STATEMENT -->
  <div class="page">
    <div class="section-header">📝 3. METHOD STATEMENT</div>

    <div class="subsection">3.1 Scope of Work</div>
    <p style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
      ${data.liftDescription}. This method statement details the safe system of work for executing this lifting operation
      using ${data.craneType || 'the designated crane'} and appropriate rigging equipment.
    </p>

    <div class="subsection">3.2 Sequence of Operations</div>
    ${aiContent.methodStatement}

    <div class="subsection">3.3 Key Safety Requirements</div>
    <ul class="checklist">
      <li>All personnel must attend pre-lift briefing</li>
      <li>Exclusion zones must be established and maintained</li>
      <li>All lifting equipment must have valid inspection certificates</li>
      <li>Slinger/Signaller must have clear line of sight to crane operator</li>
      <li>Trial lift required before main lift (load 150mm off ground)</li>
      <li>No personnel under suspended load at any time</li>
      <li>Lift must be aborted if wind exceeds ${data.weatherRestrictions || '25mph'}</li>
      <li>Emergency stop procedures must be understood by all</li>
    </ul>
  </div>

  <!-- STEP-BY-STEP EXECUTION PLAN -->
  <div class="page">
    <div class="section-header">📋 4. STEP-BY-STEP EXECUTION PLAN</div>

    <div class="subsection">4.1 Lift Sequence</div>
    <table>
      <thead>
        <tr>
          <th style="width: 6%;">Step</th>
          <th style="width: 35%;">Action</th>
          <th style="width: 20%;">Responsibility</th>
          <th style="width: 12%;">Duration</th>
          <th style="width: 27%;">Safety Check</th>
        </tr>
      </thead>
      <tbody>
        ${aiContent.stepPlan}
      </tbody>
    </table>

    <div class="warning-box">
      <span class="warning-icon">⏱️</span>
      <div>
        <strong>Timing Note</strong><br>
        Estimated total lift duration: Approximately 2-3 hours including setup and debrief.
        Times are indicative and may vary based on site conditions.
      </div>
    </div>
  </div>

  <!-- EQUIPMENT CHECKLIST -->
  <div class="page">
    <div class="section-header">🔧 5. EQUIPMENT CHECKLIST</div>

    <div class="subsection">5.1 Lifting Equipment</div>
    <table>
      <thead>
        <tr>
          <th>Equipment</th>
          <th>SWL/Capacity</th>
          <th>Cert Valid</th>
          <th>Inspected</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>${data.craneType || 'Mobile Crane'}</td><td>As per load chart</td><td>☐</td><td>☐</td></tr>
        <tr><td>Lifting Slings</td><td>Min ${slingCapacity}t per leg</td><td>☐</td><td>☐</td></tr>
        <tr><td>Shackles</td><td>Appropriate for load</td><td>☐</td><td>☐</td></tr>
        <tr><td>Spreader Beam (if required)</td><td>TBC</td><td>☐</td><td>☐</td></tr>
      </tbody>
    </table>

    <div class="subsection">5.2 Additional Equipment</div>
    <ul class="checklist">
      <li>Crane mats / spreader plates</li>
      <li>Tag lines</li>
      <li>Barriers and signage</li>
      <li>Two-way radios</li>
      <li>PPE (hard hats, hi-vis, safety boots, gloves)</li>
      <li>First aid kit</li>
      <li>Fire extinguisher</li>
      <li>Anemometer (wind speed monitor)</li>
    </ul>

    <div class="subsection">5.3 Rigging Configuration</div>
    <p style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
      <strong>Specified Rigging:</strong> ${data.riggingEquipment || 'To be confirmed by Appointed Person'}<br><br>
      All rigging must be inspected before use and have valid LOLER certificates.
      Any damaged or suspect equipment must be removed from service immediately.
    </p>
  </div>

  <!-- PERSONNEL BRIEFING -->
  <div class="page">
    <div class="section-header">👷 6. PERSONNEL BRIEFING</div>

    <div class="subsection">6.1 Required Personnel</div>
    <table>
      <thead>
        <tr>
          <th>Role</th>
          <th>Responsibilities</th>
          <th>Competency Required</th>
          <th>Present</th>
        </tr>
      </thead>
      <tbody>
        ${personnel.map(p => `
          <tr>
            <td><strong>${p}</strong></td>
            <td>${getPersonnelResponsibilities(p)}</td>
            <td>${getPersonnelCompetency(p)}</td>
            <td>☐</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="subsection">6.2 Briefing Checklist</div>
    <ul class="checklist">
      <li>Lift plan explained to all personnel</li>
      <li>Roles and responsibilities understood</li>
      <li>Communication methods confirmed</li>
      <li>Emergency procedures explained</li>
      <li>Exclusion zones identified</li>
      <li>Hand signals reviewed</li>
      <li>Weather conditions checked</li>
      <li>Questions answered and concerns addressed</li>
    </ul>

    <div class="subsection">6.3 Briefing Sign-Off</div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Signature</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${personnel.map(() => '<tr><td style="height: 40px;"></td><td></td><td></td><td></td></tr>').join('')}
        <tr><td style="height: 40px;"></td><td></td><td></td><td></td></tr>
        <tr><td style="height: 40px;"></td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
  </div>

  <!-- EMERGENCY PROCEDURES -->
  <div class="page">
    <div class="section-header">🚨 7. EMERGENCY PROCEDURES</div>

    <div class="danger-box">
      <span class="danger-icon">⚠️</span>
      <div>
        <strong>In Case of Emergency</strong><br>
        All personnel must be familiar with these procedures before lifting operations commence.
      </div>
    </div>

    <div class="subsection">7.1 Emergency Response Steps</div>

    <div class="emergency-step">
      <div class="emergency-number">1</div>
      <div>
        <strong>STOP</strong><br>
        Immediately cease all lifting operations. Crane operator to hold load in current position if safe to do so.
      </div>
    </div>

    <div class="emergency-step">
      <div class="emergency-number">2</div>
      <div>
        <strong>WARN</strong><br>
        Alert all personnel using three short blasts on air horn or radio call "EMERGENCY STOP - ALL STOP".
      </div>
    </div>

    <div class="emergency-step">
      <div class="emergency-number">3</div>
      <div>
        <strong>EVACUATE</strong><br>
        Clear all personnel from the exclusion zone. Muster at designated safe area.
      </div>
    </div>

    <div class="emergency-step">
      <div class="emergency-number">4</div>
      <div>
        <strong>ASSESS</strong><br>
        Appointed Person to assess the situation and determine appropriate response.
      </div>
    </div>

    <div class="emergency-step">
      <div class="emergency-number">5</div>
      <div>
        <strong>RESPOND</strong><br>
        If injury: Call emergency services (999). If equipment failure: Secure area and make safe.
      </div>
    </div>

    <div class="subsection">7.2 Emergency Contacts</div>
    <table>
      <tr><th>Service</th><th>Contact</th></tr>
      <tr><td>Emergency Services</td><td><strong>999</strong></td></tr>
      <tr><td>Site Emergency Number</td><td>________________</td></tr>
      <tr><td>Site First Aider</td><td>________________</td></tr>
      <tr><td>Appointed Person (Mobile)</td><td>________________</td></tr>
      <tr><td>Crane Company</td><td>________________</td></tr>
    </table>

    <div class="subsection">7.3 Load Lowering (Emergency)</div>
    <p style="padding: 15px; background: #f8d7da; border-radius: 8px; border-left: 5px solid #dc3545;">
      In the event the load cannot be placed at its intended destination, the Appointed Person will identify a
      suitable alternative set-down location. The load must only be lowered in a controlled manner with all
      personnel clear of the drop zone.
    </p>
  </div>

  ${drawingSection}

  <!-- APPROVAL & SIGNATURES -->
  <div class="page">
    <div class="section-header">✍️ ${data.includeDrawing && data.drawingDataUrl ? '9' : '8'}. APPROVAL & SIGNATURES</div>

    <div class="warning-box">
      <span class="warning-icon">📋</span>
      <div>
        <strong>Document Approval</strong><br>
        This lift pack must be signed by all responsible personnel before lifting operations may commence.
      </div>
    </div>

    <div class="subsection">Authorisation</div>
    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-role">Prepared By</div>
        <div class="sig-name">Lift Planner / Engineer</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-box">
        <div class="sig-role">Reviewed By</div>
        <div class="sig-name">Senior Engineer / AP</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-box">
        <div class="sig-role">Appointed Person</div>
        <div class="sig-name">Responsible for Lift Execution</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-box">
        <div class="sig-role">Crane Operator</div>
        <div class="sig-name">Lift Plan Understood</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-box">
        <div class="sig-role">Slinger/Signaller</div>
        <div class="sig-name">Briefing Acknowledged</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
      <div class="sig-box">
        <div class="sig-role">Client Representative</div>
        <div class="sig-name">Approval to Proceed</div>
        <div class="sig-line"></div>
        <div class="sig-date">Date: _______________</div>
      </div>
    </div>

    <div style="margin-top: 40px; padding: 20px; background: #e8f5e9; border-radius: 8px; border-left: 5px solid #4caf50;">
      <strong>✓ Lift Pack Complete</strong><br><br>
      Document: ${documentNumber}<br>
      Generated: ${currentDate}<br>
      Project: ${data.projectName}
    </div>
  </div>

</div>
</body>
</html>`;
}

function getPersonnelResponsibilities(role: string): string {
  const responsibilities: Record<string, string> = {
    'Appointed Person': 'Overall responsibility for planning and execution of the lifting operation',
    'Crane Operator': 'Safe operation of the crane in accordance with the lift plan',
    'Slinger/Signaller': 'Attachment/detachment of loads and communication with crane operator',
    'Banksman': 'Control of ground operations and personnel movements',
    'Rigger': 'Preparation and inspection of rigging equipment',
    'Site Supervisor': 'Overall site safety and coordination',
    'Safety Officer': 'Safety oversight and compliance monitoring',
    'Fire Watch': 'Fire prevention and monitoring during hot work'
  };
  return responsibilities[role] || 'As directed by Appointed Person';
}

function getPersonnelCompetency(role: string): string {
  const competencies: Record<string, string> = {
    'Appointed Person': 'CPCS A61 / ALLMI AP',
    'Crane Operator': 'CPCS A02-A04 / ALLMI',
    'Slinger/Signaller': 'CPCS A40 / ALLMI',
    'Banksman': 'CPCS A40 / Site Induction',
    'Rigger': 'LEEA / CPCS A40',
    'Site Supervisor': 'SMSTS / Site Induction',
    'Safety Officer': 'NEBOSH / IOSH',
    'Fire Watch': 'Fire Warden Training'
  };
  return competencies[role] || 'Site Induction';
}

