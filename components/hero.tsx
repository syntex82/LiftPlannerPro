"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Cpu, FileText, Calculator, GraduationCap, Wrench } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-background.png"
          alt="Professional crane operations"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/95"></div>
      </div>

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-10 backdrop-blur-sm">
            <Shield className="w-4 h-4 mr-2" />
            Professional Lift Planning Software
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            Plan Safer Lifts
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
              With Confidence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            The complete platform for crane and lifting operations.
            CAD design, AI safety analysis, load calculations, and training — all in one place.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14 max-w-5xl mx-auto">
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <Cpu className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">2D/3D CAD</div>
            </div>
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">AI Safety</div>
            </div>
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <Calculator className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">Load Calc</div>
            </div>
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <FileText className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">RAMS</div>
            </div>
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">Training</div>
            </div>
            <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300">
              <Wrench className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-white font-medium text-sm">Equipment</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-10 py-6 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800/50 hover:border-slate-500 px-10 py-6 text-lg font-semibold transition-all duration-300 bg-transparent rounded-xl"
              >
                View Features
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
