"use client"

import * as THREE from "three"
import { useMemo, useRef, Fragment } from "react"
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
      // Position relative to hook with swing applied - NEGATE for correct direction
      const swingOffsetX = Math.sin(-load.swingAngleX) * (load.riggingOffset[1] + load.height / 2)
      const swingOffsetZ = Math.sin(-load.swingAngleZ) * (load.riggingOffset[1] + load.height / 2)

      return [
        hookPosition[0] + load.riggingOffset[0] + swingOffsetX,
        hookPosition[1] - load.riggingOffset[1] - load.height / 2,
        hookPosition[2] + load.riggingOffset[2] + swingOffsetZ
      ] as [number, number, number]
    }
    return load.position
  }, [load, hookPosition])

  // Calculate rotation including swing - NEGATE swing angles for correct visual rotation
  const rotation = useMemo(() => {
    if (load.attachedToCraneId) {
      return [-load.swingAngleX, load.rotation[1], -load.swingAngleZ] as [number, number, number]
    }
    return load.rotation
  }, [load])

  // Render the load shape based on type
  const loadGeometry = useMemo(() => {
    switch (load.type) {
      case 'box':
        return <boxGeometry args={[load.width, load.height, load.depth]} />
      case 'cylinder':
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.height, 24]} />
      case 'sphere':
        return <sphereGeometry args={[load.radius || load.width / 2, 24, 24]} />
      case 'vessel':
        // Horizontal vessel with elliptical heads
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.depth, 24]} />
      case 'column':
        // Tall vertical column
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.height, 24]} />
      case 'exchanger':
        // Shell and tube exchanger
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.depth, 24]} />
      case 'reactor':
        // Reactor vessel
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.height, 24]} />
      case 'drum':
        // Horizontal drum
        return <cylinderGeometry args={[load.radius || load.height / 2, load.radius || load.height / 2, load.width, 24]} />
      case 'compressor':
        return <boxGeometry args={[load.width, load.height, load.depth]} />
      case 'pump':
        return <boxGeometry args={[load.width, load.height, load.depth]} />
      case 'pipe-spool':
        return <cylinderGeometry args={[load.radius || 0.3, load.radius || 0.3, load.width, 16]} />
      case 'valve':
        return <boxGeometry args={[load.width, load.height, load.depth]} />
      case 'motor':
        return <cylinderGeometry args={[load.radius || load.width / 2, load.radius || load.width / 2, load.depth, 24]} />
      default:
        return <boxGeometry args={[load.width, load.height, load.depth]} />
    }
  }, [load])

  // Get rotation adjustment for horizontal equipment
  const equipmentRotation = useMemo(() => {
    if (load.type === 'vessel' || load.type === 'exchanger' || load.type === 'drum' || load.type === 'pipe-spool' || load.type === 'motor') {
      // Rotate to lay horizontal (along X axis)
      return [0, 0, Math.PI / 2] as [number, number, number]
    }
    return [0, 0, 0] as [number, number, number]
  }, [load.type])

  // Lifting lugs on top of load
  const liftingLugs = useMemo(() => {
    // Adjust lug positions based on equipment type
    let lugPositions: [number, number, number][]

    if (load.type === 'vessel' || load.type === 'exchanger' || load.type === 'drum') {
      // For horizontal vessels, lugs on top along length
      lugPositions = [
        [-load.depth / 3, load.width / 2, 0],
        [load.depth / 3, load.width / 2, 0],
        [-load.depth / 3, load.width / 2, 0],
        [load.depth / 3, load.width / 2, 0]
      ]
    } else {
      lugPositions = [
        [-load.width / 3, load.height / 2, -load.depth / 3],
        [load.width / 3, load.height / 2, -load.depth / 3],
        [load.width / 3, load.height / 2, load.depth / 3],
        [-load.width / 3, load.height / 2, load.depth / 3]
      ]
    }

    return lugPositions.map((pos, i) => (
      <group key={`lug-${i}`} position={pos}>
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

  // Calculate world positions of lifting lugs for rigging attachment
  const worldLugPositions = useMemo(() => {
    const lugOffsets: [number, number, number][] = [
      [-load.width / 3, load.height / 2, -load.depth / 3],
      [load.width / 3, load.height / 2, -load.depth / 3],
      [load.width / 3, load.height / 2, load.depth / 3],
      [-load.width / 3, load.height / 2, load.depth / 3]
    ]

    // Apply load rotation to get world positions
    const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2])
    const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(euler)

    return lugOffsets.map(offset => {
      const vec = new THREE.Vector3(offset[0], offset[1], offset[2])
      vec.applyMatrix4(rotMatrix)
      return [
        position[0] + vec.x,
        position[1] + vec.y,
        position[2] + vec.z
      ] as [number, number, number]
    })
  }, [load, position, rotation])

  // Render rigging lines when attached - OUTSIDE the transformed group
  const riggingLines = useMemo(() => {
    if (!load.attachedToCraneId || !hookPosition) return null

    return worldLugPositions.map((lugPos, i) => {
      const start = new THREE.Vector3(...hookPosition)
      const end = new THREE.Vector3(...lugPos)
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
  }, [load, hookPosition, worldLugPositions, ropeMaterial])

  // Combine final rotation with equipment-specific rotation
  const finalRotation = useMemo(() => {
    return [
      rotation[0] + equipmentRotation[0],
      rotation[1] + equipmentRotation[1],
      rotation[2] + equipmentRotation[2]
    ] as [number, number, number]
  }, [rotation, equipmentRotation])

  return (
    <Fragment>
      {/* Rigging lines rendered at world level - OUTSIDE the load group */}
      {riggingLines}

      {/* Load object with local transforms */}
      <group ref={groupRef} position={position} rotation={finalRotation} onClick={onClick}>
        {/* Main load body */}
        <mesh castShadow receiveShadow>
          {loadGeometry}
          <primitive object={isSelected ? selectedMaterial : material} attach="material" />
        </mesh>

        {/* Lifting lugs */}
        {liftingLugs}
      </group>
    </Fragment>
  )
}

