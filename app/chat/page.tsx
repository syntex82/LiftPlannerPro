"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Settings,
  LogOut,
  User,
  Shield,
  BookOpen,
  Home,
  Bell,
  Search,
  ChevronDown
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ProfessionalTeamChat from "@/components/Chat/ProfessionalTeamChat"

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Admin email list
  const adminEmails = ['mickyblenk@gmail.com', 'admin@darkspace.com']
  const isAdminUser = (email: string | null | undefined) => email && adminEmails.includes(email)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <div className="text-white text-xl font-semibold mb-2">Loading Team Chat</div>
          <div className="text-slate-400 text-sm">Connecting to your workspace...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/80 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30"></div>
                  <Image src="/company-logo.png" alt="Lift Planner Pro" width={32} height={32} className="relative rounded-xl" />
                </div>
                <span className="hidden sm:block text-white font-bold text-lg">Team Chat</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-1 ml-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800/50 gap-2">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Actions & User Menu */}
            <div className="flex items-center space-x-2">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuLabel className="text-slate-300">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">{session.user?.name}</p>
                      <p className="text-xs text-slate-400">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                    <Link href="/profile" className="flex items-center"><User className="mr-2 h-4 w-4" /><span>My Profile</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-700">
                    <Link href="/dashboard" className="flex items-center"><Home className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                  </DropdownMenuItem>
                  {isAdminUser(session.user?.email) && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-orange-500/20 text-orange-400">
                        <Link href="/admin" className="flex items-center"><Shield className="mr-2 h-4 w-4" /><span>Admin Panel</span></Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-red-500/20 text-red-400">
                    <Link href="/api/auth/signout" className="flex items-center"><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area - Full Height */}
      <main className="flex-1 overflow-hidden">
        <ProfessionalTeamChat />
      </main>
    </div>
  )
}

