import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../UI/LoadingSpinner'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BookOpen, 
  MessageCircle,
  CreditCard,
  Star
} from 'lucide-react'

interface Metric {
  metric: string
  value: number
  type: string
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('admin_dashboard_metrics')
        .select('*')

      if (fetchError) throw fetchError

      setMetrics(data || [])
    } catch (err: any) {
      console.error('Error fetching metrics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'total_users':
        return <Users className="w-8 h-8 text-blue-600" />
      case 'total_bookings':
        return <Calendar className="w-8 h-8 text-green-600" />
      case 'monthly_revenue':
        return <DollarSign className="w-8 h-8 text-emerald-600" />
      case 'active_subscriptions':
        return <CreditCard className="w-8 h-8 text-purple-600" />
      default:
        return <TrendingUp className="w-8 h-8 text-gray-600" />
    }
  }

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case 'total_users':
        return 'Total Users'
      case 'total_bookings':
        return 'Monthly Bookings'
      case 'monthly_revenue':
        return 'Monthly Revenue'
      case 'active_subscriptions':
        return 'Active Subscriptions'
      default:
        return metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatValue = (value: number, type: string) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading metrics: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {getMetricTitle(metric.metric)}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatValue(metric.value, metric.type)}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getMetricIcon(metric.metric)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}