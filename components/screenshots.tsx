"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const screenshots = [
  {
    title: "CAD Drawing Interface",
    description: "Professional 2D drawing tools with snap-to-grid functionality",
    image: "/cad-interface.png",
  },
  {
    title: "RAMS Generator",
    description: "Automated risk assessment and method statement creation",
    image: "/rams-generator.png",
  },
  {
    title: "Load Calculator",
    description: "Advanced load calculations with crane charts integration",
    image: "/load-calculator.png",
  },
  {
    title: "Modern UI Design",
    description: "Intuitive ribbon-style interface for professional workflows",
    image: "/features/modern-ui.png",
  },
  {
    title: "Database Storage",
    description: "Flexible storage with SQLite and Supabase integration",
    image: "/features/database-storage.png",
  },
]

export default function Screenshots() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <section id="screenshots" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            See Lift Planner Pro
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              In Action
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Explore the intuitive interface and powerful features that make lift planning efficient and precise.
          </p>
        </div>

        {/* Main Screenshot Carousel */}
        <div className="relative mb-12">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={screenshots[currentIndex].image || "/placeholder.svg"}
                  alt={screenshots[currentIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{screenshots[currentIndex].title}</h3>
                  <p className="text-slate-300 text-lg">{screenshots[currentIndex].description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
            onClick={nextSlide}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center space-x-4 overflow-x-auto pb-4">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index === currentIndex ? "border-blue-500 scale-110" : "border-slate-600 hover:border-slate-500"
              }`}
            >
              <Image
                src={screenshot.image || "/placeholder.svg"}
                alt={screenshot.title}
                width={96}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
