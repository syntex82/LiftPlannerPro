'use client'

import Script from 'next/script'

const GA_TRACKING_ID = 'G-2RB6SYH1GV'

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Helper function to track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Helper function to track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Helper function to track user interactions
export const trackUserInteraction = (element: string, action: string) => {
  trackEvent(action, 'User Interaction', element)
}

// Helper function to track CAD operations
export const trackCADOperation = (operation: string, details?: string) => {
  trackEvent(operation, 'CAD Operations', details)
}

// Helper function to track LMS activities
export const trackLMSActivity = (activity: string, course?: string) => {
  trackEvent(activity, 'LMS Activities', course)
}

// Helper function to track authentication events
export const trackAuthEvent = (event: string, method?: string) => {
  trackEvent(event, 'Authentication', method)
}

// Helper function to track subscription events
export const trackSubscriptionEvent = (event: string, plan?: string) => {
  trackEvent(event, 'Subscription', plan)
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: {
        page_title?: string
        page_location?: string
        event_category?: string
        event_label?: string
        value?: number
      }
    ) => void
  }
}
