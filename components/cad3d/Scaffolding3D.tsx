"use client"

import * as THREE from "three"
import React, { useMemo } from "react"

interface ScaffoldingProps {
  height?: number // Total height in meters
  width?: number // Width in meters
  depth?: number // Depth in meters
  levels?: number // Number of platform levels
  postDiameter?: number // Vertical post diameter
  beamWidth?: number // Horizontal beam width
  beamHeight?: number // Horizontal beam height
  color?: string // Hex color
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

interface SinglePoleProps {
  height?: number // Total height in meters
  diameter?: number // Pole diameter
  color?: string // Hex color
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

interface UnitBeamProps {
  length?: number // Beam length in meters
  width?: number // Beam width
  height?: number // Beam height
  color?: string // Hex color
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

/**
 * Creates a parametric 3D scaffolding structure with:
 * - Vertical posts at corners
 * - Horizontal beams connecting posts
 * - Diagonal braces for stability
 * - Platform decking at each level
 */
export function createScaffoldingGeometry(props: ScaffoldingProps): THREE.BufferGeometry {
  const {
    height = 10,
    width = 3,
    depth = 2,
    levels = 4,
    postDiameter = 0.1,
    beamWidth = 0.08,
    beamHeight = 0.08,
  } = props

  const geometries: THREE.BufferGeometry[] = []
  const postRadius = postDiameter / 2
  const levelHeight = height / (levels - 1)

  // Create vertical posts at corners
  const corners = [
    [-width / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2],
    [width / 2, 0, depth / 2],
    [-width / 2, 0, depth / 2],
  ]

  // Vertical posts
  for (const corner of corners) {
    const postGeom = new THREE.CylinderGeometry(postRadius, postRadius, height, 8)
    postGeom.translate(corner[0], height / 2, corner[2])
    geometries.push(postGeom)
  }

  // Horizontal beams and platforms at each level
  for (let level = 0; level < levels; level++) {
    const y = level * levelHeight

    // Beams along width (X direction)
    for (let z of [-depth / 2, depth / 2]) {
      const beamGeom = new THREE.BoxGeometry(width, beamHeight, beamWidth)
      beamGeom.translate(0, y, z)
      geometries.push(beamGeom)
    }

    // Beams along depth (Z direction)
    for (let x of [-width / 2, width / 2]) {
      const beamGeom = new THREE.BoxGeometry(beamWidth, beamHeight, depth)
      beamGeom.translate(x, y, 0)
      geometries.push(beamGeom)
    }

    // Platform decking (wooden planks)
    if (level < levels - 1) {
      const deckingThickness = 0.03
      const plankWidth = 0.25
      const plankSpacing = 0.05

      let z = -depth / 2 + plankWidth / 2
      while (z < depth / 2) {
        const deckGeom = new THREE.BoxGeometry(width - 0.1, deckingThickness, plankWidth)
        deckGeom.translate(0, y + beamHeight / 2 + deckingThickness / 2, z)
        geometries.push(deckGeom)
        z += plankWidth + plankSpacing
      }
    }

    // Diagonal braces (X-braces for stability)
    if (level < levels - 1) {
      const nextY = (level + 1) * levelHeight
      const braceRadius = postRadius * 0.6

      // Create diagonal braces connecting corners
      const diagonals = [
        // Front face diagonals
        { from: [-width / 2, y, -depth / 2], to: [width / 2, nextY, -depth / 2] },
        { from: [width / 2, y, -depth / 2], to: [-width / 2, nextY, -depth / 2] },
        // Back face diagonals
        { from: [-width / 2, y, depth / 2], to: [width / 2, nextY, depth / 2] },
        { from: [width / 2, y, depth / 2], to: [-width / 2, nextY, depth / 2] },
      ]

      for (const diagonal of diagonals) {
        const braceGeom = createBraceGeometry(
          diagonal.from as [number, number, number],
          diagonal.to as [number, number, number],
          braceRadius
        )
        geometries.push(braceGeom)
      }
    }
  }

  // Merge all geometries
  const mergedGeometry = mergeGeometries(geometries)
  return mergedGeometry || new THREE.BufferGeometry()
}

/**
 * Creates a cylindrical brace between two points
 */
function createBraceGeometry(
  from: [number, number, number],
  to: [number, number, number],
  radius: number
): THREE.BufferGeometry {
  const length = Math.hypot(
    to[0] - from[0],
    to[1] - from[1],
    to[2] - from[2]
  )

  const braceGeom = new THREE.CylinderGeometry(radius, radius, length, 6)

  // Position at midpoint
  const midpoint = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ]

  // Calculate rotation to point from 'from' to 'to'
  const direction = new THREE.Vector3(
    to[0] - from[0],
    to[1] - from[1],
    to[2] - from[2]
  ).normalize()

  const up = new THREE.Vector3(0, 1, 0)
  const axis = new THREE.Vector3().crossVectors(up, direction).normalize()
  const angle = Math.acos(up.dot(direction))

  if (axis.length() > 0.001) {
    const quaternion = new THREE.Quaternion()
    quaternion.setFromAxisAngle(axis, angle)
    braceGeom.applyQuaternion(quaternion)
  }

  braceGeom.translate(midpoint[0], midpoint[1], midpoint[2])
  return braceGeom
}

/**
 * Creates a single vertical pole (for cathead or standalone support)
 */
export function createSinglePoleGeometry(props: SinglePoleProps): THREE.BufferGeometry {
  const {
    height = 10,
    diameter = 0.1,
  } = props

  const radius = diameter / 2
  const poleGeom = new THREE.CylinderGeometry(radius, radius, height, 12)
  poleGeom.translate(0, height / 2, 0)

  return poleGeom
}

/**
 * Creates a unit beam (for cathead or structural support)
 */
export function createUnitBeamGeometry(props: UnitBeamProps): THREE.BufferGeometry {
  const {
    length = 3,
    width = 0.08,
    height = 0.08,
  } = props

  const beamGeom = new THREE.BoxGeometry(length, height, width)
  return beamGeom
}

/**
 * Merge multiple geometries into one
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null
  if (geometries.length === 1) return geometries[0]

  const merged = geometries[0].clone()
  for (let i = 1; i < geometries.length; i++) {
    const positions1 = merged.getAttribute('position')
    const positions2 = geometries[i].getAttribute('position')

    if (!positions1 || !positions2) continue

    const pos1Array = positions1.array as Float32Array
    const pos2Array = positions2.array as Float32Array

    const combined = new Float32Array(pos1Array.length + pos2Array.length)
    combined.set(pos1Array)
    combined.set(pos2Array, pos1Array.length)

    merged.setAttribute('position', new THREE.BufferAttribute(combined, 3))
  }

  merged.computeVertexNormals()
  return merged
}

/**
 * React component for rendering scaffolding in Three.js scene
 */
export function Scaffolding3D(props: ScaffoldingProps & { selected?: boolean }) {
  const geometry = useMemo(() => createScaffoldingGeometry(props), [props])

  const material = new THREE.MeshStandardMaterial({
    color: props.color || '#8b7355',
    metalness: 0.3,
    roughness: 0.7,
    emissive: props.selected ? '#ff6600' : '#000000',
  })

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={props.position || [0, 0, 0]}
      rotation={props.rotation || [0, 0, 0]}
      scale={props.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    />
  )
}

/**
 * React component for rendering a single pole in Three.js scene
 */
export function SinglePole3D(props: SinglePoleProps & { selected?: boolean }) {
  const geometry = useMemo(() => createSinglePoleGeometry(props), [props])

  const material = new THREE.MeshStandardMaterial({
    color: props.color || '#888888',
    metalness: 0.6,
    roughness: 0.4,
    emissive: props.selected ? '#ff6600' : '#000000',
  })

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={props.position || [0, 0, 0]}
      rotation={props.rotation || [0, 0, 0]}
      scale={props.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    />
  )
}

/**
 * React component for rendering a unit beam in Three.js scene
 */
export function UnitBeam3D(props: UnitBeamProps & { selected?: boolean }) {
  const geometry = useMemo(() => createUnitBeamGeometry(props), [props])

  const material = new THREE.MeshStandardMaterial({
    color: props.color || '#a0a0a0',
    metalness: 0.5,
    roughness: 0.5,
    emissive: props.selected ? '#ff6600' : '#000000',
  })

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={props.position || [0, 0, 0]}
      rotation={props.rotation || [0, 0, 0]}
      scale={props.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    />
  )
}

