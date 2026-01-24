'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EnrolledCourse {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  _count: { lessons: number }
  progress?: { progress: number; completed: boolean }
}

interface RecentCertificate {
  id: string
  certificateNumber: string
  courseName: string
  completionDate: string
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [certificates, setCertificates] = useState<RecentCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/lms/dashboard')
      return
    }
    loadData()
  }, [session, status])

  const loadData = async () => {
    try {
      // Fetch enrolled courses
      const coursesRes = await fetch('/api/lms/courses?enrolled=true')
      const coursesData = await coursesRes.json()
      setEnrolledCourses(coursesData.courses || [])

      // Fetch certificates
      const certsRes = await fetch('/api/lms/certificates')
      const certsData = await certsRes.json()
      setCertificates(certsData.certificates?.slice(0, 3) || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  const inProgressCourses = enrolledCourses.filter(c => !c.progress?.completed)
  const completedCourses = enrolledCourses.filter(c => c.progress?.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">My Learning Dashboard</h1>
          <p className="text-slate-400">Welcome back, {session?.user?.name || 'Student'}!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Enrolled Courses</p>
            <p className="text-3xl font-bold text-white">{enrolledCourses.length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-yellow-400">{inProgressCourses.length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400">{completedCourses.length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Certificates Earned</p>
            <p className="text-3xl font-bold text-blue-400">{certificates.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Continue Learning</h2>
            {inProgressCourses.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                <p className="text-slate-400 mb-4">No courses in progress</p>
                <Link href="/lms/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {inProgressCourses.map(course => (
                  <Card key={course.id} className="bg-slate-800/50 border-slate-700 p-4">
                    <div className="flex gap-4">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{course.title}</h3>
                        <p className="text-slate-400 text-sm">{course._count.lessons} lessons</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all" 
                              style={{ width: `${course.progress?.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-slate-400 text-sm">{course.progress?.progress || 0}%</span>
                        </div>
                      </div>
                      <Link href={`/lms/courses/${course.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">Continue</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Certificates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Certificates</h2>
              <Link href="/lms/certificates" className="text-blue-400 text-sm hover:underline">View All</Link>
            </div>
            {certificates.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <p className="text-slate-400 text-sm">Complete courses to earn certificates</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {certificates.map(cert => (
                  <Link key={cert.id} href={`/lms/certificates/${cert.id}`}>
                    <Card className="bg-slate-800/50 border-slate-700 p-4 hover:border-yellow-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h4 className="text-white text-sm font-medium">{cert.courseName}</h4>
                          <p className="text-slate-500 text-xs">{formatDate(cert.completionDate)}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Completed Courses */}
            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Completed Courses</h2>
            {completedCourses.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <p className="text-slate-400 text-sm">No completed courses yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedCourses.map(course => (
                  <Link key={course.id} href={`/lms/courses/${course.id}`}>
                    <Card className="bg-green-900/30 border-green-600/30 p-4 hover:bg-green-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">✓</span>
                        <div>
                          <h4 className="text-white text-sm font-medium">{course.title}</h4>
                          <p className="text-green-400 text-xs">Completed</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

