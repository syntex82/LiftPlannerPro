"use client"

import { useRef, useMemo } from 'react'
import * as THREE from 'three'

export interface RealisticCrane3DProps {
  boomAngleDeg?: number
  extension?: number
  scaleFactor?: number
  loadLineLength?: number
  position?: [number, number, number]
}

export default function RealisticCrane3D({
  boomAngleDeg = 45,
  extension = 0.5,
  scaleFactor = 1,
  loadLineLength = 5,
  position = [0, 0, 0]
}: RealisticCrane3DProps) {
  
  // Realistic Liebherr LTM 1300 dimensions (in meters)
  const chassisLength = 15.3 * scaleFactor
  const chassisWidth = 3.0 * scaleFactor
  const chassisHeight = 1.2 * scaleFactor
  
  // Boom dimensions
  const boomBaseLength = 15.0 * scaleFactor
  const boomMaxLength = 78.0 * scaleFactor
  const currentBoomLength = boomBaseLength + (boomMaxLength - boomBaseLength) * extension
  const boomHeight = 1.2 * scaleFactor
  const boomWidth = 1.0 * scaleFactor
  
  // Boom angle
  const luffRad = THREE.MathUtils.degToRad(Math.max(0, Math.min(85, boomAngleDeg)))
  
  // Professional Liebherr materials
  const liebherrYellow = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#FFD700", 
    metalness: 0.4, 
    roughness: 0.3 
  }), [])
  
  const darkGray = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#2C3E50", 
    metalness: 0.6, 
    roughness: 0.3 
  }), [])
  
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#87CEEB", 
    transparent: true, 
    opacity: 0.7,
    metalness: 0.1,
    roughness: 0.1
  }), [])
  
  const blackRubber = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#1A1A1A", 
    roughness: 0.9 
  }), [])
  
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#708090", 
    metalness: 0.8, 
    roughness: 0.2 
  }), [])

  return (
    <group position={position}>
      {/* Main Chassis - Rounded */}
      <mesh position={[0, chassisHeight/2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[chassisWidth/2, chassisLength - chassisWidth, 8, 16]} />
        <primitive object={liebherrYellow} attach="material" />
      </mesh>

      {/* Front Axle - Cylindrical */}
      <mesh position={[chassisLength*0.35, chassisHeight*0.3, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.2*scaleFactor, 0.2*scaleFactor, chassisWidth*1.2, 16]} />
        <primitive object={darkGray} attach="material" />
      </mesh>

      {/* Rear Axle - Cylindrical */}
      <mesh position={[-chassisLength*0.35, chassisHeight*0.3, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.2*scaleFactor, 0.2*scaleFactor, chassisWidth*1.2, 16]} />
        <primitive object={darkGray} attach="material" />
      </mesh>

      {/* Wheels - Front (Correct Orientation) */}
      {[-1, 1].map((side, i) => (
        <group key={`front-wheel-${i}`}>
          <mesh position={[chassisLength*0.35, 0, side * chassisWidth*0.7]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6*scaleFactor, 0.6*scaleFactor, 0.4*scaleFactor, 16]} />
            <primitive object={blackRubber} attach="material" />
          </mesh>
          {/* Rim */}
          <mesh position={[chassisLength*0.35, 0, side * chassisWidth*0.7]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.4*scaleFactor, 0.4*scaleFactor, 0.45*scaleFactor, 16]} />
            <primitive object={steel} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Wheels - Rear (Correct Orientation) */}
      {[-1, 1].map((side, i) => (
        <group key={`rear-wheel-${i}`}>
          <mesh position={[-chassisLength*0.35, 0, side * chassisWidth*0.7]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6*scaleFactor, 0.6*scaleFactor, 0.4*scaleFactor, 16]} />
            <primitive object={blackRubber} attach="material" />
          </mesh>
          {/* Rim */}
          <mesh position={[-chassisLength*0.35, 0, side * chassisWidth*0.7]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.4*scaleFactor, 0.4*scaleFactor, 0.45*scaleFactor, 16]} />
            <primitive object={steel} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Carrier Cab - Rounded */}
      <mesh position={[chassisLength*0.25, chassisHeight + 1.1*scaleFactor, chassisWidth*0.35]} castShadow receiveShadow>
        <capsuleGeometry args={[1.0*scaleFactor, 1.5*scaleFactor, 4, 8]} />
        <primitive object={liebherrYellow} attach="material" />
      </mesh>

      {/* Carrier Cab Windows */}
      <mesh position={[chassisLength*0.25 + 1.2*scaleFactor, chassisHeight + 1.1*scaleFactor, chassisWidth*0.35]}>
        <boxGeometry args={[0.1*scaleFactor, 1.5*scaleFactor, 1.5*scaleFactor]} />
        <primitive object={glass} attach="material" />
      </mesh>

      {/* Superstructure (Turntable Housing) - Cylindrical */}
      <mesh position={[0, chassisHeight + 1.4*scaleFactor, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2*scaleFactor, 2.2*scaleFactor, 2.8*scaleFactor, 16]} />
        <primitive object={liebherrYellow} attach="material" />
      </mesh>

      {/* Operator Cab - Rounded */}
      <mesh position={[1.5*scaleFactor, chassisHeight + 2.5*scaleFactor, 1.2*scaleFactor]} castShadow receiveShadow>
        <capsuleGeometry args={[0.9*scaleFactor, 1.3*scaleFactor, 4, 8]} />
        <primitive object={liebherrYellow} attach="material" />
      </mesh>

      {/* Operator Cab Windows */}
      <mesh position={[2.4*scaleFactor, chassisHeight + 2.5*scaleFactor, 1.2*scaleFactor]}>
        <boxGeometry args={[0.1*scaleFactor, 1.8*scaleFactor, 1.5*scaleFactor]} />
        <primitive object={glass} attach="material" />
      </mesh>

      {/* Counterweight - Rounded */}
      <mesh position={[-2.5*scaleFactor, chassisHeight + 1.25*scaleFactor, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[1.3*scaleFactor, 2.5*scaleFactor, 4, 8]} />
        <primitive object={darkGray} attach="material" />
      </mesh>

      {/* Outriggers - Properly Connected */}
      {[
        { pos: [chassisLength*0.25, chassisHeight, 0], name: 'front' },
        { pos: [-chassisLength*0.25, chassisHeight, 0], name: 'rear' }
      ].map((outrigger, i) => (
        <group key={`outrigger-${i}`} position={outrigger.pos as [number, number, number]}>
          {/* Outrigger Box (Connected to chassis) */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.5*scaleFactor, 0.8*scaleFactor, 1.0*scaleFactor]} />
            <primitive object={liebherrYellow} attach="material" />
          </mesh>

          {/* Left outrigger beam */}
          <mesh position={[0, 0, -4*scaleFactor]} rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.15*scaleFactor, 0.15*scaleFactor, 3.5*scaleFactor, 8]} />
            <primitive object={liebherrYellow} attach="material" />
          </mesh>
          {/* Right outrigger beam */}
          <mesh position={[0, 0, 4*scaleFactor]} rotation={[0, 0, Math.PI/2]} castShadow>
            <cylinderGeometry args={[0.15*scaleFactor, 0.15*scaleFactor, 3.5*scaleFactor, 8]} />
            <primitive object={liebherrYellow} attach="material" />
          </mesh>

          {/* Left outrigger pad */}
          <mesh position={[0, -2.5*scaleFactor, -5.5*scaleFactor]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8*scaleFactor, 0.8*scaleFactor, 0.3*scaleFactor, 16]} />
            <primitive object={darkGray} attach="material" />
          </mesh>
          {/* Right outrigger pad */}
          <mesh position={[0, -2.5*scaleFactor, 5.5*scaleFactor]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8*scaleFactor, 0.8*scaleFactor, 0.3*scaleFactor, 16]} />
            <primitive object={darkGray} attach="material" />
          </mesh>

          {/* Outrigger cylinders */}
          <mesh position={[0, -1.2*scaleFactor, -5.5*scaleFactor]} castShadow>
            <cylinderGeometry args={[0.1*scaleFactor, 0.1*scaleFactor, 2.5*scaleFactor, 8]} />
            <primitive object={steel} attach="material" />
          </mesh>
          <mesh position={[0, -1.2*scaleFactor, 5.5*scaleFactor]} castShadow>
            <cylinderGeometry args={[0.1*scaleFactor, 0.1*scaleFactor, 2.5*scaleFactor, 8]} />
            <primitive object={steel} attach="material" />
          </mesh>
        </group>
      ))}
      
      {/* Boom Assembly */}
      <group position={[-1*scaleFactor, chassisHeight + 2.8*scaleFactor, 0]} rotation={[0, 0, luffRad]}>
        {/* Main Boom Section */}
        <mesh position={[currentBoomLength/2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[currentBoomLength, boomHeight, boomWidth]} />
          <primitive object={liebherrYellow} attach="material" />
        </mesh>
        
        {/* Boom Head */}
        <mesh position={[currentBoomLength, 0, 0]} castShadow>
          <boxGeometry args={[0.8*scaleFactor, 1.5*scaleFactor, 1.2*scaleFactor]} />
          <primitive object={liebherrYellow} attach="material" />
        </mesh>
        
        {/* Hook Block */}
        <mesh position={[currentBoomLength, -loadLineLength, 0]} castShadow>
          <boxGeometry args={[0.6*scaleFactor, 0.8*scaleFactor, 0.4*scaleFactor]} />
          <primitive object={darkGray} attach="material" />
        </mesh>
        
        {/* Hook */}
        <mesh position={[currentBoomLength, -loadLineLength - 0.6*scaleFactor, 0]} castShadow>
          <torusGeometry args={[0.3*scaleFactor, 0.1*scaleFactor, 8, 16, Math.PI * 1.5]} />
          <primitive object={steel} attach="material" />
        </mesh>
        
        {/* Load Line */}
        <mesh position={[currentBoomLength, -loadLineLength/2, 0]}>
          <cylinderGeometry args={[0.02*scaleFactor, 0.02*scaleFactor, loadLineLength, 8]} />
          <primitive object={steel} attach="material" />
        </mesh>
      </group>
      
      {/* Boom Cylinder */}
      <mesh 
        position={[-1*scaleFactor + Math.cos(luffRad)*2*scaleFactor, chassisHeight + 1.4*scaleFactor + Math.sin(luffRad)*2*scaleFactor, 0]} 
        rotation={[0, 0, luffRad - Math.PI/2]}
        castShadow
      >
        <cylinderGeometry args={[0.15*scaleFactor, 0.15*scaleFactor, 4*scaleFactor, 16]} />
        <primitive object={steel} attach="material" />
      </mesh>
    </group>
  )
}
