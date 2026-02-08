"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Download, 
  Settings,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface LiftPlanData {
  // Project Info
  jobName?: string
  projectLocation?: string
  clientName?: string
  contractorName?: string
  plannedLiftDate?: string
  // Load Specs
  loadDescription?: string
  loadWeight?: string
  loadWeightUnit?: string
  loadDimensions?: { length?: string; width?: string; height?: string }
  centerOfGravity?: { x?: string; y?: string; z?: string }
  // Equipment
  equipmentType?: string
  equipmentCapacity?: string
  equipmentModel?: string
  // Rigging
  slingType?: string
  slingCount?: string
  slingCapacity?: string
  slingAngle?: string
  riggingConfiguration?: string
  // Lift Geometry
  pickRadius?: string
  setRadius?: string
  pickHeight?: string
  setHeight?: string
  // Site Conditions
  groundType?: string
  groundBearing?: string
  accessRestrictions?: string
  // Environmental
  windSpeed?: string
  weatherConditions?: string
  // Safety
  exclusionZoneRadius?: string
  hazardsIdentified?: string[]
  mitigationMeasures?: string[]
}

interface LiftPlanningChatbotProps {
  isOpen: boolean
  onClose: () => void
  cadElements?: unknown[]
  projectInfo?: Record<string, unknown>
}

export default function LiftPlanningChatbot({ 
  isOpen, 
  onClose, 
  cadElements,
  projectInfo 
}: LiftPlanningChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [liftPlanData, setLiftPlanData] = useState<LiftPlanData>({})
  const [aiModel, setAiModel] = useState<'openai' | 'deepseek' | 'huggingface'>('openai')
  const [huggingfaceModel, setHuggingfaceModel] = useState('mistralai/Mixtral-8x7B-Instruct-v0.1')
  const [showSettings, setShowSettings] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Available Hugging Face models for lift planning
  const huggingfaceModels = [
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B (Recommended)' },
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B' },
    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B' },
    { id: 'microsoft/Phi-3-medium-128k-instruct', name: 'Phi-3 Medium' },
    { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B' }
  ]

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: `👋 Hello! I'm your AI Lift Planning Assistant.

I'll help you create a comprehensive, safety-compliant lift plan. Let's start with the basics:

**What would you like to lift?**
Please describe the load (e.g., "5 tonne steel beam, 8m long" or "HVAC unit, approximately 2.5 tonnes").

I'll guide you through:
• Load specifications & weight verification
• Equipment selection & capacity checks
• Rigging configuration & sling calculations
• Site hazards & safety measures
• Complete RAMS documentation

Feel free to ask questions at any point!`,
        timestamp: new Date()
      }
      setMessages([greeting])
    }
  }, [isOpen, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const extractDataFromResponse = useCallback((response: string) => {
    // Extract structured data from AI responses
    const weightMatch = response.match(/(\d+(?:\.\d+)?)\s*(kg|tonnes?|t|lbs?)/i)
    if (weightMatch) {
      setLiftPlanData(prev => ({
        ...prev,
        loadWeight: weightMatch[1],
        loadWeightUnit: weightMatch[2].toLowerCase()
      }))
    }
  }, [])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: aiModel,
          huggingfaceModel: aiModel === 'huggingface' ? huggingfaceModel : undefined,
          context: {
            cadElements,
            projectInfo,
            liftPlanData
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        extractDataFromResponse(data.message)
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liftPlanData,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          model: aiModel
        })
      })

      const data = await response.json()
      if (data.success && data.pdfUrl) {
        // Download the PDF
        window.open(data.pdfUrl, '_blank')
      } else if (data.success && data.html) {
        // Generate PDF from HTML using jsPDF
        await generatePDFFromData(data)
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const generatePDFFromData = async (reportData: { html?: string; sections?: Record<string, string> }) => {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    let y = 20

    // Header
    pdf.setFillColor(25, 118, 210)
    pdf.rect(0, 0, pageWidth, 25, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('LIFT PLANNER PRO', margin, 12)
    pdf.setFontSize(10)
    pdf.text('AI-Generated Lift Plan Report', margin, 18)

    y = 35
    pdf.setTextColor(33, 33, 33)

    // Title
    pdf.setFontSize(14)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('PROFESSIONAL LIFT PLAN & RAMS', margin, y)
    y += 10

    // Metadata
    pdf.setFontSize(9)
    pdf.setFont('Helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
    y += 5
    pdf.text(`AI Model: ${aiModel === 'huggingface' ? `HuggingFace (${huggingfaceModel.split('/')[1]})` : aiModel === 'deepseek' ? 'DeepSeek' : 'OpenAI GPT-4'}`, margin, y)
    y += 10

    // Add sections from lift plan data
    const sections = [
      { title: 'PROJECT INFORMATION', data: [
        ['Job Name', liftPlanData.jobName],
        ['Location', liftPlanData.projectLocation],
        ['Client', liftPlanData.clientName],
        ['Planned Date', liftPlanData.plannedLiftDate]
      ]},
      { title: 'LOAD SPECIFICATIONS', data: [
        ['Description', liftPlanData.loadDescription],
        ['Weight', `${liftPlanData.loadWeight || 'TBD'} ${liftPlanData.loadWeightUnit || 'kg'}`],
        ['Dimensions', liftPlanData.loadDimensions ?
          `${liftPlanData.loadDimensions.length}×${liftPlanData.loadDimensions.width}×${liftPlanData.loadDimensions.height} mm` : 'TBD']
      ]},
      { title: 'LIFTING EQUIPMENT', data: [
        ['Equipment Type', liftPlanData.equipmentType],
        ['Capacity', liftPlanData.equipmentCapacity],
        ['Model', liftPlanData.equipmentModel]
      ]},
      { title: 'RIGGING CONFIGURATION', data: [
        ['Sling Type', liftPlanData.slingType],
        ['Sling Count', liftPlanData.slingCount],
        ['Sling Angle', liftPlanData.slingAngle ? `${liftPlanData.slingAngle}°` : 'TBD']
      ]}
    ]

    sections.forEach(section => {
      if (y > 260) { pdf.addPage(); y = 20 }

      // Section header
      pdf.setFillColor(25, 118, 210)
      pdf.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('Helvetica', 'bold')
      pdf.text(section.title, margin + 2, y + 1)
      y += 8

      pdf.setTextColor(33, 33, 33)
      pdf.setFont('Helvetica', 'normal')
      pdf.setFontSize(9)

      section.data.forEach(([key, value]) => {
        if (y > 270) { pdf.addPage(); y = 20 }
        pdf.setFont('Helvetica', 'bold')
        pdf.setTextColor(25, 118, 210)
        pdf.text(`${key}:`, margin + 2, y)
        pdf.setFont('Helvetica', 'normal')
        pdf.setTextColor(33, 33, 33)
        pdf.text(value || 'Not specified', margin + 45, y)
        y += 5
      })
      y += 5
    })

    // Safety disclaimer
    if (y > 250) { pdf.addPage(); y = 20 }
    y += 10
    pdf.setFillColor(255, 243, 224)
    pdf.rect(margin, y - 4, pageWidth - margin * 2, 20, 'F')
    pdf.setTextColor(230, 81, 0)
    pdf.setFontSize(8)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('⚠️ IMPORTANT DISCLAIMER', margin + 2, y)
    y += 5
    pdf.setFont('Helvetica', 'normal')
    pdf.text('This AI-generated lift plan requires review and approval by a qualified', margin + 2, y)
    y += 4
    pdf.text('Appointed Person before implementation. Always follow BS 7121 and LOLER 1998.', margin + 2, y)

    // Footer
    pdf.setFontSize(7)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Report ID: LP-${Date.now().toString().slice(-8)}`, margin, 287)
    pdf.text('LiftPlanner Pro - Professional Lift Planning Software', pageWidth - margin - 60, 287)

    pdf.save(`lift-plan-${liftPlanData.jobName?.replace(/\s+/g, '_') || 'report'}-${Date.now()}.pdf`)
  }

  const quickActions = [
    { label: '📊 Generate Report', action: generateReport, disabled: isGeneratingReport },
    { label: '⚠️ List Hazards', action: () => setInputValue('What are the main hazards for this lift?') },
    { label: '🔧 Rigging Calc', action: () => setInputValue('Calculate the rigging requirements') },
    { label: '✅ Safety Checklist', action: () => setInputValue('Generate a pre-lift safety checklist') }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col bg-slate-900 border-slate-700 p-0">
        <DialogHeader className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">AI Lift Planning Assistant</DialogTitle>
                <p className="text-slate-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {aiModel === 'deepseek' ? 'DeepSeek' : 'GPT-4'} • Ready to help
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-slate-300 text-sm">AI Provider:</span>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={aiModel === 'openai' ? 'default' : 'outline'}
                    onClick={() => setAiModel('openai')}
                    className={aiModel === 'openai' ? 'bg-green-600' : 'border-slate-600'}
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> OpenAI GPT-4
                  </Button>
                  <Button
                    size="sm"
                    variant={aiModel === 'deepseek' ? 'default' : 'outline'}
                    onClick={() => setAiModel('deepseek')}
                    className={aiModel === 'deepseek' ? 'bg-blue-600' : 'border-slate-600'}
                  >
                    <Bot className="w-3 h-3 mr-1" /> DeepSeek
                  </Button>
                  <Button
                    size="sm"
                    variant={aiModel === 'huggingface' ? 'default' : 'outline'}
                    onClick={() => setAiModel('huggingface')}
                    className={aiModel === 'huggingface' ? 'bg-yellow-600' : 'border-slate-600'}
                  >
                    🤗 Hugging Face
                  </Button>
                </div>
              </div>

              {/* Hugging Face Model Selection */}
              {aiModel === 'huggingface' && (
                <div className="flex items-center gap-4">
                  <span className="text-slate-300 text-sm">Model:</span>
                  <select
                    value={huggingfaceModel}
                    onChange={(e) => setHuggingfaceModel(e.target.value)}
                    className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                  >
                    {huggingfaceModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-b border-slate-800 flex gap-2 flex-wrap">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              onClick={action.action}
              disabled={action.disabled || isLoading}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-purple-500 to-blue-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-100 border border-slate-700'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  <div className="text-[10px] opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Extracted Data Indicator */}
        {Object.keys(liftPlanData).length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Data captured: {Object.keys(liftPlanData).filter(k => liftPlanData[k as keyof LiftPlanData]).length} fields</span>
              <span className="text-slate-600">|</span>
              <span className="text-green-400">{liftPlanData.loadWeight ? `Load: ${liftPlanData.loadWeight} ${liftPlanData.loadWeightUnit || 'kg'}` : ''}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your lift or ask a question..."
              className="flex-1 min-h-[44px] max-h-32 bg-slate-800 border-slate-700 text-white resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-auto"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

