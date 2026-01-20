import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const technologies = [
  {
    category: "Frontend",
    gradient: "from-blue-500 to-cyan-400",
    technologies: [
      { name: "Next.js 14", description: "React framework with App Router" },
      { name: "TypeScript", description: "Type-safe development" },
      { name: "Tailwind CSS", description: "Utility-first styling" },
      { name: "Shadcn/ui", description: "Modern component library" },
      { name: "Lucide Icons", description: "Beautiful icon system" },
      { name: "Canvas API", description: "Advanced CAD rendering" }
    ]
  },
  {
    category: "Backend & API",
    gradient: "from-green-500 to-emerald-400",
    technologies: [
      { name: "Next.js API Routes", description: "Serverless API endpoints" },
      { name: "NextAuth.js", description: "Authentication system" },
      { name: "Prisma ORM", description: "Database management" },
      { name: "Server-Sent Events", description: "Real-time chat" },
      { name: "File Upload API", description: "Secure file handling" },
      { name: "RESTful APIs", description: "Standard API design" }
    ]
  },
  {
    category: "Database & Storage",
    gradient: "from-purple-500 to-pink-400",
    technologies: [
      { name: "SQLite", description: "Local development database" },
      { name: "PostgreSQL", description: "Production database" },
      { name: "File System", description: "Local file storage" },
      { name: "Cloud Storage", description: "Scalable file storage" },
      { name: "Session Storage", description: "User session management" },
      { name: "Cache Management", description: "Performance optimization" }
    ]
  },
  {
    category: "Security & Auth",
    gradient: "from-red-500 to-orange-400",
    technologies: [
      { name: "NextAuth.js", description: "Secure authentication" },
      { name: "JWT Tokens", description: "Stateless authentication" },
      { name: "CSRF Protection", description: "Cross-site request forgery protection" },
      { name: "Security Logging", description: "Comprehensive audit trails" },
      { name: "Role-based Access", description: "Granular permissions" },
      { name: "SSL/TLS", description: "Encrypted communications" }
    ]
  },
  {
    category: "Real-time Features",
    gradient: "from-indigo-500 to-purple-400",
    technologies: [
      { name: "Server-Sent Events", description: "Real-time messaging" },
      { name: "WebSocket Ready", description: "Bi-directional communication" },
      { name: "Live Updates", description: "Instant synchronization" },
      { name: "Typing Indicators", description: "Real-time user feedback" },
      { name: "Online Status", description: "User presence tracking" },
      { name: "Push Notifications", description: "Instant alerts" }
    ]
  },
  {
    category: "Development & Deployment",
    gradient: "from-teal-500 to-cyan-400",
    technologies: [
      { name: "Git Version Control", description: "Source code management" },
      { name: "ESLint & Prettier", description: "Code quality tools" },
      { name: "Environment Config", description: "Multi-environment support" },
      { name: "SSL Certificates", description: "HTTPS deployment" },
      { name: "Error Boundaries", description: "Graceful error handling" },
      { name: "Performance Monitoring", description: "Application analytics" }
    ]
  }
]

const stats = [
  { label: "Lines of Code", value: "50,000+", description: "Professional codebase" },
  { label: "Components", value: "200+", description: "Reusable UI components" },
  { label: "API Endpoints", value: "50+", description: "Comprehensive API coverage" },
  { label: "Features", value: "100+", description: "Complete feature set" },
  { label: "Test Coverage", value: "90%+", description: "Reliable and tested" },
  { label: "Performance", value: "A+ Grade", description: "Optimized for speed" }
]

export default function TechnologyStack() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Built with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Modern Technology
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Powered by cutting-edge technologies for performance, security, and scalability.
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {technologies.map((tech, index) => (
            <Card
              key={index}
              className="group bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${tech.gradient} mr-3`}
                  ></div>
                  <h3 className="text-lg font-bold text-white">{tech.category}</h3>
                </div>
                
                <div className="space-y-3">
                  {tech.technologies.map((technology, idx) => (
                    <div key={idx} className="border-l-2 border-slate-700 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{technology.name}</span>
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          Active
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{technology.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            By the Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-white font-medium text-sm mb-1">{stat.label}</div>
                <div className="text-slate-400 text-xs">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Architecture Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="text-white font-semibold mb-2">Performance</h4>
              <p className="text-slate-400 text-sm">Optimized for speed with caching, lazy loading, and efficient rendering</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="text-white font-semibold mb-2">Security</h4>
              <p className="text-slate-400 text-sm">Enterprise-grade security with authentication, authorization, and audit logging</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="text-white font-semibold mb-2">Responsive</h4>
              <p className="text-slate-400 text-sm">Works seamlessly across desktop, tablet, and mobile devices</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="text-white font-semibold mb-2">Real-time</h4>
              <p className="text-slate-400 text-sm">Live updates, instant messaging, and collaborative features</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
