"use client"

import * as THREE from "three"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TransformControls, Html, useGLTF } from "@react-three/drei"
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { useModelerStore, ModelerObject } from "./modelerStore"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js"
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js"
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js"
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { Brush, Evaluator, ADDITION, SUBTRACTION, INTERSECTION } from 'three-bvh-csg'
import { useThree } from "@react-three/fiber"
import Crane3D from "./Crane3D"
import RealisticCrane3D from "./RealisticCrane3D"
import LTM1055Crane3D from "./LTM1055Crane3D"
import { SaveToLibraryDialog } from "./SaveToLibraryDialog"
import { LoadFromLibraryDialog } from "./LoadFromLibraryDialog"

import { LTM1300_AXLE_POS_MM } from "@/lib/ltm1300"
import { LTM_1055_3D_SPEC, LTM_1300_3D_SPEC, getCrane3DById } from "@/lib/crane-3d-models"
import { createBoom, createJib, createTrolley, createHoist, createCounterweight, createOutrigger, createHook, createSling, createLoad, createCab, createChassis } from "@/lib/crane-modeling-tools"
import { createRealisticWheel, createDINHook, createWireRope, createHoistDrum, createBoomHead } from "@/lib/professional-cad-tools"


// Approximate DIN hook dimension tables (mm) -> converted to meters when used
const DIN_HOOK_TABLE: Record<'DIN 15401' | 'DIN 15402', Record<25|50|100|150|200, { opening:number; throat:number; thickness:number; shank:number; height:number }>> = {
  'DIN 15401': {
    25: { opening:110, throat:120, thickness:45,  shank:60,  height:360 },
    50: { opening:140, throat:160, thickness:60,  shank:80,  height:470 },
    100:{ opening:190, throat:220, thickness:80,  shank:110, height:620 },
    150:{ opening:230, throat:260, thickness:95,  shank:130, height:740 },
    200:{ opening:260, throat:300, thickness:110, shank:150, height:840 },
  },
  'DIN 15402': {
    25: { opening:120, throat:130, thickness:48,  shank:65,  height:380 },
    50: { opening:150, throat:175, thickness:64,  shank:85,  height:500 },
    100:{ opening:200, throat:235, thickness:86,  shank:115, height:660 },
    150:{ opening:245, throat:280, thickness:100, shank:135, height:790 },
    200:{ opening:275, throat:320, thickness:115, shank:160, height:900 },
  }
}

function getDINHookDims(standard: 'DIN 15401' | 'DIN 15402', capacity: 25|50|100|150|200) {
  const mm = DIN_HOOK_TABLE[standard][capacity]
  // Convert mm -> meters
  return {
    opening: mm.opening/1000,
    throat: mm.throat/1000,
    thickness: mm.thickness/1000,
    shank: mm.shank/1000,
    height: mm.height/1000,
  }
}

export default function Modeler3D({ showGizmo = true }: { showGizmo?: boolean }) {
  const { objects, setObjects, selectedId, setSelectedId, selectedIds, setSelectedIds, mode, setMode, snap, setSnap, wireframe, setWireframe, selectLevel, setSelectLevel, selectedFace, setSelectedFace, selectedVertex, setSelectedVertex, selectedEdge, setSelectedEdge, layers, currentLayer } = useModelerStore()
  const [showConsole, setShowConsole] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const consoleRef = useRef<HTMLDivElement | null>(null)

  const log = useCallback((...msgs: any[]) => {
    const ts = new Date().toLocaleTimeString()
    const line = `[${ts}] ${msgs.map(m => (typeof m === 'string' ? m : JSON.stringify(m))).join(' ')}`
    setLogs(prev => [...prev.slice(-199), line])
  }, [])

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const [showProps, setShowProps] = useState(true)
  const [saveToLibraryOpen, setSaveToLibraryOpen] = useState(false)
  const [loadFromLibraryOpen, setLoadFromLibraryOpen] = useState(false)

  // Refs mapping id -> Object3D for TransformControls targeting
  const [showOutliner, setShowOutliner] = useState(true)
  const [gizmoRefresh, setGizmoRefresh] = useState(0)
  const [draggingGizmo, setDraggingGizmo] = useState(false)

  const draggingGizmoRef = useRef(false)
  useEffect(() => { draggingGizmoRef.current = draggingGizmo }, [draggingGizmo])
  // Tab and export state
  const [activeTab, setActiveTab] = useState<'file' | 'modeling'>('modeling')
  const [exportFormat, setExportFormat] = useState('glb')
  const [exportOptions, setExportOptions] = useState({
    includeTextures: true,
    includeMaterials: true,
    enableCompression: true,
    embedTextures: true
  })

  const objRefs = useRef<Record<string, THREE.Object3D | null>>({})
  const selectedRef = useRef<THREE.Object3D | null>(null)
  const rootRef = useRef<THREE.Group | null>(null)
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map())
  // Helpers for sub-object editing
  const vertexHelper = useRef<THREE.Object3D | null>(null)
  const edgeHelper = useRef<THREE.Object3D | null>(null)

  // Extrude selected face for boxes (declare before effects)
  // Face tool drag state
  const faceDrag = useRef<{ dragging: boolean; lastX: number }>({ dragging: false, lastX: 0 })

  // Sketch drawing state (simple initial implementation)
  const [drawTool, setDrawTool] = useState<null | 'line' | 'rect' | 'polyline'>(null)

  const [drawPoints, setDrawPoints] = useState<Array<[number, number, number]>>([])
  const [drawThickness, setDrawThickness] = useState<number>(0.02) // meters radius
  const [drawStyle, setDrawStyle] = useState<'line'|'rope'>('line')
  const [cursorPosition, setCursorPosition] = useState<[number, number, number] | null>(null)
  const [showCrosshair, setShowCrosshair] = useState(false)
  const [precisionMode, setPrecisionMode] = useState(true) // High precision like 2D CAD
  const [snapTolerance, setSnapTolerance] = useState(0.1) // Snap tolerance in meters
  const [isDrawing, setIsDrawing] = useState(false) // Track if currently drawing
  const [currentLine, setCurrentLine] = useState<[number, number, number][] | null>(null) // Current line being drawn

  // Safe cursor position access
  const safeCursorPosition = cursorPosition && cursorPosition.length >= 3 ? cursorPosition : [0, 0, 0] as [number, number, number]

  const startDrawing = useCallback((tool: any) => {
    const t = (typeof tool === 'string' ? tool : (tool?.tool || tool)) as any
    console.log('startDrawing called with:', tool, 'parsed as:', t)
    console.log('Current drawTool before setState:', drawTool)
    console.log('Setting drawTool to:', t)
    setDrawTool(t)
    setDrawPoints([])
    console.log('setDrawTool called - state update queued')
    // Force immediate re-render check
    setTimeout(() => {
      console.log('Checking drawTool state after timeout:', drawTool)
    }, 100)
  }, [drawTool])
  const finishDrawing = useCallback(() => {
    setDrawTool(null)
    setDrawPoints([])
  }, [])

  const extrudeSelectedFace = useCallback((distance: number) => {
    if (!selectedFace) return
    const { objectId, faceIndex } = selectedFace
    const o = objects.find(x => x.id === objectId)
    if (!o || o.type !== 'box') return
    const size = o.size ?? [1,1,1]
    const axisMap = [0,0,1,1,2,2] as const
    const dirMap = [1,-1,1,-1,1,-1] as const
    const face = Math.floor(faceIndex / 2)
    const axis = axisMap[face]



    const dir = dirMap[face]
    const newLen = Math.max(0.01, size[axis] + distance)
    const effectiveD = (newLen - size[axis])
    const newSize: [number,number,number] = [...size] as any
    newSize[axis] = newLen
    const localOffset = new THREE.Vector3(0,0,0)
    if (axis === 0) localOffset.set((effectiveD/2) * dir * (o.scale?.[0] ?? 1), 0, 0)
    if (axis === 1) localOffset.set(0, (effectiveD/2) * dir * (o.scale?.[1] ?? 1), 0)
    if (axis === 2) localOffset.set(0, 0, (effectiveD/2) * dir * (o.scale?.[2] ?? 1))
    const euler = new THREE.Euler(o.rotation[0], o.rotation[1], o.rotation[2])
    localOffset.applyEuler(euler)
    const newPos: [number,number,number] = [o.position[0]+localOffset.x, o.position[1]+localOffset.y, o.position[2]+localOffset.z]
    setObjects(prev => prev.map(x => x.id === objectId ? { ...x, size: newSize, position: newPos } : x))
  }, [objects, selectedFace, setObjects])


  // Keyboard shortcuts
  // File operations bridge
  useEffect(() => {
    const onModeler = async (e: Event) => {
      const { action, format, file, data, tool, preset } = (e as CustomEvent).detail || {}
      console.log('onModeler event received:', action)
      if (action === 'reset') {
        setObjects(() => []); setSelectedId(null); setSelectedIds([])
      } else if (action === 'load') {
        if (data && data.objects) {
          setObjects(() => data.objects); setSelectedId(null); setSelectedIds([])
        } else {
          alert('Invalid project file')
        }
      } else if (action === 'save' || action === 'save-as') {
        // Fallback download if menu can't use FS Access
        const project = { objects }
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `project-${Date.now()}.cad3d.json`
        a.click()
      } else if (action === 'get-project') {
        const requestId = (e as any).detail?.requestId
        const project = { objects }
        window.dispatchEvent(new CustomEvent('cad3d:file', { detail: { action: 'project-data', requestId, data: project } }))
      } else if (action === 'import') {
        if (file) importGLTF(file)
      } else if (action === 'export') {
        switch (format) {
          case 'glb': exportGLB(); break
          case 'gltf': exportGLTF(); break
          case 'obj': exportOBJ(); break
          case 'stl': exportSTL(); break
          case 'ply': exportPLY(); break
        }
      } else if (action === 'save-to-library') {
        console.log('Opening save to library dialog')
        setSaveToLibraryOpen(true)
      } else if (action === 'load-from-library') {
        console.log('Opening load from library dialog')
        setLoadFromLibraryOpen(true)
      } else if (action === 'draw-style') {
        const s = (data === 'rope') ? 'rope' : 'line'
        setDrawStyle(s)
      } else if (action === 'draw-thickness') {
        const t = Number(data)
        if (!isNaN(t) && t > 0) setDrawThickness(t)
      } else if (action === 'mode') {
        if (['select','translate','rotate','scale'].includes(data)) setMode(data)
      } else if (action === 'insert-box') {
        addBox()
      } else if (action === 'insert-cylinder') {
        addCylinder()
      } else if (action === 'insert-pipe') {
        addPipe()
      } else if (action === 'insert-ibeam') {
        addIBeam()
      } else if (action === 'insert-hbeam') {
        addHBeam()
      } else if (action === 'insert-cchannel') {
        addCChannel()
      } else if (action === 'insert-tank') {
        addTank()
      } else if (action === 'insert-vessel') {
        addVessel()
      } else if (action === 'insert-column') {
        addColumn()
      } else if (action === 'insert-crane') {
        addCrane()
      } else if (action === 'insert-ltm1055') {
        addLTM1055Crane()
      } else if (action === 'insert-ltm1300') {
        addLTM1300Crane()
      } else if (action === 'insert-exchanger') {
        addExchanger()
      } else if (action === 'toggle-props') {
        setShowProps(s => !s)
      } else if (action === 'toggle-console') {
        setShowConsole(s => !s)
      } else if (action === 'toggle-wireframe') {
        setWireframe(w => !w)
      } else if (action === 'toggle-snap') {
        setSnap(s => !s)
      } else if (action === 'toggle-precision') {
        setPrecisionMode(p => !p)
        log('Precision mode:', !precisionMode ? '0.1m' : '1.0m')
      } else if (action === 'duplicate') {
        duplicateSelected()
      } else if (action === 'delete') {
        deleteSelected()
      } else if (action === 'toggle-lock') {
        // Toggle lock on selected ids
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (!ids.length) return
        setObjects(prev => prev.map(o => ids.includes(o.id) ? { ...o, locked: !o.locked } : o))
      } else if (action === 'toggle-visibility') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (!ids.length) return
        setObjects(prev => prev.map(o => ids.includes(o.id) ? { ...o, visible: o.visible===false ? true : false } : o))
      } else if (action === 'select-level') {
        if (data === 'object' || data === 'face' || data === 'edge' || data === 'vertex') setSelectLevel(data)
      } else if (action === 'extrude') {
        if (selectedFace) {
          extrudeSelectedFace(Number(data) || 0)
        } else {
          // Extrude a selected sketch-face into a box
          const sid = selectedId
          if (!sid) return
          const o = objects.find(x=>x.id===sid) as any
          if (o && o.type === 'sketch-face') {
            const [w,d] = (o.faceSize ?? [1,1]) as [number,number]
            const h = Math.max(0.01, Number(data) || 1)
            const id = `box-${cryptoRandom()}`
            setObjects(prev => prev.map(x => x.id===sid ? ({
              id,
              type:'box',
              name: o.name || 'Extruded Solid',
              position: [o.position[0], o.position[1] + h/2, o.position[2]],
              rotation: [0,0,0],
              scale: [1,1,1],
              size: [w, h, d],
              color: '#93c5fd',
              layer: o.layer,
            } as any) : x))
          }
        }
      } else if (action === 'array') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (!ids.length) return
        const cfg = (data || {}) as any
        const type = cfg.type || 'linear'
        if (type === 'linear') {
          const count = Math.max(2, Number(cfg.count) || 2)
          const off = cfg.offset as [number,number,number] || [1,0,0]
          const clones: any[] = []
          ids.forEach(id => {
            const base = objects.find(o=>o.id===id)
            if (!base) return
            for (let i=1;i<count;i++) {
              const nid = `${base.type}-${cryptoRandom()}`
              clones.push({ ...base, id: nid, position: [base.position[0]+off[0]*i, base.position[1]+off[1]*i, base.position[2]+off[2]*i] })
            }
          })
          if (clones.length) setObjects(prev => [...prev, ...clones])
        } else if (type === 'radial') {
          const count = Math.max(3, Number(cfg.count) || 6)
          const radius = Math.max(0.01, Number(cfg.radius) || 5)
          const axis = (cfg.axis || 'y') as 'x'|'y'|'z'
          const angleStep = (2*Math.PI)/count
          const clones: any[] = []
          ids.forEach(id => {
            const base = objects.find(o=>o.id===id)
            if (!base) return
            for (let i=1;i<count;i++) {
              const a = angleStep*i
              let pos: [number,number,number] = [base.position[0], base.position[1], base.position[2]]
              if (axis==='y') pos = [base.position[0] + Math.cos(a)*radius, base.position[1], base.position[2] + Math.sin(a)*radius]
              if (axis==='x') pos = [base.position[0], base.position[1] + Math.cos(a)*radius, base.position[2] + Math.sin(a)*radius]
              if (axis==='z') pos = [base.position[0] + Math.cos(a)*radius, base.position[1] + Math.sin(a)*radius, base.position[2]]
              const nid = `${base.type}-${cryptoRandom()}`
              clones.push({ ...base, id: nid, position: pos })
            }
          })
          if (clones.length) setObjects(prev => [...prev, ...clones])
        }
      } else if (action === 'tool') {
        const v = (data || tool) as string
        // Switch between object tools and drawing tools
        if (v === 'select' || v === 'move' || v === 'rotate' || v === 'scale') {
          // Leave any drawing mode
          setDrawTool(null)
          if (v === 'select') setMode('select')
          if (v === 'move') setMode('translate')
          if (v === 'rotate') setMode('rotate')
          if (v === 'scale') setMode('scale')
        } else if (v === 'line' || v === 'rect' || v === 'polyline' || v === 'circle') {
          // Enter drawing mode for 2D sketches on ground
          setDrawTool(v as any)
          setDrawPoints([])
        }

      } else if (action === 'mirror') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (!ids.length) return
        const plane = (data?.plane || 'yz') as 'yz'|'xz'|'xy'
        const clones: any[] = []
        ids.forEach(id => {
          const base = objects.find(o=>o.id===id)
          if (!base) return
          const nid = `${base.type}-${cryptoRandom()}`
          const pos: [number,number,number] = [...base.position] as any
          const rot: [number,number,number] = [...base.rotation] as any
          if (plane==='yz') { pos[0] = -pos[0]; rot[1] = -rot[1] }
          if (plane==='xz') { pos[1] = -pos[1]; rot[0] = -rot[0] }
          if (plane==='xy') { pos[2] = -pos[2]; rot[2] = -rot[2] }
          clones.push({ ...base, id: nid, position: pos, rotation: rot })
        })
        if (clones.length) setObjects(prev => [...prev, ...clones])
      } else if (action === 'group') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (ids.length < 2) return
        const gid = `grp-${cryptoRandom()}`
        setObjects(prev => prev.map(o => ids.includes(o.id) ? { ...o, groupId: gid } as any : o))
      } else if (action === 'ungroup') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (!ids.length) return
        setObjects(prev => prev.map(o => ids.includes(o.id) ? ({ ...o, groupId: undefined } as any) : o))
      } else if (action === 'draw-start') {
        // Handle presets
        if (preset === 'wire-rope') {
          setDrawStyle('rope')
          setDrawThickness(0.016) // 16mm wire rope
        } else if (preset === 'sling') {
          setDrawStyle('rope')
          setDrawThickness(0.025) // 25mm sling
        }
        setDrawTool(tool)
        setDrawPoints([])
      } else if (action === 'add-crane-part') {
        addCranePart(data)
      } else if (action === 'add-boom') {
        addBoom(data?.length ?? 30, data?.angle ?? 45)
      } else if (action === 'add-jib') {
        addJib(data?.length ?? 10, data?.angle ?? 0)
      } else if (action === 'add-trolley') {
        addTrolleyComponent(data?.capacity ?? 50)
      } else if (action === 'add-hoist') {
        addHoistComponent(data?.capacity ?? 50, data?.ropeCount ?? 4)
      } else if (action === 'add-counterweight') {
        addCounterweightComponent(data?.mass ?? 100)
      } else if (action === 'add-outrigger') {
        addOutriggerComponent(data?.extension ?? 5, data?.count ?? 4)
      } else if (action === 'add-hook') {
        addHookComponent(data?.size ?? 1, data?.sheaveCount ?? 4)
      } else if (action === 'add-load') {
        addLoadComponent(data?.mass ?? 50, data?.dimensions ?? [2, 2, 2])
      } else if (action === 'add-building') {
        addBuilding(data)
      } else if (action === 'add-structure') {
        addStructure(data)
      } else if (action === 'add-primitive') {
        switch (data) {
          case 'box': addBox(); break
          case 'sphere': addSphere(); break
          case 'cylinder': addCylinder(); break
          case 'tube': addTube(); break
          case 'hbeam': addHBeam(); break
          case 'ibeam': addIBeam(); break
          case 'cchannel': addCChannel(); break
          case 'pipe': addPipe(); break
          case 'tank': addTank(); break
          case 'vessel': addVessel(); break
          default: console.warn('Unknown primitive:', data)
        }
      } else if (action === 'add-scaffolding') {
        addScaffolding(data?.height ?? 10, data?.width ?? 3, data?.depth ?? 2, data?.levels ?? 4)
      } else if (action === 'add-single-pole') {
        addSinglePole(data?.height ?? 10, data?.diameter ?? 0.1)
      } else if (action === 'add-unit-beam') {
        addUnitBeam(data?.length ?? 3, data?.width ?? 0.08, data?.height ?? 0.08)
      } else if (action === 'add-window') {
        // Insert a window object with default rectangular pane; user can adjust kind/size
        const id = `window-${cryptoRandom()}`
        setObjects(prev => ([...prev, {
          id, type:'window', name:'Cab Window', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
          color:'#87CEEB', windowKind:'rect', paneSize:[1.2,0.8,0.02], curvature: 0.0, frame: 0.05, mullions: [0,0], layer:'cab'
        } as any]))
        setSelectedId(id)
        log('addWindow', { id })
      } else if (action === 'add-hook-block') {
        // Insert a realistic hook block assembly placeholder; parameters drive detail
        const id = `hook-${cryptoRandom()}`
        setObjects(prev => ([...prev, {
          id, type:'hook-block', name:'Hook Block', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
          sheaveCount: 3, sheaveDiameter: 0.5, blockWidth: 0.42, ropeDiameter: 0.032, hookSize: 0.55,
          hookStandard: 'custom', hookCapacity: 50, hookLatch: true,
          color:'#708090', layer:'rigging'
        } as any]))
        setSelectedId(id)
        log('addHookBlock', { id })

      } else if (action === 'add-professional') {
        // Professional precision tools for realistic modeling
        const toolType = data as string
        if (toolType === 'wheel') {
          const id = `wheel-${cryptoRandom()}`
          const geom = createRealisticWheel(1.2, 0.4, 0.02, 'spoked')
          setObjects(prev => ([...prev, {
            id, type:'gltf', name:'Realistic Wheel', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
            color:'#2c2c2c', __geom: geom
          } as any]))
          setSelectedId(id)
          log('addProfessional', { type: 'wheel', id })
        } else if (toolType === 'hook') {
          const id = `hook-din-${cryptoRandom()}`
          const geom = createDINHook(100, 'DIN 15401')
          setObjects(prev => ([...prev, {
            id, type:'gltf', name:'DIN Hook (100t)', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
            color:'#8B4513', __geom: geom
          } as any]))
          setSelectedId(id)
          log('addProfessional', { type: 'hook', id })
        } else if (toolType === 'rope') {
          const id = `rope-${cryptoRandom()}`
          const geom = createWireRope(5, 0.016, 100, 0.3)
          setObjects(prev => ([...prev, {
            id, type:'gltf', name:'Wire Rope (5m)', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
            color:'#A9A9A9', __geom: geom
          } as any]))
          setSelectedId(id)
          log('addProfessional', { type: 'rope', id })
        } else if (toolType === 'drum') {
          const id = `drum-${cryptoRandom()}`
          const geom = createHoistDrum(0.8, 0.6, 4, 0.016)
          setObjects(prev => ([...prev, {
            id, type:'gltf', name:'Hoist Drum', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
            color:'#696969', __geom: geom
          } as any]))
          setSelectedId(id)
          log('addProfessional', { type: 'drum', id })
        } else if (toolType === 'boom-head') {
          const id = `boom-head-${cryptoRandom()}`
          const geom = createBoomHead('clevis', 0.05)
          setObjects(prev => ([...prev, {
            id, type:'gltf', name:'Boom Head', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1],
            color:'#555555', __geom: geom
          } as any]))
          setSelectedId(id)
          log('addProfessional', { type: 'boom-head', id })
        }

      } else if (action === 'revolve') {
        // Prototype: revolve a sketch-line or sketch-face around Y axis to create a lathe-like solid
        const sid = selectedId
        if (!sid) { alert('Select a sketch first'); return }
        const o = objects.find(x=>x.id===sid) as any
        if (!o || (o.type !== 'sketch-line' && o.type !== 'sketch-face')) { alert('Select a sketch-line or sketch-face'); return }
        // If face: use its width as radius profile; If line: use its point distances from Y axis
        let profile: number[] = []
        if (o.type === 'sketch-line') {
          const pts = (o.points ?? []) as [number,number,number][]
          if (pts.length < 2) { alert('Sketch line needs 2+ points'); return }
          profile = pts.map(p => Math.hypot(p[0], p[2]))
        } else {
          const [w] = (o.faceSize ?? [1,1]) as [number,number]
          profile = [0, w/2, w/2, 0]
        }
        const height = (o.type === 'sketch-face') ? (o.faceSize?.[1] ?? 1) : Math.max(1, profile.length)
        const radialSegments = 24
        const geom = new THREE.LatheGeometry(profile.map((r,i)=> new THREE.Vector2(r, (i/profile.length)*height)), radialSegments)
        const id = `lathe-${cryptoRandom()}`
        setObjects(prev => ([...prev, { id, type:'gltf', name:'Revolve', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], __geom: geom } as any]))
      } else if (action === 'sweep') {
        // Prototype: sweep a circular profile along a selected sketch-line path, output as tube segments
        const sid = selectedId
        if (!sid) { alert('Select a sketch-line path'); return }
        const o = objects.find(x=>x.id===sid) as any
        if (!o || o.type !== 'sketch-line') { alert('Select a sketch-line'); return }
        const pts = (o.points ?? []) as [number,number,number][]
        if (pts.length < 2) { alert('Path requires 2+ points'); return }
        const radius = 0.15
        const segments: THREE.BufferGeometry[] = []
        for (let i=0;i<pts.length-1;i++) {
          const a = pts[i], b = pts[i+1]
          const dir = new THREE.Vector3(b[0]-a[0], b[1]-a[1], b[2]-a[2])
          const len = Math.max(0.01, dir.length())
          dir.normalize()
          const g = new THREE.CylinderGeometry(radius, radius, len, 16)

          const m = new THREE.Matrix4()
          // orient cylinder from a to b
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir)
          m.makeRotationFromQuaternion(quat)
          g.applyMatrix4(m)
          g.translate((a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2)
          segments.push(g)
        }
        const merged = mergeGeometries(segments)
        const id = `sweep-${cryptoRandom()}`
        setObjects(prev => ([...prev, { id, type:'gltf', name:'Sweep', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], __geom: merged } as any]))
      } else if (action === 'boolean' || action === 'boolean-preview' || action === 'boolean-apply') {
        const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
        if (action !== 'boolean-apply' && ids.length !== 2) { alert('Select exactly 2 objects for boolean ops'); return }
        const [aId, bId] = ids
        const a = objects.find(o=>o.id===aId)
        const b = objects.find(o=>o.id===bId)
        const toBrush = (o: any) => {
          const bake = (g: THREE.BufferGeometry) => {
            const mesh = new THREE.Mesh(g)
            mesh.position.set(o.position[0], o.position[1], o.position[2])
            mesh.rotation.set(o.rotation[0], o.rotation[1], o.rotation[2])
            mesh.scale.set(o.scale[0], o.scale[1], o.scale[2])
            mesh.updateMatrixWorld(true)
            const brush = new Brush(g)
            brush.applyMatrix4(mesh.matrixWorld)
            return brush
          }
          if (o.type === 'box') { const [sx, sy, sz] = o.size ?? [1,1,1]; return bake(new THREE.BoxGeometry(sx, sy, sz)) }
          if (o.type === 'cylinder') { const r = o.radius ?? 0.5; const h = o.height ?? 1; return bake(new THREE.CylinderGeometry(r, r, h, 32)) }
          if (o.type === 'sphere') { const r = o.radius ?? 0.5; return bake(new THREE.SphereGeometry(r, 32, 16)) }
          if (o.type === 'tube') {
            const r = (o.radius ?? 0.6); const t = Math.min(r-0.01, Math.max(0.005, o.thickness ?? 0.1)); const h = (o.height ?? 1.2)
            const outer = new THREE.CylinderGeometry(r, r, h, 24); const inner = new THREE.CylinderGeometry(Math.max(0.01, r - t), Math.max(0.01, r - t), h+0.001, 24)
            const bOuter = bake(outer), bInner = bake(inner); const evaluator = new Evaluator(); const res = evaluator.evaluate(bOuter, bInner, SUBTRACTION)

            return new Brush(res.geometry as THREE.BufferGeometry)
          }
          if (o.type === 'ibeam' || o.type === 'hbeam' || o.type === 'cchannel') {
            const L = o.length ?? 2, W = o.width ?? 0.5, D = o.depth ?? (o.width ?? 0.5); const tf = (o as any).flangeThickness ?? 0.08; const tw = (o as any).webThickness ?? 0.06
            const geoms: THREE.BufferGeometry[] = []
            const addBox = (sx:number, sy:number, sz:number, px:number, py:number, pz:number) => { const g = new THREE.BoxGeometry(sx, sy, sz); g.translate(px, py, pz); geoms.push(g) }
            if (o.type === 'ibeam' || o.type === 'hbeam') { addBox(W, tf, L, 0, (D/2 - tf/2), 0); addBox(W, tf, L, 0, -(D/2 - tf/2), 0); addBox(tw, D - 2*tf, L, 0, 0, 0) }
            if (o.type === 'cchannel') { addBox(tw, D, L, -(W/2 - tw/2), 0, 0); addBox(W - tw, tf, L, (tw/2),  (D/2 - tf/2), 0); addBox(W - tw, tf, L, (tw/2), -(D/2 - tf/2), 0) }
            const merged = mergeGeometries(geoms); return bake(merged)
          }
          return null
        }
        if (action === 'boolean-apply') {
          // Convert preview into final object
          if (!boolPreview?.geom) { alert('No boolean preview to apply'); return }
          const id = `bool-${cryptoRandom()}`
          const src = objects.find(o=>o.id===selectedId) || objects[0]
          const pos = (src?.position ?? [0,0,0]) as [number,number,number]
          const rot = (src?.rotation ?? [0,0,0]) as [number,number,number]
          const scl = (src?.scale ?? [1,1,1]) as [number,number,number]
          setObjects(prev => ([...prev, { id, type:'gltf', name:'Boolean', position: pos, rotation: rot, scale: scl, color:'#93c5fd', __geom: boolPreview.geom as any } as any]))
          setBoolPreview(null)
          return
        }
        if (!a || !b) return
        const brushA = toBrush(a as any)
        const brushB = toBrush(b as any)
        if (!brushA || !brushB) { alert('Boolean currently supports box, sphere, cylinder'); return }
        const evaluator = new Evaluator()
      // compute result after convert-editable block returns
        try {
          const op = data === 'union' ? ADDITION : data === 'subtract' ? SUBTRACTION : INTERSECTION
          const res2 = new Evaluator().evaluate(brushA, brushB, op)
          const previewGeom = res2.geometry as THREE.BufferGeometry
          if (action === 'boolean') {
            const id = `bool-${cryptoRandom()}`
            const pos = a.position as [number,number,number]
            const rot = a.rotation as [number,number,number]
            const scl = a.scale as [number,number,number]
            setObjects(prev => ([...prev, { id, type:'gltf', name:`${data} result`, position: pos, rotation: rot, scale: scl, color:'#93c5fd', url: undefined, __geom: previewGeom as any } as any]))
          } else {
            setBoolPreview({ geom: previewGeom })
          }
        } catch (e) {
          console.error('Boolean failed', e)
          alert('Boolean operation failed')
          return
        }
      } else if (action === 'face-inset-start') {
        if (!selectedId) { alert('Select an editable mesh'); return }
        const o = objects.find(x=>x.id===selectedId)
        if (!o || o.type!=='editable-mesh' || !o.faces || !o.vertices) { alert('Face Inset works on editable meshes'); return }
        setFaceTool({ kind:'inset', amount: 0.1, depth: 0, keepActive:false, preview: { geom: null } })
      } else if (action === 'face-bevel-start') {
        if (!selectedId) { alert('Select an editable mesh'); return }
        const o = objects.find(x=>x.id===selectedId)
        if (!o || o.type!=='editable-mesh' || !o.faces || !o.vertices) { alert('Bevel works on editable meshes'); return }
        setFaceTool({ kind:'bevel', amount: 0.05, segments: 2, profile: 0.5, keepActive:false, preview: { geom: null } })
      } else if (action === 'face-tool-increment' || action === 'face-tool-decrement') {
        if (!faceTool) return
        const delta = action==='face-tool-increment' ? 0.05 : -0.05
        setFaceTool(prev => prev ? { ...prev, amount: Math.max(0, (prev.amount||0) + delta) } : prev)
      } else if (action === 'face-tool-apply') {
        if (!faceTool) return
        if (faceTool.kind==='inset') {
          // Apply inset to all selected faces for selected editable mesh
          const sid = selectedId!
          const o = objects.find(x=>x.id===sid)
          if (!o || o.type!=='editable-mesh' || !o.faces || !o.vertices) return
          // Simple inset (temporary): move triangle vertices toward face centroids by amount
          const amount = faceTool.amount || 0
          if (amount<=0) { setFaceTool(null); return }
          const verts = (o.vertices as [number,number,number][]).map(v=> new THREE.Vector3(v[0],v[1],v[2]))
          const newVerts = verts.map(v=> v.clone())
          for (let i=0;i<o.faces.length;i++) {
            const [a,b,c] = o.faces[i]
            const va = verts[a], vb = verts[b], vc = verts[c]
            const centroid = new THREE.Vector3().add(va).add(vb).add(vc).multiplyScalar(1/3)
            newVerts[a].add(new THREE.Vector3().subVectors(centroid, va).setLength(amount))
            newVerts[b].add(new THREE.Vector3().subVectors(centroid, vb).setLength(amount))
            newVerts[c].add(new THREE.Vector3().subVectors(centroid, vc).setLength(amount))
          }
          const updated = newVerts.map(v=> [v.x, v.y, v.z] as [number,number,number])
          setObjects(prev => prev.map(ob => ob.id!==sid ? ob : ({...ob, vertices: updated })))
        } else if (faceTool.kind==='bevel') {
          // Placeholder: no-op apply for now until bevel implementation completed
        }
        // If keepActive, stay in tool; else exit
        setFaceTool(prev => {
          if (!prev) return null
          return prev.keepActive ? { ...prev } : null
        })
      } else if (action === 'face-tool-cancel') {
        setFaceTool(null)

      } else if (action === 'face-tool-set') {
        if (!faceTool) return
        const amt = Number((data?.amount ?? faceTool.amount))
        setFaceTool(prev => prev ? { ...prev, amount: isFinite(amt) ? Math.max(0, amt) : prev.amount } : prev)
      } else if (action === 'face-tool-toggle-keep') {
        if (!faceTool) return
        const keep = Boolean(data)
        setFaceTool(prev => prev ? { ...prev, keepActive: keep } : prev)

      } else if (action === 'draw-finish') {
        finishDrawing()
      } else if (action === 'slice') {
        // Plane-based slicing: subtract a large half-space box from selected object
        const idSel = selectedId
        if (!idSel) { alert('Select 1 object to slice'); return }
        const target = objects.find(o=>o.id===idSel)
        if (!target) return
        const plane = data?.plane ?? { normal: [0,1,0], offset: 0 } // y=offset plane
        const normal = new THREE.Vector3(plane.normal[0], plane.normal[1], plane.normal[2]).normalize()
        const size = 1000
        // Build cutting box that represents the half-space on the negative side of plane
        const cutBox = new THREE.BoxGeometry(size, size, size)
        const m = new THREE.Matrix4()
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), normal)
        m.makeRotationFromQuaternion(quat)
        cutBox.applyMatrix4(m)
        cutBox.translate(normal.x * (plane.offset - size/2), normal.y * (plane.offset - size/2), normal.z * (plane.offset - size/2))
        const evaluator = new Evaluator()
        const brushTarget = ((): Brush | null => {
          const toB = (o:any): Brush | null => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1))
            mesh.position.set(o.position[0], o.position[1], o.position[2])
            mesh.rotation.set(o.rotation[0], o.rotation[1], o.rotation[2])
            mesh.scale.set(o.scale[0], o.scale[1], o.scale[2])
            mesh.updateMatrixWorld(true)
            if (o.type === 'box' && o.size) { const b = new Brush(new THREE.BoxGeometry(o.size[0],o.size[1],o.size[2])); b.applyMatrix4(mesh.matrixWorld); return b }
            if (o.type === 'cylinder') { const b = new Brush(new THREE.CylinderGeometry(o.radius??0.5,o.radius??0.5,o.height??1,24)); b.applyMatrix4(mesh.matrixWorld); return b }
            if (o.type === 'sphere') { const b = new Brush(new THREE.SphereGeometry(o.radius??0.5,24,16)); b.applyMatrix4(mesh.matrixWorld); return b }
            return null
          }
          const out = toB(target as any)
          return out
        })()
        if (!brushTarget) { alert('Slice currently supports box/sphere/cylinder'); return }
        const brushCut = new Brush(cutBox)
        const res = evaluator.evaluate(brushTarget, brushCut, SUBTRACTION)
        setObjects(prev => prev.map(o => o.id===idSel ? ({...o, type:'gltf', __geom: res.geometry } as any) : o))
      } else if (action === 'smooth') {
        const idSel = selectedId
        if (!idSel) { alert('Select 1 object to smooth'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return

        // Simply enable smooth shading by marking the object with a flag
        // The renderer will use smooth normals instead of flat shading
        setObjects(prev => prev.map(o => o.id===idSel ? ({...o, smoothShading: true } as any) : o))
        log('smooth', { id: idSel, smoothShading: true })
      } else if (action === 'trim') {
        const idSel = selectedId
        if (!idSel) { alert('Select an object to trim'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        // Trim: reduce size by 10% on selected axis
        if (obj.type === 'box') {
          const size = obj.size ?? [1,1,1]
          setObjects(prev => prev.map(o => o.id===idSel ? ({...o, size: [size[0]*0.9, size[1]*0.9, size[2]*0.9] } as any) : o))
          log('trim', { id: idSel, newSize: [size[0]*0.9, size[1]*0.9, size[2]*0.9] })
        } else {
          alert('Trim works on boxes')
        }
      } else if (action === 'extend') {
        const idSel = selectedId
        if (!idSel) { alert('Select an object to extend'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        // Extend: increase size by 10% on X axis
        if (obj.type === 'box') {
          const size = obj.size ?? [1,1,1]
          setObjects(prev => prev.map(o => o.id===idSel ? ({...o, size: [size[0]*1.1, size[1], size[2]] } as any) : o))
          log('extend', { id: idSel, newSize: [size[0]*1.1, size[1], size[2]] })
        } else {
          alert('Extend works on boxes')
        }
      } else if (action === 'break') {
        const idSel = selectedId
        if (!idSel) { alert('Select an object to break'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        // Break: split into two pieces
        if (obj.type === 'box') {
          const size = obj.size ?? [1,1,1]
          const pos = obj.position as [number,number,number]
          const id1 = `${obj.type}-${cryptoRandom()}`
          const id2 = `${obj.type}-${cryptoRandom()}`
          setObjects(prev => prev.filter(o => o.id !== idSel).concat([
            { ...obj, id: id1, position: [pos[0]-size[0]/4, pos[1], pos[2]], size: [size[0]/2, size[1], size[2]] },
            { ...obj, id: id2, position: [pos[0]+size[0]/4, pos[1], pos[2]], size: [size[0]/2, size[1], size[2]] }
          ]))
          log('break', { id: idSel, split: [id1, id2] })
        } else {
          alert('Break works on boxes')
        }
      } else if (action === 'stretch') {
        const idSel = selectedId
        if (!idSel) { alert('Select object to stretch'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        // Stretch: increase length by 20%
        if (obj.type === 'box') {
          const size = obj.size ?? [1,1,1]
          setObjects(prev => prev.map(o => o.id===idSel ? ({...o, size: [size[0]*1.2, size[1], size[2]] } as any) : o))
          log('stretch', { id: idSel, newSize: [size[0]*1.2, size[1], size[2]] })
        } else {
          alert('Stretch works on boxes')
        }
      } else if (action === 'fillet') {
        const idSel = selectedId
        if (!idSel) { alert('Select object to fillet'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        const radius = data?.radius ?? 0.1
        // Fillet: apply smooth shading + mark with fillet flag
        setObjects(prev => prev.map(o => o.id===idSel ? ({...o, smoothShading: true, filletRadius: radius } as any) : o))
        log('fillet', { id: idSel, radius })
      } else if (action === 'chamfer') {
        const idSel = selectedId
        if (!idSel) { alert('Select object to chamfer'); return }
        const obj = objects.find(o=>o.id===idSel) as any
        if (!obj) return
        const distance = data?.distance ?? 0.05
        // Chamfer: reduce corner size slightly and apply smooth shading
        if (obj.type === 'box') {
          const size = obj.size ?? [1,1,1]
          setObjects(prev => prev.map(o => o.id===idSel ? ({...o, smoothShading: true, chamferDistance: distance, size: [size[0]*0.98, size[1]*0.98, size[2]*0.98] } as any) : o))
          log('chamfer', { id: idSel, distance })
        } else {
          setObjects(prev => prev.map(o => o.id===idSel ? ({...o, smoothShading: true, chamferDistance: distance } as any) : o))
          log('chamfer', { id: idSel, distance })
        }
      }
    }
    window.addEventListener('cad3d:modeler', onModeler as any)
    return () => window.removeEventListener('cad3d:modeler', onModeler as any)
  }, [objects, selectedId, selectedIds, selectLevel, setSelectLevel, setSaveToLibraryOpen, setLoadFromLibraryOpen])

  // Boolean preview state

  const [boolPreview, setBoolPreview] = useState<{ geom: THREE.BufferGeometry | null } | null>(null)

  // Face tool modal state (inset/bevel)
  const [faceTool, setFaceTool] = useState<null | { kind: 'inset' | 'bevel', amount: number, depth?: number, segments?: number, profile?: number, keepActive?: boolean, preview?: { geom: THREE.BufferGeometry | null } }>(null)

  // Drawing via R3F ground capture is handled in onGroundClick and a hidden plane mesh




  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (target as any)?.isContentEditable
      // Do not hijack keys while typing in inputs
      if (!isTyping) {
        if (e.key.toLowerCase() === "g") { setMode("translate"); log("mode", { to: "translate" }) }
        if (e.key.toLowerCase() === "r") { setMode("rotate"); log("mode", { to: "rotate" }) }
        if (e.key.toLowerCase() === "s") { setMode("scale"); log("mode", { to: "scale" }) }
        if (e.key === "Delete" || e.key === "Backspace") { const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : []); log("deleteShortcut", { ids, count: ids.length }); deleteSelected() }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") { e.preventDefault(); e.stopPropagation(); const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : []); log("duplicateShortcut", { ids, count: ids.length }); duplicateSelected() }
        // Fallback: Shift+D duplicates (for browsers that block Ctrl+D)
        if (e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "d") { e.preventDefault(); const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : []); log("duplicateShortcutShift", { ids, count: ids.length }); duplicateSelected() }
      }
    }
    window.addEventListener("keydown", h, { capture: true })
    return () => window.removeEventListener("keydown", h, { capture: true } as any)
  }, [])

  const { size, camera, scene, gl } = useThree()
  useEffect(() => { rootRef.current = scene as any }, [scene])
  useEffect(() => {
    // Fallback: ensure we can get canvas even if rootRef introspection fails
    if (!rootRef.current || !(rootRef.current as any).__r3f) {
      try {
        const canvas = (gl?.domElement as HTMLElement | undefined)
        if (canvas) (rootRef.current as any) = { __r3f: { root: { gl, camera, scene } } } as any
      } catch {}
    }
  }, [gl, camera, scene])
  // Modal face tool keybindings and drag adjustment
  useEffect(() => {
    if (!faceTool) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'face-tool-apply' } }))
      if (e.key === 'Escape') window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action: 'face-tool-cancel' } }))
    }
    const onMouseDown = (e: MouseEvent) => {
      faceDrag.current.dragging = true
      faceDrag.current.lastX = e.clientX || 0
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!faceDrag.current.dragging) return
      const x = e.clientX || 0
      const dx = x - faceDrag.current.lastX
      faceDrag.current.lastX = x
      if (dx !== 0) setFaceTool(prev => prev ? { ...prev, amount: Math.max(0, (prev.amount||0) + dx * 0.005) } : prev)
    }
    const onMouseUp = () => { faceDrag.current.dragging = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [faceTool])


  // Ensure TransformControls attaches to newly created/selected objects immediately
  useEffect(() => {
    if (selectedId) {
      selectedRef.current = objRefs.current[selectedId] || null
      setGizmoRefresh(x => x + 1)
    }
  }, [selectedId])
  const [boxSelect, setBoxSelect] = useState<{ start: [number, number] | null, end: [number, number] | null }>({ start: null, end: null })
  const [draggingSelect, setDraggingSelect] = useState(false)
  const dragShiftRef = useRef(false)

  // Project world position to screen pixel coordinates
  const projectToScreen = useCallback((obj: THREE.Object3D | null): [number, number] | null => {
    if (!obj) return null
    const v = new THREE.Vector3()
    obj.getWorldPosition(v)
    v.project(camera)
    const x = (v.x + 1) / 2 * size.width
    const y = (1 - (v.y + 1) / 2) * size.height
    return [x, y]
  }, [camera, size.width, size.height])

  // Drag-box selection handlers on window so we don't block 3D events
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (draggingGizmo) return // ignore if gizmo is initiating a drag
      if (mode !== 'select') return // box select only in select mode
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-ui-layer]')) return
      dragShiftRef.current = e.shiftKey
      setBoxSelect({ start: [e.clientX, e.clientY], end: [e.clientX, e.clientY] })
      setDraggingSelect(true)
      log('boxSelectStart', { x: e.clientX, y: e.clientY, shift: e.shiftKey })
    }
    const onMove = (e: MouseEvent) => {
      if (!draggingSelect) return
      if (draggingGizmo) return
      setBoxSelect(bs => bs.start ? { start: bs.start, end: [e.clientX, e.clientY] } : bs)
    }
    const onUp = (e: MouseEvent) => {
      if (!draggingSelect) return
      setDraggingSelect(false)
      setTimeout(() => setBoxSelect({ start: null, end: null }), 0)
      const start = boxSelect.start
      const end = [e.clientX, e.clientY] as [number, number]
      if (!start) return
      const dx = Math.abs(end[0] - start[0])
      const dy = Math.abs(end[1] - start[1])
      if (dx < 4 && dy < 4) { log('boxSelectCancel', { reason: 'tiny-drag' }); return }
      const x1 = Math.min(start[0], end[0])
      const y1 = Math.min(start[1], end[1])
      const x2 = Math.max(start[0], end[0])
      const y2 = Math.max(start[1], end[1])
      const idsIn: string[] = []
      objects.forEach(o => {
        const obj = objRefs.current[o.id] || null
        const p = projectToScreen(obj)
        if (!p) return
        const [sx, sy] = p
        if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) idsIn.push(o.id)
      })
      const additive = dragShiftRef.current
      let next: string[]
      if (additive) {
        const set = new Set(selectedIds)
        idsIn.forEach(id => set.has(id) ? set.delete(id) : set.add(id))
        next = Array.from(set)
      } else {
        next = idsIn
      }
      setSelectedIds(next)
      setSelectedId(next.length === 1 ? next[0] : null)
      log('boxSelect', { rect: { x1, y1, x2, y2 }, result: next })
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [objects, draggingSelect, boxSelect.start, projectToScreen, selectedIds, log])

  const updateSelected = useCallback((patch: Partial<ModelerObject>) => {
    if (!selectedId) return
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, ...patch } : o))
  }, [selectedId])

  const setNumeric = (key: keyof Pick<ModelerObject, "position" | "rotation" | "scale">, idx: 0 | 1 | 2, v: string) => {
    const n = Number(v)
    if (Number.isNaN(n)) return
    const cur = objects.find(o => o.id === selectedId)
    if (!cur) return
    const arr = [...(cur[key] as number[])] as [number, number, number]
    arr[idx] = key === "rotation" ? THREE.MathUtils.degToRad(n) : n
    updateSelected({ [key]: arr } as any)
  }

  const setColor = (hex: string) => { log("setColor", { selectedId, hex }); updateSelected({ color: hex }) }

  const handleTextureUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    log("textureUpload", { selectedId, name: file.name })
    updateSelected({ textureUrl: url })
  }

  const importGLTF = (file: File) => {
    const url = URL.createObjectURL(file)
    const id = `gltf-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      { id, type: "gltf", url, name: file.name, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }
    ])
    setSelectedId(id)
    log("importGLTF", { id, name: file.name, size: file.size })
  }

  const exportGLB = () => {
    if (!rootRef.current) return
    const exporter = new GLTFExporter()
    exporter.parse(rootRef.current, (res: ArrayBuffer | object) => {
      let blob: Blob
      if (res instanceof ArrayBuffer) blob = new Blob([res], { type: "model/gltf-binary" })
      else blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "scene.glb"
      a.click()
      log("exportGLB", { ok: true, size: blob.size })
    }, (err) => { log("exportGLB", { ok: false, error: true }) }, { binary: true })
  }

  const exportGLTF = () => {
    if (!rootRef.current) return
    const exporter = new GLTFExporter()
    exporter.parse(rootRef.current, (res: ArrayBuffer | object) => {
      const json = res instanceof ArrayBuffer ? null : JSON.stringify(res, null, 2)
      if (!json) { log('exportGLTF', { ok: false, reason: 'no-json' }); return }
      const blob = new Blob([json], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'scene.gltf'
      a.click()
      log('exportGLTF', { ok: true, size: blob.size })
    }, (err) => { log('exportGLTF', { ok: false, error: true }) }, { binary: false })
  }

  const exportOBJ = () => {
    if (!rootRef.current) return
    const exporter = new OBJExporter()
    const result = exporter.parse(rootRef.current as any)
    const blob = new Blob([result], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'scene.obj'
    a.click()
    log('exportOBJ', { ok: true, size: blob.size })
  }

  const exportSTL = () => {
    if (!rootRef.current) return
    const exporter = new STLExporter()
    const result = exporter.parse(rootRef.current as any, { binary: true } as any)
    const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'model/stl' }) : new Blob([result as any], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'scene.stl'
    a.click()
    log('exportSTL', { ok: true, size: blob.size })
  }

  const exportPLY = () => {
    if (!rootRef.current) return
    const exporter = new PLYExporter()
    exporter.parse(rootRef.current as any, (result: ArrayBuffer | string) => {
      const blob = result instanceof ArrayBuffer ? new Blob([result], { type: 'application/octet-stream' }) : new Blob([result], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'scene.ply'
      a.click()
      log('exportPLY', { ok: true, size: blob.size })
    })
  }

  const addBox = () => {
    const id = `box-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      {
        id,
        type: "box",
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        size: [1, 1, 1]
      }
    ])
    setSelectedId(id)
    log("addBox", { id })
  }

  const addPipe = () => {
    const id = `pipe-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'pipe', name:'Pipe', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#93c5fd',
      radius: 0.5, thickness: 0.1, height: 2
    }]))
    setSelectedId(id)
    log('addPipe', { id })
  }

  const addIBeam = () => {
    const id = `ibeam-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'ibeam', name:'I-Beam', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#93c5fd',
      length: 2, width: 0.5, depth: 0.5, flangeThickness: 0.08, webThickness: 0.06
    }]))
    setSelectedId(id)
    log('addIBeam', { id })
  }
  const addTank = () => {
    const id = `tank-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'tank', name:'Tank', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#9ca3af',
      diameter: 2, height: 4, headType: 'dished', roofType: 'flat', supports: 'legs'
    } as any]))
    setSelectedId(id)
    log('addTank', { id })
  }
  const addVessel = () => {
    const id = `vessel-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'vessel', name:'Vessel', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#9ca3af',
      diameter: 1.6, length: 6, headType: 'elliptical', supports: 'saddles'
    } as any]))
    setSelectedId(id)
    log('addVessel', { id })
  }
  const addColumn = () => {
    const id = `column-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'column', name:'Column', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#9ca3af',
      diameter: 1.2, height: 10, headType: 'flat', supports: 'skirt'
    } as any]))
    setSelectedId(id)
    log('addColumn', { id })
  }
  const addExchanger = () => {
    const id = `exchanger-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'exchanger', name:'Exchanger', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#9ca3af',
      diameter: 1.2, length: 5, headType: 'elliptical', supports: 'saddles'
    } as any]))
    setSelectedId(id)
    log('addExchanger', { id })

  }


  const addCChannel = () => {
    const id = `cchan-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'cchannel', name:'C-Channel', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#93c5fd',
      length: 2, width: 0.5, depth: 0.3, flangeThickness: 0.08, webThickness: 0.06
    }]))
    setSelectedId(id)
    log('addCChannel', { id })
  }


  const addHBeam = () => {
    const id = `hbeam-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'hbeam', name:'H-Beam', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#93c5fd',
      length: 2, width: 0.6, depth: 0.6, flangeThickness: 0.10, webThickness: 0.08
    }]))
    setSelectedId(id)
    log('addHBeam', { id })
  }

  const addSphere = () => {
    const id = `sphere-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'sphere', name:'Sphere', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#93c5fd',
      radius: 1
    }]))
    setSelectedId(id)
    log('addSphere', { id })
  }

  const addTube = () => {
    const id = `tube-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'tube', name:'Tube', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#9ca3af',
      radius: 0.6, thickness: 0.1, height: 1.2
    } as any]))
    setSelectedId(id)
    log('addTube', { id })
  }

  const addCylinder = () => {
    const id = `cyl-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      {
        id,
        type: "cylinder",
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radius: 0.5,
        height: 1
      }
    ])
    setSelectedId(id)
    log("addCylinder", { id })
  }

  const addScaffolding = (height: number = 10, width: number = 3, depth: number = 2, levels: number = 4) => {
    const id = `scaffold-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      {
        id,
        type: "scaffolding",
        name: "Scaffolding",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        height,
        width,
        depth,
        levels,
        postDiameter: 0.1,
        beamWidth: 0.08,
        beamHeight: 0.08,
        color: "#8b7355"
      } as any
    ])
    setSelectedId(id)
    log("addScaffolding", { id, height, width, depth, levels })
  }

  const addSinglePole = (height: number = 10, diameter: number = 0.1) => {
    const id = `pole-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      {
        id,
        type: "single-pole",
        name: "Single Pole",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        height,
        diameter,
        color: "#888888"
      } as any
    ])
    setSelectedId(id)
    log("addSinglePole", { id, height, diameter })
  }

  const addUnitBeam = (length: number = 3, width: number = 0.08, height: number = 0.08) => {
    const id = `beam-${cryptoRandom()}`
    setObjects(prev => [
      ...prev,
      {
        id,
        type: "unit-beam",
        name: "Unit Beam",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        length,
        width,
        height,
        color: "#a0a0a0"
      } as any
    ])
    setSelectedId(id)
    log("addUnitBeam", { id, length, width, height })
  }

  const addCrane = () => {
    const id = `crane-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id, type:'crane', name: 'Mobile Crane (Side)', position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], color:'#2E8B57',
      boomBase: 15, boomExtend: 0.0, boomAngle: 45, loadLine: 6
    } as any]))
    setSelectedId(id)
    log('addCrane', { id })
  }

  // Add realistic LTM 1055-3.1 3D crane
  const addLTM1055Crane = () => {
    const id = `ltm1055-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id,
      type: 'ltm-1055-3d' as any,
      name: 'Liebherr LTM 1055-3.1',
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      color: '#2E8B57',
      specId: 'ltm-1055-3d',
      boomAngle: 45,
      boomExtend: 0.3, // 30% extension
      slew: 0,
      loadLine: 8
    }]))
    setSelectedId(id)
    log('addLTM1055Crane', { id })
  }

  // Add realistic LTM 1300-6.2 3D crane
  const addLTM1300Crane = () => {
    const id = `ltm1300-${cryptoRandom()}`
    setObjects(prev => ([...prev, {
      id,
      type: 'ltm-1300-3d' as any,
      name: 'Liebherr LTM 1300-6.2',
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      color: '#2E8B57',
      specId: 'ltm-1300-3d',
      boomAngle: 45,
      boomExtend: 0.3,
      slew: 0,
      loadLine: 12
    }]))
    setSelectedId(id)
    log('addLTM1300Crane', { id })
  }

  const addCranePart = (partType: string) => {
    const baseId = `crane-${partType}-${Date.now()}`
    let newObjects: any[] = []

    switch (partType) {
      case 'base':
        // Create crane chassis with wheels
        newObjects = [
          // Main chassis
          {
            id: baseId,
            type: 'box',
            name: 'Crane Chassis',
            position: [0, 0.6, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [15, 1.2, 3] as [number, number, number],
            color: '#FFD700',
            layer: currentLayer,
            visible: true
          },
          // Front wheels
          {
            id: `${baseId}-wheel-fl`,
            type: 'cylinder',
            name: 'Front Left Wheel',
            position: [5, 0, -2] as [number, number, number],
            rotation: [Math.PI/2, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.2, 0.6, 1.2] as [number, number, number],
            color: '#1A1A1A',
            layer: currentLayer,
            visible: true
          },
          {
            id: `${baseId}-wheel-fr`,
            type: 'cylinder',
            name: 'Front Right Wheel',
            position: [5, 0, 2] as [number, number, number],
            rotation: [Math.PI/2, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.2, 0.6, 1.2] as [number, number, number],
            color: '#1A1A1A',
            layer: currentLayer,
            visible: true
          },
          // Rear wheels
          {
            id: `${baseId}-wheel-rl`,
            type: 'cylinder',
            name: 'Rear Left Wheel',
            position: [-5, 0, -2] as [number, number, number],
            rotation: [Math.PI/2, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.2, 0.6, 1.2] as [number, number, number],
            color: '#1A1A1A',
            layer: currentLayer,
            visible: true
          },
          {
            id: `${baseId}-wheel-rr`,
            type: 'cylinder',
            name: 'Rear Right Wheel',
            position: [-5, 0, 2] as [number, number, number],
            rotation: [Math.PI/2, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.2, 0.6, 1.2] as [number, number, number],
            color: '#1A1A1A',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'boom':
        // Create boom section
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Boom Section',
            position: [0, 3, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [15, 1.2, 1.2] as [number, number, number],
            color: '#FFD700',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'counterweight':
        // Create realistic counterweight stack
        newObjects = [
          // Main counterweight block
          {
            id: baseId,
            type: 'box',
            name: 'Counterweight Block',
            position: [-4, 1.2, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [3, 2.4, 2] as [number, number, number],
            color: '#45b7d1',
            layer: 'counterweight'
          },
          // Additional weight blocks
          {
            id: `${baseId}-extra-1`,
            type: 'box',
            name: 'Extra Weight 1',
            position: [-4, 3, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [2.5, 0.8, 1.8] as [number, number, number],
            color: '#45b7d1',
            layer: 'counterweight'
          },
          {
            id: `${baseId}-extra-2`,
            type: 'box',
            name: 'Extra Weight 2',
            position: [-4, 4, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [2, 0.8, 1.6] as [number, number, number],
            color: '#45b7d1',
            layer: 'counterweight'
          }
        ]
        break

      case 'cab':
        // Create operator cab
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Operator Cab',
            position: [0, 3, 2] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [2.5, 2.5, 2] as [number, number, number],
            color: '#FFD700',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'jib':
        // Create jib crane extension
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Jib Section',
            position: [15, 7, 0] as [number, number, number],
            rotation: [0, 0, -Math.PI/12] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [8, 0.6, 0.6] as [number, number, number],
            color: '#4ecdc4',
            layer: 'boom'
          },
          // Jib support strut
          {
            id: `${baseId}-strut`,
            type: 'box',
            name: 'Jib Strut',
            position: [13, 8, 0] as [number, number, number],
            rotation: [0, 0, Math.PI/3] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [4, 0.3, 0.3] as [number, number, number],
            color: '#4ecdc4',
            layer: 'boom'
          }
        ]
        break

      case 'hook':
        // Create realistic hook block object using dedicated type
        newObjects = [
          {
            id: baseId,
            type: 'hook-block',
            name: 'Hook Block',
            position: [0, 2, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            sheaveCount: 3,
            sheaveDiameter: 0.6,
            blockWidth: 0.5,
            ropeDiameter: 0.03,
            hookSize: 0.6,
            color: '#708090',
            layer: currentLayer,
            visible: true
          } as any
        ]
        break

      case 'wheel':
        // Create individual wheel
        newObjects = [
          {
            id: baseId,
            type: 'cylinder',
            name: 'Wheel',
            position: [0, 0, 0] as [number, number, number],
            rotation: [Math.PI/2, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.2, 0.6, 1.2] as [number, number, number],
            color: '#1A1A1A',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      default:
        return
    }

    // Add all objects and select the main one
    setObjects(prev => [...prev, ...newObjects])
    setSelectedId(baseId)
    log('addCranePart', { partType, id: baseId, count: newObjects.length })
  }

  // Crane Component Tools
  const addBoom = (length: number = 30, angle: number = 45) => {
    const comp = createBoom(length, angle, 1, false, [0, 5, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'box',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      size: [length, 1.2, 0.8],
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addBoom', { id: obj.id, length, angle })
  }

  const addJib = (length: number = 10, angle: number = 0) => {
    const comp = createJib(length, angle, [0, 0, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'box',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      size: [length, 0.6, 0.6],
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addJib', { id: obj.id, length, angle })
  }

  const addTrolleyComponent = (capacity: number = 50) => {
    const comp = createTrolley(capacity, [0, 0, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'box',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      size: [2, 1.5, 2],
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addTrolley', { id: obj.id, capacity })
  }

  const addHoistComponent = (capacity: number = 50, ropeCount: number = 4) => {
    const comp = createHoist(capacity, 1.5, ropeCount, [0, 0, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'cylinder',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      radius: 0.4,
      height: 1.2,
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addHoist', { id: obj.id, capacity, ropeCount })
  }

  const addCounterweightComponent = (mass: number = 100) => {
    const comp = createCounterweight(mass, [0, 5, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'box',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      size: [3, 2, 2],
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addCounterweight', { id: obj.id, mass })
  }

  const addOutriggerComponent = (extension: number = 5, count: number = 4) => {
    const comp = createOutrigger(extension, count, [0, 0, 0])
    const objs: ModelerObject[] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = Math.cos(angle) * 8
      const z = Math.sin(angle) * 8
      objs.push({
        id: `${comp.id}-${i}`,
        type: 'box',
        position: [x, 0, z],
        rotation: [0, angle, 0],
        scale: [1, 1, 1],
        size: [extension, 0.3, 0.3],
        color: comp.color,
        layer: currentLayer,
        visible: true
      })
    }
    setObjects(prev => [...prev, ...objs])
    setSelectedId(objs[0].id)
    log('addOutrigger', { id: comp.id, extension, count })
  }

  const addHookComponent = (size: number = 1, sheaveCount: number = 4) => {
    const comp = createHook(size, sheaveCount, [0, 0, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'hook-block',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      sheaveCount,
      blockWidth: size * 0.5,
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addHook', { id: obj.id, size, sheaveCount })
  }

  const addLoadComponent = (mass: number = 50, dimensions: [number, number, number] = [2, 2, 2]) => {
    const comp = createLoad(mass, dimensions, [0, 0, 0])
    const obj: ModelerObject = {
      id: comp.id,
      type: 'box',
      position: comp.position,
      rotation: comp.rotation,
      scale: comp.scale,
      size: dimensions,
      color: comp.color,
      layer: currentLayer,
      visible: true
    }
    setObjects(prev => [...prev, obj])
    setSelectedId(obj.id)
    log('addLoad', { id: obj.id, mass, dimensions })
  }

  const addBuilding = (buildingType: string) => {
    const baseId = `building-${buildingType}-${Date.now()}`
    let newObjects: any[] = []

    switch (buildingType) {
      case 'office':
        // Modern office building
        newObjects = [
          // Main structure
          {
            id: baseId,
            type: 'box',
            name: 'Office Building',
            position: [0, 15, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [20, 30, 15] as [number, number, number],
            color: '#E8E8E8',
            layer: currentLayer,
            visible: true
          },
          // Windows (facade)
          {
            id: `${baseId}-windows`,
            type: 'box',
            name: 'Windows',
            position: [10.1, 15, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [0.2, 25, 12] as [number, number, number],
            color: '#87CEEB',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'warehouse':
        // Industrial warehouse
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Warehouse',
            position: [0, 8, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [40, 16, 25] as [number, number, number],
            color: '#C0C0C0',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'residential':
        // Residential tower
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Residential Tower',
            position: [0, 25, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [15, 50, 12] as [number, number, number],
            color: '#DEB887',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'industrial':
        // Industrial facility
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Industrial Facility',
            position: [0, 12, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [50, 24, 30] as [number, number, number],
            color: '#708090',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'hospital':
        // Hospital building
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Hospital',
            position: [0, 10, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [30, 20, 20] as [number, number, number],
            color: '#F0F8FF',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'school':
        // School building
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'School',
            position: [0, 6, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [35, 12, 18] as [number, number, number],
            color: '#F5DEB3',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      default:
        return
    }

    setObjects(prev => [...prev, ...newObjects])
    setSelectedId(baseId)
    log('addBuilding', { buildingType, id: baseId, count: newObjects.length })
  }

  const addStructure = (structureType: string) => {
    const baseId = `structure-${structureType}-${Date.now()}`
    let newObjects: any[] = []

    switch (structureType) {
      case 'beam':
        // Steel I-beam
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Steel Beam',
            position: [0, 3, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [12, 0.6, 0.4] as [number, number, number],
            color: '#708090',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'column':
        // Steel column
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Steel Column',
            position: [0, 6, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [0.4, 12, 0.4] as [number, number, number],
            color: '#708090',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'truss':
        // Truss section with top and bottom chords
        newObjects = [
          // Top chord
          {
            id: baseId,
            type: 'box',
            name: 'Truss Top Chord',
            position: [0, 4, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [15, 0.3, 0.3] as [number, number, number],
            color: '#708090',
            layer: currentLayer,
            visible: true
          },
          // Bottom chord
          {
            id: `${baseId}-bottom`,
            type: 'box',
            name: 'Truss Bottom Chord',
            position: [0, 2, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [15, 0.3, 0.3] as [number, number, number],
            color: '#708090',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'bridge':
        // Bridge section
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Bridge Section',
            position: [0, 5, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [30, 1.5, 8] as [number, number, number],
            color: '#696969',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'tower-crane':
        // Tower crane with mast and jib
        newObjects = [
          // Mast
          {
            id: baseId,
            type: 'box',
            name: 'Tower Crane Mast',
            position: [0, 25, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [1.5, 50, 1.5] as [number, number, number],
            color: '#FFD700',
            layer: currentLayer,
            visible: true
          },
          // Jib
          {
            id: `${baseId}-jib`,
            type: 'box',
            name: 'Tower Crane Jib',
            position: [25, 48, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [50, 1.2, 1.2] as [number, number, number],
            color: '#FFD700',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      case 'panel':
        // Precast concrete panel
        newObjects = [
          {
            id: baseId,
            type: 'box',
            name: 'Precast Panel',
            position: [0, 3, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            size: [8, 6, 0.3] as [number, number, number],
            color: '#D3D3D3',
            layer: currentLayer,
            visible: true
          }
        ]
        break

      default:
        return
    }

    setObjects(prev => [...prev, ...newObjects])
    setSelectedId(baseId)
    log('addStructure', { structureType, id: baseId, count: newObjects.length })
  }

  const deleteSelected = () => {
    const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
    if (!ids.length) return
    setObjects(prev => prev.filter(o => !ids.includes(o.id)))
    log("delete", { ids })
    setSelectedId(null)
    setSelectedIds([])
    selectedRef.current = null
  }

  const duplicateSelected = () => {
    const ids = selectedIds.length ? selectedIds : (selectedId ? [selectedId] : [])
    if (!ids.length) return
    const clones: ModelerObject[] = []
    ids.forEach((sid, i) => {
      const o = objects.find(x => x.id === sid)
      if (!o) return
      const id = `${o.type}-${cryptoRandom()}`
      const offset = 0.5 + i * 0.1
      clones.push({
        ...o,
        id,
        position: [o.position[0] + offset, o.position[1], o.position[2] + offset]
      })
    })
    if (!clones.length) return
    setObjects(prev => [...prev, ...clones])
    log("duplicate", { from: ids, to: clones.map(c => c.id) })
    setSelectedId(clones[clones.length - 1].id)
    setSelectedIds(clones.map(c => c.id))
  }

  const BaseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#93c5fd", metalness: 0.2, roughness: 0.8, wireframe }), [wireframe])

  const renderObject = (o: ModelerObject) => {
    // Check layer visibility
    const objectLayer = o.layer || 'default'
    const layer = layers.find(l => l.id === objectLayer)
    if (layer && !layer.visible) return null
    const color = o.color ?? "#93c5fd"
    const mat = BaseMaterial.clone()
    mat.color = new THREE.Color(color)
    // Apply smooth shading if flag is set
    if ((o as any).smoothShading) {
      mat.flatShading = false
    }
    let texMat: THREE.MeshStandardMaterial | null = null
    if (o.textureUrl) {
      let tex = textureCache.current.get(o.textureUrl)
      if (!tex) {
        const loader = new THREE.TextureLoader()
        tex = loader.load(
          o.textureUrl,
          () => log("textureLoad", { url: o.textureUrl, status: "loaded" }),
          undefined,
          () => log("textureLoad", { url: o.textureUrl, status: "error" })
        )
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        textureCache.current.set(o.textureUrl, tex)
      }
      texMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.2, roughness: 0.8, wireframe })
    }
    // Editable mesh renderer + sub-object overlays
    if (o.type === 'editable-mesh' && o.vertices && o.faces) {
      const geom = useMemo(() => {
        const g = new THREE.BufferGeometry()
        const posArr = new Float32Array(o.vertices!.length * 3)
        for (let i=0;i<o.vertices!.length;i++) {
          const v = o.vertices![i]; posArr[i*3]=v[0]; posArr[i*3+1]=v[1]; posArr[i*3+2]=v[2]
        }
        const idxArr = new Uint32Array(o.faces!.length * 3)
        for (let i=0;i<o.faces!.length;i++) { const f=o.faces![i]; idxArr[i*3]=f[0]; idxArr[i*3+1]=f[1]; idxArr[i*3+2]=f[2] }
        g.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
        g.setIndex(new THREE.BufferAttribute(idxArr, 1))
        g.computeVertexNormals()
        return g
      }, [o.vertices, o.faces])

      // compute unique edges from faces (sorted tuple key)
      const edges = useMemo(() => {
        const set = new Set<string>()
        const out: [number, number][] = []
        for (const f of o.faces!) {
          const tri = [f[0], f[1], f[2]]
          for (let e=0;e<3;e++) {
            const a = tri[e], b = tri[(e+1)%3]
            const key = a<b ? `${a}_${b}` : `${b}_${a}`
            if (!set.has(key)) { set.add(key); out.push(a<b ? [a,b] : [b,a]) }
          }
        }
        return out
      }, [o.faces])

      const isSelectedObj = selectedId === o.id
      const showVerts = isSelectedObj && selectLevel === 'vertex'
      const showEdges = isSelectedObj && selectLevel === 'edge'

      return (
        <group key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); }}>
          <mesh castShadow receiveShadow>
            <primitive object={geom} attach="geometry" />
            <primitive object={texMat ?? mat} attach="material" />
          </mesh>

          {/* Vertex handles */}
          {showVerts && o.vertices!.map((v, i) => (
            <mesh key={`v-${i}`} position={[v[0], v[1], v[2]]}
              onPointerDown={(e)=>{ e.stopPropagation(); setSelectedVertex({ objectId: o.id, index: i }); setSelectedEdge(null); }}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color={selectedVertex?.objectId===o.id && selectedVertex?.index===i ? '#f59e0b' : '#22c55e'} depthTest={false} />
            </mesh>
          ))}

          {/* Edge handles as tiny cylinders */}
          {showEdges && edges.map(([a,b], idx) => {
            const va = new THREE.Vector3(...(o.vertices![a] as [number,number,number]))
            const vb = new THREE.Vector3(...(o.vertices![b] as [number,number,number]))
      {/* Face/Edge ghosted preview overlay - placeholder */}
      {faceTool && o.id===selectedId && (
        <mesh position={o.position as any} rotation={o.rotation as any} scale={o.scale as any}>
          <bufferGeometry attach="geometry" {...(undefined as any)} />
          <meshStandardMaterial attach="material" color="#60a5fa" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}

            const mid = va.clone().add(vb).multiplyScalar(0.5)
            const dir = new THREE.Vector3().subVectors(vb, va)
            const len = Math.max(0.01, dir.length())
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize())
            return (
              <mesh key={`e-${idx}`} position={[mid.x, mid.y, mid.z]} quaternion={q}
                onPointerDown={(e)=>{ e.stopPropagation(); setSelectedEdge({ objectId: o.id, index: idx }); setSelectedVertex(null); }}>
                <cylinderGeometry args={[0.015, 0.015, len, 8]} />
                <meshBasicMaterial color={selectedEdge?.objectId===o.id && selectedEdge?.index===idx ? '#f59e0b' : '#3b82f6'} depthTest={false} />
              </mesh>
            )
          })}
        </group>
      )
    }
    if (o.type === "box") {
      const size = o.size ?? [1, 1, 1]
      return (
        <mesh
          key={o.id}
          position={o.position}
          rotation={o.rotation}
          scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation()
            if (e.shiftKey) {
              if (selectLevel === 'object') {
                setSelectedIds(((prev: string[]) => prev.includes(o.id) ? prev.filter((id: string) => id !== o.id) : [...prev, o.id]) as any)
                setSelectedId(null)
                log("selectToggle", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFaceToggle", { id: o.id, faceIndex })
              }
            } else {
              if (selectLevel === 'object') {
                setSelectedId(o.id)
                setSelectedIds([o.id])
                log("select", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFace", { id: o.id, faceIndex })
              }
            }
            selectedRef.current = objRefs.current[o.id]
          }}
        >
          <boxGeometry args={size} />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }

    if ((o as any).type === 'sketch-face') {
      const [w,d] = ((o as any).faceSize ?? [1,1]) as [number,number]
      return (
        <group key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <mesh receiveShadow>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial color="#334155" opacity={0.6} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      )
    }
    if ((o as any).type === 'sketch-line') {
      const pts = ((o as any).points ?? []) as [number,number,number][]
      const style = ((o as any).style ?? 'line') as 'line'|'rope'
      const isVisible = o.visible !== false // Default to visible

      // Safety check
      if (!pts || pts.length < 2) {
        console.warn('Invalid points for sketch-line:', pts)
        return null
      }

      // Hide if not visible
      if (!isVisible) {
        return null
      }

      // Create simple line geometry
      const points = pts.map(p => new THREE.Vector3(p[0], p[1], p[2]))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      if (style === 'rope') {
        // Thick rope line
        return (
          <line key={o.id}
            ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
            onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial color="#d1d5db" linewidth={5} />
          </line>
        )
      }

      // Simple thin line
      return (
        <line key={o.id}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <primitive object={geometry} attach="geometry" />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </line>
      )
    }

    if (o.type === "cylinder") {
      const r = o.radius ?? 0.5
      const h = o.height ?? 1
      return (
        <mesh
          key={o.id}
          position={o.position}
          rotation={[o.rotation[0] + Math.PI / 2, o.rotation[1], o.rotation[2]]}
          scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation()
            if (e.shiftKey) {
              if (selectLevel === 'object') {
                setSelectedIds(((prev: string[]) => prev.includes(o.id) ? prev.filter((id: string) => id !== o.id) : [...prev, o.id]) as any)
                setSelectedId(null)
                log("selectToggle", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFaceToggle", { id: o.id, faceIndex })
              }
            } else {
              if (selectLevel === 'object') {
                setSelectedId(o.id)
                setSelectedIds([o.id])
                log("select", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFace", { id: o.id, faceIndex })
              }
            }
            selectedRef.current = objRefs.current[o.id]
          }}
        >
          <cylinderGeometry args={[r, r, h, 24]} />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }
    if (o.type === 'pipe') {
      const r = o.radius ?? 0.5
      const t = Math.max(0.01, Math.min(o.thickness ?? 0.1, r - 0.01))
      const h = o.height ?? 2
      return (
        <group key={o.id} position={o.position} rotation={[o.rotation[0]+Math.PI/2, o.rotation[1], o.rotation[2]]} scale={o.scale} ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[r, r, h, 24]} />
            <primitive object={texMat ?? mat} attach="material" />
          </mesh>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[r - t, r - t, h + 0.001, 24]} />
            <meshStandardMaterial color={0x000000} transparent opacity={0.0} />
          </mesh>
        </group>
      )
    }
    if (o.type === 'ibeam' || o.type === 'hbeam' || o.type === 'cchannel') {
      const L = o.length ?? 2
      const W = o.width ?? 0.5
      const D = o.depth ?? (o.width ?? 0.5)
      const tf = (o as any).flangeThickness ?? 0.08
      const tw = (o as any).webThickness ?? 0.06
      // Build merged geometry for transform reliability
      const geoms: THREE.BufferGeometry[] = []
      const makeBox = (sx:number, sy:number, sz:number, px:number, py:number, pz:number) => {
        const g = new THREE.BoxGeometry(sx, sy, sz)
        g.translate(px, py, pz)
        geoms.push(g)
      }
      if (o.type === 'ibeam' || o.type === 'hbeam') {
        makeBox(W, tf, L, 0, (D/2 - tf/2), 0)
        makeBox(W, tf, L, 0, -(D/2 - tf/2), 0)
        makeBox(tw, D - 2*tf, L, 0, 0, 0)
      }
      if (o.type === 'cchannel') {
        makeBox(tw, D, L, -(W/2 - tw/2), 0, 0)
        makeBox(W - tw, tf, L, (tw/2),  (D/2 - tf/2), 0)
        makeBox(W - tw, tf, L, (tw/2), -(D/2 - tf/2), 0)
      }
      const merged = mergeGeometries(geoms)
      return (
        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale} ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow receiveShadow
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <primitive object={merged} attach="geometry" />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }

	    // Windows rendering
	    if (o.type === 'window') {
	      const kind = (o as any).windowKind ?? 'rect'
	      const [w,h,t] = (o as any).paneSize ?? [1.2, 0.8, 0.02]
	      const frame = Math.max(0, (o as any).frame ?? 0.05)
	      const mullions = (o as any).mullions ?? [0,0]
	      const curvature = (o as any).curvature ?? 0
	      const glassMat = new THREE.MeshPhysicalMaterial({ color: '#87CEEB', metalness: 0.0, roughness: 0.05, transmission: 0.9, thickness: t, transparent: true, opacity: 0.6 })
	      const frameMat = new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.6, roughness: 0.4 })
	      return (
	        <group key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
	          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
	          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
	          {/* Glass pane: box or curved via lathe-like approximation */}
	          {curvature > 0 ? (
	            <mesh castShadow receiveShadow>
	              {/* approximate curved windshield using a shallow cylinder segment */}
	              <cylinderGeometry args={[curvature, curvature, t, 32, 1, true, -w/(2*curvature), w/curvature]} />
	              <primitive object={glassMat} attach="material" />
	            </mesh>
	          ) : (
	            <mesh castShadow receiveShadow>
	              <boxGeometry args={[w, h, t]} />
	              <primitive object={glassMat} attach="material" />
	            </mesh>
	          )}
	          {/* Frame */}
	          {frame > 0 && (
	            <group>
	              {/* Outer frame as four thin boxes */}
	              <mesh position={[0, (h+frame)/2, 0]}><boxGeometry args={[w+frame, frame, t*1.2]} /><primitive object={frameMat} attach="material" /></mesh>
	              <mesh position={[0, -(h+frame)/2, 0]}><boxGeometry args={[w+frame, frame, t*1.2]} /><primitive object={frameMat} attach="material" /></mesh>
	              <mesh position={[ (w+frame)/2, 0, 0]}><boxGeometry args={[frame, h, t*1.2]} /><primitive object={frameMat} attach="material" /></mesh>
	              <mesh position={[-(w+frame)/2, 0, 0]}><boxGeometry args={[frame, h, t*1.2]} /><primitive object={frameMat} attach="material" /></mesh>
	              {/* Mullions */}
	              {Array.from({length: Math.max(0, mullions[0])}).map((_,i)=>{
	                const cols = Math.max(0, mullions[0]); const step = w/(cols+1); const x = -w/2 + step*(i+1)
	                return <mesh key={`mx-${i}`} position={[x,0,0]}><boxGeometry args={[frame, h, t*1.1]} /><primitive object={frameMat} attach="material" /></mesh>
	              })}
	              {Array.from({length: Math.max(0, mullions[1])}).map((_,i)=>{
	                const rows = Math.max(0, mullions[1]); const step = h/(rows+1); const y = -h/2 + step*(i+1)
	                return <mesh key={`my-${i}`} position={[0,y,0]}><boxGeometry args={[w, frame, t*1.1]} /><primitive object={frameMat} attach="material" /></mesh>
	              })}
	            </group>
	          )}
	        </group>
	      )
	    }

	    // Scaffolding rendering
	    if (o.type === 'scaffolding') {
	      const height = (o as any).height ?? 10
	      const width = (o as any).width ?? 3
	      const depth = (o as any).depth ?? 2
	      const levels = (o as any).levels ?? 4
	      const postDiameter = (o as any).postDiameter ?? 0.1
	      const beamWidth = (o as any).beamWidth ?? 0.08
	      const beamHeight = (o as any).beamHeight ?? 0.08

	      const geometries: THREE.BufferGeometry[] = []
	      const postRadius = postDiameter / 2
	      const levelHeight = height / Math.max(1, levels - 1)

	      // Vertical posts at corners
	      const corners = [
	        [-width / 2, 0, -depth / 2],
	        [width / 2, 0, -depth / 2],
	        [width / 2, 0, depth / 2],
	        [-width / 2, 0, depth / 2],
	      ]

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

	        // Platform decking
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
	      }

	      const merged = mergeGeometries(geometries)
	      return (
	        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
	          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
	          castShadow receiveShadow
	          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
	          <primitive object={merged} attach="geometry" />
	          <primitive object={texMat ?? mat} attach="material" />
	        </mesh>
	      )
	    }

	    // Single Pole rendering
	    if (o.type === 'single-pole') {
	      const height = (o as any).height ?? 10
	      const diameter = (o as any).diameter ?? 0.1
	      const radius = diameter / 2

	      const poleGeom = new THREE.CylinderGeometry(radius, radius, height, 12)
	      poleGeom.translate(0, height / 2, 0)

	      return (
	        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
	          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
	          castShadow receiveShadow
	          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
	          <primitive object={poleGeom} attach="geometry" />
	          <primitive object={texMat ?? mat} attach="material" />
	        </mesh>
	      )
	    }

	    // Unit Beam rendering
	    if (o.type === 'unit-beam') {
	      const length = (o as any).length ?? 3
	      const width = (o as any).width ?? 0.08
	      const height = (o as any).height ?? 0.08

	      const beamGeom = new THREE.BoxGeometry(length, height, width)

	      return (
	        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
	          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
	          castShadow receiveShadow
	          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
	          <primitive object={beamGeom} attach="geometry" />
	          <primitive object={texMat ?? mat} attach="material" />
	        </mesh>
	      )
	    }

	    // Hook block rendering
	    if (o.type === 'hook-block') {
	      const sheaveCount = Math.max(1, (o as any).sheaveCount ?? 3)
	      const sheaveD = (o as any).sheaveDiameter ?? 0.5
	      const blockW = (o as any).blockWidth ?? 0.4
	      const ropeD = (o as any).ropeDiameter ?? 0.03
	      const hookSize = (o as any).hookSize ?? 0.5
	      const steelMat = new THREE.MeshStandardMaterial({ color:'#708090', metalness:0.8, roughness:0.2 })
	      const pulleyMat = new THREE.MeshStandardMaterial({ color:'#a3a3a3', metalness:0.5, roughness:0.4 })
	      const ropeMat = new THREE.MeshStandardMaterial({ color:'#555555', metalness:0.1, roughness:0.6 })
	      return (
	        <group key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
	          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
	          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
	          {/* Side plates */}
	          <mesh position={[ blockW/2, 0, 0]} castShadow receiveShadow><boxGeometry args={[blockW/4, sheaveD*1.4, sheaveD*0.8]} /><primitive object={steelMat} attach="material" /></mesh>
	          <mesh position={[-blockW/2, 0, 0]} castShadow receiveShadow><boxGeometry args={[blockW/4, sheaveD*1.4, sheaveD*0.8]} /><primitive object={steelMat} attach="material" /></mesh>
	          {/* Sheaves */}
	          {Array.from({length: sheaveCount}).map((_,i)=>{
	            const offset = ((i - (sheaveCount-1)/2) * (sheaveD*0.9))
	            return (
	              <mesh key={`sh-${i}`} position={[0, offset, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
	                <cylinderGeometry args={[sheaveD/2, sheaveD/2, blockW*0.9, 24]} />
	                <primitive object={pulleyMat} attach="material" />
	              </mesh>
	            )
	          })}
          {/* Hook assembly with standardization: shank + collar + 1 or 2 hook bodies */}
          {(() => {
            const hookStandard = (o as any).hookStandard ?? 'custom'
            const hookCapacity = (o as any).hookCapacity ?? 50
            const showLatch = (o as any).hookLatch !== false
            // Layout relative to sheaves
            const sheavesSpan = sheaveCount * sheaveD * 0.9
            const sheavesBottomY = -(sheavesSpan/2) - (sheaveD*0.05)
            // Defaults (custom)
            let hookThk = Math.max(ropeD*2, 0.08*hookSize)
            let shankR = Math.max(0.08*hookSize, 0.04)
            let hookHeight = hookSize * 1.2
            let opening = hookSize * 0.7
            let throat = hookSize * 0.9
            // DIN overrides
            if (hookStandard !== 'custom' && (hookStandard === 'DIN 15401' || hookStandard === 'DIN 15402')) {
              const d = getDINHookDims(hookStandard as any, hookCapacity as any)
              hookThk = d.thickness
              shankR = d.shank/2
              hookHeight = d.height
              opening = d.opening
              throat = d.throat
            }
            const yConn = sheavesBottomY - Math.max(0.06*hookHeight, 0.05)
            const shankLen = Math.max(0.22*hookHeight, shankR*2.2)
            const collarR = Math.max(shankR*1.25, hookThk*1.2)
            const collarTube = Math.max(0.6*hookThk, 0.015)

            // Helper to build one hook body at a given Z offset
            const buildHookBody = (zOffset: number) => {
              const H = hookHeight
              const O = opening
              // Curve points designed to roughly match opening and height
              const p0 = new THREE.Vector3(0, 0.15*hookThk, zOffset) // slightly inside collar for seam-free connection
              const p1 = new THREE.Vector3(0, -0.22*H, zOffset)
              const p2 = new THREE.Vector3(0.35*O, -0.46*H, zOffset)
              const p3 = new THREE.Vector3(0.60*O, -0.68*H, zOffset)
              const p4 = new THREE.Vector3(0.50*O, -0.88*H, zOffset)
              const p5 = new THREE.Vector3(0.12*O, -0.98*H, zOffset) // near tip
              const p6 = new THREE.Vector3(-0.08*O, -0.82*H, zOffset) // tip curls back
              const curve = new THREE.CatmullRomCurve3([p0,p1,p2,p3,p4,p5,p6], false, 'catmullrom', 0.2)
              const tube = new THREE.TubeGeometry(curve, 64, hookThk/2, 24, false)
              const tipPos = curve.getPoint(1)
              const tipTan = curve.getTangent(1).normalize()
              const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), tipTan)
              const eul = new THREE.Euler().setFromQuaternion(quat)

              // Latch geometry (optional)
              const targetPos = curve.getPoint(0.72)
              const latchDir = new THREE.Vector3().subVectors(targetPos, tipPos)
              const latchLen = Math.max(0.2*O, latchDir.length()*0.96)
              const latchThk = Math.max(0.3*hookThk, 0.01)
              const latchW = Math.max(0.8*hookThk, latchThk)
              const latchDirN = latchDir.clone().normalize()
              const latchQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), latchDirN)
              const latchEul = new THREE.Euler().setFromQuaternion(latchQuat)
              const latchMid = new THREE.Vector3().addVectors(tipPos, latchDirN.multiplyScalar(latchLen/2))

              return (
                <group key={`hook-body-${zOffset}`} position={[0, -shankLen, 0]}>
                  {/* Root cap for clean join to shank */}
                  <mesh position={[p0.x, p0.y, p0.z]} castShadow receiveShadow>
                    <sphereGeometry args={[hookThk/2, 12, 8]} />
                    <primitive object={steelMat} attach="material" />
                  </mesh>
                  {/* Hook tube */}
                  <mesh castShadow receiveShadow>
                    <primitive object={tube} attach="geometry" />
                    <primitive object={steelMat} attach="material" />
                  </mesh>
                  {/* Tip */}
                  <mesh position={[tipPos.x, tipPos.y - 0.1*hookThk, tipPos.z]} rotation={[eul.x, eul.y, eul.z]} castShadow receiveShadow>
                    <coneGeometry args={[hookThk*0.7, hookThk*1.8, 16]} />
                    <primitive object={steelMat} attach="material" />
                  </mesh>
                  {/* Safety latch */}
                  {showLatch && (
                    <group>
                      {/* Latch plate */}
                      <mesh position={[latchMid.x, latchMid.y, latchMid.z]} rotation={[latchEul.x, latchEul.y, latchEul.z]} castShadow receiveShadow>
                        <boxGeometry args={[latchW, latchLen, latchThk]} />
                        <primitive object={steelMat} attach="material" />
                      </mesh>
                      {/* Pivot pin */}
                      <mesh position={[tipPos.x, tipPos.y, tipPos.z]} rotation={[0,0,0]} castShadow receiveShadow>
                        <cylinderGeometry args={[latchThk*0.5, latchThk*0.5, latchW*1.2, 12]} />
                        <primitive object={steelMat} attach="material" />
                      </mesh>
                      {/* Spring coil (visual) */}
                      <mesh position={[tipPos.x - latchThk*0.4, tipPos.y - latchThk*0.2, tipPos.z]} castShadow receiveShadow>
                        <torusGeometry args={[latchThk*0.6, latchThk*0.18, 8, 12]} />
                        <primitive object={steelMat} attach="material" />
                      </mesh>
                    </group>
                  )}
                </group>
              )
            }

            // For DIN 15402 render two bodies on a common shank
            const isDouble = hookStandard === 'DIN 15402'
            const bodyOffsetZ = isDouble ? Math.min(blockW*0.3, hookThk*1.8) : 0

            return (
              <group position={[0, yConn, 0]}>
                {/* Shank */}
                <mesh position={[0, -shankLen/2, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[shankR, shankR, shankLen, 24]} />
                  <primitive object={steelMat} attach="material" />
                </mesh>
                {/* Collar */}
                <mesh position={[0, -shankLen, 0]} castShadow receiveShadow>
                  <torusGeometry args={[collarR, collarTube, 14, 28]} />
                  <primitive object={steelMat} attach="material" />
                </mesh>
                {/* Hook body/bodies */}
                {isDouble ? (
                  <>
                    {buildHookBody(+bodyOffsetZ)}
                    {buildHookBody(-bodyOffsetZ)}
                  </>
                ) : buildHookBody(0)}
              </group>
            )
          })()}
          {/* Rope runs (simplified straight segments) */}
          <mesh position={[0, 0, blockW*0.45]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[ropeD/2, ropeD/2, sheaveD*sheaveCount*0.9, 8]} /><primitive object={ropeMat} attach="material" /></mesh>
        </group>
      )
    }


    if (o.type === "sphere") {
      const r = o.radius ?? 0.5
      return (
        <mesh
          key={o.id}
          position={o.position}
          rotation={o.rotation}
          scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation()
            if (e.shiftKey) {
              if (selectLevel === 'object') {
                setSelectedIds(((prev: string[]) => prev.includes(o.id) ? prev.filter((id: string) => id !== o.id) : [...prev, o.id]) as any)
                setSelectedId(null)
                log("selectToggle", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFaceToggle", { id: o.id, faceIndex })
              }
            } else {
              if (selectLevel === 'object') {
                setSelectedId(o.id)
                setSelectedIds([o.id])
                log("select", { id: o.id })
                setSelectedFace(null)
              } else {
                const faceIndex = (e as any).faceIndex ?? 0
                setSelectedId(o.id)
                setSelectedIds([o.id])
                setSelectedFace({ objectId: o.id, faceIndex })
                log("selectFace", { id: o.id, faceIndex })
              }
            }
            selectedRef.current = objRefs.current[o.id]
          }}
        >
          <sphereGeometry args={[r, 24, 16]} />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }

    if (o.type === 'tube') {
      const r = (o.radius ?? 0.6)
      const t = Math.min(r-0.01, Math.max(0.005, o.thickness ?? 0.1))
      const h = (o.height ?? 1.2)
      const outer = new THREE.CylinderGeometry(r, r, h, 24)
      const inner = new THREE.CylinderGeometry(r - t, r - t, Math.max(0.01,h+0.001), 24)
      return (
        <group key={o.id} position={o.position} rotation={[o.rotation[0]+Math.PI/2, o.rotation[1], o.rotation[2]]} scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <mesh castShadow receiveShadow>
            <primitive object={outer} attach="geometry" />
            <primitive object={texMat ?? mat} attach="material" />
          </mesh>
          <mesh castShadow receiveShadow>
            <primitive object={inner} attach="geometry" />
            {/* BackSide gives hollow look without boolean */}
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} side={THREE.BackSide} wireframe={wireframe} />
          </mesh>
        </group>
      )
    }

    // LTM 1055-3.1 3D Crane
    if (o.type === 'ltm-1055-3d') {
      return (
        <group
          key={o.id}
          position={o.position}
          rotation={o.rotation}
          scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e) => { e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}
        >
          <LTM1055Crane3D
            spec={LTM_1055_3D_SPEC}
            boomAngleDeg={o.boomAngle ?? 45}
            extension={o.boomExtend ?? 0.3}
            loadLineLength={o.loadLine ?? 8}
            slewAngle={o.slew ?? 0}
            scaleFactor={1}
          />
        </group>
      )
    }

    // LTM 1300-6.2 3D Crane (using same component with different spec)
    if (o.type === 'ltm-1300-3d') {
      return (
        <group
          key={o.id}
          position={o.position}
          rotation={o.rotation}
          scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          onPointerDown={(e) => { e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}
        >
          <LTM1055Crane3D
            spec={LTM_1300_3D_SPEC}
            boomAngleDeg={o.boomAngle ?? 45}
            extension={o.boomExtend ?? 0.3}
            loadLineLength={o.loadLine ?? 12}
            slewAngle={o.slew ?? 0}
            scaleFactor={1}
          />
        </group>
      )
    }

    if (o.type === 'tank' || o.type === 'vessel' || o.type === 'column' || o.type === 'exchanger') {
      const geoms: THREE.BufferGeometry[] = []
      const r = (o.diameter ?? 2) / 2
      const height = o.height ?? (o.length ?? 4)
      const addCyl = (radius:number, h:number, pos:[number,number,number], rot:[number,number,number]) => {
        const g = new THREE.CylinderGeometry(radius, radius, Math.max(0.01, h), 24)
        const m = new THREE.Matrix4()
        m.makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]))
        g.applyMatrix4(m)
        g.translate(pos[0], pos[1], pos[2])
        geoms.push(g)
      }
      const addHemisphere = (radius:number, pos:[number,number,number], rot:[number,number,number], scaleY=1) => {
        const g = new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI*2, 0, Math.PI/2)
        g.scale(1, scaleY, 1)
        const m = new THREE.Matrix4()
        m.makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]))
        g.applyMatrix4(m)
        g.translate(pos[0], pos[1], pos[2])
        geoms.push(g)
      }
      const addConeRoof = (radius:number, height:number, pos:[number,number,number]) => {
        const g = new THREE.ConeGeometry(radius, height, 24)
        g.translate(pos[0], pos[1] + height/2, pos[2])
        geoms.push(g)
      }
      const addBox = (sx:number, sy:number, sz:number, pos:[number,number,number]) => {
        const g = new THREE.BoxGeometry(sx, sy, sz)
        g.translate(pos[0], pos[1], pos[2])
        geoms.push(g)
      }

      if (o.type === 'tank') {
        // Vertical tank along Y
        addCyl(r, height, [0, 0, 0], [0,0,0])
        const roof = (o.roofType ?? 'flat')
        if (roof === 'flat') addCyl(r, 0.05, [0, height/2 + 0.025, 0], [0,0,0])
        else if (roof === 'dished') addHemisphere(r, [0, height/2, 0], [0,0,0], 1)
        else if (roof === 'cone') addConeRoof(r, Math.max(0.2, r*0.6), [0, height/2, 0])
        const sup = (o.supports ?? 'legs')
        if (sup === 'legs') {
          const legH = 0.4; const legW = Math.min(0.15, r*0.2); const y = -height/2 - legH/2
          const d = r*0.7
          addBox(legW, legH, legW, [ d, y,  d])
          addBox(legW, legH, legW, [-d, y,  d])
          addBox(legW, legH, legW, [ d, y, -d])
          addBox(legW, legH, legW, [-d, y, -d])
        } else if (sup === 'skirt') {
          addCyl(r*0.7, 0.6, [0, -height/2 - 0.3, 0], [0,0,0])
        }
      }

      if (o.type === 'column') {
        addCyl(r, height, [0, 0, 0], [0,0,0])
        const ht = (o.headType ?? 'flat')
        if (ht === 'hemispherical') addHemisphere(r, [0, height/2, 0], [0,0,0], 1)
        if (ht === 'elliptical') addHemisphere(r, [0, height/2, 0], [0,0,0], 0.75)
        // base support
        const sup = (o.supports ?? 'skirt')
        if (sup === 'skirt') addCyl(r*0.6, 0.8, [0, -height/2 - 0.4, 0], [0,0,0])
      }

      if (o.type === 'vessel' || o.type === 'exchanger') {
        // Horizontal vessel along X
        const L = o.length ?? height
        // body
        addCyl(r, L, [0,0,0], [0,0,Math.PI/2])
        const ht = (o.headType ?? 'elliptical')
        if (ht === 'hemispherical' || ht === 'elliptical') {
          const scaleY = ht === 'elliptical' ? 0.75 : 1
          addHemisphere(r, [ L/2, 0, 0], [0,0,Math.PI/2], scaleY)
          // back head: rotate to point -X by rotating another 180 deg around Z
          const g2 = new THREE.SphereGeometry(r, 24, 16, 0, Math.PI*2, 0, Math.PI/2)
          g2.scale(1, scaleY, 1)
          g2.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2))
          g2.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI))
          g2.translate(-L/2, 0, 0)
          geoms.push(g2)
        }
        const sup = (o.supports ?? 'saddles')
        if (sup === 'saddles') {
          const sx = 0.6, sy = 0.3, sz = r*1.2
          addBox(sx, sy, sz, [ L*0.25, -r - sy/2, 0])
          addBox(sx, sy, sz, [-L*0.25, -r - sy/2, 0])
        }
      }

      const merged = mergeGeometries(geoms)
      return (
        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale} ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow receiveShadow
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <primitive object={merged} attach="geometry" />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }
    // Generic inline-geometry renderer: if object has __geom, render it as a mesh regardless of type
    if ((o as any).__geom) {
      const geom = (o as any).__geom as THREE.BufferGeometry
      // Ensure vertex normals are computed for smooth shading
      if (!geom.getAttribute('normal')) {
        geom.computeVertexNormals()
      }
      return (
        <mesh key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any; if (ref && selectedId === o.id) selectedRef.current = ref as any }}
          castShadow receiveShadow
          onPointerDown={(e)=>{ e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <primitive object={geom} attach="geometry" />
          <primitive object={texMat ?? mat} attach="material" />
        </mesh>
      )
    }

    if (o.type === "gltf" && o.url) {
      return (
        <group key={o.id} position={o.position} rotation={o.rotation} scale={o.scale}
          ref={ref => { objRefs.current[o.id] = ref as any }}
          onPointerDown={(e) => { e.stopPropagation(); setSelectedId(o.id); setSelectedIds([o.id]); setSelectedFace(null); selectedRef.current = objRefs.current[o.id] }}>
          <GLTFModel url={o.url} />
        </group>
      )
    }
    return null
  }
  const onObjectChange = useCallback(() => {
    const id = selectedId
    const obj = selectedRef.current
    if (!id || !obj) return
    setObjects(prev => prev.map(o => {
      if (o.id !== id) return o

      const p = obj.position
      const r = obj.rotation
      const s = obj.scale
      return { ...o, position: [p.x, p.y, p.z], rotation: [r.x, r.y, r.z], scale: [s.x, s.y, s.z] }
    }))
  }, [selectedId])

  const translationSnap = snap ? 0.5 : undefined
  const rotationSnap = snap ? THREE.MathUtils.degToRad(15) : undefined
  const scaleSnap = snap ? 0.1 : undefined;

  return (
    <>
      {objects.map(renderObject)}

	      {/* Ground capture for drawing clicks (always in scene when drawing) */}
	      {drawTool && (
	        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}
	          onPointerMove={(e) => {
	            if (drawTool) {
	              e.stopPropagation()
	              const p = e.point
	              if (p) {
	                let px = p.x
	                let pz = p.z

	                // High precision snapping like 2D CAD
	                if (snap) {
	                  if (precisionMode) {
	                    // Snap to 0.1m grid (10cm precision)
	                    px = Math.round(px * 10) / 10
	                    pz = Math.round(pz * 10) / 10
	                  } else {
	                    // Snap to 1m grid
	                    px = Math.round(px)
	                    pz = Math.round(pz)
	                  }
	                }

	                setCursorPosition([px, 0, pz])
	                setShowCrosshair(true)
	              }


	            }
	          }}
	          onPointerLeave={() => {
	            setShowCrosshair(false)
	            setCursorPosition(null)
	          }}
	          onPointerDown={(e) => {
	            e.stopPropagation()
	            if (!e.point) return

	            const p = e.point
	            let px = p.x
	            let pz = p.z

	            // High precision snapping
	            if (snap) {
	              if (precisionMode) {
	                px = Math.round(px * 10) / 10
	                pz = Math.round(pz * 10) / 10
	              } else {
	                px = Math.round(px)
	                pz = Math.round(pz)
	              }
	            }



	            const newPt: [number, number, number] = [px, 0, pz]

	            if (drawTool === 'line') {
	              if (!isDrawing) {
	                // Start drawing
	                setIsDrawing(true)
	                setCurrentLine([newPt])
	                setDrawPoints([newPt])
	                console.log('Started drawing line at:', newPt)
	              } else {
	                // Finish line
	                if (!currentLine || currentLine.length === 0) return
	                const finalLine = [currentLine[0], newPt]
	                const id = `sketch-line-${Date.now()}`
	                setObjects(prev => [...prev, {
	                  id,
	                  type: 'sketch-line',
	                  name: 'Line',
	                  points: finalLine,
	                  thickness: drawThickness,
	                  style: drawStyle,
	                  layer: currentLayer,
	                  visible: true
	                } as any])
	                setIsDrawing(false)
	                setCurrentLine(null)
	                setDrawPoints([])
	                setDrawTool(null)
	                console.log('Finished drawing line:', finalLine)
	              }
	              return
	            }

	            // Handle other tools (polyline, rect, etc.)
	            if (drawTool === 'polyline') {
	              // Right-click to finish polyline
	              if (e.button === 2 && drawPoints.length >= 2) {
	                const id = `sketch-line-${Date.now()}`
	                setTimeout(() => {
	                  setObjects(prev => [...prev, { id, type: 'sketch-line', name: 'Polyline', points: drawPoints, thickness: drawThickness, style: drawStyle, visible: true } as any])
	                  setDrawTool(null)
	                  setDrawPoints([])
	                }, 0)
	                return
      {/* Sub-object gizmos: move selected vertex */}
      {selectLevel==='vertex' && selectedVertex && selectedId && (
        <TransformControls
          key={`vt-${selectedId}-${(selectedVertex as any).index}-${gizmoRefresh}`}
          object={(() => {
            const obj = objRefs.current[selectedId!] as THREE.Object3D
            if (!obj) return null as any
            const o = objects.find(x=>x.id===selectedId)!
            if (!o || !o.vertices) return null as any
            const v = (o.vertices as [number,number,number][]) [(selectedVertex as any).index]
            const helper = new THREE.Object3D()
            helper.position.set(v[0]+(o?.position?.[0]??0), v[1]+(o?.position?.[1]??0), v[2]+(o?.position?.[2]??0))
            vertexHelper.current = helper
            return helper as any
          })()}
          mode={'translate'}
          onMouseDown={() => { setDraggingGizmo(true); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: false } })) }}
          onMouseUp={() => { setDraggingGizmo(false); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: true } })) }}
          onChange={() => {
            const sid = selectedId!
            const o = objects.find(x=>x.id===sid)
            if (!o || !o.vertices || !vertexHelper.current || !selectedVertex) return
            const hp = vertexHelper.current.position
            const local = new THREE.Vector3(hp.x - (o.position?.[0]??0), hp.y - (o.position?.[1]??0), hp.z - (o.position?.[2]??0))
            setObjects(prev => prev.map(ob => ob.id!==sid ? ob : ({...ob, vertices: (ob.vertices??[]).map((vv,idx)=> idx===(selectedVertex as any).index ? [local.x, local.y, local.z] as [number,number,number] : vv)})))
          }}
        />
      )}

      {/* Sub-object gizmos: move selected edge (moves both vertices) */}
      {selectLevel==='edge' && selectedEdge && selectedId && (
        <TransformControls
          key={`ed-${selectedId}-${(selectedEdge as any).index}-${gizmoRefresh}`}
          object={(() => {
            const obj = objRefs.current[selectedId!] as THREE.Object3D
            if (!obj) return null as any
            const o = objects.find(x=>x.id===selectedId)!
            if (!o || !o.vertices || !o.faces) return null as any
            // rebuild edges array like above
            const setE = new Set<string>(); const out: [number,number][] = []
            ;(o.faces as [number,number,number][])?.forEach(f=>{ const tri=[f[0],f[1],f[2]]; for (let e=0;e<3;e++){ const a=tri[e], b=tri[(e+1)%3]; const key=a<b?`${a}_${b}`:`${b}_${a}`; if(!setE.has(key)){ setE.add(key); out.push(a<b?[a,b]:[b,a]) } } })
            const [a,b] = out[(selectedEdge as any).index] || [0,0]
            const va = new THREE.Vector3(...((o.vertices as [number,number,number][]) [a]))
            const vb = new THREE.Vector3(...((o.vertices as [number,number,number][]) [b]))
            const mid = va.clone().add(vb).multiplyScalar(0.5)
            const helper = new THREE.Object3D(); helper.position.set(mid.x+(o.position?.[0]??0), mid.y+(o.position?.[1]??0), mid.z+(o.position?.[2]??0))
            edgeHelper.current = helper
            return helper as any
          })()}
          mode={'translate'}
          onMouseDown={() => { setDraggingGizmo(true); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: false } })) }}
          onMouseUp={() => { setDraggingGizmo(false); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: true } })) }}
          onChange={() => {
            const sid = selectedId!
            const o = objects.find(x=>x.id===sid)
            if (!o || !o.vertices || !o.faces || !edgeHelper.current || !selectedEdge) return
            const hp = edgeHelper.current.position
            const localMid = new THREE.Vector3(hp.x - (o.position?.[0]??0), hp.y - (o.position?.[1]??0), hp.z - (o.position?.[2]??0))
            // move both vertices by same delta from current midpoint
            const setE = new Set<string>(); const out: [number,number][] = []
            ;(o.faces as [number,number,number][])?.forEach(f=>{ const tri=[f[0],f[1],f[2]]; for (let e=0;e<3;e++){ const a=tri[e], b=tri[(e+1)%3]; const key=a<b?`${a}_${b}`:`${b}_${a}`; if(!setE.has(key)){ setE.add(key); out.push(a<b?[a,b]:[b,a]) } } })
            const [aIdx,bIdx] = out[(selectedEdge as any).index] || [0,0]
            const va = new THREE.Vector3(...((o.vertices as [number,number,number][]) [aIdx]))
            const vb = new THREE.Vector3(...((o.vertices as [number,number,number][]) [bIdx]))
            const curMid = va.clone().add(vb).multiplyScalar(0.5)
            const delta = new THREE.Vector3().subVectors(localMid, curMid)
            setObjects(prev => prev.map(ob => ob.id!==sid ? ob : ({...ob, vertices: (ob.vertices??[]).map((vv,idx)=> idx===aIdx ? [vv[0]+delta.x, vv[1]+delta.y, vv[2]+delta.z] as [number,number,number] : (idx===bIdx ? [vv[0]+delta.x, vv[1]+delta.y, vv[2]+delta.z] as [number,number,number] : vv))})))
          }}
        />
      )}
	              }
	            }

	            const p2 = e.point
	            let px2 = p2.x
	            let pz2 = p2.z

	            // High precision snapping like 2D CAD
	            if (snap) {
	              if (precisionMode) {
	                // Snap to 0.1m grid (10cm precision)
	                px2 = Math.round(px2 * 10) / 10
	                pz2 = Math.round(pz2 * 10) / 10
	              } else {
	                // Snap to 1m grid
	                px2 = Math.round(px2)
	                pz2 = Math.round(pz2)
	              }
	            }

	            const newPt2: [number, number, number] = [px2, 0, pz2]
            // Append point only; finalize in useEffect to avoid setState during render
            const newPoints = [...drawPoints, newPt2]
            setDrawPoints(newPoints)

            // Finalize based on tool type
            if ((drawTool as any) === 'line' && newPoints.length >= 2) {
              const [a, b] = newPoints as [[number, number, number], [number, number, number]]
              const id = `sketch-line-${Date.now()}`
              setTimeout(() => {
                console.log('Creating line from', a, 'to', b)
                setObjects(prev => {
                  const newLine = { id, type: 'sketch-line', name: 'Sketch Line', points: [a, b], thickness: drawThickness, style: drawStyle, layer: currentLayer }
                  console.log('Adding line object:', newLine)
                  return [...prev, newLine as any]
                })
                setDrawTool(null)
                setDrawPoints([])
              }, 0)
            } else if (drawTool === 'polyline') {
              // For rope/sling presets, auto-finish after 2 points for simple connections
              if ((drawStyle === 'rope') && newPoints.length >= 2) {
                const id = `sketch-line-${Date.now()}`
                setTimeout(() => {
                  setObjects(prev => {
                    const newObj = { id, type: 'sketch-line', name: 'Wire Rope', points: newPoints, thickness: drawThickness, style: drawStyle, layer: currentLayer }
                    return [...prev, newObj as any]
                  })
                  setDrawTool(null)
                  setDrawPoints([])
                }, 0)
              }
              // Otherwise continue adding points - finish with ESC or right-click
            } else if (drawTool === 'rect' && newPoints.length >= 2) {
              const [a, b] = newPoints as [[number, number, number], [number, number, number]]
              const id = `sketch-rect-${Date.now()}`
              const x1 = Math.min(a[0], b[0]), x2 = Math.max(a[0], b[0])
              const z1 = Math.min(a[2], b[2]), z2 = Math.max(a[2], b[2])
              const w = Math.max(0.01, x2 - x1), d = Math.max(0.01, z2 - z1)
              const cx: [number, number, number] = [(x1 + x2) / 2, 0, (z1 + z2) / 2]
              setTimeout(() => {
                setObjects(prev => [...prev, { id, type: 'sketch-face', name: 'Sketch Rect', position: cx, rotation: [0, 0, 0], scale: [1, 1, 1], faceSize: [w, d], thickness: drawThickness, style: drawStyle } as any])
                setDrawTool(null)
                setDrawPoints([])
              }, 0)
            }
      {/* Face/Edge tool live preview and keybindings */}
      {faceTool && (
        <>
          <Html position={[0,0,0]} center>
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-gray-800/90 text-gray-200 rounded px-3 py-1 text-xs shadow border border-gray-700 flex items-center gap-2">
              <span className="opacity-80">{faceTool.kind==='inset' ? 'Inset' : 'Bevel'}</span>
              <span>Value: {faceTool.amount.toFixed(3)} m</span>
              <button className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-decrement' } }))}>-</button>
              <button className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-increment' } }))}>+</button>
              <button className="ml-2 px-2 py-0.5 rounded bg-green-600 hover:bg-green-500" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-apply'} }))}>Apply</button>
              <button className="px-2 py-0.5 rounded bg-gray-600 hover:bg-gray-500" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-cancel'} }))}>Cancel</button>
            </div>
          </Html>
        </>
      )}



	          }}>
	          <planeGeometry args={[1000, 1000, 1, 1]} />
	          <meshBasicMaterial color="transparent" opacity={0} transparent visible={false} />
	        </mesh>

	      )}

      {/* Face tool preview overlay */}
      {faceTool?.kind==='inset' && (
        <Html position={[0,0,0]} center>
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-gray-800/90 text-gray-200 rounded px-3 py-1 text-xs shadow border border-gray-700 flex items-center gap-2">
            <span className="opacity-80">Inset</span>
            <span>Amount: {faceTool.amount.toFixed(2)} m</span>
            <button className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-decrement' } }))}>-</button>
            <button className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-increment' } }))}>+</button>
            <button className="ml-2 px-2 py-0.5 rounded bg-green-600 hover:bg-green-500" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-apply' } }))}>Apply</button>
            <button className="px-2 py-0.5 rounded bg-gray-600 hover:bg-gray-500" onClick={()=>window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: { action:'face-tool-cancel' } }))}>Cancel</button>
          </div>
        </Html>
      )}

      {showGizmo && selectedId && selectedRef.current && selectLevel === 'object' && (
        <TransformControls key={String(selectedId)+'-'+gizmoRefresh}
          object={selectedRef.current as any}
          mode={mode === "select" ? "translate" : mode}
          translationSnap={translationSnap as any}
          rotationSnap={rotationSnap as any}
          scaleSnap={scaleSnap as any}
          space="world"
          onMouseDown={() => { setDraggingGizmo(true); log('gizmo:down', { id: selectedId }); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: false } })) }}
          onMouseUp={() => { setDraggingGizmo(false); log('gizmo:up', { id: selectedId }); onObjectChange(); window.dispatchEvent(new CustomEvent('cad3d:orbit', { detail: { enabled: true } })) }}
          onChange={() => {
            const id = selectedId
            const obj = selectedRef.current as THREE.Object3D | null
            if (!obj || !id) return
            const p = obj.position; const r = obj.rotation; const s = obj.scale
            log('gizmo:change', { id, pos: [p.x,p.y,p.z] });
            // Commit on mouse up only to avoid render loops
          }}
        />
      )}



      {/* Box Selection Overlay (global) */}
      {showGizmo && boxSelect.start && boxSelect.end && (
        <Html fullscreen>
          <div data-ui-layer className="pointer-events-none absolute inset-0">
            {(() => {
              const x1 = Math.min(boxSelect.start![0], boxSelect.end![0])
              const y1 = Math.min(boxSelect.start![1], boxSelect.end![1])
              const x2 = Math.max(boxSelect.start![0], boxSelect.end![0])
              const y2 = Math.max(boxSelect.start![1], boxSelect.end![1])
              return (
                <div className="absolute border border-sky-400/80 bg-sky-400/10" style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }} />
              )
            })()}
          </div>
        </Html>
      )}

      {/* Boolean preview overlay */}
      {boolPreview?.geom && (
        <mesh position={[0,0,0]} castShadow receiveShadow>
          <primitive object={boolPreview.geom} attach="geometry" />
          <meshStandardMaterial color="#00ffff" metalness={0.1} roughness={0.7} transparent opacity={0.35} />
        </mesh>
      )}


      {/* Developer Console Drawer (global) */}
      {showGizmo && showConsole && (
        <Html fullscreen>
          <div data-ui-layer className="absolute bottom-4 right-4 w-[560px] bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl text-gray-200 pointer-events-auto" style={{ zIndex: 170, pointerEvents: 'auto' }}>
            <div className="flex items-center justify-between px-3 py-2 bg-gray-700 border-b border-gray-600 rounded-t-lg">
              <div className="text-sm font-bold text-gray-100">Developer Console</div>
              <div className="flex items-center gap-2">
                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500" onClick={() => setLogs([])}>Clear</button>
                <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500" onClick={() => setShowConsole(false)}>Close</button>
              </div>
            </div>
            <div ref={consoleRef} className="max-h-64 overflow-auto p-3 font-mono text-xs leading-relaxed bg-gray-900 text-green-400 rounded-b-lg">
              {logs.length === 0 ? (
                <div className="text-gray-500">Console ready - no logs yet</div>
              ) : logs.map((l, i) => (
                <div key={i} className="hover:bg-gray-800 px-1 rounded">{l}</div>
              ))}
            </div>
          </div>
        </Html>
      )}

      {/* Simple cursor dot only */}
      {showCrosshair && cursorPosition && drawTool && (
        <mesh position={[safeCursorPosition[0], 0.01, safeCursorPosition[2]]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      {/* Live drawing preview line */}
      {isDrawing && currentLine && currentLine.length > 0 && cursorPosition && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                currentLine[0][0] || 0, currentLine[0][1] || 0, currentLine[0][2] || 0,
                safeCursorPosition[0], safeCursorPosition[1], safeCursorPosition[2]
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffff00" linewidth={2} transparent opacity={0.8} />
        </line>
      )}

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        open={saveToLibraryOpen}
        onOpenChange={setSaveToLibraryOpen}
        selectedObjects={selectedIds.length > 0 ? objects.filter(o => selectedIds.includes(o.id)) : (selectedId ? objects.filter(o => o.id === selectedId) : [])}
        onSuccess={() => {
          log('Objects saved to library successfully')
          setSaveToLibraryOpen(false)
        }}
      />

      {/* Load from Library Dialog */}
      <LoadFromLibraryDialog
        open={loadFromLibraryOpen}
        onOpenChange={setLoadFromLibraryOpen}
        onLoadEquipment={(equipment, cadData) => {
          try {
            if (Array.isArray(cadData)) {
              // Add loaded objects to the scene
              const newObjects = cadData.map((obj: any) => ({
                ...obj,
                id: `${obj.id}-${Date.now()}-${Math.random()}`
              }))
              setObjects((prev) => [...prev, ...newObjects])
              log(`Loaded ${newObjects.length} objects from library`)
            }
          } catch (err) {
            log('Error loading equipment:', err)
          }
        }}
      />

    </>
  )
}

function cryptoRandom() {
  // No Date.now() to avoid SSR mismatch. Use crypto if available, otherwise fallback.
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1)
    window.crypto.getRandomValues(buf)
    return buf[0].toString(36)
  }
  return Math.floor(Math.random() * 1e9).toString(36)
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function RibbonToolButton({ icon, label, active, disabled, onClick }: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  disabled?: boolean,
  onClick?: () => void
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`pointer-events-auto flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-700/60 transition-colors min-w-[70px] h-16 disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-blue-600 border-2 border-blue-400 shadow-sm' : 'border-2 border-transparent'
      }`}
    >
      <div className="text-gray-300 mb-1">{icon}</div>
      <span className="text-[10px] text-gray-300 font-semibold leading-tight text-center whitespace-nowrap">{label}</span>
    </button>
  )
}

