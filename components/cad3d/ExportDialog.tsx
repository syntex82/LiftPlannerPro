import React, { useState } from 'react'
import { 
  FileDown, 
  Settings, 
  X, 
  Download,
  Folder,
  Check
} from 'lucide-react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, options: ExportOptions) => void
}

interface ExportOptions {
  format: string
  filename: string
  quality: 'low' | 'medium' | 'high'
  includeTextures: boolean
  includeMaterials: boolean
  scale: number
  units: 'mm' | 'cm' | 'm' | 'in' | 'ft'
  compression: boolean
  embedTextures: boolean
  pdfTitle?: string
  pdfDescription?: string
  includeGrid?: boolean
  blueprintScale?: string
}

const exportFormats = [
  {
    id: 'glb',
    name: 'GLB (Binary glTF)',
    description: 'Compact binary format, best for web and real-time applications',
    extension: '.glb',
    supportsTextures: true,
    supportsMaterials: true,
    supportsAnimation: true,
    category: '3D'
  },
  {
    id: 'gltf',
    name: 'glTF (JSON)',
    description: 'Human-readable format with separate texture files',
    extension: '.gltf',
    supportsTextures: true,
    supportsMaterials: true,
    supportsAnimation: true,
    category: '3D'
  },
  {
    id: 'obj',
    name: 'Wavefront OBJ',
    description: 'Widely supported format, good for 3D printing',
    extension: '.obj',
    supportsTextures: true,
    supportsMaterials: true,
    supportsAnimation: false,
    category: '3D'
  },
  {
    id: 'stl',
    name: 'STL (Stereolithography)',
    description: 'Standard format for 3D printing',
    extension: '.stl',
    supportsTextures: false,
    supportsMaterials: false,
    supportsAnimation: false,
    category: '3D'
  },
  {
    id: 'ply',
    name: 'PLY (Polygon File Format)',
    description: 'Research format with vertex colors',
    extension: '.ply',
    supportsTextures: false,
    supportsMaterials: false,
    supportsAnimation: false,
    category: '3D'
  },
  {
    id: 'fbx',
    name: 'Autodesk FBX',
    description: 'Industry standard for animation and complex scenes',
    extension: '.fbx',
    supportsTextures: true,
    supportsMaterials: true,
    supportsAnimation: true,
    category: '3D'
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Export 3D scene as 2D PDF for printing and documentation',
    extension: '.pdf',
    supportsTextures: false,
    supportsMaterials: false,
    supportsAnimation: false,
    category: '2D/Paper'
  },
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High-quality image export for presentations',
    extension: '.png',
    supportsTextures: true,
    supportsMaterials: true,
    supportsAnimation: false,
    category: '2D/Paper'
  },
  {
    id: 'blueprint',
    name: 'Blueprint (PDF)',
    description: 'Technical drawing style with grid and dimensions',
    extension: '.pdf',
    supportsTextures: false,
    supportsMaterials: false,
    supportsAnimation: false,
    category: '2D/Paper'
  }
]

export default function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('glb')
  const [options, setOptions] = useState<ExportOptions>({
    format: 'glb',
    filename: 'model',
    quality: 'high',
    includeTextures: true,
    includeMaterials: true,
    scale: 1,
    units: 'm',
    compression: true,
    embedTextures: true,
    pdfTitle: 'Crane Model',
    pdfDescription: 'Professional 3D Crane Model',
    includeGrid: true,
    blueprintScale: '1:100'
  })

  const selectedFormatInfo = exportFormats.find(f => f.id === selectedFormat)

  const handleExport = () => {
    const finalOptions = {
      ...options,
      format: selectedFormat,
      filename: options.filename + (selectedFormatInfo?.extension || '')
    }
    onExport(selectedFormat, finalOptions)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[20000]">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileDown className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Export 3D Model</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Format</h3>

            {/* 3D Formats */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 px-2">3D Formats</h4>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.filter(f => f.category === '3D').map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{format.name}</div>
                      {selectedFormat === format.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{format.description}</div>
                    <div className="flex gap-2 text-xs">
                      {format.supportsTextures && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Textures</span>
                      )}
                      {format.supportsMaterials && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Materials</span>
                      )}
                      {format.supportsAnimation && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Animation</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2D/Paper Formats */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 px-2">2D / Paper Export</h4>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.filter(f => f.category === '2D/Paper').map((format) => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${selectedFormat === format.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{format.name}</div>
                      {selectedFormat === format.id && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{format.description}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Paper</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>
            
            <div className="grid grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                
                {/* Filename */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filename
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={options.filename}
                      onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter filename"
                    />
                    <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                      {selectedFormatInfo?.extension}
                    </div>
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={options.quality}
                    onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low (Faster export, smaller file)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best quality, larger file)</option>
                  </select>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale Factor
                  </label>
                  <input
                    type="number"
                    value={options.scale}
                    onChange={(e) => setOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) || 1 }))}
                    step="0.1"
                    min="0.1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units
                  </label>
                  <select
                    value={options.units}
                    onChange={(e) => setOptions(prev => ({ ...prev, units: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="m">Meters (m)</option>
                    <option value="in">Inches (in)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                
                {/* Checkboxes */}
                {selectedFormatInfo?.supportsTextures && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeTextures"
                      checked={options.includeTextures}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTextures: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeTextures" className="ml-2 text-sm text-gray-700">
                      Include Textures
                    </label>
                  </div>
                )}

                {selectedFormatInfo?.supportsMaterials && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeMaterials"
                      checked={options.includeMaterials}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeMaterials: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeMaterials" className="ml-2 text-sm text-gray-700">
                      Include Materials
                    </label>
                  </div>
                )}

                {(selectedFormat === 'glb' || selectedFormat === 'gltf') && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="compression"
                        checked={options.compression}
                        onChange={(e) => setOptions(prev => ({ ...prev, compression: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="compression" className="ml-2 text-sm text-gray-700">
                        Enable Compression
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="embedTextures"
                        checked={options.embedTextures}
                        onChange={(e) => setOptions(prev => ({ ...prev, embedTextures: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="embedTextures" className="ml-2 text-sm text-gray-700">
                        Embed Textures
                      </label>
                    </div>
                  </>
                )}

                {/* PDF Options */}
                {(selectedFormat === 'pdf' || selectedFormat === 'blueprint') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PDF Title
                      </label>
                      <input
                        type="text"
                        value={options.pdfTitle || ''}
                        onChange={(e) => setOptions(prev => ({ ...prev, pdfTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter PDF title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={options.pdfDescription || ''}
                        onChange={(e) => setOptions(prev => ({ ...prev, pdfDescription: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description"
                      />
                    </div>

                    {selectedFormat === 'blueprint' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blueprint Scale
                        </label>
                        <input
                          type="text"
                          value={options.blueprintScale || '1:100'}
                          onChange={(e) => setOptions(prev => ({ ...prev, blueprintScale: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1:100"
                        />
                      </div>
                    )}

                    {selectedFormat === 'pdf' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeGrid"
                          checked={options.includeGrid || false}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="includeGrid" className="ml-2 text-sm text-gray-700">
                          Include Grid
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Export Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Export Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Format: <span className="font-medium">{selectedFormatInfo?.name}</span></div>
                    <div>Filename: <span className="font-medium">{options.filename}{selectedFormatInfo?.extension}</span></div>
                    <div>Quality: <span className="font-medium">{options.quality}</span></div>
                    <div>Scale: <span className="font-medium">{options.scale}x</span></div>
                    <div>Units: <span className="font-medium">{options.units}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Export will generate a {selectedFormatInfo?.name} file with your current 3D model
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={!options.filename.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
