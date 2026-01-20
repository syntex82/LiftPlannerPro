"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Cpu, FileText, Calculator, GraduationCap, Wrench, Play, CheckCircle2, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from 'next/dynamic'

// Dynamic import for the CAD animation to avoid SSR issues
const AnimatedCAD = dynamic(() => import('@/components/hero/AnimatedCAD'), {
  ssr: false,
  loading: () => <div className="w-full max-w-2xl mx-auto h-[400px] bg-slate-800/30 rounded-xl animate-pulse" />
})

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            {/* Animated Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm animate-shimmer">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              AI-Powered Lift Planning
              <span className="ml-2 px-2 py-0.5 bg-blue-500/20 rounded-full text-xs">NEW</span>
            </div>

            {/* Main Headline with animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="inline-block animate-fade-in-up">Plan Safer Lifts</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                With Confidence
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The complete platform for crane and lifting operations.
              <span className="text-white font-medium"> CAD design, AI safety analysis, load calculations, and training</span> — all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              {[
                { icon: Cpu, label: '2D/3D CAD', color: 'blue' },
                { icon: Shield, label: 'AI Safety', color: 'cyan' },
                { icon: Calculator, label: 'Load Calc', color: 'green' },
                { icon: FileText, label: 'RAMS', color: 'orange' },
                { icon: GraduationCap, label: 'Training', color: 'purple' },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${feature.color}-500/10 border border-${feature.color}-500/20 text-${feature.color}-300 text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform cursor-default`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.label}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-6 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-slate-600 text-white hover:bg-white/5 hover:border-slate-400 px-8 py-6 text-lg font-semibold transition-all duration-300 bg-transparent rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-slate-400 text-sm">
              {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Animated CAD Preview */}
          <div className="relative hidden lg:block">
            {/* Glowing border effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>

            {/* CAD Preview Container */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
              {/* Window header */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-slate-400 text-sm font-mono">lift-plan-v2.cad</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">2D</span>
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded">3D</span>
                </div>
              </div>

              {/* Animated CAD Canvas */}
              <AnimatedCAD />

              {/* Status bar */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Auto-save enabled
                  </span>
                  <span>Scale: 1:100</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Grid: 5m</span>
                  <span>Snap: ON</span>
                </div>
              </div>
            </div>

            {/* Floating feature badges */}
            <div className="absolute -top-4 -right-4 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white text-sm font-medium shadow-lg animate-bounce-slow">
              ✓ AI Validated
            </div>
            <div className="absolute -bottom-4 -left-4 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-sm font-medium shadow-lg" style={{ animationDelay: '0.5s' }}>
              🔒 Secure Export
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 pt-12 border-t border-slate-800/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Lift Plans Created' },
              { value: '500+', label: 'Active Companies' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '24/7', label: 'Expert Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
