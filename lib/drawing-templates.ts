// Drawing Templates Library for Lift Planner Pro
// Pre-made templates to help users get started quickly

export interface DrawingTemplate {
  id: string
  name: string
  description: string
  category: 'lift-plan' | 'site-layout' | 'crane-setup' | 'safety-zone' | 'rigging'
  thumbnail: string
  elements: any[]
  projectInfo: {
    title: string
    projectNumber: string
    scale: string
    drawnBy: string
    checkedBy: string
    date: string
    revision: string
    sheet: string
    company: string
  }
  drawingScale: string
  drawingUnits: string
  layers: any[]
}

// Template categories
export const templateCategories = [
  { id: 'lift-plan', name: 'Lift Plans', icon: 'Crane', description: 'Complete lift planning templates' },
  { id: 'site-layout', name: 'Site Layouts', icon: 'Map', description: 'Site and ground condition templates' },
  { id: 'crane-setup', name: 'Crane Setups', icon: 'Truck', description: 'Crane positioning templates' },
  { id: 'safety-zone', name: 'Safety Zones', icon: 'AlertTriangle', description: 'Exclusion and hazard zones' },
  { id: 'rigging', name: 'Rigging Plans', icon: 'Link', description: 'Rigging configuration templates' }
]

// Standard layers for lift planning
const standardLiftPlanLayers = [
  { id: 'layer1', name: 'Site Boundary', visible: true, color: '#6b7280', locked: false, opacity: 1, lineWeight: 2 },
  { id: 'layer2', name: 'Crane Position', visible: true, color: '#3b82f6', locked: false, opacity: 1, lineWeight: 1.5 },
  { id: 'layer3', name: 'Load Path', visible: true, color: '#10b981', locked: false, opacity: 1, lineWeight: 1 },
  { id: 'layer4', name: 'Exclusion Zone', visible: true, color: '#ef4444', locked: false, opacity: 0.5, lineWeight: 1 },
  { id: 'layer5', name: 'Dimensions', visible: true, color: '#f59e0b', locked: false, opacity: 1, lineWeight: 0.5 },
  { id: 'layer6', name: 'Text & Notes', visible: true, color: '#8b5cf6', locked: false, opacity: 1, lineWeight: 1 }
]

// Create a basic title block element
const createTitleBlock = (x: number, y: number, info: any) => ({
  id: `titleblock-${Date.now()}`,
  type: 'titleblock',
  points: [{ x, y }, { x: x + 280, y: y + 120 }],
  style: { stroke: '#000000', strokeWidth: 1 },
  layer: 'layer6',
  locked: false,
  titleBlockType: 'standard',
  projectInfo: info
})

// Pre-defined templates
export const drawingTemplates: DrawingTemplate[] = [
  {
    id: 'basic-lift-plan',
    name: 'Basic Lift Plan',
    description: 'Standard lift plan template with title block, north arrow, and dimension annotations',
    category: 'lift-plan',
    thumbnail: '/templates/basic-lift-plan.png',
    drawingScale: '1:100',
    drawingUnits: 'm',
    layers: standardLiftPlanLayers,
    projectInfo: {
      title: 'Lift Plan',
      projectNumber: 'LP-001',
      scale: '1:100',
      drawnBy: '',
      checkedBy: '',
      date: new Date().toISOString().split('T')[0],
      revision: 'A',
      sheet: '1 of 1',
      company: ''
    },
    elements: [
      // Title block in bottom right
      createTitleBlock(700, 500, {
        title: 'Lift Plan',
        projectNumber: 'LP-001',
        scale: '1:100',
        drawnBy: '',
        checkedBy: '',
        date: new Date().toISOString().split('T')[0],
        revision: 'A',
        sheet: '1 of 1',
        company: ''
      }),
      // North arrow
      {
        id: 'north-arrow-1',
        type: 'text',
        points: [{ x: 50, y: 50 }],
        style: { stroke: '#000000', strokeWidth: 1, fontSize: 24 },
        layer: 'layer6',
        text: '⬆ N',
        fontSize: 24,
        locked: false
      },
      // Scale bar text
      {
        id: 'scale-text-1',
        type: 'text',
        points: [{ x: 50, y: 580 }],
        style: { stroke: '#000000', strokeWidth: 1, fontSize: 12 },
        layer: 'layer5',
        text: 'Scale: 1:100 (1 unit = 100m)',
        fontSize: 12,
        locked: false
      }
    ]
  },
  {
    id: 'tandem-lift-plan',
    name: 'Tandem Lift Plan',
    description: 'Template for dual crane tandem lift operations',
    category: 'lift-plan',
    thumbnail: '/templates/tandem-lift.png',
    drawingScale: '1:200',
    drawingUnits: 'm',
    layers: standardLiftPlanLayers,
    projectInfo: {
      title: 'Tandem Lift Plan',
      projectNumber: 'TLP-001',
      scale: '1:200',
      drawnBy: '',
      checkedBy: '',
      date: new Date().toISOString().split('T')[0],
      revision: 'A',
      sheet: '1 of 1',
      company: ''
    },
    elements: [
      createTitleBlock(700, 500, {
        title: 'Tandem Lift Plan',
        projectNumber: 'TLP-001',
        scale: '1:200'
      }),
      // Crane 1 position marker
      {
        id: 'crane1-marker',
        type: 'text',
        points: [{ x: 200, y: 200 }],
        style: { stroke: '#3b82f6', strokeWidth: 1, fontSize: 14 },
        layer: 'layer2',
        text: '🏗 CRANE 1',
        fontSize: 14,
        locked: false
      },
      // Crane 2 position marker
      {
        id: 'crane2-marker',
        type: 'text',
        points: [{ x: 500, y: 200 }],
        style: { stroke: '#3b82f6', strokeWidth: 1, fontSize: 14 },
        layer: 'layer2',
        text: '🏗 CRANE 2',
        fontSize: 14,
        locked: false
      }
    ]
  },
  {
    id: 'site-layout-basic',
    name: 'Site Layout',
    description: 'Basic site layout with boundary, access roads, and key areas marked',
    category: 'site-layout',
    thumbnail: '/templates/site-layout.png',
    drawingScale: '1:500',
    drawingUnits: 'm',
    layers: standardLiftPlanLayers,
    projectInfo: {
      title: 'Site Layout Plan',
      projectNumber: 'SL-001',
      scale: '1:500',
      drawnBy: '',
      checkedBy: '',
      date: new Date().toISOString().split('T')[0],
      revision: 'A',
      sheet: '1 of 1',
      company: ''
    },
    elements: [
      createTitleBlock(700, 500, { title: 'Site Layout Plan', projectNumber: 'SL-001', scale: '1:500' }),
      // Site boundary rectangle
      {
        id: 'site-boundary',
        type: 'rectangle',
        points: [{ x: 100, y: 100 }, { x: 650, y: 450 }],
        style: { stroke: '#6b7280', strokeWidth: 2, lineType: 'dashed' },
        layer: 'layer1',
        locked: false
      },
      // Legend
      {
        id: 'legend-title',
        type: 'text',
        points: [{ x: 50, y: 520 }],
        style: { stroke: '#000000', strokeWidth: 1, fontSize: 14 },
        layer: 'layer6',
        text: 'LEGEND:',
        fontSize: 14,
        locked: false
      }
    ]
  },
  {
    id: 'exclusion-zone',
    name: 'Exclusion Zone Template',
    description: 'Template for marking fall zones, swing radius, and restricted areas',
    category: 'safety-zone',
    thumbnail: '/templates/exclusion-zone.png',
    drawingScale: '1:100',
    drawingUnits: 'm',
    layers: [
      ...standardLiftPlanLayers,
      { id: 'layer7', name: 'Fall Zone', visible: true, color: '#dc2626', locked: false, opacity: 0.3, lineWeight: 2 },
      { id: 'layer8', name: 'Swing Radius', visible: true, color: '#f97316', locked: false, opacity: 0.3, lineWeight: 1.5 }
    ],
    projectInfo: {
      title: 'Exclusion Zone Plan',
      projectNumber: 'EZ-001',
      scale: '1:100',
      drawnBy: '',
      checkedBy: '',
      date: new Date().toISOString().split('T')[0],
      revision: 'A',
      sheet: '1 of 1',
      company: ''
    },
    elements: [
      createTitleBlock(700, 500, { title: 'Exclusion Zone Plan', projectNumber: 'EZ-001', scale: '1:100' }),
      // Fall zone circle (to be positioned)
      {
        id: 'fall-zone',
        type: 'circle',
        points: [{ x: 350, y: 250 }],
        radius: 80,
        style: { stroke: '#dc2626', strokeWidth: 2, fill: '#dc2626', fillOpacity: 0.2 },
        layer: 'layer7',
        locked: false
      },
      // Fall zone label
      {
        id: 'fall-zone-label',
        type: 'text',
        points: [{ x: 320, y: 250 }],
        style: { stroke: '#dc2626', strokeWidth: 1, fontSize: 12 },
        layer: 'layer7',
        text: 'FALL ZONE',
        fontSize: 12,
        locked: false
      },
      // Safety notes
      {
        id: 'safety-note',
        type: 'text',
        points: [{ x: 50, y: 520 }],
        style: { stroke: '#ef4444', strokeWidth: 1, fontSize: 11 },
        layer: 'layer6',
        text: '⚠️ NO PERSONNEL WITHIN EXCLUSION ZONES DURING LIFT OPERATIONS',
        fontSize: 11,
        locked: false
      }
    ]
  },
  {
    id: 'rigging-plan',
    name: 'Rigging Configuration',
    description: 'Template for documenting rigging setup, sling angles, and load distribution',
    category: 'rigging',
    thumbnail: '/templates/rigging-plan.png',
    drawingScale: '1:20',
    drawingUnits: 'm',
    layers: standardLiftPlanLayers,
    projectInfo: {
      title: 'Rigging Plan',
      projectNumber: 'RP-001',
      scale: '1:20',
      drawnBy: '',
      checkedBy: '',
      date: new Date().toISOString().split('T')[0],
      revision: 'A',
      sheet: '1 of 1',
      company: ''
    },
    elements: [
      createTitleBlock(700, 500, { title: 'Rigging Plan', projectNumber: 'RP-001', scale: '1:20' }),
      // Load representation
      {
        id: 'load-box',
        type: 'rectangle',
        points: [{ x: 250, y: 300 }, { x: 450, y: 400 }],
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        layer: 'layer3',
        locked: false
      },
      // Load label
      {
        id: 'load-label',
        type: 'text',
        points: [{ x: 320, y: 350 }],
        style: { stroke: '#3b82f6', strokeWidth: 1, fontSize: 14 },
        layer: 'layer3',
        text: 'LOAD',
        fontSize: 14,
        locked: false
      },
      // Rigging info table placeholder
      {
        id: 'rigging-info',
        type: 'text',
        points: [{ x: 50, y: 100 }],
        style: { stroke: '#000000', strokeWidth: 1, fontSize: 12 },
        layer: 'layer6',
        text: 'RIGGING DETAILS:\n• Sling Type:\n• SWL:\n• Sling Angle:\n• D:d Ratio:',
        fontSize: 12,
        locked: false
      }
    ]
  }
]

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): DrawingTemplate[] {
  return drawingTemplates.filter(t => t.category === category)
}

// Helper function to get template by ID
export function getTemplateById(id: string): DrawingTemplate | undefined {
  return drawingTemplates.find(t => t.id === id)
}

