"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  Package,
  Anchor,
  Link,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  FileText,
  Calendar,
  Weight,
  Ruler,
  Award,
  BookOpen,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateObjectDialog } from "@/components/rigging/CreateObjectDialog"
import NextLink from "next/link"

// Rigging Equipment Types
interface RiggingEquipment {
  id: string
  name: string
  category: 'hoists' | 'slings' | 'shackles' | 'hooks' | 'blocks' | 'spreaders' | 'clamps' | 'eyebolts'
  type: string
  manufacturer: string
  model: string
  swl: number // Safe Working Load in tonnes
  breakingLoad: number // Breaking load in tonnes
  weight: number // Equipment weight in kg
  dimensions: {
    length?: number
    width?: number
    height?: number
    diameter?: number
  }
  specifications: {
    material: string
    finish: string
    standard: string
    certification: string[]
  }
  loadChart?: {
    angle: number
    capacity: number
  }[]
  image: string
  description: string
  safetyNotes: string[]
  inspectionRequirements: string[]
  applications: string[]
}

// Sample rigging equipment data
const riggingEquipmentData: RiggingEquipment[] = [
  {
    id: 'ch-001',
    name: 'Manual Chain Hoist',
    category: 'hoists',
    type: 'Chain Block',
    manufacturer: 'Yale',
    model: 'Yalelift 360',
    swl: 1.0,
    breakingLoad: 4.0,
    weight: 8.5,
    dimensions: {
      length: 280,
      width: 160,
      height: 320
    },
    specifications: {
      material: 'Alloy Steel',
      finish: 'Zinc Plated',
      standard: 'EN 13157',
      certification: ['CE', 'UKCA', 'LOLER']
    },
    loadChart: [
      { angle: 0, capacity: 1.0 },
      { angle: 30, capacity: 0.87 },
      { angle: 45, capacity: 0.71 },
      { angle: 60, capacity: 0.5 }
    ],
    image: '/api/placeholder/300/200',
    description: 'Professional manual chain hoist with 360° rotating hand chain guide. Features hardened load chain, precision machined load sheave, and automatic load brake.',
    safetyNotes: [
      'Never exceed Safe Working Load (SWL)',
      'Inspect before each use',
      'Ensure proper load chain alignment',
      'Do not use as a permanent fixture',
      'Avoid shock loading'
    ],
    inspectionRequirements: [
      'Daily visual inspection before use',
      'Weekly detailed inspection',
      'Annual thorough examination by competent person',
      'Load test every 6 months if used regularly'
    ],
    applications: [
      'General lifting and positioning',
      'Maintenance operations',
      'Assembly work',
      'Material handling'
    ]
  },
  {
    id: 'ws-001',
    name: 'Wire Rope Sling',
    category: 'slings',
    type: '4-Leg Wire Rope Sling',
    manufacturer: 'Bridon-Bekaert',
    model: 'Dyform 18',
    swl: 5.0,
    breakingLoad: 25.0,
    weight: 12.3,
    dimensions: {
      length: 2000,
      diameter: 16
    },
    specifications: {
      material: '6x36 IWRC Steel Wire Rope',
      finish: 'Galvanized',
      standard: 'BS EN 13414-1',
      certification: ['CE', 'UKCA', 'LOLER']
    },
    loadChart: [
      { angle: 0, capacity: 5.0 },
      { angle: 30, capacity: 4.33 },
      { angle: 45, capacity: 3.54 },
      { angle: 60, capacity: 2.5 },
      { angle: 90, capacity: 1.77 }
    ],
    image: '/api/placeholder/300/200',
    description: '4-leg wire rope sling with pressed ferrule eyes. High strength galvanized wire rope construction suitable for heavy lifting operations.',
    safetyNotes: [
      'Check for broken wires before use',
      'Protect from sharp edges',
      'Consider sling angle factor',
      'Do not drag on rough surfaces',
      'Store properly when not in use'
    ],
    inspectionRequirements: [
      'Pre-use visual inspection',
      'Monthly detailed inspection',
      'Annual thorough examination',
      'Immediate removal if damage found'
    ],
    applications: [
      'Heavy lifting operations',
      'Steel erection',
      'Precast concrete handling',
      'Industrial equipment installation'
    ]
  },
  {
    id: 'sh-001',
    name: 'Bow Shackle',
    category: 'shackles',
    type: 'Stainless Steel Bow Shackle',
    manufacturer: 'Crosby',
    model: 'G-416',
    swl: 3.25,
    breakingLoad: 19.5,
    weight: 0.85,
    dimensions: {
      length: 65,
      width: 35,
      diameter: 16
    },
    specifications: {
      material: '316 Stainless Steel',
      finish: 'Polished',
      standard: 'BS EN 13889',
      certification: ['CE', 'UKCA', 'ABS']
    },
    image: '/api/placeholder/300/200',
    description: 'High-grade stainless steel bow shackle with screw pin. Suitable for marine and corrosive environments.',
    safetyNotes: [
      'Ensure pin is fully engaged',
      'Check for wear and deformation',
      'Do not side load',
      'Use appropriate safety factor',
      'Regular inspection required'
    ],
    inspectionRequirements: [
      'Visual inspection before each use',
      'Check pin engagement',
      'Monthly dimensional checks',
      'Annual load testing if required'
    ],
    applications: [
      'Marine lifting operations',
      'Offshore applications',
      'Chemical plant operations',
      'Food industry lifting'
    ]
  },
  {
    id: 'hk-001',
    name: 'Clevis Hook',
    category: 'hooks',
    type: 'Swivel Clevis Hook',
    manufacturer: 'Gunnebo',
    model: 'GrabiQ BK',
    swl: 2.0,
    breakingLoad: 8.0,
    weight: 1.2,
    dimensions: {
      length: 145,
      width: 65,
      height: 25
    },
    specifications: {
      material: 'Alloy Steel',
      finish: 'Powder Coated',
      standard: 'EN 1677-1',
      certification: ['CE', 'UKCA', 'GS']
    },
    image: '/api/placeholder/300/200',
    description: 'Self-locking clevis hook with safety latch. Features 360° swivel action and automatic locking mechanism.',
    safetyNotes: [
      'Ensure latch closes properly',
      'Check swivel action',
      'Inspect for cracks or wear',
      'Do not exceed SWL',
      'Keep latch mechanism clean'
    ],
    inspectionRequirements: [
      'Pre-use safety latch check',
      'Weekly detailed inspection',
      'Annual thorough examination',
      'Immediate replacement if damaged'
    ],
    applications: [
      'Chain sling connections',
      'General lifting operations',
      'Material handling',
      'Construction lifting'
    ]
  },
  {
    id: 'bl-001',
    name: 'Snatch Block',
    category: 'blocks',
    type: 'Single Sheave Snatch Block',
    manufacturer: 'Tractel',
    model: 'Tirfor T-35',
    swl: 3.5,
    breakingLoad: 14.0,
    weight: 4.8,
    dimensions: {
      length: 280,
      width: 120,
      height: 85
    },
    specifications: {
      material: 'Cast Steel',
      finish: 'Galvanized',
      standard: 'BS EN 12385',
      certification: ['CE', 'UKCA', 'LOLER']
    },
    image: '/api/placeholder/300/200',
    description: 'Heavy-duty snatch block with side opening for easy rope insertion. Suitable for wire rope up to 16mm diameter.',
    safetyNotes: [
      'Ensure side plate is properly closed',
      'Check rope diameter compatibility',
      'Inspect sheave for wear',
      'Lubricate bearing regularly',
      'Avoid shock loading'
    ],
    inspectionRequirements: [
      'Pre-use visual inspection',
      'Check side plate operation',
      'Monthly bearing inspection',
      'Annual thorough examination'
    ],
    applications: [
      'Wire rope systems',
      'Winch operations',
      'Load positioning',
      'Mechanical advantage systems'
    ]
  },
  {
    id: 'sb-001',
    name: 'Spreader Beam',
    category: 'spreaders',
    type: 'Adjustable Spreader Beam',
    manufacturer: 'Modulift',
    model: 'MOD 24',
    swl: 24.0,
    breakingLoad: 96.0,
    weight: 185,
    dimensions: {
      length: 6000,
      width: 200,
      height: 400
    },
    specifications: {
      material: 'Structural Steel',
      finish: 'Painted',
      standard: 'BS EN 13155',
      certification: ['CE', 'UKCA', 'LOLER']
    },
    image: '/api/placeholder/300/200',
    description: 'Modular spreader beam system with adjustable lifting points. Designed for balanced lifting of long loads.',
    safetyNotes: [
      'Check load distribution',
      'Ensure proper beam selection',
      'Verify lifting point positions',
      'Check for beam deflection',
      'Use certified lifting points only'
    ],
    inspectionRequirements: [
      'Pre-use structural inspection',
      'Check lifting point integrity',
      'Monthly detailed examination',
      'Annual structural survey'
    ],
    applications: [
      'Long load lifting',
      'Balanced lifting operations',
      'Precast concrete handling',
      'Steel beam installation'
    ]
  }
]

// Function to get the appropriate icon for equipment
const getEquipmentIcon = (equipment: RiggingEquipment) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
      <Package className="w-16 h-16 mb-2" />
      <div className="text-xs text-center">
        <div className="font-medium">{equipment.name}</div>
        <div className="text-slate-500">{equipment.swl}t SWL</div>
      </div>
    </div>
  )
}

export default function RiggingLibrary() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<RiggingEquipment | null>(null)
  const [filteredEquipment, setFilteredEquipment] = useState<RiggingEquipment[]>(riggingEquipmentData)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [customEquipment, setCustomEquipment] = useState<RiggingEquipment[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Load custom equipment on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadCustomEquipment()
    }
  }, [session?.user?.id])

  const loadCustomEquipment = async () => {
    try {
      const response = await fetch('/api/rigging/custom-equipment')
      if (response.ok) {
        const data = await response.json()
        const parsed = data.equipment.map((eq: any) => {
          const notes = JSON.parse(eq.notes || '{}')
          return {
            id: eq.id,
            name: eq.type,
            category: eq.category as any,
            type: eq.type,
            manufacturer: eq.manufacturer,
            model: eq.model || '',
            swl: eq.workingLoadLimit,
            breakingLoad: notes.breakingLoad || 0,
            weight: notes.weight || 0,
            dimensions: notes.dimensions || {},
            specifications: notes.specifications || {},
            image: notes.image || '/api/placeholder/300/200',
            description: notes.description || '',
            safetyNotes: notes.safetyNotes || [],
            inspectionRequirements: notes.inspectionRequirements || [],
            applications: notes.applications || []
          }
        })
        setCustomEquipment(parsed)
      }
    } catch (error) {
      console.error('Error loading custom equipment:', error)
    }
  }

  const handleCreateSuccess = () => {
    loadCustomEquipment()
  }

  useEffect(() => {
    let filtered = [...riggingEquipmentData, ...customEquipment]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredEquipment(filtered)
  }, [searchTerm, selectedCategory, customEquipment])

  const categories = [
    { id: 'all', name: 'All Equipment', icon: Package },
    { id: 'hoists', name: 'Hoists & Winches', icon: Anchor },
    { id: 'slings', name: 'Slings & Strops', icon: Link },
    { id: 'shackles', name: 'Shackles', icon: Link },
    { id: 'hooks', name: 'Hooks', icon: Anchor },
    { id: 'blocks', name: 'Blocks & Pulleys', icon: Settings },
    { id: 'spreaders', name: 'Spreader Beams', icon: Package },
    { id: 'clamps', name: 'Lifting Clamps', icon: Zap },
    { id: 'eyebolts', name: 'Eyebolts & Points', icon: Shield }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Rigging Library...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Rigging Equipment Library</h1>
                <p className="text-slate-400">Professional lifting and rigging equipment database</p>
              </div>
            </div>
            <NextLink href="/dashboard">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </NextLink>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Create Custom Drawing Blocks</h3>
                <p className="text-slate-300 text-sm">
                  Use the <strong>CAD Block Manager</strong> to create professional drawing symbols for your rigging equipment.
                  Draw your equipment in CAD, select the elements, and save as reusable blocks for insertion into drawings.
                </p>
                <div className="mt-2">
                  <a
                    href="/cad"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Open CAD Block Manager →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-600/20 border border-orange-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <h3 className="text-orange-300 font-semibold">Safety First</h3>
                <p className="text-orange-200 text-sm">
                  All equipment specifications are for reference only. Always verify current certifications 
                  and conduct proper inspections before use. Consult manufacturer documentation for complete specifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search equipment by name, manufacturer, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Equipment
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filter
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <Card key={equipment.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{equipment.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {equipment.manufacturer} {equipment.model}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-orange-500 text-orange-400">
                    {equipment.swl}t SWL
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
                  {getEquipmentIcon(equipment)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">{equipment.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Weight:</span>
                    <span className="text-white">{equipment.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Standard:</span>
                    <span className="text-white">{equipment.specifications.standard}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedEquipment(equipment)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Equipment Found</h3>
            <p className="text-slate-400">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div>{selectedEquipment.name}</div>
                  <div className="text-sm text-slate-400 font-normal">
                    {selectedEquipment.manufacturer} {selectedEquipment.model}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Key Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Weight className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300 text-sm">Safe Working Load</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedEquipment.swl}t</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">Breaking Load</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedEquipment.breakingLoad}t</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Ruler className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">Equipment Weight</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedEquipment.weight}kg</div>
                </div>
              </div>

              {/* Tabs for detailed information */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600">Overview</TabsTrigger>
                  <TabsTrigger value="specifications" className="data-[state=active]:bg-orange-600">Specifications</TabsTrigger>
                  <TabsTrigger value="safety" className="data-[state=active]:bg-orange-600">Safety</TabsTrigger>
                  <TabsTrigger value="inspection" className="data-[state=active]:bg-orange-600">Inspection</TabsTrigger>
                  <TabsTrigger value="applications" className="data-[state=active]:bg-orange-600">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-slate-300">{selectedEquipment.description}</p>
                  </div>

                  {selectedEquipment.loadChart && (
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Load Chart</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-600">
                              <th className="text-left text-slate-300 py-2">Angle (°)</th>
                              <th className="text-left text-slate-300 py-2">Capacity (t)</th>
                              <th className="text-left text-slate-300 py-2">% of SWL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEquipment.loadChart.map((entry, index) => (
                              <tr key={index} className="border-b border-slate-700">
                                <td className="text-white py-2">{entry.angle}</td>
                                <td className="text-white py-2">{entry.capacity}</td>
                                <td className="text-slate-300 py-2">
                                  {((entry.capacity / selectedEquipment.swl) * 100).toFixed(0)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Technical Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Material:</span>
                          <span className="text-white">{selectedEquipment.specifications.material}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Finish:</span>
                          <span className="text-white">{selectedEquipment.specifications.finish}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Standard:</span>
                          <span className="text-white">{selectedEquipment.specifications.standard}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Type:</span>
                          <span className="text-white">{selectedEquipment.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Dimensions</h3>
                      <div className="space-y-2">
                        {selectedEquipment.dimensions.length && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Length:</span>
                            <span className="text-white">{selectedEquipment.dimensions.length}mm</span>
                          </div>
                        )}
                        {selectedEquipment.dimensions.width && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Width:</span>
                            <span className="text-white">{selectedEquipment.dimensions.width}mm</span>
                          </div>
                        )}
                        {selectedEquipment.dimensions.height && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Height:</span>
                            <span className="text-white">{selectedEquipment.dimensions.height}mm</span>
                          </div>
                        )}
                        {selectedEquipment.dimensions.diameter && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Diameter:</span>
                            <span className="text-white">{selectedEquipment.dimensions.diameter}mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEquipment.specifications.certification.map((cert, index) => (
                        <Badge key={index} variant="outline" className="border-green-500 text-green-400">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-300">Safety Notes</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedEquipment.safetyNotes.map((note, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-red-200">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="inspection" className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-300">Inspection Requirements</h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedEquipment.inspectionRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-300">Typical Applications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedEquipment.applications.map((application, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-green-200">{application}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-700">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download Datasheet
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <FileText className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Object Dialog */}
      <CreateObjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
