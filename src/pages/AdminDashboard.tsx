import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  LogOut,
  BookOpen,
  MessageCircle,
  Mail,
  Users as UsersIcon,
  GraduationCap,
  CreditCard,
  BarChart3,
  TrendingUp,
  Settings,
  FileText
} from 'lucide-react'
import { Button } from '../components/UI/Button'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { ArticleManagement } from '../components/Admin/ArticleManagement'
import { BusinessSettings } from '../components/Admin/BusinessSettings'
import { FormSubmissions } from '../components/Admin/FormSubmissions'
import { NewsletterManagement } from '../components/Admin/NewsletterManagement'
import { DashboardMetrics } from '../components/Analytics/DashboardMetrics'
import { UserEngagementChart } from '../components/Analytics/UserEngagementChart'
import { useAdmin } from '../contexts/AdminContext'
import { useUserProfiles } from '../hooks/useUserProfiles'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  totalBookings: number
  totalQueries: number
  totalContacts: number
  totalArticles: number
  publishedArticles: number
  totalViews: number
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  recentBookings: any[]
  pendingQueries: any[]
  newContacts: any[]
  allBookings: any[]
  allQueries: any[]
  allContacts: any[]
  allInstructors: any[]
  allClassTypes: any[]
  allSubscriptions: any[]
  allTransactions: any[]
}

export function AdminDashboard() {
  const { admin, isAdmin, signOutAdmin } = useAdmin()
  const { profiles } = useUserProfiles()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    fetchDashboardData()
  }, [isAdmin, navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      console.log('Fetching dashboard data for admin:', admin?.email)

      // Fetch all data with better error handling
      const [
        bookingsRes, 
        queriesRes, 
        contactsRes, 
        articlesRes, 
        viewsRes,
        instructorsRes,
        classTypesRes,
        subscriptionsRes,
        transactionsRes
      ] = await Promise.allSettled([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('yoga_queries').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('article_views').select('*'),
        supabase.from('instructors').select('*').order('created_at', { ascending: false }),
        supabase.from('class_types').select('*').order('created_at', { ascending: false }),
        supabase.from('user_subscriptions').select('*, subscription_plans(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ])

      // Extract data with fallbacks and better error handling
      const bookings = bookingsRes.status === 'fulfilled' && !bookingsRes.value.error ? bookingsRes.value.data || [] : []
      const queries = queriesRes.status === 'fulfilled' && !queriesRes.value.error ? queriesRes.value.data || [] : []
      const contacts = contactsRes.status === 'fulfilled' && !contactsRes.value.error ? contactsRes.value.data || [] : []
      const articles = articlesRes.status === 'fulfilled' && !articlesRes.value.error ? articlesRes.value.data || [] : []
      const views = viewsRes.status === 'fulfilled' && !viewsRes.value.error ? viewsRes.value.data || [] : []
      const instructors = instructorsRes.status === 'fulfilled' && !instructorsRes.value.error ? instructorsRes.value.data || [] : []
      const classTypes = classTypesRes.status === 'fulfilled' && !classTypesRes.value.error ? classTypesRes.value.data || [] : []
      const subscriptions = subscriptionsRes.status === 'fulfilled' && !subscriptionsRes.value.error ? subscriptionsRes.value.data || [] : []
      const transactions = transactionsRes.status === 'fulfilled' && !transactionsRes.value.error ? transactionsRes.value.data || [] : []

      // Log any errors for debugging
      if (bookingsRes.status === 'rejected') console.warn('Bookings fetch failed:', bookingsRes.reason)
      if (queriesRes.status === 'rejected') console.warn('Queries fetch failed:', queriesRes.reason)
      if (contactsRes.status === 'rejected') console.warn('Contacts fetch failed:', contactsRes.reason)
      if (articlesRes.status === 'rejected') console.warn('Articles fetch failed:', articlesRes.reason)
      if (viewsRes.status === 'rejected') console.warn('Views fetch failed:', viewsRes.reason)
      if (instructorsRes.status === 'rejected') console.warn('Instructors fetch failed:', instructorsRes.reason)
      if (classTypesRes.status === 'rejected') console.warn('Class types fetch failed:', classTypesRes.reason)
      if (subscriptionsRes.status === 'rejected') console.warn('Subscriptions fetch failed:', subscriptionsRes.reason)
      if (transactionsRes.status === 'rejected') console.warn('Transactions fetch failed:', transactionsRes.reason)

      // Filter data safely
      const pendingQueries = queries.filter(q => q?.status === 'pending')
      const newContacts = contacts.filter(c => c?.status === 'new')
      const activeSubscriptions = subscriptions.filter(s => s?.status === 'active')
      const completedTransactions = transactions.filter(t => t?.status === 'completed')
      const monthlyRevenue = completedTransactions
        .filter(t => t?.created_at && new Date(t.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        .reduce((sum, t) => sum + parseFloat(t?.amount || '0'), 0)

      setStats({
        totalBookings: bookings.length,
        totalQueries: queries.length,
        totalContacts: contacts.length,
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a?.status === 'published').length,
        totalViews: views.length,
        totalUsers: profiles.length,
        activeSubscriptions: activeSubscriptions.length,
        monthlyRevenue,
        recentBookings: bookings.slice(0, 5),
        pendingQueries: pendingQueries.slice(0, 10),
        newContacts: newContacts.slice(0, 10),
        allBookings: bookings,
        allQueries: queries,
        allContacts: contacts,
        allInstructors: instructors,
        allClassTypes: classTypes,
        allSubscriptions: subscriptions,
        allTransactions: transactions
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setStats({
        totalBookings: 0,
        totalQueries: 0,
        totalContacts: 0,
        totalArticles: 0,
        publishedArticles: 0,
        totalViews: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        recentBookings: [],
        pendingQueries: [],
        newContacts: [],
        allBookings: [],
        allQueries: [],
        allContacts: [],
        allInstructors: [],
        allClassTypes: [],
        allSubscriptions: [],
        allTransactions: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOutAdmin()
    navigate('/')
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      await fetchDashboardData()
      alert('Booking deleted successfully!')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error

      await fetchDashboardData()
      alert('Booking status updated successfully!')
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {admin?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <span>View Site</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'users', label: 'User Management', icon: <UsersIcon className="w-4 h-4" /> },
              { id: 'instructors', label: 'Instructors', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'classes', label: 'Class Types', icon: <Calendar className="w-4 h-4" /> },
              { id: 'articles', label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
              { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'transactions', label: 'Transactions', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'queries', label: 'Yoga Queries', icon: <MessageCircle className="w-4 h-4" /> },
              { id: 'contacts', label: 'Contact Messages', icon: <Mail className="w-4 h-4" /> },
              { id: 'submissions', label: 'Form Submissions', icon: <FileText className="w-4 h-4" /> },
              { id: 'newsletter', label: 'Newsletter', icon: <Mail className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'queries' && stats.pendingQueries.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.pendingQueries.length}
                  </span>
                )}
                {tab.id === 'contacts' && stats.newContacts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.newContacts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced Metrics */}
            <DashboardMetrics />

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UserEngagementChart />
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.first_name} {booking.last_name}</p>
                          <p className="text-sm text-gray-600">{booking.class_name}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent bookings</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management ({profiles.length})</h2>
            {profiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'No name provided'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                            {user.experience_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.user_created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users yet</h3>
                <p className="text-gray-600">Users will appear here once they sign up.</p>
              </div>
            )}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && <ArticleManagement />}

        {/* Form Submissions Tab */}
        {activeTab === 'submissions' && <FormSubmissions />}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && <NewsletterManagement />}

        {/* Business Settings Tab */}
        {activeTab === 'settings' && <BusinessSettings />}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructors ({stats.allInstructors.length})</h2>
            {stats.allInstructors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.allInstructors.map((instructor) => (
                  <div key={instructor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">{instructor.bio}</p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Experience: {instructor.experience_years} years</p>
                      {instructor.specialties && instructor.specialties.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Specialties:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {instructor.specialties.map((specialty: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No instructors yet</h3>
                <p className="text-gray-600">Instructors will appear here once they are added.</p>
              </div>
            )}
          </div>
        )}

        {/* Class Types Tab */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Types ({stats.allClassTypes.length})</h2>
            {stats.allClassTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.allClassTypes.map((classType) => (
                  <div key={classType.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-gray-900">{classType.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">{classType.description}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-500">Level:</span> 
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded capitalize">
                          {classType.difficulty_level}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Price:</span> 
                        <span className="ml-2 font-semibold">{formatCurrency(classType.price)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Duration:</span> 
                        <span className="ml-2">{classType.duration_minutes} minutes</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No class types yet</h3>
                <p className="text-gray-600">Class types will appear here once they are added.</p>
              </div>
            )}
          </div>
        )}

        {/* Add other existing tabs here... */}
      </main>
    </div>
  )
}