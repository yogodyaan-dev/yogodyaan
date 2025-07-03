import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../UI/LoadingSpinner'
import { Users, TrendingUp, TrendingDown } from 'lucide-react'

interface EngagementData {
  user_id: string
  email: string
  full_name: string
  total_bookings: number
  attended_classes: number
  articles_viewed: number
  last_activity: string
  engagement_status: 'active' | 'inactive' | 'dormant'
}

export function UserEngagementChart() {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEngagementData()
  }, [])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .order('total_bookings', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      setEngagementData(data || [])
    } catch (err: any) {
      console.error('Error fetching engagement data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'dormant':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />
      case 'inactive':
        return <TrendingDown className="w-4 h-4" />
      case 'dormant':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading engagement data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Engaged Users</h3>
      
      <div className="space-y-4">
        {engagementData.map((user, _) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.full_name || 'No name'}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.total_bookings} bookings
                </p>
                <p className="text-xs text-gray-600">
                  {user.attended_classes} attended
                </p>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(user.engagement_status)}`}>
                {getStatusIcon(user.engagement_status)}
                <span className="capitalize">{user.engagement_status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {engagementData.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No engagement data available</p>
        </div>
      )}
    </div>
  )
}