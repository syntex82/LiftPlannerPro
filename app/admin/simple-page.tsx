'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, AlertTriangle, Settings, BarChart3 } from "lucide-react"

export default function SimpleAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [issues, setIssues] = useState([])
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
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🛡️ Admin Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
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
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issues
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

          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">No users found</div>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user: any, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-700 rounded">
                        <div>
                          <p className="font-medium">{user.name || 'Unknown'}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <Badge className={user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}>
                          {user.role || 'user'}
                        </Badge>
                      </div>
                    ))}
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
