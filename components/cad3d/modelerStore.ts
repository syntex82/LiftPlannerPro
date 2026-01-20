import { create } from 'zustand'

export type ModelerObjectType = "box" | "cylinder" | "sphere" | "tube" | "lathe" | "sweep" | "union" | "pipe" | "ibeam" | "hbeam" | "cchannel" | "tank" | "vessel" | "column" | "exchanger" | "crane" | "crane-plan" | "window" | "hook-block" | "scaffolding" | "single-pole" | "unit-beam" | "gltf" | "editable-mesh"

export interface ModelerObject {
  id: string
  type: ModelerObjectType
  name?: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color?: string
  textureUrl?: string
  visible?: boolean
  locked?: boolean
  layer?: string // layer id
  groupId?: string // logical grouping identifier
  size?: [number, number, number]
  // cylinder/pipe params
  radius?: number
  height?: number
  thickness?: number // for pipe wall
  // beam/channel params
  length?: number
  width?: number // flange width (x)
  depth?: number // alias for width if needed
  flangeThickness?: number
  webThickness?: number
  // equipment params (optional)
  headType?: 'flat' | 'elliptical' | 'hemispherical'
  diameter?: number
  roofType?: 'flat' | 'cone' | 'dished'
  supports?: 'skirt' | 'legs' | 'saddles' | 'none'
  nozzleCount?: number
  // crane params (optional)
  specId?: string // id from lib/crane-models
  boomBase?: number
  boomExtend?: number
  boomAngle?: number // degrees
  slew?: number // degrees (superstructure rotation)
  jibLength?: number
  loadLine?: number
  chassisLength?: number
  chassisWidth?: number
  outriggerLength?: number
  outriggerWidth?: number
  // window params (optional)
  windowKind?: 'rect' | 'windshield' | 'side' | 'rear'
  paneSize?: [number, number, number] // w,h,t
  curvature?: number // meters radius for windshield curvature
  frame?: number // frame/mullion thickness
  mullions?: [number, number] // cols, rows
  // hook block params (optional)
  sheaveCount?: number
  sheaveDiameter?: number
  blockWidth?: number
  ropeDiameter?: number
  hookSize?: number
  // hook standardization
  hookStandard?: 'custom' | 'DIN 15401' | 'DIN 15402'
  hookCapacity?: 25 | 50 | 100 | 150 | 200
  // derived dimensions (meters)
  hookOpening?: number
  hookThroat?: number
  hookThickness?: number
  hookHeight?: number
  shankDiameter?: number
  hookLatch?: boolean
  // scaffolding params (optional)
  levels?: number // number of platform levels
  postDiameter?: number // vertical post diameter
  beamWidth?: number // horizontal beam width
  beamHeight?: number // horizontal beam height
  // editable mesh data (optional)
  vertices?: [number, number, number][]
  faces?: [number, number, number][] // triangle indices
  uvs?: [number, number][]
  edges?: [number, number][]
  // gltf
  url?: string
}

type SelectLevel = 'object' | 'face' | 'vertex' | 'edge'
interface SelectedFace { objectId: string; faceIndex: number }
interface SelectedVertex { objectId: string; index: number }
interface SelectedEdge { objectId: string; index: number }

interface Layer {
  id: string
  name: string
  visible: boolean
  color: string
  locked?: boolean
}

interface ModelerState {
  objects: ModelerObject[]
  selectedId: string | null
  selectedIds: string[]
  mode: "select" | "translate" | "rotate" | "scale"
  snap: boolean
  wireframe: boolean
  selectLevel: SelectLevel
  selectedFace: SelectedFace | null
  selectedVertex: SelectedVertex | null
  selectedEdge: SelectedEdge | null
  layers: Layer[]
  currentLayer: string
  // setters
  setObjects: (fn: (prev: ModelerObject[]) => ModelerObject[]) => void
  setSelectedId: (id: string | null) => void
  setSelectedIds: (ids: string[]) => void
  setMode: (m: ModelerState['mode']) => void
  setSnap: (v: boolean | ((s: boolean) => boolean)) => void
  setWireframe: (v: boolean | ((w: boolean) => boolean)) => void
  setSelectLevel: (l: SelectLevel) => void
  setSelectedFace: (sf: SelectedFace | null) => void
  setSelectedVertex: (sv: SelectedVertex | null) => void
  setSelectedEdge: (se: SelectedEdge | null) => void
  setLayers: (layers: Layer[]) => void
  setCurrentLayer: (layerId: string) => void
  toggleLayerVisibility: (layerId: string) => void
  addLayer: (layer: Omit<Layer, 'id'>) => void
  deleteLayer: (layerId: string) => void
  renameLayer: (layerId: string, newName: string) => void
}

export const useModelerStore = create<ModelerState>((set) => ({
  objects: [],
  selectedId: null,
  selectedIds: [],
  mode: 'translate',
  snap: true,
  wireframe: false,
  selectLevel: 'object',
  selectedFace: null,
  selectedVertex: null,
  selectedEdge: null,
  layers: [
    { id: 'default', name: 'Default', visible: true, color: '#ffffff' },
    { id: 'structure', name: 'Structure', visible: true, color: '#ff6b6b' },
    { id: 'boom', name: 'Boom', visible: true, color: '#4ecdc4' },
    { id: 'counterweight', name: 'Counterweight', visible: true, color: '#45b7d1' },
    { id: 'cab', name: 'Cab', visible: true, color: '#96ceb4' },
    { id: 'rigging', name: 'Rigging', visible: true, color: '#feca57' }
  ],
  currentLayer: 'default',
  setObjects: (fn) => set((s) => ({ objects: fn(s.objects) })),
  setSelectedId: (id) => set({ selectedId: id }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setMode: (m) => set({ mode: m }),
  setSnap: (v) => set((s) => ({ snap: typeof v === 'function' ? (v as any)(s.snap) : v })),
  setWireframe: (v) => set((s) => ({ wireframe: typeof v === 'function' ? (v as any)(s.wireframe) : v })),
  setSelectLevel: (l) => set({ selectLevel: l }),
  setSelectedFace: (sf) => set({ selectedFace: sf }),
  setSelectedVertex: (sv) => set({ selectedVertex: sv }),
  setSelectedEdge: (se) => set({ selectedEdge: se }),
  setLayers: (layers) => set({ layers }),
  setCurrentLayer: (layerId) => set({ currentLayer: layerId }),
  toggleLayerVisibility: (layerId) => set((s) => ({
    layers: s.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
  })),
  addLayer: (layer) => set((s) => ({
    layers: [...s.layers, { ...layer, id: `layer-${Date.now()}` }]
  })),
  deleteLayer: (layerId) => set((s) => ({
    layers: s.layers.filter(l => l.id !== layerId),
    currentLayer: s.currentLayer === layerId ? 'default' : s.currentLayer,
    objects: s.objects.map(obj =>
      (obj.layer || 'default') === layerId
        ? { ...obj, layer: 'default' }
        : obj
    )
  })),
  renameLayer: (layerId, newName) => set((s) => ({
    layers: s.layers.map(l => l.id === layerId ? { ...l, name: newName } : l)
  })),
}))

