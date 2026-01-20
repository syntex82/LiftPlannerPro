"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Coffee, Zap, Star } from "lucide-react"

interface SmartUpgradePromptProps {
  trigger: 'calculation_limit' | 'export_attempt' | 'project_limit'
  onClose: () => void
  onPurchase: (item: string) => void
}

export default function SmartUpgradePrompt({ trigger, onClose, onPurchase }: SmartUpgradePromptProps) {
  const [showPrompt, setShowPrompt] = useState(true)

  const getPromptContent = () => {
    switch (trigger) {
      case 'calculation_limit':
        return {
          title: "Need One More Calculation?",
          subtitle: "You've used your 10 free calculations this month",
          mainOffer: {
            name: "Extra Calculation",
            price: "99p",
            description: "Just 99p for one more calculation",
            comparison: "Less than a coffee! ☕"
          },
          alternatives: [
            { name: "Coffee Pack", price: "£3.99", description: "5 calculations + bonus", value: "£1 bonus!" },
            { name: "Lunch Pack", price: "£8.99", description: "12 calculations + bonus", value: "£3 bonus!" }
          ]
        }

      case 'export_attempt':
        return {
          title: "Want to Export This?",
          subtitle: "Export your professional drawings",
          mainOffer: {
            name: "PDF Export",
            price: "£1.49",
            description: "High-quality PDF export",
            comparison: "Less than a coffee! ☕"
          },
          alternatives: [
            { name: "Remove Watermark", price: "49p", description: "Clean professional look", value: "Tiny cost!" },
            { name: "DWG Export", price: "£2.99", description: "Professional CAD format", value: "Industry standard!" }
          ]
        }

      case 'project_limit':
        return {
          title: "Need Another Project?",
          subtitle: "You've reached your 3 project limit",
          mainOffer: {
            name: "Extra Project Slot",
            price: "£1.99",
            description: "Add one more project",
            comparison: "Less than a sandwich! 🥪"
          },
          alternatives: [
            { name: "Coffee Pack", price: "£3.99", description: "Multiple extras + bonus", value: "£1 bonus!" },
            { name: "Pro Subscription", price: "£29/mo", description: "Unlimited everything", value: "Best for regular use!" }
          ]
        }

      default:
        return {
          title: "Unlock This Feature",
          subtitle: "Small payment for big value",
          mainOffer: {
            name: "Quick Unlock",
            price: "99p",
            description: "Instant access",
            comparison: "Pocket change! 💰"
          },
          alternatives: []
        }
    }
  }

  const content = getPromptContent()

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-2 border-blue-200 shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center space-y-2">
            <CardTitle className="text-xl text-slate-800">{content.title}</CardTitle>
            <p className="text-slate-600 text-sm">{content.subtitle}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Offer - Highlighted */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Coffee className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">{content.mainOffer.price}</span>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800">{content.mainOffer.name}</h3>
                <p className="text-sm text-slate-600">{content.mainOffer.description}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">{content.mainOffer.comparison}</p>
              </div>

              <Button 
                onClick={() => onPurchase(content.mainOffer.name.toLowerCase().replace(/\s+/g, '_'))}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Get It Now - {content.mainOffer.price}
              </Button>
            </div>
          </div>

          {/* Alternative Options */}
          {content.alternatives.length > 0 && (
            <div className="space-y-3">
              <p className="text-center text-sm text-slate-500">Or choose better value:</p>
              
              {content.alternatives.map((alt, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">{alt.name}</h4>
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                          {alt.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{alt.description}</p>
                    </div>
                    <div className="text-right ml-3">
                      <div className="font-semibold text-slate-800">{alt.price}</div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onPurchase(alt.name.toLowerCase().replace(/\s+/g, '_'))}
                        className="mt-1 text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Choose
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust Signals */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                Instant access
              </span>
              <span>•</span>
              <span>No subscription</span>
              <span>•</span>
              <span>Pay once, use forever</span>
            </div>
            
            <p className="text-xs text-slate-400">
              💡 Tip: Most users find the value worth much more than the tiny cost!
            </p>
          </div>

          {/* Close Option */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              Maybe later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
