"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Home, 
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  ExternalLink
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SafetyResource {
  id: string
  title: string
  category: string
  description: string
  content: string
  tags: string[]
  lastUpdated: string
  regulation?: string
}

const safetyResources: SafetyResource[] = [
  {
    id: "1",
    title: "Pre-Lift Safety Checklist",
    category: "Checklists",
    description: "Comprehensive checklist to ensure all safety measures are in place before lifting operations",
    content: `
# Pre-Lift Safety Checklist

## Equipment Inspection
- [ ] Crane inspection certificate current
- [ ] Load block and hook inspection
- [ ] Wire rope condition check
- [ ] Outrigger pads properly positioned
- [ ] Ground conditions assessed

## Personnel Requirements
- [ ] Qualified crane operator present
- [ ] Signaller/banksman appointed
- [ ] All personnel briefed on lift plan
- [ ] Exclusion zones established
- [ ] Emergency procedures communicated

## Environmental Conditions
- [ ] Weather conditions suitable
- [ ] Wind speed within limits
- [ ] Visibility adequate
- [ ] Overhead hazards identified
- [ ] Underground services located

## Load Preparation
- [ ] Load weight verified
- [ ] Center of gravity determined
- [ ] Lifting points identified
- [ ] Rigging equipment inspected
- [ ] Load secured properly
    `,
    tags: ["checklist", "pre-lift", "safety", "inspection"],
    lastUpdated: "2024-01-15",
    regulation: "BS 7121"
  },
  {
    id: "2",
    title: "Crane Operator Responsibilities",
    category: "Procedures",
    description: "Detailed responsibilities and duties of crane operators during lifting operations",
    content: `
# Crane Operator Responsibilities

## Before Operation
- Conduct pre-use inspection
- Check load charts and capacity
- Verify ground conditions
- Test all controls and safety devices
- Ensure clear communication with signaller

## During Operation
- Maintain constant vigilance
- Follow signaller instructions
- Monitor load at all times
- Stay within rated capacity
- Stop immediately if unsafe conditions arise

## After Operation
- Secure crane properly
- Complete operation log
- Report any defects or incidents
- Conduct post-use inspection
    `,
    tags: ["operator", "responsibilities", "procedures"],
    lastUpdated: "2024-01-10",
    regulation: "LOLER 1998"
  },
  {
    id: "3",
    title: "Lifting Equipment Inspection Requirements",
    category: "Regulations",
    description: "Legal requirements for inspection and certification of lifting equipment",
    content: `
# Lifting Equipment Inspection Requirements

## LOLER 1998 Requirements
- Thorough examination every 6 months for lifting accessories
- Thorough examination every 12 months for lifting equipment
- Competent person must conduct examinations
- Records must be kept for 2 years

## Daily Inspections
- Visual inspection before first use
- Check for obvious defects
- Verify safe working load markings
- Test safety devices

## Periodic Inspections
- Detailed examination by competent person
- Non-destructive testing where required
- Load testing if specified
- Certification required
    `,
    tags: ["inspection", "LOLER", "regulations", "certification"],
    lastUpdated: "2024-01-20",
    regulation: "LOLER 1998"
  },
  {
    id: "4",
    title: "Emergency Procedures for Lifting Operations",
    category: "Emergency",
    description: "Step-by-step emergency procedures for various lifting operation scenarios",
    content: `
# Emergency Procedures for Lifting Operations

## Load Drop Emergency
1. Sound alarm immediately
2. Evacuate danger area
3. Secure the scene
4. Check for injuries
5. Contact emergency services if required
6. Preserve evidence
7. Report to authorities

## Equipment Failure
1. Stop operation immediately
2. Lower load safely if possible
3. Evacuate area under suspended load
4. Isolate equipment
5. Contact competent person
6. Do not attempt repairs

## Medical Emergency
1. Stop all operations
2. Secure equipment safely
3. Provide first aid
4. Call emergency services
5. Clear access routes
6. Designate person to meet emergency services
    `,
    tags: ["emergency", "procedures", "safety", "incident"],
    lastUpdated: "2024-01-12"
  },
  {
    id: "5",
    title: "Wind Speed Limitations for Crane Operations",
    category: "Guidelines",
    description: "Guidelines for safe crane operation in various wind conditions",
    content: `
# Wind Speed Limitations for Crane Operations

## General Guidelines
- Monitor wind speed continuously
- Consider gusting effects
- Account for load surface area
- Follow manufacturer's recommendations

## Typical Limits
- Mobile cranes: 20 mph (32 km/h) sustained
- Tower cranes: 25 mph (40 km/h) sustained
- Crawler cranes: 30 mph (48 km/h) sustained
- Special operations: As per lift plan

## High Wind Procedures
- Secure crane in weathervaning position
- Remove or secure loose components
- Lower boom if required
- Evacuate cab if necessary
- Monitor weather forecasts
    `,
    tags: ["wind", "weather", "limitations", "guidelines"],
    lastUpdated: "2024-01-18"
  }
]

export default function SafetyLibrary() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedResource, setSelectedResource] = useState<SafetyResource | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const categories = ['All', ...Array.from(new Set(safetyResources.map(r => r.category)))]

  const filteredResources = safetyResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const downloadResource = (resource: SafetyResource) => {
    const content = `# ${resource.title}\n\n${resource.description}\n\n${resource.content}\n\n---\nGenerated by Lift Planner Pro\nLast Updated: ${resource.lastUpdated}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${resource.title.replace(/\s+/g, '_')}.md`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Safety Library...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Image src="/company-logo.png" alt="Lift Planner Pro" width={24} height={24} className="rounded" />
              <span className="text-white font-semibold">Safety Resource Library</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Safety Resource Library</h1>
              <p className="text-slate-400">Comprehensive safety guidelines and best practices</p>
            </div>
          </div>
          
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h3 className="text-green-300 font-semibold">Stay Compliant</h3>
                <p className="text-green-200 text-sm">
                  Access up-to-date safety regulations, procedures, and best practices for lifting operations. 
                  All resources are regularly updated to reflect current standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Filter */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm font-medium">Category</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-slate-600 text-slate-300 hover:bg-slate-800"
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm">
                    {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource List */}
          <div className="lg:col-span-2">
            {selectedResource ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-xl">{selectedResource.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-blue-600">{selectedResource.category}</Badge>
                        {selectedResource.regulation && (
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {selectedResource.regulation}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => downloadResource(selectedResource)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => setSelectedResource(null)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                      {selectedResource.content}
                    </pre>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div>Last updated: {selectedResource.lastUpdated}</div>
                      <div className="flex space-x-4">
                        {selectedResource.tags.map((tag) => (
                          <span key={tag} className="text-blue-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">{resource.title}</CardTitle>
                          <p className="text-slate-400 text-sm mt-1">{resource.description}</p>
                          <div className="flex items-center space-x-2 mt-3">
                            <Badge className="bg-blue-600">{resource.category}</Badge>
                            {resource.regulation && (
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {resource.regulation}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setSelectedResource(resource)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read
                          </Button>
                          <Button
                            onClick={() => downloadResource(resource)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div>Updated: {resource.lastUpdated}</div>
                        <div className="flex space-x-2">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-blue-400">#{tag}</span>
                          ))}
                          {resource.tags.length > 3 && (
                            <span className="text-slate-500">+{resource.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredResources.length === 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-slate-300 text-lg font-semibold mb-2">No resources found</h3>
                      <p className="text-slate-400">Try adjusting your search terms or category filter</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
