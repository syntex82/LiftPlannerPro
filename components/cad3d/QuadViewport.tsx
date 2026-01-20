"use client"

import { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Grid, OrbitControls, Stats, GizmoHelper, GizmoViewport } from "@react-three/drei"
import CameraController from "./CameraController"
import Modeler3D from "./Modeler3D"

export type ViewId = 0|1|2|3|4 // 0=persp, 1=top, 2=front, 3=right, 4=back

const ViewName = ['Perspective','Top','Front','Right','Back']

function ViewPane({ view }: { view: ViewId }) {
  return (
    <div className="relative w-full h-full">
      <Canvas shadows className="cad-drawing-active cad-precision-mode">
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

          <CameraController view={view} />

          {/* Axis triad */}
          <GizmoHelper alignment="bottom-left" margin={[60,60]}>
            <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} labelColor="#e5e7eb" />
          </GizmoHelper>

          {/* Grids per view */}
          {view === 0 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0,0,0]} />)}
          {view === 1 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0,0,0]} />)}
          {(view === 2 || view === 4) && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[Math.PI/2,0,0]} position={[0,0,0]} />)}
          {view === 3 && (<Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[0,0,Math.PI/2]} position={[0,0,0]} />)}

          <OrbitControls makeDefault enableDamping enablePan enableZoom enableRotate={view===0} />
          <Modeler3D />
          <Stats />
        </Suspense>
      </Canvas>
      <div className="absolute top-1 left-1 bg-slate-900/70 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]">
        {ViewName[view]}
      </div>
    </div>
  )
}

export default function QuadViewport() {
  const [mode, setMode] = useState<'single'|'quad'>('quad')

  // hotkey: Q toggles single/quad
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as any)?.isContentEditable) return
      if (e.key.toLowerCase() === 'q') setMode(m => m==='quad' ? 'single' : 'quad')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (mode === 'single') {
    return (
      <div className="w-full h-full">
        <ViewPane view={0} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      <div className="border border-slate-700/60"><ViewPane view={1} /></div>
      <div className="border border-slate-700/60"><ViewPane view={2} /></div>
      <div className="border border-slate-700/60"><ViewPane view={3} /></div>
      <div className="border border-slate-700/60"><ViewPane view={0} /></div>
      <div className="absolute top-2 left-2 z-50 bg-slate-900/80 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs" data-ui-layer>
        Press Q to toggle Single/Quad
      </div>
    </div>
  )
}

