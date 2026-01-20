'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, Search, Edit2, Trash2, Ban, RefreshCw, 
  CreditCard, Clock, Shield, UserCheck, UserX, Mail,
  ChevronDown, ChevronUp, MoreVertical
} from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  subscription: string | null
  trialEndsAt: string | null
  isActive: boolean
  lastLogin: string | null
  loginAttempts: number
  createdAt: string
  company: string | null
}

interface UserManagementProps {
  users: User[]
  onRefresh: () => void
  isLoading: boolean
}

export default function UserManagement({ users, onRefresh, isLoading }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterSubscription, setFilterSubscription] = useState<string>('all')

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription
    
    return matchesSearch && matchesRole && matchesSubscription
  })

  // User actions
  const handleUserAction = async (userId: string, action: string, data?: any) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...data })
      })
      
      if (res.ok) {
        onRefresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Action failed')
      }
    } catch (error) {
      console.error('User action failed:', error)
      alert('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const getTrialStatus = (user: User) => {
    if (!user.trialEndsAt) return null
    const trialEnd = new Date(user.trialEndsAt)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 0) return { text: 'Expired', color: 'bg-red-600' }
    if (daysLeft <= 2) return { text: `${daysLeft}d left`, color: 'bg-orange-600' }
    return { text: `${daysLeft}d left`, color: 'bg-green-600' }
  }

  const getSubscriptionBadge = (subscription: string | null) => {
    switch (subscription) {
      case 'admin': return 'bg-purple-600'
      case 'professional': case 'pro': return 'bg-blue-600'
      case 'trial': return 'bg-yellow-600'
      case 'free': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <Button 
            onClick={onRefresh} 
            size="sm" 
            variant="outline"
            className="border-slate-600"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          
          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Subscriptions</option>
            <option value="professional">Professional</option>
            <option value="trial">Trial</option>
            <option value="free">Free</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-slate-700/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-slate-400">Total Users</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-400">
              {users.filter(u => u.subscription === 'professional' || u.subscription === 'pro').length}
            </p>
            <p className="text-xs text-slate-400">Paid</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {users.filter(u => u.subscription === 'trial').length}
            </p>
            <p className="text-xs text-slate-400">Trial</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-400">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-xs text-slate-400">Admins</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-400">
              {users.filter(u => !u.isActive).length}
            </p>
            <p className="text-xs text-slate-400">Suspended</p>
          </div>
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No users found</div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const trialStatus = getTrialStatus(user)
              const isExpanded = expandedUser === user.id

              return (
                <div
                  key={user.id}
                  className={`bg-slate-700/50 rounded-lg overflow-hidden transition-all ${
                    !user.isActive ? 'opacity-60 border-l-4 border-red-500' : ''
                  }`}
                >
                  {/* Main Row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700"
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white truncate">{user.name || 'No Name'}</p>
                          {user.role === 'admin' && (
                            <Badge className="bg-purple-600 text-xs">Admin</Badge>
                          )}
                          {!user.isActive && (
                            <Badge className="bg-red-600 text-xs">Suspended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getSubscriptionBadge(user.subscription)}>
                        {user.subscription || 'free'}
                      </Badge>
                      {trialStatus && (
                        <Badge className={trialStatus.color}>
                          <Clock className="w-3 h-3 mr-1" />
                          {trialStatus.text}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-600">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                        <div>
                          <p className="text-slate-400">User ID</p>
                          <p className="text-white font-mono text-xs">{user.id}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Company</p>
                          <p className="text-white">{user.company || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Joined</p>
                          <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Last Login</p>
                          <p className="text-white">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-600">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserAction(user.id, 'resetTrial')
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Reset Trial
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-400 hover:bg-green-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserAction(user.id, 'grantPro')
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Grant Pro
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserAction(user.id, user.role === 'admin' ? 'removeAdmin' : 'makeAdmin')
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className={`${user.isActive
                            ? 'border-orange-500 text-orange-400 hover:bg-orange-500/20'
                            : 'border-green-500 text-green-400 hover:bg-green-500/20'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUserAction(user.id, user.isActive ? 'suspend' : 'activate')
                          }}
                          disabled={actionLoading === user.id}
                        >
                          {user.isActive ? (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Are you sure you want to delete ${user.email}? This cannot be undone.`)) {
                              handleUserAction(user.id, 'delete')
                            }
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

