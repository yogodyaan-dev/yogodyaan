import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  full_name: string
  phone: string
  bio: string
  experience_level: string
  created_at: string
  updated_at: string
  email: string
  user_created_at: string
}

export function useUserProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .rpc('get_user_profiles_for_admin')

      if (fetchError) {
        console.error('RPC Error:', fetchError)
        throw fetchError
      }

      setProfiles(data || [])
    } catch (err: any) {
      console.error('Error fetching user profiles:', err)
      setError(err.message)
      
      // Fallback: try to fetch profiles directly if RPC fails
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            phone,
            bio,
            role,
            created_at,
            updated_at,
            email
          `)
          .order('created_at', { ascending: false })

        if (fallbackError) throw fallbackError

        const transformedData = (fallbackData || []).map(profile => ({
          ...profile,
          experience_level: profile.role || 'user',
          user_created_at: profile.created_at
        }))

        setProfiles(transformedData)
        setError(null)
      } catch (fallbackErr: any) {
        console.error('Fallback fetch also failed:', fallbackErr)
        setError(fallbackErr.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles
  }
}