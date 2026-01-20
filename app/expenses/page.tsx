'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  Plus, 
  Receipt, 
  Home, 
  Car, 
  Utensils, 
  Fuel, 
  FileText,
  Download,
  Eye,
  Trash2,
  Edit,
  Calculator,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react'

interface Expense {
  id: string
  date: string
  category: 'accommodation' | 'meals' | 'travel' | 'fuel' | 'other'
  amount: number
  description: string
  receipt?: string
  location: string
  project?: string
  mileage?: number
  isReimbursable: boolean
}

const EXPENSE_CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation', icon: Home, color: 'bg-blue-600' },
  { value: 'meals', label: 'Meals & Subsistence', icon: Utensils, color: 'bg-green-600' },
  { value: 'travel', label: 'Travel & Transport', icon: Car, color: 'bg-purple-600' },
  { value: 'fuel', label: 'Fuel & Mileage', icon: Fuel, color: 'bg-orange-600' },
  { value: 'other', label: 'Other Expenses', icon: Receipt, color: 'bg-gray-600' }
]

export default function ExpensesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    location: '',
    project: '',
    mileage: '',
    isReimbursable: true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem('lift_planner_expenses')
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    localStorage.setItem('lift_planner_expenses', JSON.stringify(newExpenses))
  }

  const addExpense = () => {
    if (!selectedDate || !formData.category || !formData.amount || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      category: formData.category as any,
      amount: parseFloat(formData.amount),
      description: formData.description,
      location: formData.location,
      project: formData.project,
      mileage: formData.mileage ? parseFloat(formData.mileage) : undefined,
      isReimbursable: formData.isReimbursable
    }

    const updatedExpenses = [...expenses, newExpense]
    saveExpenses(updatedExpenses)

    // Reset form
    setFormData({
      category: '',
      amount: '',
      description: '',
      location: '',
      project: '',
      mileage: '',
      isReimbursable: true
    })
    setSelectedDate(undefined)
    setShowAddForm(false)
  }

  const deleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter(exp => exp.id !== id)
      saveExpenses(updatedExpenses)
    }
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, exp) => total + exp.amount, 0)
  }

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {}
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
    })
    return categoryTotals
  }

  const generateReport = async (format: 'html' | 'pdf') => {
    try {
      const response = await fetch('/api/expenses/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenses,
          format,
          dateRange: null // Could add date filtering later
        })
      })

      const data = await response.json()

      if (format === 'html') {
        // Open HTML report in new window
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(data.html)
          newWindow.document.close()
        }
      } else if (format === 'pdf') {
        // Create a temporary HTML page and trigger print
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(data.html)
          newWindow.document.close()
          // Trigger print dialog for PDF generation
          setTimeout(() => {
            newWindow.print()
          }, 500)
        }
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const categoryTotals = getExpensesByCategory()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-slate-300">
                ← Back to Dashboard
              </Button>
              <Receipt className="w-8 h-8 text-blue-400" />
              <h1 className="text-white font-bold text-xl">Expenses & Lodging</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => generateReport('html')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                HTML Report
              </Button>
              <Button onClick={() => generateReport('pdf')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Total Expenses</h3>
                  <p className="text-2xl font-bold text-green-400">£{getTotalExpenses().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Total Entries</h3>
                  <p className="text-2xl font-bold text-blue-400">{expenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Accommodation</h3>
                  <p className="text-2xl font-bold text-purple-400">£{(categoryTotals['accommodation'] || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Meals</h3>
                  <p className="text-2xl font-bold text-orange-400">£{(categoryTotals['meals'] || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Expense
          </Button>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Add New Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-white">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Amount (£) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label className="text-white">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Hotel, etc."
                  />
                </div>

                <div>
                  <Label className="text-white">Project</Label>
                  <Input
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    placeholder="Project name/code"
                  />
                </div>

                {formData.category === 'fuel' && (
                  <div>
                    <Label className="text-white">Mileage</Label>
                    <Input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                      placeholder="Miles driven"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-white">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the expense..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reimbursable"
                  checked={formData.isReimbursable}
                  onChange={(e) => setFormData({...formData, isReimbursable: e.target.checked})}
                />
                <Label htmlFor="reimbursable" className="text-white">Reimbursable expense</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={addExpense} className="bg-green-600 hover:bg-green-700">
                  Add Expense
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-300 text-lg font-semibold mb-2">No expenses recorded</h3>
                <p className="text-slate-400 mb-4">Start tracking your work expenses and lodging costs</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category)
                  const CategoryIcon = category?.icon || Receipt
                  
                  return (
                    <div key={expense.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${category?.color} rounded-lg flex items-center justify-center`}>
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{expense.description}</h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {format(new Date(expense.date), "dd/MM/yyyy")}
                              </span>
                              {expense.location && (
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {expense.location}
                                </span>
                              )}
                              {expense.project && (
                                <span>Project: {expense.project}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-400">£{expense.amount.toFixed(2)}</p>
                            {expense.isReimbursable && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                                Reimbursable
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteExpense(expense.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
