"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Palette, 
  Shield, 
  Package, 
  Calculator, 
  GraduationCap, 
  Search, 
  FileText,
  Filter,
  Grid,
  List,
  Calendar,
  Clock,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  Star,
  FolderOpen
} from "lucide-react"

interface Project {
  id: string
  name: string
  description?: string
  category: string
  type?: string
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
  userId: string
}

interface ProjectCategoriesProps {
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onProjectEdit: (project: Project) => void
  onProjectDelete: (projectId: string) => void
  onProjectDuplicate: (project: Project) => void
}

const categoryConfig = {
  CAD: {
    name: 'CAD Drawings',
    icon: Palette,
    color: 'blue',
    description: 'Technical drawings and lift plans'
  },
  RAMS: {
    name: 'RAMS Documents',
    icon: Shield,
    color: 'red',
    description: 'Risk assessments and method statements'
  },
  LOFT_MANAGEMENT: {
    name: 'Loft Management',
    icon: Package,
    color: 'green',
    description: 'Equipment tracking and management'
  },
  LOAD_CALCULATION: {
    name: 'Load Calculations',
    icon: Calculator,
    color: 'purple',
    description: 'Load analysis and calculations'
  },
  TRAINING: {
    name: 'Training',
    icon: GraduationCap,
    color: 'yellow',
    description: 'Training materials and courses'
  },
  INSPECTION: {
    name: 'Inspections',
    icon: Search,
    color: 'cyan',
    description: 'Inspection checklists and reports'
  },
  GENERAL: {
    name: 'General',
    icon: FileText,
    color: 'gray',
    description: 'General project files'
  }
}

const statusConfig = {
  ACTIVE: { name: 'Active', color: 'green' },
  COMPLETED: { name: 'Completed', color: 'blue' },
  ARCHIVED: { name: 'Archived', color: 'gray' },
  TEMPLATE: { name: 'Template', color: 'purple' }
}

export default function ProjectCategories({ 
  projects, 
  onProjectSelect, 
  onProjectEdit, 
  onProjectDelete, 
  onProjectDuplicate 
}: ProjectCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('date')

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesCategory = selectedCategory === 'ALL' || project.category === selectedCategory
      const matchesSearch = !searchTerm || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  // Group projects by category for statistics
  const projectsByCategory = projects.reduce((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getCategoryColor = (category: string) => {
    const config = categoryConfig[category as keyof typeof categoryConfig]
    return config?.color || 'gray'
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.color || 'gray'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-1 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'ALL' ? "default" : "outline"}
          onClick={() => setSelectedCategory('ALL')}
          className={`${
            selectedCategory === 'ALL'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          All Projects ({projects.length})
        </Button>
        
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon
          const count = projectsByCategory[key] || 0
          
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              onClick={() => setSelectedCategory(key)}
              className={`${
                selectedCategory === key
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {config.name} ({count})
            </Button>
          )
        })}
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Projects Found</h3>
            <p className="text-slate-400">
              {searchTerm 
                ? `No projects match "${searchTerm}"`
                : selectedCategory === 'ALL'
                  ? 'Create your first project to get started'
                  : `No ${categoryConfig[selectedCategory as keyof typeof categoryConfig]?.name.toLowerCase()} projects yet`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filteredProjects.map((project) => {
            const categoryInfo = categoryConfig[project.category as keyof typeof categoryConfig]
            const CategoryIcon = categoryInfo?.icon || FileText
            
            if (viewMode === 'list') {
              return (
                <Card key={project.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`bg-${getCategoryColor(project.category)}-600/20 border border-${getCategoryColor(project.category)}-500/30 rounded-lg p-2`}>
                          <CategoryIcon className={`w-5 h-5 text-${getCategoryColor(project.category)}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{project.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{categoryInfo?.name}</span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(project.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`bg-${getStatusColor(project.status)}-600/20 text-${getStatusColor(project.status)}-400 border-${getStatusColor(project.status)}-500/30`}>
                          {statusConfig[project.status as keyof typeof statusConfig]?.name || project.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => onProjectSelect(project)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={project.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`bg-${getCategoryColor(project.category)}-600/20 border border-${getCategoryColor(project.category)}-500/30 rounded-lg p-2`}>
                      <CategoryIcon className={`w-5 h-5 text-${getCategoryColor(project.category)}-400`} />
                    </div>
                    <Badge className={`bg-${getStatusColor(project.status)}-600/20 text-${getStatusColor(project.status)}-400 border-${getStatusColor(project.status)}-500/30 text-xs`}>
                      {statusConfig[project.status as keyof typeof statusConfig]?.name || project.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  
                  {project.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated {formatDate(project.updatedAt)}
                    </div>
                    
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-400">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700">
                    <span className="text-xs text-slate-500">{categoryInfo?.name}</span>
                    <Button
                      size="sm"
                      onClick={() => onProjectSelect(project)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
