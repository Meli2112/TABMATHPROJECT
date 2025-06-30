import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Couple } from '@/types/app'

export function useCouple() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: couple, isLoading } = useQuery({
    queryKey: ['couple', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Couple | null
    },
    enabled: !!user,
  })

  const linkPartnerMutation = useMutation({
    mutationFn: async (partnerEmail: string) => {
      if (!user) throw new Error('User not authenticated')

      // First, find the partner by email
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', partnerEmail)
        .single()

      if (partnerError) throw new Error('Partner not found')

      // Create couple relationship
      const { data, error } = await supabase
        .from('couples')
        .insert({
          partner_1_id: user.id,
          partner_2_id: partnerData.id,
          status: 'active',
          total_score: 0,
          current_streak: 0,
          longest_streak: 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as Couple
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] })
    },
  })

  return {
    couple,
    isLoading,
    linkPartner: linkPartnerMutation.mutate,
    isLinking: linkPartnerMutation.isPending,
  }
}