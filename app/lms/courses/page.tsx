'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  isFeatured: boolean
  isPublished: boolean
  instructor: { name: string | null; image: string | null }
  _count: { lessons: number; enrollments: number }
  isEnrolled?: boolean
}

export default function CourseCatalogPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [cart, setCart] = useState<string[]>([])

  useEffect(() => {
    fetchCourses()
    // Load cart from localStorage
    const savedCart = localStorage.getItem('lms-cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lms/courses')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (courseId: string) => {
    const newCart = [...cart, courseId]
    setCart(newCart)
    localStorage.setItem('lms-cart', JSON.stringify(newCart))
  }

  const removeFromCart = (courseId: string) => {
    const newCart = cart.filter(id => id !== courseId)
    setCart(newCart)
    localStorage.setItem('lms-cart', JSON.stringify(newCart))
  }

  const handleCheckout = async () => {
    if (!session) {
      window.location.href = '/auth/signin?callbackUrl=/lms/courses'
      return
    }
    try {
      const res = await fetch('/api/lms/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: cart })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || course.category === categoryFilter
    const matchesDifficulty = !difficultyFilter || course.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))]
  const difficulties = [...new Set(courses.map(c => c.difficulty).filter(Boolean))]

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price)
  }

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
              <Link href="/" className="text-xl font-bold text-white">LiftPlannerPro</Link>
              <span className="ml-4 text-blue-400">Training Courses</span>
            </div>
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <Button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700">
                  Checkout ({cart.length}) - {formatPrice(
                    courses.filter(c => cart.includes(c.id)).reduce((sum, c) => sum + c.price, 0),
                    'GBP'
                  )}
                </Button>
              )}
              <Link href="/lms">
                <Button variant="outline">Back to LMS</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-slate-800 border-slate-600 text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat!}>{cat}</option>)}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
          >
            <option value="">All Levels</option>
            {difficulties.map(d => <option key={d} value={d!}>{d}</option>)}
          </select>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No courses found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-blue-500 transition-colors">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {course.category && (
                      <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">{course.category}</span>
                    )}
                    {course.difficulty && (
                      <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">{course.difficulty}</span>
                    )}
                    {course.isFeatured && (
                      <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span>{course._count.lessons} lessons</span>
                    {course.duration && <span>{Math.round(course.duration / 60)} min</span>}
                    <span>{course._count.enrollments} enrolled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-400">{formatPrice(course.price, course.currency)}</span>
                    {course.isEnrolled ? (
                      <Link href={`/lms/courses/${course.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">Continue</Button>
                      </Link>
                    ) : cart.includes(course.id) ? (
                      <Button variant="outline" onClick={() => removeFromCart(course.id)}>Remove</Button>
                    ) : course.price === 0 ? (
                      <Link href={`/lms/courses/${course.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700">Enroll Free</Button>
                      </Link>
                    ) : (
                      <Button onClick={() => addToCart(course.id)} className="bg-blue-600 hover:bg-blue-700">
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

