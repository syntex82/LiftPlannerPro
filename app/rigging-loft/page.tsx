"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { DesktopRecommendation } from "@/components/ui/desktop-recommendation"
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  FileText,
  BarChart3,
  QrCode,
  Download,
  Upload,
  Home,
  Filter,
  Calendar,
  MapPin,
  Settings,
  Eye,
  Edit,
  Trash2,
  X
} from "lucide-react"
import Link from "next/link"

interface EquipmentItem {
  id: string
  equipmentNumber: string
  type: string
  category: string
  manufacturer: string
  model: string
  workingLoadLimit: number
  status: 'in_service' | 'out_of_service' | 'under_inspection' | 'condemned' | 'lost' | 'stolen'
  location: string
  lastInspection: string
  nextInspection: string
  certificationExpiry: string
  conditionRating: number
}

interface Alert {
  id: string
  equipmentId: string
  equipmentNumber: string
  type: 'certification_expiry' | 'inspection_due' | 'maintenance_due' | 'overdue_return' | 'condition_warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  dueDate: string
}

export default function RiggingLoftManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)


  // Dialog states
  const [showAddEquipmentDialog, setShowAddEquipmentDialog] = useState(false)
  const [showEditEquipmentDialog, setShowEditEquipmentDialog] = useState(false)
  const [showAddCertificationDialog, setShowAddCertificationDialog] = useState(false)
  const [showAddInspectionDialog, setShowAddInspectionDialog] = useState(false)
  const [showMaintenanceLogDialog, setShowMaintenanceLogDialog] = useState(false)
  const [showEquipmentDetailsDialog, setShowEquipmentDetailsDialog] = useState(false)
  const [selectedEquipmentForDetails, setSelectedEquipmentForDetails] = useState<EquipmentItem | null>(null)

  // Maintenance log form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipmentId: '',
    maintenanceType: '',
    description: '',
    performedBy: '',
    datePerformed: '',
    nextMaintenanceDate: '',
    cost: '',
    partsUsed: '',
    notes: ''
  })

  // Sample maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: '1',
      equipmentId: '1',
      maintenanceType: 'routine',
      description: 'Annual inspection and lubrication of all moving parts',
      performedBy: 'John Smith',
      datePerformed: '2024-01-15',
      nextMaintenanceDate: '2025-01-15',
      cost: '150.00',
      partsUsed: 'Grease, cleaning supplies',
      notes: 'All components in good condition'
    },
    {
      id: '2',
      equipmentId: '2',
      maintenanceType: 'repair',
      description: 'Replaced worn shackle pin',
      performedBy: 'Mike Johnson',
      datePerformed: '2024-02-20',
      nextMaintenanceDate: '2024-08-20',
      cost: '75.50',
      partsUsed: 'Shackle pin, safety clip',
      notes: 'Pin showed signs of wear, replaced as precaution'
    }
  ])
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showCheckinDialog, setShowCheckinDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)
  const [selectedReportType, setSelectedReportType] = useState('')

  // Form states
  const [newEquipment, setNewEquipment] = useState({
    equipmentNumber: '',
    type: '',
    category: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    workingLoadLimit: '',
    location: '',
    notes: ''
  })

  const [newCertification, setNewCertification] = useState({
    equipmentId: '',
    certificateNumber: '',
    certificateType: 'periodic',
    issuedDate: '',
    expiryDate: '',
    issuedBy: '',
    competentPerson: '',
    testLoad: '',
    testResult: 'pass',
    notes: ''
  })

  const [newInspection, setNewInspection] = useState({
    equipmentId: '',
    inspectionType: 'monthly',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    conditionRating: '5',
    defectsFound: false,
    defectDescription: '',
    actionRequired: '',
    inspectionResult: 'satisfactory'
  })

  const [newMovement, setNewMovement] = useState({
    equipmentId: '',
    movementType: 'check_out',
    fromLocation: '',
    toLocation: '',
    checkedOutBy: '',
    projectReference: '',
    expectedReturnDate: '',
    notes: ''
  })

  const [checkinData, setCheckinData] = useState({
    equipmentId: '',
    checkedInBy: '',
    actualReturnDate: new Date().toISOString().split('T')[0],
    conditionOnReturn: '5',
    notes: ''
  })

  const [movements, setMovements] = useState<Array<{
    id: string
    equipmentId: string
    equipmentNumber: string
    movementType: string
    fromLocation: string
    toLocation: string
    checkedOutBy: string
    checkedInBy?: string
    projectReference: string
    movementDate: string
    expectedReturnDate: string
    actualReturnDate?: string
    status: 'checked_out' | 'checked_in' | 'overdue'
    notes: string
  }>>([])

  const [reports, setReports] = useState({
    equipmentRegister: [],
    inspectionSchedule: [],
    expiryReport: [],
    utilizationReport: [],
    maintenanceLog: [],
    movementLog: []
  })

  // Equipment categories and types
  const equipmentCategories = [
    'Lifting Slings', 'Shackles', 'Hooks', 'Blocks & Pulleys', 'Wire Rope',
    'Chain', 'Spreader Beams', 'Eyebolts & Nuts', 'Clamps & Grips', 'Test Weights'
  ]

  const commonLocations = [
    'Bay A-1', 'Bay A-2', 'Bay A-3', 'Bay B-1', 'Bay B-2', 'Bay B-3',
    'Bay C-1', 'Bay C-2', 'Bay C-3', 'Inspection Bay', 'Repair Shop',
    'Test Area', 'Storage Rack 1', 'Storage Rack 2', 'Outdoor Storage',
    'Site Office', 'Workshop', 'Loading Bay'
  ]

  const equipmentTypes = {
    'Lifting Slings': ['Wire Rope Sling', 'Chain Sling', 'Synthetic Sling'],
    'Shackles': ['Bow Shackle', 'Dee Shackle', 'Safety Shackle'],
    'Hooks': ['Crane Hook', 'Safety Hook', 'Swivel Hook'],
    'Blocks & Pulleys': ['Snatch Block', 'Pulley Block'],
    'Wire Rope': ['Steel Wire Rope'],
    'Chain': ['Grade 80 Chain', 'Grade 100 Chain'],
    'Spreader Beams': ['Spreader Beam', 'Lifting Beam'],
    'Eyebolts & Nuts': ['Eyebolt', 'Swivel Eyebolt'],
    'Clamps & Grips': ['Wire Rope Clamp', 'Come Along'],
    'Test Weights': ['Test Weight']
  }

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading equipment data
    const mockEquipment: EquipmentItem[] = [
      {
        id: '1',
        equipmentNumber: 'SL-001',
        type: 'Wire Rope Sling',
        category: 'Lifting Slings',
        manufacturer: 'Crosby',
        model: 'S-409',
        workingLoadLimit: 5.0,
        status: 'in_service',
        location: 'Bay A-1',
        lastInspection: '2024-01-15',
        nextInspection: '2024-07-15',
        certificationExpiry: '2024-12-15',
        conditionRating: 5
      },
      {
        id: '2',
        equipmentNumber: 'SH-002',
        type: 'Bow Shackle',
        category: 'Shackles',
        manufacturer: 'Crosby',
        model: 'G-209',
        workingLoadLimit: 3.25,
        status: 'under_inspection',
        location: 'Inspection Bay',
        lastInspection: '2024-01-10',
        nextInspection: '2024-07-10',
        certificationExpiry: '2024-08-10',
        conditionRating: 4
      },
      {
        id: '3',
        equipmentNumber: 'CH-003',
        type: 'Grade 80 Chain',
        category: 'Chain',
        manufacturer: 'Pewag',
        model: 'G8-10',
        workingLoadLimit: 8.0,
        status: 'out_of_service',
        location: 'Repair Shop',
        lastInspection: '2023-12-20',
        nextInspection: '2024-06-20',
        certificationExpiry: '2024-06-20',
        conditionRating: 2
      }
    ]

    const mockAlerts: Alert[] = [
      {
        id: '1',
        equipmentId: '2',
        equipmentNumber: 'SH-002',
        type: 'certification_expiry',
        severity: 'high',
        title: 'Certification Expiring Soon',
        message: 'Bow Shackle SH-002 certification expires in 30 days',
        dueDate: '2024-08-10'
      },
      {
        id: '2',
        equipmentId: '3',
        equipmentNumber: 'CH-003',
        type: 'inspection_due',
        severity: 'critical',
        title: 'Inspection Overdue',
        message: 'Grade 80 Chain CH-003 inspection is overdue',
        dueDate: '2024-06-20'
      }
    ]

    setEquipment(mockEquipment)
    setAlerts(mockAlerts)
    setIsLoading(false)
  }, [])

  // Handler functions
  const handleAddEquipment = async () => {
    try {
      // Validate required fields
      if (!newEquipment.category) {
        alert('❌ Please select an equipment category')
        return
      }
      if (!newEquipment.type) {
        alert('❌ Please select an equipment type')
        return
      }
      if (!newEquipment.manufacturer) {
        alert('❌ Please enter manufacturer')
        return
      }
      if (!newEquipment.workingLoadLimit || parseFloat(newEquipment.workingLoadLimit) <= 0) {
        alert('❌ Please enter a valid working load limit')
        return
      }
      if (!newEquipment.location) {
        alert('❌ Please enter equipment location')
        return
      }

      // Generate equipment number if not provided
      let equipmentNumber = newEquipment.equipmentNumber
      if (!equipmentNumber) {
        const prefix = newEquipment.category.substring(0, 2).toUpperCase()
        const count = equipment.filter(e => e.category === newEquipment.category).length + 1
        equipmentNumber = `${prefix}-${count.toString().padStart(3, '0')}`
      }

      // Check if equipment number already exists
      if (equipment.some(e => e.equipmentNumber === equipmentNumber)) {
        alert('❌ Equipment number already exists. Please use a different number.')
        return
      }

      const equipmentItem: EquipmentItem = {
        id: Date.now().toString(),
        equipmentNumber: equipmentNumber,
        type: newEquipment.type,
        category: newEquipment.category,
        manufacturer: newEquipment.manufacturer,
        model: newEquipment.model,
        workingLoadLimit: parseFloat(newEquipment.workingLoadLimit),
        status: 'in_service',
        location: newEquipment.location,
        lastInspection: '',
        nextInspection: '',
        certificationExpiry: '',
        conditionRating: 5
      }

      setEquipment([...equipment, equipmentItem])
      setShowAddEquipmentDialog(false)
      setNewEquipment({
        equipmentNumber: '',
        type: '',
        category: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        workingLoadLimit: '',
        location: '',
        notes: ''
      })

      alert(`✅ Equipment ${equipmentNumber} added successfully!`)
    } catch (error) {
      console.error('Error adding equipment:', error)
      alert('❌ Failed to add equipment. Please try again.')
    }
  }

  const handleEditEquipment = (item: EquipmentItem) => {
    setSelectedEquipment(item)
    setNewEquipment({
      equipmentNumber: item.equipmentNumber,
      type: item.type,
      category: item.category,
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: '',
      workingLoadLimit: item.workingLoadLimit.toString(),
      location: item.location,
      notes: ''
    })
    setShowEditEquipmentDialog(true)
  }

  const handleUpdateEquipment = async () => {
    if (!selectedEquipment) return

    try {
      const updatedEquipment = equipment.map(item =>
        item.id === selectedEquipment.id
          ? {
              ...item,
              equipmentNumber: newEquipment.equipmentNumber,
              type: newEquipment.type,
              category: newEquipment.category,
              manufacturer: newEquipment.manufacturer,
              model: newEquipment.model,
              workingLoadLimit: parseFloat(newEquipment.workingLoadLimit) || 0,
              location: newEquipment.location
            }
          : item
      )

      setEquipment(updatedEquipment)
      setShowEditEquipmentDialog(false)
      setSelectedEquipment(null)

      alert('✅ Equipment updated successfully!')
    } catch (error) {
      console.error('Error updating equipment:', error)
      alert('❌ Failed to update equipment')
    }
  }

  const handleDeleteEquipment = async (item: EquipmentItem) => {
    if (confirm(`Are you sure you want to condemn equipment ${item.equipmentNumber}?`)) {
      try {
        const updatedEquipment = equipment.map(eq =>
          eq.id === item.id ? { ...eq, status: 'condemned' as const } : eq
        )
        setEquipment(updatedEquipment)
        alert('✅ Equipment condemned successfully!')
      } catch (error) {
        console.error('Error condemning equipment:', error)
        alert('❌ Failed to condemn equipment')
      }
    }
  }

  const handleAddCertification = async () => {
    try {
      // In a real app, this would call the API
      console.log('Adding certification:', newCertification)
      setShowAddCertificationDialog(false)
      setNewCertification({
        equipmentId: '',
        certificateNumber: '',
        certificateType: 'periodic',
        issuedDate: '',
        expiryDate: '',
        issuedBy: '',
        competentPerson: '',
        testLoad: '',
        testResult: 'pass',
        notes: ''
      })
      alert('✅ Certification added successfully!')
    } catch (error) {
      console.error('Error adding certification:', error)
      alert('❌ Failed to add certification')
    }
  }

  const handleAddInspection = async () => {
    try {
      // In a real app, this would call the API
      console.log('Adding inspection:', newInspection)
      setShowAddInspectionDialog(false)
      setNewInspection({
        equipmentId: '',
        inspectionType: 'monthly',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectorName: '',
        conditionRating: '5',
        defectsFound: false,
        defectDescription: '',
        actionRequired: '',
        inspectionResult: 'satisfactory'
      })
      alert('✅ Inspection recorded successfully!')
    } catch (error) {
      console.error('Error adding inspection:', error)
      alert('❌ Failed to record inspection')
    }
  }

  const handleCheckoutEquipment = async () => {
    try {
      const movement = {
        id: Date.now().toString(),
        equipmentId: newMovement.equipmentId,
        equipmentNumber: equipment.find(e => e.id === newMovement.equipmentId)?.equipmentNumber || '',
        movementType: 'check_out',
        fromLocation: newMovement.fromLocation,
        toLocation: newMovement.toLocation,
        checkedOutBy: newMovement.checkedOutBy,
        projectReference: newMovement.projectReference,
        movementDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: newMovement.expectedReturnDate,
        status: 'checked_out' as const,
        notes: newMovement.notes
      }

      setMovements([...movements, movement])

      // Update equipment location
      const updatedEquipment = equipment.map(item =>
        item.id === newMovement.equipmentId
          ? { ...item, location: newMovement.toLocation }
          : item
      )
      setEquipment(updatedEquipment)

      setShowCheckoutDialog(false)
      setNewMovement({
        equipmentId: '',
        movementType: 'check_out',
        fromLocation: '',
        toLocation: '',
        checkedOutBy: '',
        projectReference: '',
        expectedReturnDate: '',
        notes: ''
      })

      alert('✅ Equipment checked out successfully!')
    } catch (error) {
      console.error('Error checking out equipment:', error)
      alert('❌ Failed to check out equipment')
    }
  }

  const handleCheckinEquipment = async () => {
    try {
      const selectedMovement = movements.find(m =>
        m.equipmentId === checkinData.equipmentId && m.status === 'checked_out'
      )

      if (!selectedMovement) {
        alert('❌ No active checkout found for this equipment')
        return
      }

      // Update movement record
      const updatedMovements = movements.map(movement =>
        movement.id === selectedMovement.id
          ? {
              ...movement,
              checkedInBy: checkinData.checkedInBy,
              actualReturnDate: checkinData.actualReturnDate,
              status: 'checked_in' as const,
              notes: movement.notes + (checkinData.notes ? ` | Return: ${checkinData.notes}` : '')
            }
          : movement
      )
      setMovements(updatedMovements)

      // Update equipment condition and location
      const updatedEquipment = equipment.map(item =>
        item.id === checkinData.equipmentId
          ? {
              ...item,
              location: selectedMovement.fromLocation,
              conditionRating: parseInt(checkinData.conditionOnReturn)
            }
          : item
      )
      setEquipment(updatedEquipment)

      setShowCheckinDialog(false)
      setCheckinData({
        equipmentId: '',
        checkedInBy: '',
        actualReturnDate: new Date().toISOString().split('T')[0],
        conditionOnReturn: '5',
        notes: ''
      })

      alert('✅ Equipment checked in successfully!')
    } catch (error) {
      console.error('Error checking in equipment:', error)
      alert('❌ Failed to check in equipment')
    }
  }

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType)

    let reportData: any[] = []
    let reportTitle = ''

    switch (reportType) {
      case 'equipment-register':
        reportData = equipment.map(item => ({
          'Equipment Number': item.equipmentNumber,
          'Type': item.type,
          'Manufacturer': item.manufacturer,
          'Model': item.model,
          'WLL (tonnes)': item.workingLoadLimit,
          'Status': item.status,
          'Location': item.location,
          'Condition': item.conditionRating + '/5'
        }))
        reportTitle = 'Equipment Register'
        break

      case 'inspection-schedule':
        reportData = equipment.map(item => ({
          'Equipment Number': item.equipmentNumber,
          'Type': item.type,
          'Last Inspection': item.lastInspection || 'Not recorded',
          'Next Inspection': item.nextInspection || 'Not scheduled',
          'Status': item.status,
          'Location': item.location
        }))
        reportTitle = 'Inspection Schedule'
        break

      case 'expiry-report':
        reportData = equipment.map(item => ({
          'Equipment Number': item.equipmentNumber,
          'Type': item.type,
          'Certification Expiry': item.certificationExpiry || 'Not recorded',
          'Days Until Expiry': item.certificationExpiry ?
            Math.ceil((new Date(item.certificationExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A',
          'Status': item.status
        }))
        reportTitle = 'Certification Expiry Report'
        break

      case 'utilization-report':
        reportData = movements.map(movement => ({
          'Equipment Number': movement.equipmentNumber,
          'Project': movement.projectReference,
          'Checked Out By': movement.checkedOutBy,
          'Checkout Date': movement.movementDate,
          'Expected Return': movement.expectedReturnDate,
          'Actual Return': movement.actualReturnDate || 'Still out',
          'Status': movement.status
        }))
        reportTitle = 'Equipment Utilization Report'
        break

      case 'maintenance-log':
        reportData = maintenanceRecords.map(record => {
          const equipmentItem = equipment.find(e => e.id === record.equipmentId)
          return {
            'Equipment Number': equipmentItem?.equipmentNumber || 'Unknown',
            'Equipment Type': equipmentItem?.type || 'Unknown',
            'Maintenance Type': record.maintenanceType.replace('_', ' '),
            'Description': record.description,
            'Performed By': record.performedBy,
            'Date Performed': record.datePerformed,
            'Next Maintenance': record.nextMaintenanceDate || 'Not scheduled',
            'Cost': record.cost ? `$${record.cost}` : 'Not recorded',
            'Parts Used': record.partsUsed || 'None',
            'Notes': record.notes || 'None'
          }
        })
        reportTitle = 'Maintenance Log Report'
        break

      case 'movement-log':
        reportData = movements.map(movement => ({
          'Equipment Number': movement.equipmentNumber,
          'Movement Type': movement.movementType.replace('_', ' '),
          'From': movement.fromLocation,
          'To': movement.toLocation,
          'Date': movement.movementDate,
          'By': movement.checkedOutBy,
          'Project': movement.projectReference,
          'Status': movement.status
        }))
        reportTitle = 'Equipment Movement Log'
        break

      default:
        reportData = []
        reportTitle = 'Unknown Report'
    }

    // Generate CSV content
    if (reportData.length > 0) {
      const headers = Object.keys(reportData[0])
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert(`✅ ${reportTitle} downloaded successfully!`)
    } else {
      alert('❌ No data available for this report')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_service': return 'bg-green-500'
      case 'out_of_service': return 'bg-red-500'
      case 'under_inspection': return 'bg-yellow-500'
      case 'condemned': return 'bg-gray-500'
      case 'lost': return 'bg-purple-500'
      case 'stolen': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.equipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalEquipment: equipment.length,
    inService: equipment.filter(e => e.status === 'in_service').length,
    outOfService: equipment.filter(e => e.status === 'out_of_service').length,
    underInspection: equipment.filter(e => e.status === 'under_inspection').length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    highAlerts: alerts.filter(a => a.severity === 'high').length
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Rigging Loft Management...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white p-2 sm:px-3">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <h1 className="text-lg sm:text-xl font-bold text-white">
                <span className="hidden md:inline">Rigging Loft Management</span>
                <span className="md:hidden">Rigging Loft</span>
              </h1>

            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 p-2 sm:px-3"
              onClick={() => setShowAddEquipmentDialog(true)}
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Equipment</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white p-2 sm:px-3 hidden md:flex"
              onClick={() => alert('🔍 QR Code scanning feature coming soon!')}
            >
              <QrCode className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">Scan QR</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
              onClick={() => handleGenerateReport('equipment-register')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        {/* Tab Navigation */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg mb-4 sm:mb-6">
          <div className="flex flex-wrap border-b border-slate-700 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'equipment', label: 'Equipment', icon: Package },
              { id: 'inspections', label: 'Inspections', icon: CheckCircle },
              { id: 'certifications', label: 'Certifications', icon: FileText },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'movements', label: 'Movements', icon: MapPin },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'reports', label: 'Reports', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-slate-700/50'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                  {tab.id === 'alerts' && alerts.length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {alerts.length}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Equipment</p>
                      <p className="text-2xl font-bold text-white">{stats.totalEquipment}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">In Service</p>
                      <p className="text-2xl font-bold text-green-400">{stats.inService}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Out of Service</p>
                      <p className="text-2xl font-bold text-red-400">{stats.outOfService}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Critical Alerts</p>
                      <p className="text-2xl font-bold text-orange-400">{stats.criticalAlerts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getAlertColor(alert.severity)}`} />
                        <div>
                          <p className="text-white font-medium">{alert.title}</p>
                          <p className="text-slate-400 text-sm">{alert.equipmentNumber} - {alert.message}</p>
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        Due: {new Date(alert.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="in_service">In Service</option>
                      <option value="out_of_service">Out of Service</option>
                      <option value="under_inspection">Under Inspection</option>
                      <option value="condemned">Condemned</option>
                    </select>
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment List */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Equipment Inventory ({filteredEquipment.length})
                  </span>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddEquipmentDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Equipment #</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Type</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Manufacturer</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">WLL</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Status</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Location</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Next Inspection</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.map((item) => (
                        <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{item.equipmentNumber}</span>
                              <QrCode className="w-4 h-4 text-slate-400" />
                            </div>
                          </td>
                          <td className="py-3 px-2 text-slate-300">{item.type}</td>
                          <td className="py-3 px-2 text-slate-300">{item.manufacturer}</td>
                          <td className="py-3 px-2 text-slate-300">{item.workingLoadLimit}t</td>
                          <td className="py-3 px-2">
                            <Badge className={`${getStatusColor(item.status)} text-white`}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-slate-300">{item.location}</td>
                          <td className="py-3 px-2 text-slate-300">
                            {new Date(item.nextInspection).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white"
                                onClick={() => {
                                  setSelectedEquipmentForDetails(item)
                                  setShowEquipmentDetailsDialog(true)
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white"
                                onClick={() => handleEditEquipment(item)}
                                title="Edit Equipment"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-red-400"
                                onClick={() => handleDeleteEquipment(item)}
                                title="Condemn Equipment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === 'inspections' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Equipment Inspections
                  </span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowAddInspectionDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Inspection
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 text-2xl font-bold">12</p>
                      <p className="text-slate-300 text-sm">Completed This Month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-yellow-400 text-2xl font-bold">5</p>
                      <p className="text-slate-300 text-sm">Due This Week</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-2xl font-bold">2</p>
                      <p className="text-slate-300 text-sm">Overdue</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-slate-400 text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Inspection Management</h3>
                  <p>Track daily, weekly, monthly, and annual inspections</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Equipment Certifications
                  </span>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddCertificationDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Certificate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-400 text-2xl font-bold">45</p>
                      <p className="text-slate-300 text-sm">Valid Certificates</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-yellow-400 text-2xl font-bold">8</p>
                      <p className="text-slate-300 text-sm">Expiring Soon</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-2xl font-bold">3</p>
                      <p className="text-slate-300 text-sm">Expired</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <Wrench className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-purple-400 text-2xl font-bold">6</p>
                      <p className="text-slate-300 text-sm">Load Tests Due</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-slate-400 text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Certification Management</h3>
                  <p>Track certificates, load tests, and thorough examinations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2" />
                    Maintenance Records
                  </span>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowMaintenanceLogDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Maintenance
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Maintenance Management</h3>
                  <p>Track repairs, overhauls, and preventive maintenance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Equipment Movements
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowCheckoutDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Check Out
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCheckinDialog(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check In
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-indigo-400 text-2xl font-bold">{movements.filter(m => m.status === 'checked_out').length}</p>
                      <p className="text-slate-300 text-sm">Currently Out</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 text-2xl font-bold">{movements.filter(m => m.status === 'checked_in').length}</p>
                      <p className="text-slate-300 text-sm">Returned This Month</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-2xl font-bold">
                        {movements.filter(m =>
                          m.status === 'checked_out' &&
                          new Date(m.expectedReturnDate) < new Date()
                        ).length}
                      </p>
                      <p className="text-slate-300 text-sm">Overdue</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Movement History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Equipment</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Project</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Checked Out By</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Date Out</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Expected Return</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Status</th>
                        <th className="text-left text-slate-300 font-medium py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.slice(0, 10).map((movement) => (
                        <tr key={movement.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-2 text-white font-medium">{movement.equipmentNumber}</td>
                          <td className="py-3 px-2 text-slate-300">{movement.projectReference}</td>
                          <td className="py-3 px-2 text-slate-300">{movement.checkedOutBy}</td>
                          <td className="py-3 px-2 text-slate-300">{new Date(movement.movementDate).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-slate-300">{new Date(movement.expectedReturnDate).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <Badge className={`${
                              movement.status === 'checked_out' ? 'bg-yellow-500' :
                              movement.status === 'checked_in' ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}>
                              {movement.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {movement.status === 'checked_out' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300"
                                onClick={() => {
                                  setCheckinData({...checkinData, equipmentId: movement.equipmentId})
                                  setShowCheckinDialog(true)
                                }}
                              >
                                Check In
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {movements.length === 0 && (
                    <div className="text-slate-400 text-center py-8">
                      <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No Movements Recorded</h3>
                      <p>Start by checking out equipment to projects</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    System Alerts ({alerts.length})
                  </span>
                  <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                    Mark All Read
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getAlertColor(alert.severity)}`} />
                        <div>
                          <p className="text-white font-medium">{alert.title}</p>
                          <p className="text-slate-400 text-sm">{alert.equipmentNumber} - {alert.message}</p>
                          <p className="text-slate-500 text-xs">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getAlertColor(alert.severity)} text-white`}>
                          {alert.severity}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('equipment-register')}
                  >
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Equipment Register</h3>
                      <p className="text-slate-400 text-sm">Complete equipment inventory</p>
                      <div className="mt-2">
                        <Badge className="bg-blue-500 text-white text-xs">
                          {equipment.length} items
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('inspection-schedule')}
                  >
                    <CardContent className="p-4 text-center">
                      <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Inspection Schedule</h3>
                      <p className="text-slate-400 text-sm">Upcoming inspections</p>
                      <div className="mt-2">
                        <Badge className="bg-green-500 text-white text-xs">
                          {equipment.filter(e => e.nextInspection).length} scheduled
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('expiry-report')}
                  >
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Expiry Report</h3>
                      <p className="text-slate-400 text-sm">Certificates expiring soon</p>
                      <div className="mt-2">
                        <Badge className="bg-yellow-500 text-white text-xs">
                          {equipment.filter(e => e.certificationExpiry).length} tracked
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('utilization-report')}
                  >
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Utilization Report</h3>
                      <p className="text-slate-400 text-sm">Equipment usage statistics</p>
                      <div className="mt-2">
                        <Badge className="bg-purple-500 text-white text-xs">
                          {movements.length} movements
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('maintenance-log')}
                  >
                    <CardContent className="p-4 text-center">
                      <Wrench className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Maintenance Log</h3>
                      <p className="text-slate-400 text-sm">Maintenance history</p>
                      <div className="mt-2">
                        <Badge className="bg-orange-500 text-white text-xs">
                          {maintenanceRecords.length} Records
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 cursor-pointer transition-colors"
                    onClick={() => handleGenerateReport('movement-log')}
                  >
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Movement Log</h3>
                      <p className="text-slate-400 text-sm">Equipment movements</p>
                      <div className="mt-2">
                        <Badge className="bg-red-500 text-white text-xs">
                          {movements.length} records
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Equipment Dialog */}
      <Dialog open={showAddEquipmentDialog} onOpenChange={setShowAddEquipmentDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Equipment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipmentNumber" className="text-slate-300">Equipment Number</Label>
                <Input
                  id="equipmentNumber"
                  value={newEquipment.equipmentNumber}
                  onChange={(e) => setNewEquipment({...newEquipment, equipmentNumber: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-300">Category *</Label>
                <Select onValueChange={(value) => {
                  setNewEquipment({...newEquipment, category: value, type: ''})
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {equipmentCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type" className="text-slate-300">Type *</Label>
                <Select
                  onValueChange={(value) => setNewEquipment({...newEquipment, type: value})}
                  disabled={!newEquipment.category}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {newEquipment.category && equipmentTypes[newEquipment.category as keyof typeof equipmentTypes]?.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manufacturer" className="text-slate-300">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  value={newEquipment.manufacturer}
                  onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Crosby, Pewag"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-slate-300">Model</Label>
                <Input
                  id="model"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Model number"
                />
              </div>
              <div>
                <Label htmlFor="serialNumber" className="text-slate-300">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={newEquipment.serialNumber}
                  onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Serial number"
                />
              </div>
              <div>
                <Label htmlFor="workingLoadLimit" className="text-slate-300">Working Load Limit (tonnes) *</Label>
                <Input
                  id="workingLoadLimit"
                  type="number"
                  step="0.1"
                  value={newEquipment.workingLoadLimit}
                  onChange={(e) => setNewEquipment({...newEquipment, workingLoadLimit: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., 5.0"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-slate-300">Location *</Label>
                <Select onValueChange={(value) => setNewEquipment({...newEquipment, location: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {commonLocations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-slate-300">Notes</Label>
              <Textarea
                id="notes"
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddEquipmentDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEquipment}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newEquipment.category || !newEquipment.type || !newEquipment.manufacturer || !newEquipment.workingLoadLimit || !newEquipment.location}
              >
                Add Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={showEditEquipmentDialog} onOpenChange={setShowEditEquipmentDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              Edit Equipment: {selectedEquipment?.equipmentNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editEquipmentNumber" className="text-slate-300">Equipment Number</Label>
                <Input
                  id="editEquipmentNumber"
                  value={newEquipment.equipmentNumber}
                  onChange={(e) => setNewEquipment({...newEquipment, equipmentNumber: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editManufacturer" className="text-slate-300">Manufacturer</Label>
                <Input
                  id="editManufacturer"
                  value={newEquipment.manufacturer}
                  onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editModel" className="text-slate-300">Model</Label>
                <Input
                  id="editModel"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editWorkingLoadLimit" className="text-slate-300">Working Load Limit (tonnes)</Label>
                <Input
                  id="editWorkingLoadLimit"
                  type="number"
                  step="0.1"
                  value={newEquipment.workingLoadLimit}
                  onChange={(e) => setNewEquipment({...newEquipment, workingLoadLimit: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editLocation" className="text-slate-300">Location</Label>
                <Input
                  id="editLocation"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowEditEquipmentDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEquipment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Certification Dialog */}
      <Dialog open={showAddCertificationDialog} onOpenChange={setShowAddCertificationDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Add New Certification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certEquipment" className="text-slate-300">Equipment *</Label>
                <Select onValueChange={(value) => setNewCertification({...newCertification, equipmentId: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.equipmentNumber} - {item.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="certificateNumber" className="text-slate-300">Certificate Number *</Label>
                <Input
                  id="certificateNumber"
                  value={newCertification.certificateNumber}
                  onChange={(e) => setNewCertification({...newCertification, certificateNumber: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="CERT-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="certificateType" className="text-slate-300">Certificate Type *</Label>
                <Select onValueChange={(value) => setNewCertification({...newCertification, certificateType: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="initial">Initial Certification</SelectItem>
                    <SelectItem value="periodic">Periodic Inspection</SelectItem>
                    <SelectItem value="load_test">Load Test</SelectItem>
                    <SelectItem value="repair">Post-Repair</SelectItem>
                    <SelectItem value="thorough_examination">Thorough Examination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issuedDate" className="text-slate-300">Issued Date *</Label>
                <Input
                  id="issuedDate"
                  type="date"
                  value={newCertification.issuedDate}
                  onChange={(e) => setNewCertification({...newCertification, issuedDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate" className="text-slate-300">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="issuedBy" className="text-slate-300">Issued By *</Label>
                <Input
                  id="issuedBy"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification({...newCertification, issuedBy: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Inspection company"
                />
              </div>
              <div>
                <Label htmlFor="competentPerson" className="text-slate-300">Competent Person *</Label>
                <Input
                  id="competentPerson"
                  value={newCertification.competentPerson}
                  onChange={(e) => setNewCertification({...newCertification, competentPerson: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Inspector name & qualification"
                />
              </div>
              <div>
                <Label htmlFor="testLoad" className="text-slate-300">Test Load (tonnes)</Label>
                <Input
                  id="testLoad"
                  type="number"
                  step="0.1"
                  value={newCertification.testLoad}
                  onChange={(e) => setNewCertification({...newCertification, testLoad: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Test load applied"
                />
              </div>
              <div>
                <Label htmlFor="testResult" className="text-slate-300">Test Result *</Label>
                <Select onValueChange={(value) => setNewCertification({...newCertification, testResult: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="certNotes" className="text-slate-300">Notes</Label>
              <Textarea
                id="certNotes"
                value={newCertification.notes}
                onChange={(e) => setNewCertification({...newCertification, notes: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddCertificationDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCertification}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newCertification.equipmentId || !newCertification.certificateNumber || !newCertification.issuedDate || !newCertification.expiryDate}
              >
                Add Certification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Inspection Dialog */}
      <Dialog open={showAddInspectionDialog} onOpenChange={setShowAddInspectionDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Record New Inspection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspEquipment" className="text-slate-300">Equipment *</Label>
                <Select onValueChange={(value) => setNewInspection({...newInspection, equipmentId: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.equipmentNumber} - {item.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspectionType" className="text-slate-300">Inspection Type *</Label>
                <Select onValueChange={(value) => setNewInspection({...newInspection, inspectionType: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="pre_use">Pre-Use</SelectItem>
                    <SelectItem value="post_use">Post-Use</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspectionDate" className="text-slate-300">Inspection Date *</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={newInspection.inspectionDate}
                  onChange={(e) => setNewInspection({...newInspection, inspectionDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="inspectorName" className="text-slate-300">Inspector Name *</Label>
                <Input
                  id="inspectorName"
                  value={newInspection.inspectorName}
                  onChange={(e) => setNewInspection({...newInspection, inspectorName: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Inspector name"
                />
              </div>
              <div>
                <Label htmlFor="conditionRating" className="text-slate-300">Condition Rating *</Label>
                <Select onValueChange={(value) => setNewInspection({...newInspection, conditionRating: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Fair</SelectItem>
                    <SelectItem value="2">2 - Poor</SelectItem>
                    <SelectItem value="1">1 - Unsafe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspectionResult" className="text-slate-300">Inspection Result *</Label>
                <Select onValueChange={(value) => setNewInspection({...newInspection, inspectionResult: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="satisfactory">Satisfactory</SelectItem>
                    <SelectItem value="minor_defects">Minor Defects</SelectItem>
                    <SelectItem value="major_defects">Major Defects</SelectItem>
                    <SelectItem value="unsafe">Unsafe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="defectDescription" className="text-slate-300">Defect Description</Label>
              <Textarea
                id="defectDescription"
                value={newInspection.defectDescription}
                onChange={(e) => setNewInspection({...newInspection, defectDescription: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe any defects found..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="actionRequired" className="text-slate-300">Action Required</Label>
              <Textarea
                id="actionRequired"
                value={newInspection.actionRequired}
                onChange={(e) => setNewInspection({...newInspection, actionRequired: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Actions required to address defects..."
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddInspectionDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddInspection}
                className="bg-green-600 hover:bg-green-700"
                disabled={!newInspection.equipmentId || !newInspection.inspectorName}
              >
                Record Inspection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Equipment Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Check Out Equipment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkoutEquipment" className="text-slate-300">Equipment *</Label>
                <Select onValueChange={(value) => {
                  const selectedEq = equipment.find(e => e.id === value)
                  setNewMovement({
                    ...newMovement,
                    equipmentId: value,
                    fromLocation: selectedEq?.location || ''
                  })
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {equipment.filter(e => e.status === 'in_service').map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.equipmentNumber} - {item.type} ({item.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="checkedOutBy" className="text-slate-300">Checked Out By *</Label>
                <Input
                  id="checkedOutBy"
                  value={newMovement.checkedOutBy}
                  onChange={(e) => setNewMovement({...newMovement, checkedOutBy: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Person taking equipment"
                />
              </div>
              <div>
                <Label htmlFor="fromLocation" className="text-slate-300">From Location</Label>
                <Input
                  id="fromLocation"
                  value={newMovement.fromLocation}
                  onChange={(e) => setNewMovement({...newMovement, fromLocation: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Current location"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="toLocation" className="text-slate-300">To Location *</Label>
                <Input
                  id="toLocation"
                  value={newMovement.toLocation}
                  onChange={(e) => setNewMovement({...newMovement, toLocation: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Destination location"
                />
              </div>
              <div>
                <Label htmlFor="projectReference" className="text-slate-300">Project Reference *</Label>
                <Input
                  id="projectReference"
                  value={newMovement.projectReference}
                  onChange={(e) => setNewMovement({...newMovement, projectReference: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Project name/number"
                />
              </div>
              <div>
                <Label htmlFor="expectedReturnDate" className="text-slate-300">Expected Return Date *</Label>
                <Input
                  id="expectedReturnDate"
                  type="date"
                  value={newMovement.expectedReturnDate}
                  onChange={(e) => setNewMovement({...newMovement, expectedReturnDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="checkoutNotes" className="text-slate-300">Notes</Label>
              <Textarea
                id="checkoutNotes"
                value={newMovement.notes}
                onChange={(e) => setNewMovement({...newMovement, notes: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCheckoutDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckoutEquipment}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!newMovement.equipmentId || !newMovement.checkedOutBy || !newMovement.toLocation || !newMovement.projectReference || !newMovement.expectedReturnDate}
              >
                Check Out Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Equipment Checkin Dialog */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Check In Equipment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkinEquipment" className="text-slate-300">Equipment *</Label>
                <Select onValueChange={(value) => setCheckinData({...checkinData, equipmentId: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {movements.filter(m => m.status === 'checked_out').map((movement) => (
                      <SelectItem key={movement.equipmentId} value={movement.equipmentId}>
                        {movement.equipmentNumber} - {movement.projectReference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="checkedInBy" className="text-slate-300">Checked In By *</Label>
                <Input
                  id="checkedInBy"
                  value={checkinData.checkedInBy}
                  onChange={(e) => setCheckinData({...checkinData, checkedInBy: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Person returning equipment"
                />
              </div>
              <div>
                <Label htmlFor="actualReturnDate" className="text-slate-300">Return Date *</Label>
                <Input
                  id="actualReturnDate"
                  type="date"
                  value={checkinData.actualReturnDate}
                  onChange={(e) => setCheckinData({...checkinData, actualReturnDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="conditionOnReturn" className="text-slate-300">Condition on Return *</Label>
                <Select onValueChange={(value) => setCheckinData({...checkinData, conditionOnReturn: value})}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Fair</SelectItem>
                    <SelectItem value="2">2 - Poor</SelectItem>
                    <SelectItem value="1">1 - Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="checkinNotes" className="text-slate-300">Return Notes</Label>
              <Textarea
                id="checkinNotes"
                value={checkinData.notes}
                onChange={(e) => setCheckinData({...checkinData, notes: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Condition notes, issues found, etc..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCheckinDialog(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckinEquipment}
                className="bg-green-600 hover:bg-green-700"
                disabled={!checkinData.equipmentId || !checkinData.checkedInBy}
              >
                Check In Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Maintenance Log Dialog */}
      <Dialog open={showMaintenanceLogDialog} onOpenChange={setShowMaintenanceLogDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Log Maintenance Activity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Equipment</Label>
                <Select
                  value={maintenanceForm.equipmentId}
                  onValueChange={(value) => setMaintenanceForm({...maintenanceForm, equipmentId: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.equipmentNumber} - {item.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Maintenance Type</Label>
                <Select
                  value={maintenanceForm.maintenanceType}
                  onValueChange={(value) => setMaintenanceForm({...maintenanceForm, maintenanceType: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="routine">Routine Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="replacement">Part Replacement</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="lubrication">Lubrication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe the maintenance work performed..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Performed By</Label>
                <Input
                  value={maintenanceForm.performedBy}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, performedBy: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Technician name"
                />
              </div>

              <div>
                <Label className="text-slate-300">Date Performed</Label>
                <Input
                  type="date"
                  value={maintenanceForm.datePerformed}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, datePerformed: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Next Maintenance Date</Label>
                <Input
                  type="date"
                  value={maintenanceForm.nextMaintenanceDate}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, nextMaintenanceDate: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Cost ($)</Label>
                <Input
                  type="number"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Parts Used</Label>
              <Input
                value={maintenanceForm.partsUsed}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, partsUsed: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="List parts used (optional)"
              />
            </div>

            <div>
              <Label className="text-slate-300">Additional Notes</Label>
              <Textarea
                value={maintenanceForm.notes}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, notes: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Any additional notes or observations..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMaintenanceLogDialog(false)
                  setMaintenanceForm({
                    equipmentId: '',
                    maintenanceType: '',
                    description: '',
                    performedBy: '',
                    datePerformed: '',
                    nextMaintenanceDate: '',
                    cost: '',
                    partsUsed: '',
                    notes: ''
                  })
                }}
                className="border-slate-600 text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Add new maintenance record
                  const newRecord = {
                    id: Date.now().toString(),
                    ...maintenanceForm
                  }
                  setMaintenanceRecords([...maintenanceRecords, newRecord])

                  // Close dialog and reset form
                  setShowMaintenanceLogDialog(false)
                  setMaintenanceForm({
                    equipmentId: '',
                    maintenanceType: '',
                    description: '',
                    performedBy: '',
                    datePerformed: '',
                    nextMaintenanceDate: '',
                    cost: '',
                    partsUsed: '',
                    notes: ''
                  })
                }}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!maintenanceForm.equipmentId || !maintenanceForm.maintenanceType || !maintenanceForm.description}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Maintenance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={showEquipmentDetailsDialog} onOpenChange={setShowEquipmentDetailsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Equipment Details - {selectedEquipmentForDetails?.equipmentNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedEquipmentForDetails && (
            <div className="space-y-6">
              {/* Equipment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Equipment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white ml-2">{selectedEquipmentForDetails.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Working Load Limit:</span>
                        <span className="text-white ml-2">{selectedEquipmentForDetails.workingLoadLimit}t</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Model:</span>
                        <span className="text-white ml-2">{selectedEquipmentForDetails.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Manufacturer:</span>
                        <span className="text-white ml-2">{selectedEquipmentForDetails.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white ml-2">{selectedEquipmentForDetails.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Status:</span>
                        <Badge className={
                          selectedEquipmentForDetails.status === 'in_service' ? 'bg-green-600' :
                          selectedEquipmentForDetails.status === 'out_of_service' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }>
                          {selectedEquipmentForDetails.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Certification Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Last Inspection:</span>
                        <span className="text-white">{selectedEquipmentForDetails.lastInspection}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Next Inspection:</span>
                        <span className="text-white">{selectedEquipmentForDetails.nextInspection}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Certificate Valid:</span>
                        <Badge className={
                          new Date(selectedEquipmentForDetails.nextInspection) > new Date() ? 'bg-green-600' : 'bg-red-600'
                        }>
                          {new Date(selectedEquipmentForDetails.nextInspection) > new Date() ? 'Valid' : 'Expired'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Maintenance History */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Wrench className="w-5 h-5 mr-2" />
                      Maintenance History
                    </div>
                    <Badge className="bg-purple-600">
                      {maintenanceRecords.filter(r => r.equipmentId === selectedEquipmentForDetails.id).length} Records
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceRecords
                      .filter(record => record.equipmentId === selectedEquipmentForDetails.id)
                      .sort((a, b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime())
                      .map((record) => (
                        <div key={record.id} className="p-4 bg-slate-600/50 rounded-lg border border-slate-500">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Badge className={
                                record.maintenanceType === 'routine' ? 'bg-blue-600' :
                                record.maintenanceType === 'repair' ? 'bg-red-600' :
                                record.maintenanceType === 'inspection' ? 'bg-green-600' :
                                'bg-purple-600'
                              }>
                                {record.maintenanceType}
                              </Badge>
                              <span className="text-white ml-3 font-medium">{record.description}</span>
                            </div>
                            <span className="text-slate-400 text-sm">{record.datePerformed}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-slate-400">Performed by:</span>
                              <span className="text-white ml-2">{record.performedBy}</span>
                            </div>
                            {record.cost && (
                              <div>
                                <span className="text-slate-400">Cost:</span>
                                <span className="text-white ml-2">${record.cost}</span>
                              </div>
                            )}
                            {record.nextMaintenanceDate && (
                              <div>
                                <span className="text-slate-400">Next maintenance:</span>
                                <span className="text-white ml-2">{record.nextMaintenanceDate}</span>
                              </div>
                            )}
                          </div>
                          {record.partsUsed && (
                            <div className="mt-2 text-sm">
                              <span className="text-slate-400">Parts used:</span>
                              <span className="text-white ml-2">{record.partsUsed}</span>
                            </div>
                          )}
                          {record.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-slate-400">Notes:</span>
                              <span className="text-white ml-2">{record.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}

                    {maintenanceRecords.filter(r => r.equipmentId === selectedEquipmentForDetails.id).length === 0 && (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
                        <p className="text-slate-400">No maintenance records found</p>
                        <p className="text-slate-500 text-sm">Use the "Log Maintenance" button to add records</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowEquipmentDetailsDialog(false)}
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
