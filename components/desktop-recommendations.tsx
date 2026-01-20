"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Tablet, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Eye,
  MousePointer,
  Keyboard,
  Wifi,
  ArrowRight,
  Star
} from "lucide-react"
import Link from "next/link"

export default function DesktopRecommendations() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-full p-4">
              <Monitor className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Optimized for Desktop & Laptop
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Lift Planner Pro is designed for professional use on desktop and laptop computers. 
            While our platform works on all devices, you'll get the best experience with a full-sized screen and keyboard.
          </p>
        </div>

        {/* Device Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Desktop - Recommended */}
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="bg-green-600/20 border border-green-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-white text-xl">Desktop Computer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Large screen (24"+ recommended)</span>
                </div>
                <div className="flex items-center space-x-3 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Full keyboard & mouse</span>
                </div>
                <div className="flex items-center space-x-3 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Maximum performance</span>
                </div>
                <div className="flex items-center space-x-3 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All features available</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">100%</div>
                  <div className="text-sm text-green-300">Feature Access</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Laptop - Good */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Laptop className="w-8 h-8 text-blue-400" />
              </div>
              <CardTitle className="text-white text-xl">Laptop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-blue-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Portable & convenient</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Full keyboard & trackpad</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Good performance</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All features available</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">95%</div>
                  <div className="text-sm text-blue-300">Feature Access</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile/Tablet - Limited */}
          <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-500/30">
            <CardHeader className="text-center pb-4">
              <div className="bg-amber-600/20 border border-amber-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-amber-400" />
              </div>
              <CardTitle className="text-white text-xl">Mobile & Tablet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Small screen limitations</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Touch-only interface</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Basic features work</span>
                </div>
                <div className="flex items-center space-x-3 text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Limited CAD functionality</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">60%</div>
                  <div className="text-sm text-amber-300">Feature Access</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Desktop/Laptop is Better */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Why Desktop/Laptop Provides the Best Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Larger Display</h4>
              <p className="text-slate-300 text-sm">
                See detailed CAD drawings, technical specifications, and multiple panels simultaneously
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600/20 border border-green-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MousePointer className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Precise Control</h4>
              <p className="text-slate-300 text-sm">
                Mouse precision for accurate CAD operations, measurements, and detailed editing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Keyboard className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Keyboard Shortcuts</h4>
              <p className="text-slate-300 text-sm">
                Fast workflow with professional keyboard shortcuts and hotkeys
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Better Performance</h4>
              <p className="text-slate-300 text-sm">
                Faster rendering, smoother interactions, and better multitasking capabilities
              </p>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Recommended System Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Monitor className="w-5 h-5 text-blue-400 mr-2" />
                Minimum Requirements
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <span>Screen: 1366x768 resolution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <span>Browser: Chrome, Firefox, Safari, Edge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <span>RAM: 4GB minimum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  <span>Internet: Stable broadband connection</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 text-green-400 mr-2" />
                Recommended Setup
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Screen: 1920x1080 or higher</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Browser: Latest Chrome or Firefox</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>RAM: 8GB or more</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Input: Mouse + keyboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Experience Professional Lift Planning?
          </h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Get started with Lift Planner Pro on your desktop or laptop for the complete professional experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
