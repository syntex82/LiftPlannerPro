"use client"

import * as THREE from "three"
import { useMemo } from "react"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
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

  // Materials - Liebherr colors with smoother appearance
  const matGreen = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2E8B57", metalness: 0.35, roughness: 0.4
  }), [])

  const matYellow = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFD700", metalness: 0.45, roughness: 0.25
  }), [])

  const matBlack = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1a1a", metalness: 0.15, roughness: 0.85
  }), [])

  const matSteel = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#708090", metalness: 0.75, roughness: 0.25
  }), [])

  const matGlass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#87CEEB", transparent: true, opacity: 0.5, metalness: 0.1, roughness: 0.05, clearcoat: 0.8
  }), [])

  const matDarkGray = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2C3E50", metalness: 0.55, roughness: 0.35
  }), [])

  // Rounded box geometries for smoother look
  const roundedChassisGeom = useMemo(() => new RoundedBoxGeometry(chassisLength, chassisHeight, chassisWidth, 4, 0.08 * s), [chassisLength, chassisHeight, chassisWidth, s])

  // Superstructure position (on top of chassis, centered)
  const superY = groundClearance + chassisHeight
  const superHeight = 1.8 * s
  const superWidth = 2.4 * s
  const superLength = 3.2 * s

  // Boom pivot point - MOVED HIGHER AND BACK to clear crane cab
  const boomPivotY = superY + superHeight + 1.2 * s  // Higher up
  const boomPivotX = -1.0 * s  // Further back

  return (
    <group position={position} rotation={rotation}>

      {/* ========== CHASSIS (Rounded) ========== */}
      <mesh position={[0, groundClearance + chassisHeight / 2, 0]} castShadow receiveShadow>
        <primitive object={roundedChassisGeom} attach="geometry" />
        <primitive object={matGreen} attach="material" />
      </mesh>

      {/* Chassis side rails (rounded) */}
      {[-1, 1].map(side => (
        <mesh key={`rail-${side}`} position={[0, groundClearance + chassisHeight + 0.12 * s, side * (chassisWidth / 2 - 0.08 * s)]} castShadow>
          <capsuleGeometry args={[0.1 * s, chassisLength * 0.85, 8, 16]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
      ))}

      {/* ========== AXLES & WHEELS (Properly Connected) ========== */}
      {axlePositions.map((xPos, idx) => (
        <group key={`axle-${idx}`} position={[xPos, wheelRadius, 0]}>
          {/* Main axle beam - connects both wheels */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12 * s, 0.12 * s, chassisWidth + wheelWidth * 2, 16]} />
            <primitive object={matSteel} attach="material" />
          </mesh>

          {/* Axle housing (differential) - rounded */}
          <mesh castShadow>
            <capsuleGeometry args={[0.18 * s, 0.3 * s, 8, 16]} />
            <primitive object={matDarkGray} attach="material" />
          </mesh>

          {/* Suspension arms connecting to chassis */}
          {[-1, 1].map(side => (
            <group key={`susp-${side}`}>
              {/* Vertical suspension strut */}
              <mesh position={[0, (groundClearance + chassisHeight / 2 - wheelRadius) / 2, side * chassisWidth * 0.35]} castShadow>
                <cylinderGeometry args={[0.06 * s, 0.06 * s, groundClearance + chassisHeight / 2 - wheelRadius + 0.2 * s, 12]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
            </group>
          ))}

          {/* Wheels - both sides */}
          {[-1, 1].map(side => (
            <group key={`wheel-${idx}-${side}`} position={[0, 0, side * (chassisWidth / 2 + wheelWidth / 2)]}>
              {/* Tire - with tread detail (torus for rounded edge) */}
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 32]} />
                <primitive object={matBlack} attach="material" />
              </mesh>
              {/* Tire sidewall detail */}
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <torusGeometry args={[wheelRadius - 0.02 * s, 0.04 * s, 8, 32]} />
                <primitive object={matBlack} attach="material" />
              </mesh>
              {/* Rim - smoother */}
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[wheelRadius * 0.55, wheelRadius * 0.55, wheelWidth * 0.9, 24]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
              {/* Hub cap - domed */}
              <mesh position={[0, 0, side * wheelWidth * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[wheelRadius * 0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
              {/* Lug nuts */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <mesh key={`lug-${i}`} position={[
                  Math.cos(i * Math.PI / 3) * wheelRadius * 0.35,
                  Math.sin(i * Math.PI / 3) * wheelRadius * 0.35,
                  side * wheelWidth * 0.48
                ]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.03 * s, 0.03 * s, 0.04 * s, 8]} />
                  <primitive object={matSteel} attach="material" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* ========== DRIVER CAB (Front - Rounded) ========== */}
      <group position={[chassisLength / 2 - 1.4 * s, groundClearance + chassisHeight, 0]}>
        {/* Cab body - main rounded shape */}
        <mesh position={[0, 0.75 * s, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.7 * s, 0.8 * s, 8, 16]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Cab body - lower section (rounded box) */}
        <mesh position={[0, 0.4 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2 * s, 0.8 * s, chassisWidth * 0.88]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Cab front curve */}
        <mesh position={[0.9 * s, 0.8 * s, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.6 * s, 0.6 * s, chassisWidth * 0.85, 16, 1, false, 0, Math.PI / 2]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Windshield - curved */}
        <mesh position={[0.95 * s, 1.1 * s, 0]} rotation={[0, 0, -0.25]}>
          <planeGeometry args={[1.0 * s, chassisWidth * 0.75]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
        {/* Side windows - larger */}
        {[-1, 1].map(side => (
          <mesh key={`side-win-${side}`} position={[0.1 * s, 1.0 * s, side * (chassisWidth * 0.44)]}>
            <planeGeometry args={[1.6 * s, 0.65 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        ))}
        {/* Roof - rounded */}
        <mesh position={[0, 1.45 * s, 0]} castShadow>
          <capsuleGeometry args={[0.06 * s, chassisWidth * 0.8, 4, 8]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Headlights - spherical */}
        {[-1, 1].map(side => (
          <mesh key={`headlight-${side}`} position={[1.1 * s, 0.35 * s, side * 0.75 * s]}>
            <sphereGeometry args={[0.1 * s, 16, 16]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        ))}
        {/* Side mirrors */}
        {[-1, 1].map(side => (
          <group key={`mirror-${side}`} position={[0.8 * s, 0.9 * s, side * (chassisWidth * 0.5 + 0.15 * s)]}>
            <mesh rotation={[0, side * 0.3, 0]}>
              <boxGeometry args={[0.15 * s, 0.12 * s, 0.08 * s]} />
              <primitive object={matBlack} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========== SUPERSTRUCTURE (Rotates) ========== */}
      <group position={[-0.5 * s, superY, 0]} rotation={[0, slewRad, 0]}>

        {/* Turntable base - with bearing detail */}
        <mesh position={[0, 0.1 * s, 0]} castShadow>
          <cylinderGeometry args={[1.35 * s, 1.35 * s, 0.25 * s, 32]} />
          <primitive object={matSteel} attach="material" />
        </mesh>
        {/* Turntable ring detail */}
        <mesh position={[0, 0.15 * s, 0]}>
          <torusGeometry args={[1.2 * s, 0.08 * s, 8, 32]} />
          <primitive object={matDarkGray} attach="material" />
        </mesh>

        {/* Main superstructure body - rounded */}
        <mesh position={[0, superHeight / 2 + 0.25 * s, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[superWidth * 0.45, superLength * 0.6, 8, 16]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Superstructure base plate */}
        <mesh position={[0, 0.35 * s, 0]} castShadow>
          <cylinderGeometry args={[superWidth * 0.55, superWidth * 0.55, 0.3 * s, 24]} />
          <primitive object={matGreen} attach="material" />
        </mesh>

        {/* Engine housing (rear - rounded) */}
        <mesh position={[-superLength / 2 - 0.3 * s, superHeight / 2 + 0.25 * s, 0]} castShadow>
          <capsuleGeometry args={[superWidth * 0.4, 0.4 * s, 8, 16]} />
          <primitive object={matGreen} attach="material" />
        </mesh>
        {/* Engine exhaust */}
        <mesh position={[-superLength / 2 - 0.5 * s, superHeight + 0.3 * s, superWidth * 0.3]} castShadow>
          <cylinderGeometry args={[0.08 * s, 0.06 * s, 0.4 * s, 12]} />
          <primitive object={matSteel} attach="material" />
        </mesh>

        {/* ========== CRANE CAB (Rounded - positioned to not collide with boom) ========== */}
        <group position={[superLength / 2 + 0.3 * s, superHeight * 0.3, superWidth / 2 - 0.5 * s]}>
          {/* Cab body - rounded capsule shape */}
          <mesh position={[0, 0.7 * s, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.65 * s, 0.6 * s, 8, 16]} />
            <primitive object={matGreen} attach="material" />
          </mesh>
          {/* Cab base */}
          <mesh position={[0, 0.15 * s, 0]} castShadow>
            <boxGeometry args={[1.6 * s, 0.3 * s, 1.4 * s]} />
            <primitive object={matGreen} attach="material" />
          </mesh>
          {/* Front window - curved panoramic */}
          <mesh position={[0.7 * s, 0.75 * s, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.55 * s, 0.55 * s, 0.02 * s, 16, 1, false, -Math.PI / 3, Math.PI * 2 / 3]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          {/* Side windows */}
          {[-1, 1].map(side => (
            <mesh key={`crane-side-win-${side}`} position={[0.1 * s, 0.75 * s, side * 0.68 * s]}>
              <planeGeometry args={[1.2 * s, 0.9 * s]} />
              <primitive object={matGlass} attach="material" />
            </mesh>
          ))}
          {/* Top window (skylight) */}
          <mesh position={[0.1 * s, 1.25 * s, 0]} rotation={[0, 0, 0.1]}>
            <circleGeometry args={[0.5 * s, 16]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        </group>

        {/* ========== A-FRAME (Boom support structure) ========== */}
        <group position={[0, superHeight + 0.3 * s, 0]}>
          {/* A-frame legs */}
          {[-1, 1].map(side => (
            <mesh key={`aframe-${side}`} position={[0.3 * s, 0.6 * s, side * 0.6 * s]} rotation={[side * 0.15, 0, 0.2]} castShadow>
              <cylinderGeometry args={[0.1 * s, 0.12 * s, 1.5 * s, 12]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
          ))}
          {/* A-frame top crossbar */}
          <mesh position={[0.5 * s, 1.2 * s, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08 * s, 0.08 * s, 1.0 * s, 12]} />
            <primitive object={matYellow} attach="material" />
          </mesh>
        </group>

        {/* ========== COUNTERWEIGHT (Rounded) ========== */}
        <mesh position={[-superLength / 2 - 1.4 * s, superHeight / 2 + 0.25 * s, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[superWidth * 0.42, 0.8 * s, 8, 16]} />
          <primitive object={matDarkGray} attach="material" />
        </mesh>

        {/* Counterweight lifting eyes */}
        {[-1, 1].map(side => (
          <mesh key={`cw-eye-${side}`} position={[-superLength / 2 - 1.4 * s, superHeight + 0.1 * s, side * superWidth * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12 * s, 0.04 * s, 8, 16]} />
            <primitive object={matSteel} attach="material" />
          </mesh>
        ))}

        {/* ========== BOOM ASSEMBLY ========== */}
        {(() => {
          // Boom pivot point relative to superstructure - positioned to clear cab
          const boomPivotLocalX = boomPivotX + 0.5 * s
          const boomPivotLocalY = boomPivotY - superY

          // Calculate boom tip position (accounting for boom angle)
          const boomTipLocalX = boomPivotLocalX + Math.cos(luffRad) * (currentBoomLength + 0.3 * s)
          const boomTipLocalY = boomPivotLocalY + Math.sin(luffRad) * (currentBoomLength + 0.3 * s)

          // Lattice cross-brace positions along boom
          const latticeCount = Math.floor(currentBoomLength / (1.8 * s))
          const latticePositions = Array.from({ length: latticeCount }, (_, i) => (i + 0.5) * (currentBoomLength / latticeCount))

          return (
            <>
              {/* Boom pivot mount */}
              <group position={[boomPivotLocalX, boomPivotLocalY, 0]}>
                {/* Pivot cylinder */}
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.2 * s, 0.2 * s, boomWidth * 1.2, 16]} />
                  <primitive object={matSteel} attach="material" />
                </mesh>
              </group>

              {/* Boom rotation group */}
              <group position={[boomPivotLocalX, boomPivotLocalY, 0]} rotation={[0, 0, luffRad]}>

                {/* Boom main structure - 4 corner chords (CYLINDRICAL TUBES for smooth look) */}
                {[
                  { y: boomHeight * 0.4, z: boomWidth * 0.4 },
                  { y: boomHeight * 0.4, z: -boomWidth * 0.4 },
                  { y: -boomHeight * 0.4, z: boomWidth * 0.4 },
                  { y: -boomHeight * 0.4, z: -boomWidth * 0.4 }
                ].map((corner, idx) => (
                  <mesh key={`chord-${idx}`} position={[currentBoomLength / 2, corner.y, corner.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.06 * s, 0.06 * s, currentBoomLength, 12]} />
                    <primitive object={matYellow} attach="material" />
                  </mesh>
                ))}

                {/* Lattice cross-braces (TUBULAR) */}
                {latticePositions.map((xPos, idx) => (
                  <group key={`lattice-${idx}`} position={[xPos, 0, 0]}>
                    {/* Top horizontal tube */}
                    <mesh position={[0, boomHeight * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.035 * s, 0.035 * s, boomWidth * 0.8, 8]} />
                      <primitive object={matYellow} attach="material" />
                    </mesh>
                    {/* Bottom horizontal tube */}
                    <mesh position={[0, -boomHeight * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.035 * s, 0.035 * s, boomWidth * 0.8, 8]} />
                      <primitive object={matYellow} attach="material" />
                    </mesh>
                    {/* Side vertical tubes */}
                    {[-1, 1].map(side => (
                      <mesh key={`vert-${side}`} position={[0, 0, side * boomWidth * 0.4]} castShadow>
                        <cylinderGeometry args={[0.035 * s, 0.035 * s, boomHeight * 0.8, 8]} />
                        <primitive object={matYellow} attach="material" />
                      </mesh>
                    ))}
                    {/* Diagonal braces (X pattern - tubes) */}
                    {[-1, 1].map(side => (
                      <mesh key={`diag-${side}`} position={[0, 0, side * boomWidth * 0.4]} rotation={[0, 0, Math.PI / 4]} castShadow>
                        <cylinderGeometry args={[0.025 * s, 0.025 * s, boomHeight * 1.1, 8]} />
                        <primitive object={matYellow} attach="material" />
                      </mesh>
                    ))}
                    {/* Cross diagonal (other direction) */}
                    {[-1, 1].map(side => (
                      <mesh key={`diag2-${side}`} position={[0, 0, side * boomWidth * 0.4]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                        <cylinderGeometry args={[0.025 * s, 0.025 * s, boomHeight * 1.1, 8]} />
                        <primitive object={matYellow} attach="material" />
                      </mesh>
                    ))}
                  </group>
                ))}

                {/* Boom head (sheave block - rounded) */}
                <group position={[currentBoomLength + 0.3 * s, 0, 0]}>
                  {/* Head frame - rounded */}
                  <mesh castShadow>
                    <capsuleGeometry args={[boomWidth * 0.5, 0.3 * s, 8, 16]} />
                    <primitive object={matYellow} attach="material" />
                  </mesh>
                  {/* Sheave guard plates */}
                  {[-1, 1].map(side => (
                    <mesh key={`guard-${side}`} position={[0.15 * s, 0, side * boomWidth * 0.55]} castShadow>
                      <cylinderGeometry args={[0.25 * s, 0.25 * s, 0.04 * s, 16]} />
                      <primitive object={matYellow} attach="material" />
                    </mesh>
                  ))}
                  {/* Sheaves (pulleys) */}
                  {[-1, 0, 1].map(k => (
                    <mesh key={`sheave-${k}`} position={[0.15 * s, 0, k * 0.2 * s]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <torusGeometry args={[0.18 * s, 0.04 * s, 12, 24]} />
                      <primitive object={matSteel} attach="material" />
                    </mesh>
                  ))}
                </group>
              </group>

              {/* ========== HOOK BLOCK & LOAD LINE (VERTICAL - outside boom rotation) ========== */}
              <group position={[boomTipLocalX, boomTipLocalY, 0]}>
                {/* Load line - hangs vertically from boom tip */}
                <mesh position={[0, -loadLineLength / 2, 0]}>
                  <cylinderGeometry args={[0.02 * s, 0.02 * s, loadLineLength, 12]} />
                  <primitive object={matSteel} attach="material" />
                </mesh>

                {/* Hook block - rounded */}
                <group position={[0, -loadLineLength, 0]}>
                  {/* Block body - capsule shape */}
                  <mesh castShadow>
                    <capsuleGeometry args={[0.15 * s, 0.25 * s, 8, 16]} />
                    <primitive object={matDarkGray} attach="material" />
                  </mesh>
                  {/* Block sheaves */}
                  {[-1, 1].map(k => (
                    <mesh key={`block-sheave-${k}`} position={[0, 0.08 * s, k * 0.12 * s]} rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[0.1 * s, 0.025 * s, 8, 16]} />
                      <primitive object={matSteel} attach="material" />
                    </mesh>
                  ))}
                  {/* Hook shank */}
                  <mesh position={[0, -0.4 * s, 0]} castShadow>
                    <cylinderGeometry args={[0.05 * s, 0.05 * s, 0.25 * s, 12]} />
                    <primitive object={matSteel} attach="material" />
                  </mesh>
                  {/* Hook - proper crane hook shape */}
                  <mesh position={[0, -0.65 * s, 0]} rotation={[0, 0, Math.PI]} castShadow>
                    <torusGeometry args={[0.25 * s, 0.06 * s, 12, 24, Math.PI * 1.5]} />
                    <primitive object={matYellow} attach="material" />
                  </mesh>
                  {/* Safety latch */}
                  <mesh position={[0.15 * s, -0.55 * s, 0]} rotation={[0, 0, -0.3]} castShadow>
                    <boxGeometry args={[0.2 * s, 0.03 * s, 0.04 * s]} />
                    <primitive object={matYellow} attach="material" />
                  </mesh>
                </group>
              </group>
            </>
          )
        })()}

        {/* Boom luffing cylinders (dual) */}
        {[-1, 1].map(side => (
          <group key={`luff-cyl-${side}`}>
            {/* Cylinder body */}
            <mesh
              position={[
                boomPivotX + 0.5 * s + Math.cos(luffRad * 0.5) * 2.5 * s,
                boomPivotY - superY - 1.2 * s + Math.sin(luffRad * 0.5) * 1.2 * s,
                side * 0.4 * s
              ]}
              rotation={[0, 0, luffRad * 0.6 - 0.2]}
              castShadow
            >
              <cylinderGeometry args={[0.1 * s, 0.12 * s, 3.5 * s, 16]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Piston rod */}
            <mesh
              position={[
                boomPivotX + 0.5 * s + Math.cos(luffRad * 0.7) * 4 * s,
                boomPivotY - superY - 0.5 * s + Math.sin(luffRad * 0.7) * 2 * s,
                side * 0.4 * s
              ]}
              rotation={[0, 0, luffRad * 0.6 - 0.1]}
              castShadow
            >
              <cylinderGeometry args={[0.06 * s, 0.06 * s, 2 * s, 12]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========== OUTRIGGERS (Smoother) ========== */}
      {(() => {
        const beamLength = 3.5 * s
        const outriggerPositions = [
          { x: chassisLength * 0.38, side: 1 },
          { x: chassisLength * 0.38, side: -1 },
          { x: -chassisLength * 0.38, side: 1 },
          { x: -chassisLength * 0.38, side: -1 }
        ]
        return outriggerPositions.map((pos, idx) => (
          <group key={`outrigger-${idx}`} position={[pos.x, groundClearance + chassisHeight / 2, 0]}>
            {/* Outrigger box (rounded) */}
            <mesh position={[0, 0, pos.side * (chassisWidth / 2 + 0.12 * s)]} castShadow>
              <capsuleGeometry args={[0.2 * s, 0.25 * s, 4, 8]} />
              <primitive object={matGreen} attach="material" />
            </mesh>
            {/* Outrigger beam - tubular */}
            <mesh position={[0, -0.08 * s, pos.side * (chassisWidth / 2 + beamLength / 2 + 0.25 * s)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1 * s, 0.1 * s, beamLength, 12]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
            {/* Inner telescopic section */}
            <mesh position={[0, -0.08 * s, pos.side * (chassisWidth / 2 + beamLength * 0.7 + 0.25 * s)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.07 * s, 0.07 * s, beamLength * 0.6, 12]} />
              <primitive object={matYellow} attach="material" />
            </mesh>
            {/* Jack cylinder housing */}
            <mesh position={[0, -0.05 * s, pos.side * (chassisWidth / 2 + beamLength + 0.25 * s)]} castShadow>
              <cylinderGeometry args={[0.12 * s, 0.12 * s, 0.3 * s, 16]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Jack piston */}
            <mesh position={[0, -groundClearance / 2 - 0.15 * s, pos.side * (chassisWidth / 2 + beamLength + 0.25 * s)]} castShadow>
              <cylinderGeometry args={[0.07 * s, 0.07 * s, groundClearance + chassisHeight * 0.3, 12]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Outrigger pad - rounded edge */}
            <mesh position={[0, -groundClearance - chassisHeight * 0.15, pos.side * (chassisWidth / 2 + beamLength + 0.25 * s)]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4 * s, 0.45 * s, 0.1 * s, 24]} />
              <primitive object={matDarkGray} attach="material" />
            </mesh>
            {/* Pad rubber ring */}
            <mesh position={[0, -groundClearance - chassisHeight * 0.18, pos.side * (chassisWidth / 2 + beamLength + 0.25 * s)]}>
              <torusGeometry args={[0.38 * s, 0.04 * s, 8, 24]} />
              <primitive object={matBlack} attach="material" />
            </mesh>
          </group>
        ))
      })()}
    </group>
  )
}

