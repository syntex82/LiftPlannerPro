"use client"

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUp, AlertCircle, CheckCircle } from 'lucide-react'
import { importCADFile } from '@/lib/cad-import'

interface CADImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (elements: any[]) => void
}

export default function CADImportDialog({
  isOpen,
  onClose,
  onImport
}: CADImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const filename = file.name.toLowerCase()
      if (filename.endsWith('.dxf') || filename.endsWith('.dwg')) {
        setSelectedFile(file)
        setError(null)
        setSuccess(null)
      } else {
        setError('Please select a DXF or DWG file')
        setSelectedFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    try {
      setIsImporting(true)
      setError(null)
      setSuccess(null)

      const elements = await importCADFile(selectedFile)
      
      if (elements.length === 0) {
        setError('No drawing elements found in the file')
        return
      }

      setSuccess(`✅ Successfully imported ${elements.length} elements from ${selectedFile.name}`)
      
      // Call the import callback
      onImport(elements)
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose()
        setSelectedFile(null)
        setSuccess(null)
      }, 1500)
    } catch (err) {
      setError(`Failed to import file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const filename = file.name.toLowerCase()
      if (filename.endsWith('.dxf') || filename.endsWith('.dwg')) {
        setSelectedFile(file)
        setError(null)
        setSuccess(null)
      } else {
        setError('Please drop a DXF or DWG file')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Import CAD File
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Import DXF or DWG files to add elements to your drawing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Drop Zone */}
          <Card 
            className="bg-slate-800 border-slate-700 border-2 border-dashed cursor-pointer hover:border-blue-500 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-8 px-4">
              <FileUp className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-white text-sm font-medium text-center">
                {selectedFile ? selectedFile.name : 'Drop DXF/DWG file here'}
              </p>
              <p className="text-slate-400 text-xs text-center mt-1">
                or click to browse
              </p>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-slate-300 text-xs font-medium mb-2">Supported Formats:</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>📐 DXF (Drawing Exchange Format)</li>
              <li>🏗️ DWG (AutoCAD Format)</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-700 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 bg-green-900/20 border border-green-700 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-xs">{success}</p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".dxf,.dwg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="text-slate-300 h-8 text-xs"
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 h-8 text-xs"
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="w-3 h-3" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

