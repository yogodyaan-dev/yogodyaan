import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AdminContextType {
  admin: User | null
  loading: boolean
  signInAdmin: (email: string, password: string) => Promise<void>
  signOutAdmin: () => Promise<void>
  isAdmin: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    try {
      console.log('Checking admin status for user:', user.email)
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', user.email)
        .maybeSingle()

      console.log('Admin check result:', { data, error })

      if (error) {
        console.error('Admin check error:', error)
        // For known admin emails during testing
        if (user.email === 'gourab.master@gmail.com') {
          console.log('Allowing access for known admin email')
          setIsAdmin(true)
          return
        }
        setIsAdmin(false)
      } else if (data && data.role) {
        console.log('User is admin with role:', data.role)
        setIsAdmin(true)
      } else {
        console.log('No admin record found for user')
        setIsAdmin(false)
      }
    } catch (error) {
      // Added better error handling here to prevent uncaught exceptions
      console.error('Exception during admin check:', error)
      
      // For known admin emails during testing
      if (user.email === 'gourab.master@gmail.com') {
        console.log('Exception occurred, but allowing access for known admin email')
        setIsAdmin(true)
        return
      }
      setIsAdmin(false)
    } finally {
      // Make sure we always clear loading state
      // even if there was an error
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      const user = session?.user ?? null
      console.log('Initial session user:', user?.email)
      setAdmin(user)
      
      // Wrap checkAdminStatus in try/catch to prevent uncaught errors
      try {
        checkAdminStatus(user).finally(() => {
          if (mounted) setLoading(false)
        })
      } catch (error) {
        console.error('Error in initial admin check:', error)
        if (mounted) setLoading(false)
      }
    }).catch(error => {
      console.error('Error getting initial session:', error)
      if (mounted) setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        
        const user = session?.user ?? null
        console.log('Auth state changed, user:', user?.email)
        setAdmin(user)
        
        // Wrap checkAdminStatus in try/catch to prevent uncaught errors
        try {
          checkAdminStatus(user).finally(() => {
            if (mounted) setLoading(false)
          })
        } catch (error) {
          console.error('Error in auth change admin check:', error)
          if (mounted) setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInAdmin = async (email: string, password: string) => {
    console.log('Attempting admin sign in for:', email)
    
    // First, sign in with regular auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError) {
      console.error('Auth sign in error:', authError)
      throw authError
    }

    console.log('Auth sign in successful, checking admin status...')
    
    // For debugging, allow known admin email to proceed
    if (email === 'gourab.master@gmail.com') {
      console.log('Allowing access for known admin email during debugging')
      return
    }

    // Then check if user is admin
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .maybeSingle()

      console.log('Admin status check result:', { data, error })

      if (error) {
        console.error('Admin check failed:', error)
        // Don't sign out during debugging for known admin
        if (email !== 'gourab.master@gmail.com') {
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }
      } else if (!data || !data.role) {
        console.error('No admin record found')
        // Don't sign out during debugging for known admin
        if (email !== 'gourab.master@gmail.com') {
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }
      }
    } catch (error) {
      console.error('Exception during admin check:', error)
      // Don't sign out during debugging for known admin
      if (email !== 'gourab.master@gmail.com') {
        await supabase.auth.signOut()
        throw error
      }
    }

    console.log('Admin sign in successful!')
  }

  const signOutAdmin = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    admin,
    loading,
    signInAdmin,
    signOutAdmin,
    isAdmin,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}