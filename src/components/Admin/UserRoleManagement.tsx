import { useState, useEffect } from 'react'
import { User, Shield, Clock, AlertTriangle, Check } from 'lucide-react'
import { Button } from '../UI/Button'
import { supabase } from '../../lib/supabase'

interface UserRole {
  id: string
  name: string
  description: string
}

interface RoleChange {
  timestamp: string
  changed_by: string
  old_role: string
  new_role: string
}

interface UserRoleManagementProps {
  userId: string
  userEmail: string
  currentRoles: string[]
  onRoleUpdate: (newRoles: string[]) => void
  onClose: () => void
}

export function UserRoleManagement({ userId, userEmail, currentRoles, onRoleUpdate, onClose }: UserRoleManagementProps) {
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles || [])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [roleChanges, setRoleChanges] = useState<RoleChange[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAvailableRoles()
    fetchRoleChangeHistory()
  }, [userId])

  const fetchAvailableRoles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error
      setAvailableRoles(data || [])
    } catch (err: any) {
      console.error('Error fetching roles:', err.message)
      setError('Failed to load available roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleChangeHistory = async () => {
    try {
      // This would normally fetch from a role_changes table
      // For demo purposes, we're using mock data
      const mockRoleChanges: RoleChange[] = [
        {
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          changed_by: 'admin@yogodyaan.com',
          old_role: 'user',
          new_role: 'instructor'
        }
      ]
      setRoleChanges(mockRoleChanges)
    } catch (err: any) {
      console.error('Error fetching role history:', err.message)
    }
  }

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName)
      } else {
        return [...prev, roleName]
      }
    })
  }

  const handleUpdateRoles = async () => {
    if (selectedRoles.length === 0) {
      setError('User must have at least one role')
      return
    }

    setUpdating(true)
    setError('')
    try {
      // Get the current user ID at the beginning of the function
      const currentUser = await supabase.auth.getUser()
      const assignedById = currentUser.data.user?.id

      // 1. Get the current user roles from the database
      const { data: existingRoleData, error: fetchError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId)
      
      if (fetchError) throw fetchError

      const existingRoles = existingRoleData?.map(item => item.roles?.name).filter(Boolean) || []
      
      // 2. Get IDs for all selected roles
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .in('name', selectedRoles)
      
      if (roleError) throw roleError
      
      if (!roleData || roleData.length === 0) {
        throw new Error('Could not find role information')
      }

      // 3. Delete roles that are no longer selected
      const rolesToRemove = existingRoles.filter(role => !selectedRoles.includes(role))
      if (rolesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .in('role_id', roleData.filter(r => rolesToRemove.includes(r.name)).map(r => r.id))
        
        if (removeError) throw removeError
      }
      
      // 4. Add newly selected roles
      const rolesToAdd = selectedRoles.filter(role => !existingRoles.includes(role))
      if (rolesToAdd.length > 0) {
        const roleRecords = rolesToAdd.map(roleName => ({
          user_id: userId,
          role_id: roleData.find(r => r.name === roleName)!.id,
          assigned_by: assignedById
        }))
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roleRecords)
        
        if (insertError) throw insertError
      }

      // 5. Update local state and show success message
      setSuccess('User roles updated successfully')
      onRoleUpdate(selectedRoles)
      
      // 6. Log role change for history
      const changeDetails = {
        user_id: userId,
        changed_by: assignedById || 'unknown',
        old_roles: existingRoles,
        new_roles: selectedRoles,
        timestamp: new Date().toISOString()
      }
      
      console.log('Role change logged:', changeDetails)
      // In a real app, you would insert this into a role_changes table
      
      // Refresh role history
      await fetchRoleChangeHistory()
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Error updating roles:', err.message)
      setError('Failed to update roles: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Role Management
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {error}
            </p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm flex items-center">
              <Check className="w-4 h-4 mr-1" />
              {success}
            </p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-700 mb-1">User Email</p>
          <p className="text-gray-900 font-medium">{userEmail}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Current Roles</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {currentRoles && currentRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentRoles.map((role) => (
                  <span 
                    key={role} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No roles assigned</p>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Manage Roles</h4>
          
          {loading ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">Loading roles...</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableRoles.map((role) => (
                  <div 
                    key={role.id} 
                    className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedRoles.includes(role.name) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleRoleToggle(role.name)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`font-medium capitalize ${
                        role.name === 'admin' || role.name === 'super_admin' 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {role.name}
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-sm text-gray-500 mt-1 ml-6">{role.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  <Shield className="w-4 h-4 inline mr-1 text-amber-500" />
                  Warning: Admin roles grant significant permissions
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Role Change History</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {roleChanges.length > 0 ? (
              <div className="space-y-3">
                {roleChanges.map((change, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-700">
                          Changed from <span className="font-medium capitalize">{change.old_role}</span> to{' '}
                          <span className="font-medium capitalize">{change.new_role}</span>
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          <p>By {change.changed_by} on {formatDate(change.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No role changes recorded</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRoles}
            loading={updating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Update Roles
          </Button>
        </div>
      </div>
    </div>
  )
}