'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface AutoSaveData {
  elements: any[]
  projectName: string
  zoom: number
  pan: { x: number; y: number }
  layers: any[]
  drawingScale: string
  drawingUnits: string
  projectInfo: any
  timestamp: number
  version: string
}

const AUTO_SAVE_KEY = 'liftplannerpro_autosave'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds
const VERSION = '1.0.0'

export function useAutoSave(
  elements: any[],
  projectName: string,
  zoom: number,
  pan: { x: number; y: number },
  layers: any[],
  drawingScale: string,
  drawingUnits: string,
  projectInfo: any,
  enabled: boolean = true
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [recoveryData, setRecoveryData] = useState<AutoSaveData | null>(null)
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)
  const previousElementsRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for recovery data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(AUTO_SAVE_KEY)
    if (savedData) {
      try {
        const parsed: AutoSaveData = JSON.parse(savedData)
        // Only show recovery if data is less than 24 hours old
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000
        if (isRecent && parsed.elements && parsed.elements.length > 0) {
          setRecoveryData(parsed)
          setShowRecoveryPrompt(true)
        }
      } catch (e) {
        console.error('Failed to parse auto-save data:', e)
        localStorage.removeItem(AUTO_SAVE_KEY)
      }
    }
  }, [])

  // Save function
  const saveToLocalStorage = useCallback(() => {
    if (!enabled || elements.length === 0) return

    const data: AutoSaveData = {
      elements,
      projectName,
      zoom,
      pan,
      layers,
      drawingScale,
      drawingUnits,
      projectInfo,
      timestamp: Date.now(),
      version: VERSION
    }

    try {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      console.log('Auto-saved at', new Date().toLocaleTimeString())
    } catch (e) {
      console.error('Auto-save failed:', e)
    }
  }, [elements, projectName, zoom, pan, layers, drawingScale, drawingUnits, projectInfo, enabled])

  // Detect changes
  useEffect(() => {
    const currentElementsStr = JSON.stringify(elements)
    if (currentElementsStr !== previousElementsRef.current) {
      previousElementsRef.current = currentElementsStr
      setHasUnsavedChanges(true)
    }
  }, [elements])

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveToLocalStorage()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [enabled, hasUnsavedChanges, saveToLocalStorage])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && elements.length > 0) {
        saveToLocalStorage()
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, elements.length, saveToLocalStorage])

  // Clear auto-save data
  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(AUTO_SAVE_KEY)
    setRecoveryData(null)
    setShowRecoveryPrompt(false)
  }, [])

  // Dismiss recovery prompt
  const dismissRecovery = useCallback(() => {
    setShowRecoveryPrompt(false)
    clearAutoSave()
  }, [clearAutoSave])

  // Force save now
  const saveNow = useCallback(() => {
    saveToLocalStorage()
  }, [saveToLocalStorage])

  return {
    lastSaved,
    hasUnsavedChanges,
    recoveryData,
    showRecoveryPrompt,
    setShowRecoveryPrompt,
    clearAutoSave,
    dismissRecovery,
    saveNow
  }
}

