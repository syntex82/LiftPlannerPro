"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Save, Undo, Redo, ZoomIn, ZoomOut, Move, Move3d, Square, Circle, Minus,
  Grid, MousePointer, Home, Settings, Download, Type, Ruler, Eye, EyeOff,
  Lock, Unlock, Layers, Spline, RotateCcw, RotateCw, Scale, Target, Crosshair,
  Brain, RefreshCw, Calculator, Maximize2, Trash2, Plus, Copy, Edit3, Palette,
  ChevronDown, Upload, Image, X, Library, Truck, ChevronRight, Zap, Magnet,
  Terminal, FileText, Scissors, Repeat2, Link, ArrowRight, Radius, Zap as ZapIcon,
  Hexagon, Droplet, Slash, Expand, AlignLeft, Pipette, Download as DownloadIcon,
  Network, MapPin, Users, Link2, Factory
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CADRibbonProps {
  tool: string
  setTool: (tool: string) => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onSave: () => void
  onAnalyze: () => void
  onExport: (format: string) => void
  onShowCraneLibrary: () => void
  onShowConfigurableCrane?: () => void
  onShowCraneBuilder?: () => void
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  snapToGrid: boolean
  setSnapToGrid: (snap: boolean) => void
  snapToObjects: boolean
  setSnapToObjects: (snap: boolean) => void
  canUndo: boolean
  canRedo: boolean
  isSaving: boolean
  isAnalyzing: boolean
  zoom: number
  // Professional feature callbacks
  onShowAdvancedSnapping?: () => void
  onShowMeasurements?: () => void
  onShowTransformation?: () => void
  onShowCommandLine?: () => void
  onShowProfessionalFeatures?: () => void
  // Advanced CAD tool callbacks
  onTrim?: () => void
  onMirror?: () => void
  onJoin?: () => void
  onOffset?: () => void
  onFillet?: () => void
  onChamfer?: () => void
  onArray?: () => void
  onImport?: () => void
  // Library callbacks
  onImportLibrary?: () => void
  onLoadLibrary?: () => void
  onNetToProjects?: () => void
  onShowScenarioLibrary?: () => void
  onShowPersonnelLibrary?: () => void
  onShowRiggingLibrary?: () => void
  onShowSiteObjectsLibrary?: () => void
  onShowChainBlockDialog?: () => void
  // Google Maps integration
  onImportLocation?: () => void
}

type TabType = 'file' | 'draw' | 'modify' | 'annotate' | 'view' | 'insert' | 'tools' | 'professional'

export default function CADRibbon({
  tool,
  setTool,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onSave,
  onAnalyze,
  onExport,
  onShowCraneLibrary,
  onShowConfigurableCrane,
  onShowCraneBuilder,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  snapToObjects,
  setSnapToObjects,
  canUndo,
  canRedo,
  isSaving,
  isAnalyzing,
  zoom,
  onShowAdvancedSnapping,
  onShowMeasurements,
  onShowTransformation,
  onShowCommandLine,
  onShowProfessionalFeatures,
  onTrim,
  onMirror,
  onJoin,
  onOffset,
  onFillet,
  onChamfer,
  onArray,
  onImport,
  onShowScenarioLibrary,
  onShowPersonnelLibrary,
  onShowRiggingLibrary,
  onShowSiteObjectsLibrary,
  onShowChainBlockDialog,
  onImportLocation,
}: CADRibbonProps) {
  const [activeTab, setActiveTab] = useState<TabType>('draw')

  const tabs: { id: TabType; label: string }[] = [
    { id: 'file', label: 'File' },
    { id: 'draw', label: 'Draw' },
    { id: 'modify', label: 'Modify' },
    { id: 'annotate', label: 'Annotate' },
    { id: 'insert', label: 'Insert' },
    { id: 'view', label: 'View' },
    { id: 'tools', label: 'Tools' },
    { id: 'professional', label: 'Professional' },
  ]

  const RibbonButton = ({ icon, label, onClick, active = false, disabled = false, title = "" }: any) => (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex flex-col items-center justify-center h-16 px-3 text-xs"
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] leading-tight">{label}</span>
    </Button>
  )

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-slate-700 bg-slate-900 px-2 h-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-slate-800 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="flex items-center h-20 px-2 overflow-x-auto gap-1">
        {/* File Tab */}
        {activeTab === 'file' && (
          <>
            <RibbonButton
              icon={<Save className="w-5 h-5" />}
              label="Save"
              onClick={onSave}
              disabled={isSaving}
              title="Save project"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Upload className="w-5 h-5" />}
              label="Import"
              onClick={onImport}
              title="Import DXF/DWG file"
            />
            <RibbonButton
              icon={<Download className="w-5 h-5" />}
              label="Export"
              onClick={() => onExport('png')}
              title="Export drawing"
            />
          </>
        )}

        {/* Draw Tab */}
        {activeTab === 'draw' && (
          <>
            <RibbonButton
              icon={<Minus className="w-5 h-5" />}
              label="Line"
              onClick={() => setTool('line')}
              active={tool === 'line'}
              title="Draw lines"
            />
            <RibbonButton
              icon={<Square className="w-5 h-5" />}
              label="Rectangle"
              onClick={() => setTool('rectangle')}
              active={tool === 'rectangle'}
              title="Draw rectangles"
            />
            <RibbonButton
              icon={<Circle className="w-5 h-5" />}
              label="Circle"
              onClick={() => setTool('circle')}
              active={tool === 'circle'}
              title="Draw circles"
            />
            <RibbonButton
              icon={<Spline className="w-5 h-5" />}
              label="Polyline"
              onClick={() => setTool('polyline')}
              active={tool === 'polyline'}
              title="Draw polylines"
            />
            <RibbonButton
              icon={<RotateCcw className="w-5 h-5" />}
              label="Arc"
              onClick={() => setTool('arc')}
              active={tool === 'arc'}
              title="Draw arcs"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            {/* Dimension Tools */}
            <RibbonButton
              icon={<Ruler className="w-5 h-5" />}
              label="Dimension (m)"
              onClick={() => setTool('dimension')}
              active={tool === 'dimension'}
              title="Add linear dimensions in meters"
            />
            <RibbonButton
              icon={<Ruler className="w-5 h-5" />}
              label="Dimension (px)"
              onClick={() => setTool('dimensionPixels')}
              active={tool === 'dimensionPixels'}
              title="Add linear dimensions in pixels"
            />
            <RibbonButton
              icon={<RotateCw className="w-5 h-5" />}
              label="Angular"
              onClick={() => setTool('angularDim')}
              active={tool === 'angularDim'}
              title="Add angular dimensions"
            />
            <RibbonButton
              icon={<Target className="w-5 h-5" />}
              label="Radial"
              onClick={() => setTool('radialDim')}
              active={tool === 'radialDim'}
              title="Add radial dimensions"
            />
          </>
        )}

        {/* Modify Tab */}
        {activeTab === 'modify' && (
          <>
            <RibbonButton
              icon={<MousePointer className="w-5 h-5" />}
              label="Select"
              onClick={() => setTool('select')}
              active={tool === 'select'}
              title="Select objects"
            />
            <RibbonButton
              icon={<Move3d className="w-5 h-5" />}
              label="Move"
              onClick={() => setTool('move')}
              active={tool === 'move'}
              title="Move objects"
            />
            <RibbonButton
              icon={<RotateCw className="w-5 h-5" />}
              label="Rotate"
              onClick={() => setTool('rotate')}
              active={tool === 'rotate'}
              title="Rotate objects"
            />
            <RibbonButton
              icon={<Scale className="w-5 h-5" />}
              label="Scale"
              onClick={() => setTool('scale')}
              active={tool === 'scale'}
              title="Scale objects"
            />
            <RibbonButton
              icon={<Copy className="w-5 h-5" />}
              label="Copy"
              onClick={() => setTool('copy')}
              active={tool === 'copy'}
              title="Copy objects"
            />
            <RibbonButton
              icon={<Trash2 className="w-5 h-5" />}
              label="Delete"
              onClick={() => setTool('delete')}
              active={tool === 'delete'}
              title="Delete objects"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            {/* Advanced CAD Tools */}
            <RibbonButton
              icon={<Scissors className="w-5 h-5" />}
              label="Trim"
              onClick={onTrim}
              title="Trim objects at intersections"
            />
            <RibbonButton
              icon={<Repeat2 className="w-5 h-5" />}
              label="Mirror"
              onClick={onMirror}
              title="Mirror objects across axis"
            />
            <RibbonButton
              icon={<Link className="w-5 h-5" />}
              label="Join"
              onClick={onJoin}
              title="Join connected elements"
            />
            <RibbonButton
              icon={<ArrowRight className="w-5 h-5" />}
              label="Offset"
              onClick={onOffset}
              title="Offset objects by distance"
            />
            <RibbonButton
              icon={<Radius className="w-5 h-5" />}
              label="Fillet"
              onClick={onFillet}
              title="Add rounded corners"
            />
            <RibbonButton
              icon={<ZapIcon className="w-5 h-5" />}
              label="Chamfer"
              onClick={onChamfer}
              title="Add beveled corners"
            />
            <RibbonButton
              icon={<Plus className="w-5 h-5" />}
              label="Array"
              onClick={onArray}
              title="Create rectangular or polar array"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            {/* Additional Modification Tools */}
            <RibbonButton
              icon={<ArrowRight className="w-5 h-5" />}
              label="Extend"
              onClick={() => setTool('extend')}
              active={tool === 'extend'}
              title="Extend lines to intersection"
            />
            <RibbonButton
              icon={<Slash className="w-5 h-5" />}
              label="Break"
              onClick={() => setTool('break')}
              active={tool === 'break'}
              title="Break/split elements"
            />
            <RibbonButton
              icon={<Expand className="w-5 h-5" />}
              label="Stretch"
              onClick={() => setTool('stretch')}
              active={tool === 'stretch'}
              title="Stretch selected elements"
            />
            <RibbonButton
              icon={<AlignLeft className="w-5 h-5" />}
              label="Align"
              onClick={() => setTool('align')}
              active={tool === 'align'}
              title="Align objects"
            />
            <RibbonButton
              icon={<Pipette className="w-5 h-5" />}
              label="Match Props"
              onClick={() => setTool('matchProps')}
              active={tool === 'matchProps'}
              title="Match object properties"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Undo className="w-5 h-5" />}
              label="Undo"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo last action"
            />
            <RibbonButton
              icon={<Redo className="w-5 h-5" />}
              label="Redo"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo last action"
            />
          </>
        )}

        {/* Annotate Tab */}
        {activeTab === 'annotate' && (
          <>
            <RibbonButton
              icon={<Type className="w-5 h-5" />}
              label="Text"
              onClick={() => setTool('text')}
              active={tool === 'text'}
              title="Add text"
            />
            <RibbonButton
              icon={<Ruler className="w-5 h-5" />}
              label="Dimension"
              onClick={() => setTool('dimension')}
              active={tool === 'dimension'}
              title="Add dimensions"
            />
            <RibbonButton
              icon={<Grid className="w-5 h-5" />}
              label="Table"
              onClick={() => setTool('table')}
              active={tool === 'table'}
              title="Insert table"
            />
            <RibbonButton
              icon={<Square className="w-5 h-5" />}
              label="Title Block"
              onClick={() => setTool('titleblock')}
              active={tool === 'titleblock'}
              title="Insert title block"
            />
          </>
        )}

        {/* Insert Tab */}
        {activeTab === 'insert' && (
          <>
            <RibbonButton
              icon={<Palette className="w-5 h-5" />}
              label="Logo"
              onClick={() => setTool('logo')}
              active={tool === 'logo'}
              title="Insert logo"
            />
            <RibbonButton
              icon={<Image className="w-5 h-5" />}
              label="Image"
              onClick={() => setTool('image')}
              active={tool === 'image'}
              title="Insert image"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Truck className="w-5 h-5" />}
              label="Crane"
              onClick={onShowCraneLibrary}
              title="Insert crane from library"
            />
            <RibbonButton
              icon={<Plus className="w-5 h-5" />}
              label="Custom"
              onClick={onShowConfigurableCrane}
              title="Create custom crane"
            />
            <RibbonButton
              icon={<Truck className="w-5 h-5" />}
              label="Build Crane"
              onClick={onShowCraneBuilder}
              title="Build custom 2D crane"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Library className="w-5 h-5" />}
              label="Scenario"
              onClick={() => {
                onShowScenarioLibrary?.()
              }}
              title="Insert scenario objects (buildings, vessels, etc)"
            />
            <RibbonButton
              icon={<Users className="w-5 h-5" />}
              label="Personnel"
              onClick={() => onShowPersonnelLibrary?.()}
              title="Insert lifting personnel (slingers, signallers, riggers)"
            />
            <RibbonButton
              icon={<Link2 className="w-5 h-5" />}
              label="Rigging"
              onClick={() => onShowRiggingLibrary?.()}
              title="Insert rigging equipment (shackles, hooks, slings)"
            />
            <RibbonButton
              icon={<Factory className="w-5 h-5" />}
              label="Site Objects"
              onClick={() => onShowSiteObjectsLibrary?.()}
              title="Insert industrial equipment (vessels, exchangers, pumps, etc.)"
            />
            <RibbonButton
              icon={<Link className="w-5 h-5" />}
              label="Chain Block"
              onClick={() => onShowChainBlockDialog?.()}
              title="Insert configurable chain block/hoist"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<MapPin className="w-5 h-5" />}
              label="Location"
              onClick={onImportLocation}
              title="Import location from Google Maps (satellite imagery, terrain, buildings)"
            />
          </>
        )}

        {/* View Tab */}
        {activeTab === 'view' && (
          <>
            <RibbonButton
              icon={<Move className="w-5 h-5" />}
              label="Pan"
              onClick={() => setTool('pan')}
              active={tool === 'pan'}
              title="Pan view"
            />
            <RibbonButton
              icon={<ZoomIn className="w-5 h-5" />}
              label="Zoom In"
              onClick={onZoomIn}
              title="Zoom in"
            />
            <RibbonButton
              icon={<ZoomOut className="w-5 h-5" />}
              label="Zoom Out"
              onClick={onZoomOut}
              title="Zoom out"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={showGrid ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              label="Grid"
              onClick={() => setShowGrid(!showGrid)}
              active={showGrid}
              title="Toggle grid"
            />
            <RibbonButton
              icon={<Target className="w-5 h-5" />}
              label="Snap Grid"
              onClick={() => setSnapToGrid(!snapToGrid)}
              active={snapToGrid}
              title="Toggle snap to grid"
            />
            <RibbonButton
              icon={<Crosshair className="w-5 h-5" />}
              label="Snap Objects"
              onClick={() => setSnapToObjects(!snapToObjects)}
              active={snapToObjects}
              title="Toggle snap to objects"
            />
          </>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <>
            <RibbonButton
              icon={<Magnet className="w-5 h-5" />}
              label="Advanced Snap"
              onClick={() => onShowAdvancedSnapping?.()}
              title="Advanced snapping modes"
            />
            <RibbonButton
              icon={<Ruler className="w-5 h-5" />}
              label="Measurements"
              onClick={() => onShowMeasurements?.()}
              title="Measurement and analysis tools"
            />
            <RibbonButton
              icon={<RotateCw className="w-5 h-5" />}
              label="Transform"
              onClick={() => onShowTransformation?.()}
              title="Mirror, offset, array operations"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Terminal className="w-5 h-5" />}
              label="Command Line"
              onClick={() => onShowCommandLine?.()}
              title="Open command line interface"
            />
            <RibbonButton
              icon={<Calculator className="w-5 h-5" />}
              label="Calculator"
              onClick={() => {/* Open calculator */}}
              title="Open calculator"
            />
          </>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <>
            <RibbonButton
              icon={<FileText className="w-5 h-5" />}
              label="Templates"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Drawing templates and standards"
            />
            <RibbonButton
              icon={<Download className="w-5 h-5" />}
              label="Export DXF"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Export drawing as DXF"
            />
            <RibbonButton
              icon={<Download className="w-5 h-5" />}
              label="Export PDF"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Export drawing as PDF"
            />
            <RibbonButton
              icon={<Upload className="w-5 h-5" />}
              label="Import DXF"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Import DXF file"
            />
            <div className="border-r border-slate-700 h-12 mx-1"></div>
            <RibbonButton
              icon={<Layers className="w-5 h-5" />}
              label="Layers"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Manage layers"
            />
            <RibbonButton
              icon={<Library className="w-5 h-5" />}
              label="Blocks"
              onClick={() => onShowProfessionalFeatures?.()}
              title="Block library"
            />
          </>
        )}
      </div>
    </div>
  )
}

