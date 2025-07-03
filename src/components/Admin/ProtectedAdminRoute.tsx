import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../UI/LoadingSpinner'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { admin, isAdmin, loading } = useAdmin()
  const { isMantraCurator } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!admin || (!isAdmin && !isMantraCurator))) {
      navigate('/admin/login')
    }
  }, [admin, isAdmin, isMantraCurator, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!admin || (!isAdmin && !isMantraCurator)) {
    return null
  }

  return <>{children}</>
}