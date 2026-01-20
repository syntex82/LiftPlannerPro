"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube, Stats, Html } from "@react-three/drei"
import { Suspense, useEffect, useState } from "react"
import Modeler3D from "./Modeler3D"
import CameraController from "./CameraController"
import QuadViewport from "./QuadViewport"

export default function View3D() {
  return (
    <div className="w-full h-full relative">
      <QuadViewport />
    </div>
  )
}

/* Legacy single-canvas kept for reference
export function LegacyView3D() {
  const [view, setView] = useState<0 | 1 | 2 | 3 | 4>(0)
  useEffect(() => { const onKey = (e: KeyboardEvent) => { const tag = (e.target as HTMLElement | null)?.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as any)?.isContentEditable) return; if (["0","1","2","3","4"].includes(e.key)) setView(parseInt(e.key) as any) }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [])
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <QuadViewport />
      </div>
      <div className="hidden">
        <Canvas shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
            <CameraController view={view} />
            {view === 0 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0, 0, 0]} />)}
            {view === 1 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0, 0, 0]} />)}
            {(view === 2 || view === 4) && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0]} />)}
            {view === 3 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[0, 0, Math.PI/2]} position={[0, 0, 0]} />)}
            <Modeler3D />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewcube color="#cbd5e1" hoverColor="#38bdf8" textColor="#0f172a" />
            </GizmoHelper>
            <OrbitControls key={view} makeDefault enableDamping enablePan enableZoom enableRotate={view===0} />
            <Stats />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
*/

