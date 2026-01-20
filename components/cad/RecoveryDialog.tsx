'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw, Trash2, Clock, FileText, Layers } from 'lucide-react'

interface RecoveryData {
  elements: any[]
  projectName: string
  timestamp: number
  layers?: any[]
}

interface RecoveryDialogProps {
  open: boolean
  recoveryData: RecoveryData | null
  onRecover: () => void
  onDiscard: () => void
}

export function RecoveryDialog({ open, recoveryData, onRecover, onDiscard }: RecoveryDialogProps) {
  if (!recoveryData) return null

  const savedTime = new Date(recoveryData.timestamp)
  const timeAgo = getTimeAgo(savedTime)
  const elementCount = recoveryData.elements?.length || 0

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RotateCcw className="w-6 h-6 text-blue-400" />
            Recover Unsaved Work?
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            We found an auto-saved drawing from your previous session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recovery Info Card */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">{recoveryData.projectName || 'Untitled Project'}</p>
                <p className="text-sm text-slate-400">Project Name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">{timeAgo}</p>
                <p className="text-sm text-slate-400">{savedTime.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium">{elementCount} element{elementCount !== 1 ? 's' : ''}</p>
                <p className="text-sm text-slate-400">Drawing objects</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <p className="text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg">
            ⚠️ If you discard, this auto-saved work will be permanently deleted.
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="flex-1 bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button
            onClick={onRecover}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recover Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

