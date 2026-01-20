"use client";

import React, { useState } from "react";
import { FilePlus, FolderOpen, Save, MousePointer, Move, RotateCw, Expand, Copy, Trash2, Settings, Terminal, Grid, Magnet, Box as BoxIcon, Circle, PenLine, Square, PenTool, Zap, Minus, Plus, RotateCcw, Layers, Eye, EyeOff } from "lucide-react";

export default function Ribbon() {
  const [activeTab, setActiveTab] = useState<'file'|'modeling'|'insert'|'profiles'|'view'>('modeling');

  const fire = (eventDetail: any) => {
    console.log('fire() called with:', eventDetail);
    window.dispatchEvent(new CustomEvent('cad3d:modeler', { detail: eventDetail }));
  };
  
  const fireFile = (detail: any) => window.dispatchEvent(new CustomEvent('cad3d:file', { detail }));

  const onOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cad3d.json,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        fire({ action: 'load', data });
      } catch {
        alert('Invalid project file');
      }
    };
    input.click();
  };

  const onSave = () => fire({ action: 'save' });

  const tabs = [
    ['file','FILE'],
    ['modeling','Modeling'],
    ['insert','Insert'],
    ['profiles','Profiles'],
    ['view','View'],
  ];

  return (
    <div className="sticky top-0 z-[10000] w-full select-none pointer-events-auto">
      <div className="h-8 bg-gradient-to-b from-gray-700 to-gray-800 border-b border-gray-600 flex items-center px-2">
        {tabs.map(([k,label]) => (
          <button key={k}
            title={`Open ${label} tab`}
            className={`px-4 py-1 text-sm font-medium rounded-t transition-colors ${activeTab===k?'bg-gray-800 border border-gray-600 border-b-0 text-gray-200':'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
            onClick={()=>setActiveTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 border-b border-gray-600">
        {activeTab==='file' && (
          <div className="flex">
            <div className="flex flex-col border-r border-gray-600 px-2 py-2">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">File</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="New project" onClick={()=>fire({action:'new'})}>
                  <FilePlus className="w-4 h-4 mb-1" /> New
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Open project" onClick={onOpen}>
                  <FolderOpen className="w-4 h-4 mb-1" /> Open
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Save project" onClick={onSave}>
                  <Save className="w-4 h-4 mb-1" /> Save
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab==='modeling' && (
          <div className="flex">
            <div className="flex flex-col border-r border-gray-600 px-2 py-2">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Tools</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Select tool" onClick={()=>fire({action:'tool', data:'select'})}>
                  <MousePointer className="w-4 h-4 mb-1" /> Select
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Move tool" onClick={()=>fire({action:'tool', data:'move'})}>
                  <Move className="w-4 h-4 mb-1" /> Move
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Rotate tool" onClick={()=>fire({action:'tool', data:'rotate'})}>
                  <RotateCw className="w-4 h-4 mb-1" /> Rotate
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Scale tool" onClick={()=>fire({action:'tool', data:'scale'})}>
                  <Expand className="w-4 h-4 mb-1" /> Scale
                </button>
              </div>
            </div>
            <div className="flex flex-col border-r border-gray-600 px-2 py-2">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Draw</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Line tool" onClick={()=>fire({action:'tool', data:'line'})}>
                  <Minus className="w-4 h-4 mb-1" /> Line
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Rectangle tool" onClick={()=>fire({action:'tool', data:'rect'})}>
                  <Square className="w-4 h-4 mb-1" /> Rect
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Circle tool" onClick={()=>fire({action:'tool', data:'circle'})}>
                  <Circle className="w-4 h-4 mb-1" /> Circle
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab==='profiles' && (
          <div className="flex">
            <div className="flex flex-col border-r border-gray-600 px-2 py-2 w-[300px]">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Crane Parts</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Crane chassis with wheels" onClick={()=>fire({action:'add-crane-part', data:'base'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Chassis
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Boom section" onClick={()=>fire({action:'add-crane-part', data:'boom'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Boom
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Operator cab" onClick={()=>fire({action:'add-crane-part', data:'cab'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Cab
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Hook block" onClick={()=>fire({action:'add-crane-part', data:'hook'})}>
                  <Circle className="w-4 h-4 mb-1" /> Hook
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Add wheel" onClick={()=>fire({action:'add-crane-part', data:'wheel'})}>
                  <Circle className="w-4 h-4 mb-1" /> Wheel
                </button>
              </div>
            </div>

            <div className="flex flex-col border-r border-gray-600 px-2 py-2 w-[360px]">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Buildings</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Office building" onClick={()=>fire({action:'add-building', data:'office'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Office
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Warehouse building" onClick={()=>fire({action:'add-building', data:'warehouse'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Warehouse
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Residential tower" onClick={()=>fire({action:'add-building', data:'residential'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Residential
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Industrial facility" onClick={()=>fire({action:'add-building', data:'industrial'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Industrial
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Hospital building" onClick={()=>fire({action:'add-building', data:'hospital'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Hospital
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="School building" onClick={()=>fire({action:'add-building', data:'school'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> School
                </button>
              </div>
            </div>

            <div className="flex flex-col border-r border-gray-600 px-2 py-2 w-[360px]">
              <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Superstructures</div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Steel beam" onClick={()=>fire({action:'add-structure', data:'beam'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Beam
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Steel column" onClick={()=>fire({action:'add-structure', data:'column'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Column
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Truss section" onClick={()=>fire({action:'add-structure', data:'truss'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Truss
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Bridge section" onClick={()=>fire({action:'add-structure', data:'bridge'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Bridge
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Tower crane" onClick={()=>fire({action:'add-structure', data:'tower-crane'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Tower
                </button>
                <button className="p-2 rounded hover:bg-gray-700/60 w-[55px] h-14 text-[9px] text-gray-300 flex flex-col items-center justify-center" title="Precast panel" onClick={()=>fire({action:'add-structure', data:'panel'})}>
                  <BoxIcon className="w-4 h-4 mb-1" /> Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
