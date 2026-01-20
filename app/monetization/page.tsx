"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FreemiumUpgrade from '@/components/monetization/FreemiumUpgrade'
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calculator,
  Download,
  FileText,
  Headphones,
  ShoppingCart,
  Zap
} from "lucide-react"

export default function MonetizationPage() {
  const { data: session } = useSession()
  const [userCredits, setUserCredits] = useState(0)
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    payPerUseRevenue: 0,
    subscriptionRevenue: 0,
    consultingRevenue: 0
  })

  useEffect(() => {
    // Load user credits and revenue data
    loadUserData()
  }, [session])

  const loadUserData = async () => {
    try {
      // Simulate loading user credits
      setUserCredits(10.0) // Demo credits from database setup
      
      // Simulate revenue data
      setRevenueData({
        totalRevenue: 15420,
        monthlyRevenue: 3240,
        payPerUseRevenue: 890,
        subscriptionRevenue: 2350,
        consultingRevenue: 1200
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handlePurchaseCredits = () => {
    // Implement credit purchase flow
    console.log('Opening credit purchase modal...')
  }

  const handleUpgradeSubscription = () => {
    // Implement subscription upgrade flow
    console.log('Opening subscription upgrade modal...')
  }

  const revenueStreams = [
    {
      name: 'Pay-Per-Use Services',
      revenue: revenueData.payPerUseRevenue,
      growth: '+15%',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      services: [
        { name: 'Advanced Calculations', price: '£5', usage: '178 uses' },
        { name: 'DWG Exports', price: '£10', usage: '89 exports' },
        { name: 'Rigging Plans', price: '£25', usage: '35 plans' },
        { name: 'Consultations', price: '£75', usage: '16 sessions' }
      ]
    },
    {
      name: 'Monthly Subscriptions',
      revenue: revenueData.subscriptionRevenue,
      growth: '+23%',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      services: [
        { name: 'Professional Plan', price: '£29/mo', usage: '81 subscribers' }
      ]
    },
    {
      name: 'Consulting Services',
      revenue: revenueData.consultingRevenue,
      growth: '+8%',
      icon: Headphones,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      services: [
        { name: 'Project Consulting', price: '£150/hr', usage: '8 hours' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Monetization Dashboard</h1>
          <p className="text-slate-300 text-lg">
            Multiple revenue streams for non-subscription users
          </p>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">£{revenueData.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">£{revenueData.monthlyRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pay-Per-Use</p>
                  <p className="text-2xl font-bold text-white">£{revenueData.payPerUseRevenue}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Consulting</p>
                  <p className="text-2xl font-bold text-white">£{revenueData.consultingRevenue}</p>
                </div>
                <Headphones className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upgrade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="upgrade" className="text-slate-300 data-[state=active]:text-white">
              Upgrade Options
            </TabsTrigger>
            <TabsTrigger value="revenue" className="text-slate-300 data-[state=active]:text-white">
              Revenue Streams
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upgrade" className="space-y-6">
            <FreemiumUpgrade 
              userCredits={userCredits}
              onPurchaseCredits={handlePurchaseCredits}
              onUpgradeSubscription={handleUpgradeSubscription}
            />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {revenueStreams.map((stream, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        <stream.icon className={`w-5 h-5 mr-2 ${stream.color}`} />
                        {stream.name}
                      </CardTitle>
                      <Badge className="bg-green-600 text-white">{stream.growth}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">£{stream.revenue}</div>
                      <p className="text-slate-400 text-sm">This month</p>
                    </div>
                    
                    <div className="space-y-2">
                      {stream.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{service.name}</span>
                          <div className="text-right">
                            <div className="text-white font-semibold">{service.price}</div>
                            <div className="text-slate-400 text-xs">{service.usage}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Free Users</span>
                      <span className="text-white font-semibold">1,250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Used Pay-Per-Use</span>
                      <span className="text-white font-semibold">187 (15%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Purchased Credits</span>
                      <span className="text-white font-semibold">94 (7.5%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Upgraded to Pro</span>
                      <span className="text-white font-semibold">23 (1.8%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Subscriptions (72%)</span>
                      <span className="text-white font-semibold">£2,350</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Consulting (37%)</span>
                      <span className="text-white font-semibold">£1,200</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Pay-Per-Use (27%)</span>
                      <span className="text-white font-semibold">£890</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
