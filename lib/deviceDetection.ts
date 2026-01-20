import { useState, useEffect } from 'react'

// Device type detection
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  touchSupport: boolean
  userAgent: string
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const

// Hook for device detection
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape',
    touchSupport: false,
    userAgent: ''
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < BREAKPOINTS.mobile
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
      const isDesktop = width >= BREAKPOINTS.tablet
      const orientation = width > height ? 'landscape' : 'portrait'
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        touchSupport,
        userAgent: navigator.userAgent
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Check if feature requires desktop
export function isDesktopOnlyFeature(feature: string): boolean {
  const desktopOnlyFeatures = [
    'cad-editor',
    'advanced-calculations',
    'complex-drawings',
    'file-management',
    'detailed-reports'
  ]
  
  return desktopOnlyFeatures.includes(feature)
}

// Get responsive class names
export function getResponsiveClasses(baseClasses: string): string {
  return `${baseClasses} 
    mobile:px-2 mobile:py-1 mobile:text-sm
    tablet:px-4 tablet:py-2 tablet:text-base
    desktop:px-6 desktop:py-3 desktop:text-lg`
}

// Check if current device can handle feature
export function canHandleFeature(feature: string, deviceInfo: DeviceInfo): boolean {
  if (isDesktopOnlyFeature(feature)) {
    return deviceInfo.isDesktop
  }
  return true
}

// Get device-specific message
export function getDeviceMessage(feature: string, deviceInfo: DeviceInfo): string | null {
  if (isDesktopOnlyFeature(feature) && !deviceInfo.isDesktop) {
    return `${feature.replace('-', ' ').toUpperCase()} requires a desktop computer for optimal experience. Please use a desktop or laptop computer to access this feature.`
  }
  return null
}

// Responsive grid classes
export function getResponsiveGrid(columns: { mobile: number, tablet: number, desktop: number }): string {
  return `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`
}

// Responsive text sizes
export function getResponsiveText(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'): string {
  const sizeMap = {
    xs: 'text-xs md:text-sm lg:text-base',
    sm: 'text-sm md:text-base lg:text-lg',
    base: 'text-base md:text-lg lg:text-xl',
    lg: 'text-lg md:text-xl lg:text-2xl',
    xl: 'text-xl md:text-2xl lg:text-3xl',
    '2xl': 'text-2xl md:text-3xl lg:text-4xl'
  }
  return sizeMap[size]
}

// Responsive spacing
export function getResponsiveSpacing(size: 'sm' | 'md' | 'lg'): string {
  const spacingMap = {
    sm: 'p-2 md:p-4 lg:p-6',
    md: 'p-4 md:p-6 lg:p-8',
    lg: 'p-6 md:p-8 lg:p-12'
  }
  return spacingMap[size]
}

// Check if device is mobile browser
export function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile'
  ]
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

// Get optimal layout for device
export function getOptimalLayout(deviceInfo: DeviceInfo): 'mobile' | 'tablet' | 'desktop' {
  if (deviceInfo.isMobile) return 'mobile'
  if (deviceInfo.isTablet) return 'tablet'
  return 'desktop'
}

// Touch-friendly button sizes
export function getTouchFriendlySize(deviceInfo: DeviceInfo): string {
  if (deviceInfo.touchSupport) {
    return 'min-h-[44px] min-w-[44px] p-3' // Apple's recommended touch target size
  }
  return 'p-2'
}
