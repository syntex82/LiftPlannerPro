import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import NewFeatures from "@/components/new-features"
import Features from "@/components/features"
import Capabilities from "@/components/capabilities"
import TechnologyStack from "@/components/technology-stack"
import DesktopRecommendations from "@/components/desktop-recommendations"
import Pricing from "@/components/pricing"
import Testimonials from "@/components/testimonials"
import Footer from "@/components/footer"
import ReviewSystem from '@/components/reviews/ReviewSystem'
import ReviewStructuredData from '@/components/seo/ReviewStructuredData'
import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  openGraph: {
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    url: 'https://liftplannerpro.co.uk',
    images: [
      {
        url: 'https://liftplannerpro.co.uk/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
      }
    ],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <ReviewStructuredData />
      <Navigation />
      <Hero />
      <NewFeatures />
      <Features />
      <Capabilities />
      <TechnologyStack />
      <DesktopRecommendations />
      <Pricing />

      {/* Customer Reviews Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of professionals who trust Lift Planner Pro for their critical lifting operations
            </p>
          </div>
          <ReviewSystem />
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  )
}