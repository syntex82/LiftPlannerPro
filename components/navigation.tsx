"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import LogoutButton from "@/components/auth/LogoutButton"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Navigation() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Image src="/company-logo.png" alt="Lift Planner Pro Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-white font-bold text-xl">Lift Planner Pro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/documentation" className="text-slate-300 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
              Contact
            </Link>

            <ThemeToggle />

            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <LogoutButton
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#features" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/documentation" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/about" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">
                Contact
              </Link>
              {!session && (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/auth/signin" className="block">
                    <Button variant="ghost" className="w-full text-slate-300 hover:text-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
              {session && (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" className="w-full text-slate-300 hover:text-white">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <LogoutButton
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
