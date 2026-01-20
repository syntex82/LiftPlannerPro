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

      {/* Properties Panel - Fixed outside Canvas */}
      <PropertiesPanelOverlay />

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

// Properties Panel Component - Rendered outside Canvas
function PropertiesPanelOverlay() {
  const { objects, selectedId } = useModelerStore()
  const [showProps, setShowProps] = useState(true)

  const updateSelected = useCallback((patch: Partial<any>) => {
    if (!selectedId) return
    const { setObjects } = useModelerStore.getState()
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, ...patch } : o))
  }, [selectedId])

  const setNumeric = (key: keyof Pick<any, "position" | "rotation" | "scale">, idx: 0 | 1 | 2, v: string) => {
    const n = Number(v)
    if (Number.isNaN(n)) return
    const cur = objects.find(o => o.id === selectedId)
    if (!cur) return
    const arr = [...(cur[key] as number[])] as [number, number, number]
    arr[idx] = key === "rotation" ? THREE.MathUtils.degToRad(n) : n
    updateSelected({ [key]: arr } as any)
  }

  const setColor = (hex: string) => { updateSelected({ color: hex }) }

  if (!showProps || !selectedId) return null

  return (
    <div className="fixed top-32 right-80 bg-gray-900/95 border-2 border-blue-500/50 rounded-lg shadow-2xl p-4 text-gray-200 space-y-3 w-80 pointer-events-auto max-h-[calc(100vh-200px)] overflow-y-auto z-160" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="font-bold text-lg border-b border-blue-500/30 pb-2 mb-3 text-blue-300 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Properties
      </div>
      {selectedId ? (
        <>
          <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">ID: {selectedId}</div>
          <div className="grid grid-cols-4 gap-2 items-center">
            <label className="col-span-1 text-sm font-medium text-gray-300">Position</label>
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.position[0] ?? 0)} onChange={e=>setNumeric("position",0,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.position[1] ?? 0)} onChange={e=>setNumeric("position",1,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.position[2] ?? 0)} onChange={e=>setNumeric("position",2,e.target.value)} />

            <label className="col-span-1 text-sm font-medium text-gray-300">Rotation°</label>
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={THREE.MathUtils.radToDeg(objects.find(o=>o.id===selectedId)?.rotation[0] ?? 0)} onChange={e=>setNumeric("rotation",0,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={THREE.MathUtils.radToDeg(objects.find(o=>o.id===selectedId)?.rotation[1] ?? 0)} onChange={e=>setNumeric("rotation",1,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={THREE.MathUtils.radToDeg(objects.find(o=>o.id===selectedId)?.rotation[2] ?? 0)} onChange={e=>setNumeric("rotation",2,e.target.value)} />

            <label className="col-span-1 text-sm font-medium text-gray-300">Scale</label>
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.scale[0] ?? 1)} onChange={e=>setNumeric("scale",0,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.scale[1] ?? 1)} onChange={e=>setNumeric("scale",1,e.target.value)} />
            <input className="col-span-1 bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.scale[2] ?? 1)} onChange={e=>setNumeric("scale",2,e.target.value)} />
          </div>

          <div className="border-t border-gray-600 pt-3 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">Color</label>
              <input type="color" className="w-12 h-8 border border-gray-600 rounded cursor-pointer" value={objects.find(o=>o.id===selectedId)?.color ?? "#93c5fd"} onChange={(e)=>setColor(e.target.value)} />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">Visible</label>
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                checked={objects.find(o=>o.id===selectedId)?.visible !== false}
                onChange={(e) => updateSelected({ visible: e.target.checked })}
              />
            </div>

            {/* Scaffolding-specific properties */}
            {objects.find(o=>o.id===selectedId)?.type === 'scaffolding' && (
              <div className="border-t border-gray-600 pt-3 space-y-2">
                <div className="text-xs font-semibold text-blue-300 mb-2">Scaffolding Parameters</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Height (m)</label>
                    <input type="number" step="0.5" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.height ?? 10} onChange={(e)=>updateSelected({height: parseFloat(e.target.value) || 10})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Width (m)</label>
                    <input type="number" step="0.5" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.width ?? 3} onChange={(e)=>updateSelected({width: parseFloat(e.target.value) || 3})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Depth (m)</label>
                    <input type="number" step="0.5" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.depth ?? 2} onChange={(e)=>updateSelected({depth: parseFloat(e.target.value) || 2})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Levels</label>
                    <input type="number" step="1" min="2" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.levels ?? 4} onChange={(e)=>updateSelected({levels: Math.max(2, parseInt(e.target.value) || 4)})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Post Ø (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.postDiameter ?? 0.1} onChange={(e)=>updateSelected({postDiameter: parseFloat(e.target.value) || 0.1})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Beam H (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.beamHeight ?? 0.08} onChange={(e)=>updateSelected({beamHeight: parseFloat(e.target.value) || 0.08})} />
                  </div>
                </div>
              </div>
            )}

            {/* Single Pole-specific properties */}
            {objects.find(o=>o.id===selectedId)?.type === 'single-pole' && (
              <div className="border-t border-gray-600 pt-3 space-y-2">
                <div className="text-xs font-semibold text-blue-300 mb-2">Pole Parameters</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Height (m)</label>
                    <input type="number" step="0.5" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.height ?? 10} onChange={(e)=>updateSelected({height: parseFloat(e.target.value) || 10})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Diameter (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.diameter ?? 0.1} onChange={(e)=>updateSelected({diameter: parseFloat(e.target.value) || 0.1})} />
                  </div>
                </div>
              </div>
            )}

            {/* Unit Beam-specific properties */}
            {objects.find(o=>o.id===selectedId)?.type === 'unit-beam' && (
              <div className="border-t border-gray-600 pt-3 space-y-2">
                <div className="text-xs font-semibold text-blue-300 mb-2">Beam Parameters</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Length (m)</label>
                    <input type="number" step="0.5" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.length ?? 3} onChange={(e)=>updateSelected({length: parseFloat(e.target.value) || 3})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Width (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.width ?? 0.08} onChange={(e)=>updateSelected({width: parseFloat(e.target.value) || 0.08})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.height ?? 0.08} onChange={(e)=>updateSelected({height: parseFloat(e.target.value) || 0.08})} />
                  </div>
                </div>
              </div>
            )}

            {/* Window-specific properties */}
            {objects.find(o=>o.id===selectedId)?.type === 'window' && (
              <div className="border-t border-gray-600 pt-3 space-y-2">
                <div className="text-xs font-semibold text-blue-300 mb-2">Window Parameters</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Type</label>
                    <select className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.windowKind ?? 'rect'} onChange={(e)=>updateSelected({windowKind: e.target.value})}>
                      <option value="rect">Rectangular</option>
                      <option value="windshield">Windshield</option>
                      <option value="side">Side</option>
                      <option value="rear">Rear</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Width (m)</label>
                    <input type="number" step="0.1" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.paneSize as any)?.[0] ?? 1.2} onChange={(e)=>{const ps = (objects.find(o=>o.id===selectedId)?.paneSize as any) ?? [1.2, 0.8, 0.02]; updateSelected({paneSize: [parseFloat(e.target.value) || 1.2, ps[1], ps[2]]})}} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (m)</label>
                    <input type="number" step="0.1" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.paneSize as any)?.[1] ?? 0.8} onChange={(e)=>{const ps = (objects.find(o=>o.id===selectedId)?.paneSize as any) ?? [1.2, 0.8, 0.02]; updateSelected({paneSize: [ps[0], parseFloat(e.target.value) || 0.8, ps[2]]})}} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Thickness (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={(objects.find(o=>o.id===selectedId)?.paneSize as any)?.[2] ?? 0.02} onChange={(e)=>{const ps = (objects.find(o=>o.id===selectedId)?.paneSize as any) ?? [1.2, 0.8, 0.02]; updateSelected({paneSize: [ps[0], ps[1], parseFloat(e.target.value) || 0.02]})}} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Frame (m)</label>
                    <input type="number" step="0.01" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.frame ?? 0.05} onChange={(e)=>updateSelected({frame: parseFloat(e.target.value) || 0.05})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Curvature (m)</label>
                    <input type="number" step="0.1" className="w-full bg-gray-700 border border-gray-600 px-2 py-1 rounded text-sm text-gray-200" value={objects.find(o=>o.id===selectedId)?.curvature ?? 0} onChange={(e)=>updateSelected({curvature: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-400 text-center py-4">Select an object to view properties</div>
      )}
    </div>
  )
}

