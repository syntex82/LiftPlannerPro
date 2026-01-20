'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Users, 
  ShoppingCart, 
  Target, 
  DollarSign, 
  Calendar,
  Award,
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  Star
} from "lucide-react"

export default function AlternativeStreams() {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const revenueStreams = [
    {
      id: 'consulting',
      title: 'Lifting Engineering Consulting',
      description: 'One-on-one project consulting and engineering services',
      revenue: '£150-500/hour',
      effort: 'High',
      scalability: 'Medium',
      icon: Briefcase,
      color: 'blue',
      services: [
        'Project Planning & Risk Assessment',
        'Lifting Plan Development',
        'Equipment Selection & Sizing',
        'Safety Analysis & Documentation',
        'Site Supervision & Support'
      ]
    },
    {
      id: 'training',
      title: 'Online Training Courses',
      description: 'Comprehensive lifting engineering certification programs',
      revenue: '£97-497/course',
      effort: 'Medium',
      scalability: 'High',
      icon: BookOpen,
      color: 'green',
      services: [
        'Lifting Engineering Fundamentals',
        'Advanced Rigging Techniques',
        'Safety Management Systems',
        'Equipment Inspection Certification',
        'Project Management for Lifting'
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Sales & Partnerships',
      description: 'Curated equipment marketplace and affiliate commissions',
      revenue: '5-15% commission',
      effort: 'Low',
      scalability: 'High',
      icon: ShoppingCart,
      color: 'purple',
      services: [
        'Rigging Equipment Marketplace',
        'Manufacturer Partnerships',
        'Equipment Recommendations',
        'Bulk Purchase Discounts',
        'Equipment Financing Options'
      ]
    },
    {
      id: 'advertising',
      title: 'Industry Advertising & Sponsorships',
      description: 'Premium advertising space for industry suppliers',
      revenue: '£500-5000/month',
      effort: 'Low',
      scalability: 'High',
      icon: Target,
      color: 'orange',
      services: [
        'Banner Advertising',
        'Sponsored Content',
        'Newsletter Sponsorships',
        'Webinar Partnerships',
        'Directory Listings'
      ]
    }
  ]

  const successMetrics = {
    consulting: {
      potential: '£10,000-50,000/month',
      timeToRevenue: '1-2 weeks',
      requirements: 'Professional credentials, portfolio'
    },
    training: {
      potential: '£5,000-25,000/month',
      timeToRevenue: '2-3 months',
      requirements: 'Course creation, marketing'
    },
    equipment: {
      potential: '£2,000-15,000/month',
      timeToRevenue: '1-2 months',
      requirements: 'Supplier partnerships, trust'
    },
    advertising: {
      potential: '£3,000-20,000/month',
      timeToRevenue: '1-3 months',
      requirements: 'High traffic, engaged audience'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Multiple Revenue Streams Strategy
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Don't rely solely on subscriptions. Diversify your income with these proven revenue streams 
          that leverage your existing traffic and expertise.
        </p>
      </div>

      {/* Revenue Stream Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {revenueStreams.map((stream) => (
          <Card 
            key={stream.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedService === stream.id ? `border-${stream.color}-500 ring-2 ring-${stream.color}-200` : ''
            }`}
            onClick={() => setSelectedService(selectedService === stream.id ? null : stream.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${stream.color}-100 rounded-lg flex items-center justify-center`}>
                  <stream.icon className={`w-5 h-5 text-${stream.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{stream.title}</h3>
                  <p className="text-sm text-gray-600 font-normal">{stream.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="font-semibold text-green-600">{stream.revenue}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Effort</p>
                  <Badge variant={stream.effort === 'High' ? 'destructive' : stream.effort === 'Medium' ? 'default' : 'secondary'}>
                    {stream.effort}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Scale</p>
                  <Badge variant={stream.scalability === 'High' ? 'default' : 'secondary'}>
                    {stream.scalability}
                  </Badge>
                </div>
              </div>

              {selectedService === stream.id && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Services Offered:</h4>
                    <ul className="space-y-1">
                      {stream.services.map((service, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold mb-2">Revenue Potential:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Potential:</span>
                        <p className="font-semibold text-green-600">{successMetrics[stream.id as keyof typeof successMetrics].potential}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time to Revenue:</span>
                        <p className="font-semibold">{successMetrics[stream.id as keyof typeof successMetrics].timeToRevenue}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600">Requirements:</span>
                      <p className="text-sm">{successMetrics[stream.id as keyof typeof successMetrics].requirements}</p>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => window.open(`mailto:mickyblenk@gmail.com?subject=Interest in ${stream.title}`, '_blank')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Get Started with {stream.title}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            90-Day Implementation Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="month1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month1">Month 1: Quick Wins</TabsTrigger>
              <TabsTrigger value="month2">Month 2: Build & Scale</TabsTrigger>
              <TabsTrigger value="month3">Month 3: Optimize</TabsTrigger>
            </TabsList>
            
            <TabsContent value="month1" className="space-y-4">
              <h3 className="font-semibold">Focus: Immediate Revenue (£2,000-8,000)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Consulting Services</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create consulting service page</li>
                    <li>• Set up booking calendar</li>
                    <li>• Reach out to existing network</li>
                    <li>• Offer free initial consultations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-600">Equipment Partnerships</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Contact equipment suppliers</li>
                    <li>• Set up affiliate programs</li>
                    <li>• Add equipment recommendations</li>
                    <li>• Create buying guides</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="month2" className="space-y-4">
              <h3 className="font-semibold">Focus: Scalable Systems (£5,000-15,000)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Training Courses</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Develop first course curriculum</li>
                    <li>• Record video content</li>
                    <li>• Set up learning platform</li>
                    <li>• Launch beta with discount</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Advertising Program</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create advertising packages</li>
                    <li>• Reach out to suppliers</li>
                    <li>• Set up ad management system</li>
                    <li>• Launch with 3-5 advertisers</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="month3" className="space-y-4">
              <h3 className="font-semibold">Focus: Optimization & Growth (£10,000-30,000)</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Scale What Works</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Double down on highest revenue streams</li>
                      <li>• Automate successful processes</li>
                      <li>• Hire virtual assistants</li>
                      <li>• Expand successful offerings</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">New Opportunities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Corporate training contracts</li>
                      <li>• White-label solutions</li>
                      <li>• Industry conference speaking</li>
                      <li>• Book/guide publishing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="w-5 h-5" />
            Success Stories from Similar Businesses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Engineering Consultant</h4>
              <p className="text-sm text-gray-600 mb-2">
                "Started with 500 monthly visitors, now earning £25,000/month through consulting + courses"
              </p>
              <p className="text-xs text-green-600 font-medium">Revenue mix: 60% consulting, 40% training</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Industry Platform</h4>
              <p className="text-sm text-gray-600 mb-2">
                "1,200 visitors/month, £18,000/month from equipment sales + advertising"
              </p>
              <p className="text-xs text-green-600 font-medium">Revenue mix: 70% equipment, 30% ads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            Ready to Diversify Your Revenue?
          </h3>
          <p className="text-blue-800 mb-6">
            With 1,250+ monthly visitors, you have the traffic to support multiple revenue streams. 
            Let's turn those visitors into revenue through proven strategies.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.open('mailto:mickyblenk@gmail.com?subject=Revenue Diversification Strategy', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Schedule Strategy Call
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('/documentation', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Implementation Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
