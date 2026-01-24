// Comprehensive Mobile Crane Models Database for Lift Planner Pro

export interface CraneSpecifications {
  id: string
  manufacturer: string
  model: string
  type: 'crawler' | 'truck' | 'all-terrain' | 'rough-terrain' | 'city' | 'tandem'
  category: 'mobile' | 'tower' | 'overhead'

  // Basic Specifications
  maxCapacity: number // tonnes
  maxRadius: number // meters
  maxHeight: number // meters

  // Physical Dimensions
  dimensions: {
    length: number // mm
    width: number // mm
    height: number // mm
    weight: number // tonnes
    trackWidth?: number // mm (for crawler cranes)
    wheelbase?: number // mm (for truck cranes)
  }

  // Boom Specifications
  boom: {
    baseLength: number // meters
    maxLength: number // meters
    sections: number
    luffingAngle: {
      min: number // degrees
      max: number // degrees
    }
    telescopic: boolean
  }

  // Jib Specifications (if applicable)
  jib?: {
    length: number // meters
    offset: number // degrees
    capacity: number // tonnes
  }

  // Load Chart Data
  loadChart: {
    radius: number // meters
    capacity: number // tonnes
    height?: number // meters
  }[]

  // Engine & Performance
  engine: {
    manufacturer: string
    model: string
    power: number // kW
    fuelType: 'diesel' | 'electric' | 'hybrid'
    emissions: string
  }

  // Operational Data
  operational: {
    workingSpeed: {
      hoist: number // m/min
      boom: number // degrees/min
      swing: number // rpm
      travel: number // km/h
    }
    gradeability: number // %
    groundPressure: number // kPa
  }

  // Safety Features
  safety: {
    loadMomentIndicator: boolean
    antiTwoBlock: boolean
    outriggerMonitoring: boolean
    windSpeedIndicator: boolean
    loadBlockProtection: boolean
  }

  // CAD Drawing Data
  cadData: {
    basePoints: Point[]
    boomPoints: Point[]
    counterweightPoints: Point[]
    cabPoints: Point[]
    trackPoints?: Point[]
    outriggerPoints?: Point[]
    scale: number
    color: string
    lineWeight: number
  }

  // Wireframe mode for technical drawings
  wireframe?: boolean
  wireframeType?: 'mobile' | 'tower' | 'crawler'

  // Certification & Standards
  certification: {
    standards: string[]
    certificationBody: string
    validUntil?: string
  }

  // Custom Parts Assembly (for user-built cranes)
  customParts?: {
    id: string
    type: 'chassis' | 'boom' | 'counterweight' | 'outrigger' | 'cab' | 'jib' | 'turntable' | 'hook'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    color: string
    zIndex: number
    label: string
  }[]
}

export interface Point {
  x: number
  y: number
}

// Detailed Mobile Crane Models Database
export const MOBILE_CRANE_MODELS: CraneSpecifications[] = [
  // Plan View Mobile Crane (Top-Down)
  {
    id: 'ltm1300-plan',
    manufacturer: 'Liebherr',
    model: 'LTM 1300 (Plan View)',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 300,
    maxRadius: 60,
    maxHeight: 80,

    dimensions: {
      length: 12000,
      width: 3000,
      height: 3800,
      weight: 48000
    },

    boom: {
      baseLength: 40,
      maxLength: 80,
      sections: 4,
      luffingAngle: { min: 0, max: 360 }, // repurposed as rotation range for plan view
      telescopic: true
    },

    jib: {
      length: 0,
      offset: 0,
      capacity: 0
    },

    loadChart: [
      { radius: 3, capacity: 300 },
      { radius: 10, capacity: 220 },
      { radius: 20, capacity: 150 },
      { radius: 30, capacity: 100 },
      { radius: 40, capacity: 70 }
    ],

    engine: { manufacturer: 'Liebherr', model: 'Diesel', power: 400, fuelType: 'diesel', emissions: 'Tier 4 Final' },

    operational: { workingSpeed: { hoist: 120, boom: 2.0, swing: 2.5, travel: 2.0 }, gradeability: 60, groundPressure: 70 },

    safety: { loadMomentIndicator: true, antiTwoBlock: true, outriggerMonitoring: true, windSpeedIndicator: true, loadBlockProtection: true },

    cadData: {
      scale: 1.0,
      color: '#FFD700',
      lineWeight: 2,
      basePoints: [ { x: -100, y: -15 }, { x: 100, y: -15 }, { x: 100, y: 15 }, { x: -100, y: 15 } ],
      cabPoints: [ { x: 70, y: -12 }, { x: 95, y: -12 }, { x: 95, y: 12 }, { x: 70, y: 12 } ],
      counterweightPoints: [ { x: -100, y: -12 }, { x: -75, y: -12 }, { x: -75, y: 12 }, { x: -100, y: 12 } ],
      boomPoints: [ { x: 0, y: 0 } ],
      outriggerPoints: [ { x: -90, y: -15 }, { x: 90, y: -15 }, { x: 90, y: 15 }, { x: -90, y: 15 } ]
    },

    certification: { standards: ['EN 13000', 'ANSI B30.5'], certificationBody: 'Liebherr' }
  },

  // Aguilar livery plan-view mobile crane (matching the user's reference colors)
  {
    id: 'aguilar-ltm1300-plan',
    manufacturer: 'Liebherr',
    model: 'LTM 1300 – Aguilar (Plan View)',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 300,
    maxRadius: 60,
    maxHeight: 80,

    dimensions: {
      length: 12000,
      width: 3000,
      height: 3800,
      weight: 48000
    },

    boom: {
      baseLength: 40,
      maxLength: 80,
      sections: 4,
      luffingAngle: { min: 0, max: 360 },
      telescopic: true
    },

    loadChart: [
      { radius: 3, capacity: 300 },
      { radius: 10, capacity: 220 },
      { radius: 20, capacity: 150 },
      { radius: 30, capacity: 100 },
      { radius: 40, capacity: 70 }
    ],

    engine: { manufacturer: 'Liebherr', model: 'Diesel', power: 400, fuelType: 'diesel', emissions: 'Tier 4 Final' },

    operational: { workingSpeed: { hoist: 120, boom: 2.0, swing: 2.5, travel: 2.0 }, gradeability: 60, groundPressure: 70 },

    safety: { loadMomentIndicator: true, antiTwoBlock: true, outriggerMonitoring: true, windSpeedIndicator: true, loadBlockProtection: true },

    cadData: {
      scale: 1.0,
      // Aguilar: green/yellow scheme – base in green, boom in yellow
      color: '#2E8B57',
      lineWeight: 2,
      basePoints: [ { x: -100, y: -15 }, { x: 100, y: -15 }, { x: 100, y: 15 }, { x: -100, y: 15 } ],
      cabPoints: [ { x: 70, y: -12 }, { x: 95, y: -12 }, { x: 95, y: 12 }, { x: 70, y: 12 } ],
      counterweightPoints: [ { x: -100, y: -12 }, { x: -75, y: -12 }, { x: -75, y: 12 }, { x: -100, y: 12 } ],
      boomPoints: [ { x: 0, y: 0 } ],
      outriggerPoints: [ { x: -90, y: -15 }, { x: 90, y: -15 }, { x: 90, y: 15 }, { x: -90, y: 15 } ]
    },

    certification: { standards: ['EN 13000', 'ANSI B30.5'], certificationBody: 'Liebherr' }
  },


  {
    id: 'kobelco-ck1000g',
    manufacturer: 'Kobelco',
    model: 'CK1000G-3',
    type: 'crawler',
    category: 'mobile',
    maxCapacity: 100,
    maxRadius: 56,
    maxHeight: 78,

    dimensions: {
      length: 12500,
      width: 4200,
      height: 3850,
      weight: 95.5,
      trackWidth: 4200
    },

    boom: {
      baseLength: 15.2,
      maxLength: 56,
      sections: 5,
      luffingAngle: {
        min: -5,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 18,
      offset: 30,
      capacity: 12
    },

    loadChart: [
      { radius: 3, capacity: 100 },
      { radius: 5, capacity: 85 },
      { radius: 8, capacity: 65 },
      { radius: 12, capacity: 45 },
      { radius: 16, capacity: 32 },
      { radius: 20, capacity: 24 },
      { radius: 25, capacity: 18 },
      { radius: 30, capacity: 14 },
      { radius: 35, capacity: 11 },
      { radius: 40, capacity: 8.5 },
      { radius: 45, capacity: 6.8 },
      { radius: 50, capacity: 5.5 },
      { radius: 56, capacity: 4.2 }
    ],

    engine: {
      manufacturer: 'Hino',
      model: 'J08E-WD',
      power: 202,
      fuelType: 'diesel',
      emissions: 'Tier 4 Final'
    },

    operational: {
      workingSpeed: {
        hoist: 130,
        boom: 2.5,
        swing: 2.3,
        travel: 2.2
      },
      gradeability: 58,
      groundPressure: 67
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: 0, y: 0 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: 0, y: 0 }],
      cabPoints: [{ x: 0, y: 0 }],
      trackPoints: [{ x: 0, y: 0 }],
      scale: 1.0,
      color: '#FFD700',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'JIS B 8841'],
      certificationBody: 'TÜV SÜD',
      validUntil: '2025-12-31'
    }
  },

  {
    id: 'liebherr-ltm1300',
    manufacturer: 'Liebherr',
    model: 'LTM 1300-6.2',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 300,
    maxRadius: 68,
    maxHeight: 92,

    dimensions: {
      length: 18735,
      width: 3000,
      height: 4000,
      weight: 72,
      wheelbase: 8450
    },

    boom: {
      baseLength: 15.5,
      maxLength: 68,
      sections: 7,
      luffingAngle: {
        min: 0,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 19,
      offset: 40,
      capacity: 25
    },

    loadChart: [
      { radius: 3, capacity: 300 },
      { radius: 5, capacity: 240 },
      { radius: 8, capacity: 180 },
      { radius: 12, capacity: 120 },
      { radius: 16, capacity: 85 },
      { radius: 20, capacity: 65 },
      { radius: 25, capacity: 48 },
      { radius: 30, capacity: 37 },
      { radius: 35, capacity: 29 },
      { radius: 40, capacity: 23 },
      { radius: 45, capacity: 19 },
      { radius: 50, capacity: 15.5 },
      { radius: 55, capacity: 12.8 },
      { radius: 60, capacity: 10.5 },
      { radius: 68, capacity: 7.2 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D936L A7',
      power: 400,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: {
        hoist: 150,
        boom: 3.0,
        swing: 2.5,
        travel: 85
      },
      gradeability: 70,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: 0, y: 0 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: 0, y: 0 }],
      cabPoints: [{ x: 0, y: 0 }],
      outriggerPoints: [{ x: 0, y: 0 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'tadano-gr1000xl',
    manufacturer: 'Tadano',
    model: 'GR-1000XL-4',
    type: 'rough-terrain',
    category: 'mobile',
    maxCapacity: 100,
    maxRadius: 48,
    maxHeight: 65,

    dimensions: {
      length: 12800,
      width: 2900,
      height: 3850,
      weight: 52,
      wheelbase: 4200
    },

    boom: {
      baseLength: 12.2,
      maxLength: 48.8,
      sections: 4,
      luffingAngle: {
        min: -2,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 16.8,
      offset: 25,
      capacity: 15
    },

    loadChart: [
      { radius: 3, capacity: 100 },
      { radius: 5, capacity: 82 },
      { radius: 8, capacity: 58 },
      { radius: 12, capacity: 38 },
      { radius: 16, capacity: 27 },
      { radius: 20, capacity: 20 },
      { radius: 25, capacity: 15 },
      { radius: 30, capacity: 11.5 },
      { radius: 35, capacity: 9 },
      { radius: 40, capacity: 7.2 },
      { radius: 45, capacity: 5.8 },
      { radius: 48, capacity: 5.1 }
    ],

    engine: {
      manufacturer: 'Cummins',
      model: 'QSB6.7',
      power: 205,
      fuelType: 'diesel',
      emissions: 'Tier 4 Final'
    },

    operational: {
      workingSpeed: {
        hoist: 137,
        boom: 2.8,
        swing: 2.1,
        travel: 40
      },
      gradeability: 60,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: false,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [
        { x: 0, y: 0 }, { x: 128, y: 0 }, { x: 128, y: 29 }, { x: 0, y: 29 }
      ],
      boomPoints: [
        { x: 64, y: 14.5 }, { x: 64, y: 38.5 }, { x: 488, y: 350 }
      ],
      counterweightPoints: [
        { x: 12, y: 6 }, { x: 45, y: 6 }, { x: 45, y: 23 }, { x: 12, y: 23 }
      ],
      cabPoints: [
        { x: 75, y: 12 }, { x: 105, y: 12 }, { x: 105, y: 27 }, { x: 75, y: 27 }
      ],
      outriggerPoints: [
        { x: -15, y: -8 }, { x: 143, y: -8 }, { x: 143, y: 37 }, { x: -15, y: 37 }
      ],
      scale: 1.0,
      color: '#FF6B35',
      lineWeight: 2
    },

    certification: {
      standards: ['ASME B30.5', 'SAE J1063', 'OSHA'],
      certificationBody: 'ETL'
    }
  },

  {
    id: 'grove-gmk5250l',
    manufacturer: 'Grove',
    model: 'GMK5250L',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 250,
    maxRadius: 64,
    maxHeight: 84,

    dimensions: {
      length: 16900,
      width: 3000,
      height: 3950,
      weight: 60,
      wheelbase: 7200
    },

    boom: {
      baseLength: 15.9,
      maxLength: 64,
      sections: 6,
      luffingAngle: {
        min: 0,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 20,
      offset: 35,
      capacity: 20
    },

    loadChart: [
      { radius: 3, capacity: 250 },
      { radius: 5, capacity: 200 },
      { radius: 8, capacity: 145 },
      { radius: 12, capacity: 95 },
      { radius: 16, capacity: 68 },
      { radius: 20, capacity: 52 },
      { radius: 25, capacity: 38 },
      { radius: 30, capacity: 29 },
      { radius: 35, capacity: 23 },
      { radius: 40, capacity: 18.5 },
      { radius: 45, capacity: 15 },
      { radius: 50, capacity: 12.5 },
      { radius: 55, capacity: 10.2 },
      { radius: 60, capacity: 8.5 },
      { radius: 64, capacity: 7.1 }
    ],

    engine: {
      manufacturer: 'Mercedes-Benz',
      model: 'OM471LA',
      power: 390,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: {
        hoist: 145,
        boom: 2.9,
        swing: 2.4,
        travel: 80
      },
      gradeability: 75,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [
        { x: 0, y: 0 }, { x: 169, y: 0 }, { x: 169, y: 30 }, { x: 0, y: 30 }
      ],
      boomPoints: [
        { x: 84.5, y: 15 }, { x: 84.5, y: 39.5 }, { x: 640, y: 395 }
      ],
      counterweightPoints: [
        { x: 14, y: 7 }, { x: 55, y: 7 }, { x: 55, y: 23 }, { x: 14, y: 23 }
      ],
      cabPoints: [
        { x: 110, y: 10 }, { x: 140, y: 10 }, { x: 140, y: 25 }, { x: 110, y: 25 }
      ],
      outriggerPoints: [
        { x: -18, y: -9 }, { x: 187, y: -9 }, { x: 187, y: 39 }, { x: -18, y: 39 }
      ],
      scale: 1.0,
      color: '#228B22',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV SÜD'
    }
  },

  {
    id: 'manitowoc-18000',
    manufacturer: 'Manitowoc',
    model: '18000',
    type: 'crawler',
    category: 'mobile',
    maxCapacity: 680,
    maxRadius: 84,
    maxHeight: 120,

    dimensions: {
      length: 18500,
      width: 6100,
      height: 4200,
      weight: 340,
      trackWidth: 6100
    },

    boom: {
      baseLength: 18.3,
      maxLength: 84,
      sections: 7,
      luffingAngle: {
        min: -3,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 24,
      offset: 45,
      capacity: 45
    },

    loadChart: [
      { radius: 4, capacity: 680 },
      { radius: 6, capacity: 520 },
      { radius: 8, capacity: 380 },
      { radius: 12, capacity: 240 },
      { radius: 16, capacity: 170 },
      { radius: 20, capacity: 125 },
      { radius: 25, capacity: 95 },
      { radius: 30, capacity: 75 },
      { radius: 35, capacity: 60 },
      { radius: 40, capacity: 48 },
      { radius: 50, capacity: 35 },
      { radius: 60, capacity: 26 },
      { radius: 70, capacity: 20 },
      { radius: 84, capacity: 14 }
    ],

    engine: {
      manufacturer: 'Caterpillar',
      model: 'C18 ACERT',
      power: 522,
      fuelType: 'diesel',
      emissions: 'Tier 4 Final'
    },

    operational: {
      workingSpeed: {
        hoist: 180,
        boom: 1.8,
        swing: 1.5,
        travel: 1.6
      },
      gradeability: 40,
      groundPressure: 89
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: false,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [
        { x: 0, y: 0 }, { x: 185, y: 0 }, { x: 185, y: 61 }, { x: 0, y: 61 }
      ],
      boomPoints: [
        { x: 92.5, y: 30.5 }, { x: 92.5, y: 42 }, { x: 840, y: 420 }
      ],
      counterweightPoints: [
        { x: 20, y: 15 }, { x: 80, y: 15 }, { x: 80, y: 46 }, { x: 20, y: 46 }
      ],
      cabPoints: [
        { x: 120, y: 20 }, { x: 155, y: 20 }, { x: 155, y: 41 }, { x: 120, y: 41 }
      ],
      trackPoints: [
        { x: -10, y: -5 }, { x: 195, y: -5 }, { x: 195, y: 66 }, { x: -10, y: 66 }
      ],
      scale: 1.0,
      color: '#FF4500',
      lineWeight: 3
    },

    certification: {
      standards: ['ASME B30.5', 'OSHA', 'API 2C'],
      certificationBody: 'ETL'
    }
  },

  {
    id: 'terex-rt780',
    manufacturer: 'Terex',
    model: 'RT 780',
    type: 'rough-terrain',
    category: 'mobile',
    maxCapacity: 80,
    maxRadius: 42,
    maxHeight: 58,

    dimensions: {
      length: 11900,
      width: 2750,
      height: 3800,
      weight: 48,
      wheelbase: 3800
    },

    boom: {
      baseLength: 11.6,
      maxLength: 42.7,
      sections: 4,
      luffingAngle: {
        min: -2,
        max: 85
      },
      telescopic: true
    },

    jib: {
      length: 15.2,
      offset: 30,
      capacity: 12
    },

    loadChart: [
      { radius: 3, capacity: 80 },
      { radius: 5, capacity: 65 },
      { radius: 8, capacity: 45 },
      { radius: 12, capacity: 30 },
      { radius: 16, capacity: 22 },
      { radius: 20, capacity: 17 },
      { radius: 25, capacity: 13 },
      { radius: 30, capacity: 10 },
      { radius: 35, capacity: 8 },
      { radius: 40, capacity: 6.5 },
      { radius: 42, capacity: 5.8 }
    ],

    engine: {
      manufacturer: 'Deutz',
      model: 'TCD 6.1 L6',
      power: 180,
      fuelType: 'diesel',
      emissions: 'Tier 4 Final'
    },

    operational: {
      workingSpeed: {
        hoist: 125,
        boom: 2.5,
        swing: 2.0,
        travel: 38
      },
      gradeability: 58,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: false,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [
        { x: 0, y: 0 }, { x: 119, y: 0 }, { x: 119, y: 27.5 }, { x: 0, y: 27.5 }
      ],
      boomPoints: [
        { x: 59.5, y: 13.75 }, { x: 59.5, y: 38 }, { x: 427, y: 330 }
      ],
      counterweightPoints: [
        { x: 10, y: 5 }, { x: 40, y: 5 }, { x: 40, y: 22.5 }, { x: 10, y: 22.5 }
      ],
      cabPoints: [
        { x: 70, y: 10 }, { x: 95, y: 10 }, { x: 95, y: 25 }, { x: 70, y: 25 }
      ],
      outriggerPoints: [
        { x: -12, y: -6 }, { x: 131, y: -6 }, { x: 131, y: 33.5 }, { x: -12, y: 33.5 }
      ],
      scale: 2.0,
      color: '#32CD32',
      lineWeight: 2
    },

    certification: {
      standards: ['ASME B30.5', 'SAE J1063'],
      certificationBody: 'ETL'
    }
  },

  // Tandem Crane Configuration for Dual Lifts - Cranes Face Opposite Directions
  {
    id: 'tandem-dual-lift',
    manufacturer: 'Tandem',
    model: 'Dual Lift - Opposing Cranes',
    type: 'tandem',
    category: 'mobile',

    maxCapacity: 200, // Combined capacity
    maxRadius: 60,
    maxHeight: 80,

    dimensions: {
      length: 15000, // Combined length
      width: 3000,
      height: 4000,
      weight: 120 // Combined weight
    },

    boom: {
      baseLength: 12,
      maxLength: 60,
      sections: 5,
      luffingAngle: {
        min: -5,
        max: 85
      },
      telescopic: true
    },

    engine: {
      manufacturer: 'Various',
      model: 'Dual Configuration',
      power: 400, // Combined power
      fuelType: 'diesel',
      emissions: 'Stage V'
    },

    operational: {
      workingSpeed: {
        hoist: 100,
        boom: 2.0,
        swing: 2.0,
        travel: 2.0
      },
      gradeability: 60,
      groundPressure: 75
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      scale: 1.0,
      color: '#FF6B35',
      lineWeight: 3,
      basePoints: [ { x: -110, y: -15 }, { x: 110, y: -15 }, { x: 110, y: 15 }, { x: -110, y: 15 } ],
      cabPoints: [ { x: 70, y: -12 }, { x: 92, y: -12 }, { x: 92, y: 12 }, { x: 70, y: 12 } ],
      counterweightPoints: [ { x: -110, y: -12 }, { x: -82, y: -12 }, { x: -82, y: 12 }, { x: -110, y: 12 } ],
      boomPoints: [ { x: 15, y: 0 } ],
      outriggerPoints: [ { x: -95, y: -13 }, { x: 95, y: -13 }, { x: 95, y: 13 }, { x: -95, y: 13 } ]
    },

    loadChart: [
      { radius: 3, capacity: 200 },
      { radius: 5, capacity: 180 },
      { radius: 10, capacity: 150 },
      { radius: 15, capacity: 120 },
      { radius: 20, capacity: 100 },
      { radius: 25, capacity: 80 },
      { radius: 30, capacity: 65 },
      { radius: 35, capacity: 50 },
      { radius: 40, capacity: 40 },
      { radius: 45, capacity: 30 },
      { radius: 50, capacity: 25 },
      { radius: 55, capacity: 20 },
      { radius: 60, capacity: 15 }
    ],

    certification: {
      standards: ['ASME B30.5', 'EN 13000'],
      certificationBody: 'Multiple'
    }
  },

  // Liebherr LMT Mobile Cranes - 30t to 300t Series
  {
    id: 'liebherr-lmt30',
    manufacturer: 'Liebherr',
    model: 'LMT 30-1',
    type: 'truck',
    category: 'mobile',
    maxCapacity: 30,
    maxRadius: 28,
    maxHeight: 35,

    dimensions: {
      length: 9500,
      width: 2550,
      height: 3200,
      weight: 18,
      wheelbase: 5200
    },

    boom: {
      baseLength: 8.5,
      maxLength: 28,
      sections: 4,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart: [
      { radius: 2, capacity: 30 },
      { radius: 5, capacity: 25 },
      { radius: 8, capacity: 18 },
      { radius: 12, capacity: 12 },
      { radius: 16, capacity: 8 },
      { radius: 20, capacity: 5 },
      { radius: 28, capacity: 2 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D924',
      power: 180,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 100, boom: 2.5, swing: 2.0, travel: 80 },
      gradeability: 65,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -80, y: -12 }, { x: 80, y: -12 }, { x: 80, y: 12 }, { x: -80, y: 12 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -75, y: -10 }, { x: -50, y: -10 }, { x: -50, y: 10 }, { x: -75, y: 10 }],
      cabPoints: [{ x: 50, y: -10 }, { x: 75, y: -10 }, { x: 75, y: 10 }, { x: 50, y: 10 }],
      outriggerPoints: [{ x: -70, y: -12 }, { x: 70, y: -12 }, { x: 70, y: 12 }, { x: -70, y: 12 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'liebherr-lmt50',
    manufacturer: 'Liebherr',
    model: 'LMT 50-2',
    type: 'truck',
    category: 'mobile',
    maxCapacity: 50,
    maxRadius: 38,
    maxHeight: 48,

    dimensions: {
      length: 11200,
      width: 2700,
      height: 3600,
      weight: 28,
      wheelbase: 6200
    },

    boom: {
      baseLength: 10.5,
      maxLength: 38,
      sections: 5,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart: [
      { radius: 2, capacity: 50 },
      { radius: 5, capacity: 42 },
      { radius: 8, capacity: 32 },
      { radius: 12, capacity: 22 },
      { radius: 16, capacity: 15 },
      { radius: 20, capacity: 10 },
      { radius: 25, capacity: 6 },
      { radius: 38, capacity: 2 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D926',
      power: 250,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 120, boom: 2.8, swing: 2.2, travel: 85 },
      gradeability: 68,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -90, y: -13 }, { x: 90, y: -13 }, { x: 90, y: 13 }, { x: -90, y: 13 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -85, y: -11 }, { x: -55, y: -11 }, { x: -55, y: 11 }, { x: -85, y: 11 }],
      cabPoints: [{ x: 55, y: -11 }, { x: 85, y: -11 }, { x: 85, y: 11 }, { x: 55, y: 11 }],
      outriggerPoints: [{ x: -80, y: -13 }, { x: 80, y: -13 }, { x: 80, y: 13 }, { x: -80, y: 13 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'liebherr-lmt100',
    manufacturer: 'Liebherr',
    model: 'LMT 100-3.2',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 100,
    maxRadius: 48,
    maxHeight: 62,

    dimensions: {
      length: 13500,
      width: 2800,
      height: 3900,
      weight: 42,
      wheelbase: 7200
    },

    boom: {
      baseLength: 12.5,
      maxLength: 48,
      sections: 6,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart: [
      { radius: 3, capacity: 100 },
      { radius: 6, capacity: 85 },
      { radius: 10, capacity: 65 },
      { radius: 15, capacity: 45 },
      { radius: 20, capacity: 32 },
      { radius: 25, capacity: 22 },
      { radius: 30, capacity: 15 },
      { radius: 35, capacity: 10 },
      { radius: 40, capacity: 6 },
      { radius: 48, capacity: 3 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D934',
      power: 320,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 130, boom: 2.8, swing: 2.3, travel: 85 },
      gradeability: 70,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -100, y: -14 }, { x: 100, y: -14 }, { x: 100, y: 14 }, { x: -100, y: 14 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -95, y: -12 }, { x: -60, y: -12 }, { x: -60, y: 12 }, { x: -95, y: 12 }],
      cabPoints: [{ x: 60, y: -12 }, { x: 95, y: -12 }, { x: 95, y: 12 }, { x: 60, y: 12 }],
      outriggerPoints: [{ x: -90, y: -14 }, { x: 90, y: -14 }, { x: 90, y: 14 }, { x: -90, y: 14 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'liebherr-lmt150',
    manufacturer: 'Liebherr',
    model: 'LMT 150-5.3',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 150,
    maxRadius: 55,
    maxHeight: 72,

    dimensions: {
      length: 15200,
      width: 2900,
      height: 4100,
      weight: 55,
      wheelbase: 8000
    },

    boom: {
      baseLength: 14.0,
      maxLength: 55,
      sections: 6,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart: [
      { radius: 3, capacity: 150 },
      { radius: 6, capacity: 128 },
      { radius: 10, capacity: 98 },
      { radius: 15, capacity: 68 },
      { radius: 20, capacity: 48 },
      { radius: 25, capacity: 34 },
      { radius: 30, capacity: 24 },
      { radius: 35, capacity: 17 },
      { radius: 40, capacity: 12 },
      { radius: 45, capacity: 8 },
      { radius: 55, capacity: 4 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D936',
      power: 360,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 140, boom: 2.9, swing: 2.4, travel: 85 },
      gradeability: 70,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -105, y: -15 }, { x: 105, y: -15 }, { x: 105, y: 15 }, { x: -105, y: 15 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -100, y: -13 }, { x: -65, y: -13 }, { x: -65, y: 13 }, { x: -100, y: 13 }],
      cabPoints: [{ x: 65, y: -13 }, { x: 100, y: -13 }, { x: 100, y: 13 }, { x: 65, y: 13 }],
      outriggerPoints: [{ x: -95, y: -15 }, { x: 95, y: -15 }, { x: 95, y: 15 }, { x: -95, y: 15 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'liebherr-lmt200',
    manufacturer: 'Liebherr',
    model: 'LMT 200-6.2',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 200,
    maxRadius: 62,
    maxHeight: 82,

    dimensions: {
      length: 16800,
      width: 3000,
      height: 4300,
      weight: 65,
      wheelbase: 8500
    },

    boom: {
      baseLength: 15.5,
      maxLength: 62,
      sections: 7,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    loadChart: [
      { radius: 3, capacity: 200 },
      { radius: 6, capacity: 170 },
      { radius: 10, capacity: 130 },
      { radius: 15, capacity: 92 },
      { radius: 20, capacity: 65 },
      { radius: 25, capacity: 46 },
      { radius: 30, capacity: 33 },
      { radius: 35, capacity: 24 },
      { radius: 40, capacity: 17 },
      { radius: 45, capacity: 12 },
      { radius: 50, capacity: 8 },
      { radius: 62, capacity: 4 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D936L',
      power: 390,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 145, boom: 2.9, swing: 2.5, travel: 85 },
      gradeability: 70,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -110, y: -15 }, { x: 110, y: -15 }, { x: 110, y: 15 }, { x: -110, y: 15 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -105, y: -13 }, { x: -70, y: -13 }, { x: -70, y: 13 }, { x: -105, y: 13 }],
      cabPoints: [{ x: 70, y: -13 }, { x: 105, y: -13 }, { x: 105, y: 13 }, { x: 70, y: 13 }],
      outriggerPoints: [{ x: -100, y: -15 }, { x: 100, y: -15 }, { x: 100, y: 15 }, { x: -100, y: 15 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  {
    id: 'liebherr-lmt300',
    manufacturer: 'Liebherr',
    model: 'LMT 300-6.3',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 300,
    maxRadius: 68,
    maxHeight: 92,

    dimensions: {
      length: 18735,
      width: 3000,
      height: 4000,
      weight: 72,
      wheelbase: 8450
    },

    boom: {
      baseLength: 15.5,
      maxLength: 68,
      sections: 7,
      luffingAngle: { min: 0, max: 85 },
      telescopic: true
    },

    jib: {
      length: 19,
      offset: 40,
      capacity: 25
    },

    loadChart: [
      { radius: 3, capacity: 300 },
      { radius: 5, capacity: 240 },
      { radius: 8, capacity: 180 },
      { radius: 12, capacity: 120 },
      { radius: 16, capacity: 85 },
      { radius: 20, capacity: 65 },
      { radius: 25, capacity: 48 },
      { radius: 30, capacity: 37 },
      { radius: 35, capacity: 29 },
      { radius: 40, capacity: 23 },
      { radius: 45, capacity: 19 },
      { radius: 50, capacity: 15.5 },
      { radius: 55, capacity: 12.8 },
      { radius: 60, capacity: 10.5 },
      { radius: 68, capacity: 7.2 }
    ],

    engine: {
      manufacturer: 'Liebherr',
      model: 'D936L A7',
      power: 400,
      fuelType: 'diesel',
      emissions: 'EU Stage V'
    },

    operational: {
      workingSpeed: { hoist: 150, boom: 3.0, swing: 2.5, travel: 85 },
      gradeability: 70,
      groundPressure: 0
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -115, y: -16 }, { x: 115, y: -16 }, { x: 115, y: 16 }, { x: -115, y: 16 }],
      boomPoints: [{ x: 0, y: 0 }],
      counterweightPoints: [{ x: -110, y: -14 }, { x: -75, y: -14 }, { x: -75, y: 14 }, { x: -110, y: 14 }],
      cabPoints: [{ x: 75, y: -14 }, { x: 110, y: -14 }, { x: 110, y: 14 }, { x: 75, y: 14 }],
      outriggerPoints: [{ x: -105, y: -16 }, { x: 105, y: -16 }, { x: 105, y: 16 }, { x: -105, y: 16 }],
      scale: 1.0,
      color: '#0066CC',
      lineWeight: 2
    },

    certification: {
      standards: ['EN 13000', 'ASME B30.5', 'CE'],
      certificationBody: 'TÜV Rheinland'
    }
  },

  // ==========================================
  // WIREFRAME CRANE BLOCKS
  // Professional technical line drawings
  // ==========================================

  // Wireframe Mobile Crane (Truck Mounted)
  {
    id: 'wireframe-mobile',
    manufacturer: 'Wireframe',
    model: 'Mobile Crane (Technical)',
    type: 'all-terrain',
    category: 'mobile',
    maxCapacity: 100,
    maxRadius: 40,
    maxHeight: 50,
    wireframe: true,
    wireframeType: 'mobile',

    dimensions: {
      length: 12000,
      width: 2800,
      height: 3500,
      weight: 48000
    },

    boom: {
      baseLength: 15,
      maxLength: 60,
      sections: 5,
      luffingAngle: { min: 0, max: 82 },
      telescopic: true
    },

    loadChart: [
      { radius: 3, capacity: 100 },
      { radius: 6, capacity: 70 },
      { radius: 10, capacity: 45 },
      { radius: 15, capacity: 28 },
      { radius: 20, capacity: 18 },
      { radius: 30, capacity: 10 },
      { radius: 40, capacity: 5 }
    ],

    engine: {
      manufacturer: 'Generic',
      model: 'Diesel Engine',
      power: 350,
      fuelType: 'diesel',
      emissions: 'Stage V'
    },

    operational: {
      workingSpeed: { hoist: 80, boom: 50, swing: 2.5, travel: 80 },
      gradeability: 65,
      groundPressure: 180
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: true,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -90, y: -15 }, { x: 90, y: -15 }, { x: 90, y: 15 }, { x: -90, y: 15 }],
      boomPoints: [{ x: 0, y: -20 }],
      counterweightPoints: [{ x: -70, y: -25 }, { x: -35, y: -25 }, { x: -35, y: 0 }, { x: -70, y: 0 }],
      cabPoints: [{ x: 30, y: -35 }, { x: 60, y: -35 }, { x: 60, y: 0 }, { x: 30, y: 0 }],
      outriggerPoints: [{ x: -150, y: -15 }, { x: 150, y: -15 }, { x: 150, y: 50 }, { x: -150, y: 50 }],
      scale: 1.0,
      color: '#000000',
      lineWeight: 1.5
    },

    certification: {
      standards: ['Technical Drawing'],
      certificationBody: 'CAD Standard'
    }
  },

  // Wireframe Tower Crane
  {
    id: 'wireframe-tower',
    manufacturer: 'Wireframe',
    model: 'Tower Crane (Technical)',
    type: 'city',
    category: 'tower',
    maxCapacity: 12,
    maxRadius: 60,
    maxHeight: 80,
    wireframe: true,
    wireframeType: 'tower',

    dimensions: {
      length: 4000,
      width: 4000,
      height: 80000,
      weight: 150000
    },

    boom: {
      baseLength: 50,
      maxLength: 60,
      sections: 1,
      luffingAngle: { min: 0, max: 0 },
      telescopic: false
    },

    loadChart: [
      { radius: 10, capacity: 12 },
      { radius: 20, capacity: 8 },
      { radius: 30, capacity: 5 },
      { radius: 40, capacity: 3.5 },
      { radius: 50, capacity: 2.5 },
      { radius: 60, capacity: 1.8 }
    ],

    engine: {
      manufacturer: 'Generic',
      model: 'Electric Motor',
      power: 75,
      fuelType: 'electric',
      emissions: 'None'
    },

    operational: {
      workingSpeed: { hoist: 60, boom: 0, swing: 0.7, travel: 0 },
      gradeability: 0,
      groundPressure: 350
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: false,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -30, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 20 }, { x: -30, y: 20 }],
      boomPoints: [{ x: 0, y: -250 }],
      counterweightPoints: [{ x: -60, y: -255 }, { x: -30, y: -255 }, { x: -30, y: -230 }, { x: -60, y: -230 }],
      cabPoints: [{ x: -15, y: -235 }, { x: 15, y: -235 }, { x: 15, y: -210 }, { x: -15, y: -210 }],
      scale: 1.0,
      color: '#000000',
      lineWeight: 1.5
    },

    certification: {
      standards: ['Technical Drawing'],
      certificationBody: 'CAD Standard'
    }
  },

  // Wireframe Crawler Crane
  {
    id: 'wireframe-crawler',
    manufacturer: 'Wireframe',
    model: 'Crawler Crane (Technical)',
    type: 'crawler',
    category: 'mobile',
    maxCapacity: 250,
    maxRadius: 50,
    maxHeight: 100,
    wireframe: true,
    wireframeType: 'crawler',

    dimensions: {
      length: 12000,
      width: 8500,
      height: 4000,
      weight: 250000,
      trackWidth: 1200
    },

    boom: {
      baseLength: 30,
      maxLength: 90,
      sections: 6,
      luffingAngle: { min: 15, max: 85 },
      telescopic: false
    },

    loadChart: [
      { radius: 8, capacity: 250 },
      { radius: 12, capacity: 180 },
      { radius: 18, capacity: 120 },
      { radius: 24, capacity: 80 },
      { radius: 30, capacity: 55 },
      { radius: 40, capacity: 35 },
      { radius: 50, capacity: 20 }
    ],

    engine: {
      manufacturer: 'Generic',
      model: 'Diesel Engine',
      power: 600,
      fuelType: 'diesel',
      emissions: 'Stage V'
    },

    operational: {
      workingSpeed: { hoist: 100, boom: 40, swing: 1.5, travel: 1.5 },
      gradeability: 30,
      groundPressure: 85
    },

    safety: {
      loadMomentIndicator: true,
      antiTwoBlock: true,
      outriggerMonitoring: false,
      windSpeedIndicator: true,
      loadBlockProtection: true
    },

    cadData: {
      basePoints: [{ x: -80, y: 35 }, { x: 80, y: 35 }, { x: 80, y: 70 }, { x: -80, y: 70 }],
      boomPoints: [{ x: 15, y: -25 }],
      counterweightPoints: [{ x: -75, y: -20 }, { x: -45, y: -20 }, { x: -45, y: 20 }, { x: -75, y: 20 }],
      cabPoints: [{ x: 25, y: -15 }, { x: 50, y: -15 }, { x: 50, y: 15 }, { x: 25, y: 15 }],
      trackPoints: [{ x: -80, y: 35 }, { x: 80, y: 35 }, { x: 80, y: 70 }, { x: -80, y: 70 }],
      scale: 1.0,
      color: '#000000',
      lineWeight: 1.5
    },

    certification: {
      standards: ['Technical Drawing'],
      certificationBody: 'CAD Standard'
    }
  }
]

// Helper functions for crane operations
export const getCraneById = (id: string): CraneSpecifications | undefined => {
  return MOBILE_CRANE_MODELS.find(crane => crane.id === id)
}

export const getCranesByType = (type: string): CraneSpecifications[] => {
  return MOBILE_CRANE_MODELS.filter(crane => crane.type === type)
}

export const getCranesByManufacturer = (manufacturer: string): CraneSpecifications[] => {
  return MOBILE_CRANE_MODELS.filter(crane =>
    crane.manufacturer.toLowerCase() === manufacturer.toLowerCase()
  )
}

export const getLoadCapacityAtRadius = (crane: CraneSpecifications, radius: number): number => {
  const chart = crane.loadChart

  // Find exact match
  const exactMatch = chart.find(point => point.radius === radius)
  if (exactMatch) return exactMatch.capacity

  // Interpolate between two points
  const sortedChart = chart.sort((a, b) => a.radius - b.radius)

  for (let i = 0; i < sortedChart.length - 1; i++) {
    const current = sortedChart[i]
    const next = sortedChart[i + 1]

    if (radius >= current.radius && radius <= next.radius) {
      const ratio = (radius - current.radius) / (next.radius - current.radius)
      return current.capacity - (ratio * (current.capacity - next.capacity))
    }
  }

  return 0 // Outside working radius
}
