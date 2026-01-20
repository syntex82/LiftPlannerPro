'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Eye, UserPlus, TrendingUp, Globe, MousePointer } from "lucide-react"

interface VisitorData {
  totalVisitors: number
  registeredUsers: number
  anonymousVisitors: number
  conversionRate: number
  pageViews: number
  sessions: number
  bounceRate: number
  avgSessionDuration: string
  topPages: Array<{
    page: string
    views: number
    uniqueVisitors: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    visitors: number
    registrations: number
  }>
}

export default function VisitorAnalytics() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchVisitorData()
  }, [timeRange])

  const fetchVisitorData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/visitor-analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setVisitorData(data)
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!visitorData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visitor Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Unable to load visitor data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['24h', '7d', '30d', '90d'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold">{visitorData.totalVisitors.toLocaleString()}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registered Users</p>
                <p className="text-2xl font-bold">{visitorData.registeredUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anonymous Visitors</p>
                <p className="text-2xl font-bold">{visitorData.anonymousVisitors.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{visitorData.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Page Views:</span>
              <span className="font-semibold">{visitorData.pageViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sessions:</span>
              <span className="font-semibold">{visitorData.sessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bounce Rate:</span>
              <span className="font-semibold">{visitorData.bounceRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Session Duration:</span>
              <span className="font-semibold">{visitorData.avgSessionDuration}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitorData.topPages.map((page, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{page.page}</p>
                    <p className="text-sm text-gray-500">{page.uniqueVisitors} unique visitors</p>
                  </div>
                  <Badge variant="secondary">{page.views} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visitorData.trafficSources.map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{source.source}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{source.percentage.toFixed(1)}%</span>
                  <Badge variant="outline">{source.visitors} visitors</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Why visitors aren't converting:</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• {((1 - visitorData.conversionRate / 100) * 100).toFixed(1)}% of visitors browse without signing up</li>
                <li>• Consider adding lead magnets (free tools, guides)</li>
                <li>• Implement exit-intent popups</li>
                <li>• Add social proof and testimonials</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Opportunities:</h4>
              <ul className="mt-2 text-sm text-green-800 space-y-1">
                <li>• {visitorData.anonymousVisitors} potential users to convert</li>
                <li>• Focus on high-traffic pages for conversion optimization</li>
                <li>• Retarget anonymous visitors with ads</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
