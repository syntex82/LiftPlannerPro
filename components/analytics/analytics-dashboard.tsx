'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  activeUsers: number
  pageViews: number
  sessionDuration: string
  bounceRate: string
  topPages: Array<{ page: string; views: number }>
  deviceTypes: Array<{ type: string; percentage: number }>
  trafficSources: Array<{ source: string; percentage: number }>
  realTimeEvents: Array<{ event: string; timestamp: string }>
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    activeUsers: 1,
    pageViews: 0,
    sessionDuration: '0:00',
    bounceRate: '0%',
    topPages: [],
    deviceTypes: [],
    trafficSources: [],
    realTimeEvents: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Simulate real-time analytics data (in production, this would fetch from Google Analytics API)
  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data based on typical Lift Planner Pro usage
    const mockData: AnalyticsData = {
      activeUsers: Math.floor(Math.random() * 5) + 1, // 1-5 active users
      pageViews: Math.floor(Math.random() * 100) + 50,
      sessionDuration: `${Math.floor(Math.random() * 10) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      bounceRate: `${Math.floor(Math.random() * 30) + 20}%`,
      topPages: [
        { page: '/dashboard', views: Math.floor(Math.random() * 50) + 20 },
        { page: '/cad', views: Math.floor(Math.random() * 40) + 15 },
        { page: '/lms', views: Math.floor(Math.random() * 30) + 10 },
        { page: '/auth/signin', views: Math.floor(Math.random() * 25) + 8 },
        { page: '/', views: Math.floor(Math.random() * 35) + 12 }
      ],
      deviceTypes: [
        { type: 'Desktop', percentage: Math.floor(Math.random() * 20) + 60 },
        { type: 'Mobile', percentage: Math.floor(Math.random() * 15) + 25 },
        { type: 'Tablet', percentage: Math.floor(Math.random() * 10) + 5 }
      ],
      trafficSources: [
        { source: 'Direct', percentage: Math.floor(Math.random() * 20) + 40 },
        { source: 'Google Search', percentage: Math.floor(Math.random() * 15) + 25 },
        { source: 'Social Media', percentage: Math.floor(Math.random() * 10) + 15 },
        { source: 'Referral', percentage: Math.floor(Math.random() * 10) + 10 }
      ],
      realTimeEvents: [
        { event: 'Page View: /dashboard', timestamp: new Date(Date.now() - 30000).toLocaleTimeString() },
        { event: 'CAD Tool Used: Rectangle', timestamp: new Date(Date.now() - 120000).toLocaleTimeString() },
        { event: 'LMS Quiz Started', timestamp: new Date(Date.now() - 180000).toLocaleTimeString() },
        { event: 'User Login', timestamp: new Date(Date.now() - 240000).toLocaleTimeString() }
      ]
    }
    
    setAnalyticsData(mockData)
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAnalyticsData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Real-time insights for Lift Planner Pro</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="border-slate-600"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.activeUsers}</div>
            <p className="text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Real-time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.pageViews}</div>
            <p className="text-xs text-slate-400 mt-1">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Avg. Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.sessionDuration}</div>
            <p className="text-xs text-slate-400 mt-1">Duration</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.bounceRate}</div>
            <p className="text-xs text-slate-400 mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">#{index + 1}</span>
                    <span className="text-white font-mono text-sm">{page.page}</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700">
                    {page.views} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.deviceTypes.map((device) => (
                <div key={device.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {device.type === 'Desktop' && <Monitor className="w-4 h-4 text-slate-400" />}
                    {device.type === 'Mobile' && <Smartphone className="w-4 h-4 text-slate-400" />}
                    {device.type === 'Tablet' && <PieChart className="w-4 h-4 text-slate-400" />}
                    <span className="text-white">{device.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Events */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Real-time Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analyticsData.realTimeEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                <span className="text-white text-sm">{event.event}</span>
                <span className="text-slate-400 text-xs">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-slate-400 text-sm">
        <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
        <p className="mt-1">
          Tracking ID: <span className="font-mono text-slate-300">G-2RB6SYH1GV</span>
        </p>
      </div>
    </div>
  )
}
