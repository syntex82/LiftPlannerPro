"use client"

import * as THREE from "three"
import { useEffect, useMemo, useRef } from "react"
import { PerspectiveCamera, OrthographicCamera } from "@react-three/drei"

export default function CameraController({ view }: { view: 0|1|2|3|4 }) {
  const ref = useRef<THREE.Camera>(null)

  const cfg = useMemo(() => {
    if (view === 0) {
      return { type: "persp" as const, pos: new THREE.Vector3(12, 8, 12), up: new THREE.Vector3(0, 1, 0) }
    }
    // Ortho views
    if (view === 1) return { type: "ortho" as const, pos: new THREE.Vector3(0, 30, 0), up: new THREE.Vector3(0, 0, -1) } // Top
    if (view === 2) return { type: "ortho" as const, pos: new THREE.Vector3(0, 0, 30), up: new THREE.Vector3(0, 1, 0) } // Front
    if (view === 3) return { type: "ortho" as const, pos: new THREE.Vector3(30, 0, 0), up: new THREE.Vector3(0, 1, 0) } // Right
    return { type: "ortho" as const, pos: new THREE.Vector3(0, 0, -30), up: new THREE.Vector3(0, 1, 0) } // Back
  }, [view])

  useEffect(() => {
    if (!ref.current) return
    ref.current.up.copy(cfg.up)
    ref.current.position.copy(cfg.pos)
    ;(ref.current as any).lookAt(0, 0, 0)
    ;(ref.current as any).updateProjectionMatrix?.()
    // Keep OrbitControls target centered at origin
    // @ts-ignore
    const controls = (window as any).__r3f?.roots?.[0]?.store.getState().controls
    if (controls) {
      try { controls.target.set(0,0,0); controls.update?.() } catch {}
    }
  }, [cfg])

  if (cfg.type === "persp") {
    return (
      <PerspectiveCamera ref={ref as any} makeDefault fov={50} near={0.1} far={1000} position={[cfg.pos.x, cfg.pos.y, cfg.pos.z]} />
    )
  }
  return (
    <OrthographicCamera
      ref={ref as any}
      makeDefault
      near={0.1}
      far={2000}
      zoom={60}
      position={[cfg.pos.x, cfg.pos.y, cfg.pos.z]}
    />
  )
}

