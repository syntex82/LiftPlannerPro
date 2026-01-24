'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Lesson {
  id: string
  title: string
  description: string | null
  order: number
  duration: number | null
  videos: { id: string; title: string; duration: number | null }[]
  quizzes: { id: string; title: string }[]
  progress?: { completed: boolean }
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  thumbnail: string | null
  category: string | null
  difficulty: string | null
  duration: number | null
  instructor: { name: string | null; image: string | null }
  lessons: Lesson[]
  quizzes: { id: string; title: string; passingScore: number }[]
  isEnrolled?: boolean
  progress?: { progress: number; completed: boolean }
}

export default function CourseDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/lms/courses/${courseId}`)
      const data = await res.json()
      setCourse(data.course)
      if (data.course?.lessons?.[0]) {
        setActiveLesson(data.course.lessons[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/lms/courses/${courseId}`)
      return
    }
    setEnrolling(true)
    try {
      if (course?.price === 0) {
        // Free course - enroll directly
        const res = await fetch(`/api/lms/courses/${courseId}/enroll`, { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          fetchCourse() // Refresh to show enrolled state
        }
      } else {
        // Paid course - go to checkout
        const res = await fetch('/api/lms/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseIds: [courseId] })
        })
        const data = await res.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ''
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
          <Link href="/lms/courses"><Button>Back to Courses</Button></Link>
        </div>
      </div>
    )
  }

  const currentLesson = course.lessons.find(l => l.id === activeLesson)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/lms/courses" className="text-slate-400 hover:text-white">← Courses</Link>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
            </div>
            {course.isEnrolled && course.progress && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${course.progress.progress}%` }} />
                </div>
                <span className="text-sm text-slate-400">{course.progress.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => course.isEnrolled && setActiveLesson(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeLesson === lesson.id
                        ? 'bg-blue-600/30 border border-blue-500'
                        : course.isEnrolled
                          ? 'bg-slate-700/50 hover:bg-slate-700'
                          : 'bg-slate-700/30 opacity-60 cursor-not-allowed'
                    }`}
                    disabled={!course.isEnrolled}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{idx + 1}. {lesson.title}</span>
                      {lesson.progress?.completed && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      {lesson.videos.length > 0 && <span>{lesson.videos.length} videos</span>}
                      {lesson.quizzes.length > 0 && <span>{lesson.quizzes.length} quiz</span>}
                      {lesson.duration && <span>{formatDuration(lesson.duration)}</span>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Course Quizzes */}
              {course.quizzes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Final Assessments</h3>
                  {course.quizzes.map(quiz => (
                    <Link
                      key={quiz.id}
                      href={course.isEnrolled ? `/lms/quiz/${quiz.id}` : '#'}
                      className={course.isEnrolled ? '' : 'pointer-events-none'}
                    >
                      <div className="p-3 bg-purple-600/20 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors">
                        <span className="text-purple-300 text-sm">{quiz.title}</span>
                        <span className="text-purple-400 text-xs ml-2">({quiz.passingScore}% to pass)</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!course.isEnrolled ? (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-64 object-cover rounded-lg mb-6" />
                )}
                <h2 className="text-2xl font-bold text-white mb-4">{course.title}</h2>
                <p className="text-slate-400 mb-6">{course.description}</p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-green-400">{formatPrice(course.price, course.currency)}</span>
                </div>
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Purchase Course'}
                </Button>
              </Card>
            ) : currentLesson ? (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">{currentLesson.title}</h2>
                {currentLesson.description && (
                  <p className="text-slate-400 mb-6">{currentLesson.description}</p>
                )}

                {/* Video List */}
                {currentLesson.videos.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-medium text-slate-400">Videos</h3>
                    {currentLesson.videos.map((video, idx) => (
                      <Link key={video.id} href={`/lms/video/${video.id}`}>
                        <div className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-4">
                          <span className="text-blue-400">▶</span>
                          <span className="text-white">{video.title}</span>
                          {video.duration && <span className="text-slate-500 text-sm ml-auto">{formatDuration(video.duration)}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Lesson Quizzes */}
                {currentLesson.quizzes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400">Quizzes</h3>
                    {currentLesson.quizzes.map(quiz => (
                      <Link key={quiz.id} href={`/lms/quiz/${quiz.id}`}>
                        <div className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors">
                          <span className="text-purple-300">{quiz.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                <p className="text-slate-400">No lessons available yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

