'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatNotification {
  id: string
  message: string
  username: string
  roomName: string
  timestamp: Date
}

export default function ChatNotifications() {
  const [notifications, setNotifications] = useState<ChatNotification[]>([])
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted')
        })
      }
    }
  }, [])

  const showNotification = (notification: ChatNotification) => {
    if (hasPermission && document.hidden) {
      new Notification(`${notification.username} in ${notification.roomName}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }

    // Add to in-app notifications
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep last 5

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {/* In-App Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg max-w-sm animate-slide-in"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {notification.username}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {notification.roomName}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm break-words">
                    {notification.message}
                  </p>
                  <span className="text-slate-500 text-xs">
                    {notification.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-white p-1 h-auto flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Permission Request */}
      {!hasPermission && 'Notification' in window && Notification.permission !== 'denied' && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">Enable Chat Notifications</p>
              <p className="text-blue-100 text-xs">Get notified of new messages</p>
            </div>
            <Button
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  setHasPermission(permission === 'granted')
                })
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 text-sm px-3 py-1"
            >
              Enable
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
