import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Church, Member } from '../types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { exportToCSV, exportToExcel, exportToPDF } from '../lib/export'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface WidgetVisibility {
  kpiCards: boolean
  kpiChurches: boolean
  kpiMembers: boolean
  kpiAge: boolean
  kpiTithes: boolean
  chartMembersPerChurch: boolean
  chartCompletion: boolean
  chartAgeDistribution: boolean
}

const defaultVisibility: WidgetVisibility = {
  kpiCards: true,
  kpiChurches: true,
  kpiMembers: true,
  kpiAge: true,
  kpiTithes: true,
  chartMembersPerChurch: true,
  chartCompletion: true,
  chartAgeDistribution: true,
}

export default function Dashboard() {
  const [churches, setChurches] = useState<Church[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(defaultVisibility)

  // Load saved preferences from localStorage
  useEffect(() => {
    // Check if layouts are saved
    console.log('Saved layouts:', localStorage.getItem('dashboard_layouts'))
    console.log('Saved visibility:', localStorage.getItem('dashboard_widget_visibility'))
    
    const savedLayouts = localStorage.getItem('dashboard_layouts')
    const savedVisibility = localStorage.getItem('dashboard_widget_visibility')
    
    // Load visibility preferences
    if (savedVisibility) {
      try {
        const parsed = JSON.parse(savedVisibility)
        setWidgetVisibility({ ...defaultVisibility, ...parsed })
        console.log('✅ Loaded widget visibility preferences:', parsed)
      } catch (error) {
        console.error('❌ Error parsing saved visibility:', error)
      }
    } else {
      console.log('ℹ️ No saved preferences found, using defaults')
    }
    
    loadData()
  }, [])

  // Save visibility to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      // Only save after initial load to avoid saving defaults
      localStorage.setItem('dashboard_widget_visibility', JSON.stringify(widgetVisibility))
      console.log('💾 Saved widget visibility to localStorage:', widgetVisibility)
      
      // Also save layout info (for future drag-and-drop support)
      const layoutInfo = {
        lastUpdated: new Date().toISOString(),
        widgetCount: Object.values(widgetVisibility).filter(Boolean).length,
      }
      localStorage.setItem('dashboard_layouts', JSON.stringify(layoutInfo))
      console.log('💾 Saved layout info:', layoutInfo)
    }
  }, [widgetVisibility, loading])

  const toggleWidget = (key: keyof WidgetVisibility) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const resetVisibility = () => {
    setWidgetVisibility(defaultVisibility)
  }

  const loadData = async () => {
    try {
      const [churchesRes, membersRes] = await Promise.all([
        supabase.from('churches').select('*').order('name'),
        supabase.from('members').select('*'),
      ])

      if (churchesRes.error) throw churchesRes.error
      if (membersRes.error) throw membersRes.error

      setChurches(churchesRes.data || [])
      setMembers(membersRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  // Calculate KPIs
  const churchesWithData = churches.filter(
    (c) => c.attendance && c.attendance > 0
  ).length
  const totalChurches = churches.length
  const totalMembers = members.length
  const averageAge =
    members.length > 0
      ? Math.round(
          members
            .filter((m) => m.age)
            .reduce((sum, m) => sum + (m.age || 0), 0) /
            members.filter((m) => m.age).length
        )
      : 0
  const totalTithes = churches.reduce((sum, c) => sum + (Number(c.tithes) || 0), 0)

  // Prepare chart data
  const membersPerChurch = churches.map((church) => ({
    name: church.name,
    count: members.filter((m) => m.church_id === church.id).length,
  }))

  const completedData = {
    completed: churchesWithData,
    notCompleted: totalChurches - churchesWithData,
  }

  const ageGroups = {
    '0-18': members.filter((m) => m.age && m.age <= 18).length,
    '19-35': members.filter((m) => m.age && m.age >= 19 && m.age <= 35).length,
    '36-55': members.filter((m) => m.age && m.age >= 36 && m.age <= 55).length,
    '56+': members.filter((m) => m.age && m.age >= 56).length,
  }

  // Chart configurations
  const membersChartData = {
    labels: membersPerChurch.map((c) => c.name),
    datasets: [
      {
        label: 'Members',
        data: membersPerChurch.map((c) => c.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const completionChartData = {
    labels: ['Completed', 'Not Completed'],
    datasets: [
      {
        data: [completedData.completed, completedData.notCompleted],
        backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const ageChartData = {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: 'Members',
        data: Object.values(ageGroups),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(251, 191, 36, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const handleExportCSV = () => {
    exportToCSV(churches, members)
  }

  const handleExportExcel = () => {
    exportToExcel(churches, members)
  }

  const handleExportPDF = () => {
    exportToPDF(churches, members, {
      totalChurches,
      totalMembers,
      averageAge,
      totalTithes,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            title="Widget Settings"
          >
            {showSettings ? 'Hide Settings' : 'Widget Settings'}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Widget Settings Panel */}
      {showSettings && (
        <div className="bg-white p-6 rounded-lg shadow border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Widget Visibility Settings</h2>
            <button
              onClick={resetVisibility}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset to Default
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.kpiChurches}
                onChange={() => toggleWidget('kpiChurches')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">KPI: Churches with Data</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.kpiMembers}
                onChange={() => toggleWidget('kpiMembers')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">KPI: Total Members</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.kpiAge}
                onChange={() => toggleWidget('kpiAge')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">KPI: Average Member Age</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.kpiTithes}
                onChange={() => toggleWidget('kpiTithes')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">KPI: Total Tithes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.chartMembersPerChurch}
                onChange={() => toggleWidget('chartMembersPerChurch')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Chart: Members per Church</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.chartCompletion}
                onChange={() => toggleWidget('chartCompletion')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Chart: Data Completion</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={widgetVisibility.chartAgeDistribution}
                onChange={() => toggleWidget('chartAgeDistribution')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Chart: Age Distribution</span>
            </label>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {widgetVisibility.kpiCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgetVisibility.kpiChurches && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Churches with Data</div>
              <div className="text-2xl font-bold text-gray-900">
                {churchesWithData} / {totalChurches}
              </div>
            </div>
          )}
          {widgetVisibility.kpiMembers && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Members</div>
              <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
            </div>
          )}
          {widgetVisibility.kpiAge && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Average Member Age</div>
              <div className="text-2xl font-bold text-gray-900">
                {averageAge || 'N/A'}
              </div>
            </div>
          )}
          {widgetVisibility.kpiTithes && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Tithes</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{totalTithes.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      {(widgetVisibility.chartMembersPerChurch ||
        widgetVisibility.chartCompletion ||
        widgetVisibility.chartAgeDistribution) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetVisibility.chartMembersPerChurch && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Members per Church</h2>
              <div className="h-64">
                <Bar
                  data={membersChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          )}
          {widgetVisibility.chartCompletion && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Data Completion</h2>
              <div className="h-64">
                <Doughnut
                  data={completionChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          )}
          {widgetVisibility.chartAgeDistribution && (
            <div
              className={`bg-white p-6 rounded-lg shadow ${
                widgetVisibility.chartMembersPerChurch || widgetVisibility.chartCompletion
                  ? 'lg:col-span-2'
                  : ''
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">Age Distribution</h2>
              <div className="h-64">
                <Bar
                  data={ageChartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
