// Hook: useScenarios
// Fetches training scenarios from database API

import { useState, useEffect } from 'react'

export interface Scenario {
  id: number
  title: string
  description: string
  difficulty: string
  category: string
  estimated_time_minutes: number
  learning_objectives: string
  site_width: number
  site_length: number
  load_weight: number
  load_width: number
  load_length: number
  load_height: number
  load_fragile: boolean
}

interface UseScenarioOptions {
  difficulty?: string
  category?: string
}

export function useScenarios(options?: UseScenarioOptions) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query string
        const params = new URLSearchParams()
        if (options?.difficulty) {
          params.append('difficulty', options.difficulty)
        }
        if (options?.category) {
          params.append('category', options.category)
        }

        const url = `/api/scenarios${params.toString() ? '?' + params.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch scenarios')
        }

        const data = await response.json()
        setScenarios(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching scenarios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchScenarios()
  }, [options?.difficulty, options?.category])

  return { scenarios, loading, error }
}

export function useScenario(id: number) {
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/scenarios/${id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch scenario')
        }

        const data = await response.json()
        setScenario(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching scenario:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchScenario()
    }
  }, [id])

  return { scenario, loading, error }
}

