'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, AlertTriangle, Settings, BarChart3, Activity, Lock, FileText, Wrench, DollarSign, Globe, CreditCard, Eye } from "lucide-react"
import VisitorAnalytics from '@/components/admin/visitor-analytics'
import UserManagement from '@/components/admin/UserManagement'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [issues, setIssues] = useState([])
  const [stats, setStats] = useState<any>(null)
  const [securityLogs, setSecurityLogs] = useState([])
  const [threats, setThreats] = useState([])
  const [billingData, setBillingData] = useState<any>(null)
  const [firewallConfig, setFirewallConfig] = useState<any>(null)
  const [stripeCustomers, setStripeCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Admin email list
  const adminEmails = [
    'mickyblenk@gmail.com',
    'admin@liftplannerpro.org'
  ]

  const isAdmin = (email: string | null | undefined) => {
    return email && adminEmails.includes(email)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (!isAdmin(session?.user?.email)) {
        router.push('/dashboard')
        return
      }
      loadData()
    }
  }, [status, session, router])

  const loadData = async () => {
    setIsLoading(true)
    console.log('🔄 Loading admin data...')
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch issues
      const issuesResponse = await fetch('/api/issues')
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setIssues(issuesData.issues || [])
      }

      // Fetch admin stats
      console.log('📊 Fetching admin stats...')
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 Stats data:', statsData)
        setStats(statsData)
      } else {
        console.error('❌ Stats API failed:', statsResponse.status)
      }

      // Fetch security logs
      const securityResponse = await fetch('/api/admin/security-logs')
      if (securityResponse.ok) {
        const securityData = await securityResponse.json()
        setSecurityLogs(securityData.logs || [])
      }

      // Fetch security threats
      const threatsResponse = await fetch('/api/admin/security/threats')
      if (threatsResponse.ok) {
        const threatsData = await threatsResponse.json()
        setThreats(threatsData.threats || [])
      }

      // Fetch billing data
      const billingResponse = await fetch('/api/admin/billing')
      if (billingResponse.ok) {
        const billingDataResponse = await billingResponse.json()
        setBillingData(billingDataResponse)
      }

      // Fetch firewall config
      const firewallResponse = await fetch('/api/admin/firewall')
      if (firewallResponse.ok) {
        const firewallData = await firewallResponse.json()
        setFirewallConfig(firewallData)
      }

      // Fetch Stripe customers
      const customersResponse = await fetch('/api/admin/stripe?type=customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setStripeCustomers(customersData.customers || [])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleWAFRules = async (ruleType: 'standard' | 'custom') => {
    try {
      const response = await fetch('/api/admin/firewall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', ruleType })
      })

      if (response.ok) {
        await loadData() // Refresh data
      } else {
        console.error('Failed to toggle WAF rules')
      }
    } catch (error) {
      console.error('Error toggling WAF rules:', error)
    }
  }

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/firewall', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled })
      })

      if (response.ok) {
        await loadData() // Refresh data
      } else {
        console.error('Failed to toggle rule')
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  const initializeWAF = async () => {
    try {
      const response = await fetch('/api/admin/firewall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      })

      if (response.ok) {
        await loadData() // Refresh data
      } else {
        console.error('Failed to initialize WAF')
      }
    } catch (error) {
      console.error('Error initializing WAF:', error)
    }
  }

  const updateUserSubscription = async (userId: string, subscription: string) => {
    try {
      console.log('🔄 Updating subscription:', { userId, subscription })
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, subscription })
      })

      if (response.ok) {
        console.log('✅ Subscription updated successfully')
        await loadData() // Refresh data
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to update user subscription:', response.status, errorData)
        alert(`Failed to update subscription: ${response.status} ${errorData}`)
      }
    } catch (error) {
      console.error('❌ Error updating user subscription:', error)
      alert(`Error updating subscription: ${error}`)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive })
      })

      if (response.ok) {
        await loadData() // Refresh data
      } else {
        console.error('Failed to toggle user status')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const terminateUserSession = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        await loadData() // Refresh data
      } else {
        console.error('Failed to terminate user session')
      }
    } catch (error) {
      console.error('Error terminating user session:', error)
    }
  }

  const executeAdminTool = async (action: string) => {
    try {
      setIsLoading(true)
      console.log(`🔧 Executing admin tool: ${action}`)

      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(`✅ ${result.message}`)

        // Handle specific tool results
        if (action === 'export_data' && result.data) {
          // Download CSV files
          Object.entries(result.data).forEach(([tableName, csvContent]) => {
            if (csvContent) {
              downloadCSV(csvContent as string, `${tableName}_export.csv`)
            }
          })
        }

        if (action === 'security_scan' && result.vulnerabilities) {
          // Show detailed scan results
          const vulnSummary = `Security Scan Results:
Critical: ${result.vulnerabilities.critical}
High: ${result.vulnerabilities.high}
Medium: ${result.vulnerabilities.medium}
Low: ${result.vulnerabilities.low}
Info: ${result.vulnerabilities.info}

${result.findings?.map((f: any) => `${f.severity}: ${f.description}`).join('\n')}`
          alert(vulnSummary)
        }

        await loadData() // Refresh data
      } else {
        alert(`❌ ${result.message || 'Operation failed'}`)
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      alert(`❌ Failed to execute ${action}`)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    )
  }

  if (!isAdmin(session?.user?.email)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied - Admin Only</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>→</span>
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <span>→</span>
            <span className="text-white">Admin</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛡️ Admin Dashboard</h1>
              <p className="text-slate-400">
                Welcome back, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="mr-2">←</span>
                Back to Dashboard
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <span className="mr-2">🏠</span>
                Home
              </Button>
            </div>
          </div>

          {/* Quick Access Menu */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm">User Dashboard</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/cad'}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">🎨</span>
              <span className="text-sm">CAD Editor</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/lms'}
              className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">📚</span>
              <span className="text-sm font-bold">Course Builder</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/lms/courses'}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">🎓</span>
              <span className="text-sm">View Courses</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/rigging-loft'}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">🏗️</span>
              <span className="text-sm">Rigging Loft</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-slate-400">Open Issues</p>
                  <p className="text-2xl font-bold">{issues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-slate-400">Security Status</p>
                  <p className="text-2xl font-bold text-green-400">Good</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">System Health</p>
                  <p className="text-2xl font-bold text-green-400">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:bg-slate-700">
              <Eye className="w-4 h-4 mr-2" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
              <Activity className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-slate-700">
              <Shield className="w-4 h-4 mr-2" />
              Threats
            </TabsTrigger>
            <TabsTrigger value="waf" className="data-[state=active]:bg-slate-700">
              <Globe className="w-4 h-4 mr-2" />
              WAF
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-slate-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-slate-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-slate-700">
              <Wrench className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database Status</span>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authentication</span>
                    <Badge className="bg-green-600">Working</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Admin Access</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <VisitorAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement
              users={users}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="customers">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Stripe Customers</CardTitle>
                <p className="text-slate-400">Real paying customers from Stripe</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading Stripe customers...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-green-400">Total Customers</h3>
                        <p className="text-2xl font-bold">{stripeCustomers.length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-blue-400">Active Subscriptions</h3>
                        <p className="text-2xl font-bold">{stripeCustomers.filter((c: any) => c.subscription?.status === 'active').length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-yellow-400">Total Revenue</h3>
                        <p className="text-2xl font-bold">${stripeCustomers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-purple-400">Average Spend</h3>
                        <p className="text-2xl font-bold">${stripeCustomers.length > 0 ? (stripeCustomers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0) / stripeCustomers.length).toFixed(2) : '0.00'}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Customer List</h4>
                        <Button onClick={loadData} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Refresh Data
                        </Button>
                      </div>
                      {stripeCustomers.length > 0 ? (
                        <div className="space-y-2">
                          {stripeCustomers.slice(0, 20).map((customer: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-slate-700 rounded">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <p className="font-semibold">{customer.name || 'Unknown'}</p>
                                    <p className="text-sm text-slate-400">{customer.email}</p>
                                    {customer.company && <p className="text-xs text-slate-500">{customer.company}</p>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                {customer.subscription ? (
                                  <div>
                                    <Badge className={`${
                                      customer.subscription.status === 'active' ? 'bg-green-600' :
                                      customer.subscription.status === 'canceled' ? 'bg-red-600' :
                                      customer.subscription.status === 'past_due' ? 'bg-yellow-600' :
                                      'bg-gray-600'
                                    }`}>
                                      {customer.subscription.planName} - {customer.subscription.status}
                                    </Badge>
                                    <p className="text-sm text-slate-400 mt-1">
                                      ${(customer.subscription.amount / 100).toFixed(2)}/{customer.subscription.currency}
                                    </p>
                                  </div>
                                ) : (
                                  <Badge className="bg-gray-600">No Subscription</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-400">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
                                <p className="text-sm text-slate-400">Total Spent</p>
                                {customer.lastLogin && (
                                  <p className="text-xs text-slate-500">
                                    Last login: {new Date(customer.lastLogin).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          No Stripe customers found. Make sure Stripe is configured and has customers.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Issue Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading issues...</div>
                ) : issues.length === 0 ? (
                  <div className="text-center py-8">No issues found</div>
                ) : (
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue: any, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-700 rounded">
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-slate-400">{issue.category}</p>
                        </div>
                        <Badge className={
                          issue.priority === 'HIGH' ? 'bg-red-600' :
                          issue.priority === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
                        }>
                          {issue.priority || 'LOW'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security & Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading security data...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-green-400">Active Sessions</h3>
                        <p className="text-2xl font-bold">{users.filter((u: any) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000)).length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-blue-400">Total Logins (24h)</h3>
                        <p className="text-2xl font-bold">{stats?.overview?.recentLogins || 0}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-yellow-400">Security Events</h3>
                        <p className="text-2xl font-bold">{securityLogs.length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-red-400">Failed Logins</h3>
                        <p className="text-2xl font-bold">{users.filter((u: any) => u.loginAttempts > 0).length}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Active User Sessions</h4>
                        <Button onClick={loadData} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Refresh Sessions
                        </Button>
                      </div>
                      {users.filter((u: any) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000)).length > 0 ? (
                        <div className="space-y-2">
                          {users
                            .filter((u: any) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 24*60*60*1000))
                            .slice(0, 10)
                            .map((user: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                              <div>
                                <p className="font-medium">{user.name || 'Unknown'}</p>
                                <p className="text-sm text-slate-400">{user.email}</p>
                                <p className="text-xs text-slate-500">
                                  Last seen: {new Date(user.lastLogin).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={user.isActive ? 'bg-green-600' : 'bg-red-600'}>
                                  {user.isActive ? 'Active' : 'Suspended'}
                                </Badge>
                                <Badge className={user.loginAttempts > 3 ? 'bg-red-600' : 'bg-green-600'}>
                                  {user.loginAttempts || 0} attempts
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => terminateUserSession(user.id)}
                                  className="text-xs text-red-400"
                                >
                                  Terminate
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">No active sessions in the last 24 hours</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recent Security Events</h4>
                      {securityLogs.length === 0 ? (
                        <p className="text-slate-400">No recent security events</p>
                      ) : (
                        <div className="space-y-2">
                          {securityLogs.slice(0, 5).map((log: any, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                              <div>
                                <p className="font-medium">{log.action}</p>
                                <p className="text-sm text-slate-400">{log.ipAddress}</p>
                                <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                              </div>
                              <Badge className={
                                log.riskLevel === 'HIGH' ? 'bg-red-600' :
                                log.riskLevel === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
                              }>
                                {log.riskLevel}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Threats</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading threats data...</div>
                ) : threats.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-green-400 font-semibold">No Active Threats</p>
                    <p className="text-slate-400">Your system is secure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threats.map((threat: any, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-700 rounded">
                        <div>
                          <p className="font-medium">{threat.type}</p>
                          <p className="text-sm text-slate-400">{threat.source}</p>
                        </div>
                        <Badge className={
                          threat.severity === 'CRITICAL' ? 'bg-red-600' :
                          threat.severity === 'HIGH' ? 'bg-orange-600' :
                          threat.severity === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
                        }>
                          {threat.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waf">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Web Application Firewall Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading WAF data...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">WAF Status</h3>
                        <p className="text-sm text-slate-400">Web Application Firewall Protection</p>
                      </div>
                      <Badge className={firewallConfig?.standardRulesApplied ? 'bg-green-600' : 'bg-red-600'}>
                        {firewallConfig?.standardRulesApplied ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">Standard Rules</h4>
                          <Button
                            size="sm"
                            onClick={() => toggleWAFRules('standard')}
                            className={firewallConfig?.standardRulesApplied ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                          >
                            {firewallConfig?.standardRulesApplied ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">SQL Injection, XSS Protection</p>
                        <Badge className={firewallConfig?.standardRulesApplied ? 'bg-green-600' : 'bg-gray-600'}>
                          {firewallConfig?.standardRulesApplied ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">Custom Rules</h4>
                          <Button
                            size="sm"
                            onClick={() => toggleWAFRules('custom')}
                            className={firewallConfig?.customRulesApplied ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                          >
                            {firewallConfig?.customRulesApplied ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Advanced protection rules</p>
                        <Badge className={firewallConfig?.customRulesApplied ? 'bg-green-600' : 'bg-gray-600'}>
                          {firewallConfig?.customRulesApplied ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Active Rules ({firewallConfig?.activeRules?.length || 0})</h4>
                        <Button onClick={loadData} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Refresh Rules
                        </Button>
                      </div>
                      {firewallConfig?.activeRules && firewallConfig.activeRules.length > 0 ? (
                        <div className="space-y-2">
                          {firewallConfig.activeRules.map((rule: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                              <div>
                                <p className="font-medium">{rule.name}</p>
                                <p className="text-sm text-slate-400">{rule.description}</p>
                                <p className="text-xs text-slate-500">Type: {rule.type}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={rule.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                                  {rule.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                                  className="text-xs"
                                >
                                  {rule.enabled ? 'Disable' : 'Enable'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-400 mb-4">No firewall rules configured</p>
                          <Button onClick={() => initializeWAF()} className="bg-green-600 hover:bg-green-700">
                            Initialize WAF Rules
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Billing Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading billing data...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-green-400">Total Revenue</h3>
                        <p className="text-2xl font-bold">${billingData?.totalRevenue || '0'}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-blue-400">Premium Users</h3>
                        <p className="text-2xl font-bold">{users.filter((u: any) => u.subscription?.plan === 'premium' || u.subscription === 'premium').length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-purple-400">Free Users</h3>
                        <p className="text-2xl font-bold">{users.filter((u: any) => u.subscription?.plan === 'free' || u.subscription === 'free' || !u.subscription).length}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <h3 className="font-semibold text-orange-400">Trial Users</h3>
                        <p className="text-2xl font-bold">{users.filter((u: any) => u.subscription?.plan === 'trial' || u.subscription === 'trial').length}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">User Subscription Management</h4>
                      {users.length > 0 ? (
                        <div className="space-y-2">
                          {users.slice(0, 10).map((user: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                              <div>
                                <p className="font-medium">{user.name || 'Unknown'}</p>
                                <p className="text-sm text-slate-400">{user.email}</p>
                                <p className="text-xs text-slate-500">
                                  Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                </p>
                                {user.subscription?.plan && user.subscription.nextPayment && (
                                  <p className="text-xs text-slate-500">
                                    Next Payment: {new Date(user.subscription.nextPayment).toLocaleDateString()} - ${user.subscription.amount}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={
                                  (user.subscription?.plan || user.subscription) === 'enterprise' ? 'bg-purple-600' :
                                  (user.subscription?.plan || user.subscription) === 'pro' ? 'bg-green-600' :
                                  (user.subscription?.plan || user.subscription) === 'basic' ? 'bg-yellow-600' : 'bg-gray-600'
                                }>
                                  {user.subscription?.plan || user.subscription || 'free'}
                                </Badge>
                                <select
                                  value={user.subscription?.plan || user.subscription || 'free'}
                                  onChange={(e) => updateUserSubscription(user.id, e.target.value)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded border-2 border-blue-400 cursor-pointer font-semibold"
                                  title="Change subscription level"
                                >
                                  <option value="free">Free</option>
                                  <option value="basic">Basic</option>
                                  <option value="pro">Pro</option>
                                  <option value="enterprise">Enterprise</option>
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleUserStatus(user.id, !user.isActive)}
                                  className={`text-xs ${user.isActive ? 'text-red-400' : 'text-green-400'}`}
                                >
                                  {user.isActive ? 'Suspend' : 'Activate'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">No users found</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading audit data...</div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold mb-2">Recent Admin Actions</h4>
                    {stats?.recentActivity ? (
                      <div className="space-y-2">
                        {stats.recentActivity.slice(0, 10).map((activity: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-slate-400">
                                {activity.user} - {activity.ipAddress}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-400">
                                {new Date(activity.createdAt).toLocaleString()}
                              </p>
                              <Badge className={activity.success ? 'bg-green-600' : 'bg-red-600'}>
                                {activity.success ? 'Success' : 'Failed'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">No recent audit logs</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Tools</CardTitle>
                <p className="text-slate-400">System maintenance and security tools</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">🗄️</span>
                      Database Management
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">Create PostgreSQL database backup</p>
                    <Button
                      onClick={() => executeAdminTool('database_backup')}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating Backup...' : 'Database Backup'}
                    </Button>
                  </div>

                  <div className="bg-slate-700 p-4 rounded">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">🧹</span>
                      System Maintenance
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">Clear application caches and optimize performance</p>
                    <Button
                      onClick={() => executeAdminTool('clear_cache')}
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Clearing Cache...' : 'Clear Cache'}
                    </Button>
                  </div>

                  <div className="bg-slate-700 p-4 rounded">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">🔍</span>
                      Security Scan
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">Run comprehensive security vulnerability scan</p>
                    <Button
                      onClick={() => executeAdminTool('security_scan')}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Scanning...' : 'Run Security Scan'}
                    </Button>
                  </div>

                  <div className="bg-slate-700 p-4 rounded">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">📊</span>
                      Export Data
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">Export all system data to CSV files</p>
                    <Button
                      onClick={() => executeAdminTool('export_data')}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Exporting...' : 'Export CSV'}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-700 rounded">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <span className="mr-2">📋</span>
                    Tool Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Database</p>
                      <p className="text-green-400">✅ Connected</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Cache System</p>
                      <p className="text-green-400">✅ Active</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Security Monitor</p>
                      <p className="text-green-400">✅ Running</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Export Service</p>
                      <p className="text-green-400">✅ Ready</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
                    Refresh Data
                  </Button>
                  <div className="text-sm text-slate-400">
                    <p>Admin Email: {session?.user?.email}</p>
                    <p>Role: {session?.user?.role}</p>
                    <p>Last Updated: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
