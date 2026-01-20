"use client"

// Scenario Library Component - Shows available training scenarios for trainees to choose from

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingScenario } from '@/lib/training-scenarios'
import { getAllScenarios } from '@/lib/scenario-manager'
import { BookOpen, Clock, Zap } from 'lucide-react'

interface ScenarioLibraryProps {
  onSelectScenario: (scenario: TrainingScenario) => void
}

export default function ScenarioLibrary({ onSelectScenario }: ScenarioLibraryProps) {
  // Get all available scenarios
  const [scenarios] = useState<TrainingScenario[]>(getAllScenarios())
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter scenarios based on selected filters
  const filteredScenarios = scenarios.filter(s => {
    if (selectedDifficulty && s.difficulty !== selectedDifficulty) return false
    if (selectedCategory && s.category !== selectedCategory) return false
    return true
  })

  // Get unique categories
  const categories = Array.from(new Set(scenarios.map(s => s.category)))

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600'
      case 'intermediate': return 'bg-yellow-600'
      case 'advanced': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Training Scenarios</h1>
        <p className="text-slate-300">Select a scenario to practice lift planning</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Difficulty Filter */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Difficulty</h3>
          <div className="space-y-2">
            <Button
              variant={selectedDifficulty === null ? "default" : "outline"}
              onClick={() => setSelectedDifficulty(null)}
              className="w-full justify-start"
            >
              All Levels
            </Button>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? "default" : "outline"}
                onClick={() => setSelectedDifficulty(level)}
                className="w-full justify-start capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Category</h3>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="w-full justify-start"
            >
              All Categories
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="w-full justify-start"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map(scenario => (
          <Card key={scenario.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">{scenario.title}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">{scenario.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-slate-300">{scenario.description}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {scenario.estimatedTime} min
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {scenario.learningObjectives.length} objectives
                </div>
              </div>

              {/* Learning Objectives Preview */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1">You will learn:</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  {scenario.learningObjectives.slice(0, 2).map((obj, i) => (
                    <li key={i}>• {obj}</li>
                  ))}
                  {scenario.learningObjectives.length > 2 && (
                    <li>• +{scenario.learningObjectives.length - 2} more</li>
                  )}
                </ul>
              </div>

              {/* Start Button */}
              <Button
                onClick={() => onSelectScenario(scenario)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Scenario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No scenarios message */}
      {filteredScenarios.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center text-slate-400">
            No scenarios match your filters. Try adjusting your selection.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

