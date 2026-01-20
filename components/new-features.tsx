"use client"

import { Box, Layers, MousePointer, Wrench } from 'lucide-react'

export default function NewFeatures() {
  const newFeatures = [
    {
      icon: Box,
      title: "3D CAD Modeling Suite",
      description: "Complete 3D modeling environment with professional drawing tools, transform controls, and real-time 3D visualization.",
      features: ["3D Object Creation", "Transform Gizmos", "Real-time Rendering", "Professional Viewport"],
      gradient: "from-blue-500 to-cyan-400",
      isNew: true
    },
    {
      icon: Wrench,
      title: "Crane Parts Library",
      description: "Realistic crane components including chassis with outriggers, boom assemblies, counterweights, operator cabs, and hook blocks.",
      features: ["Realistic Crane Base", "Boom with Hydraulics", "Operator Cab", "Hook Block Assembly"],
      gradient: "from-green-500 to-emerald-400",
      isNew: true
    },
    {
      icon: Layers,
      title: "Professional Layer System",
      description: "Organize your 3D models with a complete layer management system. Hide/show objects, rename layers, and organize by crane components.",
      features: ["Layer Visibility", "Object Organization", "Color Coding", "Layer Deletion"],
      gradient: "from-purple-500 to-pink-400",
      isNew: true
    },
    {
      icon: MousePointer,
      title: "CAD Precision Tools",
      description: "Professional CAD-like drawing experience with crosshair cursors, coordinate tracking, snap-to-grid, and real-time feedback.",
      features: ["Crosshair Cursors", "Coordinate Display", "Grid Snapping", "Drawing Preview"],
      gradient: "from-orange-500 to-red-400",
      isNew: true
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-blue-300 text-sm font-medium">Latest Updates</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            New 3D CAD Features
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-2">
              Professional Modeling Suite
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of lift planning with our complete 3D CAD modeling environment, 
            realistic crane parts library, and professional precision tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {newFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              {/* New Badge */}
              {feature.isNew && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-300 transition-all duration-300">
                {feature.title}
              </h3>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-2">
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                    <span className="text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience Professional 3D CAD?
            </h3>
            <p className="text-slate-300 mb-6">
              Try our new 3D modeling suite with realistic crane parts and professional precision tools.
            </p>
            <a
              href="/cad-3d"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              <Box className="w-5 h-5" />
              Launch 3D CAD Suite
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
