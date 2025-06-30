import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { LoadingSpinner } from '../UI/LoadingSpinner'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { admin, isAdmin, loading } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!admin || !isAdmin)) {
      navigate('/admin/login')
    }
  }, [admin, isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!admin || !isAdmin) {
    return null
  }

  return <>{children}</>
}