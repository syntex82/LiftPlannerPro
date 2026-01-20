"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Bug,
  Lightbulb,
  HelpCircle,
  Shield,
  Send,
  CheckCircle,
  Clock,
  X
} from "lucide-react"

interface ReportedIssue {
  id: string
  title: string
  description: string
  category: 'bug' | 'feature' | 'support' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  module: string
  reportedAt: string
  response?: string
}

export default function IssueReporter() {
  const { data: session } = useSession()
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showMyIssuesDialog, setShowMyIssuesDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myIssues, setMyIssues] = useState<ReportedIssue[]>([])

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'bug' as 'bug' | 'feature' | 'support' | 'security',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    module: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: ''
  })

  const modules = [
    'Load Calculator',
    'Project Management',
    'RAMS Generator',
    'Step Plan Module',
    'Rigging Loft Management',
    'User Authentication',
    'Dashboard',
    'Reports & Export',
    'General System',
    'Other'
  ]

  const handleSubmitIssue = async () => {
    if (!session?.user?.email) {
      alert('❌ You must be logged in to report issues')
      return
    }

    setIsSubmitting(true)
    try {
      // Try to submit to API
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newIssue.title,
          description: newIssue.description,
          category: newIssue.category,
          priority: newIssue.priority,
          module: newIssue.module,
          stepsToReproduce: newIssue.stepsToReproduce,
          expectedBehavior: newIssue.expectedBehavior,
          actualBehavior: newIssue.actualBehavior
        })
      })

      if (response.ok) {
        const submittedIssue = await response.json()

        // Add to user's issues list
        setMyIssues([submittedIssue, ...myIssues])

        // Reset form
        setNewIssue({
          title: '',
          description: '',
          category: 'bug',
          priority: 'medium',
          module: '',
          stepsToReproduce: '',
          expectedBehavior: '',
          actualBehavior: ''
        })

        setShowReportDialog(false)
        alert('✅ Issue reported successfully! Our team will review it shortly.')
      } else {
        throw new Error('Failed to submit issue')
      }
    } catch (error) {
      console.error('Error reporting issue:', error)

      // Fallback: Store locally and show user-friendly message
      const localIssue: ReportedIssue = {
        id: `local_${Date.now()}`,
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        priority: newIssue.priority,
        status: 'open',
        module: newIssue.module,
        reportedAt: new Date().toISOString()
      }

      // Store in localStorage as backup
      const localIssues = JSON.parse(localStorage.getItem('lift_planner_local_issues') || '[]')
      localIssues.unshift(localIssue)
      localStorage.setItem('lift_planner_local_issues', JSON.stringify(localIssues.slice(0, 50))) // Keep last 50

      // Add to current session
      setMyIssues([localIssue, ...myIssues])

      // Reset form
      setNewIssue({
        title: '',
        description: '',
        category: 'bug',
        priority: 'medium',
        module: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: ''
      })

      setShowReportDialog(false)
      alert('✅ Issue saved locally! We will sync it when the connection is restored.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadMyIssues = async () => {
    try {
      let allIssues: ReportedIssue[] = []

      // Try to fetch from API first
      try {
        const response = await fetch('/api/issues?userOnly=true')
        if (response.ok) {
          const apiIssues = await response.json()
          allIssues = [...apiIssues]
        }
      } catch (apiError) {
        console.log('API not available, loading local issues only')
      }

      // Load local issues from localStorage
      const localIssues = JSON.parse(localStorage.getItem('lift_planner_local_issues') || '[]')

      // Combine API and local issues, removing duplicates
      const combinedIssues = [...allIssues]
      localIssues.forEach((localIssue: ReportedIssue) => {
        if (!combinedIssues.find(issue => issue.id === localIssue.id)) {
          combinedIssues.push(localIssue)
        }
      })

      // Sort by reported date (newest first)
      combinedIssues.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())

      setMyIssues(combinedIssues)
      setShowMyIssuesDialog(true)
    } catch (error) {
      console.error('Error loading issues:', error)

      // Fallback to localStorage only
      const localIssues = JSON.parse(localStorage.getItem('lift_planner_local_issues') || '[]')
      setMyIssues(localIssues)
      setShowMyIssuesDialog(true)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Report Issue Button */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Report an Issue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueTitle" className="text-slate-300">Issue Title *</Label>
                <Input
                  id="issueTitle"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label htmlFor="issueModule" className="text-slate-300">Module/Feature *</Label>
                <Select onValueChange={(value) => setNewIssue({...newIssue, module: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>{module}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issueCategory" className="text-slate-300">Category *</Label>
                <Select onValueChange={(value) => setNewIssue({...newIssue, category: value as any})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="bug">
                      <div className="flex items-center">
                        <Bug className="w-4 h-4 mr-2" />
                        Bug Report
                      </div>
                    </SelectItem>
                    <SelectItem value="feature">
                      <div className="flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Feature Request
                      </div>
                    </SelectItem>
                    <SelectItem value="support">
                      <div className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Support Request
                      </div>
                    </SelectItem>
                    <SelectItem value="security">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Issue
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issuePriority" className="text-slate-300">Priority *</Label>
                <Select onValueChange={(value) => setNewIssue({...newIssue, priority: value as any})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="issueDescription" className="text-slate-300">Description *</Label>
              <Textarea
                id="issueDescription"
                value={newIssue.description}
                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Detailed description of the issue or request"
                rows={4}
              />
            </div>

            {newIssue.category === 'bug' && (
              <>
                <div>
                  <Label htmlFor="stepsToReproduce" className="text-slate-300">Steps to Reproduce</Label>
                  <Textarea
                    id="stepsToReproduce"
                    value={newIssue.stepsToReproduce}
                    onChange={(e) => setNewIssue({...newIssue, stepsToReproduce: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="1. Go to...\n2. Click on...\n3. See error..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedBehavior" className="text-slate-300">Expected Behavior</Label>
                    <Textarea
                      id="expectedBehavior"
                      value={newIssue.expectedBehavior}
                      onChange={(e) => setNewIssue({...newIssue, expectedBehavior: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="What should happen?"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualBehavior" className="text-slate-300">Actual Behavior</Label>
                    <Textarea
                      id="actualBehavior"
                      value={newIssue.actualBehavior}
                      onChange={(e) => setNewIssue({...newIssue, actualBehavior: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="What actually happens?"
                      rows={2}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowReportDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitIssue}
                disabled={isSubmitting || !newIssue.title || !newIssue.description || !newIssue.module}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Issue
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Issues Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-slate-300 hover:text-white"
        onClick={loadMyIssues}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        My Issues
      </Button>

      {/* My Issues Dialog */}
      <Dialog open={showMyIssuesDialog} onOpenChange={setShowMyIssuesDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              My Reported Issues
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {myIssues.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50 text-slate-400" />
                <h3 className="text-xl font-medium mb-2 text-slate-300">No Issues Reported</h3>
                <p className="text-slate-400">You haven't reported any issues yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myIssues.map((issue) => (
                  <Card key={issue.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{issue.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{issue.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={`${
                            issue.status === 'open' ? 'bg-yellow-500' :
                            issue.status === 'in_progress' ? 'bg-blue-500' :
                            issue.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                          } text-white`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${
                            issue.priority === 'critical' ? 'bg-red-500' :
                            issue.priority === 'high' ? 'bg-orange-500' :
                            issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                          } text-white`}>
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>{issue.module} • {new Date(issue.reportedAt).toLocaleDateString()}</span>
                        <div className="flex items-center">
                          {issue.status === 'open' && <Clock className="w-4 h-4 mr-1" />}
                          {issue.status === 'resolved' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {issue.status === 'in_progress' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-1"></div>}
                        </div>
                      </div>
                      {issue.response && (
                        <div className="mt-3 p-3 bg-slate-600/50 rounded border-l-4 border-blue-500">
                          <p className="text-slate-300 text-sm"><strong>Response:</strong> {issue.response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
