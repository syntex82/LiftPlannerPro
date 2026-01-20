"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Palette, 
  Shield, 
  Package, 
  Calculator, 
  GraduationCap, 
  Search, 
  FileText,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Star
} from "lucide-react"

interface ProjectCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: (projectData: ProjectData) => void
}

interface ProjectData {
  name: string
  description: string
  category: string
  type: string
  tags: string[]
}

interface ProjectType {
  id: string
  name: string
  description: string
  icon: any
  category: string
  features: string[]
  estimatedTime: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  popular?: boolean
}

const projectTypes: ProjectType[] = [
  // CAD Projects Only
  {
    id: 'cad-lift-plan',
    name: 'Lift Plan Drawing',
    description: 'Create detailed CAD drawings for crane lift operations with precise measurements and annotations',
    icon: Palette,
    category: 'CAD',
    features: ['2D CAD Tools', 'Measurement Tools', 'Annotation System', 'Layer Management'],
    estimatedTime: '2-4 hours',
    difficulty: 'Intermediate',
    popular: true
  },
  {
    id: 'cad-site-layout',
    name: 'Site Layout Plan',
    description: 'Design comprehensive site layouts showing crane positions, exclusion zones, and access routes',
    icon: Palette,
    category: 'CAD',
    features: ['Site Planning', 'Zone Mapping', 'Scale Drawings', 'Export Options'],
    estimatedTime: '3-6 hours',
    difficulty: 'Advanced'
  },
  {
    id: 'cad-rigging-diagram',
    name: 'Rigging Diagram',
    description: 'Technical drawings showing rigging configurations, sling arrangements, and load paths',
    icon: Palette,
    category: 'CAD',
    features: ['Rigging Symbols', 'Load Calculations', 'Safety Factors', 'Technical Specs'],
    estimatedTime: '1-3 hours',
    difficulty: 'Intermediate'
  },
  {
    id: 'cad-technical-drawing',
    name: 'Technical Drawing',
    description: 'General purpose technical drawings with precision tools and professional layouts',
    icon: Palette,
    category: 'CAD',
    features: ['Precision Tools', 'Professional Export', 'Dimensioning', 'Multiple Layers'],
    estimatedTime: '1-4 hours',
    difficulty: 'Beginner',
    popular: true
  },
  {
    id: 'cad-equipment-layout',
    name: 'Equipment Layout',
    description: 'Design equipment positioning and spatial arrangements for lifting operations',
    icon: Palette,
    category: 'CAD',
    features: ['Equipment Symbols', 'Spatial Planning', 'Scale Accuracy', 'Clearance Zones'],
    estimatedTime: '2-5 hours',
    difficulty: 'Intermediate'
  }
]

const categories = [
  { id: 'CAD', name: 'CAD Drawings', icon: Palette }
]

export default function ProjectCreationModal({ isOpen, onClose, onCreateProject }: ProjectCreationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('CAD')
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [customTags, setCustomTags] = useState('')
  const [step, setStep] = useState<'category' | 'details'>('category')

  if (!isOpen) return null

  // Only show CAD projects since that's all we have now
  const filteredTypes = projectTypes

  const handleTypeSelect = (type: ProjectType) => {
    setSelectedType(type)
    setProjectName(`${type.name} - ${new Date().toLocaleDateString()}`)
    setProjectDescription(type.description)
    setStep('details')
  }

  const handleCreateProject = () => {
    if (!selectedType || !projectName.trim()) return

    const tags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    
    onCreateProject({
      name: projectName.trim(),
      description: projectDescription.trim(),
      category: selectedType.category,
      type: selectedType.id,
      tags
    })

    // Reset form
    setSelectedCategory('CAD')
    setSelectedType(null)
    setProjectName('')
    setProjectDescription('')
    setCustomTags('')
    setStep('category')
    onClose()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600/20 text-green-400 border-green-500/30'
      case 'Intermediate': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
      case 'Advanced': return 'bg-red-600/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center">
                <Plus className="w-6 h-6 mr-2 text-blue-400" />
                Create New Project
              </CardTitle>
              <p className="text-slate-400 mt-1">
                {step === 'category' ? 'Choose a project type to get started' : 'Configure your project details'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'category' && (
            <div className="space-y-6">
              {/* Project Types Grid */}
              <div>
                <h3 className="text-white font-semibold mb-4">
                  CAD Project Types
                  <span className="text-slate-400 font-normal ml-2">({filteredTypes.length} options)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Card
                        key={type.id}
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors cursor-pointer group"
                        onClick={() => handleTypeSelect(type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2">
                              <Icon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              {type.popular && (
                                <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getDifficultyColor(type.difficulty)}`}>
                                {type.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <h4 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                            {type.name}
                          </h4>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                            {type.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-xs text-slate-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {type.estimatedTime}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {type.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                  {feature}
                                </Badge>
                              ))}
                              {type.features.length > 2 && (
                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                  +{type.features.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 'details' && selectedType && (
            <div className="space-y-6">
              {/* Selected Type Summary */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2">
                    <selectedType.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedType.name}</h3>
                    <p className="text-slate-400 text-sm">{selectedType.category.replace('_', ' ')}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('category')}
                    className="ml-auto text-slate-400 hover:text-white"
                  >
                    Change Type
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {selectedType.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-slate-300">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName" className="text-slate-300">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter project name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectTags" className="text-slate-300">Tags (comma-separated)</Label>
                    <Input
                      id="projectTags"
                      value={customTags}
                      onChange={(e) => setCustomTags(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="urgent, client-abc, phase-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectDescription" className="text-slate-300">Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={6}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Describe your project..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setStep('category')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                >
                  Create Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
