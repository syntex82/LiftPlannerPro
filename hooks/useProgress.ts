// Hook: useProgress
// Fetches user progress and statistics from database API

import { useState, useEffect } from 'react'

export interface ProgressStats {
  totalAttempts: number
  passedAttempts: number
  averageScore: number
  bestScore: number
  byDifficulty: {
    beginner: any[]
    intermediate: any[]
    advanced: any[]
  }
  recentAttempts: any[]
}

export function useProgress(userId: number | null) {
  const [progress, setProgress] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/progress?userId=${userId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch progress')
        }

        const data = await response.json()
        setProgress(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId])

  return { progress, loading, error }
}

export function useAttempts(userId: number | null, scenarioId?: number) {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        params.append('userId', userId.toString())
        if (scenarioId) {
          params.append('scenarioId', scenarioId.toString())
        }

        const response = await fetch(`/api/attempts?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch attempts')
        }

        const data = await response.json()
        setAttempts(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching attempts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()
  }, [userId, scenarioId])

  return { attempts, loading, error }
}

