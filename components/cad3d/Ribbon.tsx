"use client"

import React, { useState } from "react"
import { FilePlus, FolderOpen, Save, MousePointer, Move, RotateCw, Expand, Copy, Trash2, Settings, Terminal, Grid, Magnet, Box as BoxIcon, Circle, PenLine, Square, PenTool, Zap, Minus, Plus, RotateCcw, Layers, Eye, EyeOff, Scissors, Maximize2, Slash, Radius, Cog, Anchor, Hexagon, Link2, Package } from "lucide-react"

export default function Ribbon() {
  const [activeTab, setActiveTab] = useState<'file'|'modeling'|'insert'|'profiles'|'view'>('file')

  const fire = (eventDetail: any) => {
    console.log('fire() called with:', eventDetail)
    window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: eventDetail }))
  }

  const fireFile = (detail: any) => window.dispatchEvent(new CustomEvent('cad3d:file', { detail }))

  const onOpen = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.cad3d.json,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        fire({ action: 'load', data })
      } catch {
        alert('Invalid project file')
      }
    }
    input.click()
  }

  const onSave = () => fire({ action: 'save' })

  return (
    <div className="sticky top-0 z-[10000] w-full select-none pointer-events-auto">
      <div className="h-8 bg-gradient-to-b from-gray-700 to-gray-800 border-b border-gray-600 flex items-center px-2">
        {([
          ['file','FILE'],
          ['modeling','Modeling'],
          ['insert','Insert'],
          ['view','View'],
        ] as const).map(([k,label]) => (
          <button key={k}
            title={`Open ${label} tab`}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${activeTab===k?'bg-gray-800 border border-gray-600 border-b-0 text-gray-200':'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
            onClick={()=>setActiveTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-28 bg-gradient-to-b from-gray-800 to-gray-900 border-b-2 border-gray-700 pointer-events-auto">
        <div className="h-full flex items-stretch pointer-events-auto w-full">
          {activeTab==='file' && (
            <div className="flex">
              {/* Project Section */}
              <div className="flex flex-col border-r border-gray-600 px-3 py-2">
                <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">Project</div>
                <div className="flex gap-1 flex-1 items-center">
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="New project (clears current scene)" onClick={()=>fire({action:'reset'})}>
                    <FilePlus className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">New</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="Open project (.cad3d.json)" onClick={onOpen}>
                    <FolderOpen className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">Open</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="Save project as .cad3d.json" onClick={onSave}>
                    <Save className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">Save</span>
                  </button>
                </div>
              </div>
              {/* Library Section */}
              <div className="flex flex-col border-r border-gray-600 px-3 py-2">
                <div className="text-[10px] font-semibold text-orange-400 mb-1 uppercase tracking-wide">Library</div>
                <div className="flex gap-1 flex-1 items-center">
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-orange-700/40 w-14 h-14 text-orange-300" title="Load equipment from rigging library" onClick={()=>fire({action:'load-from-library'})}>
                    <FolderOpen className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">Load</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-orange-700/40 w-14 h-14 text-orange-300" title="Save selected objects to rigging library" onClick={()=>fire({action:'save-to-library'})}>
                    <Package className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">Save</span>
                  </button>
                </div>
              </div>
              {/* Export Section */}
              <div className="flex flex-col border-r border-gray-600 px-3 py-2">
                <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">Export</div>
                <div className="flex gap-1 flex-1 items-center">
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="Export as STL" onClick={()=>fire({action:'export', data:'stl'})}>
                    <BoxIcon className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">STL</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="Export as OBJ" onClick={()=>fire({action:'export', data:'obj'})}>
                    <BoxIcon className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">OBJ</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700/60 w-14 h-14 text-gray-300" title="Export as GLTF" onClick={()=>fire({action:'export', data:'gltf'})}>
                    <BoxIcon className="w-5 h-5 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-medium">GLTF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab==='modeling' && (
            <div className="flex overflow-x-auto">
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Tools</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Select tool (shortcut: S)" onClick={()=>fire({action:'tool', data:'select'})}>
                    <MousePointer className="w-3 h-3 mb-0.5" /> Select
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Move tool (shortcut: M)" onClick={()=>fire({action:'tool', data:'move'})}>
                    <Move className="w-3 h-3 mb-0.5" /> Move
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Rotate tool (shortcut: R)" onClick={()=>fire({action:'tool', data:'rotate'})}>
                    <RotateCw className="w-3 h-3 mb-0.5" /> Rotate
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Scale tool (shortcut: E)" onClick={()=>fire({action:'tool', data:'scale'})}>
                    <Expand className="w-3 h-3 mb-0.5" /> Scale
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Edit</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Copy selected (Ctrl+C)" onClick={()=>fire({action:'copy'})}>
                    <Copy className="w-3 h-3 mb-0.5" /> Copy
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Delete selected (Del)" onClick={()=>fire({action:'delete'})}>
                    <Trash2 className="w-3 h-3 mb-0.5" /> Delete
                  </button>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-0.5 text-[7px]">
                  <button className="px-1 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700" title="Selection: Object" onClick={()=>fire({action:'select-level', data:'object'})}>Obj</button>
                  <button className="px-1 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700" title="Selection: Face" onClick={()=>fire({action:'select-level', data:'face'})}>Face</button>
                  <button className="px-1 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700" title="Selection: Edge" onClick={()=>fire({action:'select-level', data:'edge'})}>Edge</button>
                  <button className="px-1 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700" title="Selection: Vertex" onClick={()=>fire({action:'select-level', data:'vertex'})}>Vert</button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Modify</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Trim edges (select edge to trim)" onClick={()=>fire({action:'trim'})}>
                    <Scissors className="w-3 h-3 mb-0.5" /> Trim
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Extend edges" onClick={()=>fire({action:'extend'})}>
                    <Maximize2 className="w-3 h-3 mb-0.5" /> Extend
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Break/Split edge" onClick={()=>fire({action:'break'})}>
                    <Slash className="w-3 h-3 mb-0.5" /> Break
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Stretch geometry" onClick={()=>fire({action:'stretch'})}>
                    <Expand className="w-3 h-3 mb-0.5" /> Stretch
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Fillet</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Fillet edges (radius 0.1m)" onClick={()=>fire({action:'fillet', data:{radius:0.1}})}>
                    <Radius className="w-3 h-3 mb-0.5" /> Fillet
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Chamfer edges (0.05m)" onClick={()=>fire({action:'chamfer', data:{distance:0.05}})}>
                    <Slash className="w-3 h-3 mb-0.5" /> Chamfer
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Generate</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Revolve selected sketch (polyline) around Y" onClick={()=>fire({action:'revolve'})}>
                    <RotateCw className="w-3 h-3 mb-0.5" /> Revolve
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Sweep profile along sketch path (tube)" onClick={()=>fire({action:'sweep'})}>
                    <PenTool className="w-3 h-3 mb-0.5" /> Sweep
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Draw</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Line tool (shortcut: L)" onClick={()=>fire({action:'tool', data:'line'})}>
                    <Minus className="w-3 h-3 mb-0.5" /> Line
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Rectangle tool" onClick={()=>fire({action:'tool', data:'rect'})}>
                    <Square className="w-3 h-3 mb-0.5" /> Rect
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Circle tool" onClick={()=>fire({action:'tool', data:'circle'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Circle
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Polyline tool" onClick={()=>fire({action:'tool', data:'polyline'})}>
                    <PenLine className="w-3 h-3 mb-0.5" /> Polyline
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Solid</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Extrude selected face or sketch (1m)" onClick={()=>fire({action:'extrude', data:1})}>
                    <Plus className="w-3 h-3 mb-0.5" /> Extrude
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Linear array (x5)" onClick={()=>fire({action:'array', data:{ type:'linear', count:5, offset:[2,0,0] }})}>
                    <Copy className="w-3 h-3 mb-0.5" /> Array
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Mirror across YZ plane" onClick={()=>fire({action:'mirror', data:{ plane:'yz' }})}>
                    <RotateCcw className="w-3 h-3 mb-0.5" /> Mirror
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Boolean</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Union (select A then B)" onClick={()=>fire({action:'boolean', data:'union'})}>
                    <Plus className="w-3 h-3 mb-0.5" /> Union
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Subtract (A - B)" onClick={()=>fire({action:'boolean', data:'subtract'})}>
                    <Minus className="w-3 h-3 mb-0.5" /> Sub
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Intersect (A ∩ B)" onClick={()=>fire({action:'boolean', data:'intersect'})}>
                    <RotateCw className="w-3 h-3 mb-0.5" /> Int
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Surface</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Subdivision smooth (selected object)" onClick={()=>fire({action:'smooth', data:{ levels: 1 }})}>
                    <Zap className="w-3 h-3 mb-0.5" /> Smooth
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Slice with plane (Y=0)" onClick={()=>fire({action:'slice', data:{ plane:{ normal:[0,1,0], offset:0 } }})}>
                    <Minus className="w-3 h-3 mb-0.5" /> Slice
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Group</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Group selected" onClick={()=>fire({action:'group'})}>
                    <Layers className="w-3 h-3 mb-0.5" /> Group
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Ungroup selected" onClick={()=>fire({action:'ungroup'})}>
                    <Layers className="w-3 h-3 mb-0.5" /> Ungroup
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab==='insert' && (
            <div className="flex overflow-x-auto">
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Primitives</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add box" onClick={()=>fire({action:'add-primitive', data:'box'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Box
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add sphere" onClick={()=>fire({action:'add-primitive', data:'sphere'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Sphere
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add cylinder" onClick={()=>fire({action:'add-primitive', data:'cylinder'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Cylinder
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Create Tube (hollow cylinder)" onClick={()=>fire({action:'add-primitive', data:'tube'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Tube
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Profiles</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="H-Beam (Wide Flange)" onClick={()=>fire({action:'add-primitive', data:'hbeam'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> H-Beam
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="I-Beam (Standard)" onClick={()=>fire({action:'add-primitive', data:'ibeam'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> I-Beam
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="C-Channel" onClick={()=>fire({action:'add-primitive', data:'cchannel'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Channel
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Pipe" onClick={()=>fire({action:'add-primitive', data:'pipe'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Pipe
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Tank" onClick={()=>fire({action:'add-primitive', data:'tank'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Tank
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Vessel" onClick={()=>fire({action:'add-primitive', data:'vessel'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Vessel
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">3D Cranes</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-yellow-700/60 w-14 h-12 text-[8px] text-yellow-300 flex flex-col items-center justify-center font-bold" title="Liebherr LTM 1055-3.1 (55t, 3-axle)" onClick={()=>fire({action:'insert-ltm1055'})}>
                    <BoxIcon className="w-4 h-4 mb-0.5" /> LTM 1055
                  </button>
                  <button className="p-1 rounded hover:bg-yellow-700/60 w-14 h-12 text-[8px] text-yellow-300 flex flex-col items-center justify-center font-bold" title="Liebherr LTM 1300-6.2 (300t, 6-axle)" onClick={()=>fire({action:'insert-ltm1300'})}>
                    <BoxIcon className="w-4 h-4 mb-0.5" /> LTM 1300
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Crane Parts</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Crane chassis with wheels" onClick={()=>fire({action:'add-crane-part', data:'base'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Chassis
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Operator cab" onClick={()=>fire({action:'add-crane-part', data:'cab'})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Cab
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add wheel" onClick={()=>fire({action:'add-crane-part', data:'wheel'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Wheel
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Boom & Jib</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add boom (30m, 45°)" onClick={()=>fire({action:'add-boom', data:{length:30, angle:45}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Boom
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add jib (10m)" onClick={()=>fire({action:'add-jib', data:{length:10, angle:0}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Jib
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Rigging</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add hoist (50t)" onClick={()=>fire({action:'add-hoist', data:{capacity:50, ropeCount:4}})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Hoist
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add hook block" onClick={()=>fire({action:'add-hook', data:{size:1, sheaveCount:4}})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Hook
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add load (50t)" onClick={()=>fire({action:'add-load', data:{mass:50, dimensions:[2,2,2]}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Load
                  </button>
                  <button className="p-1 rounded hover:bg-yellow-700/60 w-12 h-12 text-[8px] text-yellow-300 flex flex-col items-center justify-center" title="Open rigging equipment library" onClick={()=>fire({action:'show-rigging-library'})}>
                    <Link2 className="w-3 h-3 mb-0.5" /> Library
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Support</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add counterweight (100t)" onClick={()=>fire({action:'add-counterweight', data:{mass:100}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> CW
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add outriggers (4x)" onClick={()=>fire({action:'add-outrigger', data:{extension:5, count:4}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Outrigger
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add trolley (50t)" onClick={()=>fire({action:'add-trolley', data:{capacity:50}})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Trolley
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add scaffolding structure" onClick={()=>fire({action:'add-scaffolding', data:{height:10, width:3, depth:2, levels:4}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Scaffold
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add single pole (for cathead)" onClick={()=>fire({action:'add-single-pole', data:{height:10, diameter:0.1}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Pole
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add unit beam" onClick={()=>fire({action:'add-unit-beam', data:{length:3, width:0.08, height:0.08}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Beam
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Cab</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add cab window (rectangular)" onClick={()=>fire({action:'add-window', data:{windowKind:'rect', paneSize:[1.2, 0.8, 0.02]}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Window
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add windshield (curved)" onClick={()=>fire({action:'add-window', data:{windowKind:'windshield', paneSize:[1.5, 0.9, 0.02], curvature:2}})}>
                    <BoxIcon className="w-3 h-3 mb-0.5" /> Windshield
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Professional</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Realistic wheel with tread (1.2m)" onClick={()=>fire({action:'add-professional', data:'wheel'})}>
                    <Hexagon className="w-3 h-3 mb-0.5" /> Wheel
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="DIN-standard hook (100t)" onClick={()=>fire({action:'add-professional', data:'hook'})}>
                    <Anchor className="w-3 h-3 mb-0.5" /> Hook
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Wire rope (5m)" onClick={()=>fire({action:'add-professional', data:'rope'})}>
                    <Link2 className="w-3 h-3 mb-0.5" /> Rope
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Hoist drum with rope" onClick={()=>fire({action:'add-professional', data:'drum'})}>
                    <Cog className="w-3 h-3 mb-0.5" /> Drum
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Boom head connection" onClick={()=>fire({action:'add-professional', data:'boom-head'})}>
                    <Zap className="w-3 h-3 mb-0.5" /> Head
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab==='view' && (
            <div className="flex overflow-x-auto">
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Display</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Toggle grid (shortcut: G)" onClick={()=>fire({action:'toggle-grid'})}>
                    <Grid className="w-3 h-3 mb-0.5" /> Grid
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Toggle snap (shortcut: N)" onClick={()=>fire({action:'toggle-snap'})}>
                    <Magnet className="w-3 h-3 mb-0.5" /> Snap
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Toggle precision (0.1m vs 1m)" onClick={()=>fire({action:'toggle-precision'})}>
                    <Grid className="w-3 h-3 mb-0.5" /> Precision
                  </button>
                </div>
              </div>
              <div className="flex flex-col border-r border-gray-600 px-2 py-2">
                <div className="text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">Detailing</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add cab window" onClick={()=>fire({action:'add-window'})}>
                    <Square className="w-3 h-3 mb-0.5" /> Window
                  </button>
                  <button className="p-1 rounded hover:bg-gray-700/60 w-12 h-12 text-[8px] text-gray-300 flex flex-col items-center justify-center" title="Add hook block assembly" onClick={()=>fire({action:'add-hook-block'})}>
                    <Circle className="w-3 h-3 mb-0.5" /> Hook
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
