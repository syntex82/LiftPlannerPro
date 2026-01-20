import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-slate-800/50 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-blue-400/20 rounded-full"></div>
          </div>
          <p className="text-white font-medium mt-4">Loading...</p>
          <p className="text-slate-400 text-sm mt-1">Please wait while we load your content</p>
        </CardContent>
      </Card>
    </div>
  )
}
