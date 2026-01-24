'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  question: string
  questionType: string
  options: { text: string; isCorrect?: boolean }[]
  explanation?: string | null
  points: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number
  timeLimit: number | null
  shuffleQuestions: boolean
  showResults: boolean
  questions: Question[]
  course: { id: string; title: string } | null
  lesson: { id: string; title: string } | null
}

interface AttemptResult {
  score: number
  passed: boolean
  passingScore: number
  earnedPoints: number
  totalPoints: number
  results?: {
    questionId: string
    question: string
    explanation: string | null
    options: { text: string; isCorrect: boolean; wasSelected: boolean }[]
    isCorrect: boolean
  }[]
}

export default function QuizPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const quizId = params?.quizId as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [canAttempt, setCanAttempt] = useState(true)
  const [remainingAttempts, setRemainingAttempts] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/lms/quiz/${quizId}`)
      return
    }
    fetchQuiz()
  }, [quizId, session])

  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60) // Convert minutes to seconds
    }
  }, [quiz])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, result])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data.quiz)
      setCanAttempt(data.canAttempt)
      setRemainingAttempts(data.remainingAttempts)
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId: string, optionIndex: number, multiSelect = false) => {
    setAnswers(prev => {
      const current = prev[questionId] || []
      if (multiSelect) {
        if (current.includes(optionIndex)) {
          return { ...prev, [questionId]: current.filter(i => i !== optionIndex) }
        }
        return { ...prev, [questionId]: [...current, optionIndex] }
      }
      return { ...prev, [questionId]: [optionIndex] }
    })
  }

  const handleSubmit = async () => {
    if (!quiz || submitting) return
    setSubmitting(true)
    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      const res = await fetch(`/api/lms/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent })
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Quiz Not Found</h1>
          <Link href="/lms/courses"><Button>Back to Courses</Button></Link>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const isMultiSelect = question?.questionType === 'multi_select'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
              {quiz.course && <span className="text-slate-400 text-sm">{quiz.course.title}</span>}
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <span className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                  ⏱ {formatTime(timeLeft)}
                </span>
              )}
              {!result && (
                <span className="text-slate-400">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!canAttempt && !result ? (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Maximum Attempts Reached</h2>
            <p className="text-slate-400 mb-6">You have used all {quiz.maxAttempts} attempts for this quiz.</p>
            <Link href={quiz.course ? `/lms/courses/${quiz.course.id}` : '/lms/courses'}>
              <Button>Back to Course</Button>
            </Link>
          </Card>
        ) : result ? (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                {result.passed ? '🎉 Congratulations!' : '❌ Not Passed'}
              </h2>
              <p className="text-4xl font-bold text-white mb-2">{result.score}%</p>
              <p className="text-slate-400">
                {result.earnedPoints} of {result.totalPoints} points • Passing: {result.passingScore}%
              </p>
            </div>

            {result.results && (
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-white">Review Your Answers</h3>
                {result.results.map((r, idx) => (
                  <div key={r.questionId} className={`p-4 rounded-lg ${r.isCorrect ? 'bg-green-900/30 border border-green-600/30' : 'bg-red-900/30 border border-red-600/30'}`}>
                    <p className="text-white font-medium mb-2">{idx + 1}. {r.question}</p>
                    <div className="space-y-1 mb-2">
                      {r.options.map((opt, i) => (
                        <div key={i} className={`text-sm ${opt.isCorrect ? 'text-green-400' : opt.wasSelected ? 'text-red-400' : 'text-slate-400'}`}>
                          {opt.wasSelected ? '● ' : '○ '}{opt.text}
                          {opt.isCorrect && ' ✓'}
                        </div>
                      ))}
                    </div>
                    {r.explanation && <p className="text-blue-300 text-sm italic">{r.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Link href={quiz.course ? `/lms/courses/${quiz.course.id}` : '/lms/courses'}>
                <Button variant="outline">Back to Course</Button>
              </Link>
              {!result.passed && canAttempt && (
                <Button onClick={() => { setResult(null); setAnswers({}); setCurrentQuestion(0); }} className="bg-blue-600">
                  Try Again
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <div className="mb-6">
              <p className="text-lg text-white font-medium mb-4">{currentQuestion + 1}. {question.question}</p>
              <p className="text-slate-400 text-sm mb-4">
                {isMultiSelect ? 'Select all that apply' : 'Select one answer'} • {question.points} point{question.points !== 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  const isSelected = (answers[question.id] || []).includes(idx)
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(question.id, idx, isMultiSelect)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="mr-3">{isMultiSelect ? (isSelected ? '☑' : '☐') : (isSelected ? '●' : '○')}</span>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full mb-6">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!(answers[question.id]?.length > 0)}
                  className="bg-blue-600"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

