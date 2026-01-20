"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calculator,
  Truck,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Settings,
  Users,
  User,
  Shield,
  Lock,
  Zap,
  Target,
  TrendingUp,
  Layers,
  Weight,
  BarChart3,
  Home,
  ArrowRight,
  ExternalLink,
  Box,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

  const documentationSections = [
    {
      id: 'overview',
      title: 'Overview',
      content: 'Getting started with Lift Planner Pro'
    },
    {
      id: 'load-calculator',
      title: 'Load Calculator',
      content: 'Advanced crane capacity calculations'
    },
    {
      id: 'cad-system',
      title: 'CAD System',
      content: 'Computer-Aided Design for lift planning'
    },
    {
      id: 'cad-3d-tools',
      title: '3D CAD Tools',
      content: 'Professional 3D modeling and visualization'
    },
    {
      id: 'step-plans',
      title: 'Step Plans',
      content: 'Project sequence planning and documentation'
    },
    {
      id: 'rams',
      title: 'RAMS',
      content: 'Risk Assessment & Method Statements'
    },
    {
      id: 'rigging-loft',
      title: 'Rigging Loft',
      content: 'Equipment certification and management'
    },
    {
      id: 'crane-database',
      title: 'Crane Database',
      content: 'Comprehensive crane specifications'
    },
    {
      id: 'multi-crane',
      title: 'Multi-Crane Operations',
      content: 'Complex multi-crane lift planning'
    },
    {
      id: 'user-management',
      title: 'User Management',
      content: 'Authentication and user roles'
    },
    {
      id: 'reports-export',
      title: 'Reports & Export',
      content: 'Professional documentation generation'
    },
    {
      id: 'safety',
      title: 'Safety Guidelines',
      content: 'Industry safety standards and practices'
    },
    {
      id: 'api',
      title: 'API Reference',
      content: 'Integration and automation'
    }
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Documentation</h1>
                <p className="text-slate-400">Comprehensive guide to Lift Planner Pro</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
                />
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                PDF Guide
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documentationSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.id === 'overview' && <BookOpen className="w-4 h-4 mr-2" />}
                    {section.id === 'load-calculator' && <Calculator className="w-4 h-4 mr-2" />}
                    {section.id === 'cad-system' && <Target className="w-4 h-4 mr-2" />}
                    {section.id === 'cad-3d-tools' && <Box className="w-4 h-4 mr-2" />}
                    {section.id === 'step-plans' && <FileText className="w-4 h-4 mr-2" />}
                    {section.id === 'rams' && <AlertTriangle className="w-4 h-4 mr-2" />}
                    {section.id === 'rigging-loft' && <Weight className="w-4 h-4 mr-2" />}
                    {section.id === 'crane-database' && <Truck className="w-4 h-4 mr-2" />}
                    {section.id === 'multi-crane' && <Layers className="w-4 h-4 mr-2" />}
                    {section.id === 'user-management' && <Users className="w-4 h-4 mr-2" />}
                    {section.id === 'reports-export' && <Download className="w-4 h-4 mr-2" />}
                    {section.id === 'safety' && <Shield className="w-4 h-4 mr-2" />}
                    {section.id === 'api' && <Settings className="w-4 h-4 mr-2" />}
                    {section.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BookOpen className="w-6 h-6 mr-3" />
                      Welcome to Lift Planner Pro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p className="text-lg">
                        Lift Planner Pro is a comprehensive crane capacity calculation and lift planning software 
                        designed for professional lifting operations. Our platform provides industry-leading tools 
                        for safe and efficient crane operations.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Calculator className="w-5 h-5 text-blue-400 mr-2" />
                            <h3 className="text-white font-semibold">Advanced Calculations</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Professional-grade crane capacity calculations with real-time safety analysis
                          </p>
                        </div>

                        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Target className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-white font-semibold">CAD System</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Integrated 2D/3D CAD tools for site planning and lift visualization
                          </p>
                        </div>

                        <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-purple-400 mr-2" />
                            <h3 className="text-white font-semibold">Step Plans</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Detailed sequence planning with HTML and PDF export capabilities
                          </p>
                        </div>

                        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                            <h3 className="text-white font-semibold">RAMS</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Risk Assessment & Method Statements with regulatory compliance
                          </p>
                        </div>

                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Weight className="w-5 h-5 text-yellow-400 mr-2" />
                            <h3 className="text-white font-semibold">Rigging Loft</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Equipment certification tracking and management system
                          </p>
                        </div>

                        <div className="p-4 bg-indigo-900/20 border border-indigo-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Truck className="w-5 h-5 text-indigo-400 mr-2" />
                            <h3 className="text-white font-semibold">Crane Database</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            50+ crane models from 30t to 3000t across all major manufacturers
                          </p>
                        </div>

                        <div className="p-4 bg-cyan-900/20 border border-cyan-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Layers className="w-5 h-5 text-cyan-400 mr-2" />
                            <h3 className="text-white font-semibold">Multi-Crane</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Advanced multi-crane lift coordination and load distribution
                          </p>
                        </div>

                        <div className="p-4 bg-pink-900/20 border border-pink-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Users className="w-5 h-5 text-pink-400 mr-2" />
                            <h3 className="text-white font-semibold">User Management</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Role-based access control with enterprise authentication
                          </p>
                        </div>

                        <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Download className="w-5 h-5 text-orange-400 mr-2" />
                            <h3 className="text-white font-semibold">Professional Reports</h3>
                          </div>
                          <p className="text-sm text-slate-300">
                            Industry-standard documentation with custom branding
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-600 pt-6">
                      <h3 className="text-white text-xl font-semibold mb-4">Quick Start Guide</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                          <div>
                            <p className="text-white font-medium">Select Your Crane</p>
                            <p className="text-slate-400 text-sm">Choose from our comprehensive database of crane models</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                          <div>
                            <p className="text-white font-medium">Enter Load Parameters</p>
                            <p className="text-slate-400 text-sm">Input load weight, radius, and height specifications</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                          <div>
                            <p className="text-white font-medium">Review Safety Analysis</p>
                            <p className="text-slate-400 text-sm">Get instant feedback on lift safety and capacity margins</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</div>
                          <div>
                            <p className="text-white font-medium">Export Documentation</p>
                            <p className="text-slate-400 text-sm">Generate professional lift plans and safety reports</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Load Calculator Documentation */}
              <TabsContent value="load-calculator" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calculator className="w-6 h-6 mr-3" />
                      Load Calculator Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        The Load Calculator is the core feature of Lift Planner Pro, providing professional-grade 
                        crane capacity calculations with real-time safety analysis.
                      </p>

                      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                          <h4 className="text-yellow-300 font-semibold">Important Safety Note</h4>
                        </div>
                        <p className="text-yellow-200 text-sm">
                          All calculations are for planning purposes only. Always consult certified lifting engineers 
                          and follow manufacturer specifications for actual lifting operations.
                        </p>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Key Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Single Crane Calculations</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Real-time capacity calculations</li>
                            <li>• Safety margin analysis</li>
                            <li>• Environmental factor considerations</li>
                            <li>• Load chart interpolation</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Multi-Crane Operations</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Load distribution calculations</li>
                            <li>• Crane coordination planning</li>
                            <li>• Combined capacity analysis</li>
                            <li>• Risk assessment tools</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Calculation Parameters</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-600">
                              <th className="text-left py-2 text-white">Parameter</th>
                              <th className="text-left py-2 text-white">Description</th>
                              <th className="text-left py-2 text-white">Units</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            <tr className="border-b border-slate-700">
                              <td className="py-2">Load Weight</td>
                              <td className="py-2">Total weight of the load including rigging</td>
                              <td className="py-2">Tonnes (t)</td>
                            </tr>
                            <tr className="border-b border-slate-700">
                              <td className="py-2">Operating Radius</td>
                              <td className="py-2">Horizontal distance from crane centerline to load</td>
                              <td className="py-2">Meters (m)</td>
                            </tr>
                            <tr className="border-b border-slate-700">
                              <td className="py-2">Lift Height</td>
                              <td className="py-2">Vertical distance from ground to load</td>
                              <td className="py-2">Meters (m)</td>
                            </tr>
                            <tr className="border-b border-slate-700">
                              <td className="py-2">Safety Factor</td>
                              <td className="py-2">Additional safety margin (1.25 standard, 2.0 critical)</td>
                              <td className="py-2">Ratio</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CAD System Documentation */}
              <TabsContent value="cad-system" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-6 h-6 mr-3" />
                      CAD System Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        The integrated CAD (Computer-Aided Design) system in Lift Planner Pro provides professional
                        2D and 3D visualization tools for comprehensive lift planning and site layout design.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Key Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">2D Site Planning</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Site layout design and planning</li>
                            <li>• Crane positioning optimization</li>
                            <li>• Obstacle identification and mapping</li>
                            <li>• Access route planning</li>
                            <li>• Ground condition assessment</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">3D Visualization</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• 3D crane modeling and simulation</li>
                            <li>• Load path visualization</li>
                            <li>• Clearance analysis</li>
                            <li>• Multi-crane interference checking</li>
                            <li>• Real-time collision detection</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Drawing Tools</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          'Line Drawing',
                          'Shape Tools',
                          'Measurement',
                          'Annotation',
                          'Dimensioning',
                          'Layer Management',
                          'Symbol Library',
                          'Grid & Snap'
                        ].map((tool) => (
                          <div key={tool} className="p-2 bg-slate-700/30 rounded text-center text-sm">
                            {tool}
                          </div>
                        ))}
                      </div>

                      <h3 className="text-white text-lg font-semibold">Export Formats</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded">
                          <h4 className="text-blue-300 font-medium">DWG/DXF</h4>
                          <p className="text-blue-200 text-sm">AutoCAD compatible formats</p>
                        </div>
                        <div className="p-3 bg-green-900/20 border border-green-500/50 rounded">
                          <h4 className="text-green-300 font-medium">PDF</h4>
                          <p className="text-green-200 text-sm">Professional documentation</p>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded">
                          <h4 className="text-purple-300 font-medium">PNG/JPG</h4>
                          <p className="text-purple-200 text-sm">High-resolution images</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 3D CAD Tools Documentation */}
              <TabsContent value="cad-3d-tools" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Box className="w-6 h-6 mr-3" />
                      3D CAD Tools Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        The 3D CAD Tools provide professional-grade 3D modeling and visualization capabilities for
                        designing cranes, structures, and industrial equipment with precision and ease.
                      </p>

                      <h3 className="text-white text-lg font-semibold">🎮 Camera Controls</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Mouse Controls</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>Middle Mouse + Drag</strong> - Rotate view</li>
                            <li>• <strong>Scroll Wheel Up</strong> - Zoom in</li>
                            <li>• <strong>Scroll Wheel Down</strong> - Zoom out</li>
                            <li>• <strong>Right Mouse + Drag</strong> - Pan view</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Keyboard Shortcuts</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>0</strong> - Perspective view (rotatable)</li>
                            <li>• <strong>1</strong> - Top view</li>
                            <li>• <strong>2</strong> - Front view</li>
                            <li>• <strong>3</strong> - Right view</li>
                            <li>• <strong>4</strong> - Back view</li>
                            <li>• <strong>Q</strong> - Toggle quad view</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">🛠️ Modeling Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Selection & Transform</h4>
                            <ul className="text-sm text-slate-300 space-y-1 mt-2">
                              <li>• <strong>Select (S)</strong> - Click to select objects</li>
                              <li>• <strong>Move (M)</strong> - Move along X, Y, Z axes</li>
                              <li>• <strong>Rotate (R)</strong> - Rotate around axes</li>
                              <li>• <strong>Scale (E)</strong> - Scale uniformly or per-axis</li>
                            </ul>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Edit Operations</h4>
                            <ul className="text-sm text-slate-300 space-y-1 mt-2">
                              <li>• <strong>Copy</strong> - Duplicate selected object</li>
                              <li>• <strong>Delete</strong> - Remove selected object</li>
                              <li>• <strong>Selection Levels</strong> - Object/Face/Edge/Vertex</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Modify Tools</h4>
                            <ul className="text-sm text-slate-300 space-y-1 mt-2">
                              <li>• <strong>Trim</strong> - Cut/remove parts of geometry</li>
                              <li>• <strong>Extend</strong> - Extend edges to meet geometry</li>
                              <li>• <strong>Break</strong> - Split geometry at point</li>
                              <li>• <strong>Stretch</strong> - Stretch while maintaining connections</li>
                            </ul>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Fillet & Chamfer</h4>
                            <ul className="text-sm text-slate-300 space-y-1 mt-2">
                              <li>• <strong>Fillet</strong> - Round edges (0.1m default)</li>
                              <li>• <strong>Chamfer</strong> - Bevel edges (0.05m default)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">🎨 Generate & Draw Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Generate</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>Revolve</strong> - Rotate 2D sketch around axis</li>
                            <li>• <strong>Sweep</strong> - Sweep profile along path</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Draw</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>Line (L)</strong> - Draw straight lines</li>
                            <li>• <strong>Rectangle</strong> - Draw rectangles</li>
                            <li>• <strong>Circle</strong> - Draw circles</li>
                            <li>• <strong>Polyline</strong> - Draw multi-point paths</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">🔨 Solid & Boolean Operations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Solid Operations</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>Extrude</strong> - Pull face/sketch upward (1m default)</li>
                            <li>• <strong>Array</strong> - Create linear copies (x5 default)</li>
                            <li>• <strong>Mirror</strong> - Mirror across plane (YZ default)</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Boolean Operations</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• <strong>Union (+)</strong> - Combine objects</li>
                            <li>• <strong>Subtract (-)</strong> - Remove object B from A</li>
                            <li>• <strong>Intersect (∩)</strong> - Keep overlapping volume</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">📦 Insert Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Primitives</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Box, Sphere, Cylinder, Tube</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Structural Profiles</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• H-Beam, I-Beam, Channel, Pipe, Tank, Vessel</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Crane Parts</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Chassis, Cab, Wheel, Boom, Jib</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Rigging</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Hoist, Hook, Load, Counterweight, Outrigger, Trolley</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Professional</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Realistic Wheel, DIN Hook, Wire Rope, Hoist Drum, Boom Head</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">📋 Properties Panel</h3>
                      <p className="text-sm text-slate-300">
                        Located on the right side. Edit selected object properties:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• <strong>Position (X, Y, Z)</strong> - Object location in meters</li>
                          <li>• <strong>Rotation (°)</strong> - Orientation in degrees</li>
                          <li>• <strong>Scale</strong> - Size (1.0 = original)</li>
                        </ul>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• <strong>Color</strong> - Click to choose color</li>
                          <li>• <strong>Visible</strong> - Toggle visibility</li>
                        </ul>
                      </div>

                      <h3 className="text-white text-lg font-semibold">💾 File Operations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded">
                          <h4 className="text-blue-300 font-medium">New</h4>
                          <p className="text-blue-200 text-sm">Clear scene and start fresh</p>
                        </div>
                        <div className="p-3 bg-green-900/20 border border-green-500/50 rounded">
                          <h4 className="text-green-300 font-medium">Open</h4>
                          <p className="text-green-200 text-sm">Load .cad3d.json file</p>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-500/50 rounded">
                          <h4 className="text-purple-300 font-medium">Save</h4>
                          <p className="text-purple-200 text-sm">Save as .cad3d.json</p>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">🚀 Quick Start Workflow</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1">1</div>
                          <div>
                            <p className="text-white font-medium">Insert Chassis</p>
                            <p className="text-slate-400 text-sm">Click INSERT → Chassis under Crane Parts</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1">2</div>
                          <div>
                            <p className="text-white font-medium">Add Boom</p>
                            <p className="text-slate-400 text-sm">Click Boom under Boom & Jib, position with Move tool</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1">3</div>
                          <div>
                            <p className="text-white font-medium">Add Hook & Load</p>
                            <p className="text-slate-400 text-sm">Insert Hook and Load from Rigging section</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1">4</div>
                          <div>
                            <p className="text-white font-medium">Adjust View & Save</p>
                            <p className="text-slate-400 text-sm">Use camera controls to view, then save your project</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">⚡ Tips & Tricks</h3>
                      <div className="space-y-2">
                        {[
                          'Use Selection Levels (Object/Face/Edge/Vertex) for precise editing',
                          'World Space Gizmo keeps alignment to world axes, not object rotation',
                          'Press Q to see all 4 views at once for better spatial understanding',
                          'Group related parts together for easier manipulation',
                          'Save frequently to avoid losing changes',
                          'Use different colors to organize objects by type'
                        ].map((tip, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-1" />
                            <span className="text-slate-300 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Step Plans Documentation */}
              <TabsContent value="step-plans" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="w-6 h-6 mr-3" />
                      Step Plans Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Step Plans provide detailed sequence documentation for complex lifting operations,
                        ensuring all team members understand the planned execution sequence.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Plan Components</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Sequential Steps</h4>
                          <p className="text-sm text-slate-300">
                            Detailed step-by-step instructions for the entire lifting operation,
                            from setup to completion with time estimates and resource requirements.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Visual Documentation</h4>
                          <p className="text-sm text-slate-300">
                            Integrated CAD drawings, photographs, and diagrams to illustrate
                            each step clearly for all team members.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Resource Planning</h4>
                          <p className="text-sm text-slate-300">
                            Personnel requirements, equipment needs, and material specifications
                            for each phase of the operation.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Export Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Download className="w-5 h-5 text-blue-400 mr-2" />
                            <h4 className="text-blue-300 font-semibold">HTML Export</h4>
                          </div>
                          <p className="text-blue-200 text-sm">
                            Interactive web-based step plans with navigation, search, and responsive design
                            for viewing on tablets and mobile devices on-site.
                          </p>
                        </div>
                        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-green-400 mr-2" />
                            <h4 className="text-green-300 font-semibold">PDF Export</h4>
                          </div>
                          <p className="text-green-200 text-sm">
                            Professional PDF documents with industry-standard formatting,
                            company branding, and print-ready layouts for distribution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* RAMS Documentation */}
              <TabsContent value="rams" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3" />
                      RAMS (Risk Assessment & Method Statements)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Comprehensive Risk Assessment and Method Statement generation tools to ensure
                        compliance with health and safety regulations and industry best practices.
                      </p>

                      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                          <h4 className="text-red-300 font-semibold">Legal Compliance</h4>
                        </div>
                        <p className="text-red-200 text-sm">
                          RAMS documentation is legally required for most lifting operations.
                          Ensure all assessments are reviewed by qualified personnel.
                        </p>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Risk Assessment Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Hazard Identification</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Automated hazard detection</li>
                            <li>• Industry-standard risk matrices</li>
                            <li>• Environmental factor assessment</li>
                            <li>• Equipment-specific risks</li>
                            <li>• Personnel safety considerations</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Control Measures</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Mitigation strategy recommendations</li>
                            <li>• PPE requirements specification</li>
                            <li>• Emergency procedure planning</li>
                            <li>• Training requirement identification</li>
                            <li>• Monitoring and review protocols</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Method Statement Components</h3>
                      <div className="space-y-3">
                        {[
                          { title: 'Scope of Work', desc: 'Detailed description of the lifting operation and objectives' },
                          { title: 'Personnel & Responsibilities', desc: 'Team roles, qualifications, and specific responsibilities' },
                          { title: 'Equipment & Materials', desc: 'Complete inventory of required equipment and materials' },
                          { title: 'Step-by-Step Procedures', desc: 'Detailed methodology for safe execution' },
                          { title: 'Emergency Procedures', desc: 'Response plans for potential emergency situations' },
                          { title: 'Quality Control', desc: 'Inspection points and quality assurance measures' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-1">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.title}</p>
                              <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rigging Loft Documentation */}
              <TabsContent value="rigging-loft" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Weight className="w-6 h-6 mr-3" />
                      Rigging Loft Management System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Comprehensive equipment certification tracking and management system for all lifting
                        equipment, ensuring compliance with inspection schedules and safety standards.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Equipment Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                            <h4 className="text-blue-300 font-semibold">Certification Tracking</h4>
                          </div>
                          <ul className="text-blue-200 text-sm space-y-1">
                            <li>• Certificate expiry monitoring</li>
                            <li>• Automatic renewal alerts</li>
                            <li>• Compliance status tracking</li>
                            <li>• Digital certificate storage</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Target className="w-5 h-5 text-green-400 mr-2" />
                            <h4 className="text-green-300 font-semibold">Service Status</h4>
                          </div>
                          <ul className="text-green-200 text-sm space-y-1">
                            <li>• In-service equipment tracking</li>
                            <li>• Out-of-service management</li>
                            <li>• Maintenance scheduling</li>
                            <li>• Repair history logging</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-purple-400 mr-2" />
                            <h4 className="text-purple-300 font-semibold">Documentation</h4>
                          </div>
                          <ul className="text-purple-200 text-sm space-y-1">
                            <li>• Inspection reports</li>
                            <li>• Usage logs</li>
                            <li>• Incident reporting</li>
                            <li>• Audit trail maintenance</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Equipment Categories</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          'Wire Rope Slings',
                          'Chain Slings',
                          'Synthetic Slings',
                          'Shackles',
                          'Hooks',
                          'Spreader Beams',
                          'Lifting Frames',
                          'Rigging Hardware',
                          'Load Blocks',
                          'Turnbuckles',
                          'Eye Bolts',
                          'Clamps & Grips'
                        ].map((category) => (
                          <div key={category} className="p-2 bg-slate-700/30 rounded text-center text-sm">
                            {category}
                          </div>
                        ))}
                      </div>

                      <h3 className="text-white text-lg font-semibold">Compliance Features</h3>
                      <div className="space-y-2">
                        {[
                          'LOLER (Lifting Operations and Lifting Equipment Regulations) compliance',
                          'PUWER (Provision and Use of Work Equipment Regulations) adherence',
                          'BS EN standards compliance tracking',
                          'Custom inspection interval configuration',
                          'Multi-level approval workflows',
                          'Integration with external testing services'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Crane Database Documentation */}
              <TabsContent value="crane-database" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Truck className="w-6 h-6 mr-3" />
                      Crane Database Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Our comprehensive crane database includes detailed specifications for over 50 crane models 
                        from major manufacturers, covering capacities from 30 tonnes to 3000 tonnes.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Supported Manufacturers</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: 'Liebherr', models: '15+ models', range: '30t - 3000t' },
                          { name: 'Grove', models: '12+ models', range: '30t - 750t' },
                          { name: 'Tadano', models: '10+ models', range: '30t - 600t' },
                          { name: 'Manitowoc', models: '8+ models', range: '30t - 680t' },
                          { name: 'Link-Belt', models: '5+ models', range: '30t - 90t' },
                          { name: 'Terex', models: '3+ models', range: '1000t+' }
                        ].map((manufacturer) => (
                          <div key={manufacturer.name} className="p-3 bg-slate-700/50 rounded-lg">
                            <h4 className="text-white font-medium">{manufacturer.name}</h4>
                            <p className="text-sm text-slate-400">{manufacturer.models}</p>
                            <p className="text-xs text-slate-500">{manufacturer.range}</p>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-white text-lg font-semibold">Crane Categories</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Mobile Cranes (30t - 800t)</h4>
                          <p className="text-sm text-slate-300">
                            All-terrain and rough terrain mobile cranes for construction and industrial applications.
                            Includes detailed load charts with radius and height specifications.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Crawler Cranes (680t - 3000t)</h4>
                          <p className="text-sm text-slate-300">
                            Heavy-lift crawler cranes for major construction and industrial projects.
                            Specialized for extreme heavy lifting operations.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Specification Data</h3>
                      <p className="text-sm">Each crane model includes:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Maximum lifting capacity</li>
                          <li>• Operating radius ranges</li>
                          <li>• Maximum lift heights</li>
                          <li>• Ground pressure ratings</li>
                        </ul>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Wind speed limitations</li>
                          <li>• Setup time requirements</li>
                          <li>• Operating cost estimates</li>
                          <li>• Detailed load charts</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Multi-Crane Documentation */}
              <TabsContent value="multi-crane" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Layers className="w-6 h-6 mr-3" />
                      Multi-Crane Operations Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Multi-crane operations require specialized planning and coordination. Our advanced
                        multi-crane calculator helps you plan complex lifts involving multiple cranes working together.
                      </p>

                      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                          <h4 className="text-red-300 font-semibold">Critical Safety Warning</h4>
                        </div>
                        <p className="text-red-200 text-sm">
                          Multi-crane operations are extremely complex and dangerous. Always consult with certified
                          lifting engineers and follow all manufacturer guidelines and local regulations.
                        </p>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Key Considerations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Load Distribution</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Calculate individual crane loads</li>
                            <li>• Account for load center of gravity</li>
                            <li>• Consider dynamic load effects</li>
                            <li>• Plan for load swing and movement</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Coordination Requirements</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Establish clear communication protocols</li>
                            <li>• Designate a single lift director</li>
                            <li>• Synchronize crane movements</li>
                            <li>• Plan emergency procedures</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Safety Guidelines */}
              <TabsContent value="safety" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-6 h-6 mr-3" />
                      Safety Guidelines & Standards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Safety is paramount in all lifting operations. Lift Planner Pro incorporates industry-standard
                        safety factors and guidelines to help ensure safe lifting operations.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Industry Standards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">International Standards</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• ISO 4301 - Crane safety standards</li>
                            <li>• EN 13000 - Mobile crane standards</li>
                            <li>• ASME B30.5 - Mobile crane safety</li>
                            <li>• API RP 2D - Offshore lifting</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-slate-700/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Safety Factors</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Standard lifts: 1.25 minimum</li>
                            <li>• Heavy lifts: 1.5 recommended</li>
                            <li>• Critical lifts: 2.0 required</li>
                            <li>• Personnel lifts: 3.0 minimum</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Management Documentation */}
              <TabsContent value="user-management" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-6 h-6 mr-3" />
                      User Management & Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Comprehensive user management system with role-based access control,
                        authentication, and security features for enterprise deployment.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Authentication Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <User className="w-5 h-5 text-blue-400 mr-2" />
                            <h4 className="text-blue-300 font-semibold">Local Authentication</h4>
                          </div>
                          <p className="text-blue-200 text-sm">
                            Secure username/password authentication with password policies and MFA support.
                          </p>
                        </div>
                        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Shield className="w-5 h-5 text-green-400 mr-2" />
                            <h4 className="text-green-300 font-semibold">SSO Integration</h4>
                          </div>
                          <p className="text-green-200 text-sm">
                            Single Sign-On integration with Active Directory, LDAP, and OAuth providers.
                          </p>
                        </div>
                        <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Lock className="w-5 h-5 text-purple-400 mr-2" />
                            <h4 className="text-purple-300 font-semibold">API Authentication</h4>
                          </div>
                          <p className="text-purple-200 text-sm">
                            API key and token-based authentication for system integrations.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">User Roles & Permissions</h3>
                      <div className="space-y-3">
                        {[
                          { role: 'Administrator', desc: 'Full system access, user management, system configuration', color: 'red' },
                          { role: 'Lift Planner', desc: 'Create and modify lift plans, access all calculation tools', color: 'blue' },
                          { role: 'Site Manager', desc: 'View and approve lift plans, access reports and documentation', color: 'green' },
                          { role: 'Rigger', desc: 'Access rigging loft, equipment management, basic calculations', color: 'yellow' },
                          { role: 'Viewer', desc: 'Read-only access to approved plans and documentation', color: 'gray' }
                        ].map((item) => (
                          <div key={item.role} className={`p-3 bg-${item.color}-900/20 border border-${item.color}-500/50 rounded-lg`}>
                            <div className="flex items-center justify-between">
                              <h4 className={`text-${item.color}-300 font-medium`}>{item.role}</h4>
                              <Badge className={`bg-${item.color}-600`}>{item.role}</Badge>
                            </div>
                            <p className={`text-${item.color}-200 text-sm mt-1`}>{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-white text-lg font-semibold">Security Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Access Control</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Role-based permissions</li>
                            <li>• Project-level access control</li>
                            <li>• IP address restrictions</li>
                            <li>• Session management</li>
                            <li>• Audit logging</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Data Protection</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• End-to-end encryption</li>
                            <li>• Secure data storage</li>
                            <li>• GDPR compliance</li>
                            <li>• Data backup & recovery</li>
                            <li>• Privacy controls</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports & Export Documentation */}
              <TabsContent value="reports-export" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Download className="w-6 h-6 mr-3" />
                      Reports & Export System
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Professional documentation generation and export system with industry-standard
                        formatting, custom branding, and multiple output formats.
                      </p>

                      <h3 className="text-white text-lg font-semibold">Report Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Lift Plan Reports</h4>
                            <p className="text-slate-400 text-sm">Complete lift planning documentation with calculations, drawings, and safety analysis</p>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">RAMS Documentation</h4>
                            <p className="text-slate-400 text-sm">Risk assessments and method statements with regulatory compliance</p>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Equipment Certificates</h4>
                            <p className="text-slate-400 text-sm">Rigging equipment certification reports and inspection schedules</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Step Plan Documents</h4>
                            <p className="text-slate-400 text-sm">Sequential operation plans with visual documentation</p>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Crane Load Charts</h4>
                            <p className="text-slate-400 text-sm">Detailed capacity charts and performance data</p>
                          </div>
                          <div className="p-3 bg-slate-700/30 rounded">
                            <h4 className="text-white font-medium">Project Summaries</h4>
                            <p className="text-slate-400 text-sm">Executive summaries and project overview reports</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Export Formats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { format: 'PDF', desc: 'Professional documents', icon: '📄' },
                          { format: 'HTML', desc: 'Interactive web pages', icon: '🌐' },
                          { format: 'Word', desc: 'Editable documents', icon: '📝' },
                          { format: 'Excel', desc: 'Data spreadsheets', icon: '📊' },
                          { format: 'DWG/DXF', desc: 'CAD drawings', icon: '📐' },
                          { format: 'PNG/JPG', desc: 'High-res images', icon: '🖼️' },
                          { format: 'CSV', desc: 'Data export', icon: '📋' },
                          { format: 'XML', desc: 'Structured data', icon: '🔗' }
                        ].map((item) => (
                          <div key={item.format} className="p-3 bg-slate-700/30 rounded text-center">
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <div className="text-white font-medium text-sm">{item.format}</div>
                            <div className="text-slate-400 text-xs">{item.desc}</div>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-white text-lg font-semibold">Customization Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Branding & Layout</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Company logo integration</li>
                            <li>• Custom color schemes</li>
                            <li>• Header/footer customization</li>
                            <li>• Template management</li>
                            <li>• Font and styling options</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Content Control</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Section inclusion/exclusion</li>
                            <li>• Custom field addition</li>
                            <li>• Approval workflows</li>
                            <li>• Version control</li>
                            <li>• Digital signatures</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Info className="w-5 h-5 text-blue-400 mr-2" />
                          <h4 className="text-blue-300 font-semibold">Professional Standards</h4>
                        </div>
                        <p className="text-blue-200 text-sm">
                          All exported documents meet industry standards for professional presentation
                          and regulatory compliance, suitable for client delivery and regulatory submission.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Reference */}
              <TabsContent value="api" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-6 h-6 mr-3" />
                      API Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-slate-300 space-y-4">
                      <p>
                        Lift Planner Pro provides a comprehensive API for integration with other systems
                        and automation of lifting calculations.
                      </p>

                      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Info className="w-5 h-5 text-blue-400 mr-2" />
                          <h4 className="text-blue-300 font-semibold">API Access</h4>
                        </div>
                        <p className="text-blue-200 text-sm">
                          API access is available for Pro and Enterprise subscribers. Contact support for API keys and documentation.
                        </p>
                      </div>

                      <h3 className="text-white text-lg font-semibold">Available Endpoints</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-700/30 rounded border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm">GET /api/cranes</span>
                            <Badge className="bg-green-600">GET</Badge>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">Retrieve available crane models and specifications</p>
                        </div>
                        <div className="p-3 bg-slate-700/30 rounded border-l-4 border-blue-500">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm">POST /api/calculate</span>
                            <Badge className="bg-blue-600">POST</Badge>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">Perform crane capacity calculations</p>
                        </div>
                        <div className="p-3 bg-slate-700/30 rounded border-l-4 border-purple-500">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-mono text-sm">POST /api/multi-crane</span>
                            <Badge className="bg-purple-600">POST</Badge>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">Multi-crane load distribution calculations</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
