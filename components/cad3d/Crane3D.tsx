"use client"

import * as THREE from "three"
import { useMemo, useRef } from "react"

interface MinimalCraneSpec {
  id: string
  manufacturer: string
  model: string
  dimensions: { length: number; width: number; height: number }
  boom: { baseLength: number; maxLength: number; sections: number; telescopic: boolean }
  axles?: { positions: number[] } // optional absolute X positions in meters relative to chassis center
}

export interface Crane3DProps {
  spec: MinimalCraneSpec
  boomAngleDeg?: number // plan-view rotation (clock-style), degrees
  extension?: number // 0..1 fraction of telescopic range
  scaleFactor?: number // default 1.0 (meters)
  loadLineLength?: number // meters, from boom tip downwards
  color?: string // optional override
  chassisColor?: string // default Aguilar green
  boomColor?: string // default Aguilar yellow
  position?: [number, number, number]
}

export default function Crane3D({
  spec,
  boomAngleDeg = 45,
  extension = 0.5,
  scaleFactor = 1,
  loadLineLength = 5,
  color = "#9ca3af",
  chassisColor = "#2E8B57", // Aguilar green
  boomColor = "#FFD700", // Aguilar yellow
  position = [0, 0, 0],
  ...props
}: Crane3DProps & Record<string, any>) {
  // Convert dimensions (spec uses mm for chassis)
  const chassisLength = (spec.dimensions.length || 12000) / 1000 * scaleFactor
  const chassisWidth = (spec.dimensions.width || 3000) / 1000 * scaleFactor
  const chassisHeight = Math.max(0.8, (spec.dimensions.height || 3800) / 1000 * 0.2) * scaleFactor

  const boomBase = spec.boom.baseLength // meters
  const boomMax = spec.boom.maxLength // meters
  const sections = Math.max(2, spec.boom.sections || 4)
  const totalLen = useMemo(() => {
    const ext = THREE.MathUtils.clamp(extension, 0, 1)
    return (boomBase + ext * (boomMax - boomBase)) * scaleFactor
  }, [boomBase, boomMax, extension, scaleFactor])

  // Heuristic section lengths (retracted equally, extension distributed across inner sections)
  const sectionLens = useMemo(() => {
    const baseRetracted = (boomBase / sections) * scaleFactor
    const extTotal = (totalLen - boomBase * scaleFactor)
    const inner = sections - 1
    const extPer = inner > 0 ? extTotal / inner : 0
    return new Array(sections).fill(0).map((_, i) => (i === 0 ? baseRetracted : baseRetracted + extPer))
  }, [sections, boomBase, totalLen])

  const turntableRadius = Math.min(chassisWidth * 0.25, 1.0 * scaleFactor)
  const turntableHeight = 0.2 * scaleFactor
  // Boom cross-section (thickness in Z and height in Y). Boom extends along +X.
  const boomBox = { z: 0.35 * scaleFactor, y: 0.35 * scaleFactor }
  const wheelRadius = 0.52 * scaleFactor
  const wheelWidth = 0.38 * scaleFactor
  const outriggerLen = Math.min(chassisWidth * 0.9, 2.4 * scaleFactor)
  const outriggerThk = 0.18 * scaleFactor
  const outriggerPad = { x: 0.7 * scaleFactor, y: 0.1 * scaleFactor, z: 0.7 * scaleFactor }
  const cabSize = { x: chassisWidth * 0.42, y: chassisHeight * 0.85, z: chassisWidth * 0.5 }
  const carrierCabSize = { x: chassisLength * 0.16, y: chassisHeight * 0.55, z: chassisWidth * 0.7 }

  // Superstructure housing and pivot offset (place boom pivot slightly aft of center)
  const pivotOffsetX = -chassisLength * 0.1
  const superSize = { x: chassisLength * 0.22, y: chassisHeight * 0.7, z: chassisWidth * 0.55 }

  // Side-elevation: X forward, Y up, Z lateral. Luff around Z.
  const luffRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(boomAngleDeg, 0, 85))

  const groupRef = useRef<THREE.Group>(null)

  // Materials (defaults to Aguilar livery)
  const matChassis = useMemo(() => new THREE.MeshStandardMaterial({ color: chassisColor, metalness: 0.2, roughness: 0.7 }), [chassisColor])
  const matBoom = useMemo(() => new THREE.MeshStandardMaterial({ color: boomColor || color, metalness: 0.4, roughness: 0.5 }), [boomColor, color])
  const matCW = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111827", metalness: 0.3, roughness: 0.6 }), [])
  const matLine = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e5e7eb", metalness: 0.1, roughness: 0.9 }), [])
  const matSheave = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cccccc", metalness: 0.6, roughness: 0.3 }), [])
  const matHook = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d97706", metalness: 0.5, roughness: 0.4 }), [])
  const matGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#9dd5ff", transmission: 0.7, opacity: 0.6, transparent: true, roughness: 0.1, metalness: 0.0, thickness: 0.02 }), [])

  // Geometries memoized
  const chassisGeo = useMemo(() => new THREE.BoxGeometry(chassisLength, chassisHeight, chassisWidth), [chassisLength, chassisHeight, chassisWidth])
  const cwGeo = useMemo(() => new THREE.BoxGeometry(Math.min(2 * scaleFactor, chassisLength * 0.15), chassisHeight * 0.8, chassisWidth * 0.6), [chassisLength, chassisWidth, chassisHeight, scaleFactor])
  const ttGeo = useMemo(() => new THREE.CylinderGeometry(turntableRadius, turntableRadius, turntableHeight, 24), [turntableRadius, turntableHeight])
  const wheelGeo = useMemo(() => new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24), [wheelRadius, wheelWidth])
  const jackGeo = useMemo(() => new THREE.CylinderGeometry(outriggerThk/2, outriggerThk/2, chassisHeight * 0.9, 12), [outriggerThk, chassisHeight])
  const padGeo = useMemo(() => new THREE.BoxGeometry(outriggerPad.x * 0.6, outriggerPad.y, outriggerPad.z * 0.6), [outriggerPad.x, outriggerPad.y, outriggerPad.z])
  const cabGeo = useMemo(() => new THREE.BoxGeometry(cabSize.x, cabSize.y, cabSize.z), [cabSize.x, cabSize.y, cabSize.z])

  // Boom tip position in local boom group space (x+)
  const boomTipLocalX = useMemo(() => sectionLens.reduce((a, b) => a + b, 0), [sectionLens])

  return (
    <group ref={groupRef} position={position} {...props}>
      {/* Refined Chassis - Main body with better proportions */}
      <mesh geometry={chassisGeo} material={matChassis} castShadow receiveShadow position={[0, chassisHeight / 2, 0]} />

      {/* Chassis side panels - for Liebherr branding */}
      <mesh castShadow receiveShadow position={[-chassisLength * 0.15, chassisHeight * 0.6, chassisWidth * 0.5 + 0.05]}>
        <boxGeometry args={[chassisLength * 0.7, chassisHeight * 0.4, 0.1]} />
        <primitive object={matChassis} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[-chassisLength * 0.15, chassisHeight * 0.6, -chassisWidth * 0.5 - 0.05]}>
        <boxGeometry args={[chassisLength * 0.7, chassisHeight * 0.4, 0.1]} />
        <primitive object={matChassis} attach="material" />
      </mesh>

      {/* Liebherr branding text on side - using a simple box as placeholder for text */}
      <mesh castShadow position={[-chassisLength * 0.2, chassisHeight * 0.65, chassisWidth * 0.52]}>
        <boxGeometry args={[2.5, 0.4, 0.02]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine compartment details - raised section */}
      <mesh castShadow receiveShadow position={[chassisLength * 0.25, chassisHeight * 0.7, 0]}>
        <boxGeometry args={[chassisLength * 0.35, chassisHeight * 0.5, chassisWidth * 0.8]} />
        <primitive object={matChassis} attach="material" />
      </mesh>

      {/* Axle supports (no wheels) - just the structural elements */}
      {(() => {
        const posRel = [-0.44, -0.32, -0.20, 0.10, 0.28, 0.42]
        const axlePositions = (spec.axles?.positions && spec.axles.positions.length===6)
          ? spec.axles.positions.map(m => (m / 1000) * (1))
          : posRel.map(r => r * chassisLength)
        return axlePositions.map((x, i) => (
          <group key={`axle-${i}`}>
            {/* Axle beam */}
            <mesh castShadow receiveShadow position={[x, 0, 0]}>
              <boxGeometry args={[0.15, 0.2, chassisWidth * 1.1]} />
              <primitive object={matCW} attach="material" />
            </mesh>
            {/* Left suspension */}
            <mesh castShadow receiveShadow position={[x, -0.3, -chassisWidth * 0.55]}>
              <boxGeometry args={[0.1, 0.4, 0.15]} />
              <primitive object={matCW} attach="material" />
            </mesh>
            {/* Right suspension */}
            <mesh castShadow receiveShadow position={[x, -0.3, chassisWidth * 0.55]}>
              <boxGeometry args={[0.1, 0.4, 0.15]} />
              <primitive object={matCW} attach="material" />
            </mesh>
          </group>
        ))
      })()}

      {/* Counterweight at rear */}
      <mesh geometry={cwGeo} material={matCW} castShadow receiveShadow position={[pivotOffsetX - superSize.x * 0.2, chassisHeight + superSize.y * 0.1, -superSize.z * 0.4]} />

      {/* Superstructure housing and cab */}
      <mesh geometry={new THREE.BoxGeometry(superSize.x, superSize.y, superSize.z)} material={matCW} castShadow receiveShadow position={[pivotOffsetX, chassisHeight + superSize.y / 2, 0]} />
      <group position={[pivotOffsetX + superSize.x * 0.42, chassisHeight + cabSize.y / 2, superSize.z * 0.62]}>
        {/* Upper cab body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cabSize.x * 0.9, cabSize.y * 0.95, cabSize.z * 0.6]} />
          <primitive object={matBoom} attach="material" />
        </mesh>
        {/* Sloped windshield */}
        <mesh position={[cabSize.x * 0.1, cabSize.y * 0.05, cabSize.z * -0.31]} rotation={[0, 0, -Math.PI/10]}>
          <boxGeometry args={[cabSize.x * 0.75, cabSize.y * 0.55, 0.02 * scaleFactor]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
        {/* Side window */}
        <mesh position={[-cabSize.x * 0.05, -cabSize.y * 0.05, cabSize.z * -0.31]}>
          <boxGeometry args={[cabSize.x * 0.5, cabSize.y * 0.45, 0.02 * scaleFactor]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
        {/* Roof visor */}
        <mesh position={[cabSize.x * 0.15, cabSize.y * 0.55, 0]}>
          <boxGeometry args={[cabSize.x * 0.45, 0.04 * scaleFactor, cabSize.z * 0.62]} />
          <primitive object={matBoom} attach="material" />
        </mesh>
      </group>

      {/* Carrier cab on top of chassis (right side) */}
      <group position={[chassisLength * 0.30, chassisHeight + carrierCabSize.y * 0.45, chassisWidth * 0.45]}>
        {/* Cab shell */}
        <mesh castShadow>
          <boxGeometry args={[carrierCabSize.x, carrierCabSize.y, carrierCabSize.z * 0.8]} />
          <primitive object={matBoom} attach="material" />
        </mesh>
        {/* Sloped windshield */}
        <mesh position={[-carrierCabSize.x * 0.05, carrierCabSize.y * 0.02, -carrierCabSize.z * 0.38]} rotation={[0, 0, -Math.PI/12]}>
          <boxGeometry args={[carrierCabSize.x * 0.9, carrierCabSize.y * 0.6, 0.02 * scaleFactor]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
        {/* Side window */}
        <mesh position={[-carrierCabSize.x * 0.25, -carrierCabSize.y * 0.05, -carrierCabSize.z * 0.38]}>
          <boxGeometry args={[carrierCabSize.x * 0.45, carrierCabSize.y * 0.45, 0.02 * scaleFactor]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
      </group>

      {/* Turntable centered above chassis (disc) */}
      <group position={[pivotOffsetX, chassisHeight + turntableHeight / 2, 0]}>
        <mesh geometry={ttGeo} material={matBoom} castShadow receiveShadow />
      </group>

      {/* Outriggers extended: beam (Z) + vertical jack + pad at ground */}
      {([-1, 1] as const).flatMap(side => {
        const zBase = side * (chassisWidth / 2)
        return [
          { x: -chassisLength * 0.40, side }, // rear pair moved forward slightly to avoid wheels
          { x:  chassisLength * 0.40, side },
        ].map((p, idx) => (
          <group key={`out-${side}-${idx}`} position={[p.x, chassisHeight * 0.55, zBase]}>
            {/* horizontal beam extended outwards (along Z) */}
            <mesh geometry={new THREE.BoxGeometry(outriggerThk, outriggerThk, outriggerLen)} material={matCW} position={[0, 0, side * (outriggerLen / 2 + 0.1 * scaleFactor)]} castShadow receiveShadow />
            {/* vertical jack at beam end */}
            <mesh geometry={jackGeo} material={matCW} position={[0, -chassisHeight * 0.55, side * (outriggerLen + 0.2 * scaleFactor)]} castShadow receiveShadow />
            {/* pad on ground */}
            <mesh geometry={padGeo} material={matCW} position={[0, -chassisHeight * 1.05, side * (outriggerLen + 0.2 * scaleFactor)]} castShadow receiveShadow />
          </group>
        ))
      })}

      {/* Boom group: rotate around Z to luff, extends along +X */}
      <group position={[pivotOffsetX, chassisHeight + superSize.y, 0]} rotation={[0, 0, luffRad]}>
        {/* Knuckle at pivot */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[boomBox.z * 0.55, boomBox.z * 0.55, boomBox.y * 0.8, 16]} />
          <primitive object={matBoom} attach="material" />
        </mesh>

        {/* Luffing cylinder (simplified) */}
        <group>
          {/* Base anchor under boom root */}
          <mesh position={[-superSize.x * 0.2, -superSize.y * 0.3, 0]}>
            <cylinderGeometry args={[0.06 * scaleFactor, 0.06 * scaleFactor, superSize.y * 0.7, 8]} />
            <primitive object={matLine} attach="material" />
          </mesh>
          {/* Rod towards boom mid */}
          <mesh position={[boomBox.y * 1.6, -superSize.y * 0.15, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.04 * scaleFactor, 0.04 * scaleFactor, superSize.y * 0.9, 8]} />
            <primitive object={matSheave} attach="material" />
          </mesh>
        </group>

        {/* Telescopic sections with small overlaps */}
        {sectionLens.reduce((acc: React.ReactElement[], len, idx) => {
          const prev = sectionLens.slice(0, idx).reduce((a, b) => a + b, 0)
          const overlap = idx === 0 ? 0 : boomBox.y * 0.18
          const collar = idx === 0 ? 0 : 0.02 * scaleFactor
          const secY = boomBox.y * (1 - idx * 0.05)
          const secZ = boomBox.z * (1 - idx * 0.05)
          acc.push(
            <group key={`boom-sec-${idx}`} position={[prev + len / 2, 0, 0]}>
              <mesh geometry={new THREE.BoxGeometry(Math.max(0.2, len + overlap), secY, secZ)} material={matBoom} castShadow receiveShadow />
              {idx > 0 && (
                <mesh position={[-(len/2) + collar/2, 0, 0]}>
                  <boxGeometry args={[collar, secY * 1.05, secZ * 1.05]} />
                  <primitive object={matBoom} attach="material" />
                </mesh>
              )}
            </group>
          )
          return acc
        }, [])}

        {/* Multi-sheave boom head and hook block */}
        <group position={[boomTipLocalX, 0, 0]}>
          {/* Head cheek block */}
          <mesh position={[0.07 * scaleFactor, 0, 0]} castShadow>
            <boxGeometry args={[0.24 * scaleFactor, boomBox.y * 1.2, boomBox.z * 1.8]} />
            <primitive object={matBoom} attach="material" />
          </mesh>
          {/* Head sheaves */}
          {([-1, 0, 1] as const).map((k, i) => (
            <mesh key={`head-sheave-${i}`} position={[0.16 * scaleFactor, 0, k * 0.07 * scaleFactor]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.12 * scaleFactor, 0.028 * scaleFactor, 12, 24]} />
              <primitive object={matSheave} attach="material" />
            </mesh>
          ))}
        </group>

        {/* Rigging: line and hook block */}
        {loadLineLength > 0 && (
          <group>
            {/* Fall line under center sheave (vertical) */}
            <mesh position={[boomTipLocalX + 0.16 * scaleFactor, -loadLineLength / 2, 0]} rotation={[0,0,0]} castShadow>
              <cylinderGeometry args={[0.02 * scaleFactor, 0.02 * scaleFactor, loadLineLength, 24]} />
              <primitive object={matLine} attach="material" />
            </mesh>
            {/* Hook block with three sheaves */}
            <group position={[boomTipLocalX + 0.16 * scaleFactor, -loadLineLength, 0]}>
              {/* cheek plates */}
              <mesh position={[0, 0, 0.06 * scaleFactor]} castShadow>
                <boxGeometry args={[0.22 * scaleFactor, 0.26 * scaleFactor, 0.02 * scaleFactor]} />
                <primitive object={matBoom} attach="material" />
              </mesh>
              <mesh position={[0, 0, -0.06 * scaleFactor]} castShadow>
                <boxGeometry args={[0.22 * scaleFactor, 0.26 * scaleFactor, 0.02 * scaleFactor]} />
                <primitive object={matBoom} attach="material" />
              </mesh>
              {/* block sheaves */}
              {([-1, 0, 1] as const).map((k, i) => (
                <mesh key={`blk-sheave-${i}`} position={[0, 0, k * 0.06 * scaleFactor]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <torusGeometry args={[0.08 * scaleFactor, 0.024 * scaleFactor, 12, 24]} />
                  <primitive object={matSheave} attach="material" />
                </mesh>
              ))}
              {/* Professional industrial crane hook */}
              <group position={[0, -0.22 * scaleFactor, 0]}>
                {/* Hook eye - large connection ring */}
                <mesh position={[0, 0.12 * scaleFactor, 0]} castShadow>
                  <torusGeometry args={[0.06 * scaleFactor, 0.018 * scaleFactor, 16, 32]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Upper shank - thick cylindrical section */}
                <mesh position={[0, 0.04 * scaleFactor, 0]} castShadow>
                  <cylinderGeometry args={[0.028 * scaleFactor, 0.032 * scaleFactor, 0.16 * scaleFactor, 16]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Main hook body - large curved section */}
                <mesh position={[0.02 * scaleFactor, -0.08 * scaleFactor, 0]} rotation={[0, 0, 0.3]} castShadow>
                  <torusGeometry args={[0.22 * scaleFactor, 0.032 * scaleFactor, 16, 48, Math.PI * 1.5]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Hook tip - reinforced point */}
                <mesh position={[0.24 * scaleFactor, -0.22 * scaleFactor, 0]} castShadow>
                  <sphereGeometry args={[0.035 * scaleFactor, 16, 16]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Load bearing surface - inner curve reinforcement */}
                <mesh position={[0.08 * scaleFactor, -0.14 * scaleFactor, 0]} rotation={[0, 0, 0.2]} castShadow>
                  <torusGeometry args={[0.18 * scaleFactor, 0.025 * scaleFactor, 12, 40, Math.PI * 1.4]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Safety latch mechanism - prominent */}
                <mesh position={[-0.06 * scaleFactor, -0.06 * scaleFactor, 0]} castShadow>
                  <boxGeometry args={[0.025 * scaleFactor, 0.08 * scaleFactor, 0.12 * scaleFactor]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Latch pin */}
                <mesh position={[-0.06 * scaleFactor, -0.12 * scaleFactor, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.008 * scaleFactor, 0.008 * scaleFactor, 0.14 * scaleFactor, 12]} />
                  <primitive object={matHook} attach="material" />
                </mesh>

                {/* Throat opening - the gap where load sits */}
                {/* This is represented by the space between the main curve and tip */}
              </group>
            </group>
          </group>
        )}
      </group>
    </group>
  )
}

