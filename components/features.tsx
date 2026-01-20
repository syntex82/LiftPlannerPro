import { Card, CardContent } from "@/components/ui/card"
import {
  Ruler, FileText, Calculator, Database, Shield, Palette,
  MessageSquare, Users, GraduationCap, Brain, Zap, Monitor,
  Settings, Lock, Download, Upload, Search, BarChart3,
  Layers, Grid, Move, RotateCcw, Copy, Scissors,
  FileImage, FileSpreadsheet, Printer, Cloud
} from "lucide-react"

const coreFeatures = [
  {
    icon: Ruler,
    title: "Professional 3D CAD Suite",
    description: "Complete 3D modeling environment with professional drawing tools, crane part library, layer management, and CAD-like precision cursors.",
    gradient: "from-blue-500 to-cyan-400",
    features: ["3D Modeling & Drawing", "Crane Parts Library", "Layer Management System", "CAD Precision Cursors", "Real-time Coordinates", "Professional Ribbon Interface"]
  },
  {
    icon: MessageSquare,
    title: "Real-Time Team Chat",
    description: "Integrated chat system with file sharing, @mentions, reactions, threading, and CAD collaboration features.",
    gradient: "from-green-500 to-emerald-400",
    features: ["File Upload & Sharing", "@Mentions System", "Message Reactions", "Floating CAD Chat"]
  },
  {
    icon: GraduationCap,
    title: "Learning Management System",
    description: "Complete LMS with safety training, quizzes, certifications, and progress tracking for lift operations.",
    gradient: "from-purple-500 to-pink-400",
    features: ["Safety Training Modules", "Interactive Quizzes", "Certificate Generation", "Progress Tracking"]
  },
  {
    icon: Calculator,
    title: "Load & Tension Calculators",
    description: "Advanced calculators for load analysis, tension calculations with chainblocks, and angle multipliers.",
    gradient: "from-orange-500 to-red-400",
    features: ["Load Calculations", "Tension Analysis", "Chainblock Calculations", "Safety Factors"]
  },
  {
    icon: Brain,
    title: "AI Safety Analysis",
    description: "Intelligent safety analysis with hazard identification, risk assessment, and automated recommendations.",
    gradient: "from-indigo-500 to-purple-400",
    features: ["Hazard Detection", "Risk Assessment", "Safety Recommendations", "Compliance Checking"]
  },
  {
    icon: FileText,
    title: "Step Plan Module",
    description: "Project sequence planning with HTML and PDF exports, professional formatting, and industry standards.",
    gradient: "from-teal-500 to-cyan-400",
    features: ["Sequence Planning", "HTML/PDF Export", "Professional Formatting", "Industry Standards"]
  }
]

const advancedFeatures = [
  {
    icon: Database,
    title: "Rigging Loft Management",
    description: "Track lifting equipment certifications, in/out service status, and comprehensive logging systems.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    icon: Shield,
    title: "Security & Authentication",
    description: "Professional user authentication, session management, and comprehensive security logging.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: Cloud,
    title: "File Management",
    description: "Advanced file handling with image insertion, scaling, CAD file support, and cloud storage.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Comprehensive admin panel with user management, session monitoring, and system analytics.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Monitor,
    title: "Responsive Design",
    description: "Professional interface that works seamlessly across desktop, tablet, and mobile devices.",
    gradient: "from-sky-500 to-blue-400",
  },
  {
    icon: Zap,
    title: "Performance Optimized",
    description: "Fast, efficient application with real-time updates, caching, and optimized rendering.",
    gradient: "from-lime-500 to-green-400",
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Complete Lift Planning
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Ecosystem
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Advanced CAD, Real-Time Chat, Learning Management, Load Calculations, and AI Safety Analysis - all in one platform.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Advanced Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
