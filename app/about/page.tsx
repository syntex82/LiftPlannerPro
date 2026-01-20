"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Building2,
  Shield,
  Code,
  Award,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Truck,
  Calculator,
  Users,
  Target,
  Zap,
  Lock,
  CheckCircle,
  Star,
  Calendar,
  Briefcase,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">About Lift Planner Pro</h1>
                <p className="text-slate-400">Professional crane planning software by DarkSpace Software & Security</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Company Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building2 className="w-6 h-6 mr-3" />
              Lift Planner Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-slate-300">
                  <p className="text-lg mb-4">
                    Lift Planner Pro is a specialized CAD software application focused on
                    creating professional-grade tools for the lifting and rigging industry.
                  </p>
                  <p className="mb-4">
                    Our mission is to develop innovative, secure, and reliable software solutions that enhance 
                    safety and efficiency in critical industrial operations. We combine deep industry knowledge 
                    with cutting-edge technology to deliver tools that professionals can trust.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 text-blue-400 mr-2" />
                      <h3 className="text-white font-semibold">Security First</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                      Enterprise-grade security and data protection
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Code className="w-5 h-5 text-green-400 mr-2" />
                      <h3 className="text-white font-semibold">Quality Code</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                      Professional development standards and practices
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white text-xl font-semibold">Company Specializations</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Construction Software</p>
                      <p className="text-slate-400 text-sm">Specialized tools for lifting and construction operations</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 text-green-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Engineering Calculations</p>
                      <p className="text-slate-400 text-sm">Professional-grade calculation engines and algorithms</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-purple-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Security Solutions</p>
                      <p className="text-slate-400 text-sm">Cybersecurity consulting and secure application development</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Enterprise Solutions</p>
                      <p className="text-slate-400 text-sm">Custom software development for industrial clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-6 h-6 mr-3" />
              Lead Developer - Michael J Blenkinsop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="text-slate-300">
                  <p className="text-lg mb-4">
                    Michael J Blenkinsop is the founder and lead developer of Lift Planner Pro,
                    bringing extensive experience in software engineering and industrial applications.
                  </p>
                  <p className="mb-4">
                    With a background in both software development and construction industry operations, 
                    Michael combines technical expertise with real-world understanding of the challenges 
                    faced by lifting professionals and construction teams.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white text-lg font-semibold">Professional Expertise</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-slate-300 text-sm">Full-Stack Development</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-slate-300 text-sm">React & Next.js</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-slate-300 text-sm">TypeScript & JavaScript</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-slate-300 text-sm">Database Design</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-slate-300 text-sm">Cybersecurity</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-slate-300 text-sm">Cloud Architecture</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-slate-300 text-sm">API Development</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-slate-300 text-sm">Industrial Software</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-slate-300">m.blenkinsop@yahoo.co.uk</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-slate-300">Lift Planner Pro</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-slate-300">liftplannerpro.org</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Professional Links</h4>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub Profile
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Truck className="w-6 h-6 mr-3" />
              About Lift Planner Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-slate-300">
                  <p className="text-lg mb-4">
                    Lift Planner Pro represents the culmination of extensive research into crane operations, 
                    safety standards, and professional lifting practices. Developed specifically for the 
                    construction and industrial sectors.
                  </p>
                  <p className="mb-4">
                    The software incorporates real-world crane specifications from major manufacturers and 
                    implements industry-standard calculation methods to provide accurate, reliable lift planning tools.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white text-lg font-semibold">Complete Feature Set</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Advanced Load Calculator</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Integrated CAD System</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Step Plan Generator</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">RAMS Documentation</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Rigging Loft Management</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">50+ Crane Models Database</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Multi-Crane Operations</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">User Management System</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Professional Reports</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">HTML/PDF Export</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">Safety Analysis</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-slate-300">API Integration</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold">Technology Stack</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Next.js 14',
                    'React 18',
                    'TypeScript',
                    'Tailwind CSS',
                    'NextAuth.js',
                    'Prisma ORM',
                    'PostgreSQL',
                    'Vercel'
                  ].map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                    <h4 className="text-blue-300 font-semibold">Version Information</h4>
                  </div>
                  <div className="text-blue-200 text-sm space-y-1">
                    <div>Current Version: 1.0.0</div>
                    <div>Release Date: 2024</div>
                    <div>Last Updated: December 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <div className="text-slate-400 text-sm">
            <p>© 2024 Lift Planner Pro. All rights reserved.</p>
            <p className="mt-2">Developed by Michael J Blenkinsop</p>
          </div>
        </div>
      </div>
    </div>
  )
}
