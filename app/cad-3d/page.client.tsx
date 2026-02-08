"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QuadViewport from "@/components/cad3d/QuadViewport"
import SingleViewport from "@/components/cad3d/SingleViewport"
import Ribbon from "@/components/cad3d/Ribbon"
import LayerPanel from "@/components/cad3d/LayerPanel"
import RiggingLibrary3D from "@/components/cad3d/RiggingLibrary3D"
import { ArrowLeft, Grid3X3, Box, Layers, Eye, MousePointer, Move, RotateCw, Maximize2 } from "lucide-react"
import "../../styles/cad-cursors.css"


export default function CAD3DClient() {
  const { status } = useSession()
  const router = useRouter()

  // Default to single viewport; toggle with a tiny switch in the corner
  const [mode, setMode] = useState<'single'|'quad'>('single')
  const [currentTool, setCurrentTool] = useState<string>('select')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [gridEnabled, setGridEnabled] = useState(true)
  const [objectCount, setObjectCount] = useState(0)
  const [showRiggingLibrary, setShowRiggingLibrary] = useState(false)

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Global hotkey: Q toggles Single/Quad view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as any)?.isContentEditable) return
      if (e.key.toLowerCase() === 'q') setMode(m => m === 'quad' ? 'single' : 'quad')
      if (e.key.toLowerCase() === 'g') setGridEnabled(g => !g)
      if (e.key.toLowerCase() === 'n') setSnapEnabled(s => !s)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Listen for tool changes and other modeler events
  useEffect(() => {
    const handleModeler = (e: CustomEvent) => {
      if (e.detail?.action === 'tool') {
        setCurrentTool(e.detail.data)
      }
      if (e.detail?.action === 'show-rigging-library') {
        setShowRiggingLibrary(true)
      }
    }
    window.addEventListener('cad3d:modeler', handleModeler as EventListener)
    return () => window.removeEventListener('cad3d:modeler', handleModeler as EventListener)
  }, [])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="w-full h-[100vh] relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <Box className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">Loading 3D CAD...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="w-full h-[100vh] relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const getToolIcon = () => {
    switch (currentTool) {
      case 'move': return <Move className="w-3 h-3" />
      case 'rotate': return <RotateCw className="w-3 h-3" />
      case 'scale': return <Maximize2 className="w-3 h-3" />
      default: return <MousePointer className="w-3 h-3" />
    }
  }

  return (
    <div className="w-full h-[100vh] relative bg-gray-900 overflow-hidden">
      {/* Back Button - Beautiful glassmorphism style */}
      <div className="absolute top-2 right-2 z-[10001]">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg hover:bg-gray-700/90 hover:border-gray-500/50 text-gray-300 hover:text-white transition-all text-xs shadow-lg">
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </button>
        </Link>
      </div>

      <Ribbon />

      {/* Viewport content below ribbon */}
      <div className="w-full h-[calc(100vh-8rem)] relative bg-gray-900 flex">
        {/* Main 3D viewport */}
        <div className="flex-1 relative">
          {mode === 'single' ? <SingleViewport /> : <QuadViewport />}

          {/* Top-right floating controls */}
          <div className="absolute top-12 right-2 flex flex-col gap-2 z-[10000]" data-ui-layer>
            {/* View mode toggle */}
            <button
              aria-label="Toggle Quad View"
              title={mode==='quad' ? 'Single View (Q)' : 'Quad View (Q)'}
              className={`p-2 rounded-lg bg-gray-800/90 backdrop-blur-sm border transition-all shadow-lg ${
                mode==='quad'
                  ? 'border-blue-500/50 bg-blue-600/20 text-blue-400'
                  : 'border-gray-600/50 hover:border-gray-500/50 text-gray-400 hover:text-gray-300'
              }`}
              onClick={()=>setMode(mode==='quad'?'single':'quad')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>

            {/* Grid toggle */}
            <button
              aria-label="Toggle Grid"
              title={`Grid: ${gridEnabled ? 'ON' : 'OFF'} (G)`}
              className={`p-2 rounded-lg bg-gray-800/90 backdrop-blur-sm border transition-all shadow-lg ${
                gridEnabled
                  ? 'border-green-500/50 bg-green-600/20 text-green-400'
                  : 'border-gray-600/50 hover:border-gray-500/50 text-gray-400 hover:text-gray-300'
              }`}
              onClick={()=>setGridEnabled(!gridEnabled)}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="3" y2="21" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="21" y1="3" x2="21" y2="21" />
                <line x1="3" y1="3" x2="21" y2="3" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="3" y1="21" x2="21" y2="21" />
              </svg>
            </button>

            {/* Eye/Visibility */}
            <button
              aria-label="Toggle Snap"
              title={`Snap: ${snapEnabled ? 'ON' : 'OFF'} (N)`}
              className={`p-2 rounded-lg bg-gray-800/90 backdrop-blur-sm border transition-all shadow-lg ${
                snapEnabled
                  ? 'border-yellow-500/50 bg-yellow-600/20 text-yellow-400'
                  : 'border-gray-600/50 hover:border-gray-500/50 text-gray-400 hover:text-gray-300'
              }`}
              onClick={()=>setSnapEnabled(!snapEnabled)}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </button>
          </div>

          {/* Bottom status bar - Beautiful glassmorphism */}
          <div className="absolute bottom-0 left-0 right-0 h-7 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 flex items-center justify-between px-3 text-[10px] font-mono">
            {/* Left side - Tool & Mode info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-blue-400">
                {getToolIcon()}
                <span className="uppercase">{currentTool}</span>
              </div>
              <div className="w-px h-3 bg-gray-700"></div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Layers className="w-3 h-3" />
                <span>{mode === 'single' ? 'Single' : 'Quad'} View</span>
              </div>
              <div className="w-px h-3 bg-gray-700"></div>
              <div className={`flex items-center gap-1.5 ${gridEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                <span>GRID: {gridEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${snapEnabled ? 'text-yellow-400' : 'text-gray-500'}`}>
                <span>SNAP: {snapEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            {/* Right side - Coordinates & stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="text-cyan-400">X: 0.00m</span>
                <span className="text-green-400">Y: 0.00m</span>
                <span className="text-blue-400">Z: 0.00m</span>
              </div>
              <div className="w-px h-3 bg-gray-700"></div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Box className="w-3 h-3" />
                <span>{objectCount} objects</span>
              </div>
              <div className="w-px h-3 bg-gray-700"></div>
              <div className="text-gray-500">
                <span>Precision: 0.1m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer management panel */}
        <LayerPanel />

        {/* Rigging Equipment Library */}
        <RiggingLibrary3D
          isOpen={showRiggingLibrary}
          onClose={() => setShowRiggingLibrary(false)}
        />
      </div>
    </div>
  )
}

