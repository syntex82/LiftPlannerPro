'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export default function SecurityThreatsDiagnostic() {
  const { data: session, status } = useSession()
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      session: {},
      apiTest: {},
      adminCheck: {}
    }

    try {
      // Check session status
      console.log('🔍 Running security threats diagnostic...')
      
      results.session = {
        status: status,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasEmail: !!session?.user?.email,
        email: session?.user?.email,
        role: session?.user?.role,
        expires: session?.expires
      }

      // Test API endpoint
      try {
        console.log('📡 Testing security threats API...')
        const response = await fetch('/api/admin/security/threats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        results.apiTest = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        }

        if (response.ok) {
          const data = await response.json()
          results.apiTest.data = data
        } else {
          try {
            const errorData = await response.json()
            results.apiTest.error = errorData
          } catch {
            results.apiTest.error = { message: 'Could not parse error response' }
          }
        }
      } catch (apiError: any) {
        results.apiTest.error = {
          message: apiError.message,
          name: apiError.name
        }
      }

      // Check admin status
      const adminEmails = ['mickyblenk@gmail.com', 'admin@liftplannerpro.org']
      results.adminCheck = {
        userEmail: session?.user?.email,
        adminEmails,
        isAdmin: session?.user?.email ? adminEmails.includes(session.user.email) : false
      }

      setDiagnosticResults(results)
      console.log('✅ Diagnostic complete:', results)

    } catch (error: any) {
      console.error('❌ Diagnostic error:', error)
      results.error = {
        message: error.message,
        name: error.name
      }
      setDiagnosticResults(results)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )
  }

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          Security Threats Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-300">
            Run diagnostic to troubleshoot security threats API issues
          </p>
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Run Diagnostic
          </Button>
        </div>

        {diagnosticResults && (
          <div className="space-y-4 mt-6">
            <div className="text-xs text-slate-500">
              Last run: {new Date(diagnosticResults.timestamp).toLocaleString()}
            </div>

            {/* Session Status */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Session Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session Status:</span>
                  <Badge variant="outline">{diagnosticResults.session.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Has Session:</span>
                  {getStatusIcon(diagnosticResults.session.hasSession)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Has User:</span>
                  {getStatusIcon(diagnosticResults.session.hasUser)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Has Email:</span>
                  {getStatusIcon(diagnosticResults.session.hasEmail)}
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white text-xs">{diagnosticResults.session.email || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Admin Check */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Admin Privileges
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Is Admin:</span>
                  {getStatusBadge(diagnosticResults.adminCheck.isAdmin, 'Admin', 'Not Admin')}
                </div>
                <div className="text-xs text-slate-500">
                  Admin emails: {diagnosticResults.adminCheck.adminEmails.join(', ')}
                </div>
              </div>
            </div>

            {/* API Test Results */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                API Test Results
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant={diagnosticResults.apiTest.ok ? "default" : "destructive"}>
                    {diagnosticResults.apiTest.status} {diagnosticResults.apiTest.statusText}
                  </Badge>
                </div>
                {diagnosticResults.apiTest.error && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded p-2">
                    <div className="text-red-400 font-medium">Error:</div>
                    <div className="text-red-300 text-xs">
                      {JSON.stringify(diagnosticResults.apiTest.error, null, 2)}
                    </div>
                  </div>
                )}
                {diagnosticResults.apiTest.data && (
                  <div className="bg-green-900/20 border border-green-500/20 rounded p-2">
                    <div className="text-green-400 font-medium">Success:</div>
                    <div className="text-green-300 text-xs">
                      Threats: {diagnosticResults.apiTest.data.threats?.length || 0}, 
                      Total: {diagnosticResults.apiTest.data.total || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Recommendations:</h4>
              <div className="text-sm text-blue-300 space-y-1">
                {!diagnosticResults.session.hasSession && (
                  <div>• User needs to log in</div>
                )}
                {!diagnosticResults.adminCheck.isAdmin && diagnosticResults.session.hasEmail && (
                  <div>• User email not in admin list - add to adminEmails array</div>
                )}
                {diagnosticResults.apiTest.status === 401 && (
                  <div>• Session expired - user needs to re-authenticate</div>
                )}
                {diagnosticResults.apiTest.status === 403 && (
                  <div>• User lacks admin privileges</div>
                )}
                {diagnosticResults.apiTest.status === 404 && (
                  <div>• User not found in database - check user registration</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
