"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Zap, 
  Star, 
  Clock, 
  Download, 
  Shield,
  Calculator,
  FileText,
  Headphones
} from "lucide-react"

interface FreemiumUpgradeProps {
  userCredits?: number
  onPurchaseCredits?: () => void
  onUpgradeSubscription?: () => void
}

export default function FreemiumUpgrade({ 
  userCredits = 0, 
  onPurchaseCredits,
  onUpgradeSubscription 
}: FreemiumUpgradeProps) {
  const [payPerUseServices, setPayPerUseServices] = useState<any[]>([])

  useEffect(() => {
    // Load affordable pay-per-use services
    const services = [
      {
        id: 'extra_calculation',
        name: 'Extra Calculation',
        price: 0.99,
        icon: Calculator,
        description: 'One more calculation (coffee price!)'
      },
      {
        id: 'cad_export_pdf',
        name: 'PDF Export',
        price: 1.49,
        icon: Download,
        description: 'Professional PDF export'
      },
      {
        id: 'remove_watermark',
        name: 'Remove Watermark',
        price: 0.49,
        icon: Star,
        description: 'Clean professional look'
      },
      {
        id: 'basic_consultation',
        name: '15-min Quick Help',
        price: 9.99,
        icon: Headphones,
        description: 'Quick expert consultation'
      }
    ]
    setPayPerUseServices(services)
  }, [])

  const creditPackages = [
    {
      id: 'coffee',
      name: 'Coffee Pack ☕',
      credits: 5,
      price: 3.99,
      bonus: 1,
      popular: false
    },
    {
      id: 'lunch',
      name: 'Lunch Pack 🥪',
      credits: 12,
      price: 8.99,
      bonus: 3,
      popular: true
    },
    {
      id: 'dinner',
      name: 'Dinner Pack 🍽️',
      credits: 25,
      price: 17.99,
      bonus: 7,
      popular: false
    }
  ]

  return (
    <div className="space-y-8">
      {/* Current Credits */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Credits</h3>
              <p className="text-blue-100">Available for pay-per-use services</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">£{userCredits.toFixed(2)}</div>
              <p className="text-blue-100 text-sm">in credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription vs Pay-Per-Use Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Option */}
        <Card className="border-2 border-green-500 bg-green-50/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-600">Monthly Subscription</CardTitle>
              <Badge className="bg-green-600 text-white">Best Value</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">£29/month</div>
              <p className="text-slate-600">Unlimited everything</p>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Zap className="w-4 h-4 text-green-500 mr-2" />
                Unlimited calculations
              </li>
              <li className="flex items-center text-sm">
                <Download className="w-4 h-4 text-green-500 mr-2" />
                Unlimited exports (DWG, PDF)
              </li>
              <li className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-green-500 mr-2" />
                Unlimited rigging plans
              </li>
              <li className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center text-sm">
                <Star className="w-4 h-4 text-green-500 mr-2" />
                All premium features
              </li>
            </ul>

            <Button 
              onClick={onUpgradeSubscription}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        {/* Pay-Per-Use Option */}
        <Card className="border-2 border-blue-500 bg-blue-50/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-600">Pay-Per-Use</CardTitle>
              <Badge variant="outline" className="border-blue-500 text-blue-600">Flexible</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">49p-£9.99</div>
              <p className="text-slate-600">Coffee to lunch prices!</p>
            </div>
            
            <div className="space-y-2">
              {payPerUseServices.slice(0, 4).map((service) => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <service.icon className="w-4 h-4 text-blue-500 mr-2" />
                    <span>{service.name}</span>
                  </div>
                  <span className="font-semibold text-blue-600">£{service.price}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={onPurchaseCredits}
              variant="outline" 
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Credit Packages */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Credit Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-2 border-orange-500' : ''}`}>
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-2xl font-bold">£{pkg.price}</div>
                  <p className="text-slate-600">for £{pkg.credits} credits</p>
                  {pkg.bonus > 0 && (
                    <p className="text-green-600 text-sm font-semibold">
                      +£{pkg.bonus} bonus!
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={() => onPurchaseCredits?.()}
                  className={`w-full ${pkg.popular ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                >
                  Purchase Credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Value Comparison */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">💡 Which option is right for you?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h5 className="font-semibold text-green-600 mb-2">Choose Subscription if:</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• You use the software regularly (3+ times/week)</li>
                <li>• You need unlimited calculations and exports</li>
                <li>• You want priority support</li>
                <li>• You prefer predictable monthly costs</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-blue-600 mb-2">Choose Pay-Per-Use if:</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• You use the software occasionally</li>
                <li>• You only need specific features sometimes</li>
                <li>• You prefer to pay only for what you use</li>
                <li>• You want to try premium features first</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
