"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  Construction,
  Truck
} from "lucide-react"
import { MOBILE_CRANE_MODELS, CraneSpecifications } from '@/lib/crane-models'

interface CraneLibraryProps {
  onSelectCrane: (crane: CraneSpecifications) => void
  onInsertCrane: (crane: CraneSpecifications, position: { x: number, y: number }) => void
  isOpen: boolean
  onClose: () => void
}

export default function CraneLibrary({ onSelectCrane, onInsertCrane, isOpen, onClose }: CraneLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCranes, setFilteredCranes] = useState<CraneSpecifications[]>(MOBILE_CRANE_MODELS)
  const [selectedCrane, setSelectedCrane] = useState<CraneSpecifications | null>(null)

  useEffect(() => {
    let filtered = MOBILE_CRANE_MODELS

    if (searchTerm) {
      filtered = filtered.filter(crane => 
        crane.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crane.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCranes(filtered)
  }, [searchTerm])

  const handleInsertCrane = (crane: CraneSpecifications) => {
    const position = { x: 400, y: 300 }
    onInsertCrane(crane, position)
    onClose()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crawler': return <Construction className="w-4 h-4" />
      case 'truck': return <Truck className="w-4 h-4" />
      case 'all-terrain': return <Truck className="w-4 h-4" />
      case 'rough-terrain': return <Construction className="w-4 h-4" />
      default: return <Construction className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Construction className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Mobile Crane Library</h2>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">{filteredCranes.length} models</Badge>
          </div>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:text-white">Close</Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search cranes by model or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Crane List */}
          <div className="w-1/2 border-r border-slate-700 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredCranes.map((crane) => (
                <Card 
                  key={crane.id} 
                  className={`cursor-pointer transition-all border-slate-600 hover:border-blue-500 ${
                    selectedCrane?.id === crane.id ? 'bg-slate-700 border-blue-500' : 'bg-slate-800'
                  }`}
                  onClick={() => setSelectedCrane(crane)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{crane.manufacturer} {crane.model}</h3>
                      <div className="flex items-center space-x-1 text-slate-400">
                        {getTypeIcon(crane.type)}
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {crane.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>{crane.maxCapacity}t capacity</span>
                      <span>{crane.maxRadius}m radius</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedCrane ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedCrane.manufacturer} {selectedCrane.model}
                  </h3>
                  <div className="flex items-center space-x-2 mb-4">
                    {getTypeIcon(selectedCrane.type)}
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {selectedCrane.type.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Capacity</h4>
                      <p className="text-2xl font-bold text-blue-400">{selectedCrane.maxCapacity}t</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Max Radius</h4>
                      <p className="text-2xl font-bold text-green-400">{selectedCrane.maxRadius}m</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button 
                    onClick={() => handleInsertCrane(selectedCrane)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Insert into Drawing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Construction className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>Select a crane to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
