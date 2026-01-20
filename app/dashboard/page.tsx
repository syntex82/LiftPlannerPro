"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trackPageView, trackUserInteraction, trackAuthEvent } from '@/components/analytics/google-analytics'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeviceNotification, QuickDeviceNotification } from "@/components/ui/device-notification"
import { useDeviceDetection, canHandleFeature } from "@/lib/deviceDetection"
import IssueReporter from "@/components/issue-reporter"
import TensionCalculator from "@/components/tension-calculator"
import ChatWindow from "@/components/Chat/ChatWindow"
import ProjectCreationModal from "@/components/project-creation-modal"
import ProjectCategories from "@/components/project-categories"
import LiftPlanningAI from "@/components/lift-planning-ai"
import { DesktopRecommendedBadge } from "@/components/ui/universal-desktop-wrapper"
import {
  Plus,
  FolderOpen,
  Settings,
  LogOut,
  User,
  Ruler,
  FileText,
  Calculator,
  Crown,
  Shield,
  Clock,
  Package,
  Trash2,
  BookOpen,
  GraduationCap,
  Info,
  Link as LinkIcon,
  Smartphone,
  Monitor,
  MessageSquare,
  Receipt, Move3d,
  Pencil
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const deviceInfo = useDeviceDetection()
  const [showDeviceNotification, setShowDeviceNotification] = useState<string | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showLiftPlanningAI, setShowLiftPlanningAI] = useState(false)

  // Admin email list
  const adminEmails = [
    'mickyblenk@gmail.com',  // Primary admin
    'admin@darkspace.com',   // Backup admin
  ]

  const isAdminUser = (email: string | null | undefined) => {
    return email && adminEmails.includes(email)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProjects()
      // Track dashboard page view
      trackPageView('/dashboard', 'Dashboard - Lift Planner Pro')
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projectsData = await response.json()
        setProjects(projectsData)
        console.log('Loaded projects from API:', projectsData.length)
      } else {
        // API failed, fall back to localStorage projects
        console.log('API failed with status:', response.status, 'loading localStorage projects')
        loadLocalProjects()
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Fall back to localStorage projects
      console.log('Falling back to localStorage projects due to error')
      loadLocalProjects()
    } finally {
      setLoading(false)
    }
  }

  const loadLocalProjects = () => {
    try {
      // Get recent projects from localStorage
      const recentProjects = JSON.parse(localStorage.getItem('lift_planner_recent_projects') || '[]')

      // Convert localStorage projects to the expected format
      const localProjects = recentProjects.map((project: any) => ({
        id: project.key,
        name: project.name,
        description: 'Local project',
        createdAt: project.savedAt,
        updatedAt: project.savedAt,
        data: null
      }))

      setProjects(localProjects)
      console.log('Loaded local projects:', localProjects.length)
    } catch (error) {
      console.error('Error loading local projects:', error)
      setProjects([])
    }
  }

  const createNewProject = async (projectData?: any) => {
    console.log('createNewProject called with:', projectData)
    if (!projectData) {
      // Open the project creation modal
      console.log('Opening project creation modal')
      setShowProjectModal(true)
      return
    }

    console.log('Creating new project:', projectData)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          category: projectData.category,
          type: projectData.type,
          tags: projectData.tags
        }),
      })

      console.log('API response status:', response.status)

      if (response.ok) {
        const newProject = await response.json()
        setProjects([newProject, ...projects])
        console.log('Project created successfully via API:', newProject.id)

        // Navigate based on project category
        switch (projectData.category) {
          case 'CAD':
            router.push(`/cad-3d`)
            break
          case 'RAMS':
            router.push(`/rams?project=${newProject.id}`)
            break
          case 'LOFT_MANAGEMENT':
            router.push(`/loft?project=${newProject.id}`)
            break
          case 'LOAD_CALCULATION':
            router.push(`/calculator?project=${newProject.id}`)
            break
          case 'TRAINING':
            router.push(`/lms?project=${newProject.id}`)
            break
          case 'INSPECTION':
            router.push(`/inspection?project=${newProject.id}`)
            break
          default:
            router.push(`/cad-3d`)
        }
      } else {
        // API failed, fall back to localStorage-based project creation
        const errorText = await response.text()
        console.log('API failed with status:', response.status, 'error:', errorText)
        console.log('Using localStorage fallback')
        createLocalProject(projectData)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      // Fall back to localStorage-based project creation
      console.log('Exception occurred, using localStorage fallback')
      createLocalProject(projectData)
    }
  }

  const createLocalProject = (projectInfo?: any) => {
    try {
      // Generate a unique project ID
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const projectName = projectInfo?.name || `New Project ${projects.length + 1}`

      // Create project data
      const projectData = {
        id: projectId,
        name: projectName,
        description: projectInfo?.description || 'New lift planning project',
        category: projectInfo?.category || 'CAD',
        type: projectInfo?.type || 'general',
        tags: projectInfo?.tags || [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: null
      }

      // Save to localStorage with complete project structure
      const projectKey = `lift_planner_project_${projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`
      const completeProjectData = {
        name: projectName,
        description: projectInfo?.description || 'New lift planning project',
        elements: [],
        projectInfo: {
          category: projectInfo?.category || 'CAD',
          type: projectInfo?.type || 'general',
          tags: projectInfo?.tags || []
        },
        drawingScale: '1:1',
        drawingUnits: 'mm',
        layers: [
          { id: 'layer1', name: 'Layer 1', visible: true, locked: false, color: '#ffffff' }
        ],
        currentLayer: 'layer1',
        zoom: 1,
        pan: { x: 0, y: 0 },
        showGrid: true,
        createdAt: new Date().toISOString(),
        savedAt: new Date().toISOString(),
        version: '1.0'
      }
      localStorage.setItem(projectKey, JSON.stringify(completeProjectData))

      // Add to recent projects
      const recentProjects = JSON.parse(localStorage.getItem('lift_planner_recent_projects') || '[]')
      const projectEntry = {
        name: projectName,
        key: projectKey,
        savedAt: new Date().toISOString(),
        elementCount: 0
      }

      // Remove existing entry if it exists
      const filteredRecent = recentProjects.filter((p: any) => p.key !== projectKey)
      filteredRecent.unshift(projectEntry)

      // Keep only last 10 projects
      const limitedRecent = filteredRecent.slice(0, 10)
      localStorage.setItem('lift_planner_recent_projects', JSON.stringify(limitedRecent))

      // Update local projects state
      setProjects([projectData, ...projects])

      // Navigate based on project category
      const category = projectInfo?.category || 'CAD'
      switch (category) {
        case 'CAD':
          router.push(`/cad-3d`)
          break
        case 'RAMS':
          router.push(`/rams?projectKey=${projectKey}&name=${encodeURIComponent(projectName)}`)
          break
        case 'Loft':
          router.push(`/rigging-loft?projectKey=${projectKey}&name=${encodeURIComponent(projectName)}`)
          break
        case 'Step Plan':
          router.push(`/step-plan?projectKey=${projectKey}&name=${encodeURIComponent(projectName)}`)
          break
        case 'Load Calculator':
          router.push(`/load-calculator?projectKey=${projectKey}&name=${encodeURIComponent(projectName)}`)
          break
        case 'Tension Calculator':
          router.push(`/tension-calculator?projectKey=${projectKey}&name=${encodeURIComponent(projectName)}`)
          break
        default:
          router.push(`/cad-3d`)
      }

      console.log('Local project created successfully:', projectKey)
    } catch (error) {
      console.error('Error creating local project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Check if this is a localStorage project
      if (projectId.startsWith('lift_planner_project_') || projectId.startsWith('project_')) {
        // This is a localStorage project
        deleteLocalProject(projectId, projectName)
      } else {
        // This is a database project
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setProjects(projects.filter(p => p.id !== projectId))
          alert('Project deleted successfully.')
        } else {
          // API failed, try localStorage fallback
          console.log('Database delete failed, trying localStorage fallback')
          deleteLocalProject(projectId, projectName)
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      // Try localStorage fallback as last resort
      deleteLocalProject(projectId, projectName)
    }
  }

  const deleteLocalProject = (projectId: string, projectName: string) => {
    try {
      // Remove from localStorage
      if (projectId.startsWith('lift_planner_project_')) {
        // Direct localStorage key
        localStorage.removeItem(projectId)
      } else {
        // Generated project ID, need to find the localStorage key
        const projectKey = `lift_planner_project_${projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`
        localStorage.removeItem(projectKey)
      }

      // Update recent projects list
      const recentProjects = JSON.parse(localStorage.getItem('lift_planner_recent_projects') || '[]')
      const updatedRecent = recentProjects.filter((p: any) =>
        p.key !== projectId &&
        p.name !== projectName &&
        !p.key.includes(projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''))
      )
      localStorage.setItem('lift_planner_recent_projects', JSON.stringify(updatedRecent))

      // Update local projects state
      setProjects(projects.filter(p => p.id !== projectId))

      alert('Project deleted successfully.')
      console.log('Local project deleted successfully:', projectId)
    } catch (error) {
      console.error('Error deleting local project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Loading your workspace...</div>
          <div className="text-slate-400 text-sm mt-1">Please wait</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'pro':
        return <Badge className="bg-blue-600">Pro</Badge>
      case 'enterprise':
        return <Badge className="bg-purple-600">Enterprise</Badge>
      default:
        return <Badge variant="outline" className="border-slate-600 text-slate-300">Free</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Device Notifications */}
      {showDeviceNotification && (
        <QuickDeviceNotification
          message={showDeviceNotification}
          type="info"
          onDismiss={() => setShowDeviceNotification(null)}
        />
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image src="/company-logo.png" alt="Lift Planner Pro" width={24} height={24} className="sm:w-8 sm:h-8 rounded-lg" />
              <span className="text-white font-bold text-lg sm:text-xl hidden xs:block">Lift Planner Pro</span>
              <span className="text-white font-bold text-lg sm:text-xl xs:hidden">LPP</span>
              {/* Device indicator */}
              <div className="hidden sm:flex items-center space-x-1 text-slate-400">
                {deviceInfo.isMobile && <Smartphone className="w-4 h-4" />}
                {deviceInfo.isDesktop && <Monitor className="w-4 h-4" />}
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm sm:text-base">{session.user?.name}</span>
                {getSubscriptionBadge(session.user?.subscription || 'free')}
              </div>

              {/* Issue Reporter */}
              <IssueReporter />

              {/* Documentation & About Links - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-2">
                <Link prefetch={false} href="/documentation">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Docs
                  </Button>
                </Link>

                <Link prefetch={false} href="/about">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <Info className="w-4 h-4 mr-2" />
                    About
                  </Button>
                </Link>

                {/* Admin Panel Link */}
                {isAdminUser(session.user?.email) && (
                  <Link prefetch={false} href="/admin">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-300 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {session.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Ready to plan your next lift? Create a new project or continue working on existing ones.
          </p>
          {/* Device info for mobile users */}
          {deviceInfo.isMobile && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                📱 You're using a mobile device. Some features work best on desktop computers.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Quick Help Card */}
          <Card className="lg:col-span-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">New to Lift Planner Pro?</h3>
                    <p className="text-slate-300 text-sm">Check out our comprehensive documentation and guides</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/documentation">
                    <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/20">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                      <Info className="w-4 h-4 mr-2" />
                      About
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center"
            onClick={() => setShowProjectModal(true)}
          >
            <CardContent className="p-4 w-full">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm">New Project</h3>
                  <p className="text-slate-400 text-xs">CAD, RAMS, Loft & more</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            onClick={() => {
              if (!canHandleFeature('cad-editor', deviceInfo)) {
                setShowDeviceNotification('CAD Editor works best on desktop computers with larger screens and precise mouse control.')
              } else {
                window.location.href = '/cad'
              }
            }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer relative h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Ruler className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">2D CAD Editor</h3>
                    <p className="text-slate-400 text-xs">2D drawing tools</p>
                    {!canHandleFeature('cad-editor', deviceInfo) && (
                      <Badge variant="outline" className="mt-1 text-xs border-amber-500 text-amber-400">
                        Desktop Rec.
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Link prefetch={false} href="/lms">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Learning System</h3>
                    <p className="text-slate-400 text-xs">Training & certificates</p>
                    {!deviceInfo.isDesktop && (
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs mt-1">
                        Desktop Rec.
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/training">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Training Module</h3>
                    <p className="text-slate-400 text-xs">Interactive lift training</p>
                    <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs mt-1">
                      New
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/rigging-library">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Rigging Library</h3>
                    <p className="text-slate-400 text-xs">Equipment database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/rams">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">RAMS Generator</h3>
                    <p className="text-slate-400 text-xs">Safety documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/rigging-loft">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Rigging Loft</h3>
                    <p className="text-slate-400 text-xs">Equipment management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/calculator">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Load Calculator</h3>
                    <p className="text-slate-400 text-xs">Crane calculations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 3D CAD Entry */}
          <Link prefetch={false} href="/cad-3d">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Move3d className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">3D CAD (Beta)</h3>
                    <p className="text-slate-400 text-xs">Explore crane models in 3D</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/tension-calculator">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Tension Calculator</h3>
                    <p className="text-slate-400 text-xs">Chainblock & sling angles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/safety">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Safety Library</h3>
                    <p className="text-slate-400 text-xs">Guidelines & regulations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/step-plan">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Step Plan</h3>
                    <p className="text-slate-400 text-xs">Project sequence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link prefetch={false} href="/expenses">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm">Expenses & Lodging</h3>
                    <p className="text-slate-400 text-xs">Track work expenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center"
            onClick={() => setShowLiftPlanningAI(true)}
          >
            <CardContent className="p-4 w-full">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm">Lift Planning AI</h3>
                  <p className="text-slate-400 text-xs">Generate lift plans with AI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer h-32 flex items-center"
            onClick={() => {
              // Scroll to chat section
              const chatSection = document.querySelector('[data-chat-section]')
              if (chatSection) {
                chatSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <CardContent className="p-4 w-full">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm">Team Chat</h3>
                  <p className="text-slate-400 text-xs">Collaborate with your team</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FolderOpen className="w-5 h-5 mr-2" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-slate-400">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-300 text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-slate-400 mb-4">Create your first lift planning project to get started</p>
                <Button onClick={() => {
                  console.log('Create Project button clicked')
                  createNewProject()
                }} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                      <p className="text-slate-400 text-sm">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4">{project.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              // Check if this is a localStorage project
                              if (project.id.startsWith('lift_planner_project_')) {
                                // This is a localStorage project
                                router.push(`/cad?projectKey=${project.id}&name=${encodeURIComponent(project.name)}`)
                              } else {
                                // This is a database project
                                router.push(`/cad?project=${project.id}`)
                              }
                            }}
                          >
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            Details
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(project.id, project.name)
                          }}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status */}
        {session.user?.subscription === 'free' && (
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">Upgrade to Pro</h3>
                    <p className="text-slate-300">Unlock advanced features and unlimited projects</p>
                  </div>
                </div>
                <Link prefetch={false} href="/#pricing">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Chat */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6" data-chat-section>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Team Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96">
              <ChatWindow />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onCreateProject={createNewProject}
      />

      {/* Lift Planning AI Modal */}
      <LiftPlanningAI
        isOpen={showLiftPlanningAI}
        onClose={() => setShowLiftPlanningAI(false)}
      />
    </div>
  )
}
