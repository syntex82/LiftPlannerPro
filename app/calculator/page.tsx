"use client"

import { useState } from 'react'
// Monetization disabled for calculator
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, Weight, Save, Download, CheckCircle } from "lucide-react"

export default function SimpleLoadCalculator() {
  const [activeTab, setActiveTab] = useState('single-crane')
  const [selectedCrane, setSelectedCrane] = useState('')
  const [radius, setRadius] = useState(0)
  const [height, setHeight] = useState(0)
  const [loadWeight, setLoadWeight] = useState(0)
  const [multiCranes, setMultiCranes] = useState<Array<{id: string, craneId: string, radius: number, height: number, capacity: number}>>([])
  const [totalMultiLoad, setTotalMultiLoad] = useState(0)

  // Monetization disabled: calculator fully unrestricted

  const cranes = [
    // 30 TONNE RANGE - All Manufacturers
    { id: 'grove-rt530e', name: 'Grove RT530E-2', capacity: 30, maxRadius: 28, maxHeight: 42 },
    { id: 'liebherr-ltm1030', name: 'Liebherr LTM 1030-2.1', capacity: 30, maxRadius: 30, maxHeight: 45 },
    { id: 'tadano-gr300xl', name: 'Tadano GR-300XL', capacity: 30, maxRadius: 28, maxHeight: 42 },
    { id: 'manitowoc-rt530e', name: 'Manitowoc RT530E', capacity: 30, maxRadius: 30, maxHeight: 44 },
    { id: 'link-belt-rtc8030', name: 'Link-Belt RTC-8030', capacity: 30, maxRadius: 28, maxHeight: 42 },

    // 35 TONNE RANGE
    { id: 'grove-rt635c', name: 'Grove RT635C', capacity: 35, maxRadius: 30, maxHeight: 45 },
    { id: 'liebherr-ltm1035', name: 'Liebherr LTM 1035-3.1', capacity: 35, maxRadius: 32, maxHeight: 48 },
    { id: 'tadano-gr350xl', name: 'Tadano GR-350XL', capacity: 35, maxRadius: 30, maxHeight: 45 },
    { id: 'manitowoc-rt635', name: 'Manitowoc RT635', capacity: 35, maxRadius: 30, maxHeight: 45 },

    // 40 TONNE RANGE
    { id: 'grove-rt740b', name: 'Grove RT740B', capacity: 40, maxRadius: 35, maxHeight: 52 },
    { id: 'liebherr-ltm1040', name: 'Liebherr LTM 1040-2.1', capacity: 40, maxRadius: 35, maxHeight: 52 },
    { id: 'tadano-gr400xl', name: 'Tadano GR-400XL', capacity: 40, maxRadius: 35, maxHeight: 52 },
    { id: 'manitowoc-rt740', name: 'Manitowoc RT740', capacity: 40, maxRadius: 35, maxHeight: 52 },
    { id: 'link-belt-rtc8040', name: 'Link-Belt RTC-8040', capacity: 40, maxRadius: 35, maxHeight: 52 },

    // 50 TONNE RANGE
    { id: 'grove-gmk3050', name: 'Grove GMK3050', capacity: 50, maxRadius: 40, maxHeight: 58 },
    { id: 'liebherr-ltm1050', name: 'Liebherr LTM 1050-3.1', capacity: 50, maxRadius: 42, maxHeight: 60 },
    { id: 'tadano-atf50g', name: 'Tadano ATF 50G-3', capacity: 50, maxRadius: 40, maxHeight: 58 },
    { id: 'manitowoc-gmk3050', name: 'Manitowoc GMK3050', capacity: 50, maxRadius: 40, maxHeight: 58 },

    // 60-75 TONNE RANGE
    { id: 'grove-gmk3060', name: 'Grove GMK3060', capacity: 60, maxRadius: 45, maxHeight: 65 },
    { id: 'liebherr-ltm1060', name: 'Liebherr LTM 1060-3.1', capacity: 60, maxRadius: 48, maxHeight: 65 },
    { id: 'tadano-atf60g', name: 'Tadano ATF 60G-3', capacity: 60, maxRadius: 44, maxHeight: 62 },
    { id: 'grove-gmk4075', name: 'Grove GMK4075', capacity: 75, maxRadius: 50, maxHeight: 72 },
    { id: 'liebherr-ltm1070', name: 'Liebherr LTM 1070-4.2', capacity: 70, maxRadius: 50, maxHeight: 70 },
    { id: 'tadano-atf70g', name: 'Tadano ATF 70G-4', capacity: 70, maxRadius: 48, maxHeight: 68 },

    // 90-100 TONNE RANGE
    { id: 'grove-gmk4090', name: 'Grove GMK4090', capacity: 90, maxRadius: 50, maxHeight: 72 },
    { id: 'liebherr-ltm1090', name: 'Liebherr LTM 1090-4.2', capacity: 90, maxRadius: 52, maxHeight: 75 },
    { id: 'tadano-atf90g', name: 'Tadano ATF 90G-4', capacity: 90, maxRadius: 50, maxHeight: 72 },
    { id: 'link-belt-rtc8090', name: 'Link-Belt RTC-8090', capacity: 90, maxRadius: 38, maxHeight: 51 },
    { id: 'grove-gmk5100', name: 'Grove GMK5100', capacity: 100, maxRadius: 60, maxHeight: 82 },
    { id: 'liebherr-ltm1100', name: 'Liebherr LTM 1100-5.2', capacity: 100, maxRadius: 62, maxHeight: 85 },
    { id: 'tadano-atf100g', name: 'Tadano ATF 100G-4', capacity: 100, maxRadius: 58, maxHeight: 78 },
    { id: 'manitowoc-gmk5100', name: 'Manitowoc GMK5100', capacity: 100, maxRadius: 58, maxHeight: 80 },

    // 130-200 TONNE RANGE
    { id: 'grove-rt9130e', name: 'Grove RT9130E', capacity: 130, maxRadius: 40, maxHeight: 56 },
    { id: 'liebherr-ltm1130', name: 'Liebherr LTM 1130-5.1', capacity: 130, maxRadius: 60, maxHeight: 85 },
    { id: 'tadano-atf130g', name: 'Tadano ATF 130G-5', capacity: 130, maxRadius: 58, maxHeight: 82 },
    { id: 'liebherr-ltm1160', name: 'Liebherr LTM 1160-5.2', capacity: 160, maxRadius: 68, maxHeight: 92 },
    { id: 'grove-gmk5200', name: 'Grove GMK5200', capacity: 200, maxRadius: 70, maxHeight: 98 },

    // 220-400 TONNE RANGE
    { id: 'tadano-atf220g', name: 'Tadano ATF 220G-5', capacity: 220, maxRadius: 62, maxHeight: 94 },
    { id: 'liebherr-ltm1300', name: 'Liebherr LTM 1300-6.2', capacity: 300, maxRadius: 78, maxHeight: 108 },
    { id: 'grove-gmk6400', name: 'Grove GMK6400', capacity: 400, maxRadius: 68, maxHeight: 120 },

    // 500-800 TONNE RANGE
    { id: 'liebherr-ltm1500', name: 'Liebherr LTM 1500-8.1', capacity: 500, maxRadius: 84, maxHeight: 134 },
    { id: 'tadano-atf600g', name: 'Tadano ATF 600G-8', capacity: 600, maxRadius: 88, maxHeight: 142 },
    { id: 'grove-gmk7550', name: 'Grove GMK7550', capacity: 750, maxRadius: 90, maxHeight: 155 },

    // HEAVY LIFT RANGE (800t-3000t+)
    { id: 'manitowoc-18000', name: 'Manitowoc 18000', capacity: 680, maxRadius: 100, maxHeight: 150 },
    { id: 'terex-ac1000', name: 'Terex-Demag AC 1000', capacity: 1000, maxRadius: 96, maxHeight: 168 },
    { id: 'liebherr-ltm11200', name: 'Liebherr LTM 11200-9.1', capacity: 1200, maxRadius: 100, maxHeight: 188 },
    { id: 'liebherr-lr13000', name: 'Liebherr LR 13000', capacity: 3000, maxRadius: 180, maxHeight: 245 }
  ]

  const calculateCapacity = () => {
    if (!selectedCrane || radius === 0) return 0
    const crane = cranes.find(c => c.id === selectedCrane)
    if (!crane) return 0

    // Monetization disabled: no gating

    // More realistic capacity calculation based on crane characteristics
    const baseCapacity = crane.capacity

    // Radius derating - capacity decreases significantly with radius
    const radiusRatio = radius / crane.maxRadius
    const radiusDerating = Math.max(0.05, Math.pow(1 - radiusRatio, 1.5))

    // Height derating - capacity decreases with height
    const heightRatio = height / crane.maxHeight
    const heightDerating = Math.max(0.7, 1 - heightRatio * 0.3)

    // Apply both deratings
    let capacity = baseCapacity * radiusDerating * heightDerating

    // Ensure capacity doesn't exceed physical limits
    if (radius > crane.maxRadius || height > crane.maxHeight) {
      capacity = 0
    }

    // Monetization disabled: no usage tracking

    return Math.max(0, capacity)
  }

  const availableCapacity = calculateCapacity()
  const isValid = availableCapacity > loadWeight
  const safetyMargin = availableCapacity > 0 ? ((availableCapacity - loadWeight) / availableCapacity) * 100 : 0

  const addMultiCrane = (craneId: string) => {
    const crane = cranes.find(c => c.id === craneId)
    if (!crane) return

    const newCrane = {
      id: Date.now().toString(),
      craneId,
      radius: 10,
      height: 20,
      capacity: 0
    }

    // Calculate initial capacity
    const baseCapacity = crane.capacity
    const radiusRatio = newCrane.radius / crane.maxRadius
    const radiusDerating = Math.max(0.05, Math.pow(1 - radiusRatio, 1.5))
    const heightRatio = newCrane.height / crane.maxHeight
    const heightDerating = Math.max(0.7, 1 - heightRatio * 0.3)
    newCrane.capacity = baseCapacity * radiusDerating * heightDerating

    setMultiCranes([...multiCranes, newCrane])
  }

  const removeMultiCrane = (id: string) => {
    setMultiCranes(multiCranes.filter(c => c.id !== id))
  }

  const updateMultiCrane = (id: string, field: string, value: number) => {
    setMultiCranes(multiCranes.map(crane => {
      if (crane.id === id) {
        const updated = { ...crane, [field]: value }

        // Recalculate capacity
        const craneData = cranes.find(c => c.id === crane.craneId)
        if (craneData) {
          const radiusRatio = updated.radius / craneData.maxRadius
          const radiusDerating = Math.max(0.05, Math.pow(1 - radiusRatio, 1.5))
          const heightRatio = updated.height / craneData.maxHeight
          const heightDerating = Math.max(0.7, 1 - heightRatio * 0.3)
          updated.capacity = craneData.capacity * radiusDerating * heightDerating

          if (updated.radius > craneData.maxRadius || updated.height > craneData.maxHeight) {
            updated.capacity = 0
          }
        }

        return updated
      }
      return crane
    }))
  }

  const totalMultiCapacity = multiCranes.reduce((sum, crane) => sum + crane.capacity, 0)
  const multiIsValid = totalMultiCapacity > totalMultiLoad
  const multiSafetyMargin = totalMultiCapacity > 0 ? ((totalMultiCapacity - totalMultiLoad) / totalMultiCapacity) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl">Load Calculator</CardTitle>
                <p className="text-slate-400">Professional crane capacity calculations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Tracker removed */}

      {/* Calculator Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="single-crane" className="data-[state=active]:bg-slate-700">
            <Calculator className="w-4 h-4 mr-2" />
            Single Crane
          </TabsTrigger>
          <TabsTrigger value="multi-crane" className="data-[state=active]:bg-slate-700">
            <Calculator className="w-4 h-4 mr-2" />
            Multi-Crane
          </TabsTrigger>
        </TabsList>

        {/* Single Crane Calculator */}
        <TabsContent value="single-crane" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crane Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Crane Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="craneSelect" className="text-slate-300">Select Crane</Label>
                  <Select onValueChange={setSelectedCrane}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a crane" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {cranes.map((crane) => (
                        <SelectItem key={crane.id} value={crane.id}>
                          {crane.name} - {crane.capacity}t (R:{crane.maxRadius}m, H:{crane.maxHeight}m)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCrane && (
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h4 className="text-white font-medium mb-3">
                      {cranes.find(c => c.id === selectedCrane)?.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Max Capacity:</span>
                        <span className="text-white ml-2">{cranes.find(c => c.id === selectedCrane)?.capacity}t</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Max Radius:</span>
                        <span className="text-white ml-2">{cranes.find(c => c.id === selectedCrane)?.maxRadius}m</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Max Height:</span>
                        <span className="text-white ml-2">{cranes.find(c => c.id === selectedCrane)?.maxHeight}m</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white ml-2">Mobile Crane</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="radius" className="text-slate-300">Operating Radius (m)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={radius}
                      onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                      min="0"
                      max={selectedCrane ? cranes.find(c => c.id === selectedCrane)?.maxRadius || 100 : 100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-slate-300">Lift Height (m)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                      min="0"
                      max={selectedCrane ? cranes.find(c => c.id === selectedCrane)?.maxHeight || 200 : 200}
                    />
                  </div>
                </div>

                {selectedCrane && (
                  <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-300 font-medium">Available Capacity:</span>
                      <span className="text-blue-100 text-xl font-bold">
                        {availableCapacity.toFixed(1)}t
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Load Definition */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Weight className="w-5 h-5 mr-2" />
                  Load Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="loadWeight" className="text-slate-300">Load Weight (t)</Label>
                  <Input
                    id="loadWeight"
                    type="number"
                    value={loadWeight}
                    onChange={(e) => setLoadWeight(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter load weight"
                  />
                </div>

                <div>
                  <Label htmlFor="safetyFactor" className="text-slate-300">Safety Factor</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select safety factor" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="1.25">1.25 (Standard)</SelectItem>
                      <SelectItem value="1.5">1.5 (Heavy Lift)</SelectItem>
                      <SelectItem value="2.0">2.0 (Critical Lift)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loadWeight > 0 && availableCapacity > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    isValid 
                      ? 'bg-green-900/20 border-green-500/50' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`}>
                    <div className={`flex items-center ${isValid ? 'text-green-300' : 'text-red-300'}`}>
                      <span className="font-medium">
                        {isValid ? '✅ Lift is SAFE' : '❌ Lift EXCEEDS capacity'}
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-slate-300">
                      Safety Margin: {safetyMargin.toFixed(1)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Multi-Crane Calculator */}
        <TabsContent value="multi-crane" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crane Management */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Multi-Crane Setup
                  </div>
                  <Badge className="bg-blue-500 text-white">
                    {multiCranes.length} Cranes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Add Crane</Label>
                  <Select onValueChange={(value) => addMultiCrane(value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select crane to add" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {cranes.map((crane) => (
                        <SelectItem key={crane.id} value={crane.id}>
                          {crane.name} - {crane.capacity}t
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {multiCranes.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
                      <p className="text-slate-400">No cranes selected</p>
                    </div>
                  ) : (
                    multiCranes.map((crane, index) => {
                      const craneData = cranes.find(c => c.id === crane.craneId)
                      return (
                        <div key={crane.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">
                              Crane {index + 1}: {craneData?.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMultiCrane(crane.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ✕
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-slate-300 text-xs">Radius (m)</Label>
                              <Input
                                type="number"
                                value={crane.radius}
                                onChange={(e) => updateMultiCrane(crane.id, 'radius', parseFloat(e.target.value) || 0)}
                                className="bg-slate-600 border-slate-500 text-white text-sm"
                                min="0"
                                max={craneData?.maxRadius || 100}
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300 text-xs">Height (m)</Label>
                              <Input
                                type="number"
                                value={crane.height}
                                onChange={(e) => updateMultiCrane(crane.id, 'height', parseFloat(e.target.value) || 0)}
                                className="bg-slate-600 border-slate-500 text-white text-sm"
                                min="0"
                                max={craneData?.maxHeight || 200}
                              />
                            </div>
                          </div>

                          <div className="mt-3 p-2 bg-blue-900/20 border border-blue-500/50 rounded">
                            <div className="text-blue-300 text-sm">
                              Capacity: <span className="font-bold">{crane.capacity.toFixed(1)}t</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {multiCranes.length > 0 && (
                  <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-300 font-medium">Total Capacity:</span>
                      <span className="text-green-100 text-xl font-bold">
                        {totalMultiCapacity.toFixed(1)}t
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Load Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Weight className="w-5 h-5 mr-2" />
                  Load Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="totalLoad" className="text-slate-300">Total Load Weight (t)</Label>
                  <Input
                    id="totalLoad"
                    type="number"
                    value={totalMultiLoad}
                    onChange={(e) => setTotalMultiLoad(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter total load weight"
                  />
                </div>

                {multiCranes.length > 0 && totalMultiLoad > 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Load Distribution</h4>
                      {multiCranes.map((crane, index) => {
                        const craneData = cranes.find(c => c.id === crane.craneId)
                        const loadShare = (crane.capacity / totalMultiCapacity) * totalMultiLoad
                        const utilization = (loadShare / crane.capacity) * 100

                        return (
                          <div key={crane.id} className="flex items-center justify-between py-2 border-b border-slate-600 last:border-b-0">
                            <span className="text-slate-300 text-sm">
                              Crane {index + 1} ({craneData?.name}):
                            </span>
                            <div className="text-right">
                              <div className="text-white font-medium">
                                {loadShare.toFixed(1)}t ({utilization.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      multiIsValid
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-red-900/20 border-red-500/50'
                    }`}>
                      <div className={`flex items-center ${multiIsValid ? 'text-green-300' : 'text-red-300'}`}>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          {multiIsValid
                            ? 'Multi-crane lift is SAFE'
                            : 'WARNING: Load exceeds total capacity'
                          }
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-slate-300">
                        Safety Margin: {multiSafetyMargin.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-300">
                        Total Capacity: {totalMultiCapacity.toFixed(1)}t | Total Load: {totalMultiLoad.toFixed(1)}t
                      </div>
                    </div>
                  </div>
                )}

                {multiCranes.length === 0 && (
                  <div className="text-center py-8">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50 text-slate-400" />
                    <h3 className="text-xl font-medium mb-2 text-slate-300">No Cranes Selected</h3>
                    <p className="text-slate-400">Add cranes to start multi-crane calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade prompt removed */}
    </div>
  )
}
