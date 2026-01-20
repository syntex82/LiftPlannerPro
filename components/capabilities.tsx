import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Palette, MessageSquare, GraduationCap, Calculator,
  Brain, FileText, Database, Shield, Monitor, Zap,
  ArrowRight, CheckCircle, Star
} from "lucide-react"

const capabilities = [
  {
    category: "CAD & Design",
    icon: Palette,
    gradient: "from-blue-500 to-cyan-400",
    features: [
      "Professional 2D CAD Editor with advanced drawing tools",
      "Line, Circle, Rectangle, Polyline, Text, and Dimension tools",
      "Advanced operations: Trim, Mirror, Join, Array, and Rotate",
      "Snap-to-Grid and Snap-to-Objects for precision",
      "Layer management with visibility and locking controls",
      "Coordinate input system for exact positioning",
      "Rulers, grid display, and measurement tools",
      "Professional title blocks and drawing templates",
      "Image insertion with scaling and positioning",
      "Export to multiple formats (PDF, PNG, DWG)"
    ]
  },
  {
    category: "Team Collaboration",
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-400",
    features: [
      "Real-time team chat with instant messaging",
      "File upload and sharing (images, documents, CAD files)",
      "@Mentions system with auto-complete suggestions",
      "Message reactions with emoji support",
      "Message threading and reply functionality",
      "Floating chat in CAD editor for design collaboration",
      "Project-specific chat rooms and channels",
      "Online status indicators and typing notifications",
      "Message search and history management",
      "Mobile-responsive chat interface"
    ]
  },
  {
    category: "Learning & Training",
    icon: GraduationCap,
    gradient: "from-purple-500 to-pink-400",
    features: [
      "Complete Learning Management System (LMS)",
      "Interactive safety training modules",
      "25-question quizzes with instant feedback",
      "Certificate generation with professional templates",
      "Progress tracking and completion analytics",
      "Lift planning and rigging safety courses",
      "OSHA compliance training materials",
      "Video tutorials and interactive content",
      "Personalized learning paths",
      "Mobile-friendly learning interface"
    ]
  },
  {
    category: "Calculations & Analysis",
    icon: Calculator,
    gradient: "from-orange-500 to-red-400",
    features: [
      "Advanced load calculation engine",
      "Tension calculator for chainblocks and rigging",
      "Angle multiplier calculations for complex lifts",
      "Safety factor analysis and recommendations",
      "Crane capacity charts and load moment calculations",
      "Center of gravity calculations",
      "Sling angle and load distribution analysis",
      "Wind load and environmental factor calculations",
      "Automated safety compliance checking",
      "Professional calculation reports and documentation"
    ]
  },
  {
    category: "AI & Safety",
    icon: Brain,
    gradient: "from-indigo-500 to-purple-400",
    features: [
      "AI-powered safety analysis and hazard identification",
      "Intelligent risk assessment with automated scoring",
      "Safety recommendation engine",
      "Compliance checking against industry standards",
      "Hazard prediction and prevention suggestions",
      "Automated RAMS (Risk Assessment Method Statement) generation",
      "Safety checklist generation based on lift parameters",
      "Incident prediction and prevention analytics",
      "Real-time safety monitoring during operations",
      "Integration with safety databases and regulations"
    ]
  },
  {
    category: "Project Management",
    icon: FileText,
    gradient: "from-teal-500 to-cyan-400",
    features: [
      "Step plan module for project sequence planning",
      "Professional HTML and PDF export capabilities",
      "Industry-standard formatting and templates",
      "Project timeline and milestone tracking",
      "Resource allocation and equipment scheduling",
      "Rigging loft management system",
      "Equipment certification tracking",
      "In/out of service status management",
      "Comprehensive logging and audit trails",
      "Integration with project management workflows"
    ]
  }
]

export default function Capabilities() {
  return (
    <section className="py-24 bg-slate-800/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comprehensive
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Capabilities
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Explore the full range of professional features designed for modern lift planning and execution.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {capabilities.map((capability, index) => (
            <Card
              key={index}
              className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${capability.gradient} flex items-center justify-center mr-4`}
                  >
                    <capability.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{capability.category}</h3>
                </div>
                
                <div className="space-y-3">
                  {capability.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience Professional Lift Planning?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who trust Lift Planner Pro for their critical lifting operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8"
                >
                  View Demo
                  <Star className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
