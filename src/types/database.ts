export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          age: number | null
          gender: string | null
          relationship_status: string | null
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          age?: number | null
          gender?: string | null
          relationship_status?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          age?: number | null
          gender?: string | null
          relationship_status?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          partner_1_id: string
          partner_2_id: string
          relationship_start_date: string | null
          status: string
          total_score: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_1_id: string
          partner_2_id: string
          relationship_start_date?: string | null
          status?: string
          total_score?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_1_id?: string
          partner_2_id?: string
          relationship_start_date?: string | null
          status?: string
          total_score?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty_level: number
          points_reward: number
          time_limit_minutes: number | null
          is_premium: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty_level: number
          points_reward: number
          time_limit_minutes?: number | null
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty_level?: number
          points_reward?: number
          time_limit_minutes?: number | null
          is_premium?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenge_attempts: {
        Row: {
          id: string
          couple_id: string
          challenge_id: string
          status: string
          score: number | null
          completed_at: string | null
          feedback: string | null
          ai_analysis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          challenge_id: string
          status?: string
          score?: number | null
          completed_at?: string | null
          feedback?: string | null
          ai_analysis?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          challenge_id?: string
          status?: string
          score?: number | null
          completed_at?: string | null
          feedback?: string | null
          ai_analysis?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consequences: {
        Row: {
          id: string
          couple_id: string
          type: string
          title: string
          description: string
          assigned_to: string | null
          status: string
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          type: string
          title: string
          description: string
          assigned_to?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          type?: string
          title?: string
          description?: string
          assigned_to?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fight_logs: {
        Row: {
          id: string
          couple_id: string
          reported_by: string
          severity_level: number
          description: string
          ai_analysis: string | null
          resolution_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          reported_by: string
          severity_level: number
          description: string
          ai_analysis?: string | null
          resolution_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          reported_by?: string
          severity_level?: number
          description?: string
          ai_analysis?: string | null
          resolution_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}