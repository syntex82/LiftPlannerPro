"use client"

import { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Link2 } from "lucide-react"
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { RIGGING_EQUIPMENT_3D, RIGGING_CATEGORIES, RiggingEquipment3D } from '@/lib/rigging-equipment'
import { useModelerStore, ModelerObject } from './modelerStore'

interface RiggingLibrary3DProps {
  isOpen: boolean
  onClose: () => void
}

// 3D Preview component for equipment
function EquipmentPreview3D({ equipment }: { equipment: RiggingEquipment3D }) {
  const scale = 2 / Math.max(
    equipment.dimensions.length || 1,
    equipment.dimensions.width || 1,
    equipment.dimensions.height || 1
  )

  return (
    <Canvas camera={{ position: [2, 2, 2], fov: 50 }} style={{ background: '#1e293b' }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Suspense fallback={null}>
        <group scale={scale}>
          {equipment.geometryType === 'box' && (
            <mesh>
              <boxGeometry args={[
                equipment.dimensions.length || 1,
                equipment.dimensions.height || 1,
                equipment.dimensions.width || 1
              ]} />
              <meshStandardMaterial color={equipment.color} />
            </mesh>
          )}
          {equipment.geometryType === 'cylinder' && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[
                equipment.dimensions.radius || 0.5,
                equipment.dimensions.radius || 0.5,
                equipment.dimensions.height || 1,
                32
              ]} />
              <meshStandardMaterial color={equipment.color} />
            </mesh>
          )}
          {equipment.geometryType === 'sphere' && (
            <mesh>
              <sphereGeometry args={[equipment.dimensions.radius || 0.5, 32, 32]} />
              <meshStandardMaterial color={equipment.color} />
            </mesh>
          )}
          {equipment.geometryType === 'composite' && equipment.parts?.map((part, idx) => (
            <mesh 
              key={idx} 
              position={part.position}
              rotation={part.rotation || [0, 0, 0]}
            >
              {part.type === 'box' && (
                <boxGeometry args={part.size || [1, 1, 1]} />
              )}
              {part.type === 'cylinder' && (
                <cylinderGeometry args={[part.radius || 0.1, part.radius || 0.1, part.height || 1, 16]} />
              )}
              {part.type === 'sphere' && (
                <sphereGeometry args={[part.radius || 0.1, 16, 16]} />
              )}
              <meshStandardMaterial color={part.color || equipment.color} />
            </mesh>
          ))}
        </group>
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  )
}

// Generate unique ID
function cryptoRandom() {
  return Math.random().toString(36).substring(2, 9)
}

export default function RiggingLibrary3D({ isOpen, onClose }: RiggingLibrary3DProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('shackles')
  const { setObjects, setSelectedId, currentLayer } = useModelerStore()

  if (!isOpen) return null

  const handleInsert = (equipment: RiggingEquipment3D) => {
    const id = `rigging-${equipment.id}-${cryptoRandom()}`
    
    let newObject: ModelerObject
    
    if (equipment.geometryType === 'box') {
      newObject = {
        id,
        type: 'box',
        name: equipment.name,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        size: [
          equipment.dimensions.length || 1,
          equipment.dimensions.height || 1,
          equipment.dimensions.width || 1
        ],
        color: equipment.color,
        layer: currentLayer,
        visible: true
      }
    } else if (equipment.geometryType === 'cylinder') {
      newObject = {
        id,
        type: 'cylinder',
        name: equipment.name,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radius: equipment.dimensions.radius || 0.5,
        height: equipment.dimensions.height || 1,
        color: equipment.color,
        layer: currentLayer,
        visible: true
      }
    } else if (equipment.geometryType === 'sphere') {
      newObject = {
        id,
        type: 'sphere',
        name: equipment.name,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radius: equipment.dimensions.radius || 0.5,
        color: equipment.color,
        layer: currentLayer,
        visible: true
      }
    } else {
      // For composite, create as a box with overall dimensions
      newObject = {
        id,
        type: 'box',
        name: equipment.name,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        size: [
          equipment.dimensions.width || 0.2,
          equipment.dimensions.height || 0.2,
          equipment.dimensions.width || 0.2
        ],
        color: equipment.color,
        layer: currentLayer,
        visible: true
      }
    }

    setObjects(prev => [...prev, newObject])
    setSelectedId(id)
    onClose()
  }

  const filteredEquipment = RIGGING_EQUIPMENT_3D.filter(e => e.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 max-h-[85vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">3D Rigging Equipment Library</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 overflow-y-auto flex-1">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {RIGGING_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEquipment.map(equipment => (
              <Button
                key={equipment.id}
                onClick={() => handleInsert(equipment)}
                className="h-auto p-2 bg-slate-700 hover:bg-slate-600 flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded overflow-hidden">
                  <EquipmentPreview3D equipment={equipment} />
                </div>
                <div className="text-xs font-medium text-white mt-2">{equipment.name}</div>
                <div className="text-[10px] text-slate-400 text-center">{equipment.description}</div>
                {equipment.swl && (
                  <div className="text-[10px] text-yellow-400 mt-0.5">SWL: {equipment.swl}</div>
                )}
              </Button>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No equipment in this category yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

