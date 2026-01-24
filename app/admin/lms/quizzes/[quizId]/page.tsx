'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  question: string
  questionType: string
  options: Option[]
  explanation: string | null
  points: number
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number
  timeLimit: number | null
  questions: Question[]
  course: { id: string; title: string } | null
  lesson: { id: string; title: string } | null
}

export default function EditQuizPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const quizId = params?.quizId as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    questionType: 'multiple_choice',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    explanation: '',
    points: 1
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/admin/lms/quizzes/${quizId}`)
      return
    }
    fetchQuiz()
  }, [session, status, quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data.quiz)
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveQuiz = async (updates: Partial<Quiz>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) await fetchQuiz()
    } catch (error) {
      console.error('Failed to save quiz:', error)
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = async () => {
    if (!newQuestion.question?.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lms/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      })
      if (res.ok) {
        setNewQuestion({
          question: '',
          questionType: 'multiple_choice',
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          explanation: '',
          points: 1
        })
        await fetchQuiz()
      }
    } catch (error) {
      console.error('Failed to add question:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return
    try {
      await fetch(`/api/lms/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' })
      await fetchQuiz()
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', isCorrect: false }]
    }))
  }

  const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    }))
  }

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }))
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
        <h1 className="text-2xl text-white">Quiz Not Found</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href={quiz.course ? `/admin/lms/courses/${quiz.course.id}` : '/admin/lms'} className="text-slate-400 hover:text-white text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
          {quiz.course && <p className="text-slate-400">{quiz.course.title}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Quiz Settings */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Passing Score (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                defaultValue={quiz.passingScore}
                onBlur={(e) => saveQuiz({ passingScore: parseInt(e.target.value) || 80 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Attempts</label>
              <Input
                type="number"
                min="1"
                defaultValue={quiz.maxAttempts}
                onBlur={(e) => saveQuiz({ maxAttempts: parseInt(e.target.value) || 3 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Time Limit (min)</label>
              <Input
                type="number"
                min="0"
                defaultValue={quiz.timeLimit || ''}
                placeholder="No limit"
                onBlur={(e) => saveQuiz({ timeLimit: parseInt(e.target.value) || null })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </Card>

        {/* Existing Questions */}
        <h2 className="text-lg font-semibold text-white">Questions ({quiz.questions.length})</h2>
        {quiz.questions.map((q, idx) => (
          <Card key={q.id} className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-slate-400 text-sm">Question {idx + 1} • {q.points} point{q.points !== 1 ? 's' : ''}</span>
                <p className="text-white font-medium">{q.question}</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-400 border-red-400" onClick={() => deleteQuestion(q.id)}>
                Delete
              </Button>
            </div>
            <div className="space-y-1 ml-4">
              {(q.options as Option[]).map((opt, i) => (
                <div key={i} className={`text-sm ${opt.isCorrect ? 'text-green-400' : 'text-slate-400'}`}>
                  {opt.isCorrect ? '✓' : '○'} {opt.text}
                </div>
              ))}
            </div>
            {q.explanation && <p className="text-blue-400 text-sm mt-2 italic">{q.explanation}</p>}
          </Card>
        ))}

        {/* Add New Question */}
        <Card className="bg-purple-900/30 border-purple-600/30 p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Add New Question</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Question</label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter the question..."
                className="w-full h-20 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Type</label>
                <select
                  value={newQuestion.questionType}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value })}
                  className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="multi_select">Multi-Select</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Points</label>
                <Input
                  type="number"
                  min="1"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                  className="w-20 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Answer Options</label>
              {newQuestion.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={opt.isCorrect}
                    onChange={(e) => updateOption(i, 'isCorrect', e.target.checked)}
                    className="w-5 h-5"
                    title="Mark as correct"
                  />
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOption(i, 'text', e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                  />
                  {(newQuestion.options?.length || 0) > 2 && (
                    <Button variant="outline" size="sm" onClick={() => removeOption(i)}>×</Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>+ Add Option</Button>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Explanation (shown after answering)</label>
              <Input
                value={newQuestion.explanation || ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain the correct answer..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button onClick={addQuestion} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

