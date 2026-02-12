"use client"

import * as THREE from "three"
import { useMemo, useRef } from "react"
import { LTM_1055_3D_SPEC, Crane3DSpec } from "@/lib/crane-3d-models"

export interface LTM1055Crane3DProps {
  spec?: Crane3DSpec
  boomAngleDeg?: number
  extension?: number // 0-1 fraction
  scaleFactor?: number
  loadLineLength?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  slewAngle?: number // Superstructure rotation in degrees
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
  const groupRef = useRef<THREE.Group>(null)
  
  // Scale all dimensions
  const s = scaleFactor
  const dim = spec.dimensions
  const axles = spec.axles
  const boom = spec.boom
  const superstructure = spec.superstructure
  const counterweight = spec.counterweight
  const driverCab = spec.driverCab
  const craneCab = spec.craneCab
  const outriggers = spec.outriggers
  const colors = spec.colors

  // Calculate boom length based on extension
  const currentBoomLength = useMemo(() => {
    const ext = THREE.MathUtils.clamp(extension, 0, 1)
    return boom.baseLength + (boom.maxLength - boom.baseLength) * ext
  }, [boom.baseLength, boom.maxLength, extension])

  // Boom angle in radians (luffing angle)
  const luffRad = useMemo(() => 
    THREE.MathUtils.degToRad(THREE.MathUtils.clamp(boomAngleDeg, 0, 85)),
    [boomAngleDeg]
  )

  // Slew angle in radians
  const slewRad = useMemo(() => THREE.MathUtils.degToRad(slewAngle), [slewAngle])

  // Materials
  const matChassis = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.chassis, metalness: 0.3, roughness: 0.6 
  }), [colors.chassis])
  
  const matBoom = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.boom, metalness: 0.4, roughness: 0.4 
  }), [colors.boom])
  
  const matCounterweight = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.counterweight, metalness: 0.2, roughness: 0.8 
  }), [colors.counterweight])
  
  const matWheel = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.wheels, metalness: 0.1, roughness: 0.9 
  }), [colors.wheels])
  
  const matPad = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colors.outriggerPads, metalness: 0.3, roughness: 0.7 
  }), [colors.outriggerPads])
  
  const matGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#88ccff", transmission: 0.6, opacity: 0.7, transparent: true, roughness: 0.1 
  }), [])
  
  const matSteel = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#888888", metalness: 0.7, roughness: 0.3 
  }), [])

  // Boom sections for telescopic effect
  const boomSections = useMemo(() => {
    const sections = boom.sections
    const sectionBaseLen = boom.baseLength / sections
    const extLen = (currentBoomLength - boom.baseLength) / Math.max(1, sections - 1)
    
    return Array.from({ length: sections }, (_, i) => ({
      length: i === 0 ? sectionBaseLen : sectionBaseLen + extLen,
      width: boom.baseWidth * (1 - i * 0.08),
      height: boom.baseHeight * (1 - i * 0.08),
      offset: i === 0 ? 0 : Array.from({ length: i }, (_, j) => 
        (j === 0 ? sectionBaseLen : sectionBaseLen + extLen) * 0.95
      ).reduce((a, b) => a + b, 0)
    }))
  }, [boom, currentBoomLength])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* === CHASSIS === */}
      <mesh position={[0, dim.chassisHeight * s / 2 + axles.wheelRadius * s, 0]} castShadow receiveShadow>
        <boxGeometry args={[dim.chassisLength * s, dim.chassisHeight * s, dim.chassisWidth * s]} />
        <primitive object={matChassis} attach="material" />
      </mesh>

      {/* === AXLES AND WHEELS === */}
      {axles.positions.map((xPos, idx) => (
        <group key={`axle-${idx}`} position={[xPos * s, axles.wheelRadius * s, 0]}>
          {/* Axle beam */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1 * s, 0.1 * s, dim.chassisWidth * 1.1 * s, 12]} />
            <primitive object={matSteel} attach="material" />
          </mesh>
          {/* Left wheel */}
          <mesh position={[0, 0, -dim.chassisWidth * s / 2 - axles.wheelWidth * s / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[axles.wheelRadius * s, axles.wheelRadius * s, axles.wheelWidth * s, 24]} />
            <primitive object={matWheel} attach="material" />
          </mesh>
          {/* Right wheel */}
          <mesh position={[0, 0, dim.chassisWidth * s / 2 + axles.wheelWidth * s / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[axles.wheelRadius * s, axles.wheelRadius * s, axles.wheelWidth * s, 24]} />
            <primitive object={matWheel} attach="material" />
          </mesh>
          {/* Wheel hub caps */}
          {[-1, 1].map(side => (
            <mesh key={`hub-${idx}-${side}`} position={[0, 0, side * (dim.chassisWidth * s / 2 + axles.wheelWidth * s)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[axles.wheelRadius * 0.4 * s, axles.wheelRadius * 0.4 * s, 0.05 * s, 16]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
          ))}
        </group>
      ))}

      {/* === DRIVER CAB (Front) === */}
      <group position={[driverCab.offsetX * s, dim.chassisHeight * s + axles.wheelRadius * s + driverCab.height * s / 2, driverCab.offsetZ * s]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[driverCab.length * s, driverCab.height * s, driverCab.width * s]} />
          <primitive object={matChassis} attach="material" />
        </mesh>
        {/* Windshield */}
        <mesh position={[driverCab.length * s * 0.4, driverCab.height * s * 0.15, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.05 * s, driverCab.height * 0.6 * s, driverCab.width * 0.85 * s]} />
          <primitive object={matGlass} attach="material" />
        </mesh>
      </group>

      {/* === SUPERSTRUCTURE (Rotates with slew) === */}
      <group
        position={[superstructure.offsetX * s, dim.chassisHeight * s + axles.wheelRadius * s, 0]}
        rotation={[0, slewRad, 0]}
      >
        {/* Turntable */}
        <mesh position={[0, 0.1 * s, 0]} castShadow>
          <cylinderGeometry args={[superstructure.turntableRadius * s, superstructure.turntableRadius * s, 0.2 * s, 24]} />
          <primitive object={matSteel} attach="material" />
        </mesh>

        {/* Superstructure housing */}
        <mesh position={[0, superstructure.height * s / 2 + 0.2 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[superstructure.length * s, superstructure.height * s, superstructure.width * s]} />
          <primitive object={matChassis} attach="material" />
        </mesh>

        {/* === CRANE CAB === */}
        <group position={[craneCab.offsetX * s, superstructure.height * s + 0.2 * s + craneCab.height * s / 2, craneCab.offsetZ * s]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[craneCab.length * s, craneCab.height * s, craneCab.width * s]} />
            <primitive object={matChassis} attach="material" />
          </mesh>
          {/* Crane cab windows */}
          <mesh position={[craneCab.length * s * 0.3, 0, craneCab.width * s * 0.45]}>
            <boxGeometry args={[craneCab.length * 0.8 * s, craneCab.height * 0.7 * s, 0.03 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
          <mesh position={[craneCab.length * s * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[craneCab.width * 0.8 * s, craneCab.height * 0.6 * s, 0.03 * s]} />
            <primitive object={matGlass} attach="material" />
          </mesh>
        </group>

        {/* === COUNTERWEIGHT === */}
        <mesh position={[counterweight.offsetX * s - superstructure.offsetX * s, superstructure.height * s / 2 + 0.2 * s, 0]} castShadow receiveShadow>
          <boxGeometry args={[counterweight.length * s, counterweight.height * s, counterweight.width * s]} />
          <primitive object={matCounterweight} attach="material" />
        </mesh>

        {/* === BOOM ASSEMBLY === */}
        <group
          position={[boom.pivotOffset * s - superstructure.offsetX * s, boom.pivotHeight * s - axles.wheelRadius * s - dim.chassisHeight * s, 0]}
          rotation={[0, 0, luffRad]}
        >
          {/* Telescopic boom sections */}
          {boomSections.map((section, idx) => {
            const prevOffset = boomSections.slice(0, idx).reduce((acc, sec) => acc + sec.length * 0.95, 0)
            return (
              <mesh
                key={`boom-section-${idx}`}
                position={[(prevOffset + section.length / 2) * s, 0, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[section.length * s, section.height * s, section.width * s]} />
                <primitive object={matBoom} attach="material" />
              </mesh>
            )
          })}

          {/* Boom head */}
          <group position={[currentBoomLength * s, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.5 * s, boom.baseHeight * 1.2 * s, boom.baseWidth * 1.3 * s]} />
              <primitive object={matBoom} attach="material" />
            </mesh>
            {/* Head sheaves */}
            {[-1, 0, 1].map(k => (
              <mesh key={`sheave-${k}`} position={[0.3 * s, 0, k * 0.15 * s]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.2 * s, 0.05 * s, 12, 24]} />
                <primitive object={matSteel} attach="material" />
              </mesh>
            ))}
          </group>

          {/* === HOOK BLOCK AND LOAD LINE === */}
          <group position={[currentBoomLength * s, 0, 0]}>
            {/* Load line */}
            <mesh position={[0, -loadLineLength * s / 2, 0]}>
              <cylinderGeometry args={[0.015 * s, 0.015 * s, loadLineLength * s, 8]} />
              <primitive object={matSteel} attach="material" />
            </mesh>
            {/* Hook block */}
            <mesh position={[0, -loadLineLength * s, 0]} castShadow>
              <boxGeometry args={[0.4 * s, 0.6 * s, 0.3 * s]} />
              <primitive object={matCounterweight} attach="material" />
            </mesh>
            {/* Hook */}
            <mesh position={[0, -loadLineLength * s - 0.5 * s, 0]} rotation={[0, 0, Math.PI]} castShadow>
              <torusGeometry args={[0.25 * s, 0.06 * s, 12, 24, Math.PI * 1.5]} />
              <primitive object={matBoom} attach="material" />
            </mesh>
          </group>
        </group>
      </group>

      {/* === OUTRIGGERS === */}
      {outriggers.positions.map((pos, idx) => (
        <group key={`outrigger-${idx}`} position={[pos.x * s, axles.wheelRadius * s, pos.z * s]}>
          {/* Outrigger beam extending outward */}
          <mesh position={[0, 0, pos.z > 0 ? outriggers.beamLength * s / 2 : -outriggers.beamLength * s / 2]} castShadow>
            <boxGeometry args={[outriggers.beamWidth * s, outriggers.beamWidth * s, outriggers.beamLength * s]} />
            <primitive object={matChassis} attach="material" />
          </mesh>
          {/* Jack cylinder */}
          <mesh position={[0, -axles.wheelRadius * s / 2, pos.z > 0 ? outriggers.beamLength * s : -outriggers.beamLength * s]} castShadow>
            <cylinderGeometry args={[0.08 * s, 0.08 * s, axles.wheelRadius * s, 12]} />
            <primitive object={matSteel} attach="material" />
          </mesh>
          {/* Outrigger pad */}
          <mesh position={[0, -axles.wheelRadius * s + 0.05 * s, pos.z > 0 ? outriggers.beamLength * s : -outriggers.beamLength * s]} castShadow receiveShadow>
            <boxGeometry args={[outriggers.padSize * s, 0.1 * s, outriggers.padSize * s]} />
            <primitive object={matPad} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

