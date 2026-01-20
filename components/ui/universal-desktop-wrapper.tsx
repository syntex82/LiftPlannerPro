"use client"

import { useState, useEffect } from 'react'
import { useDeviceDetection } from "@/lib/deviceDetection"
import { DesktopRecommendation } from "./desktop-recommendation"

interface UniversalDesktopWrapperProps {
  children: React.ReactNode
  feature: string
  title: string
  description: string
  forceShow?: boolean
  showOnTablet?: boolean
  priority?: 'low' | 'medium' | 'high'
}

const featureConfigs = {
  'cad-editor': {
    title: 'CAD Editor',
    description: 'Professional CAD tools require precise mouse control, keyboard shortcuts, and large screens for detailed technical drawings. Desktop/laptop computers provide the optimal experience for creating accurate lift plans.',
    priority: 'high'
  },
  'lms': {
    title: 'Learning Management System',
    description: 'The LMS provides comprehensive safety training with interactive quizzes, detailed explanations, and certificate generation. Desktop/laptop screens make reading technical content and navigation much easier.',
    priority: 'medium'
  },
  'calculator': {
    title: 'Load Calculator',
    description: 'Complex load calculations, crane charts, and engineering formulas are best viewed on larger screens. Desktop/laptop computers provide better precision for entering values and reviewing results.',
    priority: 'high'
  },
  'rams': {
    title: 'RAMS Generator',
    description: 'Creating comprehensive Risk Assessment and Method Statements requires detailed form filling, document review, and multi-section navigation. Desktop/laptop computers provide the best experience for professional documentation.',
    priority: 'high'
  },
  'dashboard': {
    title: 'Project Dashboard',
    description: 'Managing multiple projects, viewing detailed information, and accessing various tools is more efficient on desktop/laptop computers with larger screens and better navigation capabilities.',
    priority: 'medium'
  },
  'admin': {
    title: 'Admin Panel',
    description: 'Administrative functions, user management, system monitoring, and security controls require detailed interfaces best suited for desktop/laptop computers with full keyboard and mouse support.',
    priority: 'high'
  },
  'rigging-loft': {
    title: 'Rigging Loft Management',
    description: 'Equipment tracking, inspection management, and certification monitoring involve complex data entry and review processes that work best on desktop/laptop computers.',
    priority: 'medium'
  },
  'project-management': {
    title: 'Project Management',
    description: 'Creating, organizing, and managing projects with categories, tags, and detailed information is more efficient on desktop/laptop computers with better input methods and screen space.',
    priority: 'medium'
  },
  'reports': {
    title: 'Reports & Analytics',
    description: 'Viewing detailed reports, charts, and analytics requires larger screens and better navigation. Desktop/laptop computers provide optimal viewing for professional reporting.',
    priority: 'medium'
  },
  'file-management': {
    title: 'File Management',
    description: 'Uploading, organizing, and managing project files, documents, and images is more efficient with desktop/laptop file systems and drag-and-drop capabilities.',
    priority: 'medium'
  }
}

export default function UniversalDesktopWrapper({ 
  children, 
  feature, 
  title, 
  description, 
  forceShow = false,
  showOnTablet = true,
  priority = 'medium'
}: UniversalDesktopWrapperProps) {
  const deviceInfo = useDeviceDetection()
  const [showRecommendation, setShowRecommendation] = useState(false)

  // Get feature config or use provided props
  const config = featureConfigs[feature as keyof typeof featureConfigs] || {
    title,
    description,
    priority
  }

  useEffect(() => {
    // Don't show on desktop unless forced
    if (deviceInfo.isDesktop && !forceShow) {
      return
    }

    // Check if we should show on tablet
    if (deviceInfo.isTablet && !showOnTablet) {
      return
    }

    // Check if user has dismissed this recommendation
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    if (dismissedFeatures) {
      const dismissed = JSON.parse(dismissedFeatures)
      if (dismissed.includes(feature)) {
        return
      }
    }

    // Show recommendation for mobile/tablet users
    if (deviceInfo.isMobile || (deviceInfo.isTablet && showOnTablet) || forceShow) {
      setShowRecommendation(true)
    }
  }, [deviceInfo, feature, forceShow, showOnTablet])

  const handleContinue = () => {
    setShowRecommendation(false)
  }

  const handleDismiss = () => {
    setShowRecommendation(false)
    
    // Save to localStorage
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    const dismissed = dismissedFeatures ? JSON.parse(dismissedFeatures) : []
    if (!dismissed.includes(feature)) {
      dismissed.push(feature)
      localStorage.setItem('dismissed-desktop-recommendations', JSON.stringify(dismissed))
    }
  }

  return (
    <>
      {showRecommendation && (
        <DesktopRecommendation
          feature={feature}
          title={config.title}
          description={config.description}
          onContinue={handleContinue}
          onDismiss={handleDismiss}
        />
      )}
      {children}
    </>
  )
}

// Hook for programmatically showing desktop recommendations
export function useDesktopRecommendation() {
  const deviceInfo = useDeviceDetection()

  const showRecommendation = (feature: string, customConfig?: {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
  }) => {
    // Don't show on desktop
    if (deviceInfo.isDesktop) {
      return false
    }

    // Check if already dismissed
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    if (dismissedFeatures) {
      const dismissed = JSON.parse(dismissedFeatures)
      if (dismissed.includes(feature)) {
        return false
      }
    }

    return true
  }

  const dismissRecommendation = (feature: string) => {
    const dismissedFeatures = localStorage.getItem('dismissed-desktop-recommendations')
    const dismissed = dismissedFeatures ? JSON.parse(dismissedFeatures) : []
    if (!dismissed.includes(feature)) {
      dismissed.push(feature)
      localStorage.setItem('dismissed-desktop-recommendations', JSON.stringify(dismissed))
    }
  }

  const clearAllDismissals = () => {
    localStorage.removeItem('dismissed-desktop-recommendations')
  }

  return {
    showRecommendation,
    dismissRecommendation,
    clearAllDismissals,
    deviceInfo
  }
}

// Component for showing desktop recommendation badges
export function DesktopRecommendedBadge({ feature, className = "" }: { 
  feature: string
  className?: string 
}) {
  const deviceInfo = useDeviceDetection()

  if (deviceInfo.isDesktop) {
    return null
  }

  const config = featureConfigs[feature as keyof typeof featureConfigs]
  if (!config) {
    return null
  }

  const getBadgeColor = () => {
    switch (config.priority) {
      case 'high': return 'bg-red-600/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-amber-600/20 text-amber-400 border-amber-500/30'
      case 'low': return 'bg-blue-600/20 text-blue-400 border-blue-500/30'
      default: return 'bg-amber-600/20 text-amber-400 border-amber-500/30'
    }
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getBadgeColor()} ${className}`}>
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Desktop Recommended
    </div>
  )
}
