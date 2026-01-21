'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, Mail, Building2, Phone, MapPin, Calendar, Shield, Award, 
  Camera, Save, Briefcase, GraduationCap, Clock, CheckCircle, 
  ArrowLeft, Edit2, Star, FileText, Settings
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  email: string
  company: string
  phone: string
  location: string
  bio: string
  role: string
  subscription: string
  avatar: string
  jobTitle: string
  department: string
  certifications: string[]
  skills: string[]
  joinedDate: string
  projectsCompleted: number
  hoursLogged: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    company: '',
    phone: '',
    location: '',
    bio: '',
    role: 'user',
    subscription: 'trial',
    avatar: '',
    jobTitle: '',
    department: '',
    certifications: [],
    skills: [],
    joinedDate: new Date().toISOString(),
    projectsCompleted: 0,
    hoursLogged: 0
  })
  const [newSkill, setNewSkill] = useState('')
  const [newCert, setNewCert] = useState('')

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({ ...prev, avatar: data.path }))
        // Save the avatar path to database
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...profile, avatar: data.path })
        })
      } else {
        alert('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Use session data as fallback
      if (session?.user) {
        setProfile(prev => ({
          ...prev,
          name: session.user?.name || '',
          email: session.user?.email || '',
          avatar: session.user?.image || ''
        }))
      }
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (response.ok) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const addCertification = () => {
    if (newCert.trim() && !profile.certifications.includes(newCert.trim())) {
      setProfile(prev => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }))
      setNewCert('')
    }
  }

  const removeCertification = (cert: string) => {
    setProfile(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">My Profile</h1>
          </div>
          <Button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} 
            className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? <><Save className="w-4 h-4 mr-2" />Save</> : <><Edit2 className="w-4 h-4 mr-2" />Edit</>}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-slate-800 shadow-xl">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    <div className={`rounded-full w-8 h-8 p-0 bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors ${isUploadingAvatar ? 'opacity-50' : ''}`}>
                      {isUploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </label>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isEditing ? (
                    <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                      className="text-2xl font-bold bg-slate-700 border-slate-600 text-white w-64" placeholder="Your Name" />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{profile.name || 'Your Name'}</h2>
                  )}
                  {profile.role === 'admin' && <Badge className="bg-purple-500">Admin</Badge>}
                  <Badge className={profile.subscription === 'pro' ? 'bg-blue-500' : profile.subscription === 'trial' ? 'bg-yellow-500' : 'bg-slate-500'}>
                    {profile.subscription?.charAt(0).toUpperCase() + profile.subscription?.slice(1) || 'Trial'}
                  </Badge>
                </div>
                {isEditing ? (
                  <Input value={profile.jobTitle} onChange={e => setProfile({...profile, jobTitle: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-300 w-64 mb-2" placeholder="Job Title" />
                ) : (
                  <p className="text-slate-400">{profile.jobTitle || 'Lift Planner Professional'}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{profile.email}</span>
                  {profile.company && <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{profile.company}</span>}
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div><p className="text-2xl font-bold text-white">{profile.projectsCompleted}</p><p className="text-xs text-slate-400">Projects</p></div>
                <div><p className="text-2xl font-bold text-white">{profile.hoursLogged}</p><p className="text-xs text-slate-400">Hours</p></div>
                <div><p className="text-2xl font-bold text-white">{profile.certifications.length}</p><p className="text-xs text-slate-400">Certs</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="skills">Skills & Certs</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5" />Personal Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><label className="text-sm text-slate-400">Full Name</label>
                    {isEditing ? <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                    : <p className="text-white">{profile.name || '-'}</p>}</div>
                  <div><label className="text-sm text-slate-400">Email</label><p className="text-white">{profile.email}</p></div>
                  <div><label className="text-sm text-slate-400">Phone</label>
                    {isEditing ? <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="bg-slate-700 border-slate-600 text-white" placeholder="+44 ..." />
                    : <p className="text-white">{profile.phone || '-'}</p>}</div>
                  <div><label className="text-sm text-slate-400">Location</label>
                    {isEditing ? <Input value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="bg-slate-700 border-slate-600 text-white" placeholder="City, Country" />
                    : <p className="text-white">{profile.location || '-'}</p>}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Briefcase className="w-5 h-5" />Work Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><label className="text-sm text-slate-400">Company</label>
                    {isEditing ? <Input value={profile.company} onChange={e => setProfile({...profile, company: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                    : <p className="text-white">{profile.company || '-'}</p>}</div>
                  <div><label className="text-sm text-slate-400">Job Title</label>
                    {isEditing ? <Input value={profile.jobTitle} onChange={e => setProfile({...profile, jobTitle: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                    : <p className="text-white">{profile.jobTitle || '-'}</p>}</div>
                  <div><label className="text-sm text-slate-400">Department</label>
                    {isEditing ? <Input value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                    : <p className="text-white">{profile.department || '-'}</p>}</div>
                  <div><label className="text-sm text-slate-400">Member Since</label>
                    <p className="text-white flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(profile.joinedDate).toLocaleDateString()}</p></div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><FileText className="w-5 h-5" />Bio</CardTitle></CardHeader>
                <CardContent>
                  {isEditing ? <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}
                    className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white resize-none" placeholder="Tell us about yourself..." />
                  : <p className="text-slate-300">{profile.bio || 'No bio yet.'}</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Star className="w-5 h-5" />Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills.map(skill => (
                      <Badge key={skill} className="bg-blue-500/20 text-blue-300 border border-blue-500/50">
                        {skill}{isEditing && <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">×</button>}
                      </Badge>
                    ))}
                    {profile.skills.length === 0 && <p className="text-slate-500 text-sm">No skills added yet.</p>}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2"><Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill..."
                      className="bg-slate-700 border-slate-600 text-white" onKeyPress={e => e.key === 'Enter' && addSkill()} />
                      <Button onClick={addSkill} size="sm" className="bg-blue-600">Add</Button></div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="w-5 h-5" />Certifications</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {profile.certifications.map(cert => (
                      <div key={cert} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400" /><span className="text-white flex-1">{cert}</span>
                        {isEditing && <button onClick={() => removeCertification(cert)} className="text-slate-400 hover:text-red-400">×</button>}
                      </div>
                    ))}
                    {profile.certifications.length === 0 && <p className="text-slate-500 text-sm">No certifications added yet.</p>}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2"><Input value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="Add certification..."
                      className="bg-slate-700 border-slate-600 text-white" onKeyPress={e => e.key === 'Enter' && addCertification()} />
                      <Button onClick={addCertification} size="sm" className="bg-green-600">Add</Button></div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-400" /></div>
                    <div className="flex-1"><p className="text-white">Created new lift plan</p><p className="text-sm text-slate-400">2 hours ago</p></div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-400" /></div>
                    <div className="flex-1"><p className="text-white">Completed safety training module</p><p className="text-sm text-slate-400">Yesterday</p></div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Award className="w-5 h-5 text-purple-400" /></div>
                    <div className="flex-1"><p className="text-white">Earned CPCS certification badge</p><p className="text-sm text-slate-400">3 days ago</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Settings className="w-5 h-5" />Account Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div><p className="text-white font-medium">Subscription</p><p className="text-sm text-slate-400">Current plan: {profile.subscription}</p></div>
                  <Link href="/pricing"><Button className="bg-blue-600">Upgrade</Button></Link>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div><p className="text-white font-medium">Password</p><p className="text-sm text-slate-400">Change your password</p></div>
                  <Button variant="outline" className="border-slate-600 text-slate-300">Change</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div><p className="text-white font-medium">Two-Factor Authentication</p><p className="text-sm text-slate-400">Add extra security</p></div>
                  <Button variant="outline" className="border-slate-600 text-slate-300">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

