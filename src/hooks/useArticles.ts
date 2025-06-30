import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArticleWithStats } from '../types/article'

export function useArticles() {
  const [articles, setArticles] = useState<ArticleWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async (filters?: {
    category?: string
    sortBy?: 'latest' | 'popular' | 'highest_rated'
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('articles')
        .select(`
          *,
          ratings(rating)
        `)
        .eq('status', 'published')

      // Apply category filter
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'popular':
          query = query.order('view_count', { ascending: false })
          break
        case 'latest':
        default:
          query = query.order('published_at', { ascending: false })
          break
      }

      // Apply limit
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Calculate ratings for each article
      const articlesWithStats: ArticleWithStats[] = data?.map(article => {
        const ratings = article.ratings || []
        const totalRatings = ratings.length
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings 
          : 0

        return {
          ...article,
          average_rating: Math.round(averageRating * 10) / 10,
          total_ratings: totalRatings
        }
      }) || []

      // Sort by highest rated if requested
      if (filters?.sortBy === 'highest_rated') {
        articlesWithStats.sort((a, b) => {
          if (a.average_rating === b.average_rating) {
            return b.total_ratings - a.total_ratings
          }
          return b.average_rating - a.average_rating
        })
      }

      setArticles(articlesWithStats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles
  }
}