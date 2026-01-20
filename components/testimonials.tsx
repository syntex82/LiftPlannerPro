import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Quote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Senior Lift Engineer",
    company: "Construction Dynamics Ltd",
    rating: 5,
    quote:
      "Lift Planner Pro has revolutionized our lift planning process. The RAMS generator alone saves us hours of work on every project.",
    avatar: "/testimonial-avatars/sarah.png",
  },
  {
    name: "Michael Chen",
    role: "Project Manager",
    company: "Heavy Lift Solutions",
    rating: 5,
    quote:
      "The load calculator with integrated crane charts is incredibly accurate. We've reduced planning errors by 90% since switching.",
    avatar: "/testimonial-avatars/mike.png",
  },
  {
    name: "Emma Rodriguez",
    role: "Safety Coordinator",
    company: "Industrial Crane Services",
    rating: 5,
    quote:
      "The safety resource library is comprehensive and always up-to-date. It's become our go-to reference for all lifting operations.",
    avatar: "/testimonial-avatars/emma.png",
  },
  {
    name: "David Thompson",
    role: "Operations Director",
    company: "Precision Lifting Co",
    rating: 5,
    quote:
      "The modern UI and cloud storage make collaboration seamless. Our team productivity has increased significantly.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Lisa Park",
    role: "CAD Specialist",
    company: "Engineering Solutions Inc",
    rating: 5,
    quote: "The 2D CAD tools are intuitive and powerful. The snap-to-grid feature makes precise drawings effortless.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Robert Wilson",
    role: "Crane Operator",
    company: "Metro Crane Rentals",
    rating: 5,
    quote:
      "Finally, software that understands the real-world challenges of lift planning. The calculations are spot-on every time.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Trusted by
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Industry Professionals
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            See what lift planning professionals are saying about Lift Planner Pro.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-blue-400 mb-4" />

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                    <div className="text-sm text-blue-400">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-300 mb-6 text-lg">Join thousands of professionals who trust Lift Planner Pro</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
