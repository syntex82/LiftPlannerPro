"use client"

import * as THREE from "three"
import { useMemo } from "react"
import { LTM_1055_3D_SPEC, Crane3DSpec } from "@/lib/crane-3d-models"

export interface LTM1055Crane3DProps {
  spec?: Crane3DSpec
  boomAngleDeg?: number
  extension?: number
  scaleFactor?: number
  loadLineLength?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  slewAngle?: number
}

export default function LTM1055Crane3D({
  spec = LTM_1055_3D_SPEC,
  boomAngleDeg = 45,
  extension = 0.5,
  scaleFactor = 1,
  loadLineLength = 8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  slewAngle = 0
}: LTM1055Crane3DProps) {
  const s = scaleFactor

  // Core dimensions - LTM 1055-3.1 realistic proportions
  const chassisLength = 11.36 * s
  const chassisWidth = 2.55 * s
  const chassisHeight = 1.0 * s
  const wheelRadius = 0.55 * s
  const wheelWidth = 0.35 * s
  const groundClearance = wheelRadius

  // Axle positions (3 axles for LTM 1055)
  const axleCount = spec.axles.count
  const axlePositions = spec.axles.positions.map(p => p * s)

  // Boom
  const boomBaseLength = spec.boom.baseLength * s
  const boomMaxLength = spec.boom.maxLength * s
  const currentBoomLength = boomBaseLength + (boomMaxLength - boomBaseLength) * THREE.MathUtils.clamp(extension, 0, 1)
  const boomWidth = 0.7 * s
  const boomHeight = 0.8 * s

  // Angles
  const luffRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(boomAngleDeg, 0, 82))
  const slewRad = THREE.MathUtils.degToRad(slewAngle)

  // Materials - Liebherr colors
  const matGreen = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2E8B57", metalness: 0.3, roughness: 0.5
  }), [])

  const matYellow = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFD700", metalness: 0.4, roughness: 0.3
  }), [])

  const matBlack = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a1a", metalness: 0.1, roughness: 0.9
  }), [])

  const matSteel = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#708090", metalness: 0.7, roughness: 0.3
  }), [])

  const matGlass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#87CEEB", transparent: true, opacity: 0.6, metalness: 0.1, roughness: 0.1
  }), [])

  const matDarkGray = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2C3E50", metalness: 0.5, roughness: 0.4
  }), [])

  // Superstructure position (on top of chassis, centered)
  const superY = groundClearance + chassisHeight
  const superHeight = 1.8 * s
  const superWidth = 2.4 * s
  const superLength = 3.2 * s

  // Boom pivot point
  const boomPivotY = superY + superHeight + 0.3 * s
  const boomPivotX = -0.5 * s

  return (
    <group position={position} rotation={rotation}>

      {/* ========== CHASSIS ========== */}
      <mesh position={[0, groundClearance + chassisHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[chassisLength, chassisHeight, chassisWidth]} />
        <primitive object={matGreen} attach="material" />
      </mesh>

      {/* Chassis side rails */}
      {[-1, 1].map(side => (
        <mesh key={`rail-${side}`} position={[0, groundClearance + chassisHeight + 0.15 * s, side * (chassisWidth / 2 - 0.1 * s)]} castShadow>
          <boxGeometry args={[chassisLength * 0.9, 0.3 * s, 0.2 * s]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
      ))}

      {/* ========== AXLES & WHEELS ========== */}
      {axlePositions.map((xPos, idx) => (
        <group key={`axle-${idx}`} position={[xPos, wheelRadius, 0]}>
          {/* Axle housing */}
          <mesh castShadow>
            <boxGeometry args={[0.6 * s, 0.4 * s, chassisWidth * 0.8]} />
            <primitive object={matDarkGray} attach="material" />
          </mesh>

          {/* Wheels - both sides */}
          {[-1, 1].map(side => (
            <group key={`wheel-${idx}-${side}`} position={[0, 0, side * (chassisWidth / 2 + wheelWidth / 2)]}>
              {/* Tire */}
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 24]} />
                <primitive object={matBlack} attach="material" />
              </mesh>
              {/* Rim */}
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 1.05, 16]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
              {/* Hub cap */}
              <mesh position={[0, 0, side * wheelWidth * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[wheelRadius * 0.3, wheelRadius * 0.3, 0.08 * s, 12]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ========== DRIVER CAB (Front) ========== */}
      <group position={[chassisLength / 2 - 1.4 * s, groundClearance + chassisHeight, 0]}>
        {/* Cab body - lower section */}
        <mesh position={[0, 0.5 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2 * s, 1.0 * s, chassisWidth * 0.9]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Cab body - upper section (window area) */}
        <mesh position={[0, 1.3 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0 * s, 0.6 * s, chassisWidth * 0.85]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Windshield - large and visible */}
        <mesh position={[1.0 * s, 1.2 * s, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.1 * s, 0.9 * s, chassisWidth * 0.7]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
        {/* Side windows - larger */}
        {[-1, 1].map(side => (
          <mesh key={`side-win-${side}`} position={[0, 1.2 * s, side * (chassisWidth * 0.44)]}>
            <boxGeometry args={[1.5 * s, 0.7 * s, 0.08 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        ))}
        {/* Roof */}
        <mesh position={[0, 1.65 * s, 0]} castShadow>
          <boxGeometry args={[2.3 * s, 0.1 * s, chassisWidth * 0.92]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Headlights */}
        {[-1, 1].map(side => (
          <mesh key={`headlight-${side}`} position={[1.1 * s, 0.4 * s, side * 0.8 * s]}>
            <cylinderGeometry args={[0.12 * s, 0.12 * s, 0.08 * s, 12]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ========== SUPERSTRUCTURE (Rotates) ========== */}
      <group position={[-0.5 * s, superY, 0]} rotation={[0, slewRad, 0]}>

        {/* Turntable base */}
        <mesh position={[0, 0.1 * s, 0]} castShadow>
          <cylinderGeometry args={[1.3 * s, 1.3 * s, 0.2 * s, 24]} />
          <primitive object={matSteel} attach="material" />
        </mesh>

        {/* Main superstructure body */}
        <mesh position={[0, superHeight / 2 + 0.2 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[superLength, superHeight, superWidth]} />
          <primitive object={matGreen} attach="material" />
        </mesh>

        {/* Engine housing (rear of superstructure) */}
        <mesh position={[-superLength / 2 - 0.4 * s, superHeight / 2 + 0.2 * s, 0]} castShadow>
          <boxGeometry args={[0.8 * s, superHeight * 0.8, superWidth * 0.9]} />
          <primitive object={matGreen} attach="material" />
        </mesh>

        {/* ========== CRANE CAB ========== */}
        <group position={[superLength / 2 + 0.2 * s, superHeight + 0.2 * s, superWidth / 2 - 0.6 * s]}>
          {/* Cab body - larger and more prominent */}
          <mesh position={[0, 0.85 * s, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8 * s, 1.7 * s, 1.5 * s]} />
            <primitive object={matGreen} attach="material" />
          </mesh>
          {/* Front window - large panoramic */}
          <mesh position={[0.85 * s, 0.95 * s, 0]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.1 * s, 1.3 * s, 1.3 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          {/* Side window - right side (outer) */}
          <mesh position={[0.1 * s, 0.95 * s, 0.73 * s]}>
            <boxGeometry args={[1.4 * s, 1.2 * s, 0.08 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          {/* Side window - left side (inner) */}
          <mesh position={[0.1 * s, 0.95 * s, -0.73 * s]}>
            <boxGeometry args={[1.4 * s, 1.2 * s, 0.08 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          {/* Top window (skylight for boom visibility) */}
          <mesh position={[0.2 * s, 1.68 * s, 0]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[1.2 * s, 0.08 * s, 1.2 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          {/* Rear window */}
          <mesh position={[-0.88 * s, 0.95 * s, 0]}>
            <boxGeometry args={[0.08 * s, 1.0 * s, 1.2 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        </group>

        {/* ========== COUNTERWEIGHT ========== */}
        <mesh position={[-superLength / 2 - 1.5 * s, superHeight / 2 + 0.2 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8 * s, superHeight * 0.9, superWidth * 0.95]} />
          <primitive object={matDarkGray} attach="material" />
        </mesh>

        {/* Counterweight plates detail */}
        {[-0.3, 0, 0.3].map((offset, i) => (
          <mesh key={`cw-plate-${i}`} position={[-superLength / 2 - 1.5 * s, superHeight / 2 + 0.2 * s + offset * s, 0]} castShadow>
            <boxGeometry args={[1.85 * s, 0.25 * s, superWidth * 0.98]} />
            <primitive object={matBlack} attach="material" />
          </mesh>
        ))}

        {/* ========== BOOM ASSEMBLY ========== */}
        <group position={[boomPivotX + 0.5 * s, boomPivotY - superY, 0]} rotation={[0, 0, luffRad]}>

          {/* Boom base section */}
          <mesh position={[currentBoomLength / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[currentBoomLength, boomHeight, boomWidth]} />
            <primitive object={matYellow} attach="material" />
          </mesh>

          {/* Boom lattice detail (top and bottom rails) */}
          {[-1, 1].map(side => (
            <mesh key={`boom-rail-${side}`} position={[currentBoomLength / 2, side * boomHeight * 0.45, 0]} castShadow>
              <boxGeometry args={[currentBoomLength, 0.08 * s, boomWidth * 1.05]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
          ))}

          {/* Boom head */}
          <group position={[currentBoomLength + 0.3 * s, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6 * s, boomHeight * 1.3, boomWidth * 1.4]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
            {/* Sheaves */}
            {[-1, 0, 1].map(k => (
              <mesh key={`sheave-${k}`} position={[0.35 * s, 0, k * 0.2 * s]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.18 * s, 0.04 * s, 12, 24]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
            ))}
          </group>

          {/* ========== HOOK BLOCK & LOAD LINE ========== */}
          <group position={[currentBoomLength + 0.3 * s, 0, 0]}>
            {/* Load line */}
            <mesh position={[0, -loadLineLength / 2, 0]}>
              <cylinderGeometry args={[0.02 * s, 0.02 * s, loadLineLength, 8]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Hook block */}
            <mesh position={[0, -loadLineLength, 0]} castShadow>
              <boxGeometry args={[0.5 * s, 0.7 * s, 0.4 * s]} />
              <primitive object={matDarkGray} attach="material" />
            </mesh>
            {/* Hook block sheaves */}
            {[-1, 1].map(k => (
              <mesh key={`block-sheave-${k}`} position={[0, -loadLineLength + 0.1 * s, k * 0.12 * s]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.12 * s, 0.03 * s, 8, 16]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
            ))}
            {/* Hook */}
            <mesh position={[0, -loadLineLength - 0.6 * s, 0]} rotation={[0, 0, Math.PI]} castShadow>
              <torusGeometry args={[0.3 * s, 0.08 * s, 12, 24, Math.PI * 1.5]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
            {/* Hook shank */}
            <mesh position={[0, -loadLineLength - 0.35 * s, 0]} castShadow>
              <cylinderGeometry args={[0.06 * s, 0.06 * s, 0.3 * s, 12]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
          </group>
        </group>

        {/* Boom luffing cylinder */}
        <mesh
          position={[
            boomPivotX + 0.5 * s + Math.cos(luffRad) * 3 * s,
            boomPivotY - superY - 1.5 * s + Math.sin(luffRad) * 1.5 * s,
            0
          ]}
          rotation={[0, 0, luffRad - 0.3]}
          castShadow
        >
          <cylinderGeometry args={[0.12 * s, 0.12 * s, 4 * s, 12]} />
          <primitive object={matSteel} attach="material" />
        </mesh>
      </group>

      {/* ========== OUTRIGGERS ========== */}
      {(() => {
        const beamLength = 3.5 * s  // How far the beam extends
        const outriggerPositions = [
          { x: chassisLength * 0.38, side: 1 },   // Front right
          { x: chassisLength * 0.38, side: -1 },  // Front left
          { x: -chassisLength * 0.38, side: 1 },  // Rear right
          { x: -chassisLength * 0.38, side: -1 }  // Rear left
        ]
        return outriggerPositions.map((pos, idx) => (
          <group key={`outrigger-${idx}`} position={[pos.x, groundClearance + chassisHeight / 2, 0]}>
            {/* Outrigger box (attached to chassis side) */}
            <mesh position={[0, 0, pos.side * (chassisWidth / 2 + 0.15 * s)]} castShadow>
              <boxGeometry args={[0.6 * s, chassisHeight * 0.7, 0.3 * s]} />
              <primitive object={matGreen} attach="material" />
            </mesh>
            {/* Outrigger beam - extends from box outward */}
            <mesh position={[0, -0.1 * s, pos.side * (chassisWidth / 2 + beamLength / 2 + 0.3 * s)]} castShadow>
              <boxGeometry args={[0.25 * s, 0.2 * s, beamLength]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
            {/* Jack cylinder - at end of beam, going down */}
            <mesh position={[0, -groundClearance / 2 - 0.1 * s, pos.side * (chassisWidth / 2 + beamLength + 0.3 * s)]} castShadow>
              <cylinderGeometry args={[0.08 * s, 0.08 * s, groundClearance + chassisHeight * 0.4, 12]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Outrigger pad - at bottom of jack */}
            <mesh position={[0, -groundClearance - chassisHeight * 0.1, pos.side * (chassisWidth / 2 + beamLength + 0.3 * s)]} castShadow receiveShadow>
              <cylinderGeometry args={[0.45 * s, 0.45 * s, 0.12 * s, 16]} />
              <primitive object={matDarkGray} attach="material" />
            </mesh>
          </group>
        ))
      })()}
    </group>
  )
}

