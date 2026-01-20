"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, Loader2 } from "lucide-react"

const plans = [
  {
    name: "Professional",
    price: "£19",
    period: "/month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1RrBNCFzzHwoqssW6DtAPF2N", // Professional Plan Price ID
    description: "Complete professional CAD software for lifting and rigging",
    trialDays: 7,
    features: [
      "7-Day Free Trial",
      "Full 2D CAD Drawing Suite",
      "Advanced RAMS Generator",
      "Load & Tension Calculators",
      "Step Plan Module",
      "Rigging Loft Management",
      "Learning Management System",
      "Image Tracing & Blocks",
      "Professional Title Blocks",
      "Unlimited Projects",
      "Cloud Storage",
      "Team Chat & Video Calling",
      "Priority Email Support",
      "Regular Updates",
    ],
    popular: true,
    gradient: "from-blue-600 to-cyan-500",
  },
]

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setLoadingPlan(plan.name)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Professional Pricing
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            One comprehensive plan with all the professional features you need for lifting and rigging.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center max-w-2xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className="relative bg-slate-800/50 backdrop-blur-sm border-blue-500/50 hover:border-blue-400/50 transition-all duration-300 scale-105"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Professional Plan
                </div>
              </div>

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-slate-300">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.name}
                  className="w-full py-3 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Your Subscription"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-slate-400 mb-4">All plans include 14-day free trial • No setup fees • Cancel anytime</p>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
            Compare All Features
          </Button>
        </div>
      </div>
    </section>
  )
}
