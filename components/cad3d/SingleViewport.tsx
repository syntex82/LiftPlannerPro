"use client"

import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Grid, OrbitControls, GizmoHelper, GizmoViewcube, GizmoViewport, Stats } from "@react-three/drei"
import { Box, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import CameraController from "./CameraController"
import Modeler3D from "./Modeler3D"
import { useModelerStore } from "./modelerStore"

export default function SingleViewport() {
  // View state: 0=persp, 1=top, 2=front, 3=right, 4=back
  const [view, setView] = useState<0 | 1 | 2 | 3 | 4>(0)

  // Hotkeys for quick view switching
  // Remember last view (like pro CAD apps)
  useEffect(()=>{
    const key = 'cad3d:lastView'
    const saved = localStorage.getItem(key)
    if (saved) setView(parseInt(saved) as any)
    const unsub = () => localStorage.setItem(key, String(view))
    window.addEventListener('beforeunload', unsub)
    return () => window.removeEventListener('beforeunload', unsub)
  }, [])

  // Hotkeys for view switching
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as any)?.isContentEditable) return
      if (["0","1","2","3","4"].includes(e.key)) setView(parseInt(e.key) as any)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    const onOrbit = (e: Event) => {
      const enabled = (e as CustomEvent).detail?.enabled
      const ctrl = (window as any).__singleOrbit
      if (ctrl) ctrl.enabled = enabled !== false
    }
    window.addEventListener('cad3d:orbit', onOrbit as any)
    return () => window.removeEventListener('cad3d:orbit', onOrbit as any)
  }, [])

  // File events bridge
  useEffect(() => {
    const onFile = async (e: Event) => {
      const { action, format, file, data } = (e as CustomEvent).detail || {}
      if (action === 'new') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'reset' } }))
      } else if (action === 'open-data') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'load', data } }))
      } else if (action === 'save') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'save' } }))
      } else if (action === 'save-as') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'save-as' } }))
      } else if (action === 'import') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'import', file } }))
      } else if (action === 'export') {
        window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'export', format } }))
      }
    }
    window.addEventListener('cad3d:file', onFile as any)
    return () => window.removeEventListener('cad3d:file', onFile as any)
  }, [])

  return (
    <>

    <div className="w-full h-full relative pt-10">
      <Canvas shadows className="cad-drawing-active cad-precision-mode">
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

          <CameraController view={view} />

          {/* Ground/Reference grids per view */}
          {view === 0 && (
            <Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0, 0, 0]} />
          )}
          {view === 1 && (
            // Top (XZ at y=0)
            <Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" position={[0, 0, 0]} />
          )}
          {(view === 2 || view === 4) && (
            // Front/Back (XY at z=0)
            <Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0]} />
          )}
          {view === 3 && (
            // Right (YZ at x=0)
            <Grid args={[60, 60]} sectionColor="#334155" cellColor="#1f2937" rotation={[0, 0, Math.PI/2]} position={[0, 0, 0]} />
          )}

          {/* Modeling workspace */}
          <Modeler3D />

          {/* View cube (bottom-right) */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewcube color="#cbd5e1" hoverColor="#38bdf8" textColor="#0f172a" />
          </GizmoHelper>
          {/* Axis triad (bottom-left) */}
          <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
            <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} labelColor="#e5e7eb" />
          </GizmoHelper>

          <OrbitControls
            ref={(r:any)=>{ (window as any).__singleOrbit=r }}
            key={view}
            makeDefault
            enableDamping
            enablePan
            enableZoom
            enableRotate={view===0}
            dampingFactor={0.05}
            autoRotate={false}
            minDistance={0.1}
            maxDistance={1000}
            zoomSpeed={1.2}
            panSpeed={0.8}
            rotateSpeed={1}
          />
          <Stats className="pointer-events-none !top-auto !bottom-2 !left-auto !right-2 !z-10" />
        </Suspense>
      </Canvas>

      {/* Compact navigation bar (symbol-only), similar to CAD UI */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 z-40 flex flex-col gap-2" data-ui-layer>
        <button title="Perspective (0)" onClick={()=>setView(0)} className={`p-2 rounded bg-slate-900/80 border ${view===0?'border-blue-500 bg-blue-600/20':'border-slate-700 hover:border-slate-500'}`}>
          <Box className="w-4 h-4 text-slate-200" />
        </button>
        <button title="Top (1)" onClick={()=>setView(1)} className={`p-2 rounded bg-slate-900/80 border ${view===1?'border-blue-500 bg-blue-600/20':'border-slate-700 hover:border-slate-500'}`}>
          <ArrowUp className="w-4 h-4 text-slate-200" />
        </button>
        <button title="Front (2)" onClick={()=>setView(2)} className={`p-2 rounded bg-slate-900/80 border ${view===2?'border-blue-500 bg-blue-600/20':'border-slate-700 hover:border-slate-500'}`}>
          <ArrowDown className="w-4 h-4 text-slate-200" />
        </button>
        <button title="Right (3)" onClick={()=>setView(3)} className={`p-2 rounded bg-slate-900/80 border ${view===3?'border-blue-500 bg-blue-600/20':'border-slate-700 hover:border-slate-500'}`}>
          <ArrowRight className="w-4 h-4 text-slate-200" />
        </button>
        <button title="Back (4)" onClick={()=>setView(4)} className={`p-2 rounded bg-slate-900/80 border ${view===4?'border-blue-500 bg-blue-600/20':'border-slate-700 hover:border-slate-500'}`}>
          <ArrowLeft className="w-4 h-4 text-slate-200" />
        </button>
      </div>



      {/* Active view label */}
      <div className="absolute bottom-2 left-2 bg-slate-900/70 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs" data-ui-layer>
        {['Perspective','Top','Front','Right','Back'][view]}
      </div>
    </div>
    </>
  )
}
