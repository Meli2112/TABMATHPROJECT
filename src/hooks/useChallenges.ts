import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Challenge, ChallengeAttempt } from '@/types/app'

export function useChallenges() {
  const queryClient = useQueryClient()

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Challenge[]
    },
  })

  const startChallengeMutation = useMutation({
    mutationFn: async ({ coupleId, challengeId }: { coupleId: string; challengeId: string }) => {
      const { data, error } = await supabase
        .from('challenge_attempts')
        .insert({
          couple_id: coupleId,
          challenge_id: challengeId,
          status: 'in-progress',
        })
        .select()
        .single()

      if (error) throw error
      return data as ChallengeAttempt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-attempts'] })
    },
  })

  return {
    challenges,
    isLoading,
    startChallenge: startChallengeMutation.mutate,
    isStarting: startChallengeMutation.isPending,
  }
}