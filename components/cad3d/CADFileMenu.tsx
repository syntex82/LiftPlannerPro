"use client"

import { useEffect, useRef, useState } from "react"
import { FolderOpen, FilePlus2, Save, SaveAll, Import, FileDown } from "lucide-react"
import FileManager from './FileManager'
import ExportDialog from './ExportDialog'

export default function CADFileMenu() {
  const [open, setOpen] = useState(false)
  const [fileManagerOpen, setFileManagerOpen] = useState(false)
  const [fileManagerMode, setFileManagerMode] = useState<'open' | 'save' | 'import' | 'export'>('open')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [fileHandle, setFileHandle] = useState<any>(null)
  const [recent, setRecent] = useState<Array<{name:string, ts:number}>>([])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-cad-filemenu]')) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    // load recents
    try { const r = JSON.parse(localStorage.getItem('cad3d:recent')||'[]'); setRecent(r) } catch {}
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const dispatch = (detail: any) => {
    window.dispatchEvent(new CustomEvent('cad3d:file', { detail }))
  }

  const supportsFS = () => typeof (window as any).showOpenFilePicker === 'function'

  const waitForProject = () => new Promise<any>((resolve) => {
    const requestId = Math.random().toString(36).slice(2)
    const onReply = (e: Event) => {
      const d = (e as CustomEvent).detail || {}
      if (d.action === 'project-data' && d.requestId === requestId) {
        window.removeEventListener('cad3d:file', onReply as any)
        resolve(d.data)
      }
    }
    window.addEventListener('cad3d:file', onReply as any)
    dispatch({ action: 'get-project', requestId })
  })

  const onOpen = () => {
    setFileManagerMode('open')
    setFileManagerOpen(true)
  }

  const onImport = () => {
    setFileManagerMode('import')
    setFileManagerOpen(true)
  }

  const onFileSelect = async (file: any) => {
    try {
      if (fileManagerMode === 'open') {
        // Load project file
        const response = await fetch(`/api/files/${file.path}`)
        const data = await response.json()
        dispatch({ action: 'open-data', data })

        // Update recents
        const entry = { name: file.name, ts: Date.now() }
        const next = [entry, ...recent.filter(r=>r.name!==entry.name)].slice(0,5)
        setRecent(next)
        localStorage.setItem('cad3d:recent', JSON.stringify(next))
      } else if (fileManagerMode === 'import') {
        // Import 3D model
        dispatch({ action: 'import', file: { name: file.name, path: file.path } })
      }
    } catch (error) {
      console.error('Failed to load file:', error)
      alert('Failed to load file. Please try again.')
    }
  }

  const onImportFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const ext = file.name.toLowerCase()
    if (ext.endsWith('.glb') || ext.endsWith('.gltf')) {
      dispatch({ action: 'import', file })
    } else if (ext.endsWith('.cad3d.json') || ext.endsWith('.json')) {
      // Open project via fallback
      const text = await file.text(); try { const data = JSON.parse(text); dispatch({ action: 'open-data', data }) } catch { alert('Invalid project file') }
    } else {
      alert('Import currently supports .glb/.gltf for models, and .cad3d.json for projects.')
    }
    if (importInputRef.current) importInputRef.current.value = ''
  }

  const writeFile = async (handle: any, contents: string) => {
    const writable = await handle.createWritable()
    await writable.write(contents)
    await writable.close()
  }

  const onSave = async () => {
    if (supportsFS() && fileHandle) {
      const project = await waitForProject()
      await writeFile(fileHandle, JSON.stringify(project, null, 2))
    } else if (supportsFS() && !fileHandle) {
      await onSaveAs()
    } else {
      // fallback download via modeler
      dispatch({ action: 'save' })
    }
  }

  const onSaveAs = async () => {
    if (supportsFS()) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'project.cad3d.json',
          types: [{ description: 'Lift Planner 3D Project', accept: { 'application/json': ['.cad3d.json'] } }]
        })
        setFileHandle(handle)
        const project = await waitForProject()
        await writeFile(handle, JSON.stringify(project, null, 2))
        // update recents
        const entry = { name: 'project.cad3d.json', ts: Date.now() }
        const next = [entry, ...recent.filter(r=>r.name!==entry.name)].slice(0,5)
        setRecent(next)
        localStorage.setItem('cad3d:recent', JSON.stringify(next))
        return
      } catch (e) {
        console.warn('Save As cancelled or failed', e)
      }
    }
    // fallback
    dispatch({ action: 'save-as' })
  }

  const onExport = (format: 'glb'|'gltf'|'obj'|'stl'|'ply') => {
    setExportDialogOpen(true)
  }

  const handleExport = async (format: string, options: any) => {
    try {
      // Get project data
      const project = await waitForProject()

      // Send export request to server
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          format,
          options
        })
      })

      if (response.ok) {
        // Download the exported file
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = options.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  return (
    <>
      {/* Professional CAD Ribbon - Full Height */}
      <div className="fixed top-16 left-0 right-0 z-[9999] bg-gradient-to-b from-gray-100 to-gray-200 border-b-2 border-gray-300" data-ui-layer>

        {/* Tab Bar */}
        <div className="h-8 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 flex items-center px-2">
          <div className="bg-white border border-gray-300 border-b-0 px-4 py-1 text-sm font-medium text-gray-700 rounded-t">
            Home
          </div>
        </div>

        {/* Main Ribbon Content */}
        <div className="h-28 flex items-stretch overflow-x-auto">

          {/* File Group */}
          <div className="flex flex-col border-r border-gray-300 px-6 py-3 min-w-fit">
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">File</div>
            <div className="flex gap-3">
              <RibbonButton
                icon={<FilePlus2 className="w-7 h-7" />}
                label="New"
                size="large"
                onClick={() => dispatch({action:'new'})}
              />
              <RibbonButton
                icon={<FolderOpen className="w-7 h-7" />}
                label="Open"
                size="large"
                onClick={onOpen}
              />
              <RibbonButton
                icon={<Save className="w-7 h-7" />}
                label="Save"
                size="large"
                onClick={onSave}
              />
            </div>
          </div>

          {/* Import/Export Group */}
          <div className="flex flex-col border-r border-gray-300 px-6 py-3 min-w-fit">
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Import/Export</div>
            <div className="flex gap-3">
              <RibbonButton
                icon={<Import className="w-7 h-7" />}
                label="Import"
                size="large"
                onClick={onImport}
              />
              <RibbonButton
                icon={<FileDown className="w-7 h-7" />}
                label="Export GLB"
                size="large"
                onClick={() => onExport('glb')}
              />
              <RibbonButton
                icon={<FileDown className="w-7 h-7" />}
                label="Export OBJ"
                size="large"
                onClick={() => onExport('obj')}
              />
            </div>
          </div>

          {/* File Menu */}
          <div className="flex flex-col border-r border-gray-300 px-6 py-3 min-w-fit">
            <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Menu</div>
            <div className="flex gap-3">
              <div className="relative">
                <RibbonButton
                  icon={<svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>}
                  label="File Menu"
                  size="large"
                  active={open}
                  onClick={() => setOpen(!open)}
                />
                {/* Dropdown Arrow */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-600 text-white flex items-center justify-center text-xs rounded">
                  ▼
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* File Menu Dropdown */}
        {open && (
          <div className="absolute top-32 left-4 w-80 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-3 space-y-2 z-[10000]">
            <div className="px-2 py-1 text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">Project Operations</div>
            <MenuItem icon={<FilePlus2 className="w-5 h-5"/>} label="New Project" kbd="Ctrl+N" onClick={()=>{ setOpen(false); dispatch({action:'new'}) }} />
            <MenuItem icon={<FolderOpen className="w-5 h-5"/>} label="Open Project..." kbd="Ctrl+O" onClick={()=>{ setOpen(false); onOpen() }} />
            {recent.length>0 && (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="px-2 py-1 text-xs font-bold text-gray-600 uppercase tracking-wide">Recent Files</div>
                {recent.map(r => (
                  <MenuItem key={r.name+String(r.ts)} icon={<FolderOpen className="w-5 h-5"/>} label={r.name} onClick={()=>{ setOpen(false); onOpen() }} />
                ))}
              </>
            )}
            <div className="border-t border-gray-200 my-3"></div>
            <MenuItem icon={<Save className="w-5 h-5"/>} label="Save Project" kbd="Ctrl+S" onClick={()=>{ setOpen(false); onSave() }} />
            <MenuItem icon={<SaveAll className="w-5 h-5"/>} label="Save Project As..." kbd="Ctrl+Shift+S" onClick={()=>{ setOpen(false); onSaveAs() }} />
            <div className="border-t border-gray-200 my-3"></div>
            <div className="px-2 py-1 text-xs font-bold text-gray-600 uppercase tracking-wide">Import/Export</div>
            <MenuItem icon={<Import className="w-5 h-5"/>} label="Import 3D Model..." onClick={()=>{ setOpen(false); onImport() }} />
            <MenuItem icon={<FileDown className="w-5 h-5"/>} label="Export as GLB" onClick={()=>{ setOpen(false); onExport('glb') }} />
            <MenuItem icon={<FileDown className="w-5 h-5"/>} label="Export as GLTF" onClick={()=>{ setOpen(false); onExport('gltf') }} />
            <MenuItem icon={<FileDown className="w-5 h-5"/>} label="Export as OBJ" onClick={()=>{ setOpen(false); onExport('obj') }} />
            <MenuItem icon={<FileDown className="w-5 h-5"/>} label="Export as STL" onClick={()=>{ setOpen(false); onExport('stl') }} />
            <MenuItem icon={<FileDown className="w-5 h-5"/>} label="Export as PLY" onClick={()=>{ setOpen(false); onExport('ply') }} />
          </div>
        )}
      </div>

      {/* Spacer for ribbon height */}
      <div className="h-36"></div>

      <input ref={importInputRef} type="file" className="hidden" accept=".cad3d.json,.json,.glb,.gltf" onChange={(e)=>onImportFiles(e.target.files)} />

      {/* File Manager Dialog */}
      <FileManager
        isOpen={fileManagerOpen}
        onClose={() => setFileManagerOpen(false)}
        mode={fileManagerMode}
        onFileSelect={onFileSelect}
        acceptedTypes={
          fileManagerMode === 'import'
            ? ['.glb', '.gltf', '.obj', '.stl', '.ply', '.fbx']
            : ['.cad3d.json', '.json']
        }
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />
    </>
  )
}
function RibbonButton({ icon, label, size, active, onClick }: {
  icon: React.ReactNode,
  label: string,
  size: 'small' | 'large',
  active?: boolean,
  onClick?: () => void
}) {
  if (size === 'large') {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-300/60 transition-colors min-w-[80px] h-20 ${
          active ? 'bg-blue-100 border-2 border-blue-400 shadow-sm' : 'border-2 border-transparent'
        }`}
      >
        <div className="text-gray-700 mb-2">{icon}</div>
        <span className="text-xs text-gray-700 font-semibold leading-tight text-center whitespace-nowrap">{label}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-300/60 transition-colors min-w-[60px] h-16 ${
        active ? 'bg-blue-100 border-2 border-blue-400 shadow-sm' : 'border-2 border-transparent'
      }`}
    >
      <div className="text-gray-700 mb-1">{icon}</div>
      <span className="text-[10px] text-gray-700 font-semibold leading-tight text-center whitespace-nowrap">{label}</span>
    </button>
  )
}

function Divider() {
  return <div className="my-1 border-t border-slate-700" />
}

function MenuItem({ icon, label, kbd, onClick }: { icon: React.ReactNode, label: string, kbd?: string, onClick: ()=>void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
      <span className="flex items-center gap-3">{icon}{label}</span>
      {kbd && <span className="text-xs text-slate-400 font-mono">{kbd}</span>}
    </button>
  )
}

