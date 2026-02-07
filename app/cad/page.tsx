"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { trackPageView, trackCADOperation, trackUserInteraction } from '@/components/analytics/google-analytics'
import { useSmartMonetization } from '@/hooks/useSmartMonetization'
import SmartUpgradePrompt from '@/components/monetization/SmartUpgradePrompt'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import CADChatSidebar from "@/components/Chat/CADChatSidebar"
import { DeviceNotification } from "@/components/ui/device-notification"
import CraneLibrary from "@/components/cad/CraneLibrarySimple"
import CraneConfigDialog from "@/components/cad/CraneConfigDialog"
import TandemCraneConfigDialog from "@/components/cad/TandemCraneConfigDialog"
import WireframeCraneConfigDialog from "@/components/cad/WireframeCraneConfigDialog"
import ConfigurableCraneDialog from "@/components/cad/ConfigurableCraneDialog"
import CranePartsBuilder from "@/components/cad/CranePartsBuilder"
import { AssembledCrane } from '@/lib/crane-builder-generator'
import CADRibbon from "@/components/cad/CADRibbon"
import AdvancedSnappingPanel from "@/components/cad/AdvancedSnappingPanel"
import MeasurementAnalysisPanel from "@/components/cad/MeasurementAnalysisPanel"
import TransformationToolsPanel from "@/components/cad/TransformationToolsPanel"
import CommandLineInterface from "@/components/cad/CommandLineInterface"
import ProfessionalFeaturesPanel from "@/components/cad/ProfessionalFeaturesPanel"
import CADExportDialog from "@/components/cad/CADExportDialog"
import CADImportDialog from "@/components/cad/CADImportDialog"
import LiftingScenarioLibrary from "@/components/cad/LiftingScenarioLibrary"
import PersonnelLibrary from "@/components/cad/PersonnelLibrary"
import ChainBlockConfigDialog from "@/components/cad/ChainBlockConfigDialog"
import { drawChainBlock } from "@/lib/chain-blocks"
import { useAutoSave } from "@/hooks/useAutoSave"
import { RecoveryDialog } from "@/components/cad/RecoveryDialog"
import { TemplateLibrary } from "@/components/cad/TemplateLibrary"
import { DrawingTemplate } from "@/lib/drawing-templates"
import { GroundBearingCalculator } from "@/components/cad/GroundBearingCalculator"
import LeafletMapImportDialog from "@/components/cad/LeafletMapImportDialog"
import { MapLocationData, MapLayer } from "@/lib/google-maps-cad"

import { CraneSpecifications } from "@/lib/crane-models"
import { exportDrawing } from "@/lib/cad-2d-export"
import { getDefaultPrintLayout } from "@/lib/cad-paper-sizes"
import { drawWireframeMobileCrane, drawWireframeTowerCrane, drawWireframeCrawlerCrane, drawWireframeMobileCranePlanView, CraneDrawingConfig } from "@/lib/wireframe-cranes"

// Horizontal ribbon refactor for improved CAD interface
import { DesktopRecommendation } from "@/components/ui/desktop-recommendation"
import { useDeviceDetection } from "@/lib/deviceDetection"
import {
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Move3d,
  Square,
  Circle,
  Minus,
  Grid,
  MousePointer,
  Home,
  Settings,
  Download,
  ChevronDown,
  Type,
  Ruler,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  Spline,
  RotateCcw,
  RotateCw,
  Scale,
  Target,
  Crosshair,
  Brain,
  RefreshCw,
  Calculator,
  Square as AreaIcon,
  Trash2,
  Plus,
  Copy,
  Edit3,
  Palette,
  ChevronRight,
  Upload,
  Image,
  X,
  Library,
  Truck,
  Magnet,
  Repeat2,
  Terminal
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import NextImage from "next/image"
import Link from "next/link"

interface Point {
  x: number
  y: number
}

interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  color: string
  opacity?: number
  lineWeight?: number
  description?: string
}

interface DrawingElement {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'dimension' | 'arcDimension' | 'text' | 'polyline' | 'arc' | 'spline' | 'table' | 'titleblock' | 'logo' | 'image' | 'block' | 'assembled-crane'
  points: Point[]
  style: {
    stroke: string
    strokeWidth: number
    fill?: string
    fillOpacity?: number
    lineType?: 'solid' | 'dashed' | 'dotted'
    lineCap?: 'butt' | 'round' | 'square'
    lineJoin?: 'miter' | 'round' | 'bevel'
    fontSize?: number
    fontFamily?: string
  }
  layer: string
  text?: string
  fontSize?: number
  fontFamily?: string
  locked?: boolean
  closed?: boolean
  radius?: number
  startAngle?: number
  endAngle?: number
  controlPoints?: Point[]
  // Table properties
  rows?: number
  columns?: number
  cellWidth?: number
  cellHeight?: number
  tableData?: string[][]
  headers?: string[]
  headerStyle?: {
    backgroundColor?: string
    textColor?: string
    fontSize?: number
    fontWeight?: string
  }
  cellStyle?: {
    backgroundColor?: string
    textColor?: string
    fontSize?: number
    fontWeight?: string
  }
  // Arc dimension properties
  showDegrees?: boolean
  // Title block properties
  titleBlockType?: 'standard' | 'detailed' | 'custom'
  projectInfo?: {
    title?: string
    projectNumber?: string
    drawnBy?: string
    checkedBy?: string
    date?: string
    scale?: string
    revision?: string
    sheet?: string
    company?: string
  }
  // Logo properties
  logoUrl?: string
  logoWidth?: number
  logoHeight?: number
  // Image properties
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  imageOpacity?: number
  // Block properties
  blockName?: string
  blockElements?: DrawingElement[]
  blockScale?: number
  blockRotation?: number
  // Crane properties
  craneData?: {
    specifications: CraneSpecifications
    boomAngle: number
    boomExtension: number
    rotation: number
    scale: number
    showLoadChart: boolean
    loadLineLength?: number
    wireframe?: boolean
    // LTM 1055 professional drawing properties
    boomSections?: number
    outriggerExtension?: number
    counterweightTons?: number
    showDimensions?: boolean
    // Tandem crane properties
    crane1?: {
      boomAngle: number
      boomExtension: number
      scale: number
      loadLineLength: number
      offsetX: number
      offsetY: number
    }
    crane2?: {
      boomAngle: number
      boomExtension: number
      scale: number
      loadLineLength: number
      offsetX: number
      offsetY: number
    }
    spacing?: number
  }
  // Assembled crane properties
  assembledCraneData?: AssembledCrane
  // Dimension type (pixels vs meters)
  isDimensionPixels?: boolean
}

function CADEditorContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Smart monetization hooks
  const {
    usage,
    userCredits,
    showUpgradePrompt,
    setShowUpgradePrompt,
    canUseFeature,
    useFeature,
    getRemainingUsage,
    getUsagePercentage,
    purchaseCredits,
    purchaseFeature,
    FREE_LIMITS
  } = useSmartMonetization()
  const [tool, setTool] = useState<'select' | 'move' | 'rotate' | 'scale' | 'line' | 'rectangle' | 'circle' | 'pan' | 'dimension' | 'dimensionPixels' | 'text' | 'polyline' | 'arc' | 'spline' | 'measure' | 'area' | 'table' | 'titleblock' | 'logo' | 'image' | 'block' | 'crane' | 'angularDim' | 'radialDim' | 'extend' | 'break' | 'stretch' | 'align' | 'matchProps' | 'copy' | 'delete'>('select')
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState<DrawingElement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [projectName, setProjectName] = useState('Untitled Project')
  const [isSaving, setIsSaving] = useState(false)
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer1', name: 'Construction', visible: true, color: '#3b82f6', locked: false, opacity: 1, lineWeight: 1, description: 'Main construction lines' },
    { id: 'layer2', name: 'Dimensions', visible: true, color: '#10b981', locked: false, opacity: 1, lineWeight: 0.5, description: 'Measurement annotations' },
    { id: 'layer3', name: 'Text', visible: true, color: '#f59e0b', locked: false, opacity: 1, lineWeight: 1, description: 'Text and labels' },
    { id: 'layer4', name: 'Hidden Lines', visible: false, color: '#6b7280', locked: false, opacity: 0.5, lineWeight: 0.25, description: 'Hidden construction lines' },
    { id: 'layer5', name: 'Center Lines', visible: true, color: '#ef4444', locked: false, opacity: 0.8, lineWeight: 0.5, description: 'Center and axis lines' }
  ])
  const [currentLayer, setCurrentLayer] = useState('layer1')
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [snapToObjects, setSnapToObjects] = useState(true)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [coordinateInput, setCoordinateInput] = useState({ x: '', y: '' })
  const [showCoordinateInput, setShowCoordinateInput] = useState(false)
  const [currentPolyline, setCurrentPolyline] = useState<Point[]>([])
  const [isDrawingPolyline, setIsDrawingPolyline] = useState(false)
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })
  const [snapPoint, setSnapPoint] = useState<Point | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [movingElement, setMovingElement] = useState<string | null>(null)
  const [moveStartPos, setMoveStartPos] = useState<{ x: number; y: number } | null>(null)
  const [rotatingElement, setRotatingElement] = useState<string | null>(null)
  const [rotationCenter, setRotationCenter] = useState<Point>({ x: 0, y: 0 })
  const [rotationStartAngle, setRotationStartAngle] = useState(0)
  const [scalingElement, setScalingElement] = useState<string | null>(null)
  const [scaleCenter, setScaleCenter] = useState<Point>({ x: 0, y: 0 })
  const [scaleStartDistance, setScaleStartDistance] = useState(0)
  const [currentScaleFactor, setCurrentScaleFactor] = useState(1)
  const [arcStep, setArcStep] = useState(0) // 0: center, 1: start point, 2: end point
  const [arcDimStep, setArcDimStep] = useState(0) // 0:center,1:start,2:end,3:placed
  const [arcDimShowDegrees, setArcDimShowDegrees] = useState(true)

  const [arcCenter, setArcCenter] = useState<Point>({ x: 0, y: 0 })
  const [arcStartPoint, setArcStartPoint] = useState<Point>({ x: 0, y: 0 })

  const [arrayConfig, setArrayConfig] = useState({
    type: 'rectangular' as 'rectangular' | 'polar',
    rows: 3,
    columns: 3,
    rowSpacing: 50,
    columnSpacing: 50,
    angle: 0,
    count: 6,
    centerPoint: null as Point | null
  })

  // Crane library states
  const [showCraneLibrary, setShowCraneLibrary] = useState(false)
  const [showConfigurableCraneDialog, setShowConfigurableCraneDialog] = useState(false)
  const [showCraneBuilderDialog, setShowCraneBuilderDialog] = useState(false)
  const [showScenarioLibrary, setShowScenarioLibrary] = useState(false)
  const [showPersonnelLibrary, setShowPersonnelLibrary] = useState(false)
  const [showChainBlockDialog, setShowChainBlockDialog] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showGroundBearingCalc, setShowGroundBearingCalc] = useState(false)
  const [showGoogleMapsImport, setShowGoogleMapsImport] = useState(false)
  const [mapLocationData, setMapLocationData] = useState<MapLocationData | null>(null)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([])
  const [selectedCrane, setSelectedCrane] = useState<CraneSpecifications | null>(null)
  const [showCraneConfig, setShowCraneConfig] = useState(false)
  const [configuringCrane, setConfiguringCrane] = useState<DrawingElement | null>(null)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickElement, setLastClickElement] = useState<string | null>(null)



  // Pan and zoom state
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number } | null>(null)
  const [panStartOffset, setPanStartOffset] = useState({ x: 0, y: 0 })

  // Drawing properties
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(1)
  const [currentStrokeColor, setCurrentStrokeColor] = useState('#000000')
  const [currentFillColor, setCurrentFillColor] = useState('transparent')
  const [currentFillOpacity, setCurrentFillOpacity] = useState(1)
  const [currentLineType, setCurrentLineType] = useState<'solid' | 'dashed' | 'dotted'>('solid')
  const [currentFontSize, setCurrentFontSize] = useState(16)
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial')
  const [showLayerManager, setShowLayerManager] = useState(false)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [textClickPosition, setTextClickPosition] = useState<Point>({ x: 100, y: 100 })
  const [tableClickPosition, setTableClickPosition] = useState<Point>({ x: 100, y: 100 })

  // Lasso selection state
  const [isLassoSelecting, setIsLassoSelecting] = useState(false)
  const [lassoPath, setLassoPath] = useState<Point[]>([])
  const [lassoStartPoint, setLassoStartPoint] = useState<Point | null>(null)

  // Advanced CAD features
  const [showRulers, setShowRulers] = useState(true)
  const [precisionMode, setPrecisionMode] = useState(false)
  const [showMeasurements, setShowMeasurements] = useState(true)
  const [snapTolerance, setSnapTolerance] = useState(10)
  const [drawingUnits, setDrawingUnits] = useState<'mm' | 'cm' | 'm' | 'in' | 'ft'>('mm')
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [drawingScale, setDrawingScale] = useState('1:1')
  const [showScaleDialog, setShowScaleDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [editingTitleBlock, setEditingTitleBlock] = useState<string | null>(null)
  const [showTitleBlockEditDialog, setShowTitleBlockEditDialog] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [showTableEditDialog, setShowTableEditDialog] = useState(false)
  const [editingCell, setEditingCell] = useState<{tableId: string, row: number, col: number} | null>(null)
  const [isDraggingTable, setIsDraggingTable] = useState(false)
  const [isDraggingTitleBlock, setIsDraggingTitleBlock] = useState(false)
  const [showTextEditDialog, setShowTextEditDialog] = useState(false)
  const [editingText, setEditingText] = useState<string | null>(null)
  const [editTextValue, setEditTextValue] = useState('')
  const [showTextPropertiesDialog, setShowTextPropertiesDialog] = useState(false)

  // Background image state
  const [backgroundImages, setBackgroundImages] = useState<DrawingElement[]>([])
  const [showImageDeleteDialog, setShowImageDeleteDialog] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)

  // Text properties state
  const [textDialogProperties, setTextDialogProperties] = useState({
    text: '',
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#ffffff'
  })
  const [showTableConfigDialog, setShowTableConfigDialog] = useState(false)
  const [tableConfig, setTableConfig] = useState({
    rows: 3,
    columns: 3,
    headers: ['Header 1', 'Header 2', 'Header 3'],
    data: [
      ['', '', ''],
      ['', '', '']
    ],
    cellWidth: 120,
    cellHeight: 30,
    headerStyle: {
      backgroundColor: '#374151',
      textColor: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold'
    },
    cellStyle: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontSize: 12,
      fontWeight: 'normal'
    }
  })
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number} | null>(null)
  const [showExportLayoutDialog, setShowExportLayoutDialog] = useState(false)
  const [exportConfig, setExportConfig] = useState({
    paperSize: 'A4',
    orientation: 'landscape' as 'portrait' | 'landscape',
    scale: 'fit' as 'fit' | 'custom',
    customScale: '1:100',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showGrid: false,
    showDimensions: true,
    showLayers: true,
    includeLogo: true,
    logoPosition: 'top-right' as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    logoSize: 'medium' as 'small' | 'medium' | 'large',
    includeTitleBlock: true,
    titleBlockPosition: 'bottom-right' as 'bottom-left' | 'bottom-right',
    includeScale: true,
    includeDate: true,
    watermark: '',
    format: 'pdf' as 'pdf' | 'png' | 'svg'
  })

  // Title block and table states
  const [showTitleBlockDialog, setShowTitleBlockDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showLogoDialog, setShowLogoDialog] = useState(false)
  const [projectInfo, setProjectInfo] = useState({
    title: 'Untitled Drawing',
    projectNumber: '',
    drawnBy: session?.user?.name || 'Engineer',
    checkedBy: '',
    date: new Date().toISOString().split('T')[0], // Format for date input
    scale: '1:1',
    revision: 'A',
    sheet: '1 of 1',
    company: 'Your Company Name'
  })
  const [logoConfig, setLogoConfig] = useState({
    url: '',
    width: 100,
    height: 50,
    originalWidth: 100,
    originalHeight: 50,
    file: null as File | null
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [panelLayout, setPanelLayout] = useState({
    leftPanel: { visible: true, width: 300, docked: true },
    rightPanel: { visible: true, width: 300, docked: true },
    bottomPanel: { visible: false, height: 200, docked: true },
    commandLine: { visible: false, height: 30, docked: true }
  })
  const [advancedCommand, setAdvancedCommand] = useState<'trim' | 'mirror' | 'array' | 'join' | null>(null)
  const [commandStep, setCommandStep] = useState(0)
  const [commandData, setCommandData] = useState<any>({})
  const [mirrorAxis, setMirrorAxis] = useState<{ start: Point; end: Point } | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Professional feature panel states
  const [showAdvancedSnappingPanel, setShowAdvancedSnappingPanel] = useState(false)
  const [showMeasurementPanel, setShowMeasurementPanel] = useState(false)
  const [showTransformationPanel, setShowTransformationPanel] = useState(false)
  const [showCommandLinePanel, setShowCommandLinePanel] = useState(false)
  const [showProfessionalFeaturesPanel, setShowProfessionalFeaturesPanel] = useState(false)

  // Snapping configuration states
  const [snapToEndpoint, setSnapToEndpoint] = useState(true)
  const [snapToMidpoint, setSnapToMidpoint] = useState(true)
  const [snapToCenter, setSnapToCenter] = useState(true)
  const [snapToIntersection, setSnapToIntersection] = useState(false)
  const [snapToPerpendicular, setSnapToPerpendicular] = useState(false)
  const [snapToTangent, setSnapToTangent] = useState(false)
  const [showSnapIndicators, setShowSnapIndicators] = useState(true)
  const [snapToleranceAdvanced, setSnapToleranceAdvanced] = useState(10)

  // Debug logging function
  const addDebugLog = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    console.log(logEntry)
    setDebugInfo(prev => [...prev.slice(-19), logEntry]) // Keep last 20 entries
  }

  // Initialize debug logging
  useEffect(() => {
    addDebugLog('🚀 CAD Editor initialized', 'success')
    addDebugLog(`Initial elements: ${elements.length}`, 'info')
    addDebugLog(`Available tools: Line, Rectangle, Circle, Polyline, Text, Trim, Mirror, Join`, 'info')
  }, [])

  // Reset tool states when switching tools
  // Auto-save hook
  const {
    lastSaved,
    hasUnsavedChanges,
    recoveryData,
    showRecoveryPrompt,
    setShowRecoveryPrompt,
    clearAutoSave,
    dismissRecovery,
    saveNow
  } = useAutoSave(
    elements,
    projectName,
    zoom,
    pan,
    layers,
    drawingScale,
    drawingUnits,
    projectInfo,
    true // enabled
  )

  // Handle recovery
  const handleRecover = useCallback(() => {
    if (recoveryData) {
      setElements(recoveryData.elements || [])
      setProjectName(recoveryData.projectName || 'Recovered Project')
      setZoom(recoveryData.zoom || 1)
      setPan(recoveryData.pan || { x: 0, y: 0 })
      if (recoveryData.layers) setLayers(recoveryData.layers)
      if (recoveryData.drawingScale) setDrawingScale(recoveryData.drawingScale)
      if (recoveryData.drawingUnits) setDrawingUnits(recoveryData.drawingUnits as any)
      if (recoveryData.projectInfo) setProjectInfo(recoveryData.projectInfo)
      clearAutoSave()
    }
  }, [recoveryData, clearAutoSave])

  // Handle loading a template
  const handleLoadTemplate = useCallback((template: DrawingTemplate) => {
    // Generate unique IDs for template elements
    const newElements = template.elements.map((el: any) => ({
      ...el,
      id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))

    setElements(newElements)
    setProjectName(template.projectInfo.title || 'New Project')
    setDrawingScale(template.drawingScale)
    setDrawingUnits(template.drawingUnits as any)
    setLayers(template.layers)
    setProjectInfo(template.projectInfo)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setShowTemplateLibrary(false)
  }, [])

  useEffect(() => {
    if (tool !== 'arc') {
      setArcStep(0)
      setArcCenter({ x: 0, y: 0 })
      setArcStartPoint({ x: 0, y: 0 })
      setCurrentElement(null)
    }

  }, [tool])

  // Block functions moved to after state declarations



  // Preload image function
  const preloadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img') as HTMLImageElement
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  // Crane handling functions
  const handleSelectCrane = (crane: CraneSpecifications) => {
    setSelectedCrane(crane)
    setTool('crane')
  }

  const handleInsertCrane = (crane: CraneSpecifications, position: { x: number, y: number }) => {
    const craneElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'block',
      points: [position],
      style: {
        stroke: crane.cadData.color,
        strokeWidth: crane.cadData.lineWeight,
        fill: crane.cadData.color + '40'
      },
      layer: currentLayer,
      locked: false,
      craneData: crane.type === 'tandem' ? {
        specifications: crane,
        boomAngle: 45,
        boomExtension: 0.5,
        rotation: 0,
        scale: 1.0,
        showLoadChart: false,
        loadLineLength: isPlanViewCrane(crane) ? 0 : 40,
        crane1: {
          boomAngle: 45,
          boomExtension: 0.5,
          scale: 1.0,
          loadLineLength: 40,
          offsetX: -100, // X position offset from center
          offsetY: 0     // Y position offset from center
        },
        crane2: {
          boomAngle: 45,
          boomExtension: 0.5,
          scale: 1.0,
          loadLineLength: 40,
          offsetX: 100,  // X position offset from center
          offsetY: 0     // Y position offset from center
        },
        spacing: 200 // Overall spacing (for quick adjustment)
      } : {
        specifications: crane,
        boomAngle: 45,
        boomExtension: 0.5,
        rotation: 0,
        scale: 1.0,
        showLoadChart: false,
        loadLineLength: isPlanViewCrane(crane) ? 0 : 40,
        wireframe: false
      }
    }

    setElements(prev => [...prev, craneElement])
    // Reset tool to select after inserting crane so drawing tools work again
    setTool('select')
    setSelectedElement(craneElement.id)
    addDebugLog(`Inserted ${crane.manufacturer} ${crane.model} crane`, 'success')
    trackCADOperation('crane_insert', `${crane.manufacturer} ${crane.model}`)
  }

  const handleCreateCustomCrane = (crane: CraneSpecifications) => {
    // Insert the custom crane at center of canvas
    const position = { x: 400, y: 300 }
    handleInsertCrane(crane, position)
    setShowConfigurableCraneDialog(false)
    addDebugLog(`Created custom crane: ${crane.model}`, 'success')
    trackCADOperation('custom_crane_create', crane.model)
  }

  // Handle creation of an assembled crane from the parts builder
  const handleCreateAssembledCrane = (assembledCrane: AssembledCrane) => {
    // Create a drawing element that wraps the assembled crane data
    const craneElement: DrawingElement = {
      id: `assembled-crane-${Date.now()}`, // Unique ID for this drawing element
      type: 'assembled-crane', // Type tells the renderer to use drawAssembledCrane
      points: [{ x: 400, y: 300 }], // Default insertion position (center of canvas)
      style: { stroke: '#FF8C00', strokeWidth: 2, fill: '#FFD700' }, // Visual styling
      layer: 'Cranes', // Place on the Cranes layer
      assembledCraneData: assembledCrane // Store the assembled crane data
    }

    // Add the new crane element to the drawing
    setElements(prev => [...prev, craneElement])

    // Close the crane builder dialog
    setShowCraneBuilderDialog(false)

    // Log the action for debugging
    addDebugLog(`Created assembled crane: ${assembledCrane.name}`, 'success')

    // Track this operation for analytics
    trackCADOperation('assembled_crane_create', assembledCrane.name)
  }

  const handleConfigureCrane = (element: DrawingElement) => {
    if (element.craneData) {
      setConfiguringCrane(element)
      setShowCraneConfig(true)
    }
  }

  const handleUpdateCraneConfig = (craneData: any) => {
    if (configuringCrane) {
      setElements(prev => prev.map(el =>
        el.id === configuringCrane.id
          ? { ...el, craneData: { ...el.craneData!, ...craneData } }
          : el
      ))
      addDebugLog('Crane configuration updated', 'success')
    }
  }

  const handleDeleteCrane = () => {
    if (configuringCrane) {
      setElements(prev => prev.filter(el => el.id !== configuringCrane.id))
      setShowCraneConfig(false)
      setConfiguringCrane(null)
      addDebugLog('Crane deleted', 'success')
    }
  }

  // Draw selection highlight around element
  const drawSelectionHighlight = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.save()
    ctx.strokeStyle = '#00ff00' // Green selection color
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5]) // Dashed line
    ctx.globalAlpha = 0.8

    if (element.type === 'text') {
      const [textPos] = element.points
      const fontSize = element.fontSize || element.style?.fontSize || 16
      const lines = (element.text || '').split('\n')
      const lineHeight = fontSize * 1.2
      const avgCharWidth = fontSize * 0.6
      const maxLineLength = Math.max(...lines.map(line => line.length), 1)
      const textWidth = Math.max(maxLineLength * avgCharWidth, fontSize)
      const textHeight = lines.length * lineHeight
      const padding = 5

      ctx.strokeRect(
        textPos.x - padding,
        textPos.y - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      )
    } else if (element.type === 'logo') {
      const [logoPos] = element.points
      const width = element.logoWidth || 100
      const height = element.logoHeight || 50
      ctx.strokeRect(logoPos.x - 2, logoPos.y - 2, width + 4, height + 4)

      // Draw resize handles for logo
      const handleSize = 8
      const handles = [
        { x: logoPos.x + width, y: logoPos.y + height },
        { x: logoPos.x, y: logoPos.y + height },
        { x: logoPos.x + width, y: logoPos.y },
        { x: logoPos.x, y: logoPos.y }
      ]
      handles.forEach(handle => {
        ctx.fillStyle = '#00ff00'
        ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
      })
    } else if (element.type === 'image') {
      const [imagePos] = element.points
      const width = element.imageWidth || 200
      const height = element.imageHeight || 150
      ctx.strokeRect(imagePos.x - 2, imagePos.y - 2, width + 4, height + 4)

      // Draw resize handles for image
      const handleSize = 8
      const handles = [
        { x: imagePos.x + width, y: imagePos.y + height },
        { x: imagePos.x, y: imagePos.y + height },
        { x: imagePos.x + width, y: imagePos.y },
        { x: imagePos.x, y: imagePos.y }
      ]
      handles.forEach(handle => {
        ctx.fillStyle = '#00ff00'
        ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
      })
    } else if (element.type === 'table') {
      const [tablePos] = element.points
      const cellWidth = element.cellWidth || 120
      const cellHeight = element.cellHeight || 30
      const tableWidth = (element.columns || 1) * cellWidth
      const tableHeight = (element.rows || 1) * cellHeight
      ctx.strokeRect(tablePos.x - 2, tablePos.y - 2, tableWidth + 4, tableHeight + 4)
    } else if (element.type === 'rectangle') {
      const [start, end] = element.points
      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)
      ctx.strokeRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4)
    } else if (element.type === 'circle') {
      const [center] = element.points
      const radius = element.radius || 50
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius + 3, 0, 2 * Math.PI)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Draw highlight for advanced command selected elements
  const drawAdvancedCommandHighlight = (ctx: CanvasRenderingContext2D, element: DrawingElement, command: string) => {
    ctx.save()

    // Different colors for different commands
    const colors = {
      trim: '#ff6b6b',    // Red for trim
      mirror: '#4ecdc4',  // Teal for mirror
      array: '#45b7d1',   // Blue for array
      join: '#96ceb4'     // Green for join
    }

    ctx.strokeStyle = colors[command as keyof typeof colors] || '#00ff00'
    ctx.lineWidth = 3
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.8

    // Draw highlight based on element type (similar to selection highlight)
    if (element.type === 'text') {
      const [textPos] = element.points
      const fontSize = element.fontSize || element.style?.fontSize || 16
      const lines = (element.text || '').split('\n')
      const lineHeight = fontSize * 1.2
      const avgCharWidth = fontSize * 0.6
      const maxLineLength = Math.max(...lines.map(line => line.length), 1)
      const textWidth = Math.max(maxLineLength * avgCharWidth, fontSize)
      const textHeight = lines.length * lineHeight
      const padding = 5

      ctx.strokeRect(
        textPos.x - padding,
        textPos.y - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      )
    } else if (element.type === 'rectangle') {
      const [start, end] = element.points
      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)
      ctx.strokeRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4)
    } else if (element.type === 'circle') {
      const [center] = element.points
      const radius = element.radius || 50
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius + 3, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (element.type === 'line') {
      const [start, end] = element.points
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Draw mirror axis
  const drawMirrorAxis = (ctx: CanvasRenderingContext2D, axis: { start: Point; end: Point }) => {
    ctx.save()
    ctx.strokeStyle = '#ff9500'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 5])

    ctx.beginPath()
    ctx.moveTo(axis.start.x, axis.start.y)
    ctx.lineTo(axis.end.x, axis.end.y)
    ctx.stroke()

    // Draw axis endpoints
    ctx.fillStyle = '#ff9500'
    ctx.beginPath()
    ctx.arc(axis.start.x, axis.start.y, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(axis.end.x, axis.end.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    ctx.restore()
  }

  // File upload handler for images/logos
  const handleLogoFileUpload = async (file: File) => {
    console.log('File upload started:', file.name, file.type, file.size)

    if (!file) {
      alert('No file selected.')
      return
    }

    if (!(file.type.startsWith('image/') || file.type === 'image/svg+xml')) {
      alert('Please select a valid image file (PNG, JPG, GIF, SVG, WebP)')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image under 10MB.')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string
          if (!result) {
            throw new Error('Failed to read file')
          }

          console.log('File read successfully, data URL length:', result.length)
          setLogoPreview(result)

          // Preload the image to get dimensions
          const img = await preloadImage(result)
          console.log('Image loaded:', img.width, 'x', img.height)

          setLoadedImages(prev => new Map(prev).set(result, img))

          // Auto-calculate proportional dimensions
          const maxWidth = 200
          const maxHeight = 150
          let width = img.width
          let height = img.height

          // Scale down if too large
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          setLogoConfig({
            ...logoConfig,
            file: file,
            url: result,
            width: width,
            height: height,
            originalWidth: img.width,
            originalHeight: img.height
          })

          console.log('Logo config updated:', { width, height, originalWidth: img.width, originalHeight: img.height })
        } catch (error) {
          console.error('Error processing image:', error)
          alert('Failed to process image. Please try a different file.')
        }
      }

      reader.onerror = (error) => {
        console.error('FileReader error:', error)
        alert('Error reading file. Please try again.')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Error uploading file. Please try again.')
    }
  }
  const [measurements, setMeasurements] = useState<{id: string, type: string, value: number, points: Point[]}[]>([])
  const [units, setUnits] = useState<'mm' | 'm' | 'ft' | 'in'>('m')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      const projectId = searchParams?.get?.('project') ?? null
      const projectKey = searchParams?.get?.('projectKey') ?? null
      const projectName = searchParams?.get?.('name') ?? undefined

      if (projectId) {
        // Database project
        handleLoad(projectId)
      } else if (projectKey) {
        // localStorage project
        handleLoadLocal(projectKey, projectName ?? null)
      }
    }
  }, [status, router, searchParams])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'

      if (isInputField) {
        return // Don't intercept keys when user is typing in input fields
      }

      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault()
        setShowCoordinateInput(true)
      }
      if (e.key === 'z' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      if (e.key === 'z' && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }
      if (e.key === 'y' && e.ctrlKey) {
        e.preventDefault()
        handleRedo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDeleteSelected()
      }
      if (e.key === 'Escape') {
        if (isDrawingPolyline && currentPolyline.length >= 2) {
          // Save the polyline before canceling
          const layerData = layers.find(l => l.id === currentLayer)
          const newElement: DrawingElement = {
            id: Date.now().toString(),
            type: 'polyline',
            points: currentPolyline,
            style: {
              stroke: layerData?.color || '#3b82f6',
              strokeWidth: 2
            },
            layer: currentLayer
          }
          const newElements = [...elements, newElement]
          setElements(newElements)
          addToHistory(newElements)
          addDebugLog(`Polyline saved with ${currentPolyline.length} points`, 'success')
        }
        setIsDrawingPolyline(false)
        setCurrentPolyline([])
        setShowCoordinateInput(false)
      }
      if (e.key === 'g') {
        setSnapToGrid(!snapToGrid)
      }
      if (e.key === 's' && !e.ctrlKey) {
        setSnapToObjects(!snapToObjects)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [snapToGrid, snapToObjects, isDrawingPolyline])

  const drawRulers = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showRulers) return

    ctx.save()
    ctx.resetTransform()

    // Ruler background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, width, 30) // Top ruler
    ctx.fillRect(0, 0, 30, height) // Left ruler

    // Ruler markings
    ctx.strokeStyle = '#64748b'
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '10px monospace'
    ctx.lineWidth = 1

    const rulerStep = 50 * zoom
    const startX = (-pan.x * zoom) % rulerStep
    const startY = (-pan.y * zoom) % rulerStep

    // Top ruler markings
    for (let x = startX; x < width; x += rulerStep) {
      const worldX = (x - pan.x * zoom) / zoom
      ctx.beginPath()
      ctx.moveTo(x, 25)
      ctx.lineTo(x, 30)
      ctx.stroke()

      if (x > 30) {
        ctx.fillText(Math.round(worldX).toString(), x + 2, 20)
      }
    }

    // Left ruler markings
    for (let y = startY; y < height; y += rulerStep) {
      const worldY = (y - pan.y * zoom) / zoom
      ctx.beginPath()
      ctx.moveTo(25, y)
      ctx.lineTo(30, y)
      ctx.stroke()

      if (y > 30) {
        ctx.save()
        ctx.translate(15, y - 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(Math.round(worldY).toString(), 0, 0)
        ctx.restore()
      }
    }

    // Corner square
    ctx.fillStyle = '#374151'
    ctx.fillRect(0, 0, 30, 30)

    ctx.restore()
  }

  const drawCrosshair = (ctx: CanvasRenderingContext2D, width: number, height: number, canvas: HTMLCanvasElement) => {
    if (!mousePosition || !showCoordinates) return

    ctx.save()
    ctx.resetTransform()

    // Convert world coordinates to canvas coordinates
    const rulerOffset = showRulers ? 30 : 0

    // Calculate canvas position from world coordinates
    const canvasX = (mousePosition.x + pan.x) * zoom + rulerOffset
    const canvasY = (mousePosition.y + pan.y) * zoom + rulerOffset

    // Ensure crosshair is within canvas bounds
    if (canvasX < 0 || canvasX > width || canvasY < 0 || canvasY > height) {
      ctx.restore()
      return
    }

    // Draw crosshair lines
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([])
    ctx.globalAlpha = 0.6

    // Vertical line (full height)
    ctx.beginPath()
    ctx.moveTo(canvasX, rulerOffset)
    ctx.lineTo(canvasX, height)
    ctx.stroke()

    // Horizontal line (full width)
    ctx.beginPath()
    ctx.moveTo(rulerOffset, canvasY)
    ctx.lineTo(width, canvasY)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.globalAlpha = 1
    ctx.restore()

    // Debug information overlay
    if (debugMode && mousePosition) {
      ctx.save()
      ctx.resetTransform()

      // Debug background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(10, 10, 300, 120)

      // Debug text
      ctx.fillStyle = '#00ff00'
      ctx.font = '12px monospace'
      ctx.fillText(`Mouse World: (${mousePosition.x.toFixed(1)}, ${mousePosition.y.toFixed(1)})`, 20, 30)

      const rulerOffset = showRulers ? 30 : 0
      const canvasX = (mousePosition.x + pan.x) * zoom + rulerOffset
      const canvasY = (mousePosition.y + pan.y) * zoom + rulerOffset
      ctx.fillText(`Canvas Pos: (${canvasX.toFixed(1)}, ${canvasY.toFixed(1)})`, 20, 50)

      ctx.fillText(`Zoom: ${zoom.toFixed(2)}, Pan: (${pan.x.toFixed(1)}, ${pan.y.toFixed(1)})`, 20, 70)
      ctx.fillText(`Canvas Size: ${canvas.width} x ${canvas.height}`, 20, 90)

      const rect = canvas.getBoundingClientRect()
      ctx.fillText(`Display Size: ${rect.width.toFixed(1)} x ${rect.height.toFixed(1)}`, 20, 110)

      ctx.restore()
    }
  }

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    if (element.type === 'logo' && element.points.length >= 1) {
      const x = element.points[0].x
      const y = element.points[0].y
      const width = element.logoWidth || 100
      const height = element.logoHeight || 50

      // Draw selection border
      ctx.save()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.rect(x, y, width, height)
      ctx.stroke()

      // Draw resize handles
      const handleSize = 8
      const handles = [
        { x: x + width, y: y + height, type: 'se' }, // Southeast
        { x: x, y: y + height, type: 'sw' }, // Southwest
        { x: x + width, y: y, type: 'ne' }, // Northeast
        { x: x, y: y, type: 'nw' }, // Northwest
      ]

      ctx.fillStyle = '#3b82f6'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.setLineDash([])

      handles.forEach(handle => {
        ctx.beginPath()
        ctx.rect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
        ctx.fill()
        ctx.stroke()
      })

      ctx.restore()
    }

    if (element.type === 'table' && element.points.length >= 2) {
      const startX = Math.min(element.points[0].x, element.points[1].x)
      const startY = Math.min(element.points[0].y, element.points[1].y)
      const cellWidth = element.cellWidth || 100
      const cellHeight = element.cellHeight || 30
      const tableWidth = element.columns! * cellWidth
      const tableHeight = element.rows! * cellHeight

      // Draw selection border
      ctx.save()
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.rect(startX - 2, startY - 2, tableWidth + 4, tableHeight + 4)
      ctx.stroke()

      // Draw drag handles at corners
      const handleSize = 8
      const handles = [
        { x: startX, y: startY },
        { x: startX + tableWidth, y: startY },
        { x: startX, y: startY + tableHeight },
        { x: startX + tableWidth, y: startY + tableHeight },
      ]

      ctx.fillStyle = '#10b981'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.setLineDash([])

      handles.forEach(handle => {
        ctx.beginPath()
        ctx.rect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
        ctx.fill()
        ctx.stroke()
      })

      ctx.restore()
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match display size (simplified approach)
    const rect = canvas.getBoundingClientRect()

    // Use a fixed resolution that works across all devices
    const targetWidth = Math.floor(rect.width)
    const targetHeight = Math.floor(rect.height)

    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // No additional scaling - use 1:1 pixel mapping for reliability

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw rulers first (before transformations)
    drawRulers(ctx, rect.width, rect.height)

    // Save context for drawing area
    ctx.save()

    // Clip drawing area (exclude rulers)
    if (showRulers) {
      ctx.beginPath()
      ctx.rect(30, 30, rect.width - 30, rect.height - 30)
      ctx.clip()
    }

    // Apply transformations for drawing area
    if (showRulers) {
      ctx.translate(30, 30)
    }
    ctx.scale(zoom, zoom)
    ctx.translate(pan.x, pan.y)

    // Draw grid
    if (showGrid) {
      const rect = canvas.getBoundingClientRect()
      drawGrid(ctx, rect.width, rect.height)
    }

    // Draw all elements by layer
    layers.forEach(layer => {
      if (layer.visible) {
        elements.filter(el => el.layer === layer.id).forEach(element => {
          drawElement(ctx, element)
        })
      }
    })

    // Draw selection highlight
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement)
      if (element) {
        drawSelectionHighlight(ctx, element)
      }
    }

    // Draw multiple selection highlights
    selectedElements.forEach(elementId => {
      const element = elements.find(el => el.id === elementId)
      if (element) {
        drawSelectionHighlight(ctx, element)
      }
    })

    // Draw lasso selection path
    if (isLassoSelecting && lassoPath.length > 1) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(lassoPath[0].x, lassoPath[0].y)
      for (let i = 1; i < lassoPath.length; i++) {
        ctx.lineTo(lassoPath[i].x, lassoPath[i].y)
      }
      // Close the lasso if we have enough points
      if (lassoPath.length > 2) {
        ctx.lineTo(lassoPath[0].x, lassoPath[0].y)
      }
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }

    // Draw advanced command highlights
    if (advancedCommand && selectedElements.length > 0) {
      selectedElements.forEach(elementId => {
        const element = elements.find(el => el.id === elementId)
        if (element) {
          drawAdvancedCommandHighlight(ctx, element, advancedCommand)
        }
      })
    }

    // Draw mirror axis preview
    if (mirrorAxis) {
      drawMirrorAxis(ctx, mirrorAxis)
    }

    // Draw rotation center indicator
    if (tool === 'rotate' && rotatingElement && isDrawing) {
      ctx.strokeStyle = '#ff6b35'
      ctx.fillStyle = '#ff6b35'
      ctx.lineWidth = 2
      ctx.setLineDash([])

      // Draw crosshair at rotation center
      const size = 10
      ctx.beginPath()
      ctx.moveTo(rotationCenter.x - size, rotationCenter.y)
      ctx.lineTo(rotationCenter.x + size, rotationCenter.y)
      ctx.moveTo(rotationCenter.x, rotationCenter.y - size)
      ctx.lineTo(rotationCenter.x, rotationCenter.y + size)
      ctx.stroke()

      // Draw center circle
      ctx.beginPath()
      ctx.arc(rotationCenter.x, rotationCenter.y, 3, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Draw scale center indicator and scale factor
    if (tool === 'scale' && scalingElement && isDrawing) {
      ctx.strokeStyle = '#3b82f6'
      ctx.fillStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([])

      // Draw crosshair at scale center
      const size = 10
      ctx.beginPath()
      ctx.moveTo(scaleCenter.x - size, scaleCenter.y)
      ctx.lineTo(scaleCenter.x + size, scaleCenter.y)
      ctx.moveTo(scaleCenter.x, scaleCenter.y - size)
      ctx.lineTo(scaleCenter.x, scaleCenter.y + size)
      ctx.stroke()

      // Draw center circle
      ctx.beginPath()
      ctx.arc(scaleCenter.x, scaleCenter.y, 3, 0, 2 * Math.PI)
      ctx.fill()

      // Draw scale factor text
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      const scaleText = `${(currentScaleFactor * 100).toFixed(0)}%`
      ctx.fillText(scaleText, scaleCenter.x, scaleCenter.y - 20)
    }

    // Draw arc creation preview
    if (tool === 'arc' && isDrawing) {
      ctx.strokeStyle = '#10b981'
      ctx.fillStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      if (arcStep === 1) {
        // Show center point
        ctx.beginPath()
        ctx.arc(arcCenter.x, arcCenter.y, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Show instruction text
        ctx.fillStyle = '#10b981'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Click to set start point', arcCenter.x, arcCenter.y - 15)
      } else if (arcStep === 2) {
        // Show center point
        ctx.beginPath()
        ctx.arc(arcCenter.x, arcCenter.y, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Show radius line to start point
        ctx.beginPath()
        ctx.moveTo(arcCenter.x, arcCenter.y)
        ctx.lineTo(arcStartPoint.x, arcStartPoint.y)
        ctx.stroke()

        // Show start point
        ctx.beginPath()
        ctx.arc(arcStartPoint.x, arcStartPoint.y, 3, 0, 2 * Math.PI)
        ctx.fill()

        // Show instruction text
        ctx.fillStyle = '#10b981'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Click to set end point', arcCenter.x, arcCenter.y - 15)
      }

      ctx.setLineDash([]) // Reset line dash
    }



    // Draw current element being drawn
    if (currentElement) {
      drawElement(ctx, currentElement)
    }

    // Draw polyline preview
    if (isDrawingPolyline && currentPolyline.length > 0) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(currentPolyline[0].x, currentPolyline[0].y)
      for (let i = 1; i < currentPolyline.length; i++) {
        ctx.lineTo(currentPolyline[i].x, currentPolyline[i].y)
      }
      // Draw line to current mouse position
      ctx.lineTo(mousePosition.x, mousePosition.y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw snap point indicator
    if (snapPoint) {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(snapPoint.x, snapPoint.y, 5, 0, 2 * Math.PI)
      ctx.stroke()

      // Draw crosshair
      ctx.beginPath()
      ctx.moveTo(snapPoint.x - 10, snapPoint.y)
      ctx.lineTo(snapPoint.x + 10, snapPoint.y)
      ctx.moveTo(snapPoint.x, snapPoint.y - 10)
      ctx.lineTo(snapPoint.x, snapPoint.y + 10)
      ctx.stroke()
    }

    // Draw selection handles for selected element
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement)
      if (element) {
        drawSelectionHandles(ctx, element)
      }
    }

    // Restore context
    ctx.restore()

    // Draw crosshair (after all transformations)
    drawCrosshair(ctx, rect.width, rect.height, canvas)

    // Draw precise cursor indicator
    if (mousePosition && tool !== 'pan' && tool !== 'select') {
      ctx.save()
      ctx.resetTransform()

      const rulerOffset = showRulers ? 30 : 0

      // Calculate canvas position from world coordinates
      const canvasX = (mousePosition.x + pan.x) * zoom + rulerOffset
      const canvasY = (mousePosition.y + pan.y) * zoom + rulerOffset

      // Only draw if cursor is within canvas bounds
      if (canvasX >= rulerOffset && canvasX <= rect.width &&
          canvasY >= rulerOffset && canvasY <= rect.height) {

        // Draw precise cursor dot
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI)
        ctx.fill()

        // Draw cursor crosshair
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(canvasX - 10, canvasY)
        ctx.lineTo(canvasX + 10, canvasY)
        ctx.moveTo(canvasX, canvasY - 10)
        ctx.lineTo(canvasX, canvasY + 10)
        ctx.stroke()
      }

      ctx.restore()
    }

  }, [elements, currentElement, zoom, pan, showGrid, mousePosition, showRulers, showCoordinates, selectedElements, isLassoSelecting, lassoPath])

  // Reliable mouse tracking that works on all devices
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateMousePosition = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()

      // Calculate mouse position relative to canvas (simplified)
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top

      // Account for rulers offset
      const rulerOffset = showRulers ? 30 : 0
      const adjustedX = canvasX - rulerOffset
      const adjustedY = canvasY - rulerOffset

      // Convert to world coordinates
      let x = (adjustedX / zoom) - pan.x
      let y = (adjustedY / zoom) - pan.y

      // Snap to grid if enabled
      if (snapToGrid && showGrid) {
        const gridSize = 20
        x = Math.round(x / gridSize) * gridSize
        y = Math.round(y / gridSize) * gridSize
      }

      setMousePosition({ x, y })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    // Use passive listeners for better performance
    canvas.addEventListener('mousemove', updateMousePosition, { passive: true })
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      canvas.removeEventListener('mousemove', updateMousePosition)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [zoom, pan, showRulers, snapToGrid, showGrid])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      // Trigger a redraw when canvas size changes
      const rect = canvas.getBoundingClientRect()

      // Use simplified sizing for reliability
      const targetWidth = Math.floor(rect.width)
      const targetHeight = Math.floor(rect.height)

      canvas.width = targetWidth
      canvas.height = targetHeight

      // No additional scaling needed
    })

    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Save project to localStorage
  const saveProject = (filename?: string) => {
    try {
      // Validate inputs
      if (!filename && !projectName) {
        console.error('No project name provided')
        return false
      }

      const finalName = filename || projectName || 'Untitled Project'

      const projectData = {
        name: finalName,
        elements: elements || [],
        projectInfo: projectInfo || {},
        drawingScale: drawingScale || '1:1',
        drawingUnits: drawingUnits || 'mm',
        layers: layers || [],
        currentLayer: currentLayer || 'layer1',
        zoom: zoom || 1,
        pan: pan || { x: 0, y: 0 },
        savedAt: new Date().toISOString(),
        version: '1.0'
      }

      const projectKey = `lift_planner_project_${finalName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`

      // Test localStorage availability
      if (typeof Storage === 'undefined') {
        console.error('localStorage is not available')
        return false
      }

      localStorage.setItem(projectKey, JSON.stringify(projectData))

      // Also save to recent projects list
      const recentProjects = JSON.parse(localStorage.getItem('lift_planner_recent_projects') || '[]')
      const projectEntry = {
        name: finalName,
        key: projectKey,
        savedAt: new Date().toISOString(),
        elementCount: elements?.length || 0
      }

      // Remove existing entry if it exists
      const filteredRecent = recentProjects.filter((p: any) => p.key !== projectKey)
      filteredRecent.unshift(projectEntry)

      // Keep only last 10 projects
      const limitedRecent = filteredRecent.slice(0, 10)
      localStorage.setItem('lift_planner_recent_projects', JSON.stringify(limitedRecent))

      console.log('Project saved successfully:', projectKey, 'Elements:', elements?.length || 0)
      return true
    } catch (error) {
      console.error('Error saving project:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      return false
    }
  }

  // Load project from localStorage
  const loadProject = (projectKey: string) => {
    try {
      const projectData = localStorage.getItem(projectKey)
      if (!projectData) {
        alert('Project not found!')
        return false
      }

      const parsed = JSON.parse(projectData)

      setProjectName(parsed.name || 'Loaded Project')
      setElements(parsed.elements || [])
      setProjectInfo(parsed.projectInfo || projectInfo)
      setDrawingScale(parsed.drawingScale || '1:1')
      setDrawingUnits(parsed.drawingUnits || 'mm')
      setLayers(parsed.layers || layers)
      setCurrentLayer(parsed.currentLayer || currentLayer)

      // Reset history
      setHistory([parsed.elements || []])
      setHistoryIndex(0)

      console.log('Project loaded successfully:', projectKey)
      return true
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Error loading project!')
      return false
    }
  }

  // Get recent projects
  const getRecentProjects = () => {
    try {
      return JSON.parse(localStorage.getItem('lift_planner_recent_projects') || '[]')
    } catch (error) {
      console.error('Error getting recent projects:', error)
      return []
    }
  }

  // Export clean drawing without UI elements
  // PROFESSIONAL CAD EXPORT - High quality print-ready output
  const exportCleanDrawing = async (format: 'png' | 'pdf' | 'svg' = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) {
      alert('Canvas not found. Please try again.')
      return
    }

    if (elements.length === 0) {
      alert('No drawing elements to export. Please create some drawings first.')
      return
    }

    try {
      // ============ CONFIGURATION ============
      const DPI = 300 // Print quality resolution
      const PAPER_WIDTH_MM = 297 // A4 Landscape
      const PAPER_HEIGHT_MM = 210
      const BORDER_MM = 10
      const TITLE_BLOCK_HEIGHT_MM = 25

      // Convert mm to pixels at 300 DPI
      const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI)

      const canvasWidth = mmToPx(PAPER_WIDTH_MM)
      const canvasHeight = mmToPx(PAPER_HEIGHT_MM)
      const borderPx = mmToPx(BORDER_MM)
      const titleBlockHeight = mmToPx(TITLE_BLOCK_HEIGHT_MM)

      // Line weight multiplier for print (thicker lines look better on paper)
      const LINE_WEIGHT_MULTIPLIER = 3

      // Create high-resolution export canvas
      const exportCanvas = document.createElement('canvas')
      const ctx = exportCanvas.getContext('2d')
      if (!ctx) {
        alert('Failed to create export canvas.')
        return
      }

      exportCanvas.width = canvasWidth
      exportCanvas.height = canvasHeight

      // ============ WHITE BACKGROUND ============
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // ============ DRAWING BORDER (Double line) ============
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 4
      ctx.strokeRect(borderPx, borderPx, canvasWidth - borderPx * 2, canvasHeight - borderPx * 2)
      ctx.lineWidth = 2
      ctx.strokeRect(borderPx + 8, borderPx + 8, canvasWidth - borderPx * 2 - 16, canvasHeight - borderPx * 2 - 16)

      // ============ CALCULATE DRAWING BOUNDS ============
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      let hasVisibleElements = false

      elements.forEach(element => {
        const layer = layers.find(l => l.id === element.layer)
        if (!layer || !layer.visible) return
        hasVisibleElements = true

        element.points.forEach(point => {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        })

        // Include special element dimensions
        if (element.type === 'circle' && element.radius) {
          const center = element.points[0]
          minX = Math.min(minX, center.x - element.radius)
          minY = Math.min(minY, center.y - element.radius)
          maxX = Math.max(maxX, center.x + element.radius)
          maxY = Math.max(maxY, center.y + element.radius)
        }
        if (element.type === 'table') {
          const w = (element.columns || 1) * (element.cellWidth || 100)
          const h = (element.rows || 1) * (element.cellHeight || 30)
          maxX = Math.max(maxX, element.points[0].x + w)
          maxY = Math.max(maxY, element.points[0].y + h)
        }
      })

      if (!hasVisibleElements) {
        alert('No visible elements to export.')
        return
      }

      // ============ CALCULATE SCALE TO FIT ============
      const drawAreaWidth = canvasWidth - borderPx * 2 - 40
      const drawAreaHeight = canvasHeight - borderPx * 2 - titleBlockHeight - 60
      const contentWidth = maxX - minX || 100
      const contentHeight = maxY - minY || 100

      const scaleX = drawAreaWidth / contentWidth
      const scaleY = drawAreaHeight / contentHeight
      const exportScale = Math.min(scaleX, scaleY) * 0.85 // 85% to leave margin

      // Center the drawing in the drawing area
      const scaledWidth = contentWidth * exportScale
      const scaledHeight = contentHeight * exportScale
      const offsetX = borderPx + 20 + (drawAreaWidth - scaledWidth) / 2 - minX * exportScale
      const offsetY = borderPx + 20 + (drawAreaHeight - scaledHeight) / 2 - minY * exportScale

      // ============ DRAW ALL ELEMENTS WITH THICKER LINES ============
      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(exportScale, exportScale)

      elements.forEach(element => {
        const layer = layers.find(l => l.id === element.layer)
        if (!layer || !layer.visible) return

        // Create a modified element with thicker lines for print
        const printElement = {
          ...element,
          style: {
            ...element.style,
            strokeWidth: (element.style?.strokeWidth || 1) * LINE_WEIGHT_MULTIPLIER
          }
        }
        drawElement(ctx, printElement)
      })
      ctx.restore()

      // ============ TITLE BLOCK ============
      const tbX = borderPx + 20
      const tbY = canvasHeight - borderPx - titleBlockHeight - 20
      const tbWidth = canvasWidth - borderPx * 2 - 40
      const tbHeight = titleBlockHeight

      // Title block border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.strokeRect(tbX, tbY, tbWidth, tbHeight)

      // Vertical dividers
      const col1 = tbX + tbWidth * 0.4
      const col2 = tbX + tbWidth * 0.6
      const col3 = tbX + tbWidth * 0.8
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(col1, tbY)
      ctx.lineTo(col1, tbY + tbHeight)
      ctx.moveTo(col2, tbY)
      ctx.lineTo(col2, tbY + tbHeight)
      ctx.moveTo(col3, tbY)
      ctx.lineTo(col3, tbY + tbHeight)
      ctx.stroke()

      // Title block text
      ctx.fillStyle = '#000000'
      const fontSize = Math.round(tbHeight * 0.25)
      const smallFont = Math.round(tbHeight * 0.18)

      // Project Title (large)
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillText(projectName || 'UNTITLED DRAWING', tbX + 15, tbY + tbHeight * 0.45)

      // Project info (smaller)
      ctx.font = `${smallFont}px Arial`
      ctx.fillText(`Project: ${projectInfo?.projectNumber || 'N/A'}`, tbX + 15, tbY + tbHeight * 0.8)

      // Scale
      ctx.font = `bold ${smallFont}px Arial`
      ctx.fillText('SCALE', col1 + 10, tbY + tbHeight * 0.35)
      ctx.font = `${fontSize}px Arial`
      ctx.fillText(drawingScale || '1:1', col1 + 10, tbY + tbHeight * 0.75)

      // Date
      ctx.font = `bold ${smallFont}px Arial`
      ctx.fillText('DATE', col2 + 10, tbY + tbHeight * 0.35)
      ctx.font = `${fontSize}px Arial`
      ctx.fillText(new Date().toLocaleDateString('en-GB'), col2 + 10, tbY + tbHeight * 0.75)

      // Revision & Sheet
      ctx.font = `bold ${smallFont}px Arial`
      ctx.fillText('REV', col3 + 10, tbY + tbHeight * 0.35)
      ctx.font = `${fontSize}px Arial`
      ctx.fillText(projectInfo?.revision || 'A', col3 + 10, tbY + tbHeight * 0.75)
      ctx.font = `${smallFont}px Arial`
      ctx.fillText(`Sheet: ${projectInfo?.sheet || '1 of 1'}`, col3 + 80, tbY + tbHeight * 0.75)

      // ============ EXPORT ============
      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `${(projectName || 'Drawing').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`
        link.href = exportCanvas.toDataURL('image/png', 1.0)
        link.click()
        alert('✅ PNG exported at 300 DPI - ready for printing!')
      } else if (format === 'pdf') {
        const { jsPDF } = await import('jspdf')
        const imgData = exportCanvas.toDataURL('image/png', 1.0)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })
        pdf.addImage(imgData, 'PNG', 0, 0, PAPER_WIDTH_MM, PAPER_HEIGHT_MM)
        pdf.save(`${(projectName || 'Drawing').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
        alert('✅ PDF exported - ready for printing!')
      }

    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  // Professional export with layout options
  const exportWithLayout = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Paper size dimensions in mm
      const paperSizes = {
        'A4': { width: 297, height: 210 },
        'A3': { width: 420, height: 297 },
        'A2': { width: 594, height: 420 },
        'A1': { width: 841, height: 594 },
        'A0': { width: 1189, height: 841 },
        'Letter': { width: 279, height: 216 },
        'Legal': { width: 356, height: 216 },
        'Tabloid': { width: 432, height: 279 }
      }

      const paper = paperSizes[exportConfig.paperSize as keyof typeof paperSizes]
      const isLandscape = exportConfig.orientation === 'landscape'
      const pageWidth = isLandscape ? paper.width : paper.height
      const pageHeight = isLandscape ? paper.height : paper.width

      // Convert mm to pixels (300 DPI)
      const dpi = 300
      const mmToPixels = dpi / 25.4
      const canvasWidth = Math.round(pageWidth * mmToPixels)
      const canvasHeight = Math.round(pageHeight * mmToPixels)

      // Create export canvas
      const exportCanvas = document.createElement('canvas')
      const exportCtx = exportCanvas.getContext('2d')
      if (!exportCtx) return

      exportCanvas.width = canvasWidth
      exportCanvas.height = canvasHeight

      // Set white background for professional export
      exportCtx.fillStyle = 'white'
      exportCtx.fillRect(0, 0, canvasWidth, canvasHeight)

      console.log(`Professional export: Canvas size - ${canvasWidth}x${canvasHeight}`)

      // White background
      exportCtx.fillStyle = '#ffffff'
      exportCtx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Calculate margins in pixels
      const margins = {
        top: exportConfig.margins.top * mmToPixels,
        right: exportConfig.margins.right * mmToPixels,
        bottom: exportConfig.margins.bottom * mmToPixels,
        left: exportConfig.margins.left * mmToPixels
      }

      // Drawing area
      const drawingWidth = canvasWidth - margins.left - margins.right
      const drawingHeight = canvasHeight - margins.top - margins.bottom

      // Calculate drawing bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      let pointCount = 0
      elements.forEach(element => {
        if (element.points && element.points.length > 0) {
          element.points.forEach(point => {
            minX = Math.min(minX, point.x)
            minY = Math.min(minY, point.y)
            maxX = Math.max(maxX, point.x)
            maxY = Math.max(maxY, point.y)
            pointCount++
          })
        }
      })

      console.log(`Professional export: Processed ${pointCount} points from ${elements.length} elements`)

      if (minX === Infinity || pointCount === 0) {
        console.log('Professional export: No valid points found, using default bounds')
        minX = minY = 0
        maxX = maxY = 100
      }

      const contentWidth = maxX - minX
      const contentHeight = maxY - minY
      console.log(`Professional export: Content bounds - width: ${contentWidth}, height: ${contentHeight}`)

      // Calculate scale
      let scale = 1
      if (exportConfig.scale === 'fit') {
        const scaleX = drawingWidth / (contentWidth + 100) // Add padding
        const scaleY = drawingHeight / (contentHeight + 100)
        scale = Math.min(scaleX, scaleY, 3) // Max 3x scale
      } else {
        // Parse custom scale like "1:100"
        const scaleMatch = exportConfig.customScale.match(/(\d+):(\d+)/)
        if (scaleMatch) {
          scale = parseFloat(scaleMatch[1]) / parseFloat(scaleMatch[2])
        }
      }

      // Center the drawing
      const scaledWidth = contentWidth * scale
      const scaledHeight = contentHeight * scale
      const offsetX = margins.left + (drawingWidth - scaledWidth) / 2 - minX * scale
      const offsetY = margins.top + (drawingHeight - scaledHeight) / 2 - minY * scale

      // Draw elements
      exportCtx.save()
      exportCtx.translate(offsetX, offsetY)
      exportCtx.scale(scale, scale)

      console.log(`Professional export: Drawing ${elements.length} total elements`)
      console.log(`Export config - showLayers: ${exportConfig.showLayers}, currentLayer: ${currentLayer}`)
      console.log(`Transform - offsetX: ${offsetX}, offsetY: ${offsetY}, scale: ${scale}`)

      let drawnCount = 0
      elements.forEach(element => {
        // Show element if showLayers is enabled OR if it's on the current layer
        if (exportConfig.showLayers || element.layer === currentLayer) {
          drawElement(exportCtx, element)
          drawnCount++
        }
      })

      console.log(`Professional export: Drew ${drawnCount} elements to canvas`)
      exportCtx.restore()

      // Add logo if enabled
      if (exportConfig.includeLogo && logoPreview) {
        await addLogoToExport(exportCtx, canvasWidth, canvasHeight, margins)
      }

      // Add title block if enabled
      if (exportConfig.includeTitleBlock) {
        addTitleBlockToExport(exportCtx, canvasWidth, canvasHeight, margins)
      }

      // Add scale and date info
      if (exportConfig.includeScale || exportConfig.includeDate) {
        addInfoToExport(exportCtx, canvasWidth, canvasHeight, margins)
      }

      // Add watermark if specified
      if (exportConfig.watermark) {
        addWatermarkToExport(exportCtx, canvasWidth, canvasHeight)
      }

      // Export based on format
      if (exportConfig.format === 'png') {
        const link = document.createElement('a')
        link.download = `${projectName.replace(/\s+/g, '_')}_${exportConfig.paperSize}_${Date.now()}.png`
        link.href = exportCanvas.toDataURL('image/png', 1.0)
        link.click()
      } else if (exportConfig.format === 'pdf') {
        await exportToPDFWithLayout(exportCanvas)
      }

      setShowExportLayoutDialog(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    }
  }

  // Helper function to add logo to export
  const addLogoToExport = async (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, margins: any) => {
    if (!logoPreview) return

    const logoSizes = { small: 60, medium: 100, large: 150 }
    const logoSize = logoSizes[exportConfig.logoSize]

    let x = 0, y = 0
    switch (exportConfig.logoPosition) {
      case 'top-left':
        x = margins.left + 10
        y = margins.top + 10
        break
      case 'top-right':
        x = canvasWidth - margins.right - logoSize - 10
        y = margins.top + 10
        break
      case 'bottom-left':
        x = margins.left + 10
        y = canvasHeight - margins.bottom - logoSize - 10
        break
      case 'bottom-right':
        x = canvasWidth - margins.right - logoSize - 10
        y = canvasHeight - margins.bottom - logoSize - 10
        break
    }

    try {
      const img = document.createElement('img') as HTMLImageElement
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = logoPreview
      })
      ctx.drawImage(img, x, y, logoSize, logoSize * (img.height / img.width))
    } catch (error) {
      console.error('Logo loading error:', error)
    }
  }

  // Helper function to add title block to export
  const addTitleBlockToExport = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, margins: any) => {
    const blockWidth = 300
    const blockHeight = 120

    let x = 0, y = 0
    switch (exportConfig.titleBlockPosition) {
      case 'bottom-left':
        x = margins.left + 10
        y = canvasHeight - margins.bottom - blockHeight - 10
        break
      case 'bottom-right':
        x = canvasWidth - margins.right - blockWidth - 10
        y = canvasHeight - margins.bottom - blockHeight - 10
        break
    }

    // Draw title block border
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, blockWidth, blockHeight)

    // Add title block content
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(projectInfo.title || 'Untitled Drawing', x + 10, y + 25)

    ctx.font = '12px Arial'
    ctx.fillText(`Project: ${projectInfo.projectNumber || 'N/A'}`, x + 10, y + 45)
    ctx.fillText(`Drawn by: ${projectInfo.drawnBy || 'N/A'}`, x + 10, y + 65)
    ctx.fillText(`Checked by: ${projectInfo.checkedBy || 'N/A'}`, x + 10, y + 85)
    ctx.fillText(`Date: ${projectInfo.date || new Date().toLocaleDateString()}`, x + 10, y + 105)

    ctx.fillText(`Scale: ${drawingScale}`, x + 150, y + 45)
    ctx.fillText(`Rev: ${projectInfo.revision || 'A'}`, x + 150, y + 65)
    ctx.fillText(`Sheet: ${projectInfo.sheet || '1 of 1'}`, x + 150, y + 85)
    ctx.fillText(`Units: ${drawingUnits}`, x + 150, y + 105)
  }

  // Helper function to add scale and date info
  const addInfoToExport = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, margins: any) => {
    ctx.fillStyle = '#000000'
    ctx.font = '10px Arial'

    if (exportConfig.includeScale) {
      ctx.fillText(`Scale: ${drawingScale}`, margins.left, canvasHeight - margins.bottom + 15)
    }

    if (exportConfig.includeDate) {
      const dateText = `Exported: ${new Date().toLocaleDateString()}`
      const textWidth = ctx.measureText(dateText).width
      ctx.fillText(dateText, canvasWidth - margins.right - textWidth, canvasHeight - margins.bottom + 15)
    }
  }

  // Helper function to add watermark
  const addWatermarkToExport = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.translate(canvasWidth / 2, canvasHeight / 2)
    ctx.rotate(-Math.PI / 6)
    ctx.fillText(exportConfig.watermark, 0, 0)
    ctx.restore()
  }

  // PDF export with layout
  const exportToPDFWithLayout = async (canvas: HTMLCanvasElement) => {
    try {
      const { jsPDF } = await import('jspdf')
      const imgData = canvas.toDataURL('image/png', 1.0)

      const pdf = new jsPDF({
        orientation: exportConfig.orientation,
        unit: 'mm',
        format: exportConfig.paperSize.toLowerCase()
      })

      const paperSizes = {
        'A4': { width: 297, height: 210 },
        'A3': { width: 420, height: 297 },
        'A2': { width: 594, height: 420 },
        'A1': { width: 841, height: 594 },
        'A0': { width: 1189, height: 841 },
        'Letter': { width: 279, height: 216 },
        'Legal': { width: 356, height: 216 },
        'Tabloid': { width: 432, height: 279 }
      }

      const paper = paperSizes[exportConfig.paperSize as keyof typeof paperSizes]
      const isLandscape = exportConfig.orientation === 'landscape'
      const pageWidth = isLandscape ? paper.width : paper.height
      const pageHeight = isLandscape ? paper.height : paper.width

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
      pdf.save(`${projectName.replace(/\s+/g, '_')}_${exportConfig.paperSize}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('PDF export failed. Please try again.')
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'

      if (isInputField) {
        return // Don't intercept keys when user is typing in input fields
      }

      // Prevent default for our shortcuts
      if (e.ctrlKey || e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault()
            setShowRulers(!showRulers)
            break
          case 'h':
            e.preventDefault()
            setShowCoordinates(!showCoordinates)
            break
          case 'u':
            e.preventDefault()
            setShowStatusBar(!showStatusBar)
            break
          case 'g':
            e.preventDefault()
            setShowGrid(!showGrid)
            break
          case 'l':
            e.preventDefault()
            setShowLayerManager(!showLayerManager)
            break
          case '=':
          case '+':
            e.preventDefault()
            setZoom(Math.min(zoom * 1.2, 5))
            break
          case '-':
            e.preventDefault()
            setZoom(Math.max(zoom / 1.2, 0.1))
            break
          case '0':
            e.preventDefault()
            setZoom(1)
            setPan({ x: 0, y: 0 })
            break
        }
      }

      // Tool shortcuts (without modifiers)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select')
            break
          case 'm':
            setTool('move')
            break
          case 'o':
            setTool('rotate')
            break
          case 's':
            setTool('scale')
            break
          case 'l':
            setTool('line')
            break
          case 'r':
            setTool('rectangle')
            break
          case 'c':
            setTool('circle')
            break
          case 'p':
            setTool('pan')
            break
          case 't':
            setTool('text')
            break
          case 'b':
            setTool('table')
            break
          case 'i':
            setTool('titleblock')
            break
          case 'g':
            setTool('logo')
            break
          case 'j':
            // Join selected elements
            if (selectedElements.length >= 2) {
              joinSelectedElements()
            } else {
              startJoinCommand()
            }
            break
          case 'escape':
            e.preventDefault()
            // Cancel advanced commands first
            if (advancedCommand) {
              setAdvancedCommand(null)
              setCommandStep(0)
              setCommandData({})
              setSelectedElements([])
              setMirrorAxis(null)
              console.log('Advanced command cancelled.')
            } else {
              // Save polyline if drawing one
              if (isDrawingPolyline && currentPolyline.length >= 2) {
                const layerData = layers.find(l => l.id === currentLayer)
                const newElement: DrawingElement = {
                  id: Date.now().toString(),
                  type: 'polyline',
                  points: currentPolyline,
                  style: {
                    stroke: layerData?.color || '#3b82f6',
                    strokeWidth: 2
                  },
                  layer: currentLayer
                }
                const newElements = [...elements, newElement]
                setElements(newElements)
                addToHistory(newElements)
                addDebugLog(`Polyline saved with ${currentPolyline.length} points`, 'success')
              }
              setTool('select')
              setIsDrawing(false)
              setCurrentElement(null)
              setIsDrawingPolyline(false)
              setCurrentPolyline([])
              setSelectedElement(null)
              // Reset arc tool state
              setArcStep(0)
              setArcCenter({ x: 0, y: 0 })
              setArcStartPoint({ x: 0, y: 0 })
            }
            break
          case 'f1':
            e.preventDefault()
            setShowHelp(true)
            break
          case 'f2':
            e.preventDefault()
            setShowCommandLine(!showCommandLine)
            break
          case 'delete':
          case 'backspace':
            e.preventDefault()
            if (selectedElement) {
              const newElements = elements.filter(el => el.id !== selectedElement)
              setElements(newElements)
              addToHistory(newElements)
              setSelectedElement(null)
            }
            break
        }
      }

      // Command line shortcuts
      if (showCommandLine && e.key === 'Enter') {
        e.preventDefault()
        executeCommand(commandInput)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showRulers, showCoordinates, showStatusBar, showGrid, showLayerManager, zoom, pan, showCommandLine, commandInput, selectedElement, elements, advancedCommand, selectedElements])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5

    // Calculate grid bounds in world coordinates
    const rulerOffset = showRulers ? 30 : 0
    const worldWidth = (width - rulerOffset) / zoom
    const worldHeight = (height - rulerOffset) / zoom

    // Calculate grid start position to align with pan offset
    const startX = Math.floor((-pan.x) / gridSize) * gridSize
    const startY = Math.floor((-pan.y) / gridSize) * gridSize
    const endX = startX + worldWidth + gridSize
    const endY = startY + worldHeight + gridSize

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }
  }

  // Draw an assembled crane made from user-built parts
  // This renders the exact parts the user positioned in the builder
  const drawAssembledCrane = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    // Exit if no assembled crane data exists
    if (!element.assembledCraneData) return

    // Get the position where the crane should be drawn on the canvas
    const position = element.points[0]
    const crane = element.assembledCraneData

    // Save canvas state before applying transformations
    ctx.save()
    // Translate to the crane's position on the canvas
    ctx.translate(position.x, position.y)

    // Sort parts by z-index (lower values drawn first = appear behind)
    // This ensures proper layering of parts
    const sortedParts = [...crane.parts].sort((a, b) => a.zIndex - b.zIndex)

    // Draw each part
    sortedParts.forEach(part => {
      ctx.save() // Save state before part transformations

      // Move to part's position
      ctx.translate(part.x, part.y)
      // Apply part's rotation (convert degrees to radians)
      ctx.rotate((part.rotation * Math.PI) / 180)

      // Fill the part with its color
      ctx.fillStyle = part.color
      ctx.strokeStyle = '#333333' // Dark border
      ctx.lineWidth = 2
      // Draw filled rectangle centered at origin
      ctx.fillRect(-part.width / 2, -part.height / 2, part.width, part.height)
      // Draw border around the part
      ctx.strokeRect(-part.width / 2, -part.height / 2, part.width, part.height)

      // Draw the part's label text in the center
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(part.label, 0, 0) // Draw at center (0, 0)

      ctx.restore() // Restore state after drawing this part
    })

    ctx.restore() // Restore state after drawing all parts

    // Draw selection border if this crane is currently selected
    if (selectedElement === element.id) {
      ctx.save()
      ctx.strokeStyle = '#3b82f6' // Blue border
      ctx.lineWidth = 3
      ctx.setLineDash([8, 8]) // Dashed line pattern

      // Calculate the bounding box of all parts
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      crane.parts.forEach(part => {
        // Find the minimum and maximum coordinates of all parts
        minX = Math.min(minX, part.x - part.width / 2)
        minY = Math.min(minY, part.y - part.height / 2)
        maxX = Math.max(maxX, part.x + part.width / 2)
        maxY = Math.max(maxY, part.y + part.height / 2)
      })

      // Draw selection rectangle around all parts with 10px padding
      ctx.strokeRect(position.x + minX - 10, position.y + minY - 10, maxX - minX + 20, maxY - minY + 20)
      ctx.restore()
    }
  }

  // Realistic crane drawing function
  const drawCrane = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    if (!element.craneData) return

    const position = element.points[0]
    ctx.save()
    ctx.translate(position.x, position.y)

    // Check if this is a tandem crane setup
    if (element.craneData.crane1 && element.craneData.crane2) {
      // Draw tandem cranes
      drawTandemCranes(ctx, element.craneData)
    } else {
      // Draw single crane
      const { specifications: crane, boomAngle, boomExtension, scale = 1.0, loadLineLength = 40, wireframe = false } = element.craneData

      // Check if this is a wireframe crane (professional technical drawing)
      if (crane.wireframe && crane.wireframeType) {
        // Use wireframe drawing functions based on crane type
        // Boom length in meters - convert to pixels (1m = 12px for proper scale)
        const boomLenMeters = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * boomExtension
        const boomLenPixels = boomLenMeters * 12  // 12 pixels per meter for good visibility
        const craneConfig: Partial<CraneDrawingConfig> = {
          boomAngle,
          boomLength: boomLenPixels,
          boomSections: element.craneData?.boomSections || 5,
          outriggerExtension: element.craneData?.outriggerExtension || 1.0,
          counterweightTons: element.craneData?.counterweightTons || 12,
          loadLineLength: loadLineLength * 3,  // Scale up load line too
          showDimensions: element.craneData?.showDimensions !== false,
          scale
        }
        switch (crane.wireframeType) {
          case 'mobile':
            drawWireframeMobileCrane(ctx, boomAngle, boomLenPixels, scale, craneConfig)
            break
          case 'mobile-plan':
            drawWireframeMobileCranePlanView(ctx, boomAngle, boomLenPixels, scale, craneConfig)
            break
          case 'tower':
            drawWireframeTowerCrane(ctx, 250, boomLenPixels, 70, scale)
            break
          case 'crawler':
            drawWireframeCrawlerCrane(ctx, boomAngle, boomLenPixels, loadLineLength, scale)
            break
          default:
            drawRealisticCrane(ctx, crane, boomAngle, boomExtension, scale, loadLineLength, wireframe)
        }
      } else {
        // Draw realistic crane
        drawRealisticCrane(ctx, crane, boomAngle, boomExtension, scale, loadLineLength, wireframe)
      }
    }

    ctx.restore()

    // Draw selection border if selected - much larger
    if (selectedElement === element.id) {
      ctx.save()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 8])
      ctx.strokeRect(position.x - 400, position.y - 300, 800, 600)
      ctx.restore()
    }
  }

  // Draw tandem cranes for dual lifting operations - CRANES FACE OPPOSITE DIRECTIONS
  const drawTandemCranes = (ctx: CanvasRenderingContext2D, craneData: any) => {
    const { specifications: crane, crane1, crane2 } = craneData

    // Use individual crane positions (already in pixels)
    const crane1X = crane1.offsetX || -100
    const crane1Y = crane1.offsetY || 0
    const crane2X = crane2.offsetX || 100
    const crane2Y = crane2.offsetY || 0

    // Draw first crane - facing RIGHT
    ctx.save()
    ctx.translate(crane1X, crane1Y)
    drawRealisticCrane(ctx, crane, crane1.boomAngle, crane1.boomExtension, crane1.scale, crane1.loadLineLength, crane1.wireframe ?? false)
    ctx.restore()

    // Draw second crane - facing LEFT (flipped)
    ctx.save()
    ctx.translate(crane2X, crane2Y)
    ctx.scale(-1, 1) // Flip horizontally so crane faces left
    drawRealisticCrane(ctx, crane, crane2.boomAngle, crane2.boomExtension, crane2.scale, crane2.loadLineLength, crane2.wireframe ?? false)
    ctx.restore()

    // Calculate boom end positions for both cranes
    const scale1 = 3.0 * crane1.scale
    const scale2 = 3.0 * crane2.scale
    const boomLength1 = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * crane1.boomExtension
    const boomLength2 = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * crane2.boomExtension

    // Crane 1 boom end (facing right)
    const boom1EndX = crane1X + (boomLength1 * Math.cos((crane1.boomAngle * Math.PI) / 180) * 12 * scale1)
    const boom1EndY = crane1Y - (boomLength1 * Math.sin((crane1.boomAngle * Math.PI) / 180) * 12 * scale1)

    // Crane 2 boom end (facing left)
    const boom2EndX = crane2X - (boomLength2 * Math.cos((crane2.boomAngle * Math.PI) / 180) * 12 * scale2)
    const boom2EndY = crane2Y - (boomLength2 * Math.sin((crane2.boomAngle * Math.PI) / 180) * 12 * scale2)

    // Draw connection line between boom ends to show load sharing
    ctx.strokeStyle = '#FF6B35'
    ctx.lineWidth = 4
    ctx.setLineDash([15, 10])
    ctx.beginPath()
    ctx.moveTo(boom1EndX, boom1EndY + crane1.loadLineLength)
    ctx.lineTo(boom2EndX, boom2EndY + crane2.loadLineLength)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw load block in the middle
    const midX = (boom1EndX + boom2EndX) / 2
    const midY = (boom1EndY + crane1.loadLineLength + boom2EndY + crane2.loadLineLength) / 2

    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(midX - 15, midY - 8, 30, 16)
    ctx.strokeStyle = '#E55A2B'
    ctx.lineWidth = 2
    ctx.strokeRect(midX - 15, midY - 8, 30, 16)

    // Add tandem lift label (centered between cranes)
    const centerX = (crane1X + crane2X) / 2
    const centerY = Math.min(crane1Y, crane2Y) - 50
    ctx.fillStyle = '#FF6B35'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('TANDEM LIFT', centerX, centerY)

    // Add directional arrows showing cranes face each other
    ctx.strokeStyle = '#FF6B35'
    ctx.lineWidth = 3
    ctx.beginPath()
    // Crane 1 arrow (pointing right)
    ctx.moveTo(crane1X - 30, crane1Y - 30)
    ctx.lineTo(crane1X - 10, crane1Y - 30)
    ctx.moveTo(crane1X - 15, crane1Y - 35)
    ctx.lineTo(crane1X - 10, crane1Y - 30)
    ctx.lineTo(crane1X - 15, crane1Y - 25)

    // Crane 2 arrow (pointing left)
    ctx.moveTo(crane2X + 30, crane2Y - 30)
    ctx.lineTo(crane2X + 10, crane2Y - 30)
    ctx.moveTo(crane2X + 15, crane2Y - 35)
    ctx.lineTo(crane2X + 10, crane2Y - 30)
    ctx.lineTo(crane2X + 15, crane2Y - 25)
    ctx.stroke()
  }
  // Helper: identify plan-view cranes
  const isPlanViewCrane = (crane: any) => {
    const id = (crane?.id || '').toLowerCase()
    const model = (crane?.model || '').toLowerCase()
    return id.endsWith('-plan') || model.includes('plan view')
  }

  // Draw custom assembled crane from parts
  const drawCustomAssembledCrane = (
    ctx: CanvasRenderingContext2D,
    parts: any[],
    boomRotation: number,
    boomExtension: number,
    craneScale: number = 1.0
  ) => {
    const scale = 1.6 * craneScale
    ctx.scale(scale, scale)

    // Sort parts by z-index
    const sortedParts = [...parts].sort((a, b) => a.zIndex - b.zIndex)

    // Draw each part
    sortedParts.forEach(part => {
      ctx.save()
      ctx.translate(part.x / 100, part.y / 100)
      ctx.rotate((part.rotation * Math.PI) / 180)

      ctx.fillStyle = part.color
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2

      // Draw the part as a rectangle
      const w = part.width / 100
      const h = part.height / 100
      ctx.fillRect(-w / 2, -h / 2, w, h)
      ctx.strokeRect(-w / 2, -h / 2, w, h)

      // Draw label
      ctx.fillStyle = '#000000'
      ctx.font = '8px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(part.label, 0, 2)

      ctx.restore()
    })

    // Find boom part and rotate it based on boomRotation
    const boomPart = parts.find(p => p.type === 'boom')
    if (boomPart) {
      ctx.save()
      ctx.translate(boomPart.x / 100, boomPart.y / 100)
      ctx.rotate((boomRotation * Math.PI) / 180)

      ctx.fillStyle = boomPart.color
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 3

      const w = boomPart.width / 100 * (0.5 + boomExtension)
      const h = boomPart.height / 100
      ctx.fillRect(0, -h / 2, w, h)
      ctx.strokeRect(0, -h / 2, w, h)

      ctx.restore()
    }
  }

  // Plan-view mobile crane (top-down) drawing used in the CAD canvas
  const drawPlanViewMobileCrane = (
    ctx: CanvasRenderingContext2D,
    crane: any,
    rotationDeg: number,
    boomExtension: number,
    craneScale: number = 1.0,
    wireframe: boolean = false
  ) => {
    // If this is a custom-built crane with parts, draw the assembled parts
    if (crane.customParts && crane.customParts.length > 0) {
      drawCustomAssembledCrane(ctx, crane.customParts, rotationDeg, boomExtension, craneScale)
      return
    }

    const scale = 1.6 * craneScale
    ctx.scale(scale, scale)

    // Body (long rectangular carrier)
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#CC9900'
    ctx.lineWidth = 2
    if (wireframe) ctx.strokeRect(-110, -13, 220, 26)
    else { ctx.fillRect(-110, -13, 220, 26); ctx.strokeRect(-110, -13, 220, 26) }

    // Superstructure deck (upper body) centered slightly forward
    ctx.fillStyle = '#E6C200'
    ctx.strokeStyle = '#B89300'
    if (wireframe) ctx.strokeRect(-20, -10, 70, 20)
    else { ctx.fillRect(-20, -10, 70, 20); ctx.strokeRect(-20, -10, 70, 20) }

    // Centerline
    ctx.save()
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = '#999999'
    ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.stroke()
    ctx.restore()

    // Wheels (6 axles)
    const axleXs = [-85, -60, -35, -10, 15, 40]
    ctx.fillStyle = '#2B2B2B'; ctx.strokeStyle = '#1A1A1A'
    for (const ax of axleXs) {
      const w = 10, h = 6, y = 13
      if (wireframe) {
        ctx.strokeRect(ax - w/2, -y - h, w, h)
        ctx.strokeRect(ax - w/2, y, w, h)
      } else {
        ctx.fillRect(ax - w/2, -y - h, w, h); ctx.strokeRect(ax - w/2, -y - h, w, h)
        ctx.fillRect(ax - w/2, y, w, h); ctx.strokeRect(ax - w/2, y, w, h)
      }
    }

    // Outriggers (two-stage beams + pads)
    const outriggers = [
      { x: -95, y: -13, angle: 210 },
      { x:  95, y: -13, angle: 330 },
      { x:  95, y:  13, angle:  30 },
      { x: -95, y:  13, angle: 150 }
    ]
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    for (const pos of outriggers) {
      const L1 = 38, L2 = 17 // two-stage
      const a = (pos.angle * Math.PI) / 180
      const midX = pos.x + L1 * Math.cos(a)
      const midY = pos.y + L1 * Math.sin(a)
      const endX = midX + L2 * Math.cos(a)
      const endY = midY + L2 * Math.sin(a)
      // stage 1
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(midX, midY); ctx.stroke()
      // stage 2 thinner
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(endX, endY); ctx.stroke()
      ctx.lineWidth = 6
      // pad
      ctx.fillStyle = '#888888'; ctx.strokeStyle = '#555555'
      if (wireframe) { ctx.beginPath(); ctx.arc(endX, endY, 12, 0, 2*Math.PI); ctx.stroke() }
      else { ctx.beginPath(); ctx.arc(endX, endY, 12, 0, 2*Math.PI); ctx.fill(); ctx.stroke() }
    }

    // Cab at front‑right corner
    ctx.fillStyle = '#4A90E2'; ctx.strokeStyle = '#2E5C8A'; ctx.lineWidth = 2
    if (wireframe) ctx.strokeRect(76, -10, 22, 20)
    else {
      ctx.fillRect(76, -10, 22, 20); ctx.strokeRect(76, -10, 22, 20)
      ctx.fillStyle = '#87CEEB'; ctx.fillRect(78, -8, 18, 7); ctx.fillRect(78, 3, 18, 5)
    }

    // Counterweight at rear
    ctx.fillStyle = '#666666'; ctx.strokeStyle = '#444444'
    if (wireframe) ctx.strokeRect(-110, -10, 28, 20)
    else { ctx.fillRect(-110, -10, 28, 20); ctx.strokeRect(-110, -10, 28, 20) }

    // Turntable ring
    const pivotX = 15, pivotY = 0
    ctx.strokeStyle = '#444'
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 18, 0, 2*Math.PI); ctx.stroke()

    // Boom rotation and length
    const boomLenMeters = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * boomExtension
    const boomLen = boomLenMeters * 2.5
    const rad = ((rotationDeg - 90) * Math.PI) / 180
    const bx = pivotX + boomLen * Math.cos(rad)
    const by = pivotY + boomLen * Math.sin(rad)

    ctx.strokeStyle = '#FF6B35'; ctx.lineWidth = 10; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bx, by); ctx.stroke()

    // Telescopic section hint
    if (boomExtension > 0.05) {
      ctx.strokeStyle = '#E55A2B'; ctx.lineWidth = 7
      const sLen = (crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * 0.55) * 2.5
      const sx = pivotX + sLen * Math.cos(rad)
      const sy = pivotY + sLen * Math.sin(rad)
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by); ctx.stroke()
    }

    // Pivot graphic
    ctx.fillStyle = '#333333'; ctx.strokeStyle = '#111111'; ctx.lineWidth = 2
    if (wireframe) { ctx.beginPath(); ctx.arc(pivotX, pivotY, 7, 0, 2*Math.PI); ctx.stroke() }
    else { ctx.beginPath(); ctx.arc(pivotX, pivotY, 7, 0, 2*Math.PI); ctx.fill(); ctx.stroke() }
  }



  // Draw realistic crane representation - MUCH LARGER
  const drawRealisticCrane = (ctx: CanvasRenderingContext2D, crane: any, boomAngle: number, boomExtension: number, craneScale: number = 1.0, loadLineLength: number = 40, wireframe: boolean = false) => {
    const scale = 3.0 * craneScale  // Much larger scale with user scaling
    ctx.scale(scale, scale)

    // Calculate boom length and position - much longer boom
    // If this is a plan view crane, draw top-down and return
    if (isPlanViewCrane(crane)) {
        drawPlanViewMobileCrane(ctx, crane, boomAngle, boomExtension, craneScale, wireframe)
        return
      }

    const boomLength = crane.boom.baseLength + (crane.boom.maxLength - crane.boom.baseLength) * boomExtension
    const boomEndX = boomLength * Math.cos((boomAngle * Math.PI) / 180) * 12  // Much longer
    const boomEndY = -boomLength * Math.sin((boomAngle * Math.PI) / 180) * 12

    if (crane.type === 'crawler') {
      drawCrawlerCrane(ctx, crane, boomEndX, boomEndY, boomAngle, loadLineLength)
    } else {
      drawMobileCrane(ctx, crane, boomEndX, boomEndY, boomAngle, loadLineLength)
    }
  }

  // Realistic crawler crane drawing - MUCH LARGER
  const drawCrawlerCrane = (ctx: CanvasRenderingContext2D, crane: any, boomEndX: number, boomEndY: number, boomAngle: number, loadLineLength: number = 40) => {
    // CRAWLER TRACKS - much larger and more detailed
    ctx.fillStyle = '#2C2C2C'
    ctx.strokeStyle = '#1A1A1A'
    ctx.lineWidth = 2

    // Track frames - much bigger
    ctx.fillRect(-120, 40, 240, 20)
    ctx.strokeRect(-120, 40, 240, 20)

    // Track pads/shoes detail
    ctx.fillStyle = '#1A1A1A'
    for (let i = 0; i < 24; i++) {
      const x = -115 + i * 10
      ctx.fillRect(x, 38, 8, 24)
    }

    // Drive sprocket and idler - larger
    ctx.fillStyle = '#444444'
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(115, 50, 12, 0, 2 * Math.PI) // Drive sprocket
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-115, 50, 12, 0, 2 * Math.PI) // Idler
    ctx.fill()
    ctx.stroke()

    // Road wheels - more and larger
    for (let i = 0; i < 8; i++) {
      const x = -84 + i * 24
      ctx.beginPath()
      ctx.arc(x, 50, 8, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }

    // MAIN CARBODY - much larger
    ctx.fillStyle = '#FFD700'  // Bright yellow
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 3
    ctx.fillRect(-100, -10, 200, 50)
    ctx.strokeRect(-100, -10, 200, 50)

    // COUNTERWEIGHT - massive and realistic
    ctx.fillStyle = '#4A4A4A'
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    ctx.fillRect(-100, -10, 50, 50)
    ctx.strokeRect(-100, -10, 50, 50)

    // Counterweight blocks pattern - detailed
    ctx.fillStyle = '#333333'
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(-95 + i * 9, -5 + j * 12, 7, 10)
      }
    }

    // Engine compartment - larger
    ctx.fillStyle = '#E6C200'
    ctx.strokeStyle = '#B8A000'
    ctx.fillRect(-40, 5, 35, 35)
    ctx.strokeRect(-40, 5, 35, 35)

    // OPERATOR CAB - properly positioned on carbody
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.fillRect(15, -25, 45, 45)
    ctx.strokeRect(15, -25, 45, 45)

    // Large cab windows - properly within cab structure
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(18, -22, 18, 35)  // Front window
    ctx.fillRect(38, -22, 18, 35)  // Side window

    // Window frames
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.strokeRect(18, -22, 18, 35)
    ctx.strokeRect(38, -22, 18, 35)

    // BOOM - starts from heel pin at back near counterweight
    const pivotX = -25  // Back of crane near counterweight
    const pivotY = -10

    // Main boom structure - VERY THICK
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 12  // Much thicker
    ctx.beginPath()
    ctx.moveTo(pivotX, pivotY)
    ctx.lineTo(boomEndX, boomEndY)
    ctx.stroke()

    // Boom lattice structure - detailed like reference
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 3
    const boomLength = Math.sqrt((boomEndX - pivotX) ** 2 + (boomEndY - pivotY) ** 2)
    const segments = Math.floor(boomLength / 30)

    for (let i = 1; i < segments; i++) {
      const ratio = i / segments
      const x = pivotX + (boomEndX - pivotX) * ratio
      const y = pivotY + (boomEndY - pivotY) * ratio

      // Lattice cross members
      const perpX = -(boomEndY - pivotY) / boomLength * 8
      const perpY = (boomEndX - pivotX) / boomLength * 8

      ctx.beginPath()
      ctx.moveTo(x + perpX, y + perpY)
      ctx.lineTo(x - perpX, y - perpY)
      ctx.stroke()

      // Diagonal bracing
      if (i % 2 === 0) {
        ctx.beginPath()
        ctx.moveTo(x + perpX, y + perpY)
        ctx.lineTo(x - perpX/2, y - perpY/2)
        ctx.moveTo(x - perpX, y - perpY)
        ctx.lineTo(x + perpX/2, y + perpY/2)
        ctx.stroke()
      }
    }

    // Boom head with pulley
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(boomEndX, boomEndY, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // LOAD BLOCK AND HOOK - realistic size with adjustable load line
    const hookX = boomEndX
    const hookY = boomEndY + loadLineLength

    // Multiple load lines (adjustable length)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(boomEndX + i, boomEndY)
      ctx.lineTo(hookX + i, hookY - 12)
      ctx.stroke()
    }

    // Load block - yellow like reference
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.fillRect(hookX - 8, hookY - 12, 16, 12)
    ctx.strokeRect(hookX - 8, hookY - 12, 16, 12)

    // Hook - realistic shape
    ctx.strokeStyle = '#444444'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(hookX, hookY)
    ctx.lineTo(hookX, hookY + 15)
    ctx.arc(hookX - 8, hookY + 15, 8, 0, Math.PI)
    ctx.lineTo(hookX - 16, hookY + 12)
    ctx.stroke()

    // Crane identification
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 6px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${crane.manufacturer} ${crane.model}`, 0, 75)
    ctx.fillText(`${crane.maxCapacity}t`, 0, 85)
  }

  // Realistic mobile crane drawing - EXACTLY like your reference image
  const drawMobileCrane = (ctx: CanvasRenderingContext2D, crane: any, boomEndX: number, boomEndY: number, boomAngle: number, loadLineLength: number = 40) => {
    // MAIN TRUCK CHASSIS - long and realistic
    ctx.fillStyle = '#FFD700'  // Bright yellow like reference
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2

    // Long truck chassis (much longer)
    ctx.fillRect(-120, 15, 240, 25)
    ctx.strokeRect(-120, 15, 240, 25)

    // Truck cab at front (no windows - this is just the truck driving cab)
    ctx.fillRect(100, -5, 30, 35)
    ctx.strokeRect(100, -5, 30, 35)

    // WHEELS - multiple axles like reference
    ctx.fillStyle = '#2C2C2C'
    ctx.strokeStyle = '#1A1A1A'
    ctx.lineWidth = 3

    // Front axle (steering)
    ctx.beginPath()
    ctx.arc(90, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // Middle axles (drive)
    ctx.beginPath()
    ctx.arc(20, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // Rear axles (dual wheels)
    ctx.beginPath()
    ctx.arc(-40, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-60, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-80, 45, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // OUTRIGGERS - extended like reference
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 6

    // Front outriggers
    ctx.beginPath()
    ctx.moveTo(60, 20)
    ctx.lineTo(140, 20)
    ctx.moveTo(-60, 20)
    ctx.lineTo(-140, 20)
    ctx.stroke()

    // Outrigger floats
    ctx.fillStyle = '#888888'
    ctx.beginPath()
    ctx.arc(140, 20, 15, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-140, 20, 15, 0, 2 * Math.PI)
    ctx.fill()

    // SUPERSTRUCTURE - yellow turntable
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.fillRect(-80, -20, 160, 35)
    ctx.strokeRect(-80, -20, 160, 35)

    // COUNTERWEIGHT - large and realistic
    ctx.fillStyle = '#4A4A4A'
    ctx.strokeStyle = '#333333'
    ctx.fillRect(-80, -20, 40, 35)
    ctx.strokeRect(-80, -20, 40, 35)

    // Counterweight details
    ctx.fillStyle = '#333333'
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(-75 + i * 8, -15 + j * 10, 6, 8)
      }
    }

    // OPERATOR CAB - positioned away from outriggers
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.fillRect(-10, -35, 40, 35)  // Moved cab away from front outrigger area
    ctx.strokeRect(-10, -35, 40, 35)

    // Cab windows - properly positioned within the cab structure
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(-8, -32, 15, 25)   // Front window of cab
    ctx.fillRect(10, -32, 15, 25)   // Side window of cab

    // Window frames
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.strokeRect(-8, -32, 15, 25)
    ctx.strokeRect(10, -32, 15, 25)

    // BOOM - starts from heel pin at back near counterweight
    const pivotX = -20  // Back of crane near counterweight
    const pivotY = -20

    // Main boom structure - THICK yellow boom
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 12  // Much thicker
    ctx.beginPath()
    ctx.moveTo(pivotX, pivotY)
    ctx.lineTo(boomEndX, boomEndY)
    ctx.stroke()

    // Boom lattice pattern - like reference image
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 3
    const boomLength = Math.sqrt((boomEndX - pivotX) ** 2 + (boomEndY - pivotY) ** 2)
    const segments = Math.floor(boomLength / 30)

    // Draw lattice cross-bracing
    for (let i = 1; i < segments; i++) {
      const ratio = i / segments
      const x = pivotX + (boomEndX - pivotX) * ratio
      const y = pivotY + (boomEndY - pivotY) * ratio

      // Cross bracing pattern
      const perpX = -(boomEndY - pivotY) / boomLength * 8
      const perpY = (boomEndX - pivotX) / boomLength * 8

      ctx.beginPath()
      ctx.moveTo(x + perpX, y + perpY)
      ctx.lineTo(x - perpX, y - perpY)
      ctx.stroke()

      // Diagonal bracing
      if (i % 2 === 0) {
        ctx.beginPath()
        ctx.moveTo(x + perpX, y + perpY)
        ctx.lineTo(x - perpX/2, y - perpY/2)
        ctx.moveTo(x - perpX, y - perpY)
        ctx.lineTo(x + perpX/2, y + perpY/2)
        ctx.stroke()
      }
    }

    // Boom head with pulley
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(boomEndX, boomEndY, 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // LOAD BLOCK AND HOOK - realistic like reference with adjustable load line
    const hookX = boomEndX
    const hookY = boomEndY + loadLineLength

    // Multiple load lines (adjustable length)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 2
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(boomEndX + i, boomEndY)
      ctx.lineTo(hookX + i, hookY - 12)
      ctx.stroke()
    }

    // Load block - yellow like reference
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    ctx.fillRect(hookX - 8, hookY - 12, 16, 12)
    ctx.strokeRect(hookX - 8, hookY - 12, 16, 12)

    // Hook - realistic shape
    ctx.strokeStyle = '#444444'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(hookX, hookY)
    ctx.lineTo(hookX, hookY + 15)
    ctx.arc(hookX - 8, hookY + 15, 8, 0, Math.PI)
    ctx.lineTo(hookX - 16, hookY + 12)
    ctx.stroke()

    // Crane identification
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 6px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${crane.manufacturer} ${crane.model}`, 0, 70)
    ctx.fillText(`${crane.maxCapacity}t`, 0, 80)
  }

  // Helper functions for realistic crane drawing (legacy - keeping for compatibility)
  const drawCraneTracks = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    const trackWidth = 12
    const trackHeight = 8
    const trackLength = points[1].x - points[0].x

    // Draw track frames
    ctx.fillStyle = '#2C2C2C'
    ctx.fillRect(points[0].x, points[0].y - trackHeight/2, trackLength, trackHeight)
    ctx.fillRect(points[0].x, points[2].y - trackHeight/2, trackLength, trackHeight)

    // Draw track pads/shoes
    ctx.fillStyle = '#1A1A1A'
    const padCount = Math.floor(trackLength / 8)
    for (let i = 0; i < padCount; i++) {
      const x = points[0].x + (i * trackLength / padCount)
      // Left track pads
      ctx.fillRect(x, points[0].y - trackHeight/2 - 2, 6, trackHeight + 4)
      // Right track pads
      ctx.fillRect(x, points[2].y - trackHeight/2 - 2, 6, trackHeight + 4)
    }

    // Draw drive sprockets
    ctx.fillStyle = '#444444'
    ctx.beginPath()
    ctx.arc(points[0].x + trackLength - 6, points[0].y, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(points[0].x + trackLength - 6, points[2].y, 6, 0, 2 * Math.PI)
    ctx.fill()

    // Draw idler wheels
    ctx.beginPath()
    ctx.arc(points[0].x + 6, points[0].y, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(points[0].x + 6, points[2].y, 6, 0, 2 * Math.PI)
    ctx.fill()

    // Draw road wheels
    for (let i = 1; i < 5; i++) {
      const x = points[0].x + (i * trackLength / 5)
      ctx.beginPath()
      ctx.arc(x, points[0].y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, points[2].y, 4, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const drawCraneBase = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    // Draw main carbody with realistic shape
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Add carbody details
    ctx.fillStyle = '#E6C200'
    const width = points[1].x - points[0].x
    const height = points[2].y - points[0].y

    // Engine compartment
    ctx.fillRect(points[0].x + 5, points[0].y + 5, width * 0.3, height * 0.6)

    // Access panels
    ctx.strokeStyle = '#B8A000'
    ctx.lineWidth = 1
    ctx.strokeRect(points[0].x + width * 0.4, points[0].y + 8, width * 0.2, height * 0.4)
    ctx.strokeRect(points[0].x + width * 0.65, points[0].y + 8, width * 0.2, height * 0.4)

    // Fuel tank
    ctx.fillStyle = '#CCCCCC'
    ctx.fillRect(points[0].x + width * 0.1, points[0].y + height * 0.7, width * 0.25, height * 0.25)
  }

  const drawCraneCounterweight = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    // Draw counterweight with realistic shape and details
    ctx.fillStyle = '#4A4A4A'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Add counterweight details
    const width = points[1].x - points[0].x
    const height = points[2].y - points[0].y

    // Counterweight blocks pattern
    ctx.fillStyle = '#333333'
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const blockWidth = width / 3 - 2
        const blockHeight = height / 2 - 2
        ctx.fillRect(
          points[0].x + 1 + i * (width / 3),
          points[0].y + 1 + j * (height / 2),
          blockWidth,
          blockHeight
        )
      }
    }

    // Lifting lugs
    ctx.fillStyle = '#666666'
    ctx.fillRect(points[0].x + width * 0.2, points[0].y - 3, 4, 6)
    ctx.fillRect(points[0].x + width * 0.8, points[0].y - 3, 4, 6)
  }

  const drawCraneCab = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    // Draw operator cab with realistic details
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    const width = points[1].x - points[0].x
    const height = points[2].y - points[0].y

    // Draw cab windows with frames
    ctx.fillStyle = '#87CEEB'
    // Front window
    ctx.fillRect(points[0].x + 2, points[0].y + 2, width * 0.4, height * 0.6)
    // Side window
    ctx.fillRect(points[0].x + width * 0.5, points[0].y + 2, width * 0.45, height * 0.6)

    // Window frames
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.strokeRect(points[0].x + 2, points[0].y + 2, width * 0.4, height * 0.6)
    ctx.strokeRect(points[0].x + width * 0.5, points[0].y + 2, width * 0.45, height * 0.6)

    // Door handle
    ctx.fillStyle = '#333333'
    ctx.fillRect(points[0].x + width * 0.9, points[0].y + height * 0.5, 2, 4)

    // Cab roof details
    ctx.fillStyle = '#E6C200'
    ctx.fillRect(points[0].x, points[0].y - 2, width, 2)

    // ROPS/FOPS structure
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(points[0].x + 1, points[0].y)
    ctx.lineTo(points[0].x + 1, points[0].y - 2)
    ctx.moveTo(points[0].x + width - 1, points[0].y)
    ctx.lineTo(points[0].x + width - 1, points[0].y - 2)
    ctx.stroke()
  }

  const drawCraneBoom = (ctx: CanvasRenderingContext2D, points: Point[], angle: number, extension: number, boomSpec: any) => {
    const boomBase = points[0]
    const boomLength = boomSpec.baseLength + (boomSpec.maxLength - boomSpec.baseLength) * extension
    const boomEndX = boomBase.x + boomLength * Math.cos((angle * Math.PI) / 180) * 8
    const boomEndY = boomBase.y - boomLength * Math.sin((angle * Math.PI) / 180) * 8

    // Draw boom main structure with realistic lattice design
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3

    // Main boom chords (top and bottom)
    const boomHeight = 6
    const topBoomEndX = boomEndX + boomHeight * Math.sin((angle * Math.PI) / 180)
    const topBoomEndY = boomEndY - boomHeight * Math.cos((angle * Math.PI) / 180)
    const bottomBoomEndX = boomEndX - boomHeight * Math.sin((angle * Math.PI) / 180)
    const bottomBoomEndY = boomEndY + boomHeight * Math.cos((angle * Math.PI) / 180)

    // Top chord
    ctx.beginPath()
    ctx.moveTo(boomBase.x + boomHeight * Math.sin((angle * Math.PI) / 180),
               boomBase.y - boomHeight * Math.cos((angle * Math.PI) / 180))
    ctx.lineTo(topBoomEndX, topBoomEndY)
    ctx.stroke()

    // Bottom chord
    ctx.beginPath()
    ctx.moveTo(boomBase.x - boomHeight * Math.sin((angle * Math.PI) / 180),
               boomBase.y + boomHeight * Math.cos((angle * Math.PI) / 180))
    ctx.lineTo(bottomBoomEndX, bottomBoomEndY)
    ctx.stroke()

    // Draw lattice structure
    ctx.lineWidth = 1.5
    const latticeSegments = Math.floor(boomLength / 15)
    for (let i = 0; i <= latticeSegments; i++) {
      const ratio = i / latticeSegments
      const segmentX = boomBase.x + (boomEndX - boomBase.x) * ratio
      const segmentY = boomBase.y + (boomEndY - boomBase.y) * ratio
      const topX = segmentX + boomHeight * Math.sin((angle * Math.PI) / 180)
      const topY = segmentY - boomHeight * Math.cos((angle * Math.PI) / 180)
      const bottomX = segmentX - boomHeight * Math.sin((angle * Math.PI) / 180)
      const bottomY = segmentY + boomHeight * Math.cos((angle * Math.PI) / 180)

      // Vertical members
      ctx.beginPath()
      ctx.moveTo(topX, topY)
      ctx.lineTo(bottomX, bottomY)
      ctx.stroke()

      // Diagonal bracing
      if (i < latticeSegments) {
        const nextRatio = (i + 1) / latticeSegments
        const nextSegmentX = boomBase.x + (boomEndX - boomBase.x) * nextRatio
        const nextSegmentY = boomBase.y + (boomEndY - boomBase.y) * nextRatio
        const nextTopX = nextSegmentX + boomHeight * Math.sin((angle * Math.PI) / 180)
        const nextTopY = nextSegmentY - boomHeight * Math.cos((angle * Math.PI) / 180)
        const nextBottomX = nextSegmentX - boomHeight * Math.sin((angle * Math.PI) / 180)
        const nextBottomY = nextSegmentY + boomHeight * Math.cos((angle * Math.PI) / 180)

        ctx.beginPath()
        ctx.moveTo(topX, topY)
        ctx.lineTo(nextBottomX, nextBottomY)
        ctx.moveTo(bottomX, bottomY)
        ctx.lineTo(nextTopX, nextTopY)
        ctx.stroke()
      }
    }

    // Draw boom sections indicators
    ctx.strokeStyle = '#E6C200'
    ctx.lineWidth = 2
    const sections = boomSpec.sections
    for (let i = 1; i < sections; i++) {
      const sectionRatio = i / sections
      const sectionX = boomBase.x + (boomEndX - boomBase.x) * sectionRatio
      const sectionY = boomBase.y + (boomEndY - boomBase.y) * sectionRatio
      const sectionTopX = sectionX + boomHeight * Math.sin((angle * Math.PI) / 180)
      const sectionTopY = sectionY - boomHeight * Math.cos((angle * Math.PI) / 180)
      const sectionBottomX = sectionX - boomHeight * Math.sin((angle * Math.PI) / 180)
      const sectionBottomY = sectionY + boomHeight * Math.cos((angle * Math.PI) / 180)

      ctx.beginPath()
      ctx.moveTo(sectionTopX, sectionTopY)
      ctx.lineTo(sectionBottomX, sectionBottomY)
      ctx.stroke()
    }

    // Draw boom head/tip
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(boomEndX, boomEndY, 3, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    return { x: boomEndX, y: boomEndY }
  }

  const drawCraneOutriggers = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = '#444444'

    const outriggerSize = 6
    const positions = [
      { x: points[0].x, y: points[0].y + 15 },
      { x: points[1].x, y: points[1].y + 15 },
      { x: points[0].x, y: points[2].y - 5 },
      { x: points[1].x, y: points[2].y - 5 }
    ]

    positions.forEach(pos => {
      ctx.fillStyle = '#666666'
      ctx.fillRect(pos.x - outriggerSize/2, pos.y - outriggerSize/2, outriggerSize, outriggerSize)
      ctx.strokeRect(pos.x - outriggerSize/2, pos.y - outriggerSize/2, outriggerSize, outriggerSize)

      ctx.fillStyle = '#888888'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y + 12, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y + outriggerSize/2)
      ctx.lineTo(pos.x, pos.y + 8)
      ctx.stroke()
    })
  }

  const drawCraneLoadBlock = (ctx: CanvasRenderingContext2D, boomEnd: Point) => {
    const hookX = boomEnd.x
    const hookY = boomEnd.y + 20

    // Draw load lines (multiple lines for realism)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(boomEnd.x + i, boomEnd.y)
      ctx.lineTo(hookX + i, hookY - 8)
      ctx.stroke()
    }

    // Draw load block with realistic details
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(hookX - 4, hookY - 8, 8, 6)
    ctx.strokeStyle = '#CC5529'
    ctx.lineWidth = 1
    ctx.strokeRect(hookX - 4, hookY - 8, 8, 6)

    // Load block sheaves
    ctx.fillStyle = '#666666'
    ctx.beginPath()
    ctx.arc(hookX - 2, hookY - 6, 1.5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(hookX + 2, hookY - 6, 1.5, 0, 2 * Math.PI)
    ctx.fill()

    // Draw hook with realistic shape
    ctx.strokeStyle = '#444444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(hookX, hookY - 2)
    ctx.lineTo(hookX, hookY + 4)
    ctx.arc(hookX - 3, hookY + 4, 3, 0, Math.PI)
    ctx.lineTo(hookX - 6, hookY + 2)
    ctx.stroke()

    // Hook safety latch
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(hookX - 6, hookY + 2)
    ctx.lineTo(hookX - 4, hookY + 1)
    ctx.stroke()
  }

  const drawCraneSpecifications = (ctx: CanvasRenderingContext2D, crane: CraneSpecifications) => {
    ctx.fillStyle = '#000000'
    ctx.font = '8px Arial'
    ctx.textAlign = 'left'

    const specs = [
      `${crane.manufacturer} ${crane.model}`,
      `${crane.maxCapacity}t / ${crane.maxRadius}m / ${crane.maxHeight}m`
    ]

    specs.forEach((spec, index) => {
      ctx.fillText(spec, -50, -60 + (index * 10))
    })
  }

  const drawCraneLoadChart = (ctx: CanvasRenderingContext2D, crane: CraneSpecifications) => {
    ctx.strokeStyle = '#00AA00'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])

    const chartPoints = crane.loadChart.slice(0, 5)
    chartPoints.forEach((point) => {
      const radius = point.radius * 10
      ctx.beginPath()
      ctx.arc(0, 0, radius, -Math.PI/2, Math.PI/2)
      ctx.stroke()
    })

    ctx.setLineDash([])
  }

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    // Apply stroke properties
    ctx.strokeStyle = element.style.stroke
    ctx.lineWidth = element.style.strokeWidth

    // Apply line cap and join
    ctx.lineCap = element.style.lineCap || 'round'
    ctx.lineJoin = element.style.lineJoin || 'round'

    // Apply fill properties
    if (element.style.fill && element.style.fill !== 'transparent') {
      ctx.fillStyle = element.style.fill
      ctx.globalAlpha = element.style.fillOpacity || 1
    }

    // Set line type with proper scaling
    const dashScale = Math.max(element.style.strokeWidth * 2, 1)
    if (element.style.lineType === 'dashed') {
      ctx.setLineDash([5 * dashScale, 5 * dashScale])
    } else if (element.style.lineType === 'dotted') {
      ctx.setLineDash([1 * dashScale, 3 * dashScale])
    } else {
      ctx.setLineDash([])
    }

    switch (element.type) {
      case 'line':
        if (element.points.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)
          ctx.lineTo(element.points[1].x, element.points[1].y)
          ctx.stroke()
        }
        break

      case 'rectangle':
        if (element.points.length >= 2) {
          const width = element.points[1].x - element.points[0].x
          const height = element.points[1].y - element.points[0].y
          ctx.beginPath()
          ctx.rect(element.points[0].x, element.points[0].y, width, height)
          ctx.stroke()
          if (element.style.fill) {
            ctx.fill()
          }
        }
        break

      case 'circle':
        if (element.points.length >= 2) {
          const radius = Math.sqrt(
            Math.pow(element.points[1].x - element.points[0].x, 2) +
            Math.pow(element.points[1].y - element.points[0].y, 2)
          )
          ctx.beginPath()
          ctx.arc(element.points[0].x, element.points[0].y, radius, 0, 2 * Math.PI)
          ctx.stroke()
          if (element.style.fill) {
            ctx.fill()
          }
        }
        break

      case 'dimension':
        if (element.points.length >= 2) {
          const p1 = element.points[0]
          const p2 = element.points[1]
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const pixelDistance = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx)

          // Dimension line offset (distance from the measured line)
          const offset = 30
          const offsetX = Math.sin(angle) * offset
          const offsetY = -Math.cos(angle) * offset

          // Extension line length
          const extensionLength = 10

          ctx.save()
          ctx.strokeStyle = element.style.stroke
          ctx.fillStyle = element.style.stroke
          ctx.lineWidth = 1

          // Draw extension lines (from endpoints perpendicular to dimension line)
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p1.x + offsetX, p1.y + offsetY)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(p2.x, p2.y)
          ctx.lineTo(p2.x + offsetX, p2.y + offsetY)
          ctx.stroke()

          // Draw dimension line
          const dimP1 = { x: p1.x + offsetX, y: p1.y + offsetY }
          const dimP2 = { x: p2.x + offsetX, y: p2.y + offsetY }

          ctx.beginPath()
          ctx.moveTo(dimP1.x, dimP1.y)
          ctx.lineTo(dimP2.x, dimP2.y)
          ctx.stroke()

          // Draw arrows (arrowheads)
          const arrowLength = 8
          const arrowAngle = Math.PI / 6

          // Start arrow
          ctx.beginPath()
          ctx.moveTo(dimP1.x, dimP1.y)
          ctx.lineTo(
            dimP1.x + arrowLength * Math.cos(angle - arrowAngle),
            dimP1.y + arrowLength * Math.sin(angle - arrowAngle)
          )
          ctx.moveTo(dimP1.x, dimP1.y)
          ctx.lineTo(
            dimP1.x + arrowLength * Math.cos(angle + arrowAngle),
            dimP1.y + arrowLength * Math.sin(angle + arrowAngle)
          )
          ctx.stroke()

          // End arrow
          ctx.beginPath()
          ctx.moveTo(dimP2.x, dimP2.y)
          ctx.lineTo(
            dimP2.x + arrowLength * Math.cos(angle + Math.PI - arrowAngle),
            dimP2.y + arrowLength * Math.sin(angle + Math.PI - arrowAngle)
          )
          ctx.moveTo(dimP2.x, dimP2.y)
          ctx.lineTo(
            dimP2.x + arrowLength * Math.cos(angle + Math.PI + arrowAngle),
            dimP2.y + arrowLength * Math.sin(angle + Math.PI + arrowAngle)
          )
          ctx.stroke()

          // Draw dimension text above the dimension line
          const midX = (dimP1.x + dimP2.x) / 2
          const midY = (dimP1.y + dimP2.y) / 2
          const textOffsetX = Math.sin(angle) * 15
          const textOffsetY = -Math.cos(angle) * 15

          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'

          // Check if this is a pixel dimension or meter dimension
          const isDimensionPixels = (element as any).isDimensionPixels
          const dimensionText = isDimensionPixels
            ? `${pixelDistance.toFixed(1)} px`
            : formatDistance(pixelDistance)

          ctx.fillText(dimensionText, midX + textOffsetX, midY + textOffsetY)

          ctx.restore()
        }
        break

      case 'text':
        if (element.points.length >= 1 && element.text) {
          ctx.fillStyle = element.style.stroke
          const fontSize = element.fontSize || element.style.fontSize || 16
          const fontFamily = element.fontFamily || element.style.fontFamily || 'Arial'
          ctx.font = `${fontSize}px ${fontFamily}`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'

          // Handle multi-line text
          const lines = element.text.split('\n')
          const lineHeight = fontSize * 1.2
          lines.forEach((line, index) => {
            ctx.fillText(line, element.points[0].x, element.points[0].y + (index * lineHeight))
          })
        }
        break

      case 'polyline':
        if (element.points.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y)
          }
          if (element.closed) {
            ctx.closePath()
          }
          ctx.stroke()
          if (element.style.fill && element.closed) {
            ctx.fill()
          }
        }
        break

      case 'arc':
        if (element.points.length >= 2 && element.radius) {
          const centerX = element.points[0].x
          const centerY = element.points[0].y
          const startAngle = element.startAngle || 0
          const endAngle = element.endAngle || Math.PI * 2

          ctx.beginPath()
          ctx.arc(centerX, centerY, element.radius, startAngle, endAngle)
          ctx.stroke()
        }
        break

      case 'spline':

        if (element.points.length >= 3) {
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)

          // Simple quadratic curve through points
          for (let i = 1; i < element.points.length - 1; i++) {
            const cp1x = element.points[i].x
            const cp1y = element.points[i].y
            const cp2x = (element.points[i].x + element.points[i + 1].x) / 2
            const cp2y = (element.points[i].y + element.points[i + 1].y) / 2
            ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y)
          }

          // Final point
          if (element.points.length > 2) {
            const lastPoint = element.points[element.points.length - 1]
            ctx.lineTo(lastPoint.x, lastPoint.y)
          }

          ctx.stroke()
        }
        break

      case 'table':
        if (element.points.length >= 1 && element.rows && element.columns) {
          const startX = element.points[0].x
          const startY = element.points[0].y
          const cellWidth = element.cellWidth || 120
          const cellHeight = element.cellHeight || 30
          const headerStyle = element.headerStyle || {
            backgroundColor: '#374151',
            textColor: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold'
          }
          const cellStyle = element.cellStyle || {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontSize: 12,
            fontWeight: 'normal'
          }

          ctx.save()

          // Draw header row background
          if (element.headers) {
            ctx.fillStyle = headerStyle.backgroundColor || '#374151'
            ctx.fillRect(startX, startY, element.columns * cellWidth, cellHeight)
          }

          // Draw data cell backgrounds
          if (element.tableData) {
            ctx.fillStyle = cellStyle.backgroundColor || '#ffffff'
            for (let row = 0; row < element.tableData.length; row++) {
              const y = startY + (row + 1) * cellHeight
              ctx.fillRect(startX, y, element.columns * cellWidth, cellHeight)
            }
          }

          // Draw table grid lines
          ctx.strokeStyle = element.style.stroke || '#000000'
          ctx.lineWidth = element.style.strokeWidth || 1
          ctx.beginPath()

          // Horizontal lines
          for (let i = 0; i <= element.rows; i++) {
            const y = startY + (i * cellHeight)
            ctx.moveTo(startX, y)
            ctx.lineTo(startX + (element.columns * cellWidth), y)
          }

          // Vertical lines
          for (let i = 0; i <= element.columns; i++) {
            const x = startX + (i * cellWidth)
            ctx.moveTo(x, startY)
            ctx.lineTo(x, startY + (element.rows * cellHeight))
          }

          ctx.stroke()

          // Draw headers
          if (element.headers) {
            ctx.fillStyle = headerStyle.textColor || '#ffffff'
            ctx.font = `${headerStyle.fontWeight || 'bold'} ${headerStyle.fontSize || 14}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            element.headers.forEach((header, i) => {
              if (i < element.columns!) {
                const x = startX + (i * cellWidth) + (cellWidth / 2)
                const y = startY + (cellHeight / 2)
                ctx.fillText(header, x, y)
              }
            })
          }

          // Draw table data
          if (element.tableData) {
            ctx.fillStyle = cellStyle.textColor || '#000000'
            ctx.font = `${cellStyle.fontWeight || 'normal'} ${cellStyle.fontSize || 12}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            element.tableData.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                if (rowIndex < element.tableData!.length && colIndex < element.columns!) {
                  const x = startX + (colIndex * cellWidth) + (cellWidth / 2)
                  const y = startY + ((rowIndex + 1) * cellHeight) + (cellHeight / 2)
                  ctx.fillText(cell || '', x, y)
                }
              })
            })
          }

          ctx.restore()
        }
        break

      case 'titleblock':
        if (element.points.length >= 2 && element.projectInfo) {
          const startX = Math.min(element.points[0].x, element.points[1].x)
          const startY = Math.min(element.points[0].y, element.points[1].y)
          const width = Math.abs(element.points[1].x - element.points[0].x)
          const height = Math.abs(element.points[1].y - element.points[0].y)

          // Draw title block border
          ctx.beginPath()
          ctx.rect(startX, startY, width, height)
          ctx.stroke()

          // Draw internal divisions
          const sectionHeight = height / 4
          const leftWidth = width * 0.7

          // Horizontal divisions
          for (let i = 1; i < 4; i++) {
            ctx.beginPath()
            ctx.moveTo(startX, startY + (i * sectionHeight))
            ctx.lineTo(startX + width, startY + (i * sectionHeight))
            ctx.stroke()
          }

          // Vertical division
          ctx.beginPath()
          ctx.moveTo(startX + leftWidth, startY)
          ctx.lineTo(startX + leftWidth, startY + height)
          ctx.stroke()

          // Add text content
          ctx.fillStyle = element.style.stroke
          ctx.textAlign = 'left'

          // Title
          ctx.font = 'bold 16px Arial'
          ctx.fillText(element.projectInfo.title || 'Untitled', startX + 10, startY + 25)

          // Project details
          ctx.font = '12px Arial'
          const info = element.projectInfo
          const textY = startY + sectionHeight + 15

          ctx.fillText(`Project: ${info.projectNumber || 'N/A'}`, startX + 10, textY)
          ctx.fillText(`Drawn by: ${info.drawnBy || 'N/A'}`, startX + 10, textY + 20)
          ctx.fillText(`Date: ${info.date || 'N/A'}`, startX + 10, textY + 40)

          // Right side info
          ctx.textAlign = 'center'
          const rightX = startX + leftWidth + ((width - leftWidth) / 2)
          ctx.fillText(`Scale: ${info.scale || '1:1'}`, rightX, startY + 20)
          ctx.fillText(`Rev: ${info.revision || 'A'}`, rightX, startY + 40)
          ctx.fillText(`Sheet: ${info.sheet || '1 of 1'}`, rightX, startY + 60)
        }
        break

      case 'logo':
        if (element.points.length >= 1 && element.logoUrl) {
          const x = element.points[0].x
          const y = element.points[0].y
          const width = element.logoWidth || 100
          const height = element.logoHeight || 50

          // Use preloaded image if available
          const preloadedImg = loadedImages.get(element.logoUrl)
          if (preloadedImg) {
            try {
              ctx.save()
              ctx.drawImage(preloadedImg, x, y, width, height)
              ctx.restore()
            } catch (error) {
              console.error('Error drawing image:', error)
              // Draw placeholder on error
              ctx.beginPath()
              ctx.rect(x, y, width, height)
              ctx.stroke()

              ctx.fillStyle = element.style.stroke
              ctx.font = '12px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('ERROR', x + width/2, y + height/2 + 4)
            }
          } else {
            // Draw placeholder while loading or if image not found
            ctx.beginPath()
            ctx.rect(x, y, width, height)
            ctx.stroke()

            ctx.fillStyle = element.style.stroke
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('LOADING...', x + width/2, y + height/2 + 4)
          }
        }
        break

      case 'image':
        if (element.points.length >= 1 && element.imageUrl) {
          const x = element.points[0].x
          const y = element.points[0].y
          const width = element.imageWidth || 200
          const height = element.imageHeight || 150
          const opacity = element.imageOpacity || 0.5

          // Use preloaded image if available
          const preloadedImg = loadedImages.get(element.imageUrl)
          if (preloadedImg) {
            try {
              ctx.save()
              ctx.globalAlpha = opacity
              ctx.drawImage(preloadedImg, x, y, width, height)
              ctx.restore()

              // Draw border for selection
              if (selectedElement === element.id) {
                ctx.save()
                ctx.strokeStyle = '#3b82f6'
                ctx.lineWidth = 2
                ctx.setLineDash([5, 5])
                ctx.strokeRect(x, y, width, height)
                ctx.restore()
              }
            } catch (error) {
              console.error('Error drawing image:', error)
              // Draw placeholder on error
              ctx.save()
              ctx.strokeStyle = '#ef4444'
              ctx.setLineDash([5, 5])
              ctx.strokeRect(x, y, width, height)
              ctx.fillStyle = '#ef4444'
              ctx.font = '12px Arial'
              ctx.textAlign = 'center'
              ctx.fillText('IMAGE ERROR', x + width/2, y + height/2 + 4)
              ctx.restore()
            }
          } else {
            // Draw placeholder while loading
            ctx.save()
            ctx.strokeStyle = '#6b7280'
            ctx.setLineDash([5, 5])
            ctx.strokeRect(x, y, width, height)
            ctx.fillStyle = '#6b7280'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('LOADING IMAGE...', x + width/2, y + height/2 + 4)
            ctx.restore()
          }
        }
        break

      case 'block':
        if (element.craneData && element.points.length >= 1) {
          // Render crane
          drawCrane(ctx, element)
        } else if (element.chainBlockConfig && element.points.length >= 1) {
          // Render chain block
          const pos = element.points[0]
          drawChainBlock(ctx, pos.x, pos.y, element.chainBlockConfig)
        } else if (element.blockElements && element.points.length >= 1) {
          const insertPoint = element.points[0]
          const scale = element.blockScale || 1
          const rotation = element.blockRotation || 0

          ctx.save()
          ctx.translate(insertPoint.x, insertPoint.y)
          ctx.scale(scale, scale)
          ctx.rotate(rotation)

          // Draw each element in the block
          element.blockElements.forEach(blockEl => {
            drawElement(ctx, blockEl)
          })

          ctx.restore()

          // Draw selection border if selected
          if (selectedElement === element.id) {
            ctx.save()
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])

            // Calculate block bounds for selection rectangle
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
            element.blockElements.forEach(blockEl => {
              blockEl.points.forEach(point => {
                const scaledX = insertPoint.x + (point.x * scale)
                const scaledY = insertPoint.y + (point.y * scale)
                minX = Math.min(minX, scaledX)
                minY = Math.min(minY, scaledY)
                maxX = Math.max(maxX, scaledX)
                maxY = Math.max(maxY, scaledY)
              })
            })

            ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10)
            ctx.restore()
          }
        }
        break

      case 'assembled-crane':
        // Draw user-assembled crane if it has data and a position
        if (element.assembledCraneData && element.points.length >= 1) {
          // Call the function that renders the assembled crane with all its parts
          drawAssembledCrane(ctx, element)
        }
        break



    }

    // Reset drawing properties
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  const findSnapPoint = (mousePos: Point): Point | null => {
    if (!snapToObjects) return null

    const snapDistance = 10 / zoom
    let closestPoint: Point | null = null
    let minDistance = snapDistance

    // Check all element points for snapping
    elements.forEach(element => {
      // Safety check: ensure element.points exists and is an array
      if (element.points && Array.isArray(element.points)) {
        element.points.forEach(point => {
          const distance = Math.sqrt(
            Math.pow(mousePos.x - point.x, 2) + Math.pow(mousePos.y - point.y, 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            closestPoint = point
          }
        })
      }

      // For circles, also check center and circumference
      if (element.type === 'circle' && element.points && element.points.length >= 2) {
        const center = element.points[0]
        const radius = Math.sqrt(
          Math.pow(element.points[1].x - center.x, 2) +
          Math.pow(element.points[1].y - center.y, 2)
        )

        // Check center
        const centerDistance = Math.sqrt(
          Math.pow(mousePos.x - center.x, 2) + Math.pow(mousePos.y - center.y, 2)
        )
        if (centerDistance < minDistance) {
          minDistance = centerDistance
          closestPoint = center
        }
      }
    })

    return closestPoint
  }

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    // Get canvas bounding rectangle
    const rect = canvas.getBoundingClientRect()

    // Calculate mouse position relative to canvas (simplified)
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    // Account for rulers offset (in canvas pixels)
    const rulerOffset = showRulers ? 30 : 0
    const adjustedX = canvasX - rulerOffset
    const adjustedY = canvasY - rulerOffset

    // Convert to world coordinates
    let x = (adjustedX / zoom) - (pan.x)
    let y = (adjustedY / zoom) - (pan.y)

    const rawPoint = { x, y }

    // Check for object snapping first
    const snapPoint = findSnapPoint(rawPoint)

    // Snap to grid if enabled
    if (snapToGrid && showGrid && !snapPoint) {
      const gridSize = 20
      x = Math.round(x / gridSize) * gridSize
      y = Math.round(y / gridSize) * gridSize
    }

    return snapPoint || { x, y }
  }, [zoom, pan.x, pan.y, showRulers, snapToGrid, showGrid, findSnapPoint])

  // Check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    if (polygon.length < 3) return false

    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside
      }
    }
    return inside
  }

  // Check if an element is inside the lasso selection (robust across shapes)
  const isElementInLasso = (element: DrawingElement, lassoPolygon: Point[]): boolean => {
    if (lassoPolygon.length < 3) return false

    // Helpers
    const segIntersect = (p1: Point, p2: Point, q1: Point, q2: Point): boolean => {
      const o = (a: Point, b: Point, c: Point) => (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
      const onSeg = (a: Point, b: Point, c: Point) => Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y)
      const o1 = o(p1, p2, q1), o2 = o(p1, p2, q2), o3 = o(q1, q2, p1), o4 = o(q1, q2, p2)
      if (o1 === 0 && onSeg(p1, p2, q1)) return true
      if (o2 === 0 && onSeg(p1, p2, q2)) return true
      if (o3 === 0 && onSeg(q1, q2, p1)) return true
      if (o4 === 0 && onSeg(q1, q2, p2)) return true
      return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0)
    }

    const polyIntersectsPolyline = (poly: Point[], pts: Point[]): boolean => {
      for (let i = 0; i < poly.length; i++) {
        const a1 = poly[i]
        const a2 = poly[(i + 1) % poly.length]
        for (let j = 0; j < pts.length - 1; j++) {
          if (segIntersect(a1, a2, pts[j], pts[j + 1])) return true
        }
      }
      return false
    }

    // Quick accept: any defining point inside lasso
    if (element.points?.some(p => isPointInPolygon(p, lassoPolygon))) return true

    switch (element.type) {
      case 'line':
      case 'polyline':
      case 'spline': {
        const pts = element.points || []
        if (pts.length >= 2 && polyIntersectsPolyline(lassoPolygon, pts)) return true
        return false
      }
      case 'rectangle': {
        // Derive rectangle corners from two opposite points or from all points
        if (!element.points || element.points.length === 0) return false
        let xs = element.points.map(p => p.x)
        let ys = element.points.map(p => p.y)
        const minX = Math.min(...xs), maxX = Math.max(...xs)
        const minY = Math.min(...ys), maxY = Math.max(...ys)
        const rect = [
          { x: minX, y: minY }, { x: maxX, y: minY },
          { x: maxX, y: maxY }, { x: minX, y: maxY }, { x: minX, y: minY }
        ]
        if (rect.some(p => isPointInPolygon(p, lassoPolygon))) return true
        if (polyIntersectsPolyline(lassoPolygon, rect)) return true
        return false
      }
      case 'circle':
      case 'arc': {
        // Approximate circle/arc with a polyline and test
        const center = element.points?.[0]
        const radius = element.radius || (element.points?.[1] ? Math.hypot(element.points[1].x - element.points[0].x, element.points[1].y - element.points[0].y) : 0)
        if (!center || radius <= 0) return false
        const start = element.type === 'arc' ? (element.startAngle ?? 0) : 0
        const end = element.type === 'arc' ? (element.endAngle ?? Math.PI * 2) : Math.PI * 2
        const steps = Math.max(12, Math.ceil(Math.abs(end - start) * 16))
        const pts: Point[] = []
        for (let i = 0; i <= steps; i++) {
          const t = start + (i / steps) * (end - start)
          pts.push({ x: center.x + radius * Math.cos(t), y: center.y + radius * Math.sin(t) })
        }
        if (pts.some(p => isPointInPolygon(p, lassoPolygon))) return true
        if (polyIntersectsPolyline(lassoPolygon, pts)) return true
        return false
      }
      default: {
        // Generic: check bounding polyline
        const pts = element.points || []
        if (pts.length >= 2 && polyIntersectsPolyline(lassoPolygon, pts)) return true
        return false
      }
    }
  }

  // Helper: sample points for joinable geometries
  const pointsForJoin = (el: DrawingElement): Point[] => {
    if (el.type === 'line' || el.type === 'polyline') return [...el.points]

    // Treat rectangles as joinable by converting to corner polyline (open path)
    if (el.type === 'rectangle' && el.points && el.points.length >= 2) {
      const xs = el.points.map(p => p.x)
      const ys = el.points.map(p => p.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minY = Math.min(...ys), maxY = Math.max(...ys)
      return [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ]
    }

    // Circles sampled to polyline points
    if (el.type === 'circle' && el.points && el.points.length >= 1) {
      const center = el.points[0]
      const r = el.radius || 0
      const steps = 48
      const pts: Point[] = []
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * 2 * Math.PI
        pts.push({ x: center.x + r * Math.cos(t), y: center.y + r * Math.sin(t) })
      }
      return pts
    }

    if (el.type === 'arc' && el.points && el.points.length > 0 && el.radius) {
      const center = el.points[0]
      const start = el.startAngle ?? 0
      const end = el.endAngle ?? Math.PI * 2
      const steps = Math.max(8, Math.min(64, Math.ceil(Math.abs(end - start) * 12)))
      const pts: Point[] = []
      for (let i = 0; i <= steps; i++) {
        const t = start + (i / steps) * (end - start)
        pts.push({ x: center.x + el.radius * Math.cos(t), y: center.y + el.radius * Math.sin(t) })
      }
      return pts
    }
    if (el.type === 'spline') {
      // Fallback: use existing points if present, otherwise try controlPoints
      if (el.points && el.points.length >= 2) return [...el.points]
      if (el.controlPoints && el.controlPoints.length >= 2) return [...el.controlPoints]
    }
    return [] // non-path objects (text, images, etc.)
  }

  // Join: only open path geometries; other shapes remain unchanged
  const joinSelectedElements = () => {
    if (selectedElements.length < 2) {
      alert('Select at least 2 objects to join')
      return
    }

    // Build segments from joinable types
    const selected = elements.filter(el => selectedElements.includes(el.id))
    const segments = selected
      .map(el => ({ el, pts: pointsForJoin(el) }))
      .filter(s => s.pts.length >= 2)

    if (segments.length < 2) {
      alert('Join supports lines/polylines/arcs/splines. Other shapes are left unchanged.')
      return
    }

    // Greedy nearest-endpoint ordering
    const used = new Set<string>()
    const ordered: { id: string; pts: Point[] }[] = []

    // seed
    const seed = segments[0]
    used.add(seed.el.id)
    ordered.push({ id: seed.el.id, pts: [...seed.pts] })

    while (used.size < segments.length) {
      const last = ordered[ordered.length - 1].pts
      const tail = last[last.length - 1]
      let bestIdx = -1
      let bestDist = Infinity
      let reverse = false

      for (let i = 0; i < segments.length; i++) {
        if (used.has(segments[i].el.id)) continue
        const a = segments[i].pts[0]
        const b = segments[i].pts[segments[i].pts.length - 1]
        const da = Math.hypot(a.x - tail.x, a.y - tail.y)
        const db = Math.hypot(b.x - tail.x, b.y - tail.y)
        if (da < bestDist) { bestDist = da; bestIdx = i; reverse = false }
        if (db < bestDist) { bestDist = db; bestIdx = i; reverse = true }
      }

      if (bestIdx === -1) break
      const seg = segments[bestIdx]
      const pts = reverse ? [...seg.pts].reverse() : seg.pts
      const startIdx = bestDist < 1e-6 ? 1 : 0
      const lastArr = ordered[ordered.length - 1].pts
      lastArr.push(...pts.slice(startIdx))
      used.add(seg.el.id)
    }

    // Flatten to a single path
    const path = ordered[0].pts
    if (path.length < 2) {
      alert('Not enough geometry to join')
      return
    }

    // Style/layer from first joinable element
    const firstEl = segments[0].el
    const baseStyle = firstEl.style || { stroke: currentStrokeColor, strokeWidth: currentStrokeWidth }

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'polyline',
      points: path,
      style: {
        stroke: baseStyle.stroke || currentStrokeColor,
        strokeWidth: baseStyle.strokeWidth || currentStrokeWidth,
        lineCap: baseStyle.lineCap || 'round',
        lineJoin: baseStyle.lineJoin || 'round',
        lineType: baseStyle.lineType,
        fill: 'transparent'
      },
      layer: firstEl.layer
    }

    // Keep non-joinable shapes; remove only the ones we joined
    const joinedIds = new Set(segments.map(s => s.el.id))
    const remaining = elements.filter(el => !joinedIds.has(el.id))
    const newElements = [...remaining, newElement]

    setElements(newElements)
    setSelectedElements([newElement.id])
    addToHistory(newElements)
    console.log(`Joined ${segments.length} path elements into a single polyline`)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e)



    // Handle advanced commands first
    if (advancedCommand) {
      handleAdvancedCommandClick(point, e)
      return
    }

    if (tool === 'select') {
      console.log('Select tool clicked at:', point)

      // Check if Ctrl/Cmd is held for lasso selection
      if (e.ctrlKey || e.metaKey) {
        console.log('Starting lasso selection')
        setIsLassoSelecting(true)
        setLassoStartPoint(point)
        setLassoPath([point])
        setIsDrawing(true)
        return
      }

      // Use findElementAtPoint for consistent element detection
      const elementId = findElementAtPoint(point)
      console.log('Found element ID:', elementId)
      const clickedElement = elementId ? elements.find(el => el.id === elementId) : null
      console.log('Clicked element:', clickedElement)

      if (clickedElement) {
        console.log('Setting selected element:', clickedElement.id, clickedElement.type)
        setSelectedElement(clickedElement.id)

        // Handle title block interaction - single click to drag, double-click to edit
        if (clickedElement.type === 'titleblock') {
          if (e.detail === 2) {
            // Double-click to edit title block
            setEditingTitleBlock(clickedElement.id)
            setShowTitleBlockEditDialog(true)
          } else {
            // Single click to start dragging
            setIsDraggingTitleBlock(true)
            setDragStartPos(point)
            setIsDrawing(true)
          }
        }

        // Handle table interaction - always allow dragging, double-click to edit
        if (clickedElement.type === 'table') {
          if (e.detail === 2) {
            // Double-click to edit table content
            setEditingTable(clickedElement.id)
            setShowTableEditDialog(true)
          } else {
            // Single click to start dragging (anywhere on table)
            setIsDraggingTable(true)
            setDragStartPos(point)
            setIsDrawing(true)
          }
        }

        // Handle logo/image interaction - dragging and resizing
        if (clickedElement.type === 'logo' || clickedElement.type === 'image') {
          const x = clickedElement.points[0].x
          const y = clickedElement.points[0].y
          const width = clickedElement.type === 'logo' ? (clickedElement.logoWidth || 100) : (clickedElement.imageWidth || 200)
          const height = clickedElement.type === 'logo' ? (clickedElement.logoHeight || 50) : (clickedElement.imageHeight || 150)
          const handleSize = 8

          // Check if clicking on resize handle first
          const handles = [
            { x: x + width, y: y + height, type: 'se' as const },
            { x: x, y: y + height, type: 'sw' as const },
            { x: x + width, y: y, type: 'ne' as const },
            { x: x, y: y, type: 'nw' as const },
          ]

          const clickedHandle = handles.find(handle =>
            Math.abs(point.x - handle.x) <= handleSize/2 &&
            Math.abs(point.y - handle.y) <= handleSize/2
          )

          if (clickedHandle) {
            // Start resizing
            setIsResizing(true)
            setResizeHandle(clickedHandle.type)
            setIsDrawing(true)
          } else {
            // Start dragging the image
            setMovingElement(clickedElement.id)
            setMoveStartPos(point)
            setIsDrawing(true)
          }
        }

        // Handle text interaction - single click opens properties, drag to move
        if (clickedElement.type === 'text') {
          if (e.detail === 2) {
            // Double-click to open text properties dialog
            setTextDialogProperties({
              text: clickedElement.text || '',
              fontSize: clickedElement.fontSize || clickedElement.style?.fontSize || 16,
              fontFamily: clickedElement.fontFamily || clickedElement.style?.fontFamily || 'Arial',
              color: clickedElement.style?.stroke || '#ffffff'
            })
            setEditingText(clickedElement.id) // Store which text we're editing
            setShowTextPropertiesDialog(true)
          } else {
            // Single click to start dragging text
            setMovingElement(clickedElement.id)
            setMoveStartPos(point)
            setIsDrawing(true)
          }
        }

        // Handle crane interaction - double-click to configure
        if (clickedElement.type === 'block' && clickedElement.craneData) {
          const currentTime = Date.now()
          if (lastClickElement === clickedElement.id && currentTime - lastClickTime < 300) {
            // Double-click detected - open crane configuration
            handleConfigureCrane(clickedElement)
          } else {
            // Single click - start dragging
            setMovingElement(clickedElement.id)
            setMoveStartPos(point)
            setIsDrawing(true)
          }
          setLastClickTime(currentTime)
          setLastClickElement(clickedElement.id)
        }
      } else {
        setSelectedElement(null)
      }
      return
    }

    if (tool === 'pan') {
      setIsPanning(true)
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setPanStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        setPanStartOffset({ x: pan.x, y: pan.y })
      }
      return
    }

    if (tool === 'move') {
      const elementId = findElementAtPoint(point)
      if (elementId) {
        setMovingElement(elementId)
        setMoveStartPos(point)
        setIsDrawing(true)
      }
      return
    }

    if (tool === 'rotate') {
      const elementId = findElementAtPoint(point)
      if (elementId) {
        const element = elements.find(el => el.id === elementId)
        if (element) {
          setRotatingElement(elementId)
          setSelectedElement(elementId)
          const center = calculateElementCenter(element)
          setRotationCenter(center)

          // Calculate initial angle from center to mouse position
          const dx = point.x - center.x
          const dy = point.y - center.y
          setRotationStartAngle(Math.atan2(dy, dx))
          setIsDrawing(true)
        }
      }
      return
    }

    if (tool === 'scale') {
      const elementId = findElementAtPoint(point)
      if (elementId) {
        const element = elements.find(el => el.id === elementId)
        if (element) {
          setScalingElement(elementId)
          setSelectedElement(elementId)
          const center = calculateElementCenter(element)
          setScaleCenter(center)

          // Calculate initial distance from center to mouse position
          const startDistance = calculateDistance(center, point)
          setScaleStartDistance(startDistance)
          setCurrentScaleFactor(1)
          setIsDrawing(true)
        }
      }
      return
    }
    const currentLayerData = layers.find(l => l.id === currentLayer)

    // Handle measurement tools
    if (tool === 'measure') {
      if (currentElement && currentElement.points.length === 1) {
        // Complete measurement
        const distance = calculateDistance(currentElement.points[0], point)
        const newMeasurement = {
          id: Date.now().toString(),
          type: 'distance',
          value: distance,
          points: [currentElement.points[0], point]
        }
        setMeasurements([...measurements, newMeasurement])
        setCurrentElement(null)
        setIsDrawing(false)
        alert(`Distance: ${formatMeasurement(distance)}`)
      } else {
        // Start measurement
        setCurrentElement({
          id: Date.now().toString(),
          type: 'line',
          points: [point],
          style: { stroke: '#10b981', strokeWidth: 2, lineType: 'dashed' },
          layer: currentLayer
        })
        setIsDrawing(true)
      }
      return
    }

    if (tool === 'area') {
      if (!isDrawingPolyline) {
        // Start area measurement
        setCurrentPolyline([point])
        setIsDrawingPolyline(true)
      } else {
        // Add point to area measurement
        const newPolyline = [...currentPolyline, point]
        setCurrentPolyline(newPolyline)

        // Double-click to finish area measurement
        if (e.detail === 2 || e.button === 2) {
          const area = calculateArea(newPolyline)
          const newMeasurement = {
            id: Date.now().toString(),
            type: 'area',
            value: area,
            points: newPolyline
          }
          setMeasurements([...measurements, newMeasurement])
          setCurrentPolyline([])
          setIsDrawingPolyline(false)
          alert(`Area: ${formatMeasurement(area)} ${units}²`)
        }
      }
      return
    }

    // Handle polyline tool specially
    if (tool === 'polyline') {
      if (!isDrawingPolyline) {
        // Start new polyline
        setCurrentPolyline([point])
        setIsDrawingPolyline(true)
      } else {
        // Add point to current polyline
        const newPolyline = [...currentPolyline, point]
        setCurrentPolyline(newPolyline)

        // Double-click or right-click to finish polyline
        if (e.detail === 2 || e.button === 2) {
          const newElement: DrawingElement = {
            id: Date.now().toString(),
            type: 'polyline',
            points: newPolyline,
            style: {
              stroke: currentLayerData?.color || '#3b82f6',
              strokeWidth: 2
            },
            layer: currentLayer
          }

          const newElements = [...elements, newElement]
          setElements(newElements)
          addToHistory(newElements)

          // Reset polyline state
          setCurrentPolyline([])
          setIsDrawingPolyline(false)
        }
      }
      return
    }



    setIsDrawing(true)

    if (tool === 'text') {
      // Open text properties dialog
      setTextDialogProperties({
        text: '',
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
        color: currentStrokeColor
      })
      setShowTextPropertiesDialog(true)

      // Store the click position for later use
      setTextClickPosition(point)
      setIsDrawing(false)
      return
    }

    if (tool === 'table') {
      console.log('Table tool clicked, opening configuration dialog')
      // Reset table config to defaults
      setTableConfig({
        rows: 3,
        columns: 3,
        headers: ['Header 1', 'Header 2', 'Header 3'],
        data: [
          ['', '', ''],
          ['', '', '']
        ],
        cellWidth: 120,
        cellHeight: 30,
        headerStyle: {
          backgroundColor: '#374151',
          textColor: '#ffffff',
          fontSize: 14,
          fontWeight: 'bold'
        },
        cellStyle: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontSize: 12,
          fontWeight: 'normal'
        }
      })
      // Store click position for table placement
      setTableClickPosition(point)
      setShowTableConfigDialog(true)
      setIsDrawing(false)
      return
    }

    if (tool === 'titleblock') {
      setShowTitleBlockDialog(true)
      setIsDrawing(false)
      return
    }

    if (tool === 'logo') {
      setShowLogoDialog(true)
      setIsDrawing(false)
      return
    }

    if (tool === 'image') {
      // Create file input for image upload
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageUrl = event.target?.result as string
            const img = new window.Image()
            img.onload = () => {
              // Calculate appropriate size (max 400px width/height)
              const maxSize = 400
              let width = img.width
              let height = img.height

              if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height)
                width = width * ratio
                height = height * ratio
              }

              // Add image to loaded images map
              setLoadedImages(prev => new Map(prev).set(imageUrl, img))

              const newElement: DrawingElement = {
                id: Date.now().toString(),
                type: 'image',
                points: [point],
                style: {
                  stroke: 'transparent',
                  strokeWidth: 0
                },
                layer: currentLayer,
                imageUrl,
                imageWidth: width,
                imageHeight: height,
                imageOpacity: 0.5 // Semi-transparent for tracing
              }

              const newElements = [...elements, newElement]
              setElements(newElements)
              setBackgroundImages([...backgroundImages, newElement])
              addToHistory(newElements)
            }
            img.src = imageUrl
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
      setIsDrawing(false)
      return
    }

    if (tool === 'arc') {
      if (arcStep === 0) {
        // Step 1: Set center point
        setArcCenter(point)
        setArcStep(1)
        setIsDrawing(true)
      } else if (arcStep === 1) {
        // Step 2: Set start point (defines radius and start angle)
        setArcStartPoint(point)
        setArcStep(2)
      } else if (arcStep === 2) {
        // Step 3: Set end point and create the arc
        const radius = calculateDistance(arcCenter, arcStartPoint)
        let startAngle = Math.atan2(arcStartPoint.y - arcCenter.y, arcStartPoint.x - arcCenter.x)
        let endAngle = Math.atan2(point.y - arcCenter.y, point.x - arcCenter.x)

        // Ensure we draw the shorter arc (not the long way around)
        if (endAngle < startAngle) {
          endAngle += 2 * Math.PI
        }

        // If the arc is more than 180 degrees, draw the other way
        if (endAngle - startAngle > Math.PI) {
          const temp = startAngle
          startAngle = endAngle - 2 * Math.PI
          endAngle = temp
        }

        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'arc',
          points: [arcCenter, arcStartPoint, point],
          style: {
            stroke: currentLayerData?.color || '#3b82f6',
            strokeWidth: 2
          },
          layer: currentLayer,
          radius: radius,
          startAngle: startAngle,
          endAngle: endAngle
        }

        const newElements = [...elements, newElement]
        setElements(newElements)
        addToHistory(newElements)

        // Reset arc tool state
        setArcStep(0)
        setIsDrawing(false)
        setArcCenter({ x: 0, y: 0 })
        setArcStartPoint({ x: 0, y: 0 })
      }
      return
    }

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: (tool === 'dimensionPixels' ? 'dimension' : tool) as 'line' | 'rectangle' | 'circle' | 'dimension' | 'spline',
      points: [point],
      style: {
        stroke: currentStrokeColor,
        strokeWidth: currentStrokeWidth,
        fill: currentFillColor !== 'transparent' ? currentFillColor : undefined,
        fillOpacity: currentFillOpacity,
        lineType: currentLineType,
        lineCap: 'round',
        lineJoin: 'round'
      },
      layer: currentLayer,
      locked: false,
      isDimensionPixels: tool === 'dimensionPixels'
    }

    setCurrentElement(newElement)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e)
    setMousePosition(point)

    // Update snap point separately to avoid infinite loops
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const canvasX = e.clientX - rect.left
      const canvasY = e.clientY - rect.top
      const rulerOffset = showRulers ? 30 : 0
      const adjustedX = canvasX - rulerOffset
      const adjustedY = canvasY - rulerOffset
      let x = (adjustedX / zoom) - (pan.x)
      let y = (adjustedY / zoom) - (pan.y)

      const rawPoint = { x, y }
      const snapPoint = findSnapPoint(rawPoint)
      setSnapPoint(snapPoint)
    }

    // Handle lasso selection
    if (isLassoSelecting && isDrawing) {
      setLassoPath(prev => [...prev, point])
      return
    }

    // Handle logo resizing
    if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement)
      if (element && (element.type === 'logo' || element.type === 'image')) {
        const x = element.points[0].x
        const y = element.points[0].y
        const isLogo = element.type === 'logo'
        const currentWidth = isLogo ? (element.logoWidth || 100) : (element.imageWidth || 200)
        const currentHeight = isLogo ? (element.logoHeight || 50) : (element.imageHeight || 150)

        let newWidth = currentWidth
        let newHeight = currentHeight

        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(20, point.x - x)
            newHeight = Math.max(20, point.y - y)
            break
          case 'sw':
            newWidth = Math.max(20, x + currentWidth - point.x)
            newHeight = Math.max(20, point.y - y)
            element.points[0].x = point.x
            break
          case 'ne':
            newWidth = Math.max(20, point.x - x)
            newHeight = Math.max(20, y + currentHeight - point.y)
            element.points[0].y = point.y
            break
          case 'nw':
            newWidth = Math.max(20, x + currentWidth - point.x)
            newHeight = Math.max(20, y + currentHeight - point.y)
            element.points[0].x = point.x
            element.points[0].y = point.y
            break
        }

        if (isLogo) {
          element.logoWidth = newWidth
          element.logoHeight = newHeight
        } else {
          element.imageWidth = newWidth
          element.imageHeight = newHeight
        }

        setElements([...elements])
      }
      return
    }

    // Handle table dragging
    if (isDraggingTable && selectedElement && dragStartPos) {
      const deltaX = point.x - dragStartPos.x
      const deltaY = point.y - dragStartPos.y

      const updatedElements = elements.map(element => {
        if (element.id === selectedElement && element.type === 'table') {
          const newPoints = element.points.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }))
          return { ...element, points: newPoints }
        }
        return element
      })

      setElements(updatedElements)
      setDragStartPos(point)
      return
    }

    // Handle title block dragging
    if (isDraggingTitleBlock && selectedElement && dragStartPos) {
      const deltaX = point.x - dragStartPos.x
      const deltaY = point.y - dragStartPos.y

      const updatedElements = elements.map(element => {
        if (element.id === selectedElement && element.type === 'titleblock') {
          const newPoints = element.points.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }))
          return { ...element, points: newPoints }
        }
        return element
      })

      setElements(updatedElements)
      setDragStartPos(point)
      return
    }

    if (isDrawingPolyline && currentPolyline.length > 0) {
      // Update preview for polyline
      return
    }

    // Handle pan tool
    if (tool === 'pan' && isPanning && panStartPos) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        const deltaX = currentX - panStartPos.x
        const deltaY = currentY - panStartPos.y

        setPan({
          x: panStartOffset.x + deltaX / zoom,
          y: panStartOffset.y + deltaY / zoom
        })
      }
      return
    }

    // Handle move tool
    if (tool === 'move' && movingElement && moveStartPos && isDrawing) {
      const deltaX = point.x - moveStartPos.x
      const deltaY = point.y - moveStartPos.y

      const updatedElements = elements.map(element => {
        if (element.id === movingElement) {
          const newPoints = element.points.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }))
          // Preserve all element properties (especially important for arcs with radius, angles, etc.)
          return {
            ...element,
            points: newPoints,
            // Explicitly preserve arc properties
            radius: element.radius,
            startAngle: element.startAngle,
            endAngle: element.endAngle
          }
        }
        return element
      })

      setElements(updatedElements)
      // Update the start position for continuous movement
      setMoveStartPos(point)
      return
    }

    // Handle dragging images/logos when selected (even if tool is not 'move')
    if (movingElement && moveStartPos && isDrawing && !isResizing) {
      const deltaX = point.x - moveStartPos.x
      const deltaY = point.y - moveStartPos.y

      const updatedElements = elements.map(element => {
        if (element.id === movingElement && (element.type === 'image' || element.type === 'logo')) {
          const newPoints = element.points.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }))
          return {
            ...element,
            points: newPoints
          }
        }
        return element
      })

      setElements(updatedElements)
      setMoveStartPos(point)
      return
    }

    // Handle rotate tool
    if (tool === 'rotate' && rotatingElement && isDrawing) {
      const dx = point.x - rotationCenter.x
      const dy = point.y - rotationCenter.y
      const currentAngle = Math.atan2(dy, dx)
      const rotationAngle = currentAngle - rotationStartAngle

      const updatedElements = elements.map(element => {
        if (element.id === rotatingElement) {
          const newPoints = element.points.map(p =>
            rotatePoint(p, rotationCenter, rotationAngle)
          )
          // For arcs, also update the start and end angles
          let updatedElement = { ...element, points: newPoints }
          if (element.type === 'arc' && element.startAngle !== undefined && element.endAngle !== undefined) {
            updatedElement.startAngle = element.startAngle + rotationAngle
            updatedElement.endAngle = element.endAngle + rotationAngle
            updatedElement.radius = element.radius // Preserve radius
          }
          return updatedElement
        }
        return element
      })

      setElements(updatedElements)
      return
    }

    // Handle scale tool
    if (tool === 'scale' && scalingElement && isDrawing) {
      const scaleFactor = calculateScaleFactor(scaleCenter, { x: scaleCenter.x + scaleStartDistance, y: scaleCenter.y }, point)
      setCurrentScaleFactor(scaleFactor)

      const updatedElements = elements.map(element => {
        if (element.id === scalingElement) {
          const newPoints = element.points.map(p =>
            scalePoint(p, scaleCenter, scaleFactor)
          )
          // For arcs, also scale the radius
          let updatedElement = { ...element, points: newPoints }
          if (element.type === 'arc' && element.radius !== undefined) {
            updatedElement.radius = element.radius * scaleFactor
            updatedElement.startAngle = element.startAngle // Preserve angles
            updatedElement.endAngle = element.endAngle
          }
          return updatedElement
        }
        return element
      })

      setElements(updatedElements)
      return
    }

    // Handle arc tool preview
    if (tool === 'arc' && arcStep === 2) {
      // Show preview arc from start point to current mouse position
      const radius = calculateDistance(arcCenter, arcStartPoint)
      let startAngle = Math.atan2(arcStartPoint.y - arcCenter.y, arcStartPoint.x - arcCenter.x)
      let endAngle = Math.atan2(point.y - arcCenter.y, point.x - arcCenter.x)

      // Ensure we draw the shorter arc (not the long way around)
      if (endAngle < startAngle) {
        endAngle += 2 * Math.PI
      }

      // If the arc is more than 180 degrees, draw the other way
      if (endAngle - startAngle > Math.PI) {
        const temp = startAngle
        startAngle = endAngle - 2 * Math.PI
        endAngle = temp
      }

      // Update preview element (we'll draw this in the canvas)
      setCurrentElement({
        id: 'preview-arc',
        type: 'arc',
        points: [arcCenter, arcStartPoint, point],
        style: {
          stroke: layers.find(l => l.name === currentLayer)?.color || '#3b82f6',
          strokeWidth: 2
        },
        layer: currentLayer,
        radius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      })
      return
    }

    if (!isDrawing || !currentElement) return

    if (currentElement.type === 'spline') {
      // For splines, add points as we move
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, point]
      })
    } else {
      setCurrentElement({
        ...currentElement,
        points: [currentElement.points[0], point]
      })
    }
  }, [getMousePos, showRulers, zoom, pan.x, pan.y, findSnapPoint, isLassoSelecting, isDrawing, isResizing, selectedElement, resizeHandle, elements, currentElement, isDraggingTable, isDraggingTitleBlock])

  const addToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newElements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Layer management functions
  const createNewLayer = () => {
    const newLayerId = `layer${Date.now()}`
    const newLayer: Layer = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      color: '#ffffff',
      opacity: 1,
      lineWeight: 1,
      description: 'New layer'
    }
    setLayers([...layers, newLayer])
    setCurrentLayer(newLayerId)
  }

  const deleteLayer = (layerId: string) => {
    if (layers.length <= 1) return // Don't delete the last layer

    // Move elements from deleted layer to first available layer
    const remainingLayers = layers.filter(l => l.id !== layerId)
    const targetLayerId = remainingLayers[0].id

    const updatedElements = elements.map(element =>
      element.layer === layerId ? { ...element, layer: targetLayerId } : element
    )

    setElements(updatedElements)
    setLayers(remainingLayers)

    if (currentLayer === layerId) {
      setCurrentLayer(targetLayerId)
    }
  }

  const duplicateLayer = (layerId: string) => {
    const sourceLayer = layers.find(l => l.id === layerId)
    if (!sourceLayer) return

    const newLayerId = `layer${Date.now()}`
    const newLayer: Layer = {
      ...sourceLayer,
      id: newLayerId,
      name: `${sourceLayer.name} Copy`,
      visible: true
    }

    setLayers([...layers, newLayer])
  }

  const renameLayer = (layerId: string, newName: string) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, name: newName } : layer
    ))
  }

  const applyCurrentPropertiesToSelected = () => {
    if (selectedElements.length === 0) return

    const updatedElements = elements.map(element => {
      if (selectedElements.includes(element.id)) {
        const updatedElement = {
          ...element,
          style: {
            ...element.style,
            stroke: currentStrokeColor,
            strokeWidth: currentStrokeWidth,
            fill: currentFillColor !== 'transparent' ? currentFillColor : undefined,
            fillOpacity: currentFillOpacity,
            lineType: currentLineType,
            lineCap: 'round' as 'round',
            lineJoin: 'round' as 'round'
          }
        }

        // Apply font properties to text elements
        if (element.type === 'text') {
          updatedElement.fontSize = currentFontSize
          updatedElement.fontFamily = currentFontFamily
          updatedElement.style.fontSize = currentFontSize
          updatedElement.style.fontFamily = currentFontFamily
        }

        return updatedElement
      }
      return element
    })

    setElements(updatedElements)
    addToHistory(updatedElements)
  }

  const findElementAtPoint = (point: Point): string | null => {
    console.log('Finding element at point:', point, 'Total elements:', elements.length)
    addDebugLog(`🔍 Searching for element at (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, 'info')
    addDebugLog(`Total elements to check: ${elements.length}`, 'info')

    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      console.log('Checking element:', element.type, element.id)
      addDebugLog(`Checking ${element.type} (ID: ${element.id})`, 'info')

      if (element.type === 'rectangle' && element.points.length >= 1) {
        // Support rectangles defined by 2 opposite corners or 4 corners
        const xs = element.points.map(p => p.x)
        const ys = element.points.map(p => p.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
          console.log('Found rectangle:', element.id)
          addDebugLog(`✅ Found rectangle (ID: ${element.id})`, 'success')
          return element.id
        }
      } else if (element.type === 'circle' && element.points.length >= 1) {
        const [center] = element.points
        // Try to get radius from different possible sources
        let radius = element.radius
        if (!radius && element.points.length >= 2) {
          // Calculate radius from two points
          const [p1, p2] = element.points
          radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
        }
        if (!radius) radius = 50 // Default radius

        const distance = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
        console.log('Circle check:', { center, radius, distance, clickPoint: point })

        if (distance <= radius) {
          console.log('Found circle:', element.id)
          return element.id
        }
      } else if (element.type === 'line' && element.points.length >= 2) {
        const [start, end] = element.points
        const distance = distanceToLine(point, start, end)

        if (distance <= 10) { // Increased tolerance for easier selection
          console.log('Found line:', element.id)
          return element.id
        }
      } else if (element.type === 'text') {
        const [textPos] = element.points
        const fontSize = element.fontSize || element.style?.fontSize || 16
        const lines = (element.text || '').split('\n')
        const lineHeight = fontSize * 1.2

        // Calculate text dimensions with padding for easier selection
        const avgCharWidth = fontSize * 0.6
        const maxLineLength = Math.max(...lines.map(line => line.length), 1)
        const textWidth = Math.max(maxLineLength * avgCharWidth, fontSize) // Minimum width
        const textHeight = lines.length * lineHeight
        const padding = 5 // Extra padding for easier selection

        if (point.x >= textPos.x - padding && point.x <= textPos.x + textWidth + padding &&
            point.y >= textPos.y - padding && point.y <= textPos.y + textHeight + padding) {
          return element.id
        }
      } else if (element.type === 'logo') {
        const [logoPos] = element.points
        const width = element.logoWidth || 100
        const height = element.logoHeight || 50

        if (point.x >= logoPos.x && point.x <= logoPos.x + width &&
            point.y >= logoPos.y && point.y <= logoPos.y + height) {
          return element.id
        }
      } else if (element.type === 'table' && element.points.length >= 1) {
        const [tablePos] = element.points
        const cellWidth = element.cellWidth || 120
        const cellHeight = element.cellHeight || 30
        const tableWidth = (element.columns || 1) * cellWidth
        const tableHeight = (element.rows || 1) * cellHeight

        if (point.x >= tablePos.x && point.x <= tablePos.x + tableWidth &&
            point.y >= tablePos.y && point.y <= tablePos.y + tableHeight) {
          console.log('Found table:', element.id)
          return element.id
        }
      } else if (element.type === 'polyline' && element.points.length >= 2) {
        // Check if point is near any segment of the polyline
        for (let j = 0; j < element.points.length - 1; j++) {
          const distance = distanceToLine(point, element.points[j], element.points[j + 1])
          if (distance <= 10) {
            console.log('Found polyline:', element.id)
            return element.id
          }
        }
      } else if (element.type === 'spline' && element.points.length >= 2) {
        // For splines, check distance to each point with tolerance
        for (const splinePoint of element.points) {
          const distance = Math.sqrt(
            Math.pow(point.x - splinePoint.x, 2) + Math.pow(point.y - splinePoint.y, 2)
          )
          if (distance <= 15) {
            console.log('Found spline:', element.id)
            return element.id
          }
        }
      } else if (element.type === 'dimension' && element.points.length >= 2) {
        // Check dimension line
        const [start, end] = element.points
        const distance = distanceToLine(point, start, end)
        if (distance <= 10) {
          console.log('Found dimension:', element.id)
          return element.id
        }
      } else if (element.type === 'block' && element.points.length >= 1) {
        // Handle block elements (including cranes) - MUCH LARGER detection area
        const blockCenter = element.points[0]
        let blockWidth = 100  // Default block size
        let blockHeight = 60

        // If it's a crane, use much larger detection area
        if (element.craneData) {
          blockWidth = 800  // Much larger detection area
          blockHeight = 600
        }

        // Check if point is within block bounds
        if (point.x >= blockCenter.x - blockWidth/2 &&
            point.x <= blockCenter.x + blockWidth/2 &&
            point.y >= blockCenter.y - blockHeight/2 &&
            point.y <= blockCenter.y + blockHeight/2) {
          console.log('Found block/crane element:', element.id)
          addDebugLog(`✅ Found block/crane (ID: ${element.id})`, 'success')
          return element.id
        }
      } else {
        // Generic fallback for any other element types
        console.log('Checking generic element type:', element.type)
        if (element.points && element.points.length > 0) {
          // Check if point is near any of the element's points
          for (const elementPoint of element.points) {
            const distance = Math.sqrt(
              Math.pow(point.x - elementPoint.x, 2) + Math.pow(point.y - elementPoint.y, 2)
            )
            if (distance <= 20) {
              console.log('Found generic element:', element.id, element.type)
              return element.id
            }
          }
        }
      }
    }

    console.log('No element found at point')
    addDebugLog('❌ No element found at click point', 'warning')
    return null
  }

  const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    if (lenSq !== 0) {
      param = dot / lenSq
    }

    let xx, yy

    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Command line execution
  const executeCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()
    const parts = cmd.split(' ')
    const mainCmd = parts[0]

    // Add to history
    setCommandHistory(prev => [...prev, command])

    switch (mainCmd) {
      case 'line':
      case 'l':
        setTool('line')
        break
      case 'rectangle':
      case 'rect':
      case 'r':
        setTool('rectangle')
        break
      case 'circle':
      case 'c':
        setTool('circle')
        break
      case 'text':
      case 't':
        setTool('text')
        break
      case 'select':
      case 's':
        setTool('select')
        break
      case 'delete':
      case 'del':
      case 'erase':
        if (selectedElement) {
          const newElements = elements.filter(el => el.id !== selectedElement)
          setElements(newElements)
          addToHistory(newElements)
          setSelectedElement(null)
        }
        break
      case 'zoom':
        if (parts[1]) {
          const zoomValue = parseFloat(parts[1])
          if (!isNaN(zoomValue)) {
            setZoom(Math.max(0.1, Math.min(5, zoomValue)))
          }
        }
        break
      case 'grid':
        if (parts[1] === 'on') {
          setShowGrid(true)
        } else if (parts[1] === 'off') {
          setShowGrid(false)
        } else {
          setShowGrid(!showGrid)
        }
        break
      case 'rulers':
        if (parts[1] === 'on') {
          setShowRulers(true)
        } else if (parts[1] === 'off') {
          setShowRulers(false)
        } else {
          setShowRulers(!showRulers)
        }
        break
      case 'clear':
        if (parts[1] === 'all') {
          setElements([])
          addToHistory([])
        }
        break
      case 'undo':
        handleUndo()
        break
      case 'redo':
        handleRedo()
        break
      case 'help':
        setShowHelp(true)
        break
      case 'trim':
        startTrimCommand()
        break
      case 'mirror':
        startMirrorCommand()
        break
      case 'array':
        startArrayCommand()
        break
      case 'join':
        startJoinCommand()
        break
      default:
        console.log(`Unknown command: ${command}`)
    }

    setCommandInput('')
  }

  // Advanced CAD Commands Implementation



  // Advanced CAD Commands Implementation
  const startTrimCommand = () => {
    addDebugLog('🔧 TRIM COMMAND STARTED', 'info')
    addDebugLog(`Elements available: ${elements.length}`, 'info')
    setAdvancedCommand('trim')
    setCommandStep(0)
    setSelectedElements([])
    setTool('select')
    addDebugLog('Step 1: Select cutting edge first', 'info')
  }

  const startMirrorCommand = () => {
    addDebugLog('🪞 MIRROR COMMAND STARTED', 'info')
    addDebugLog(`Elements available: ${elements.length}`, 'info')
    setAdvancedCommand('mirror')
    setCommandStep(0)
    setSelectedElements([])
    setMirrorAxis(null)
    setTool('select')
    addDebugLog('Step 1: Select objects to mirror', 'info')
  }

  const startArrayCommand = () => {
    setAdvancedCommand('array')
    setCommandStep(0)
    setSelectedElements([])
    setTool('select')
    console.log('Array command started. Select objects to array.')
  }

  const startJoinCommand = () => {
    addDebugLog('🔗 JOIN COMMAND STARTED', 'info')
    addDebugLog(`Elements available: ${elements.length}`, 'info')
    setAdvancedCommand('join')
    setCommandStep(0)
    // Do NOT clear current selection; if user already selected, allow immediate join
    setTool('select')
    if (selectedElements.length >= 2) {
      addDebugLog(`Auto-joining ${selectedElements.length} preselected elements`, 'info')
      executeJoin(selectedElements)
      setAdvancedCommand(null)
      setSelectedElements([])
      return
    }
    addDebugLog('Step 1: Select objects to join (need at least 2)', 'info')
  }

  const applyFillet = (radius: number) => {
    if (selectedElements.length === 0) {
      alert('Please select elements first')
      return
    }

    const newElements = elements.map(el => {
      if (selectedElements.includes(el.id)) {
        return {
          ...el,
          filletRadius: radius,
          style: {
            ...el.style,
            strokeLinejoin: 'round'
          }
        }
      }
      return el
    })

    setElements(newElements)
    addToHistory(newElements)
    addDebugLog(`✓ Fillet applied with radius ${radius}mm to ${selectedElements.length} element(s)`, 'success')
  }

  const applyChamfer = (distance: number) => {
    if (selectedElements.length === 0) {
      alert('Please select elements first')
      return
    }

    const newElements = elements.map(el => {
      if (selectedElements.includes(el.id)) {
        return {
          ...el,
          chamferDistance: distance,
          style: {
            ...el.style,
            strokeLinejoin: 'bevel'
          }
        }
      }
      return el
    })

    setElements(newElements)
    addToHistory(newElements)
    addDebugLog(`✓ Chamfer applied with distance ${distance}mm to ${selectedElements.length} element(s)`, 'success')
  }

  // Trim implementation
  const executeTrim = (cuttingEdgeId: string, elementToTrimId: string, trimPoint: Point) => {
    addDebugLog('🔧 EXECUTING TRIM OPERATION', 'info')
    const cuttingEdge = elements.find(el => el.id === cuttingEdgeId)
    const elementToTrim = elements.find(el => el.id === elementToTrimId)

    if (!cuttingEdge || !elementToTrim) {
      addDebugLog('❌ Missing cutting edge or element to trim', 'error')
      return
    }

    addDebugLog(`Cutting edge: ${cuttingEdge.type}, Element to trim: ${elementToTrim.type}`, 'info')

    // Find intersection points
    const intersections = findIntersections(cuttingEdge, elementToTrim)
    addDebugLog(`Found ${intersections.length} intersection points`, intersections.length > 0 ? 'success' : 'warning')
    if (intersections.length === 0) {
      addDebugLog('❌ No intersections found - cannot trim', 'error')
      return
    }

    // Find closest intersection to trim point
    let closestIntersection = intersections[0]
    let minDistance = Math.sqrt(
      Math.pow(trimPoint.x - intersections[0].x, 2) +
      Math.pow(trimPoint.y - intersections[0].y, 2)
    )

    for (const intersection of intersections) {
      const distance = Math.sqrt(
        Math.pow(trimPoint.x - intersection.x, 2) +
        Math.pow(trimPoint.y - intersection.y, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        closestIntersection = intersection
      }
    }

    // Trim the element
    const trimmedElements = trimElementAtPoint(elementToTrim, closestIntersection, trimPoint)

    // Update elements array
    const newElements = elements.filter(el => el.id !== elementToTrimId).concat(trimmedElements)
    setElements(newElements)
    addToHistory(newElements)
  }

  // Mirror implementation
  const executeMirror = (elementsToMirror: string[], axis: { start: Point; end: Point }, keepOriginal: boolean = false) => {
    addDebugLog('🪞 EXECUTING MIRROR OPERATION', 'info')
    addDebugLog(`Elements to mirror: ${elementsToMirror.length}`, 'info')
    addDebugLog(`Keep original: ${keepOriginal}`, 'info')
    addDebugLog(`Axis: (${axis.start.x.toFixed(1)}, ${axis.start.y.toFixed(1)}) to (${axis.end.x.toFixed(1)}, ${axis.end.y.toFixed(1)})`, 'info')

    const mirroredElements: DrawingElement[] = []

    elementsToMirror.forEach(elementId => {
      const element = elements.find(el => el.id === elementId)
      if (!element) {
        addDebugLog(`❌ Element ${elementId} not found`, 'error')
        return
      }

      addDebugLog(`Mirroring ${element.type} (ID: ${elementId})`, 'info')
      const mirroredElement = mirrorElement(element, axis)
      mirroredElements.push(mirroredElement)
    })

    addDebugLog(`Created ${mirroredElements.length} mirrored elements`, 'success')

    let newElements = [...elements]
    if (!keepOriginal) {
      newElements = elements.filter(el => !elementsToMirror.includes(el.id))
    }
    newElements = newElements.concat(mirroredElements)

    setElements(newElements)
    addToHistory(newElements)
  }

  // Array implementation
  const executeArray = (elementsToArray: string[], config: typeof arrayConfig) => {
    const arrayedElements: DrawingElement[] = []

    elementsToArray.forEach(elementId => {
      const element = elements.find(el => el.id === elementId)
      if (!element) return

      if (config.type === 'rectangular') {
        for (let row = 0; row < config.rows; row++) {
          for (let col = 0; col < config.columns; col++) {
            if (row === 0 && col === 0) continue // Skip original position

            const offsetX = col * config.columnSpacing
            const offsetY = row * config.rowSpacing
            const arrayedElement = offsetElement(element, offsetX, offsetY)
            arrayedElements.push(arrayedElement)
          }
        }
      } else if (config.type === 'polar' && config.centerPoint) {
        const angleStep = (2 * Math.PI) / config.count
        for (let i = 1; i < config.count; i++) {
          const angle = i * angleStep
          const arrayedElement = rotateElementAroundPoint(element, config.centerPoint, angle)
          arrayedElements.push(arrayedElement)
        }
      }
    })

    const newElements = elements.concat(arrayedElements)
    setElements(newElements)
    addToHistory(newElements)
    addDebugLog(`Array created: ${arrayedElements.length} copies`, 'success')
  }

  // Join implementation
  const executeJoin = (elementsToJoin: string[]) => {
    addDebugLog('🔗 EXECUTING JOIN OPERATION', 'info')
    addDebugLog(`Elements to join: ${elementsToJoin.length}`, 'info')

    if (elementsToJoin.length < 2) {
      addDebugLog('❌ Need at least 2 elements to join', 'error')
      return
    }

    const elementsData = elementsToJoin.map(id => elements.find(el => el.id === id)!).filter(Boolean)
    addDebugLog(`Valid elements found: ${elementsData.length}`, 'info')

    const elementTypes = elementsData.map(el => el.type).join(', ')
    addDebugLog(`Element types: ${elementTypes}`, 'info')

    const joinedElement = joinElements(elementsData)
    if (!joinedElement) {
      addDebugLog('❌ Failed to create joined element', 'error')
      return
    }

    addDebugLog(`✅ Created joined element: ${joinedElement.type}`, 'success')
    const newElements = elements.filter(el => !elementsToJoin.includes(el.id)).concat([joinedElement])
    setElements(newElements)
    addToHistory(newElements)
  }

  // Helper functions for advanced commands
  const findIntersections = (element1: DrawingElement, element2: DrawingElement): Point[] => {
    const intersections: Point[] = []

    // Line-Line intersection
    if (element1.type === 'line' && element2.type === 'line') {
      const intersection = lineLineIntersection(
        element1.points[0], element1.points[1],
        element2.points[0], element2.points[1]
      )
      if (intersection) intersections.push(intersection)
    }

    // Add more intersection types as needed
    return intersections
  }

  const lineLineIntersection = (p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
    if (Math.abs(denom) < 1e-10) return null // Lines are parallel

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      }
    }
    return null
  }

  const trimElementAtPoint = (element: DrawingElement, intersectionPoint: Point, trimPoint: Point): DrawingElement[] => {
    if (element.type === 'line') {
      const [start, end] = element.points

      // Determine which side of intersection to keep
      const distToStart = Math.sqrt(Math.pow(trimPoint.x - start.x, 2) + Math.pow(trimPoint.y - start.y, 2))
      const distToEnd = Math.sqrt(Math.pow(trimPoint.x - end.x, 2) + Math.pow(trimPoint.y - end.y, 2))

      if (distToStart < distToEnd) {
        // Keep start to intersection
        return [{
          ...element,
          id: Date.now().toString(),
          points: [start, intersectionPoint]
        }]
      } else {
        // Keep intersection to end
        return [{
          ...element,
          id: Date.now().toString(),
          points: [intersectionPoint, end]
        }]
      }
    }

    return [element] // Return original if can't trim
  }

  const mirrorElement = (element: DrawingElement, axis: { start: Point; end: Point }): DrawingElement => {
    const mirroredPoints = element.points.map(point => mirrorPoint(point, axis))

    return {
      ...element,
      id: Date.now().toString() + Math.random(),
      points: mirroredPoints
    }
  }

  const mirrorPoint = (point: Point, axis: { start: Point; end: Point }): Point => {
    const { start, end } = axis
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return point

    const ux = dx / length
    const uy = dy / length

    const px = point.x - start.x
    const py = point.y - start.y

    const dot = px * ux + py * uy
    const projX = dot * ux
    const projY = dot * uy

    const mirroredX = start.x + 2 * projX - px
    const mirroredY = start.y + 2 * projY - py

    return { x: mirroredX, y: mirroredY }
  }

  const offsetElement = (element: DrawingElement, offsetX: number, offsetY: number): DrawingElement => {
    const offsetPoints = element.points.map(point => ({
      x: point.x + offsetX,
      y: point.y + offsetY
    }))

    return {
      ...element,
      id: Date.now().toString() + Math.random(),
      points: offsetPoints
    }
  }

  const rotateElementAroundPoint = (element: DrawingElement, center: Point, angle: number): DrawingElement => {
    const rotatedPoints = element.points.map(point => rotatePoint(point, center, angle))

    return {
      ...element,
      id: Date.now().toString() + Math.random(),
      points: rotatedPoints
    }
  }

  const rotatePoint = (point: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const dx = point.x - center.x
    const dy = point.y - center.y

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    }
  }

  const joinElements = (els: DrawingElement[]): DrawingElement | null => {
    // Check if any elements are rectangles - they cannot be joined
    const hasRectangles = els.some(el => el.type === 'rectangle')
    if (hasRectangles) {
      addDebugLog('❌ Cannot join rectangles. Join only works with lines, polylines, arcs, and splines.', 'error')
      return null
    }

    // General join for lines, polylines, arcs, splines -> returns a single polyline
    const segments = els
      .map(el => ({ el, pts: pointsForJoin(el) }))
      .filter(s => s.pts && s.pts.length >= 2)

    if (segments.length < 2) return null

    // Greedy nearest-endpoint ordering
    const used = new Set<string>()
    const ordered: { id: string; pts: Point[] }[] = []

    // Seed with first segment
    const seed = segments[0]
    used.add(seed.el.id)
    ordered.push({ id: seed.el.id, pts: [...seed.pts] })

    while (used.size < segments.length) {
      const last = ordered[ordered.length - 1].pts
      const tail = last[last.length - 1]
      let bestIdx = -1
      let bestDist = Infinity
      let reverse = false

      for (let i = 0; i < segments.length; i++) {
        if (used.has(segments[i].el.id)) continue
        const a = segments[i].pts[0]
        const b = segments[i].pts[segments[i].pts.length - 1]
        const da = Math.hypot(a.x - tail.x, a.y - tail.y)
        const db = Math.hypot(b.x - tail.x, b.y - tail.y)
        if (da < bestDist) { bestDist = da; bestIdx = i; reverse = false }
        if (db < bestDist) { bestDist = db; bestIdx = i; reverse = true }
      }

      if (bestIdx === -1) break
      const seg = segments[bestIdx]
      const pts = reverse ? [...seg.pts].reverse() : seg.pts
      const snapTol = 3 // px tolerance to treat endpoints as connected
      const startIdx = bestDist <= snapTol ? 1 : 0
      const lastArr = ordered[ordered.length - 1].pts
      lastArr.push(...pts.slice(startIdx))
      used.add(seg.el.id)
    }

    const path = ordered[0].pts
    if (path.length < 2) return null

    const firstEl = segments[0].el
    const baseStyle = firstEl.style || { stroke: currentStrokeColor, strokeWidth: currentStrokeWidth }

    return {
      id: Date.now().toString(),
      type: 'polyline',
      points: path,
      style: {
        stroke: baseStyle.stroke || currentStrokeColor,
        strokeWidth: baseStyle.strokeWidth || currentStrokeWidth,
        lineCap: baseStyle.lineCap || 'round',
        lineJoin: baseStyle.lineJoin || 'round',
        lineType: baseStyle.lineType,
        fill: 'transparent'
      },
      layer: firstEl.layer
    }
  }

  // Handle clicks during advanced commands
  const handleAdvancedCommandClick = (point: Point, e: React.MouseEvent) => {
    const elementId = findElementAtPoint(point)
    addDebugLog(`🖱️ Click at (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, 'info')
    addDebugLog(`Element found: ${elementId ? `ID ${elementId}` : 'None'}`, elementId ? 'success' : 'warning')
    addDebugLog(`Command: ${advancedCommand}, Step: ${commandStep}`, 'info')

    switch (advancedCommand) {
      case 'trim':
        if (commandStep === 0) {
          // Select cutting edge
          if (elementId) {
            const element = elements.find(el => el.id === elementId)
            addDebugLog(`✂️ Cutting edge selected: ${element?.type} (ID: ${elementId})`, 'success')
            setCommandData({ cuttingEdgeId: elementId })
            setCommandStep(1)
            addDebugLog('Step 2: Select element to trim', 'info')
          } else {
            addDebugLog('❌ No element found at click point for cutting edge', 'error')
          }
        } else if (commandStep === 1) {
          // Select element to trim and execute
          if (elementId && commandData.cuttingEdgeId) {
            const elementToTrim = elements.find(el => el.id === elementId)
            const cuttingEdge = elements.find(el => el.id === commandData.cuttingEdgeId)
            addDebugLog(`✂️ Attempting to trim ${elementToTrim?.type} with ${cuttingEdge?.type}`, 'info')
            executeTrim(commandData.cuttingEdgeId, elementId, point)
            setAdvancedCommand(null)
            setCommandStep(0)
            setCommandData({})
            addDebugLog('✅ Trim operation completed', 'success')
          } else {
            addDebugLog('❌ Missing element or cutting edge for trim operation', 'error')
          }
        }
        break

      case 'mirror':
        if (commandStep === 0) {
          // Select objects to mirror
          if (elementId) {
            const element = elements.find(el => el.id === elementId)
            const newSelected = selectedElements.includes(elementId)
              ? selectedElements.filter(id => id !== elementId)
              : [...selectedElements, elementId]
            setSelectedElements(newSelected)
            addDebugLog(`🪞 ${newSelected.includes(elementId) ? 'Selected' : 'Deselected'} ${element?.type} (ID: ${elementId})`, 'success')
            addDebugLog(`Total selected: ${newSelected.length} objects`, 'info')
          } else if (selectedElements.length > 0) {
            // Start defining mirror axis
            setCommandStep(1)
            setCommandData({ axisStart: point })
            addDebugLog(`🪞 Mirror axis start point: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, 'info')
            addDebugLog('Step 2: Click second point to define mirror axis', 'info')
          } else {
            addDebugLog('❌ No objects selected for mirroring', 'warning')
          }
        } else if (commandStep === 1) {
          // Define mirror axis and execute
          if (commandData.axisStart) {
            const axis = { start: commandData.axisStart, end: point }
            addDebugLog(`🪞 Mirror axis end point: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, 'info')
            addDebugLog(`🪞 Keep original: ${e.shiftKey ? 'Yes (Shift held)' : 'No'}`, 'info')
            setMirrorAxis(axis)
            executeMirror(selectedElements, axis, e.shiftKey) // Shift to keep original
            setAdvancedCommand(null)
            setCommandStep(0)
            setCommandData({})
            setSelectedElements([])
            setMirrorAxis(null)
            addDebugLog('✅ Mirror operation completed', 'success')
          }
        }
        break

      case 'array':
        if (commandStep === 0) {
          // Select objects to array
          if (elementId) {
            const newSelected = selectedElements.includes(elementId)
              ? selectedElements.filter(id => id !== elementId)
              : [...selectedElements, elementId]
            setSelectedElements(newSelected)
            console.log(`Selected ${newSelected.length} objects for array.`)
          } else if (selectedElements.length > 0) {
            // Execute array with current config
            executeArray(selectedElements, arrayConfig)
            setAdvancedCommand(null)
            setCommandStep(0)
            setSelectedElements([])
            console.log('Array completed.')
          }
        }
        break

      case 'join':
        if (elementId) {
          const element = elements.find(el => el.id === elementId)
          const newSelected = selectedElements.includes(elementId)
            ? selectedElements.filter(id => id !== elementId)
            : [...selectedElements, elementId]
          setSelectedElements(newSelected)
          addDebugLog(`🔗 ${newSelected.includes(elementId) ? 'Selected' : 'Deselected'} ${element?.type} (ID: ${elementId})`, 'success')
          addDebugLog(`Total selected: ${newSelected.length} objects`, 'info')

          if (newSelected.length >= 2) {
            addDebugLog(`🔗 Attempting to join ${newSelected.length} elements`, 'info')
            const selectedTypes = newSelected.map(id => elements.find(el => el.id === id)?.type).join(', ')
            addDebugLog(`Element types: ${selectedTypes}`, 'info')
            executeJoin(newSelected)
            setAdvancedCommand(null)
            setSelectedElements([])
            addDebugLog('✅ Join operation completed', 'success')
          } else {
            addDebugLog(`Need at least 2 elements to join (currently have ${newSelected.length})`, 'warning')
          }
        } else {
          addDebugLog('❌ No element found at click point for join', 'error')
        }
        break
    }
  }

  const handleMouseUp = () => {
    // Handle lasso selection completion
    if (isLassoSelecting && isDrawing) {
      console.log('Completing lasso selection with', lassoPath.length, 'points')

      // Find elements inside the lasso
      const selectedIds: string[] = []
      elements.forEach(element => {
        if (isElementInLasso(element, lassoPath)) {
          selectedIds.push(element.id)
        }
      })

      console.log('Selected elements:', selectedIds)
      setSelectedElements(selectedIds)

      // Reset lasso state
      setIsLassoSelecting(false)
      setLassoPath([])
      setLassoStartPoint(null)
      setIsDrawing(false)
      return
    }

    // Handle resize completion
    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      setIsDrawing(false)
      addToHistory(elements)
      return
    }

    // Handle table dragging completion
    if (isDraggingTable) {
      setIsDraggingTable(false)
      setDragStartPos(null)
      setIsDrawing(false)
      addToHistory(elements)
      return
    }

    // Handle title block dragging completion
    if (isDraggingTitleBlock) {
      setIsDraggingTitleBlock(false)
      setDragStartPos(null)
      setIsDrawing(false)
      addToHistory(elements)
      return
    }

    // Handle pan tool completion
    if (tool === 'pan' && isPanning) {
      setIsPanning(false)
      setPanStartPos(null)
      setPanStartOffset({ x: 0, y: 0 })
      return
    }

    // Handle move tool completion
    if (tool === 'move' && movingElement && isDrawing) {
      setIsDrawing(false)
      setMovingElement(null)
      setMoveStartPos(null)
      addToHistory(elements)
      return
    }

    // Handle rotate tool completion
    if (tool === 'rotate' && rotatingElement && isDrawing) {
      setIsDrawing(false)
      setRotatingElement(null)
      setRotationCenter({ x: 0, y: 0 })
      setRotationStartAngle(0)
      addToHistory(elements)
      return
    }

    // Handle scale tool completion
    if (tool === 'scale' && scalingElement && isDrawing) {
      setIsDrawing(false)
      setScalingElement(null)
      setScaleCenter({ x: 0, y: 0 })
      setScaleStartDistance(0)
      setCurrentScaleFactor(1)
      addToHistory(elements)
      return
    }

    if (!isDrawing || !currentElement) return

    setIsDrawing(false)

    if (currentElement.points.length >= 2) {
      const newElements = [...elements, currentElement]
      setElements(newElements)
      addToHistory(newElements)
    }

    setCurrentElement(null)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1] || [])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  const handleDeleteSelected = () => {
    // For now, delete the last element (can be enhanced with selection)
    if (elements.length > 0) {
      const newElements = elements.slice(0, -1)
      setElements(newElements)
      addToHistory(newElements)
    }
  }

  const handleDeleteBackgroundImages = () => {
    if (backgroundImages.length > 0) {
      setShowImageDeleteDialog(true)
    }
  }

  const confirmDeleteImages = () => {
    // Remove all background images from elements
    const newElements = elements.filter(el => el.type !== 'image')
    setElements(newElements)
    setBackgroundImages([])
    addToHistory(newElements)
    setShowImageDeleteDialog(false)
    setImageToDelete(null)
  }

  // Old block functions removed - using new BlockManager component

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1))
  }

  const handleSave = async () => {
    console.log('handleSave called, projectName:', projectName, 'elements:', elements?.length)
    setIsSaving(true)
    try {
      // If this is a database project, save to database
      if (currentProject?.id) {
        console.log('Saving to database for project:', currentProject.id)
        const projectData = {
          elements: elements || [],
          projectInfo: projectInfo || {},
          drawingScale: drawingScale || '1:1',
          drawingUnits: drawingUnits || 'mm',
          layers: layers || [],
          currentLayer: currentLayer || 'layer1',
          zoom: zoom || 1,
          pan: pan || { x: 0, y: 0 },
          showGrid: showGrid,
          savedAt: new Date().toISOString(),
          version: '1.0'
        }

        const response = await fetch(`/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectName,
            data: projectData
          }),
        })

        if (response.ok) {
          console.log('Database save successful!')
          alert('✅ Project saved successfully!')
        } else {
          const errorText = await response.text()
          console.error('Database save failed:', response.status, errorText)
          throw new Error(`Failed to save to database: ${response.status} - ${errorText}`)
        }
      } else {
        // Use localStorage-based saving for local projects
        console.log('Saving to localStorage')
        const success = saveProject(projectName || 'Untitled Project')

        if (success) {
          console.log('localStorage save successful!')
          alert('✅ Project saved successfully!')
        } else {
          console.error('localStorage save failed!')
          throw new Error('Failed to save project to localStorage')
        }
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
      alert('❌ Failed to save project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const project = await response.json()
        setCurrentProject(project)
        setProjectName(project.name)

        if (project.data) {
          const projectData = JSON.parse(project.data)
          setElements(projectData.elements || [])
          setZoom(projectData.zoom || 1)
          setPan(projectData.pan || { x: 0, y: 0 })
          setShowGrid(projectData.showGrid !== undefined ? projectData.showGrid : true)
        }

        alert('Project loaded successfully!')
      } else {
        throw new Error('Failed to load project')
      }
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Failed to load project. Please try again.')
    }
  }

  const handleLoadLocal = (projectKey: string, projectName: string | null) => {
    try {
      const projectData = localStorage.getItem(projectKey)
      if (projectData) {
        const project = JSON.parse(projectData)
        setProjectName(projectName || project.name || 'Untitled Project')
        setElements(project.elements || [])
        setZoom(project.zoom || 1)
        setPan(project.pan || { x: 0, y: 0 })
        setShowGrid(project.showGrid !== undefined ? project.showGrid : true)

        console.log('Local project loaded successfully:', projectKey)
        alert('Project loaded successfully!')
      } else {
        throw new Error('Project not found in localStorage')
      }
    } catch (error) {
      console.error('Error loading local project:', error)
      alert('Failed to load project. Please try again.')
    }
  }

  const handleProfessionalExport = async (format: string, options: any) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check if user can export (usage tracking)
    if (!canUseFeature('exports')) {
      setShowUpgradePrompt('export_attempt')
      return
    }

    try {
      setIsExporting(true)
      addDebugLog(`Starting export: ${format.toUpperCase()} format`, 'info')

      const layout = getDefaultPrintLayout(options.paperSize)
      await exportDrawing(canvas, elements, layout, {
        format: format as 'pdf' | 'dwg' | 'dxf',
        filename: options.filename,
        paperSize: options.paperSize,
        orientation: options.orientation,
        scale: options.scale,
        includeMetadata: options.includeMetadata,
        author: options.author,
        title: options.title
      })

      // Track successful export
      useFeature('exports')
      addDebugLog(`✅ Export completed: ${options.filename}`, 'success')

      // Show success message
      const formatName = format.toUpperCase()
      alert(`✅ Drawing exported successfully as ${formatName}!\n\nFile: ${options.filename}\n\nCheck your Downloads folder.`)
    } catch (error) {
      console.error('Export error:', error)
      addDebugLog(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      alert(`❌ Failed to export. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportCAD = async (importedElements: any[]) => {
    try {
      addDebugLog(`Importing ${importedElements.length} elements`, 'info')

      // Add imported elements to the canvas
      const newElements = [...elements, ...importedElements]
      setElements(newElements)
      addToHistory(newElements)

      addDebugLog(`✅ Successfully imported ${importedElements.length} elements`, 'success')
      alert(`✅ Successfully imported ${importedElements.length} elements!\n\nThe elements have been added to your drawing.`)
    } catch (error) {
      console.error('Import error:', error)
      addDebugLog(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      alert(`❌ Failed to import file. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle Google Maps location import
  const handleGoogleMapsImport = (locationData: MapLocationData, importedMapLayers: MapLayer[]) => {
    try {
      addDebugLog(`Importing location: ${locationData.address || 'Unknown'}`, 'info')

      // Store the map location data
      setMapLocationData(locationData)
      setMapLayers(importedMapLayers)

      // Create a special "Map Satellite" layer if satellite imagery is included
      const satelliteLayer = importedMapLayers.find(l => l.type === 'satellite')
      if (satelliteLayer && locationData.satelliteImageDataUrl) {
        // Add satellite image as a background layer
        const newLayerId = `map-satellite-${Date.now()}`

        // Add the layer to the layers list (NOT locked so user can edit)
        const newLayer: Layer = {
          id: newLayerId,
          name: 'Map Satellite',
          visible: true,
          locked: false,
          color: '#4a5568',
          opacity: 0.8,
          lineWeight: 1,
          description: `Satellite imagery from ${locationData.address || 'imported location'}`
        }
        setLayers(prev => [newLayer, ...prev])

        // Preload the satellite image first
        preloadImage(locationData.satelliteImageDataUrl).then((img) => {
          // Add to loadedImages map
          setLoadedImages(prev => new Map(prev).set(locationData.satelliteImageDataUrl!, img))

          // Create an image element for the satellite imagery
          const canvas = canvasRef.current
          if (canvas) {
            const rect = canvas.getBoundingClientRect()
            // Position at center of current view
            const centerX = (-pan.x + rect.width / 2) / zoom
            const centerY = (-pan.y + rect.height / 2) / zoom

            // Calculate size to fill most of the visible canvas area
            // Use larger base size so the map is usable for planning
            const viewportWidth = rect.width / zoom
            const viewportHeight = rect.height / zoom
            const targetSize = Math.min(viewportWidth, viewportHeight) * 0.8 // Fill 80% of viewport

            // Scale to maintain aspect ratio
            const aspectRatio = locationData.widthMeters / locationData.heightMeters
            let imageWidth: number
            let imageHeight: number

            if (aspectRatio > 1) {
              // Wider than tall
              imageWidth = targetSize
              imageHeight = targetSize / aspectRatio
            } else {
              // Taller than wide
              imageHeight = targetSize
              imageWidth = targetSize * aspectRatio
            }

            const satelliteElement: DrawingElement = {
              id: `satellite-${Date.now()}`,
              type: 'image',
              points: [{ x: centerX - imageWidth / 2, y: centerY - imageHeight / 2 }],
              style: {
                stroke: 'transparent',
                strokeWidth: 0,
                fillOpacity: satelliteLayer.opacity
              },
              layer: newLayerId,
              imageUrl: locationData.satelliteImageDataUrl,
              imageWidth,
              imageHeight,
              imageOpacity: satelliteLayer.opacity,
              locked: false
            }

            const newElements = [satelliteElement, ...elements]
            setElements(newElements)
            addToHistory(newElements)

            addDebugLog(`✅ Satellite image loaded and added to canvas`, 'success')
          }
        }).catch(() => {
          addDebugLog(`❌ Failed to load satellite image`, 'error')
        })
      }

      // Add terrain layer if terrain data is included
      const terrainLayer = importedMapLayers.find(l => l.type === 'terrain')
      if (terrainLayer && locationData.elevationGrid) {
        const terrainLayerId = `map-terrain-${Date.now()}`
        const newTerrainLayer: Layer = {
          id: terrainLayerId,
          name: 'Map Terrain',
          visible: true,
          locked: false,
          color: '#48bb78',
          opacity: 0.6,
          lineWeight: 1,
          description: `Terrain elevation data (${locationData.minElevation?.toFixed(1)}m - ${locationData.maxElevation?.toFixed(1)}m)`
        }
        setLayers(prev => [newTerrainLayer, ...prev])

        addDebugLog(`✅ Terrain data imported: elevation range ${locationData.minElevation?.toFixed(1)}m - ${locationData.maxElevation?.toFixed(1)}m`, 'success')
      }

      addDebugLog(`✅ Successfully imported location: ${locationData.address || 'Unknown location'}`, 'success')
      addDebugLog(`   Area: ${locationData.widthMeters.toFixed(0)}m × ${locationData.heightMeters.toFixed(0)}m`, 'info')

    } catch (error) {
      console.error('Google Maps import error:', error)
      addDebugLog(`❌ Failed to import location: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleExport = async (format: 'pdf' | 'png' | 'svg') => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check if user can export (usage tracking)
    if (!canUseFeature('exports')) {
      setShowUpgradePrompt('export_attempt')
      return
    }

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF()
          break
        case 'png':
          exportToPNG()
          break
        case 'svg':
          exportToSVG()
          break
      }

      // Track successful export
      useFeature('exports')

    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export. Please try again.')
    }
  }

  const exportToPDF = async () => {
    // Use the clean export function instead of raw canvas
    await exportCleanDrawing('pdf')
  }

  const exportToPNG = () => {
    // Use the clean export function instead of raw canvas
    exportCleanDrawing('png')
  }

  const exportToSVG = () => {
    // Create SVG representation of the drawing
    let svgContent = `<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <g transform="scale(${zoom}) translate(${pan.x}, ${pan.y})">
    `

    // Add elements
    elements.forEach(element => {
      switch (element.type) {
        case 'line':
          if (element.points.length >= 2) {
            svgContent += `<line x1="${element.points[0].x}" y1="${element.points[0].y}"
                          x2="${element.points[1].x}" y2="${element.points[1].y}"
                          stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"/>`
          }
          break
        case 'rectangle':
          if (element.points.length >= 2) {
            const width = element.points[1].x - element.points[0].x
            const height = element.points[1].y - element.points[0].y
            svgContent += `<rect x="${element.points[0].x}" y="${element.points[0].y}"
                          width="${width}" height="${height}"
                          stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}"
                          fill="${element.style.fill || 'none'}"/>`
          }
          break
        case 'circle':
          if (element.points.length >= 2) {
            const radius = Math.sqrt(
              Math.pow(element.points[1].x - element.points[0].x, 2) +
              Math.pow(element.points[1].y - element.points[0].y, 2)
            )
            svgContent += `<circle cx="${element.points[0].x}" cy="${element.points[0].y}"
                          r="${radius}" stroke="${element.style.stroke}"
                          stroke-width="${element.style.strokeWidth}"
                          fill="${element.style.fill || 'none'}"/>`
          }
          break
      }
    })

    svgContent += '</g></svg>'

    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${projectName.replace(/\s+/g, '_')}_CAD_Drawing.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const analyzeDrawingWithAI = async () => {
    setIsAnalyzing(true)
    try {
      console.log('Starting AI analysis with', elements.length, 'elements')

      const response = await fetch('/api/ai/hazard-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cadElements: elements,
          projectInfo: {
            name: projectName,
            elementCount: elements.length,
            layers: layers.map(l => ({ name: l.name, visible: l.visible, elementCount: elements.filter(e => e.layer === l.id).length })),
            canvasSize: { width: 1200, height: 800 },
            zoom: zoom,
            pan: pan
          }
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log('AI analysis successful:', responseData)
        setAiAnalysis(responseData)
        setShowAIAnalysis(true)
      } else {
        const errorMessage = responseData.error || 'Failed to analyze drawing'
        console.error('AI analysis error response:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze drawing'
      alert(`❌ AI Analysis Error:\n\n${errorMsg}\n\nMake sure:\n1. OpenAI API key is set in .env\n2. You have sufficient API credits\n3. Your internet connection is working`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // Convert pixel distance to real-world units based on drawing scale
  // IMPORTANT: This assumes 1 pixel = 1 drawing unit at 1:1 scale
  // For scale 1:100, 1 pixel = 100 drawing units
  const pixelsToUnits = (pixelDistance: number): number => {
    // Parse the scale ratio (e.g., "1:100" means 1 drawing unit on paper = 100 real units)
    const scaleParts = drawingScale.split(':')
    if (scaleParts.length !== 2) return pixelDistance

    const scaleFrom = parseFloat(scaleParts[0])
    const scaleTo = parseFloat(scaleParts[1])

    if (scaleFrom === 0) return pixelDistance

    // CAD Scale Conversion:
    // If scale is 1:100, then 1 pixel on screen represents 100 drawing units
    // So: pixelDistance * (scaleTo / scaleFrom) = distance in drawing units
    const distanceInDrawingUnits = pixelDistance * (scaleTo / scaleFrom)

    return distanceInDrawingUnits
  }

  // Format distance for display with units
  const formatDistance = (pixelDistance: number): string => {
    const distance = pixelsToUnits(pixelDistance)
    // Display in the current drawing units
    const unitSymbol = drawingUnits === 'm' ? 'm' : drawingUnits === 'cm' ? 'cm' : drawingUnits === 'mm' ? 'mm' : drawingUnits === 'ft' ? 'ft' : 'in'

    // Format with appropriate decimal places based on unit
    let decimals = 2
    if (drawingUnits === 'mm') decimals = 0  // mm usually shown as whole numbers
    if (drawingUnits === 'cm') decimals = 1  // cm with 1 decimal
    if (drawingUnits === 'm') decimals = 2   // m with 2 decimals
    if (drawingUnits === 'ft') decimals = 2  // ft with 2 decimals
    if (drawingUnits === 'in') decimals = 2  // in with 2 decimals

    return `${distance.toFixed(decimals)} ${unitSymbol}`
  }

  const calculateElementCenter = (element: DrawingElement): Point => {
    if (element.points.length === 0) return { x: 0, y: 0 }

    const sumX = element.points.reduce((sum, point) => sum + point.x, 0)
    const sumY = element.points.reduce((sum, point) => sum + point.y, 0)

    return {
      x: sumX / element.points.length,
      y: sumY / element.points.length
    }
  }

  const scalePoint = (point: Point, center: Point, scaleFactor: number): Point => {
    const dx = point.x - center.x
    const dy = point.y - center.y

    return {
      x: center.x + dx * scaleFactor,
      y: center.y + dy * scaleFactor
    }
  }

  const calculateScaleFactor = (center: Point, startPoint: Point, currentPoint: Point): number => {
    const startDistance = calculateDistance(center, startPoint)
    const currentDistance = calculateDistance(center, currentPoint)

    if (startDistance === 0) return 1
    return currentDistance / startDistance
  }



  const calculateArea = (points: Point[]): number => {
    if (points.length < 3) return 0

    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area) / 2
  }

  const convertUnits = (value: number, fromUnit: string = 'px'): number => {
    // Assuming 1 pixel = 1mm at 100% zoom for base conversion
    const pixelToMm = 1
    const mmValue = value * pixelToMm

    switch (units) {
      case 'mm': return mmValue
      case 'm': return mmValue / 1000
      case 'ft': return (mmValue / 1000) / 0.3048  // Convert mm to meters, then to feet
      case 'in': return (mmValue / 1000) / 0.0254  // Convert mm to meters, then to inches
      default: return mmValue
    }
  }

  const formatMeasurement = (value: number): string => {
    const converted = convertUnits(value)
    return `${converted.toFixed(2)} ${units}`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading CAD Editor...</div>
      </div>
    )
  }

  // Allow CAD interface to work without authentication for now
  // if (!session) {
  //   return null
  // }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-2 h-12 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          {/* Return to Training Button - Only show if in training mode */}
          {typeof window !== 'undefined' && sessionStorage.getItem('trainingScenario') && (
            <Button
              onClick={() => {
                sessionStorage.setItem('cadDrawingComplete', 'true')
                router.push('/training')
              }}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              ← Return to Training
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <NextImage src="/company-logo.png" alt="Lift Planner Pro" width={24} height={24} className="rounded" />
            <span className="text-white font-semibold">CAD Editor</span>
          </div>
          <div className="text-slate-400">|</div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-white font-medium border-none outline-none focus:bg-slate-700 px-2 py-1 rounded text-sm"
            placeholder="Project name"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            onClick={analyzeDrawingWithAI}
            disabled={isAnalyzing || elements.length === 0}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGroundBearingCalc(true)}
            className="text-slate-300 hover:text-white"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Ground Bearing
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => setShowExportDialog(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                📐 Professional 2D Export (PDF/DWG/DXF)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowExportLayoutDialog(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                📄 Professional Export Layout
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportCleanDrawing('png')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                🖼️ Quick PNG Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('pdf')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                📋 Basic PDF Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('svg')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/cad-3d')}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                🧱 Open 3D CAD (beta)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Signal that drawing is complete and return to training
                  sessionStorage.setItem('cadDrawingComplete', 'true')
                  router.back()
                }}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                ← Return to Training
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Horizontal Ribbon */}
      <CADRibbon
        tool={tool}
        setTool={(t) => setTool(t as any)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSave={handleSave}
        onAnalyze={analyzeDrawingWithAI}
        onExport={(format: string) => handleExport(format as 'pdf' | 'png' | 'svg')}
        onImport={() => setShowImportDialog(true)}
        onShowCraneLibrary={() => setShowCraneLibrary(true)}
        onShowConfigurableCrane={() => setShowConfigurableCraneDialog(true)}
        onShowCraneBuilder={() => setShowCraneBuilderDialog(true)}
        onShowScenarioLibrary={() => setShowScenarioLibrary(true)}
        onShowPersonnelLibrary={() => setShowPersonnelLibrary(true)}
        onShowChainBlockDialog={() => setShowChainBlockDialog(true)}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        snapToObjects={snapToObjects}
        setSnapToObjects={setSnapToObjects}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSaving={isSaving}
        isAnalyzing={isAnalyzing}
        zoom={zoom}
        onShowAdvancedSnapping={() => setShowAdvancedSnappingPanel(!showAdvancedSnappingPanel)}
        onShowMeasurements={() => setShowMeasurementPanel(!showMeasurementPanel)}
        onShowTransformation={() => setShowTransformationPanel(!showTransformationPanel)}
        onShowCommandLine={() => setShowCommandLinePanel(!showCommandLinePanel)}
        onShowProfessionalFeatures={() => setShowProfessionalFeaturesPanel(!showProfessionalFeaturesPanel)}
        onTrim={startTrimCommand}
        onMirror={startMirrorCommand}
        onJoin={startJoinCommand}
        onOffset={() => setShowTransformationPanel(true)}
        onFillet={() => setShowTransformationPanel(true)}
        onChamfer={() => setShowTransformationPanel(true)}
        onArray={startArrayCommand}
        onImportLocation={() => setShowGoogleMapsImport(true)}
      />

      <div className="flex flex-1 overflow-hidden">



        {/* Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className={`bg-white w-full h-full ${
              isResizing ? (
                resizeHandle === 'se' || resizeHandle === 'nw' ? 'cursor-nw-resize' :
                resizeHandle === 'sw' || resizeHandle === 'ne' ? 'cursor-ne-resize' : 'cursor-move'
              ) : isDraggingTable ? 'cursor-grabbing' :
              isDraggingTitleBlock ? 'cursor-grabbing' :
              tool === 'move' ? 'cursor-move' :
              tool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') :
              tool === 'select' ? 'cursor-pointer' : 'cursor-crosshair'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />

          {/* Status Bar */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-slate-300">
            <div className="flex items-center space-x-4">
              <span>Tool: {tool}</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <span>Elements: {elements.length}</span>
              {showCoordinates && (
                <span>X: {mousePosition.x.toFixed(1)}, Y: {mousePosition.y.toFixed(1)}</span>
              )}
              {snapPoint && (
                <span className="text-green-400">SNAP</span>
              )}
              {isDrawingPolyline && (
                <span className="text-blue-400">Polyline: {currentPolyline.length} points (double-click to finish)</span>
              )}
            </div>
          </div>

          {/* Coordinate Input Dialog */}
          {showCoordinateInput && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg">
              <h3 className="text-white font-semibold mb-3">Precise Coordinate Input</h3>
              <div className="flex space-x-2 mb-3">
                <div>
                  <label className="text-slate-300 text-sm">X:</label>
                  <Input
                    type="number"
                    value={coordinateInput.x}
                    onChange={(e) => setCoordinateInput({...coordinateInput, x: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white w-20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Y:</label>
                  <Input
                    type="number"
                    value={coordinateInput.y}
                    onChange={(e) => setCoordinateInput({...coordinateInput, y: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white w-20"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // Apply coordinate input
                    const x = parseFloat(coordinateInput.x) || 0
                    const y = parseFloat(coordinateInput.y) || 0
                    // Handle coordinate input logic here
                    setShowCoordinateInput(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCoordinateInput(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Properties</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLayerManager(!showLayerManager)}
              className="text-slate-300 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Drawing Properties */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Drawing Properties
            </h4>

            {/* Stroke Color */}
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Stroke Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={currentStrokeColor}
                    onChange={(e) => setCurrentStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-600 bg-slate-700"
                  />
                  <Input
                    value={currentStrokeColor}
                    onChange={(e) => setCurrentStrokeColor(e.target.value)}
                    className="flex-1 bg-slate-700 border-slate-600 text-white text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Fill Color */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Fill Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={currentFillColor === 'transparent' ? '#ffffff' : currentFillColor}
                    onChange={(e) => setCurrentFillColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-600 bg-slate-700"
                    disabled={currentFillColor === 'transparent'}
                  />
                  <select
                    value={currentFillColor}
                    onChange={(e) => setCurrentFillColor(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="transparent">No Fill</option>
                    <option value="#ffffff">White</option>
                    <option value="#000000">Black</option>
                    <option value="#3b82f6">Blue</option>
                    <option value="#10b981">Green</option>
                    <option value="#f59e0b">Yellow</option>
                    <option value="#ef4444">Red</option>
                  </select>
                </div>
              </div>

              {/* Line Weight */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Line Weight</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.25"
                    max="10"
                    step="0.25"
                    value={currentStrokeWidth}
                    onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white text-sm w-12">{currentStrokeWidth}px</span>
                </div>
              </div>

              {/* Line Type */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Line Type</label>
                <select
                  value={currentLineType}
                  onChange={(e) => setCurrentLineType(e.target.value as 'solid' | 'dashed' | 'dotted')}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              {/* Fill Opacity */}
              {currentFillColor !== 'transparent' && (
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Fill Opacity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={currentFillOpacity}
                      onChange={(e) => setCurrentFillOpacity(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-12">{Math.round(currentFillOpacity * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Font Properties */}
              <div className="space-y-3 pt-3 border-t border-slate-600">
                <h5 className="text-slate-300 text-sm font-medium">Text Properties</h5>

                <div>
                  <label className="text-slate-400 text-sm block mb-1">Font Size</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="8"
                      max="72"
                      value={currentFontSize}
                      onChange={(e) => setCurrentFontSize(Number(e.target.value))}
                      className="flex-1 bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <span className="text-slate-400 text-sm">px</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-1">Font Family</label>
                  <select
                    value={currentFontFamily}
                    onChange={(e) => setCurrentFontFamily(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>

                <div className="bg-slate-800 p-2 rounded text-center">
                  <span
                    className="text-white"
                    style={{
                      fontSize: `${Math.min(currentFontSize, 14)}px`,
                      fontFamily: currentFontFamily
                    }}
                  >
                    Sample Text
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Properties Button */}
            {selectedElements.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-600">
                <Button
                  onClick={applyCurrentPropertiesToSelected}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Apply to Selected ({selectedElements.length})
                </Button>
              </div>
            )}
          </Card>

          {/* View Controls */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              View Controls
            </h4>

            <div className="space-y-3">
              {/* Rulers Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-sm">Show Rulers</label>
                <input
                  type="checkbox"
                  checked={showRulers}
                  onChange={(e) => setShowRulers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                />
              </div>

              {/* Coordinates Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-sm">Show Coordinates</label>
                <input
                  type="checkbox"
                  checked={showCoordinates}
                  onChange={(e) => setShowCoordinates(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                />
              </div>

              {/* Status Bar Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-sm">Status Bar</label>
                <input
                  type="checkbox"
                  checked={showStatusBar}
                  onChange={(e) => setShowStatusBar(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                />
              </div>

              {/* Drawing Units */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Drawing Units</label>
                <select
                  value={drawingUnits}
                  onChange={(e) => setDrawingUnits(e.target.value as any)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="in">Inches (in)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  All dimensions will display in {drawingUnits}
                </p>
              </div>

              {/* Drawing Scale */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Drawing Scale</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={drawingScale}
                    onChange={(e) => setDrawingScale(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="1:1">1:1 (Full Size)</option>
                    <option value="1:2">1:2 (Half Size)</option>
                    <option value="1:5">1:5</option>
                    <option value="1:10">1:10</option>
                    <option value="1:20">1:20</option>
                    <option value="1:50">1:50</option>
                    <option value="1:100">1:100</option>
                    <option value="1:200">1:200</option>
                    <option value="1:500">1:500</option>
                    <option value="2:1">2:1 (Double Size)</option>
                    <option value="5:1">5:1</option>
                    <option value="10:1">10:1</option>
                    <option value="custom">Custom...</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowScaleDialog(true)}
                    className="px-2"
                    title="Custom Scale"
                  >
                    ⚙️
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Scale {drawingScale}: 1 pixel = {drawingScale.split(':')[1]} {drawingUnits}
                </p>
              </div>

              {/* Scale & Units Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded p-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">📐 How Dimensions Work:</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• <strong>Units:</strong> All measurements display in {drawingUnits}</li>
                  <li>• <strong>Scale:</strong> {drawingScale} means 1 pixel = {drawingScale.split(':')[1]} {drawingUnits}</li>
                  <li>• <strong>Accuracy:</strong> Draw dimensions first to establish scale reference</li>
                  <li>• <strong>Example:</strong> Draw a 100px line at 1:100 scale = 10,000 {drawingUnits}</li>
                </ul>
              </div>

              {/* Snap Tolerance */}
              <div>
                <label className="text-slate-400 text-sm block mb-1">Snap Tolerance</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={snapTolerance}
                    onChange={(e) => setSnapTolerance(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white text-sm w-12">{snapTolerance}px</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Project Settings */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Project Settings
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Project Name</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      console.log('Key pressed:', e.key, 'Current value:', e.currentTarget.value)
                    }}
                    onInput={(e) => {
                      console.log('Input event:', e.currentTarget.value)
                    }}
                    className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter project name"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProjectDialog(true)}
                    className="px-2"
                    title="Project Settings"
                  >
                    ⚙️
                  </Button>
                </div>

              </div>
            </div>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-2">Current Tool</h4>
            <p className="text-slate-400 text-sm capitalize">{tool}</p>
          </Card>

          {/* Enhanced Layers Panel */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-300 font-medium flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Layers ({layers.length})
              </h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewLayer}
                  className="w-6 h-6 p-0 text-slate-400 hover:text-white"
                  title="Add New Layer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLayerManager(!showLayerManager)}
                  className="w-6 h-6 p-0 text-slate-400 hover:text-white"
                  title="Layer Manager"
                >
                  {showLayerManager ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {layers.map((layer) => (
                <div key={layer.id} className="group">
                  <div
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      currentLayer === layer.id ? 'bg-blue-600/30 border border-blue-500/50' : 'hover:bg-slate-600/50'
                    }`}
                    onClick={() => !layer.locked && setCurrentLayer(layer.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded border border-slate-500 flex-shrink-0"
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <span className={`text-sm truncate ${layer.locked ? 'text-slate-500' : 'text-slate-300'}`}>
                        {layer.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({elements.filter(e => e.layer === layer.id).length})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Visibility Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-5 h-5 p-0 hover:bg-slate-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLayers(layers.map(l =>
                            l.id === layer.id ? { ...l, visible: !l.visible } : l
                          ))
                        }}
                        title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3 text-slate-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-500" />
                        )}
                      </Button>

                      {/* Lock Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-5 h-5 p-0 hover:bg-slate-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLayers(layers.map(l =>
                            l.id === layer.id ? { ...l, locked: !l.locked } : l
                          ))
                        }}
                        title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                      >
                        {layer.locked ? (
                          <Lock className="w-3 h-3 text-slate-400" />
                        ) : (
                          <Unlock className="w-3 h-3 text-slate-500" />
                        )}
                      </Button>

                      {/* Layer Menu */}
                      {showLayerManager && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-5 h-5 p-0 hover:bg-slate-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Settings className="w-3 h-3 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                const newName = prompt('Enter new layer name:', layer.name)
                                if (newName && newName.trim()) {
                                  renameLayer(layer.id, newName.trim())
                                }
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateLayer(layer.id)
                              }}
                              className="text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {layers.length > 1 && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm(`Delete layer "${layer.name}"? Elements will be moved to another layer.`)) {
                                    deleteLayer(layer.id)
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Layer Details (when expanded) */}
                  {showLayerManager && currentLayer === layer.id && (
                    <div className="ml-5 mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-400">
                      <div>Elements: {elements.filter(e => e.layer === layer.id).length}</div>
                      <div>Weight: {layer.lineWeight}px</div>
                      <div>Opacity: {Math.round((layer.opacity || 1) * 100)}%</div>
                      {layer.description && <div>Info: {layer.description}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Units and Measurements */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Measurements
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-sm">Units:</label>
                <div className="flex space-x-1 mt-1">
                  {(['mm', 'm', 'ft', 'in'] as const).map((unit) => (
                    <Button
                      key={unit}
                      variant={units === unit ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUnits(unit)}
                      className="h-6 px-2 text-xs"
                    >
                      {unit}
                    </Button>
                  ))}
                </div>
              </div>

              {measurements.length > 0 && (
                <div>
                  <h5 className="text-slate-400 text-sm font-medium mb-2">Recent Measurements:</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {measurements.slice(-5).map((measurement) => (
                      <div key={measurement.id} className="text-xs text-slate-300 bg-slate-600/50 rounded p-2">
                        <div className="flex justify-between">
                          <span>{measurement.type === 'distance' ? 'Distance:' : 'Area:'}</span>
                          <span className="font-mono">
                            {formatMeasurement(measurement.value)}
                            {measurement.type === 'area' ? ` ${units}²` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setMeasurements([])}
                    className="w-full mt-2 bg-red-600/20 hover:bg-red-600/30 text-red-400"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Drawing Options */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3">Drawing Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Snap to Grid</span>
                <Button
                  variant={snapToGrid ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className="h-6 px-2 text-xs"
                >
                  {snapToGrid ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Snap to Objects</span>
                <Button
                  variant={snapToObjects ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSnapToObjects(!snapToObjects)}
                  className="h-6 px-2 text-xs"
                >
                  {snapToObjects ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Show Coordinates</span>
                <Button
                  variant={showCoordinates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowCoordinates(!showCoordinates)}
                  className="h-6 px-2 text-xs"
                >
                  {showCoordinates ? 'On' : 'Off'}
                </Button>
              </div>
              <Button
                onClick={() => setShowCoordinateInput(true)}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Coordinate Input (Ctrl+C)
              </Button>
            </div>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-3">Shortcuts</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <div>Ctrl+Z - Undo</div>
              <div>Ctrl+Y - Redo</div>
              <div>Delete - Delete Last Element</div>
              <div>G - Toggle Grid Snap</div>
              <div>S - Toggle Object Snap</div>
              <div>Ctrl+C - Coordinate Input</div>
              <div>Esc - Cancel Operation</div>
              <div>Double-click - Finish Polyline</div>
            </div>
          </Card>

          {/* AI Analysis Panel */}
          {showAIAnalysis && aiAnalysis && (
            <Card className="bg-slate-700/50 border-slate-600 p-4">
              <h4 className="text-slate-300 font-medium mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Safety Analysis
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {aiAnalysis.analysis?.hazards && aiAnalysis.analysis.hazards.length > 0 && (
                  <div>
                    <h5 className="text-slate-400 text-sm font-medium mb-2">Identified Hazards:</h5>
                    <div className="space-y-1">
                      {aiAnalysis.analysis.hazards.slice(0, 3).map((hazard: string, index: number) => (
                        <div key={index} className="text-xs text-slate-300 bg-red-600/20 border border-red-500/50 rounded p-2">
                          {hazard}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiAnalysis.analysis?.recommendations && aiAnalysis.analysis.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-slate-400 text-sm font-medium mb-2">Recommendations:</h5>
                    <div className="space-y-1">
                      {aiAnalysis.analysis.recommendations.slice(0, 2).map((rec: string, index: number) => (
                        <div key={index} className="text-xs text-slate-300 bg-green-600/20 border border-green-500/50 rounded p-2">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiAnalysis.analysis?.riskLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Risk Level:</span>
                    <span className={`text-sm font-medium ${
                      aiAnalysis.analysis.riskLevel === 'High' ? 'text-red-400' :
                      aiAnalysis.analysis.riskLevel === 'Medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {aiAnalysis.analysis.riskLevel}
                    </span>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => setShowAIAnalysis(false)}
                  className="w-full bg-slate-600 hover:bg-slate-700"
                >
                  Close Analysis
                </Button>
              </div>
            </Card>
          )}

          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <h4 className="text-slate-300 font-medium mb-2">Project Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Elements:</span>
                <span className="text-white">{elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zoom:</span>
                <span className="text-white">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Layer:</span>
                <span className="text-white">{layers.find(l => l.id === currentLayer)?.name}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Professional Feature Panels */}
        {showAdvancedSnappingPanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Magnet className="w-4 h-4 mr-2" />
                Advanced Snapping
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSnappingPanel(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <AdvancedSnappingPanel
              snapToEndpoint={snapToEndpoint}
              setSnapToEndpoint={setSnapToEndpoint}
              snapToMidpoint={snapToMidpoint}
              setSnapToMidpoint={setSnapToMidpoint}
              snapToCenter={snapToCenter}
              setSnapToCenter={setSnapToCenter}
              snapToIntersection={snapToIntersection}
              setSnapToIntersection={setSnapToIntersection}
              snapToPerpendicular={snapToPerpendicular}
              setSnapToPerpendicular={setSnapToPerpendicular}
              snapToTangent={snapToTangent}
              setSnapToTangent={setSnapToTangent}
              snapToGrid={snapToGrid}
              setSnapToGrid={setSnapToGrid}
              showSnapIndicators={showSnapIndicators}
              setShowSnapIndicators={setShowSnapIndicators}
              snapTolerance={snapToleranceAdvanced}
              setSnapTolerance={setSnapToleranceAdvanced}
            />
          </div>
        )}

        {showMeasurementPanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Ruler className="w-4 h-4 mr-2" />
                Measurements & Analysis
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeasurementPanel(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <MeasurementAnalysisPanel
              measurements={measurements.map(m => ({ ...m, timestamp: Date.now() })) as any}
              onClearMeasurements={() => setMeasurements([])}
              onExportMeasurements={() => {
                const csv = measurements.map(m => `${m.type},${m.value}`).join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'measurements.csv'
                a.click()
              }}
              selectedMeasurement={null}
              onSelectMeasurement={() => {}}
            />
          </div>
        )}

        {showTransformationPanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Repeat2 className="w-4 h-4 mr-2" />
                Transformation Tools
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTransformationPanel(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <TransformationToolsPanel
              onMirror={startMirrorCommand}
              onOffset={() => {}}
              onArray={(type, params) => {
                if (selectedElements.length === 0) {
                  alert('Please select elements first')
                  return
                }

                const arrayConfig = {
                  type: type === 'rectangular' ? 'rectangular' as const : 'polar' as const,
                  rows: params.rows || 2,
                  columns: params.columns || 2,
                  rowSpacing: params.spacingY || 50,
                  columnSpacing: params.spacingX || 50,
                  angle: 0,
                  count: params.count || 4,
                  centerPoint: null as Point | null
                }

                executeArray(selectedElements, arrayConfig)
                addDebugLog(`Array created: ${type} with ${selectedElements.length} elements`, 'success')
              }}
              onFillet={(radius) => applyFillet(radius)}
              onChamfer={(distance) => applyChamfer(distance)}
              selectedElementCount={selectedElements.length}
            />
          </div>
        )}

        {showCommandLinePanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                Command Line
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommandLinePanel(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <CommandLineInterface
              isOpen={showCommandLinePanel}
              onClose={() => setShowCommandLinePanel(false)}
              onCommand={(command) => {
                // Handle command execution
                const cmd = command.toLowerCase().trim()
                if (cmd === 'line') setTool('line' as any)
                else if (cmd === 'rect') setTool('rectangle' as any)
                else if (cmd === 'circle') setTool('circle' as any)
                else if (cmd === 'mirror') startMirrorCommand()
                else if (cmd === 'array') startArrayCommand()
                else if (cmd === 'measure') setTool('measure' as any)
                else if (cmd === 'area') setTool('area' as any)
                else if (cmd === 'undo') handleUndo()
                else if (cmd === 'redo') handleRedo()
                else if (cmd === 'zoom in') handleZoomIn()
                else if (cmd === 'zoom out') handleZoomOut()
                else if (cmd === 'select all') setSelectedElements(elements.map(e => e.id))
                else if (cmd === 'deselect') setSelectedElements([])
                else if (cmd === 'delete') {
                  const newElements = elements.filter(e => !selectedElements.includes(e.id))
                  setElements(newElements)
                  addToHistory(newElements)
                }
              }}
            />
          </div>
        )}

        {showProfessionalFeaturesPanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Professional Features
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfessionalFeaturesPanel(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <ProfessionalFeaturesPanel
              projectInfo={projectInfo}
              setProjectInfo={setProjectInfo}
              exportConfig={exportConfig}
              setExportConfig={setExportConfig}
              onExport={(format: string) => handleExport(format as 'pdf' | 'png' | 'svg')}
              drawingScale={drawingScale}
              setDrawingScale={setDrawingScale}
            />
          </div>
        )}

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center">
                🐛 Debug Panel
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugInfo([])}
                className="text-slate-300 hover:text-white"
                title="Clear Debug Log"
              >
                🗑️
              </Button>
            </div>

            {/* Current Command Status */}
            <Card className="bg-slate-800/50 border-slate-600 p-3">
              <h4 className="text-slate-300 font-medium mb-2">Command Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Command:</span>
                  <span className="text-white">{advancedCommand || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Command Step:</span>
                  <span className="text-white">{commandStep}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Elements:</span>
                  <span className="text-white">{selectedElements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Elements:</span>
                  <span className="text-white">{elements.length}</span>
                </div>
              </div>
            </Card>

            {/* Debug Log */}
            <Card className="bg-slate-800/50 border-slate-600 p-3">
              <h4 className="text-slate-300 font-medium mb-2">Debug Log</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
                {debugInfo.length === 0 ? (
                  <div className="text-slate-500 italic">No debug messages yet...</div>
                ) : (
                  debugInfo.map((log, index) => (
                    <div
                      key={index}
                      className={`p-1 rounded ${
                        log.includes('ERROR') ? 'bg-red-900/30 text-red-300' :
                        log.includes('WARNING') ? 'bg-yellow-900/30 text-yellow-300' :
                        log.includes('SUCCESS') ? 'bg-green-900/30 text-green-300' :
                        'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Tool Instructions */}
            {advancedCommand && (
              <Card className="bg-slate-800/50 border-slate-600 p-3">
                <h4 className="text-slate-300 font-medium mb-2">Instructions</h4>
                <div className="text-sm text-slate-400">
                  {advancedCommand === 'trim' && commandStep === 0 && "Click on the cutting edge (line/element to cut with)"}
                  {advancedCommand === 'trim' && commandStep === 1 && "Click on the element to trim"}
                  {advancedCommand === 'mirror' && commandStep === 0 && "Select objects to mirror, then click empty space"}
                  {advancedCommand === 'mirror' && commandStep === 1 && "Click second point to define mirror axis"}
                  {advancedCommand === 'join' && "Select 2 or more elements to join together"}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-600 p-3">
              <h4 className="text-slate-300 font-medium mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addDebugLog('🔄 Manual test - checking element detection', 'info')
                    addDebugLog(`Elements in drawing: ${elements.map(el => `${el.type}(${el.id})`).join(', ')}`, 'info')
                  }}
                  className="w-full text-xs"
                >
                  Test Element Detection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (advancedCommand) {
                      addDebugLog(`❌ Cancelling ${advancedCommand} command`, 'warning')
                      setAdvancedCommand(null)
                      setCommandStep(0)
                      setCommandData({})
                      setSelectedElements([])
                    }
                  }}
                  className="w-full text-xs"
                >
                  Cancel Current Command
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Status Bar - Professional Features Integration */}
      {showStatusBar && (
        <div className="h-8 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-sm text-slate-300">
          <div className="flex items-center space-x-6">
            <span>Project: <span className="text-white">{projectName}</span></span>
            <span>Tool: <span className="text-white capitalize">{tool}</span></span>
            <span>Layer: <span className="text-white">{layers.find(l => l.id === currentLayer)?.name}</span></span>
            <span>Units: <span className="text-white">{drawingUnits}</span></span>
            <span>Scale: <span className="text-white">{drawingScale}</span></span>
            <span>Zoom: <span className="text-white">{Math.round(zoom * 100)}%</span></span>
          </div>
          <div className="flex items-center space-x-6">
            {mousePosition && (
              <span>
                X: <span className="text-white">{Math.round(mousePosition.x)}</span>,
                Y: <span className="text-white">{Math.round(mousePosition.y)}</span>
              </span>
            )}
            <span>Elements: <span className="text-white">{elements.length}</span></span>
            <span>Selected: <span className="text-white">{selectedElements.length}</span></span>
            {/* Auto-save indicator */}
            <span className="flex items-center gap-1">
              {hasUnsavedChanges ? (
                <span className="text-amber-400">● Unsaved</span>
              ) : lastSaved ? (
                <span className="text-green-400">✓ Saved {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span className="text-slate-500">Auto-save enabled</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Insert Table</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTableDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Rows</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={tableConfig.rows}
                      onChange={(e) => setTableConfig({...tableConfig, rows: parseInt(e.target.value) || 3})}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (tableConfig.rows < 20) {
                          const newRows = tableConfig.rows + 1
                          const newData = [...tableConfig.data, Array(tableConfig.columns).fill('')]
                          setTableConfig({
                            ...tableConfig,
                            rows: newRows,
                            data: newData
                          })
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3"
                      title="Add row"
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => {
                        if (tableConfig.rows > 1) {
                          const newRows = tableConfig.rows - 1
                          const newData = tableConfig.data.slice(0, newRows - 1)
                          setTableConfig({
                            ...tableConfig,
                            rows: newRows,
                            data: newData
                          })
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3"
                      title="Remove row"
                    >
                      −
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Columns</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={tableConfig.columns}
                      onChange={(e) => setTableConfig({...tableConfig, columns: parseInt(e.target.value) || 3})}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (tableConfig.columns < 10) {
                          const newColumns = tableConfig.columns + 1
                          const newHeaders = [...tableConfig.headers, `Header ${newColumns}`]
                          const newData = tableConfig.data.map(row => [...row, ''])
                          setTableConfig({
                            ...tableConfig,
                            columns: newColumns,
                            headers: newHeaders,
                            data: newData
                          })
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3"
                      title="Add column"
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => {
                        if (tableConfig.columns > 1) {
                          const newColumns = tableConfig.columns - 1
                          const newHeaders = tableConfig.headers.slice(0, newColumns)
                          const newData = tableConfig.data.map(row => row.slice(0, newColumns))
                          setTableConfig({
                            ...tableConfig,
                            columns: newColumns,
                            headers: newHeaders,
                            data: newData
                          })
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3"
                      title="Remove column"
                    >
                      −
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Cell Width</label>
                  <Input
                    type="number"
                    min="50"
                    max="300"
                    value={tableConfig.cellWidth}
                    onChange={(e) => setTableConfig({...tableConfig, cellWidth: parseInt(e.target.value) || 100})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Cell Height</label>
                  <Input
                    type="number"
                    min="20"
                    max="100"
                    value={tableConfig.cellHeight}
                    onChange={(e) => setTableConfig({...tableConfig, cellHeight: parseInt(e.target.value) || 30})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Headers (comma-separated)</label>
                <Input
                  value={tableConfig.headers.join(', ')}
                  onChange={(e) => setTableConfig({...tableConfig, headers: e.target.value.split(',').map(h => h.trim())})}
                  placeholder="Header 1, Header 2, Header 3"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Create table at center of view
                    const canvas = canvasRef.current
                    if (!canvas) return

                    const rect = canvas.getBoundingClientRect()
                    const centerX = (-pan.x + rect.width / 2) / zoom
                    const centerY = (-pan.y + rect.height / 2) / zoom

                    const newElement: DrawingElement = {
                      id: Date.now().toString(),
                      type: 'table',
                      points: [
                        { x: centerX, y: centerY },
                        { x: centerX + (tableConfig.columns * tableConfig.cellWidth), y: centerY + (tableConfig.rows * tableConfig.cellHeight) }
                      ],
                      style: {
                        stroke: layers.find(l => l.id === currentLayer)?.color || '#3b82f6',
                        strokeWidth: 1
                      },
                      layer: currentLayer,
                      rows: tableConfig.rows,
                      columns: tableConfig.columns,
                      cellWidth: tableConfig.cellWidth,
                      cellHeight: tableConfig.cellHeight,
                      headers: tableConfig.headers,
                      tableData: Array(tableConfig.rows - 1).fill(null).map(() =>
                        Array(tableConfig.columns).fill('')
                      )
                    }

                    console.log('Creating table:', newElement)
                    const newElements = [...elements, newElement]
                    setElements(newElements)
                    addToHistory(newElements)
                    setShowTableDialog(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Table
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTableDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Title Block Dialog */}
      {showTitleBlockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Insert Title Block</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTitleBlockDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Debug info */}
              <div className="bg-slate-700/50 rounded p-2 text-xs text-slate-400">
                Debug: Title = "{projectInfo.title}", Project = "{projectInfo.projectNumber}"
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Drawing Title</label>
                <input
                  type="text"
                  value={projectInfo.title}
                  onChange={(e) => {
                    console.log('Title changed to:', e.target.value)
                    setProjectInfo({...projectInfo, title: e.target.value})
                  }}
                  placeholder="Enter drawing title"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Project Number</label>
                  <input
                    type="text"
                    value={projectInfo.projectNumber}
                    onChange={(e) => {
                      console.log('Project number changed to:', e.target.value)
                      setProjectInfo({...projectInfo, projectNumber: e.target.value})
                    }}
                    placeholder="P-2024-001"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Scale</label>
                  <input
                    type="text"
                    value={projectInfo.scale}
                    onChange={(e) => setProjectInfo({...projectInfo, scale: e.target.value})}
                    placeholder="1:100"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Drawn By</label>
                  <input
                    type="text"
                    value={projectInfo.drawnBy}
                    onChange={(e) => setProjectInfo({...projectInfo, drawnBy: e.target.value})}
                    placeholder="Engineer name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Checked By</label>
                  <input
                    type="text"
                    value={projectInfo.checkedBy}
                    onChange={(e) => setProjectInfo({...projectInfo, checkedBy: e.target.value})}
                    placeholder="Checker name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Date</label>
                  <input
                    type="date"
                    value={projectInfo.date}
                    onChange={(e) => setProjectInfo({...projectInfo, date: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Revision</label>
                  <input
                    type="text"
                    value={projectInfo.revision}
                    onChange={(e) => setProjectInfo({...projectInfo, revision: e.target.value})}
                    placeholder="A"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Sheet</label>
                  <input
                    type="text"
                    value={projectInfo.sheet}
                    onChange={(e) => setProjectInfo({...projectInfo, sheet: e.target.value})}
                    placeholder="1 of 1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-1">Company Name</label>
                <input
                  type="text"
                  value={projectInfo.company}
                  onChange={(e) => setProjectInfo({...projectInfo, company: e.target.value})}
                  placeholder="Your Company Name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Create title block at bottom right of view
                    const x = -pan.x / zoom + 600
                    const y = -pan.y / zoom + 500

                    const newElement: DrawingElement = {
                      id: Date.now().toString(),
                      type: 'titleblock',
                      points: [
                        { x, y },
                        { x: x + 300, y: y + 120 }
                      ],
                      style: {
                        stroke: layers.find(l => l.id === currentLayer)?.color || '#3b82f6',
                        strokeWidth: 1
                      },
                      layer: currentLayer,
                      titleBlockType: 'standard',
                      projectInfo: { ...projectInfo }
                    }

                    const newElements = [...elements, newElement]
                    setElements(newElements)
                    addToHistory(newElements)
                    setShowTitleBlockDialog(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Title Block
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTitleBlockDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Text Edit Dialog */}
      {showTextEditDialog && editingText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Text</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTextEditDialog(false)
                  setEditingText(null)
                  setEditTextValue('')
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {(() => {
              const element = elements.find(el => el.id === editingText)
              const currentElementFontSize = element?.fontSize || element?.style?.fontSize || currentFontSize
              const currentElementFontFamily = element?.fontFamily || element?.style?.fontFamily || currentFontFamily

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Text Content</label>
                    <textarea
                      value={editTextValue}
                      onChange={(e) => setEditTextValue(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 min-h-[100px] resize-vertical"
                      placeholder="Enter your text here..."
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Font Size</label>
                      <Input
                        type="number"
                        min="8"
                        max="72"
                        value={currentElementFontSize}
                        onChange={(e) => {
                          const newFontSize = Number(e.target.value)
                          const updatedElements = elements.map(el =>
                            el.id === editingText
                              ? {
                                  ...el,
                                  fontSize: newFontSize,
                                  style: { ...el.style, fontSize: newFontSize }
                                }
                              : el
                          )
                          setElements(updatedElements)
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Font Family</label>
                      <select
                        value={currentElementFontFamily}
                        onChange={(e) => {
                          const newFontFamily = e.target.value
                          const updatedElements = elements.map(el =>
                            el.id === editingText
                              ? {
                                  ...el,
                                  fontFamily: newFontFamily,
                                  style: { ...el.style, fontFamily: newFontFamily }
                                }
                              : el
                          )
                          setElements(updatedElements)
                        }}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Impact">Impact</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded">
                    <label className="text-slate-400 text-sm block mb-2">Preview</label>
                    <div
                      className="text-white bg-slate-800 p-2 rounded min-h-[40px] flex items-center"
                      style={{
                        fontSize: `${Math.min(currentElementFontSize, 18)}px`,
                        fontFamily: currentElementFontFamily
                      }}
                    >
                      {editTextValue || 'Sample text preview'}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        // Update text element with content and font properties
                        const updatedElements = elements.map(el =>
                          el.id === editingText
                            ? {
                                ...el,
                                text: editTextValue,
                                fontSize: currentElementFontSize,
                                fontFamily: currentElementFontFamily,
                                style: {
                                  ...el.style,
                                  fontSize: currentElementFontSize,
                                  fontFamily: currentElementFontFamily
                                }
                              }
                            : el
                        )
                        setElements(updatedElements)
                        addToHistory(updatedElements)
                        setShowTextEditDialog(false)
                        setEditingText(null)
                        setEditTextValue('')
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      ✅ Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowTextEditDialog(false)
                        setEditingText(null)
                        setEditTextValue('')
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )
            })()}
          </Card>
        </div>
      )}

      {/* Text Properties Dialog */}
      {showTextPropertiesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                {editingText ? 'Edit Text Properties' : 'Text Properties'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTextPropertiesDialog(false)
                  setEditingText(null)
                  setTextDialogProperties({
                    text: '',
                    fontSize: 16,
                    fontFamily: 'Arial',
                    color: '#ffffff'
                  })
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Text Content</label>
                <textarea
                  value={textDialogProperties.text}
                  onChange={(e) => setTextDialogProperties({
                    ...textDialogProperties,
                    text: e.target.value
                  })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 min-h-[100px] resize-vertical"
                  placeholder="Enter your text here..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Font Size</label>
                  <Input
                    type="number"
                    min="8"
                    max="72"
                    value={textDialogProperties.fontSize}
                    onChange={(e) => setTextDialogProperties({
                      ...textDialogProperties,
                      fontSize: Number(e.target.value)
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Font Family</label>
                  <select
                    value={textDialogProperties.fontFamily}
                    onChange={(e) => setTextDialogProperties({
                      ...textDialogProperties,
                      fontFamily: e.target.value
                    })}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-1">Text Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={textDialogProperties.color}
                    onChange={(e) => setTextDialogProperties({
                      ...textDialogProperties,
                      color: e.target.value
                    })}
                    className="w-8 h-8 rounded border border-slate-600 bg-slate-700"
                  />
                  <Input
                    value={textDialogProperties.color}
                    onChange={(e) => setTextDialogProperties({
                      ...textDialogProperties,
                      color: e.target.value
                    })}
                    className="flex-1 bg-slate-700 border-slate-600 text-white text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="bg-slate-700 p-3 rounded">
                <label className="text-slate-400 text-sm block mb-2">Preview</label>
                <div
                  className="bg-slate-800 p-3 rounded min-h-[60px] flex items-center"
                  style={{
                    fontSize: `${Math.min(textDialogProperties.fontSize, 18)}px`,
                    fontFamily: textDialogProperties.fontFamily,
                    color: textDialogProperties.color
                  }}
                >
                  {textDialogProperties.text || 'Sample text preview'}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (editingText) {
                      // Update existing text element
                      const updatedElements = elements.map(el =>
                        el.id === editingText
                          ? {
                              ...el,
                              text: textDialogProperties.text,
                              fontSize: textDialogProperties.fontSize,
                              fontFamily: textDialogProperties.fontFamily,
                              style: {
                                ...el.style,
                                stroke: textDialogProperties.color,
                                fontSize: textDialogProperties.fontSize,
                                fontFamily: textDialogProperties.fontFamily
                              }
                            }
                          : el
                      )
                      setElements(updatedElements)
                      addToHistory(updatedElements)
                    } else {
                      // Create new text element
                      const point = textClickPosition

                      if (textDialogProperties.text.trim()) {
                        const newElement: DrawingElement = {
                          id: Date.now().toString(),
                          type: 'text',
                          points: [point],
                          style: {
                            stroke: textDialogProperties.color,
                            strokeWidth: 1,
                            fontSize: textDialogProperties.fontSize,
                            fontFamily: textDialogProperties.fontFamily
                          },
                          layer: currentLayer,
                          text: textDialogProperties.text,
                          fontSize: textDialogProperties.fontSize,
                          fontFamily: textDialogProperties.fontFamily
                        }

                        const newElements = [...elements, newElement]
                        setElements(newElements)
                        addToHistory(newElements)
                      }
                    }

                    setShowTextPropertiesDialog(false)
                    setEditingText(null)
                    setTextDialogProperties({
                      text: '',
                      fontSize: 16,
                      fontFamily: 'Arial',
                      color: '#ffffff'
                    })
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!textDialogProperties.text.trim()}
                >
                  {editingText ? '✅ Update Text' : '✅ Create Text'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowTextPropertiesDialog(false)
                    setEditingText(null)
                    setTextDialogProperties({
                      text: '',
                      fontSize: 16,
                      fontFamily: 'Arial',
                      color: '#ffffff'
                    })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Table Configuration Dialog */}
      {showTableConfigDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Table Configuration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTableConfigDialog(false)
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Table Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Rows</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={tableConfig.rows}
                    onChange={(e) => {
                      const newRows = parseInt(e.target.value) || 1
                      const newData = Array(newRows - 1).fill(null).map((_, i) =>
                        tableConfig.data[i] || Array(tableConfig.columns).fill('')
                      )
                      setTableConfig({
                        ...tableConfig,
                        rows: newRows,
                        data: newData
                      })
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Columns</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={tableConfig.columns}
                    onChange={(e) => {
                      const newColumns = parseInt(e.target.value) || 1
                      const newHeaders = Array(newColumns).fill(null).map((_, i) =>
                        tableConfig.headers[i] || `Header ${i + 1}`
                      )
                      const newData = tableConfig.data.map(row =>
                        Array(newColumns).fill(null).map((_, i) => row[i] || '')
                      )
                      setTableConfig({
                        ...tableConfig,
                        columns: newColumns,
                        headers: newHeaders,
                        data: newData
                      })
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Cell Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Cell Width (px)</label>
                  <Input
                    type="number"
                    min="50"
                    max="300"
                    value={tableConfig.cellWidth}
                    onChange={(e) => setTableConfig({
                      ...tableConfig,
                      cellWidth: parseInt(e.target.value) || 120
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Cell Height (px)</label>
                  <Input
                    type="number"
                    min="20"
                    max="100"
                    value={tableConfig.cellHeight}
                    onChange={(e) => setTableConfig({
                      ...tableConfig,
                      cellHeight: parseInt(e.target.value) || 30
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Headers Configuration */}
              <div>
                <label className="text-slate-400 text-sm block mb-2">Column Headers</label>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(tableConfig.columns, 4)}, 1fr)` }}>
                  {tableConfig.headers.slice(0, tableConfig.columns).map((header, index) => (
                    <Input
                      key={index}
                      value={header}
                      onChange={(e) => {
                        const newHeaders = [...tableConfig.headers]
                        newHeaders[index] = e.target.value
                        setTableConfig({
                          ...tableConfig,
                          headers: newHeaders
                        })
                      }}
                      placeholder={`Header ${index + 1}`}
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Table Data */}
              <div>
                <label className="text-slate-400 text-sm block mb-2">Table Data</label>
                <div className="bg-slate-700 p-3 rounded max-h-[200px] overflow-y-auto">
                  {tableConfig.data.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${Math.min(tableConfig.columns, 4)}, 1fr)` }}>
                      {row.slice(0, tableConfig.columns).map((cell, colIndex) => (
                        <Input
                          key={`${rowIndex}-${colIndex}`}
                          value={cell}
                          onChange={(e) => {
                            const newData = [...tableConfig.data]
                            newData[rowIndex] = [...newData[rowIndex]]
                            newData[rowIndex][colIndex] = e.target.value
                            setTableConfig({
                              ...tableConfig,
                              data: newData
                            })
                          }}
                          placeholder={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                          className="bg-slate-600 border-slate-500 text-white text-xs"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Header Style</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Background</label>
                      <input
                        type="color"
                        value={tableConfig.headerStyle.backgroundColor}
                        onChange={(e) => setTableConfig({
                          ...tableConfig,
                          headerStyle: {
                            ...tableConfig.headerStyle,
                            backgroundColor: e.target.value
                          }
                        })}
                        className="w-full h-8 rounded border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Text Color</label>
                      <input
                        type="color"
                        value={tableConfig.headerStyle.textColor}
                        onChange={(e) => setTableConfig({
                          ...tableConfig,
                          headerStyle: {
                            ...tableConfig.headerStyle,
                            textColor: e.target.value
                          }
                        })}
                        className="w-full h-8 rounded border border-slate-600"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Cell Style</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Background</label>
                      <input
                        type="color"
                        value={tableConfig.cellStyle.backgroundColor}
                        onChange={(e) => setTableConfig({
                          ...tableConfig,
                          cellStyle: {
                            ...tableConfig.cellStyle,
                            backgroundColor: e.target.value
                          }
                        })}
                        className="w-full h-8 rounded border border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Text Color</label>
                      <input
                        type="color"
                        value={tableConfig.cellStyle.textColor}
                        onChange={(e) => setTableConfig({
                          ...tableConfig,
                          cellStyle: {
                            ...tableConfig.cellStyle,
                            textColor: e.target.value
                          }
                        })}
                        className="w-full h-8 rounded border border-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-slate-400 text-sm block mb-2">Preview</label>
                <div className="bg-slate-900 p-4 rounded border border-slate-600 overflow-auto">
                  <div
                    className="inline-block border border-slate-500"
                    style={{
                      fontSize: '10px',
                      fontFamily: 'Arial'
                    }}
                  >
                    {/* Header Row */}
                    <div className="flex">
                      {tableConfig.headers.slice(0, tableConfig.columns).map((header, index) => (
                        <div
                          key={index}
                          className="border-r border-slate-500 px-2 py-1 text-center font-bold"
                          style={{
                            width: Math.min(tableConfig.cellWidth / 2, 80),
                            height: Math.min(tableConfig.cellHeight, 25),
                            backgroundColor: tableConfig.headerStyle.backgroundColor,
                            color: tableConfig.headerStyle.textColor,
                            fontSize: '10px',
                            lineHeight: '1.2'
                          }}
                        >
                          {header}
                        </div>
                      ))}
                    </div>
                    {/* Data Rows */}
                    {tableConfig.data.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex border-t border-slate-500">
                        {row.slice(0, tableConfig.columns).map((cell, colIndex) => (
                          <div
                            key={colIndex}
                            className="border-r border-slate-500 px-2 py-1"
                            style={{
                              width: Math.min(tableConfig.cellWidth / 2, 80),
                              height: Math.min(tableConfig.cellHeight, 25),
                              backgroundColor: tableConfig.cellStyle.backgroundColor,
                              color: tableConfig.cellStyle.textColor,
                              fontSize: '10px',
                              lineHeight: '1.2'
                            }}
                          >
                            {cell || `R${rowIndex + 1}C${colIndex + 1}`}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Create table element
                    const point = tableClickPosition

                    const newElement: DrawingElement = {
                      id: Date.now().toString(),
                      type: 'table',
                      points: [point],
                      style: {
                        stroke: currentStrokeColor,
                        strokeWidth: 1
                      },
                      layer: currentLayer,
                      rows: tableConfig.rows,
                      columns: tableConfig.columns,
                      cellWidth: tableConfig.cellWidth,
                      cellHeight: tableConfig.cellHeight,
                      headers: tableConfig.headers,
                      tableData: tableConfig.data,
                      headerStyle: tableConfig.headerStyle,
                      cellStyle: tableConfig.cellStyle
                    }

                    const newElements = [...elements, newElement]
                    setElements(newElements)
                    addToHistory(newElements)
                    setShowTableConfigDialog(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  ✅ Create Table
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTableConfigDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image/Logo Dialog */}
      {showLogoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Insert Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Upload Any Image</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleLogoFileUpload(file)
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex-1 bg-slate-700 border border-slate-600 text-white text-sm rounded px-3 py-2 cursor-pointer hover:bg-slate-600 flex items-center justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoConfig.file ? logoConfig.file.name : 'Choose Any Image File'}
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Supported: PNG, JPG, GIF, SVG, WebP. Max size: 10MB
                </p>
              </div>

              {logoConfig.file && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Width (px)</label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={logoConfig.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 100
                          const aspectRatio = logoConfig.originalHeight / logoConfig.originalWidth
                          setLogoConfig({
                            ...logoConfig,
                            width: newWidth,
                            height: Math.round(newWidth * aspectRatio)
                          })
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Height (px)</label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={logoConfig.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 50
                          const aspectRatio = logoConfig.originalWidth / logoConfig.originalHeight
                          setLogoConfig({
                            ...logoConfig,
                            height: newHeight,
                            width: Math.round(newHeight * aspectRatio)
                          })
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setLogoConfig({
                          ...logoConfig,
                          width: logoConfig.originalWidth,
                          height: logoConfig.originalHeight
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Original Size
                    </Button>
                    <Button
                      onClick={() => {
                        const aspectRatio = logoConfig.originalHeight / logoConfig.originalWidth
                        const newWidth = 200
                        setLogoConfig({
                          ...logoConfig,
                          width: newWidth,
                          height: Math.round(newWidth * aspectRatio)
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Medium (200px)
                    </Button>
                    <Button
                      onClick={() => {
                        const aspectRatio = logoConfig.originalHeight / logoConfig.originalWidth
                        const newWidth = 100
                        setLogoConfig({
                          ...logoConfig,
                          width: newWidth,
                          height: Math.round(newWidth * aspectRatio)
                        })
                      }}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Small (100px)
                    </Button>
                  </div>
                </>
              )}

              {logoConfig.file && (
                <div className="bg-slate-700/50 rounded p-3">
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Preview</h4>
                  <div className="border border-slate-600 bg-slate-800 flex items-center justify-center text-slate-400 text-sm overflow-hidden p-4 min-h-[120px]">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Image preview"
                        style={{
                          width: Math.min(logoConfig.width, 300),
                          height: Math.min(logoConfig.height, 200),
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      'No image selected'
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Original: {logoConfig.originalWidth} × {logoConfig.originalHeight}px |
                    Scaled: {logoConfig.width} × {logoConfig.height}px
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Create image at center of view
                    const canvas = canvasRef.current
                    if (!canvas) return

                    const rect = canvas.getBoundingClientRect()
                    const centerX = (-pan.x + rect.width / 2) / zoom
                    const centerY = (-pan.y + rect.height / 2) / zoom

                    const newElement: DrawingElement = {
                      id: Date.now().toString(),
                      type: 'logo',
                      points: [{ x: centerX - logoConfig.width/2, y: centerY - logoConfig.height/2 }],
                      style: {
                        stroke: layers.find(l => l.id === currentLayer)?.color || '#3b82f6',
                        strokeWidth: 1
                      },
                      layer: currentLayer,
                      logoUrl: logoConfig.url || 'placeholder',
                      logoWidth: logoConfig.width,
                      logoHeight: logoConfig.height
                    }

                    const newElements = [...elements, newElement]
                    setElements(newElements)
                    addToHistory(newElements)
                    setShowLogoDialog(false)

                    // Reset config for next use
                    setLogoConfig({
                      url: '',
                      width: 100,
                      height: 50,
                      originalWidth: 100,
                      originalHeight: 50,
                      file: null
                    })
                    setLogoPreview('')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                  disabled={!logoConfig.file}
                >
                  Insert Image
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Title Block Edit Dialog */}
      {showTitleBlockEditDialog && editingTitleBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Title Block</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTitleBlockEditDialog(false)
                  setEditingTitleBlock(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {(() => {
              const element = elements.find(el => el.id === editingTitleBlock)
              if (!element || !element.projectInfo) return null

              const currentInfo = element.projectInfo

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Drawing Title</label>
                    <Input
                      value={currentInfo.title || ''}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === editingTitleBlock
                            ? { ...el, projectInfo: { ...el.projectInfo!, title: e.target.value } }
                            : el
                        )
                        setElements(newElements)
                      }}
                      placeholder="Enter drawing title"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Project Number</label>
                      <Input
                        value={currentInfo.projectNumber || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, projectNumber: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="P-2024-001"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Scale</label>
                      <Input
                        value={currentInfo.scale || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, scale: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="1:100"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Drawn By</label>
                      <Input
                        value={currentInfo.drawnBy || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, drawnBy: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="Engineer name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Checked By</label>
                      <Input
                        value={currentInfo.checkedBy || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, checkedBy: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="Checker name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Date</label>
                      <Input
                        type="date"
                        value={currentInfo.date || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, date: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Revision</label>
                      <Input
                        value={currentInfo.revision || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, revision: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="A"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Sheet</label>
                      <Input
                        value={currentInfo.sheet || ''}
                        onChange={(e) => {
                          const newElements = elements.map(el =>
                            el.id === editingTitleBlock
                              ? { ...el, projectInfo: { ...el.projectInfo!, sheet: e.target.value } }
                              : el
                          )
                          setElements(newElements)
                        }}
                        placeholder="1 of 1"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Company Name</label>
                    <Input
                      value={currentInfo.company || ''}
                      onChange={(e) => {
                        const newElements = elements.map(el =>
                          el.id === editingTitleBlock
                            ? { ...el, projectInfo: { ...el.projectInfo!, company: e.target.value } }
                            : el
                        )
                        setElements(newElements)
                      }}
                      placeholder="Your Company Name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        addToHistory(elements)
                        setShowTitleBlockEditDialog(false)
                        setEditingTitleBlock(null)
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowTitleBlockEditDialog(false)
                        setEditingTitleBlock(null)
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )
            })()}
          </Card>
        </div>
      )}

      {/* Table Edit Dialog */}
      {showTableEditDialog && editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[800px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Table Content</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTableEditDialog(false)
                  setEditingTable(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {(() => {
              const element = elements.find(el => el.id === editingTable)
              if (!element || element.type !== 'table') return null

              // Initialize table data if it doesn't exist
              if (!element.tableData) {
                const newElements = [...elements]
                const elementIndex = newElements.findIndex(el => el.id === editingTable)
                if (elementIndex !== -1) {
                  newElements[elementIndex] = {
                    ...newElements[elementIndex],
                    tableData: Array(element.rows! - 1).fill(null).map(() =>
                      Array(element.columns!).fill('')
                    ),
                    headers: element.headers || Array(element.columns!).fill('').map((_, i) => `Header ${i + 1}`)
                  }
                  setElements(newElements)
                }
              }

              return (
                <div className="space-y-4">
                  {/* Table Headers */}
                  <div>
                    <h4 className="text-slate-300 text-sm font-medium mb-2">Table Headers</h4>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${element.columns}, 1fr)` }}>
                      {element.headers?.map((header, colIndex) => (
                        <div key={colIndex}>
                          <label className="text-slate-400 text-xs block mb-1">Column {colIndex + 1}</label>
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => {
                              const newElements = [...elements]
                              const elementIndex = newElements.findIndex(el => el.id === editingTable)
                              if (elementIndex !== -1) {
                                const newHeaders = [...(newElements[elementIndex].headers || [])]
                                newHeaders[colIndex] = e.target.value
                                newElements[elementIndex] = {
                                  ...newElements[elementIndex],
                                  headers: newHeaders
                                }
                                setElements(newElements)
                              }
                            }}
                            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-xs rounded"
                            placeholder={`Header ${colIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Data */}
                  <div>
                    <h4 className="text-slate-300 text-sm font-medium mb-2">Table Data</h4>
                    <div className="border border-slate-600 rounded overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-700">
                            {element.headers?.map((header, colIndex) => (
                              <th key={colIndex} className="px-2 py-1 text-slate-300 text-xs font-medium border-r border-slate-600 last:border-r-0">
                                {header || `Col ${colIndex + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {element.tableData?.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-slate-600">
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="p-0 border-r border-slate-600 last:border-r-0">
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => {
                                      const newElements = [...elements]
                                      const elementIndex = newElements.findIndex(el => el.id === editingTable)
                                      if (elementIndex !== -1) {
                                        const newTableData = [...(newElements[elementIndex].tableData || [])]
                                        if (newTableData[rowIndex]) {
                                          newTableData[rowIndex] = [...newTableData[rowIndex]]
                                          newTableData[rowIndex][colIndex] = e.target.value
                                        }
                                        newElements[elementIndex] = {
                                          ...newElements[elementIndex],
                                          tableData: newTableData
                                        }
                                        setElements(newElements)
                                      }
                                    }}
                                    className="w-full px-2 py-1 bg-slate-800 text-white text-xs border-0 focus:bg-slate-700 focus:outline-none"
                                    placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          // Add row
                          const newElements = [...elements]
                          const elementIndex = newElements.findIndex(el => el.id === editingTable)
                          if (elementIndex !== -1 && newElements[elementIndex].tableData) {
                            const newTableData = [...newElements[elementIndex].tableData!]
                            newTableData.push(Array(newElements[elementIndex].columns!).fill(''))
                            newElements[elementIndex] = {
                              ...newElements[elementIndex],
                              tableData: newTableData,
                              rows: (newElements[elementIndex].rows || 0) + 1
                            }
                            setElements(newElements)
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:text-green-300"
                      >
                        ➕ Add Row
                      </Button>
                      <Button
                        onClick={() => {
                          // Remove last row
                          const newElements = [...elements]
                          const elementIndex = newElements.findIndex(el => el.id === editingTable)
                          if (elementIndex !== -1 && newElements[elementIndex].tableData && newElements[elementIndex].tableData!.length > 1) {
                            const newTableData = [...newElements[elementIndex].tableData!]
                            newTableData.pop()
                            newElements[elementIndex] = {
                              ...newElements[elementIndex],
                              tableData: newTableData,
                              rows: (newElements[elementIndex].rows || 0) - 1
                            }
                            setElements(newElements)
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        ➖ Remove Row
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          addToHistory(elements)
                          setShowTableEditDialog(false)
                          setEditingTable(null)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        ✅ Save Changes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowTableEditDialog(false)
                          setEditingTable(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </Card>
        </div>
      )}

      {/* Professional Export Layout Dialog */}
      {showExportLayoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Professional Export Layout
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportLayoutDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Paper & Layout */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Paper & Layout</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Paper Size</label>
                      <select
                        value={exportConfig.paperSize}
                        onChange={(e) => setExportConfig({...exportConfig, paperSize: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="A4">A4 (297×210mm)</option>
                        <option value="A3">A3 (420×297mm)</option>
                        <option value="A2">A2 (594×420mm)</option>
                        <option value="A1">A1 (841×594mm)</option>
                        <option value="A0">A0 (1189×841mm)</option>
                        <option value="Letter">Letter (279×216mm)</option>
                        <option value="Legal">Legal (356×216mm)</option>
                        <option value="Tabloid">Tabloid (432×279mm)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Orientation</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setExportConfig({...exportConfig, orientation: 'landscape'})}
                          className={`flex-1 px-3 py-2 text-sm rounded ${
                            exportConfig.orientation === 'landscape'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          📄 Landscape
                        </button>
                        <button
                          onClick={() => setExportConfig({...exportConfig, orientation: 'portrait'})}
                          className={`flex-1 px-3 py-2 text-sm rounded ${
                            exportConfig.orientation === 'portrait'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          📄 Portrait
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Scale</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setExportConfig({...exportConfig, scale: 'fit'})}
                          className={`flex-1 px-3 py-2 text-sm rounded ${
                            exportConfig.scale === 'fit'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Fit to Page
                        </button>
                        <button
                          onClick={() => setExportConfig({...exportConfig, scale: 'custom'})}
                          className={`flex-1 px-3 py-2 text-sm rounded ${
                            exportConfig.scale === 'custom'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Custom Scale
                        </button>
                      </div>
                      {exportConfig.scale === 'custom' && (
                        <input
                          type="text"
                          value={exportConfig.customScale}
                          onChange={(e) => setExportConfig({...exportConfig, customScale: e.target.value})}
                          placeholder="1:100"
                          className="w-full mt-2 px-3 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Margins (mm)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 text-xs">Top</label>
                      <input
                        type="number"
                        value={exportConfig.margins.top}
                        onChange={(e) => setExportConfig({
                          ...exportConfig,
                          margins: {...exportConfig.margins, top: parseInt(e.target.value) || 20}
                        })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs">Bottom</label>
                      <input
                        type="number"
                        value={exportConfig.margins.bottom}
                        onChange={(e) => setExportConfig({
                          ...exportConfig,
                          margins: {...exportConfig.margins, bottom: parseInt(e.target.value) || 20}
                        })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs">Left</label>
                      <input
                        type="number"
                        value={exportConfig.margins.left}
                        onChange={(e) => setExportConfig({
                          ...exportConfig,
                          margins: {...exportConfig.margins, left: parseInt(e.target.value) || 20}
                        })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs">Right</label>
                      <input
                        type="number"
                        value={exportConfig.margins.right}
                        onChange={(e) => setExportConfig({
                          ...exportConfig,
                          margins: {...exportConfig.margins, right: parseInt(e.target.value) || 20}
                        })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Content & Branding */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Content Options</h4>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.showGrid}
                        onChange={(e) => setExportConfig({...exportConfig, showGrid: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Show Grid</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.showDimensions}
                        onChange={(e) => setExportConfig({...exportConfig, showDimensions: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Show Dimensions</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.showLayers}
                        onChange={(e) => setExportConfig({...exportConfig, showLayers: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Show All Layers</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Logo & Branding</h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeLogo}
                        onChange={(e) => setExportConfig({...exportConfig, includeLogo: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Include Company Logo</span>
                    </label>

                    {exportConfig.includeLogo && (
                      <div className="ml-6 space-y-2">
                        <div>
                          <label className="text-slate-400 text-xs block mb-1">Logo Position</label>
                          <select
                            value={exportConfig.logoPosition}
                            onChange={(e) => setExportConfig({...exportConfig, logoPosition: e.target.value as any})}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
                          >
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 text-xs block mb-1">Logo Size</label>
                          <select
                            value={exportConfig.logoSize}
                            onChange={(e) => setExportConfig({...exportConfig, logoSize: e.target.value as any})}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
                          >
                            <option value="small">Small (60px)</option>
                            <option value="medium">Medium (100px)</option>
                            <option value="large">Large (150px)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Title Block</h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeTitleBlock}
                        onChange={(e) => setExportConfig({...exportConfig, includeTitleBlock: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Include Title Block</span>
                    </label>

                    {exportConfig.includeTitleBlock && (
                      <div className="ml-6">
                        <label className="text-slate-400 text-xs block mb-1">Position</label>
                        <select
                          value={exportConfig.titleBlockPosition}
                          onChange={(e) => setExportConfig({...exportConfig, titleBlockPosition: e.target.value as any})}
                          className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
                        >
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Additional Info</h4>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeScale}
                        onChange={(e) => setExportConfig({...exportConfig, includeScale: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Include Scale Info</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeDate}
                        onChange={(e) => setExportConfig({...exportConfig, includeDate: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                      />
                      <span className="text-slate-300 text-sm">Include Export Date</span>
                    </label>
                  </div>

                  <div className="mt-3">
                    <label className="text-slate-400 text-xs block mb-1">Watermark (optional)</label>
                    <input
                      type="text"
                      value={exportConfig.watermark}
                      onChange={(e) => setExportConfig({...exportConfig, watermark: e.target.value})}
                      placeholder="DRAFT, CONFIDENTIAL, etc."
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white text-xs rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Export Format</label>
                  <select
                    value={exportConfig.format}
                    onChange={(e) => setExportConfig({...exportConfig, format: e.target.value as any})}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-3 py-2"
                  >
                    <option value="pdf">PDF (Recommended)</option>
                    <option value="png">PNG (High Quality)</option>
                    <option value="svg">SVG (Vector)</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExportLayoutDialog(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={exportWithLayout}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    🚀 Export Drawing
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Project Settings Dialog */}
      {showProjectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Project Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This name will appear in exports and title blocks
                </p>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-1">Default Company</label>
                <input
                  type="text"
                  value={projectInfo.company}
                  onChange={(e) => setProjectInfo({...projectInfo, company: e.target.value})}
                  placeholder="Your Company Name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Default Engineer</label>
                  <input
                    type="text"
                    value={projectInfo.drawnBy}
                    onChange={(e) => setProjectInfo({...projectInfo, drawnBy: e.target.value})}
                    placeholder="Engineer name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1">Default Checker</label>
                  <input
                    type="text"
                    value={projectInfo.checkedBy}
                    onChange={(e) => setProjectInfo({...projectInfo, checkedBy: e.target.value})}
                    placeholder="Checker name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 text-sm font-medium mb-3">Project Actions</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Save Project As</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Project filename"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        onClick={() => {
                          if (projectName.trim()) {
                            const success = saveProject(projectName.trim())
                            if (success) {
                              alert(`✅ Project saved as: ${projectName}`)
                            } else {
                              alert('❌ Failed to save project. Please try again.')
                            }
                          } else {
                            alert('Please enter a project name')
                          }
                        }}
                        className="px-4 bg-green-600 hover:bg-green-700"
                      >
                        💾 Save As
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        console.log('Creating new project')
                        setProjectName('Untitled Project')
                        setElements([])
                        setHistory([[]])
                        setHistoryIndex(0)
                        alert('New project created')
                      }}
                      variant="ghost"
                      className="text-sm"
                    >
                      📄 New Project
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTemplateLibrary(true)
                        setShowProjectDialog(false)
                      }}
                      variant="ghost"
                      className="text-sm"
                    >
                      📋 From Template
                    </Button>
                    <Button
                      onClick={() => {
                        const recentProjects = getRecentProjects()
                        if (recentProjects.length === 0) {
                          alert('No recent projects found. Save a project first!')
                          return
                        }

                        const projectList = recentProjects.map((p: any, i: number) =>
                          `${i + 1}. ${p.name} (${new Date(p.savedAt).toLocaleDateString()})`
                        ).join('\n')

                        const selection = prompt(`Recent Projects:\n\n${projectList}\n\nEnter project number to load (1-${recentProjects.length}):`)

                        if (selection) {
                          const index = parseInt(selection) - 1
                          if (index >= 0 && index < recentProjects.length) {
                            const success = loadProject(recentProjects[index].key)
                            if (success) {
                              alert(`✅ Project "${recentProjects[index].name}" loaded successfully!`)
                              setShowProjectDialog(false)
                            }
                          } else {
                            alert('Invalid selection')
                          }
                        }
                      }}
                      variant="ghost"
                      className="text-sm"
                    >
                      📂 Load Project
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded p-3">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Current Settings</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Project: {projectName}</div>
                  <div>Scale: {drawingScale}</div>
                  <div>Units: {drawingUnits}</div>
                  <div>Elements: {elements.length}</div>
                  <div>Company: {projectInfo.company}</div>
                  <div>Engineer: {projectInfo.drawnBy}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Settings are already saved in real-time via state updates
                    alert('Project settings saved successfully!')
                    setShowProjectDialog(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  ✅ Save Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowProjectDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom Scale Dialog */}
      {showScaleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Custom Drawing Scale</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScaleDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">
                  Enter custom scale (e.g., 1:75, 3:1, 1:250)
                </label>
                <Input
                  value={drawingScale}
                  onChange={(e) => setDrawingScale(e.target.value)}
                  placeholder="1:100"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format: ratio:ratio (e.g., 1:100 means 1 unit = 100 real units)
                </p>
              </div>

              <div className="bg-slate-700/50 rounded p-3">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Common Scales</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDrawingScale('1:1')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:1 - Full size</button>
                  <button
                    onClick={() => setDrawingScale('1:10')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:10 - Detailed</button>
                  <button
                    onClick={() => setDrawingScale('1:50')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:50 - Room plans</button>
                  <button
                    onClick={() => setDrawingScale('1:100')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:100 - Floor plans</button>
                  <button
                    onClick={() => setDrawingScale('1:200')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:200 - Site plans</button>
                  <button
                    onClick={() => setDrawingScale('1:500')}
                    className="text-left text-slate-400 hover:text-white"
                  >1:500 - Large areas</button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowScaleDialog(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Apply Scale
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowScaleDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-xl">Keyboard Shortcuts & Help</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tool Shortcuts */}
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-lg">Tool Shortcuts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Select Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">V</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Move Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">M</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Line Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">L</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rectangle Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">R</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Circle Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pan Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">P</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Text Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">T</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Table Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Title Block</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">I</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Logo Tool</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">O</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Join Elements</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">J</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cancel/Escape</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">ESC</kbd>
                  </div>
                </div>
              </div>

              {/* View Controls */}
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-lg">View Controls</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Toggle Rulers</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+R</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Toggle Coordinates</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+H</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Toggle Status Bar</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Toggle Grid</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+G</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer Manager</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+L</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zoom In</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl++</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zoom Out</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+-</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zoom to Fit</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Ctrl+0</kbd>
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-lg">Advanced Features</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>• <strong className="text-white">Rulers:</strong> Professional measurement guides</div>
                  <div>• <strong className="text-white">Crosshair:</strong> Precision coordinate tracking</div>
                  <div>• <strong className="text-white">Snap Tools:</strong> Grid and object snapping</div>
                  <div>• <strong className="text-white">Layer System:</strong> Organize drawings professionally</div>
                  <div>• <strong className="text-white">Precision Input:</strong> Exact coordinate entry</div>
                  <div>• <strong className="text-white">Multiple Units:</strong> mm, cm, m, in, ft support</div>
                  <div>• <strong className="text-white">Professional Export:</strong> PDF, PNG, SVG formats</div>
                </div>
              </div>

              {/* Command Line */}
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-lg">Command Line (F2)</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-slate-400">Press <kbd className="bg-slate-700 px-1 rounded">F2</kbd> to open command line. Available commands:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><code className="text-green-400">line</code> or <code className="text-green-400">l</code> - Line tool</div>
                    <div><code className="text-green-400">circle</code> or <code className="text-green-400">c</code> - Circle tool</div>
                    <div><code className="text-green-400">rect</code> or <code className="text-green-400">r</code> - Rectangle tool</div>
                    <div><code className="text-green-400">text</code> or <code className="text-green-400">t</code> - Text tool</div>
                    <div><code className="text-green-400">select</code> or <code className="text-green-400">s</code> - Select tool</div>
                    <div><code className="text-green-400">delete</code> - Delete selected</div>
                    <div><code className="text-green-400">zoom 2</code> - Set zoom level</div>
                    <div><code className="text-green-400">grid on/off</code> - Toggle grid</div>
                    <div><code className="text-green-400">rulers on/off</code> - Toggle rulers</div>
                    <div><code className="text-green-400">undo</code> - Undo last action</div>
                    <div><code className="text-green-400">redo</code> - Redo last action</div>
                    <div><code className="text-green-400">clear all</code> - Clear drawing</div>
                  </div>
                  <div className="text-slate-500 text-xs mt-2">
                    Future commands: <code>trim</code>, <code>mirror</code>, <code>array</code>, <code>join</code>
                  </div>
                </div>
              </div>

              {/* Mouse Controls */}
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-lg">Mouse Controls</h4>
                <div className="space-y-2 text-sm text-slate-400">
                  <div>• <strong className="text-white">Left Click:</strong> Draw/Select elements</div>
                  <div>• <strong className="text-white">Ctrl + Drag:</strong> Lasso selection (draw area to select multiple)</div>
                  <div>• <strong className="text-white">Right Click:</strong> Context menu</div>
                  <div>• <strong className="text-white">Mouse Wheel:</strong> Zoom in/out</div>
                  <div>• <strong className="text-white">Pan Tool:</strong> Click and drag to move view</div>
                  <div>• <strong className="text-white">Move Tool:</strong> Click and drag elements</div>
                  <div>• <strong className="text-white">Snap Indicators:</strong> Green crosshair shows snap points</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm text-center">
                Press <kbd className="bg-slate-700 px-2 py-1 rounded text-white">F1</kbd> or click the <strong>?</strong> button anytime for help
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Advanced Command Status */}
      {advancedCommand && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg p-3 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-white font-medium capitalize">{advancedCommand} Command Active</span>
          </div>
          <div className="text-sm text-slate-300 mt-1">
            {advancedCommand === 'trim' && commandStep === 0 && 'Select cutting edge'}
            {advancedCommand === 'trim' && commandStep === 1 && 'Select element to trim'}
            {advancedCommand === 'mirror' && commandStep === 0 && `Selected: ${selectedElements.length} objects. Click empty space when done.`}
            {advancedCommand === 'mirror' && commandStep === 1 && 'Click second point to define mirror axis'}
            {advancedCommand === 'array' && `Selected: ${selectedElements.length} objects. Click empty space to create array.`}
            {advancedCommand === 'join' && `Selected: ${selectedElements.length} objects. Need at least 2 to join.`}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Press Esc to cancel
          </div>
        </div>
      )}

      {/* Command Line Interface */}


      {/* Command Line Interface */}
      {showCommandLine && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-600 p-2 z-50">
          <div className="flex items-center space-x-2">
            <span className="text-green-400 font-mono text-sm">Command:</span>
            <Input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand(commandInput)
                } else if (e.key === 'Escape') {
                  setShowCommandLine(false)
                  setCommandInput('')
                }
              }}
              placeholder="Enter command (e.g., line, circle, zoom 2, grid on)"
              className="flex-1 bg-slate-800 border-slate-600 text-white font-mono text-sm"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCommandLine(false)
                setCommandInput('')
              }}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          {commandHistory.length > 0 && (
            <div className="mt-1 text-xs text-slate-400 font-mono">
              Last: {commandHistory[commandHistory.length - 1]}
            </div>
          )}
        </div>
      )}

      {/* Image Delete Confirmation Dialog */}
      {showImageDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Delete Background Images</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDeleteDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-slate-300 mb-2">
                Are you sure you want to delete all background images?
              </p>
              <p className="text-slate-400 text-sm">
                This will remove {backgroundImages.length} background image(s) that you may have been using for tracing. This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={confirmDeleteImages}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                🗑️ Delete Images
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowImageDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}





      {/* Smart Upgrade Prompt */}
      {showUpgradePrompt && (
        <SmartUpgradePrompt
          trigger={showUpgradePrompt as any}
          onClose={() => setShowUpgradePrompt(null)}
          onPurchase={(item) => {
            if (item.includes('pack')) {
              purchaseCredits(item)
            } else {
              purchaseFeature(item)
            }
          }}
        />
      )}

      {/* Crane Library */}
      <CraneLibrary
        isOpen={showCraneLibrary}
        onClose={() => setShowCraneLibrary(false)}
        onSelectCrane={handleSelectCrane}
        onInsertCrane={handleInsertCrane}
      />

      {/* Configurable Crane Dialog */}
      <ConfigurableCraneDialog
        isOpen={showConfigurableCraneDialog}
        onClose={() => setShowConfigurableCraneDialog(false)}
        onCreateCrane={handleCreateCustomCrane}
      />

      {/* Crane Parts Builder Dialog */}
      <CranePartsBuilder
        isOpen={showCraneBuilderDialog}
        onClose={() => setShowCraneBuilderDialog(false)}
        onCreateCrane={handleCreateAssembledCrane}
      />

      {/* Crane Configuration Dialogs */}
      {configuringCrane?.craneData?.crane1 && configuringCrane?.craneData?.crane2 ? (
        // Tandem crane configuration
        <TandemCraneConfigDialog
          craneData={{
            crane1: configuringCrane.craneData?.crane1 || { boomAngle: 45, boomExtension: 0.5, scale: 1.0, loadLineLength: 40, offsetX: -100, offsetY: 0 },
            crane2: configuringCrane.craneData?.crane2 || { boomAngle: 45, boomExtension: 0.5, scale: 1.0, loadLineLength: 40, offsetX: 100, offsetY: 0 },
            spacing: configuringCrane.craneData?.spacing || 200,
            specifications: configuringCrane.craneData?.specifications || {} as CraneSpecifications,
            showLoadChart: false
          }}
          isOpen={showCraneConfig}
          onClose={() => {
            setShowCraneConfig(false)
            setConfiguringCrane(null)
          }}
          onUpdate={handleUpdateCraneConfig}
        />
      ) : configuringCrane?.craneData?.specifications?.wireframe ? (
        // Wireframe crane configuration
        <WireframeCraneConfigDialog
          craneData={{
            boomAngle: configuringCrane?.craneData?.boomAngle || 45,
            boomExtension: configuringCrane?.craneData?.boomExtension || 0.5,
            scale: configuringCrane?.craneData?.scale || 1.0,
            loadLineLength: configuringCrane?.craneData?.loadLineLength || 70,
            specifications: configuringCrane?.craneData?.specifications || { boom: { baseLength: 15, maxLength: 60 } }
          }}
          isOpen={showCraneConfig}
          onClose={() => {
            setShowCraneConfig(false)
            setConfiguringCrane(null)
          }}
          onUpdate={handleUpdateCraneConfig}
        />
      ) : (
        // Single crane configuration
        <CraneConfigDialog
          crane={configuringCrane?.craneData?.specifications || null}
          craneData={configuringCrane?.craneData || { boomAngle: 45, boomExtension: 0.5, scale: 1.0, loadLineLength: 40, showLoadChart: false }}
          isOpen={showCraneConfig}
          onClose={() => {
            setShowCraneConfig(false)
            setConfiguringCrane(null)
          }}
          onUpdate={handleUpdateCraneConfig}
          onDelete={handleDeleteCrane}
        />
      )}

      {/* Professional 2D Export Dialog */}
      <CADExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleProfessionalExport}
        elements={elements}
        canvasRef={canvasRef as any}
        isExporting={isExporting}
      />

      {/* CAD Import Dialog */}
      <CADImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportCAD}
      />

      {/* Lifting Scenario Library */}
      <LiftingScenarioLibrary
        isOpen={showScenarioLibrary}
        onClose={() => setShowScenarioLibrary(false)}
        onInsertObject={(element: any) => {
          setElements([...elements, element as DrawingElement])
          setShowScenarioLibrary(false)
        }}
      />

      {/* Personnel Library */}
      <PersonnelLibrary
        isOpen={showPersonnelLibrary}
        onClose={() => setShowPersonnelLibrary(false)}
        onInsertPersonnel={(element: any) => {
          setElements([...elements, element as DrawingElement])
          setShowPersonnelLibrary(false)
        }}
      />

      {/* Chain Block Config Dialog */}
      <ChainBlockConfigDialog
        isOpen={showChainBlockDialog}
        onClose={() => setShowChainBlockDialog(false)}
        onInsert={(element: any) => {
          setElements([...elements, element as DrawingElement])
          setShowChainBlockDialog(false)
        }}
      />

      {/* Auto-save Recovery Dialog */}
      <RecoveryDialog
        open={showRecoveryPrompt}
        recoveryData={recoveryData}
        onRecover={handleRecover}
        onDiscard={dismissRecovery}
      />

      {/* Drawing Templates Library */}
      <TemplateLibrary
        open={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Ground Bearing Pressure Calculator */}
      <GroundBearingCalculator
        open={showGroundBearingCalc}
        onClose={() => setShowGroundBearingCalc(false)}
      />

      {/* OpenStreetMap Location Import Dialog (100% FREE) */}
      <LeafletMapImportDialog
        isOpen={showGoogleMapsImport}
        onClose={() => setShowGoogleMapsImport(false)}
        onImport={handleGoogleMapsImport}
      />
    </div>
  )
}

// Removed duplicate export - using CADPage below

export default function CADPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeviceNotification
        feature="cad-editor"
        fallbackContent={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Desktop Required</h2>
                    <p className="text-gray-300 mb-4">
                      The CAD Editor requires a desktop environment for optimal performance and precision.
                    </p>
                    <div className="text-left">
                      <h3 className="font-semibold text-white mb-2">Recommended:</h3>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Desktop or laptop computer</li>
                        <li>• Mouse for precise control</li>
                        <li>• Larger screen (1024px+ width)</li>
                        <li>• Modern web browser</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 hover:bg-blue-700">
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        }
      >
        <CADEditorContent />
      </DeviceNotification>

      {/* Floating Chat for CAD Collaboration */}
      <CADChatSidebar />
    </Suspense>
  )
}
