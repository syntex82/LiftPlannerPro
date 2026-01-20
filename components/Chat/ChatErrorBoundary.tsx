'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react'

interface ChatErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ChatErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ChatErrorBoundary extends React.Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <CardTitle className="text-white text-sm">Chat Error</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Unable to load chat system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => this.setState({ hasError: false })}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Retry
              </Button>
              
              <div className="text-center">
                <p className="text-slate-500 text-xs">
                  Chat will be restored shortly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Functional component wrapper for easier use
export default function ChatErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChatErrorBoundary
      fallback={
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-white text-sm font-medium">Chat Unavailable</p>
              <p className="text-slate-400 text-xs">Please refresh to try again</p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ChatErrorBoundary>
  )
}
