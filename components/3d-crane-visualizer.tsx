"use client"

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { 
  Eye, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Play,
  Pause,
  Settings
} from "lucide-react"

interface CraneVisualizerProps {
  craneModel: string
  loadWeight: number
  liftRadius: number
  liftHeight: number
  craneCapacity: number
  isLiftSafe: boolean
}

export default function CraneVisualizer({
  craneModel,
  loadWeight,
  liftRadius,
  liftHeight = 10,
  craneCapacity,
  isLiftSafe
}: CraneVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const craneRef = useRef<THREE.Group | null>(null)
  const loadRef = useRef<THREE.Mesh | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const [isAnimating, setIsAnimating] = useState(false)
  const [viewAngle, setViewAngle] = useState([45])
  const [zoomLevel, setZoomLevel] = useState([50])
  const isAnimatingRef = useRef(false)
  const animationTimeRef = useRef(0)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(30, 20, 30)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x555555, 0x333333)
    scene.add(gridHelper)

    // Create crane
    createCrane()
    
    // Create load
    createLoad()

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      if (isAnimatingRef.current && craneRef.current) {
        animationTimeRef.current += 0.016 // ~60fps

        // Rotate the crane
        craneRef.current.rotation.y += 0.01

        // Animate the load up and down
        if (loadRef.current && loadRef.current.geometry) {
          const bobAmount = Math.sin(animationTimeRef.current * 2) * 0.5
          const loadHeight = 1 // Default load height
          loadRef.current.position.y = 25 - liftHeight - loadHeight / 2 + bobAmount
        }

        // Animate the hook
        const hook = craneRef.current.children.find(child =>
          child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
        ) as THREE.Mesh
        if (hook) {
          const hookBob = Math.sin(animationTimeRef.current * 2) * 0.5
          hook.position.y = 25 - liftHeight + hookBob
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    isAnimatingRef.current = isAnimating
    console.log('3D Crane Animation:', isAnimating ? 'STARTED' : 'STOPPED')
  }, [isAnimating])

  useEffect(() => {
    updateCranePosition()
  }, [liftRadius, liftHeight])

  useEffect(() => {
    updateLoadAppearance()
  }, [loadWeight, isLiftSafe])

  useEffect(() => {
    updateCameraPosition()
  }, [viewAngle, zoomLevel])

  const createCrane = () => {
    if (!sceneRef.current) return

    const craneGroup = new THREE.Group()
    
    // Crane base
    const baseGeometry = new THREE.CylinderGeometry(3, 4, 2, 8)
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 1
    base.castShadow = true
    craneGroup.add(base)

    // Crane mast
    const mastGeometry = new THREE.CylinderGeometry(0.5, 0.8, 25, 8)
    const mastMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00 })
    const mast = new THREE.Mesh(mastGeometry, mastMaterial)
    mast.position.y = 14.5
    mast.castShadow = true
    craneGroup.add(mast)

    // Crane jib (boom)
    const jibGeometry = new THREE.CylinderGeometry(0.3, 0.3, 30, 8)
    const jibMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 })
    const jib = new THREE.Mesh(jibGeometry, jibMaterial)
    jib.rotation.z = Math.PI / 2
    jib.position.set(15, 25, 0)
    jib.castShadow = true
    craneGroup.add(jib)

    // Hook
    const hookGeometry = new THREE.SphereGeometry(0.5, 8, 8)
    const hookMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const hook = new THREE.Mesh(hookGeometry, hookMaterial)
    hook.position.set(liftRadius, 25 - liftHeight, 0)
    hook.castShadow = true
    craneGroup.add(hook)

    // Cable
    const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, liftHeight, 8)
    const cableMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    const cable = new THREE.Mesh(cableGeometry, cableMaterial)
    cable.position.set(liftRadius, 25 - liftHeight / 2, 0)
    craneGroup.add(cable)

    craneRef.current = craneGroup
    sceneRef.current.add(craneGroup)
  }

  const createLoad = () => {
    if (!sceneRef.current) return

    const loadSize = Math.max(1, Math.min(3, loadWeight / 1000))
    const loadGeometry = new THREE.BoxGeometry(loadSize, loadSize, loadSize)
    const loadMaterial = new THREE.MeshLambertMaterial({ 
      color: isLiftSafe ? 0x00ff00 : 0xff0000 
    })
    const load = new THREE.Mesh(loadGeometry, loadMaterial)
    load.position.set(liftRadius, 25 - liftHeight - loadSize / 2, 0)
    load.castShadow = true
    
    loadRef.current = load
    sceneRef.current.add(load)
  }

  const updateCranePosition = () => {
    if (!craneRef.current || !loadRef.current) return

    // Update hook position
    const hook = craneRef.current.children.find(child => 
      child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
    ) as THREE.Mesh
    if (hook) {
      hook.position.set(liftRadius, 25 - liftHeight, 0)
    }

    // Update cable
    const cable = craneRef.current.children.find(child => 
      child instanceof THREE.Mesh && 
      child.geometry instanceof THREE.CylinderGeometry &&
      (child.material as THREE.MeshLambertMaterial).color.getHex() === 0x666666
    ) as THREE.Mesh
    if (cable) {
      cable.position.set(liftRadius, 25 - liftHeight / 2, 0)
      cable.scale.y = liftHeight / 10
    }

    // Update load position
    const loadSize = Math.max(1, Math.min(3, loadWeight / 1000))
    loadRef.current.position.set(liftRadius, 25 - liftHeight - loadSize / 2, 0)
  }

  const updateLoadAppearance = () => {
    if (!loadRef.current) return

    const loadSize = Math.max(1, Math.min(3, loadWeight / 1000))
    const newGeometry = new THREE.BoxGeometry(loadSize, loadSize, loadSize)
    loadRef.current.geometry.dispose()
    loadRef.current.geometry = newGeometry

    const material = loadRef.current.material as THREE.MeshLambertMaterial
    material.color.setHex(isLiftSafe ? 0x00ff00 : 0xff0000)
  }

  const updateCameraPosition = () => {
    if (!cameraRef.current) return

    const angle = (viewAngle[0] * Math.PI) / 180
    const distance = zoomLevel[0]
    
    cameraRef.current.position.set(
      Math.cos(angle) * distance,
      20,
      Math.sin(angle) * distance
    )
    cameraRef.current.lookAt(0, 10, 0)
  }

  const resetView = () => {
    setViewAngle([45])
    setZoomLevel([50])
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            3D Crane Visualization
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAnimating(!isAnimating)}
              className={`border-slate-600 text-slate-300 hover:bg-slate-800 ${
                isAnimating ? 'bg-green-600/20 border-green-500 text-green-400' : ''
              }`}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="ml-2 text-xs">
                {isAnimating ? 'Playing' : 'Play'}
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetView}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={mountRef} 
          className="w-full h-96 bg-slate-900 rounded-lg border border-slate-600"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-sm">View Angle</Label>
            <Slider
              value={viewAngle}
              onValueChange={setViewAngle}
              max={360}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Zoom Level</Label>
            <Slider
              value={zoomLevel}
              onValueChange={setZoomLevel}
              max={100}
              min={20}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-slate-400">Radius</div>
            <div className="text-white font-bold">{liftRadius}m</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-slate-400">Height</div>
            <div className="text-white font-bold">{liftHeight}m</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-slate-400">Load</div>
            <div className={`font-bold ${isLiftSafe ? 'text-green-400' : 'text-red-400'}`}>
              {loadWeight}kg
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
