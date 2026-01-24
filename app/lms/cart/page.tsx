'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CartCourse {
  id: string
  title: string
  thumbnail: string | null
  price: number
  currency: string
  instructor: { name: string | null }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/lms/cart')
      return
    }
    loadCart()
  }, [session, status])

  const loadCart = async () => {
    try {
      // Get cart from localStorage
      const cartIds = JSON.parse(localStorage.getItem('lmsCart') || '[]')
      if (cartIds.length === 0) {
        setCartItems([])
        setLoading(false)
        return
      }

      // Fetch course details for cart items
      const courses: CartCourse[] = []
      for (const id of cartIds) {
        try {
          const res = await fetch(`/api/lms/courses/${id}`)
          if (res.ok) {
            const data = await res.json()
            if (data.course) {
              courses.push(data.course)
            }
          }
        } catch (e) {
          console.error('Failed to fetch course:', id)
        }
      }
      setCartItems(courses)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = (courseId: string) => {
    const cartIds = JSON.parse(localStorage.getItem('lmsCart') || '[]')
    const updated = cartIds.filter((id: string) => id !== courseId)
    localStorage.setItem('lmsCart', JSON.stringify(updated))
    setCartItems(cartItems.filter(c => c.id !== courseId))
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/lms/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: cartItems.map(c => c.id) })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        // Clear cart after starting checkout
        localStorage.setItem('lmsCart', '[]')
        window.location.href = data.checkoutUrl
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price)
  }

  const total = cartItems.reduce((sum, c) => sum + c.price, 0)
  const currency = cartItems[0]?.currency || 'GBP'

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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/lms/courses" className="text-slate-400 hover:text-white text-sm">← Continue Shopping</Link>
          <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">Your cart is empty</p>
            <Link href="/lms/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(course => (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 p-4">
                  <div className="flex gap-4">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{course.title}</h3>
                      {course.instructor?.name && (
                        <p className="text-slate-400 text-sm">By {course.instructor.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{formatPrice(course.price, course.currency)}</p>
                      <button onClick={() => removeFromCart(course.id)} className="text-red-400 text-sm hover:underline mt-1">
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-slate-800/50 border-slate-700 p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>{cartItems.length} course{cartItems.length !== 1 ? 's' : ''}</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                  <hr className="border-slate-700" />
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                >
                  {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                <p className="text-slate-500 text-xs mt-2 text-center">
                  Secure payment via Stripe
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

