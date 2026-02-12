"use client"

import * as THREE from "three"
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { LoadObject } from "./liftSimulationStore"

interface LoadObject3DProps {
  load: LoadObject
  hookPosition?: [number, number, number] // World position of hook
  isSelected?: boolean
  onClick?: () => void
}

export default function LoadObject3D({
  load,
  hookPosition,
  isSelected = false,
  onClick
}: LoadObject3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Materials
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: load.color,
    metalness: 0.3,
    roughness: 0.6
  }), [load.color])

  const selectedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: load.color,
    metalness: 0.3,
    roughness: 0.6,
    emissive: new THREE.Color('#ffff00'),
    emissiveIntensity: 0.3
  }), [load.color])

  const riggingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0.7,
    roughness: 0.3
  }), [])

  const ropeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    metalness: 0.1,
    roughness: 0.9
  }), [])

  // Calculate position based on attachment state
  const position = useMemo(() => {
    if (load.attachedToCraneId && hookPosition) {
      // Position relative to hook with swing applied
      const swingOffsetX = Math.sin(load.swingAngleX) * (load.riggingOffset[1] + load.height / 2)
      const swingOffsetZ = Math.sin(load.swingAngleZ) * (load.riggingOffset[1] + load.height / 2)
      
      return [
        hookPosition[0] + load.riggingOffset[0] + swingOffsetX,
        hookPosition[1] - load.riggingOffset[1] - load.height / 2,
        hookPosition[2] + load.riggingOffset[2] + swingOffsetZ
      ] as [number, number, number]
    }
    return load.position
  }, [load, hookPosition])

  // Calculate rotation including swing
  const rotation = useMemo(() => {
    if (load.attachedToCraneId) {
      return [load.swingAngleX, load.rotation[1], load.swingAngleZ] as [number, number, number]
    }
    return load.rotation
  }, [load])

  // Render rigging lines when attached
  const riggingLines = useMemo(() => {
    if (!load.attachedToCraneId || !hookPosition) return null

    const loadTop = [
      position[0],
      position[1] + load.height / 2,
      position[2]
    ]

    // Create 4-point bridle rigging
    const bridlePoints = [
      [loadTop[0] - load.width / 3, loadTop[1], loadTop[2] - load.depth / 3],
      [loadTop[0] + load.width / 3, loadTop[1], loadTop[2] - load.depth / 3],
      [loadTop[0] + load.width / 3, loadTop[1], loadTop[2] + load.depth / 3],
      [loadTop[0] - load.width / 3, loadTop[1], loadTop[2] + load.depth / 3]
    ]

    return bridlePoints.map((point, i) => {
      const start = new THREE.Vector3(...hookPosition)
      const end = new THREE.Vector3(point[0], point[1], point[2])
      const mid = start.clone().add(end).multiplyScalar(0.5)
      const length = start.distanceTo(end)
      const direction = end.clone().sub(start).normalize()
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      const euler = new THREE.Euler().setFromQuaternion(quaternion)

      return (
        <mesh
          key={`rigging-${i}`}
          position={[mid.x, mid.y, mid.z]}
          rotation={[euler.x, euler.y, euler.z]}
        >
          <cylinderGeometry args={[0.02, 0.02, length, 8]} />
          <primitive object={ropeMaterial} attach="material" />
        </mesh>
      )
    })
  }, [load, hookPosition, position, ropeMaterial])

  // Render the load shape
  const loadGeometry = useMemo(() => {
    switch (load.type) {
      case 'box':
        return <boxGeometry args={[load.width, load.height, load.depth]} />
      case 'cylinder':
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.height, 24]} />
      case 'sphere':
        return <sphereGeometry args={[load.radius || load.width / 2, 24, 24]} />
      default:
        return <boxGeometry args={[load.width, load.height, load.depth]} />
    }
  }, [load])

  // Lifting lugs on top of load
  const liftingLugs = useMemo(() => {
    const lugPositions = [
      [-load.width / 3, load.height / 2, -load.depth / 3],
      [load.width / 3, load.height / 2, -load.depth / 3],
      [load.width / 3, load.height / 2, load.depth / 3],
      [-load.width / 3, load.height / 2, load.depth / 3]
    ]

    return lugPositions.map((pos, i) => (
      <group key={`lug-${i}`} position={pos as [number, number, number]}>
        {/* Lug plate */}
        <mesh>
          <boxGeometry args={[0.1, 0.15, 0.02]} />
          <primitive object={riggingMaterial} attach="material" />
        </mesh>
        {/* Lug hole */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.01, 8, 16]} />
          <primitive object={riggingMaterial} attach="material" />
        </mesh>
      </group>
    ))
  }, [load, riggingMaterial])

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Main load body */}
      <mesh castShadow receiveShadow>
        {loadGeometry}
        <primitive object={isSelected ? selectedMaterial : material} attach="material" />
      </mesh>

      {/* Lifting lugs */}
      {liftingLugs}

      {/* Rigging lines */}
      {riggingLines}
    </group>
  )
}

