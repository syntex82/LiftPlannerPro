'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { trackPageView, trackEvent } from './google-analytics'

interface VisitorTrackerProps {
  pageName: string
  category?: string
}

export default function VisitorTracker({ pageName, category = 'Page View' }: VisitorTrackerProps) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Track page view in Google Analytics
    trackPageView(window.location.href, pageName)

    // Track additional visitor data
    const trackVisitorData = async () => {
      try {
        // Get visitor information
        const visitorData = {
          page: pageName,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          isAuthenticated: status === 'authenticated',
          userId: session?.user?.id || null,
          sessionId: generateSessionId(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          screen: {
            width: screen.width,
            height: screen.height
          }
        }

        // Track in Google Analytics
        trackEvent('page_view', category, pageName)
        
        if (status === 'authenticated') {
          trackEvent('authenticated_page_view', category, pageName)
        } else {
          trackEvent('anonymous_page_view', category, pageName)
        }

        // Send to our backend for database tracking
        await fetch('/api/analytics/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(visitorData)
        }).catch(error => {
          // Silently fail - don't break the user experience
          console.debug('Visitor tracking failed:', error)
        })

      } catch (error) {
        console.debug('Visitor tracking error:', error)
      }
    }

    // Track after a short delay to ensure page is loaded
    const timer = setTimeout(trackVisitorData, 1000)

    return () => clearTimeout(timer)
  }, [pageName, category, session, status])

  // Track user interactions
  useEffect(() => {
    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      const elementType = target.tagName.toLowerCase()
      const elementText = target.textContent?.slice(0, 50) || ''
      const elementId = target.id || ''
      const elementClass = target.className || ''

      // Track significant interactions
      if (['button', 'a', 'input', 'select'].includes(elementType)) {
        trackEvent('user_interaction', 'UI Interaction', `${elementType}:${elementText}`)
      }
    }

    // Add event listeners for user interactions
    document.addEventListener('click', trackInteraction)
    document.addEventListener('submit', trackInteraction)

    return () => {
      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('submit', trackInteraction)
    }
  }, [])

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          trackEvent('scroll_depth', 'Engagement', `${scrollPercent}%`)
        }
      }
    }

    window.addEventListener('scroll', trackScrollDepth)
    return () => window.removeEventListener('scroll', trackScrollDepth)
  }, [])

  // Track time on page
  useEffect(() => {
    const startTime = Date.now()

    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      
      // Track time milestones
      if ([30, 60, 120, 300].includes(timeSpent)) {
        trackEvent('time_on_page', 'Engagement', `${timeSpent}s`)
      }
    }

    const interval = setInterval(trackTimeOnPage, 10000) // Check every 10 seconds

    return () => {
      clearInterval(interval)
      // Track final time on page
      const finalTime = Math.round((Date.now() - startTime) / 1000)
      if (finalTime > 5) { // Only track if user spent more than 5 seconds
        trackEvent('page_exit', 'Engagement', `${finalTime}s`)
      }
    }
  }, [])

  return null // This component doesn't render anything
}

// Helper function to generate a session ID
function generateSessionId(): string {
  // Check if we already have a session ID in sessionStorage
  let sessionId = sessionStorage.getItem('visitor_session_id')
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = 'vs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('visitor_session_id', sessionId)
  }
  
  return sessionId
}

// Export helper functions for manual tracking
export const trackCustomEvent = (action: string, category: string, label?: string) => {
  trackEvent(action, category, label)
}

export const trackConversion = (type: string, value?: number) => {
  trackEvent('conversion', 'Business', type, value)
}

export const trackFeatureUsage = (feature: string, action: string) => {
  trackEvent(action, 'Feature Usage', feature)
}
