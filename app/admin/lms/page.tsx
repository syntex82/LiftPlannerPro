'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Course {
  id: string
  title: string
  slug: string
  price: number
  currency: string
  isPublished: boolean
  isFeatured: boolean
  _count: { lessons: number; enrollments: number; quizzes: number }
  createdAt: string
}

export default function AdminLMSPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/admin/lms')
      return
    }
    fetchCourses()
  }, [session, status])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lms/courses?includeDrafts=true')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (courseId: string, publish: boolean) => {
    try {
      await fetch(`/api/lms/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: publish })
      })
      fetchCourses()
    } catch (error) {
      console.error('Failed to update course:', error)
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return
    try {
      await fetch(`/api/lms/courses/${courseId}`, { method: 'DELETE' })
      fetchCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price)
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-slate-400 hover:text-white text-sm">← Admin</Link>
              <h1 className="text-2xl font-bold text-white">LMS Course Management</h1>
            </div>
            <Link href="/admin/lms/courses/new">
              <Button className="bg-green-600 hover:bg-green-700">+ New Course</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <Input 
            placeholder="Search courses..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Courses</p>
            <p className="text-3xl font-bold text-white">{courses.length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Published</p>
            <p className="text-3xl font-bold text-green-400">{courses.filter(c => c.isPublished).length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Drafts</p>
            <p className="text-3xl font-bold text-yellow-400">{courses.filter(c => !c.isPublished).length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Enrollments</p>
            <p className="text-3xl font-bold text-blue-400">{courses.reduce((sum, c) => sum + c._count.enrollments, 0)}</p>
          </Card>
        </div>

        {/* Course Table */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 p-4">Course</th>
                <th className="text-left text-slate-300 p-4">Price</th>
                <th className="text-center text-slate-300 p-4">Lessons</th>
                <th className="text-center text-slate-300 p-4">Enrollments</th>
                <th className="text-center text-slate-300 p-4">Status</th>
                <th className="text-right text-slate-300 p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="p-4">
                    <p className="text-white font-medium">{course.title}</p>
                    <p className="text-slate-400 text-sm">{course.slug}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400">{formatPrice(course.price, course.currency)}</span>
                  </td>
                  <td className="p-4 text-center text-slate-300">{course._count.lessons}</td>
                  <td className="p-4 text-center text-slate-300">{course._count.enrollments}</td>
                  <td className="p-4 text-center">
                    {course.isPublished ? (
                      <span className="bg-green-600/30 text-green-400 px-2 py-1 rounded text-sm">Published</span>
                    ) : (
                      <span className="bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded text-sm">Draft</span>
                    )}
                    {course.isFeatured && (
                      <span className="bg-purple-600/30 text-purple-400 px-2 py-1 rounded text-sm ml-2">Featured</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/lms/courses/${course.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish(course.id, !course.isPublished)}
                        className={course.isPublished ? 'text-yellow-400 border-yellow-400' : 'text-green-400 border-green-400'}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400 hover:bg-red-400/20"
                        onClick={() => deleteCourse(course.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No courses found. Create your first course!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

