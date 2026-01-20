/**
 * Lift Category Templates for RAMS Generator
 * Pre-defined data for common lift categories used in lifting operations
 */

export interface LiftCategoryTemplate {
  id: string
  name: string
  description: string
  hazards: string[]
  controlMeasures: string
  methodStatement: string
  emergencyProcedures: string
  equipmentUsed: string
  typicalWeight: string
  typicalHeight: string
  specialConsiderations: string
  ppe: string[]
  permits: {
    permitToWork: boolean
    hotWorkPermit: boolean
    confinedSpacePermit: boolean
    roadClosurePermit: boolean
  }
  equipmentChecks: {
    craneInspection: boolean
    riggingInspection: boolean
    loadTestCertificate: boolean
  }
}

export const liftCategoryTemplates: Record<string, LiftCategoryTemplate> = {
  mobileCrane: {
    id: 'mobileCrane',
    name: 'Mobile Crane Lift',
    description: 'Standard lifting operations using mobile cranes for general construction and industrial applications',
    hazards: [
      'Overhead power lines',
      'Load swing and rotation',
      'Load drop or falling objects',
      'Crane overturning due to ground instability',
      'Equipment failure or mechanical breakdown',
      'Inadequate communication between personnel',
      'Weather conditions affecting stability',
      'Unstable ground conditions',
      'Inadequate rigging or slinging',
      'Personnel in exclusion zones'
    ],
    controlMeasures: `
1. Pre-lift inspection: Verify crane condition, load calculations, and rigging
2. Site assessment: Check ground bearing capacity, overhead hazards, and weather
3. Exclusion zones: Establish and enforce 1.5x load radius exclusion zones
4. Communication: Use radio communication with clear hand signals
5. Spotters: Position spotters to guide load and monitor exclusion zones
6. Load testing: Perform test lifts before full operation
7. Weather monitoring: Cease operations if wind speed exceeds 12 m/s
8. Personnel briefing: Conduct toolbox talk before commencing work
9. Continuous monitoring: Inspect rigging and load during operation
10. Emergency procedures: Have rescue equipment and procedures in place
    `,
    methodStatement: `
STEP 1: PRE-OPERATION PHASE
- Verify all personnel are trained and competent
- Inspect crane, rigging equipment, and load
- Confirm load weight and center of gravity
- Check weather conditions and site conditions

STEP 2: SITE PREPARATION
- Clear exclusion zones of all personnel
- Position crane on level, stable ground
- Establish communication system
- Position spotters and safety personnel

STEP 3: LIFTING OPERATION
- Perform test lift to 1 meter height
- Verify load stability and rigging integrity
- Proceed with controlled lift at slow speed
- Monitor load and rigging continuously
- Lower load carefully to final position

STEP 4: POST-OPERATION
- Secure load in final position
- Inspect rigging for damage
- Document any incidents or near-misses
- Debrief team on operation
    `,
    emergencyProcedures: `
POWER LINE CONTACT: Immediately stop operation, do not touch crane, call emergency services
LOAD DROP: Activate alarm, evacuate exclusion zone, assess damage, document incident
CRANE INSTABILITY: Stop operation, lower load safely, investigate ground conditions
PERSONNEL INJURY: Activate first aid procedures, call emergency services, document incident
EQUIPMENT FAILURE: Stop operation, secure load, investigate failure, do not resume until repaired
    `,
    equipmentUsed: 'Mobile crane (25-100 tonne capacity), wire rope slings, shackles, spreader bars, rigging hardware',
    typicalWeight: '5-50 tonnes',
    typicalHeight: '10-50 metres',
    specialConsiderations: 'Requires certified crane operator, load charts must be consulted, weather monitoring essential',
    ppe: [
      'Hard hat/Safety helmet',
      'High-visibility vest/jacket',
      'Safety boots/footwear',
      'Safety glasses/goggles',
      'Hearing protection',
      'Work gloves'
    ],
    permits: {
      permitToWork: true,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false
    },
    equipmentChecks: {
      craneInspection: true,
      riggingInspection: true,
      loadTestCertificate: true
    }
  },

  towerCrane: {
    id: 'towerCrane',
    name: 'Tower Crane Lift',
    description: 'Lifting operations using fixed tower cranes for high-rise construction projects',
    hazards: [
      'Overhead power lines and electrical hazards',
      'Load swing at height',
      'Load drop from height',
      'Crane structural failure',
      'Wind-induced load movement',
      'Inadequate rigging or slinging',
      'Personnel in drop zones',
      'Visibility limitations',
      'Communication failures',
      'Fatigue of crane operator'
    ],
    controlMeasures: `
1. Structural inspection: Regular inspection of tower, boom, and mechanical systems
2. Load calculations: Verify load weight and center of gravity
3. Rigging inspection: Check all slings, shackles, and hardware
4. Wind monitoring: Cease operations if wind speed exceeds 10 m/s at height
5. Exclusion zones: Establish and enforce drop zones below crane
6. Communication: Use dedicated radio channels with clear protocols
7. Operator rest: Ensure operator has adequate rest periods
8. Load testing: Perform test lifts before full operation
9. Visual inspection: Continuous monitoring of load and rigging
10. Emergency procedures: Have rescue and evacuation procedures in place
    `,
    methodStatement: `
STEP 1: PRE-OPERATION PHASE
- Verify tower crane structural integrity
- Inspect all mechanical and electrical systems
- Confirm load weight and rigging configuration
- Check weather forecast and current conditions

STEP 2: SITE PREPARATION
- Clear drop zones of all personnel
- Establish communication with ground personnel
- Position spotters at key locations
- Verify load is properly secured to hook

STEP 3: LIFTING OPERATION
- Perform test lift to 5 meters height
- Verify load stability and rigging integrity
- Proceed with controlled lift at slow speed
- Monitor load continuously during operation
- Lower load carefully to final position

STEP 4: POST-OPERATION
- Secure load in final position
- Inspect rigging for damage or wear
- Document operation and any issues
- Conduct debrief with team
    `,
    emergencyProcedures: `
STRUCTURAL FAILURE: Immediately evacuate area, call emergency services, do not attempt repairs
LOAD DROP: Activate alarm, evacuate drop zones, assess damage, document incident
WIND HAZARD: Stop operation, secure load, wait for wind to decrease
OPERATOR INCAPACITY: Stop operation, lower load safely, provide medical assistance
ELECTRICAL HAZARD: Do not touch crane, call emergency services, evacuate area
    `,
    equipmentUsed: 'Tower crane (50-300 tonne capacity), wire rope slings, shackles, spreader bars, load cells',
    typicalWeight: '10-100 tonnes',
    typicalHeight: '50-200 metres',
    specialConsiderations: 'Requires certified tower crane operator, daily structural inspection, weather monitoring critical',
    ppe: [
      'Hard hat/Safety helmet',
      'High-visibility vest/jacket',
      'Safety boots/footwear',
      'Safety glasses/goggles',
      'Hearing protection',
      'Work gloves',
      'Fall arrest harness (for personnel at height)'
    ],
    permits: {
      permitToWork: true,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false
    },
    equipmentChecks: {
      craneInspection: true,
      riggingInspection: true,
      loadTestCertificate: true
    }
  },

  overheadCrane: {
    id: 'overheadCrane',
    name: 'Overhead Crane Lift',
    description: 'Lifting operations using fixed overhead cranes in industrial facilities and warehouses',
    hazards: [
      'Load drop on personnel below',
      'Crane structural failure',
      'Electrical hazards from power supply',
      'Inadequate rigging',
      'Personnel in load path',
      'Visibility limitations',
      'Communication failures',
      'Mechanical failure of hoist',
      'Overloading of crane',
      'Inadequate maintenance'
    ],
    controlMeasures: `
1. Load verification: Confirm load weight does not exceed crane capacity
2. Rigging inspection: Check all slings, hooks, and hardware
3. Exclusion zones: Establish and enforce areas below crane path
4. Communication: Use clear hand signals and radio communication
5. Spotters: Position spotters to guide load and monitor personnel
6. Maintenance: Perform regular maintenance and inspections
7. Load testing: Perform test lifts before full operation
8. Personnel training: Ensure all personnel understand hazards
9. Visual inspection: Continuous monitoring of load and rigging
10. Emergency procedures: Have rescue procedures in place
    `,
    methodStatement: `
STEP 1: PRE-OPERATION PHASE
- Verify crane is in good working condition
- Inspect all mechanical and electrical components
- Confirm load weight and rigging configuration
- Clear area below crane of all personnel

STEP 2: SITE PREPARATION
- Establish communication with ground personnel
- Position spotters at key locations
- Verify load is properly secured to hook
- Activate warning lights and alarms

STEP 3: LIFTING OPERATION
- Perform test lift to 1 meter height
- Verify load stability and rigging integrity
- Proceed with controlled lift at slow speed
- Monitor load continuously during operation
- Lower load carefully to final position

STEP 4: POST-OPERATION
- Secure load in final position
- Inspect rigging for damage
- Document operation and any issues
- Conduct debrief with team
    `,
    emergencyProcedures: `
LOAD DROP: Activate alarm, evacuate area below crane, assess damage, document incident
MECHANICAL FAILURE: Stop operation, lower load safely, do not attempt repairs
ELECTRICAL HAZARD: Do not touch crane, call emergency services, evacuate area
PERSONNEL INJURY: Activate first aid procedures, call emergency services, document incident
OVERLOAD CONDITION: Stop operation, reduce load, verify weight before resuming
    `,
    equipmentUsed: 'Overhead crane (5-50 tonne capacity), wire rope slings, shackles, spreader bars, load cells',
    typicalWeight: '1-30 tonnes',
    typicalHeight: '5-20 metres',
    specialConsiderations: 'Requires certified crane operator, daily inspection of hoist and trolley, load charts must be visible',
    ppe: [
      'Hard hat/Safety helmet',
      'High-visibility vest/jacket',
      'Safety boots/footwear',
      'Safety glasses/goggles',
      'Hearing protection',
      'Work gloves'
    ],
    permits: {
      permitToWork: true,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false
    },
    equipmentChecks: {
      craneInspection: true,
      riggingInspection: true,
      loadTestCertificate: true
    }
  },

  rigginOperations: {
    id: 'rigginOperations',
    name: 'Rigging Operations',
    description: 'Manual and mechanical rigging operations for load securing and positioning',
    hazards: [
      'Crush injuries from load movement',
      'Strain injuries from manual handling',
      'Inadequate rigging causing load drop',
      'Entanglement in rigging equipment',
      'Load swing and rotation',
      'Inadequate communication',
      'Fatigue of rigging personnel',
      'Inadequate training',
      'Environmental hazards',
      'Equipment failure'
    ],
    controlMeasures: `
1. Personnel training: Ensure all riggers are trained and competent
2. Load assessment: Verify load weight, dimensions, and center of gravity
3. Rigging plan: Develop detailed rigging plan before operation
4. Equipment inspection: Check all slings, shackles, and hardware
5. Load testing: Perform test lifts before full operation
6. Communication: Use clear hand signals and radio communication
7. Exclusion zones: Establish and enforce areas around load
8. Spotters: Position spotters to guide load and monitor personnel
9. Continuous monitoring: Inspect rigging during operation
10. Emergency procedures: Have rescue procedures in place
    `,
    methodStatement: `
STEP 1: PRE-OPERATION PHASE
- Assess load weight, dimensions, and center of gravity
- Develop rigging plan with appropriate slings and hardware
- Inspect all rigging equipment for damage or wear
- Brief all personnel on rigging plan and hazards

STEP 2: RIGGING PREPARATION
- Position load on stable surface
- Attach slings according to rigging plan
- Verify all connections are secure
- Perform visual inspection of rigging

STEP 3: LIFTING OPERATION
- Perform test lift to 0.5 meter height
- Verify load stability and rigging integrity
- Proceed with controlled lift at slow speed
- Monitor load continuously during operation
- Lower load carefully to final position

STEP 4: POST-OPERATION
- Secure load in final position
- Remove rigging equipment
- Inspect rigging for damage
- Document operation and any issues
    `,
    emergencyProcedures: `
RIGGING FAILURE: Stop operation immediately, lower load safely, assess damage
LOAD DROP: Evacuate area, assess damage, document incident, investigate cause
PERSONNEL INJURY: Activate first aid procedures, call emergency services, document incident
LOAD INSTABILITY: Stop operation, stabilize load, investigate cause before resuming
    `,
    equipmentUsed: 'Wire rope slings, synthetic slings, shackles, spreader bars, load cells, rigging hardware',
    typicalWeight: '0.5-50 tonnes',
    typicalHeight: '0-30 metres',
    specialConsiderations: 'Requires trained riggers, load charts must be consulted, proper slinging techniques essential',
    ppe: [
      'Hard hat/Safety helmet',
      'High-visibility vest/jacket',
      'Safety boots/footwear',
      'Safety glasses/goggles',
      'Hearing protection',
      'Work gloves',
      'Steel-toed boots'
    ],
    permits: {
      permitToWork: true,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false
    },
    equipmentChecks: {
      craneInspection: false,
      riggingInspection: true,
      loadTestCertificate: true
    }
  },

  heavyMachineryInstallation: {
    id: 'heavyMachineryInstallation',
    name: 'Heavy Machinery Installation',
    description: 'Installation of heavy industrial machinery and equipment',
    hazards: [
      'Load drop during installation',
      'Machinery movement during positioning',
      'Electrical hazards from machinery',
      'Crush injuries from machinery',
      'Inadequate rigging or slinging',
      'Personnel in machinery path',
      'Visibility limitations',
      'Communication failures',
      'Environmental hazards',
      'Inadequate training'
    ],
    controlMeasures: `
1. Pre-installation planning: Develop detailed installation plan
2. Load assessment: Verify machinery weight and center of gravity
3. Rigging inspection: Check all slings, shackles, and hardware
4. Exclusion zones: Establish and enforce areas around machinery
5. Communication: Use dedicated radio channels with clear protocols
6. Spotters: Position spotters to guide machinery and monitor personnel
7. Load testing: Perform test lifts before full operation
8. Electrical safety: Verify machinery is de-energized before work
9. Continuous monitoring: Inspect rigging and machinery during operation
10. Emergency procedures: Have rescue and evacuation procedures in place
    `,
    methodStatement: `
STEP 1: PRE-OPERATION PHASE
- Review machinery installation manual and specifications
- Verify machinery weight and center of gravity
- Develop detailed installation plan with rigging diagram
- Inspect all rigging equipment and machinery

STEP 2: SITE PREPARATION
- Clear installation area of all personnel
- Position machinery on stable, level surface
- Establish communication with ground personnel
- Verify machinery is de-energized and safe

STEP 3: LIFTING OPERATION
- Perform test lift to 1 meter height
- Verify load stability and rigging integrity
- Proceed with controlled lift at slow speed
- Monitor machinery continuously during operation
- Lower machinery carefully to final position

STEP 4: POST-OPERATION
- Secure machinery in final position
- Remove rigging equipment
- Inspect machinery for damage
- Perform machinery commissioning checks
    `,
    emergencyProcedures: `
LOAD DROP: Immediately stop operation, evacuate area, assess damage, document incident
MACHINERY INSTABILITY: Stop operation, stabilize machinery, investigate cause
ELECTRICAL HAZARD: Do not touch machinery, call emergency services, evacuate area
PERSONNEL INJURY: Activate first aid procedures, call emergency services, document incident
RIGGING FAILURE: Stop operation immediately, lower machinery safely, assess damage
    `,
    equipmentUsed: 'Heavy-duty wire rope slings, shackles, spreader bars, load cells, rigging hardware, machinery dollies',
    typicalWeight: '10-200 tonnes',
    typicalHeight: '5-50 metres',
    specialConsiderations: 'Requires certified riggers and machinery specialists, detailed installation manual required, machinery de-energization essential',
    ppe: [
      'Hard hat/Safety helmet',
      'High-visibility vest/jacket',
      'Safety boots/footwear',
      'Safety glasses/goggles',
      'Hearing protection',
      'Work gloves',
      'Steel-toed boots',
      'Respiratory protection (if required)'
    ],
    permits: {
      permitToWork: true,
      hotWorkPermit: false,
      confinedSpacePermit: false,
      roadClosurePermit: false
    },
    equipmentChecks: {
      craneInspection: true,
      riggingInspection: true,
      loadTestCertificate: true
    }
  }
}

export function getLiftCategoryTemplate(categoryId: string): LiftCategoryTemplate | undefined {
  return liftCategoryTemplates[categoryId]
}

export function getAllLiftCategories(): LiftCategoryTemplate[] {
  return Object.values(liftCategoryTemplates)
}

export function getLiftCategoryNames(): Array<{ id: string; name: string }> {
  return Object.values(liftCategoryTemplates).map(template => ({
    id: template.id,
    name: template.name
  }))
}

