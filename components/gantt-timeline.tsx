"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface TimelineStep {
  id: string
  title: string
  duration: number
  startTime: Date
  endTime: Date
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
  riskLevel: 'Low' | 'Medium' | 'High'
  dependencies: string[]
  category: string
}

interface GanttTimelineProps {
  steps: TimelineStep[]
  projectStartTime: Date
  onStepClick?: (stepId: string) => void
  onTimelineUpdate?: (currentTime: Date) => void
}

export default function GanttTimeline({ 
  steps, 
  projectStartTime, 
  onStepClick,
  onTimelineUpdate 
}: GanttTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeScale, setTimeScale] = useState(1) // minutes per pixel
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  const totalDuration = steps.reduce((total, step) => total + step.duration, 0)
  const canvasWidth = Math.max(800, totalDuration * 2)
  const canvasHeight = steps.length * 60 + 100

  useEffect(() => {
    drawTimeline()
  }, [steps, currentTime, selectedStep, timeScale])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = new Date(prev.getTime() + 60000) // Advance by 1 minute
          onTimelineUpdate?.(newTime)
          return newTime
        })
      }, 100) // Update every 100ms for smooth animation
    }
    return () => clearInterval(interval)
  }, [isPlaying, onTimelineUpdate])

  const drawTimeline = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Draw background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw time grid
    drawTimeGrid(ctx)

    // Draw steps
    steps.forEach((step, index) => {
      drawStep(ctx, step, index)
    })

    // Draw current time indicator
    drawCurrentTimeIndicator(ctx)

    // Draw dependencies
    drawDependencies(ctx)
  }

  const drawTimeGrid = (ctx: CanvasRenderingContext2D) => {
    const startX = 200
    const gridSpacing = 60 // 1 hour = 60 pixels

    // Vertical grid lines (time intervals)
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    
    for (let i = 0; i <= totalDuration / 60; i++) {
      const x = startX + i * gridSpacing
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, canvasHeight - 20)
      ctx.stroke()

      // Time labels
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      const timeLabel = `${i}h`
      ctx.fillText(timeLabel, x, 45)
    }

    // Horizontal grid lines
    ctx.strokeStyle = '#374151'
    steps.forEach((_, index) => {
      const y = 70 + index * 60
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(canvasWidth - 20, y)
      ctx.stroke()
    })
  }

  const drawStep = (ctx: CanvasRenderingContext2D, step: TimelineStep, index: number) => {
    const startX = 200
    const y = 80 + index * 60
    const stepStartTime = (step.startTime.getTime() - projectStartTime.getTime()) / (1000 * 60) // minutes from start
    const x = startX + stepStartTime
    const width = step.duration

    // Step bar background
    const isSelected = selectedStep === step.id
    let barColor = getStepColor(step.status, step.riskLevel)
    
    if (isSelected) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.strokeRect(x - 2, y - 2, width + 4, 36)
    }

    // Step bar
    ctx.fillStyle = barColor
    ctx.fillRect(x, y, width, 32)

    // Step border
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, width, 32)

    // Progress indicator
    if (step.status === 'In Progress') {
      const progressWidth = width * 0.6 // Assume 60% progress for demo
      ctx.fillStyle = '#10b981'
      ctx.fillRect(x, y, progressWidth, 32)
    }

    // Step title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(step.title, 10, y + 20)

    // Duration label
    ctx.fillStyle = '#9ca3af'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${step.duration}min`, x + width / 2, y + 45)

    // Risk indicator
    if (step.riskLevel === 'High') {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(x + width - 8, y + 8, 4, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Status icon
    drawStatusIcon(ctx, step.status, x + 5, y + 5)
  }

  const drawCurrentTimeIndicator = (ctx: CanvasRenderingContext2D) => {
    const startX = 200
    const currentMinutes = (currentTime.getTime() - projectStartTime.getTime()) / (1000 * 60)
    const x = startX + currentMinutes

    if (x >= startX && x <= canvasWidth - 20) {
      // Current time line
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, canvasHeight - 20)
      ctx.stroke()
      ctx.setLineDash([])

      // Time label
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(currentTime.toLocaleTimeString(), x, 35)
    }
  }

  const drawDependencies = (ctx: CanvasRenderingContext2D) => {
    const startX = 200

    steps.forEach((step, index) => {
      step.dependencies.forEach(depId => {
        const depStep = steps.find(s => s.id === depId)
        if (!depStep) return

        const depIndex = steps.findIndex(s => s.id === depId)
        const stepY = 80 + index * 60 + 16
        const depY = 80 + depIndex * 60 + 16

        const stepStartTime = (step.startTime.getTime() - projectStartTime.getTime()) / (1000 * 60)
        const depEndTime = (depStep.endTime.getTime() - projectStartTime.getTime()) / (1000 * 60)

        const stepX = startX + stepStartTime
        const depX = startX + depEndTime

        // Draw dependency arrow
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(depX, depY)
        ctx.lineTo(stepX, stepY)
        ctx.stroke()

        // Arrow head
        const angle = Math.atan2(stepY - depY, stepX - depX)
        ctx.beginPath()
        ctx.moveTo(stepX, stepY)
        ctx.lineTo(stepX - 10 * Math.cos(angle - Math.PI / 6), stepY - 10 * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(stepX, stepY)
        ctx.lineTo(stepX - 10 * Math.cos(angle + Math.PI / 6), stepY - 10 * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
      })
    })
  }

  const drawStatusIcon = (ctx: CanvasRenderingContext2D, status: string, x: number, y: number) => {
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    
    switch (status) {
      case 'Completed':
        ctx.fillStyle = '#10b981'
        ctx.fillText('✓', x, y + 12)
        break
      case 'In Progress':
        ctx.fillStyle = '#3b82f6'
        ctx.fillText('▶', x, y + 12)
        break
      case 'Blocked':
        ctx.fillStyle = '#ef4444'
        ctx.fillText('⚠', x, y + 12)
        break
      default:
        ctx.fillStyle = '#6b7280'
        ctx.fillText('○', x, y + 12)
    }
  }

  const getStepColor = (status: string, riskLevel: string): string => {
    if (status === 'Completed') return '#10b981'
    if (status === 'In Progress') return '#3b82f6'
    if (status === 'Blocked') return '#ef4444'
    
    switch (riskLevel) {
      case 'High': return '#dc2626'
      case 'Medium': return '#d97706'
      default: return '#6b7280'
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is on a step
    steps.forEach((step, index) => {
      const stepY = 80 + index * 60
      const startX = 200
      const stepStartTime = (step.startTime.getTime() - projectStartTime.getTime()) / (1000 * 60)
      const stepX = startX + stepStartTime

      if (x >= stepX && x <= stepX + step.duration && y >= stepY && y <= stepY + 32) {
        setSelectedStep(step.id)
        onStepClick?.(step.id)
      }
    })
  }

  const resetTimeline = () => {
    setCurrentTime(projectStartTime)
    setIsPlaying(false)
  }

  const skipToEnd = () => {
    const endTime = new Date(projectStartTime.getTime() + totalDuration * 60000)
    setCurrentTime(endTime)
    setIsPlaying(false)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Project Timeline
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={resetTimeline}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={skipToEnd}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              Current Time: {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span className="text-slate-400">Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span className="text-slate-400">In Progress</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span className="text-slate-400">Not Started</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-slate-400">High Risk</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-slate-600 rounded-lg overflow-auto">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-pointer"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        {selectedStep && (
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <div className="text-white font-semibold">
              {steps.find(s => s.id === selectedStep)?.title}
            </div>
            <div className="text-slate-400 text-sm">
              Duration: {steps.find(s => s.id === selectedStep)?.duration} minutes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
