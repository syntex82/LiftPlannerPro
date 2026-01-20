import React, { useState, useEffect, useRef } from 'react'
import { 
  FolderOpen, 
  File, 
  FileText, 
  Image, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Search,
  Grid,
  List,
  ArrowUp,
  Folder,
  FileDown,
  Import,
  X
} from 'lucide-react'

interface FileItem {
  name: string
  type: 'file' | 'folder'
  size?: number
  modified?: Date
  extension?: string
  path: string
}

interface FileManagerProps {
  isOpen: boolean
  onClose: () => void
  mode: 'open' | 'save' | 'import' | 'export'
  onFileSelect?: (file: FileItem) => void
  onFileSave?: (filename: string, path: string) => void
  acceptedTypes?: string[]
}

export default function FileManager({ 
  isOpen, 
  onClose, 
  mode, 
  onFileSelect, 
  onFileSave,
  acceptedTypes = []
}: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState('/projects')
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filename, setFilename] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    }
  }, [isOpen, currentPath])

  const loadFiles = async () => {
    setLoading(true)
    try {
      // Simulate file system - in real app this would call an API
      const mockFiles: FileItem[] = [
        { name: 'My Projects', type: 'folder', path: '/projects/my-projects' },
        { name: 'Templates', type: 'folder', path: '/projects/templates' },
        { name: 'Exports', type: 'folder', path: '/projects/exports' },
        { name: 'crane-model-v1.cad3d.json', type: 'file', size: 2048, modified: new Date(), extension: '.json', path: '/projects/crane-model-v1.cad3d.json' },
        { name: 'building-layout.cad3d.json', type: 'file', size: 1536, modified: new Date(), extension: '.json', path: '/projects/building-layout.cad3d.json' },
        { name: 'liebherr-ltm1300.glb', type: 'file', size: 5120, modified: new Date(), extension: '.glb', path: '/projects/liebherr-ltm1300.glb' },
        { name: 'site-plan.obj', type: 'file', size: 3072, modified: new Date(), extension: '.obj', path: '/projects/site-plan.obj' },
      ]
      setFiles(mockFiles)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (acceptedTypes.length === 0 || file.type === 'folder' || 
     acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase())))
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-blue-500" />
    
    const ext = file.extension?.toLowerCase()
    switch (ext) {
      case '.json':
        return <FileText className="w-5 h-5 text-green-500" />
      case '.glb':
      case '.gltf':
      case '.obj':
      case '.stl':
        return <File className="w-5 h-5 text-purple-500" />
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        return <Image className="w-5 h-5 text-orange-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path)
      setSelectedFile(null)
    } else {
      setSelectedFile(file)
      if (mode === 'save') {
        setFilename(file.name)
      }
    }
  }

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'file' && onFileSelect) {
      onFileSelect(file)
      onClose()
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      // In real app, upload to server
      console.log('Uploading file:', file.name)
    }
    
    loadFiles() // Refresh file list
  }

  const handleAction = () => {
    if (mode === 'open' && selectedFile && onFileSelect) {
      onFileSelect(selectedFile)
      onClose()
    } else if (mode === 'save' && filename && onFileSave) {
      onFileSave(filename, currentPath)
      onClose()
    } else if (mode === 'import' && selectedFile && onFileSelect) {
      onFileSelect(selectedFile)
      onClose()
    }
  }

  const getActionLabel = () => {
    switch (mode) {
      case 'open': return 'Open'
      case 'save': return 'Save'
      case 'import': return 'Import'
      case 'export': return 'Export'
      default: return 'Select'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[20000]">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800">
              {mode === 'open' && 'Open File'}
              {mode === 'save' && 'Save File'}
              {mode === 'import' && 'Import Model'}
              {mode === 'export' && 'Export Location'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPath('/projects')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              Up
            </button>
            <span className="text-sm text-gray-600 font-mono bg-white px-3 py-2 rounded border">
              {currentPath}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading files...</div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-6 gap-4' : 'space-y-1'}>
              {filteredFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  className={`
                    ${viewMode === 'grid' ? 'flex flex-col items-center p-3 rounded-lg' : 'flex items-center gap-3 p-2 rounded-lg'}
                    cursor-pointer transition-colors
                    ${selectedFile?.path === file.path ? 'bg-blue-100 border-2 border-blue-300' : 'hover:bg-gray-50 border-2 border-transparent'}
                  `}
                >
                  {getFileIcon(file)}
                  <div className={`${viewMode === 'grid' ? 'text-center' : 'flex-1'}`}>
                    <div className={`font-medium text-gray-800 ${viewMode === 'grid' ? 'text-xs mt-2' : 'text-sm'}`}>
                      {file.name}
                    </div>
                    {viewMode === 'list' && file.type === 'file' && (
                      <div className="text-xs text-gray-500">
                        {file.size && formatFileSize(file.size)} • {file.modified?.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {mode === 'save' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filename:</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter filename..."
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={
                (mode === 'open' && !selectedFile) ||
                (mode === 'save' && !filename) ||
                (mode === 'import' && !selectedFile)
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {getActionLabel()}
            </button>
          </div>
        </div>

        {/* Hidden file input for uploads */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileUpload}
        />
      </div>
    </div>
  )
}
