"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trackPageView, trackUserInteraction, trackAuthEvent } from '@/components/analytics/google-analytics'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeviceNotification, QuickDeviceNotification } from "@/components/ui/device-notification"
import { useDeviceDetection, canHandleFeature } from "@/lib/deviceDetection"
import IssueReporter from "@/components/issue-reporter"
import TensionCalculator from "@/components/tension-calculator"
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
  Receipt,
  Move3d,
  Pencil,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  LayoutDashboard,
  Hash,
  Video,
  Users,
  Paperclip,
  Route,
  Truck
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-cyan-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <div className="text-white text-xl font-semibold mb-2">Loading your workspace</div>
          <div className="text-slate-400 text-sm">Preparing your lift planning tools...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Device Notifications */}
      {showDeviceNotification && (
        <QuickDeviceNotification
          message={showDeviceNotification}
          type="info"
          onDismiss={() => setShowDeviceNotification(null)}
        />
      )}

      {/* Beautiful Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30"></div>
                <Image src="/company-logo.png" alt="Lift Planner Pro" width={36} height={36} className="relative rounded-xl" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-xl">Lift Planner Pro</span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-full text-blue-300">
                  Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Quick actions */}
              <div className="flex items-center space-x-1">
                <IssueReporter />

                <Link prefetch={false} href="/documentation" className="hidden lg:block">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50" title="Documentation">
                    <BookOpen className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-white text-sm font-medium">{session.user?.name}</span>
                    {getSubscriptionBadge(session.user?.subscription || 'free')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuLabel className="text-slate-300">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">{session.user?.name}</p>
                      <p className="text-xs text-slate-400">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700">
                    <Link href="/profile?tab=settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdminUser(session.user?.email) && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-orange-500/20 focus:bg-orange-500/20 text-orange-400">
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Stats */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{session.user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Ready to plan your next lift? Your workspace is ready.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="dashboard-stat">
                <div className="text-2xl font-bold text-white">{projects.length}</div>
                <div className="text-slate-400 text-sm">Projects</div>
              </div>
              <div className="dashboard-stat">
                <div className="text-2xl font-bold text-green-400">Active</div>
                <div className="text-slate-400 text-sm">Status</div>
              </div>
            </div>
          </div>

          {/* Device info for mobile users */}
          {deviceInfo.isMobile && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <p className="text-blue-300 text-sm">
                  You're on mobile. Some features work best on desktop computers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Primary Actions - Beautiful Cards */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Project - Primary CTA */}
            {/* New Project */}
            <div
              className="quick-action col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400/50"
              onClick={() => setShowProjectModal(true)}
            >
              <div className="quick-action-icon bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="text-white font-semibold">New Project</h3>
              <p className="text-slate-400 text-xs mt-1">Start fresh</p>
            </div>

            {/* 2D CAD */}
            <div
              className="quick-action"
              onClick={() => {
                if (!canHandleFeature('cad-editor', deviceInfo)) {
                  setShowDeviceNotification('CAD Editor works best on desktop computers.')
                } else {
                  window.location.href = '/cad'
                }
              }}
            >
              <div className="quick-action-icon bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400">
                <Ruler className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold">2D CAD</h3>
              <p className="text-slate-400 text-xs mt-1">Draw plans</p>
            </div>

            {/* 3D CAD */}
            <Link prefetch={false} href="/cad-3d" className="quick-action">
              <div className="quick-action-icon bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-400">
                <Move3d className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold">3D CAD</h3>
              <p className="text-slate-400 text-xs mt-1">3D models</p>
            </Link>

            {/* RAMS */}
            <Link prefetch={false} href="/rams" className="quick-action">
              <div className="quick-action-icon bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold">RAMS</h3>
              <p className="text-slate-400 text-xs mt-1">Safety docs</p>
            </Link>
          </div>
        </div>

        {/* Tools Grid - Beautiful Cards */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Professional Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Training */}
            <Link prefetch={false} href="/training" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Training</h3>
                <p className="text-slate-400 text-xs">Interactive scenarios</p>
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">New</Badge>
              </div>
            </Link>

            {/* LMS */}
            <Link prefetch={false} href="/lms" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Learning</h3>
                <p className="text-slate-400 text-xs">Courses & certs</p>
              </div>
            </Link>

            {/* Calculator */}
            <Link prefetch={false} href="/calculator" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Load Calc</h3>
                <p className="text-slate-400 text-xs">Crane calculations</p>
              </div>
            </Link>

            {/* Rigging Library */}
            <Link prefetch={false} href="/rigging-library" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Rigging</h3>
                <p className="text-slate-400 text-xs">Equipment library</p>
              </div>
            </Link>

            {/* Rigging Loft */}
            <Link prefetch={false} href="/rigging-loft" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Loft</h3>
                <p className="text-slate-400 text-xs">Manage equipment</p>
              </div>
            </Link>

            {/* Tension Calculator */}
            <Link prefetch={false} href="/tension-calculator" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LinkIcon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Tension</h3>
                <p className="text-slate-400 text-xs">Sling angles</p>
              </div>
            </Link>

            {/* Safety Library */}
            <Link prefetch={false} href="/safety" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Safety</h3>
                <p className="text-slate-400 text-xs">Guidelines</p>
              </div>
            </Link>

            {/* Step Plan */}
            <Link prefetch={false} href="/step-plan" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Step Plan</h3>
                <p className="text-slate-400 text-xs">Sequences</p>
              </div>
            </Link>

            {/* Route Planner */}
            <Link prefetch={false} href="/route-planner" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Route className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Route Plan</h3>
                <p className="text-slate-400 text-xs">Heavy transport</p>
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">New</Badge>
              </div>
            </Link>

            {/* Expenses */}
            <Link prefetch={false} href="/expenses" className="group">
              <div className="dashboard-card p-5 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Expenses</h3>
                <p className="text-slate-400 text-xs">Track costs</p>
              </div>
            </Link>

            {/* Lift Planning AI */}
            <div
              className="group cursor-pointer"
              onClick={() => setShowLiftPlanningAI(true)}
            >
              <div className="dashboard-card p-5 h-full bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">AI Planner</h3>
                <p className="text-slate-400 text-xs">Generate plans</p>
                <Badge className="mt-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">AI</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects - Beautiful Design */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              Recent Projects
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjectModal(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>

          <div className="dashboard-card p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                  <FolderOpen className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">Create your first lift planning project to get started with professional documentation.</p>
                <Button
                  onClick={() => setShowProjectModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProject(project.id, project.name)
                        }}
                        className="w-8 h-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="text-white font-semibold mb-1 truncate">{project.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
                        onClick={() => {
                          if (project.id.startsWith('lift_planner_project_')) {
                            router.push(`/cad?projectKey=${project.id}&name=${encodeURIComponent(project.name)}`)
                          } else {
                            router.push(`/cad?project=${project.id}`)
                          }
                        }}
                      >
                        Open
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Chat Card */}
        <div className="mb-10">
          <Link href="/chat">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      Team Chat
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Live</span>
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Connect with your team • Video calls • File sharing • @mentions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Online users indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">M</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">J</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">A</div>
                    </div>
                    <span className="text-xs text-slate-400">3 online</span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Features row */}
              <div className="relative mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> 5 Channels
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Video Calls
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Direct Messages
                </span>
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> File Sharing
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Upgrade Banner */}
        {session.user?.subscription === 'free' && (
          <div className="dashboard-card bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-blue-500/30 p-6 mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Upgrade to Pro</h3>
                  <p className="text-slate-300">Unlock unlimited projects, AI features & priority support</p>
                </div>
              </div>
              <Link prefetch={false} href="/#pricing">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6">
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
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
