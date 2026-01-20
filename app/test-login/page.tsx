'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🔄 Testing login...')
      
      // Test login
      const loginResult = await signIn('credentials', {
        email: 'mickyblenk@gmail.com',
        password: 'syntex82',
        redirect: false,
      })
      
      console.log('Login result:', loginResult)
      setResult(loginResult)
      
      // Get session after login
      if (loginResult?.ok) {
        const sessionData = await getSession()
        console.log('Session data:', sessionData)
        setSession(sessionData)
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setResult({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const sessionData = await getSession()
    console.log('Current session:', sessionData)
    setSession(sessionData)
  }

  const goToAdmin = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">🧪 Login Debug Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Testing Login...' : '🔑 Test Login'}
          </button>
          
          <button
            onClick={checkSession}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
          >
            📋 Check Session
          </button>
          
          <button
            onClick={goToAdmin}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-2"
          >
            🎯 Go to Admin
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">Login Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {session && (
          <div className="mt-6 p-4 bg-green-50 rounded">
            <h3 className="font-bold mb-2">Current Session:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-bold mb-2">Test Credentials:</h3>
          <p><strong>Email:</strong> mickyblenk@gmail.com</p>
          <p><strong>Password:</strong> syntex82</p>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded">
          <h3 className="font-bold mb-2">Debug Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Login" to attempt authentication</li>
            <li>Check browser console for any errors</li>
            <li>Check "Login Result" for response details</li>
            <li>If successful, click "Check Session" to verify session</li>
            <li>If session exists, click "Go to Admin" to test admin access</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-red-50 rounded">
          <h3 className="font-bold mb-2">Common Issues:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Database not connected:</strong> Run database migration</li>
            <li><strong>User not found:</strong> Run setup-admin-user.js script</li>
            <li><strong>Wrong password:</strong> Password hash mismatch</li>
            <li><strong>Environment variables:</strong> Check NEXTAUTH_SECRET</li>
            <li><strong>Session issues:</strong> Clear browser cookies</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
