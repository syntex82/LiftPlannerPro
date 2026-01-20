'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Eye, Clock, MapPin, Monitor } from 'lucide-react'

interface SecurityLog {
  id: string
  action: string
  resource?: string
  ipAddress: string
  userAgent: string
  success: boolean
  details?: string
  riskLevel: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchSecurityLogs()
  }, [filter])

  const fetchSecurityLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('riskLevel', filter)
      }
      params.append('limit', '50')

      const response = await fetch(`/api/admin/security-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching security logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-orange-600 text-white'
      case 'MEDIUM': return 'bg-yellow-600 text-white'
      case 'LOW': return 'bg-green-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <Monitor className="w-4 h-4" />
    if (action.includes('SUSPICIOUS')) return <AlertTriangle className="w-4 h-4" />
    if (action.includes('ACCESS')) return <Eye className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getLocationFromIP = (ip: string) => {
    // Simple IP location detection (you could integrate with a real service)
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
      return 'Local Network'
    }
    return 'External'
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'LOGIN_FAILED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Suspicious</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'SUSPICIOUS_ACTIVITY').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Event Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Events
            </Button>
            <Button
              variant={filter === 'CRITICAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('CRITICAL')}
            >
              Critical
            </Button>
            <Button
              variant={filter === 'HIGH' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('HIGH')}
            >
              High Risk
            </Button>
            <Button
              variant={filter === 'MEDIUM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('MEDIUM')}
            >
              Medium Risk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSecurityLogs}
            >
              Refresh
            </Button>
          </div>

          {/* Security Logs Table */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading security logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No security events found</p>
              </div>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                          <Badge className={getRiskBadgeColor(log.riskLevel)}>
                            {log.riskLevel}
                          </Badge>
                          {!log.success && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{log.ipAddress} ({getLocationFromIP(log.ipAddress)})</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(log.createdAt)}</span>
                            </span>
                          </div>
                          
                          {log.user && (
                            <div>
                              <strong>User:</strong> {log.user.name} ({log.user.email})
                            </div>
                          )}
                          
                          {log.resource && (
                            <div>
                              <strong>Resource:</strong> {log.resource}
                            </div>
                          )}
                          
                          {log.details && (
                            <div>
                              <strong>Details:</strong> 
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {typeof log.details === 'string' ? log.details : JSON.stringify(JSON.parse(log.details), null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            <strong>User Agent:</strong> {log.userAgent}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
