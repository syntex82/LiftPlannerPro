'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Admin emails - must match lib/subscription.ts
const ADMIN_EMAILS = ['mickyblenk@gmail.com', 'admin@liftplannerpro.org']

interface Video {
  id: string
  title: string
  videoUrl: string
  duration: number | null
}

interface Quiz {
  id: string
  title: string
  passingScore: number
  _count?: { questions: number }
}

interface Lesson {
  id: string
  title: string
  description: string | null
  order: number
  videos: Video[]
  quizzes: Quiz[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  category: string | null
  difficulty: string | null
  thumbnail: string | null
  isPublished: boolean
  isFeatured: boolean
  lessons: Lesson[]
  quizzes: Quiz[]
}

export default function EditCoursePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'lessons' | 'quizzes'>('details')
  const [error, setError] = useState('')
  
  // Lesson form
  const [newLesson, setNewLesson] = useState({ title: '', description: '' })
  const [addingLesson, setAddingLesson] = useState(false)
  
  // Video form
  const [newVideo, setNewVideo] = useState({ lessonId: '', title: '', videoUrl: '' })
  const [addingVideo, setAddingVideo] = useState(false)
  
  // Quiz form
  const [newQuiz, setNewQuiz] = useState({ title: '', passingScore: 80, lessonId: '' })
  const [addingQuiz, setAddingQuiz] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/admin/lms/courses/${courseId}`)
      return
    }

    // Check if user is admin
    const userEmail = session.user?.email?.toLowerCase() || ''
    if (!ADMIN_EMAILS.includes(userEmail)) {
      router.push('/lms/courses')
      return
    }

    setIsAdmin(true)
    fetchCourse()
  }, [session, status, courseId, router])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/lms/courses/${courseId}`)
      const data = await res.json()
      setCourse(data.course)
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCourse = async (updates: Partial<Course>) => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/lms/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to save course')
      await fetchCourse()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addLesson = async () => {
    if (!newLesson.title.trim()) return
    setAddingLesson(true)
    try {
      const res = await fetch(`/api/lms/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      })
      if (res.ok) {
        setNewLesson({ title: '', description: '' })
        await fetchCourse()
      }
    } catch (error) {
      console.error('Failed to add lesson:', error)
    } finally {
      setAddingLesson(false)
    }
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson and all its content?')) return
    try {
      await fetch(`/api/lms/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' })
      await fetchCourse()
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    }
  }

  const addVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim() || !newVideo.lessonId) return
    setAddingVideo(true)
    try {
      const res = await fetch(`/api/lms/courses/${courseId}/lessons/${newVideo.lessonId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newVideo.title, videoUrl: newVideo.videoUrl })
      })
      if (res.ok) {
        setNewVideo({ lessonId: '', title: '', videoUrl: '' })
        await fetchCourse()
      }
    } catch (error) {
      console.error('Failed to add video:', error)
    } finally {
      setAddingVideo(false)
    }
  }

  const addQuiz = async () => {
    if (!newQuiz.title.trim()) return
    setAddingQuiz(true)
    try {
      const res = await fetch('/api/lms/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuiz,
          courseId,
          lessonId: newQuiz.lessonId || undefined
        })
      })
      if (res.ok) {
        setNewQuiz({ title: '', passingScore: 80, lessonId: '' })
        await fetchCourse()
      }
    } catch (error) {
      console.error('Failed to add quiz:', error)
    } finally {
      setAddingQuiz(false)
    }
  }

  if (loading || !isAdmin) {
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
          <Link href="/admin/lms"><Button>Back to Courses</Button></Link>
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
              <Link href="/admin/lms" className="text-slate-400 hover:text-white text-sm">← Back to Courses</Link>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <span className={`text-sm ${course.isPublished ? 'text-green-400' : 'text-yellow-400'}`}>
                {course.isPublished ? '● Published' : '○ Draft'}
              </span>
            </div>
            <Button
              onClick={() => saveCourse({ isPublished: !course.isPublished })}
              disabled={saving}
              className={course.isPublished ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {(['details', 'lessons', 'quizzes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <Input
                  defaultValue={course.title}
                  onBlur={(e) => e.target.value !== course.title && saveCourse({ title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  defaultValue={course.description}
                  onBlur={(e) => e.target.value !== course.description && saveCourse({ description: e.target.value })}
                  className="w-full h-32 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                  <Input
                    type="number"
                    defaultValue={course.price}
                    onBlur={(e) => saveCourse({ price: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <Input
                    defaultValue={course.category || ''}
                    onBlur={(e) => saveCourse({ category: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                  <select
                    defaultValue={course.difficulty || 'beginner'}
                    onChange={(e) => saveCourse({ difficulty: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Add Lesson Form */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Lesson</h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Lesson title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={addLesson} disabled={addingLesson} className="bg-green-600">
                  {addingLesson ? 'Adding...' : 'Add Lesson'}
                </Button>
              </div>
            </Card>

            {/* Lessons List */}
            {course.lessons.map(lesson => (
              <Card key={lesson.id} className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{lesson.order}. {lesson.title}</h3>
                    <p className="text-slate-400 text-sm">{lesson.videos.length} videos, {lesson.quizzes.length} quizzes</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-400" onClick={() => deleteLesson(lesson.id)}>
                    Delete
                  </Button>
                </div>

                {/* Videos */}
                <div className="ml-4 space-y-2">
                  {lesson.videos.map(video => (
                    <div key={video.id} className="flex items-center gap-2 text-slate-300 bg-slate-700/50 p-2 rounded">
                      <span>▶</span>
                      <span>{video.title}</span>
                      <span className="text-slate-500 text-sm ml-auto">{video.videoUrl.substring(0, 40)}...</span>
                    </div>
                  ))}

                  {/* Add Video Form */}
                  {newVideo.lessonId === lesson.id ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Video title"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Video URL"
                        value={newVideo.videoUrl}
                        onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button onClick={addVideo} disabled={addingVideo} size="sm" className="bg-blue-600">Add</Button>
                      <Button onClick={() => setNewVideo({ lessonId: '', title: '', videoUrl: '' })} variant="outline" size="sm">Cancel</Button>
                    </div>
                  ) : (
                    <Button onClick={() => setNewVideo({ ...newVideo, lessonId: lesson.id })} variant="outline" size="sm" className="mt-2">
                      + Add Video
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Quiz</h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Quiz title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={newQuiz.lessonId}
                  onChange={(e) => setNewQuiz({ ...newQuiz, lessonId: e.target.value })}
                  className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Course-level quiz</option>
                  {course.lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
                <Button onClick={addQuiz} disabled={addingQuiz} className="bg-green-600">
                  {addingQuiz ? 'Adding...' : 'Add Quiz'}
                </Button>
              </div>
            </Card>

            {/* Course-level quizzes */}
            {course.quizzes.map(quiz => (
              <Card key={quiz.id} className="bg-purple-900/30 border-purple-600/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300">{quiz.title}</h3>
                    <p className="text-purple-400 text-sm">Passing: {quiz.passingScore}% • Course-level</p>
                  </div>
                  <Link href={`/admin/lms/quizzes/${quiz.id}`}>
                    <Button variant="outline" size="sm">Edit Questions</Button>
                  </Link>
                </div>
              </Card>
            ))}

            {/* Lesson quizzes */}
            {course.lessons.filter(l => l.quizzes.length > 0).map(lesson => (
              <div key={lesson.id}>
                <h4 className="text-slate-400 text-sm mb-2">{lesson.title}</h4>
                {lesson.quizzes.map(quiz => (
                  <Card key={quiz.id} className="bg-purple-900/20 border-purple-600/20 p-4 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-purple-300">{quiz.title}</h3>
                        <p className="text-purple-400 text-sm">Passing: {quiz.passingScore}%</p>
                      </div>
                      <Link href={`/admin/lms/quizzes/${quiz.id}`}>
                        <Button variant="outline" size="sm">Edit Questions</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

