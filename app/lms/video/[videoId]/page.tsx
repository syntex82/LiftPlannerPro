'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Video {
  id: string
  title: string
  description: string | null
  videoUrl: string
  duration: number | null
  lesson: {
    id: string
    title: string
    courseId: string
    course: { id: string; title: string }
  }
}

export default function VideoPlayerPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const videoId = params?.videoId as string
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ watchedSeconds: 0, completed: false })
  const [lastSaved, setLastSaved] = useState(0)

  useEffect(() => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/lms/video/${videoId}`)
      return
    }
    fetchVideo()
    fetchProgress()
  }, [videoId, session])

  const fetchVideo = async () => {
    try {
      // We need to get video details - create a simple API or fetch from lesson
      // For now, we'll need to create a video details endpoint
      const res = await fetch(`/api/lms/videos/${videoId}`)
      if (res.ok) {
        const data = await res.json()
        setVideo(data.video)
      }
    } catch (error) {
      console.error('Failed to fetch video:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/lms/videos/${videoId}/progress`)
      if (res.ok) {
        const data = await res.json()
        if (data.progress) {
          setProgress({
            watchedSeconds: data.progress.watchedSeconds || 0,
            completed: data.progress.completed || false
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const saveProgress = async (currentTime: number, duration: number) => {
    // Only save every 5 seconds to avoid too many requests
    if (currentTime - lastSaved < 5) return
    setLastSaved(currentTime)
    
    try {
      await fetch(`/api/lms/videos/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          watchedSeconds: Math.round(currentTime),
          totalSeconds: Math.round(duration)
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const { currentTime, duration } = videoRef.current
    saveProgress(currentTime, duration)
  }

  const handleVideoEnd = async () => {
    if (!videoRef.current) return
    const { duration } = videoRef.current
    await saveProgress(duration, duration)
    setProgress(prev => ({ ...prev, completed: true }))
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current && progress.watchedSeconds > 0) {
      videoRef.current.currentTime = progress.watchedSeconds
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Video Not Found</h1>
          <Link href="/lms/courses"><Button>Back to Courses</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/lms/courses/${video.lesson.courseId}`} className="text-slate-400 hover:text-white text-sm">
                ← {video.lesson.course.title}
              </Link>
              <h1 className="text-xl font-bold text-white">{video.title}</h1>
            </div>
            {progress.completed && (
              <span className="bg-green-600/30 text-green-400 px-3 py-1 rounded-full text-sm">✓ Completed</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            className="w-full aspect-video bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onLoadedMetadata={handleLoadedMetadata}
          />
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2">{video.title}</h2>
            {video.description && <p className="text-slate-400">{video.description}</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}

