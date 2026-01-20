"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QuadViewport from "@/components/cad3d/QuadViewport"
import SingleViewport from "@/components/cad3d/SingleViewport"
import Ribbon from "@/components/cad3d/Ribbon"
import LayerPanel from "@/components/cad3d/LayerPanel"
import "../../styles/cad-cursors.css"


export default function CAD3DClient() {
  const { status } = useSession()
  const router = useRouter()

  // Default to single viewport; toggle with a tiny switch in the corner
  const [mode, setMode] = useState<'single'|'quad'>('single')

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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="w-full h-[100vh] relative bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="w-full h-[100vh] relative bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[100vh] relative bg-gray-900">
      {/* Header with Back Button - Right Side */}
      <div className="absolute top-0 right-0 z-[10001] p-2">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 border border-gray-600 rounded hover:bg-gray-700 text-gray-200 hover:text-white transition-colors text-sm">
            ← Back to Dashboard
          </button>
        </Link>
      </div>
      <Ribbon />
      {/* Viewport content below ribbon */}
      <div className="w-full h-[calc(100vh-8rem)] relative bg-gray-900 flex">
        {/* Main 3D viewport */}
        <div className="flex-1 relative">
          {mode === 'single' ? <SingleViewport /> : <QuadViewport />}

          {/* CAD Coordinate Display - like 2D CAD */}
          <div className="absolute top-2 right-2 bg-black/90 text-green-400 text-sm px-4 py-2 rounded font-mono border border-green-400/30 pointer-events-none">
            <div className="flex gap-6">
              <span>X: 0.00</span>
              <span>Z: 0.00</span>
              <span className="text-yellow-400">SNAP: ON</span>
              <span className="text-blue-400">PRECISION: 0.1m</span>
            </div>
          </div>

          {/* CAD Status Bar */}
          <div className="absolute bottom-2 left-2 bg-black/90 text-green-400 text-xs px-3 py-2 rounded font-mono border border-green-400/30 pointer-events-none">
            <div className="flex gap-4">
              <span>CAD Mode: Active</span>
              <span>Viewport: {mode.toUpperCase()}</span>
              <span>Grid: Visible</span>
              <span className="text-blue-400">Crosshair: Full-Screen</span>
            </div>
          </div>


        </div>
        {/* Layer management panel */}
        <LayerPanel />
        <div className="absolute top-2 right-2 z-[10000]" data-ui-layer>
        <button
          aria-label="Toggle Quad View"
          title={mode==='quad' ? 'Switch to Single View' : 'Switch to Quad View'}
          className={`p-2 rounded bg-gray-800/80 border ${mode==='quad' ? 'border-blue-500 bg-blue-600/20' : 'border-gray-600 hover:border-gray-500'}`}
          onClick={()=>setMode(mode==='quad'?'single':'quad')}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-200 fill-current">
            <rect x="3" y="3" width="8" height="8" rx="1"/>
            <rect x="13" y="3" width="8" height="8" rx="1"/>
            <rect x="3" y="13" width="8" height="8" rx="1"/>
            <rect x="13" y="13" width="8" height="8" rx="1"/>
          </svg>
        </button>
        </div>
      </div>
    </div>
  )
}

