import { supabase } from '@/lib/supabase'
import { io, Socket } from 'socket.io-client'
import type { 
  RealtimeEvent, 
  LiveDashboard, 
  RealtimeNotification,
  RelationshipStory 
} from '@/types/realtime'

class RealtimeService {
  private socket: Socket | null = null
  private subscriptions: Map<string, any> = new Map()
  private dashboardCache: Map<string, LiveDashboard> = new Map()
  private listeners: Map<string, Function[]> = new Map()

  async initialize(userId: string, accessToken: string): Promise<void> {
    // Initialize WebSocket connection
    this.socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
      auth: {
        token: accessToken,
        userId
      }
    })

    this.socket.on('connect', () => {
      console.log('Connected to realtime service')
      this.emit('connection_status', { connected: true })
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from realtime service')
      this.emit('connection_status', { connected: false })
    })

    // Set up Supabase realtime subscriptions
    await this.setupSupabaseSubscriptions(userId)
  }

  private async setupSupabaseSubscriptions(userId: string): Promise<void> {
    // Subscribe to notifications
    const notificationSub = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleNotification(payload.new)
        }
      )
      .subscribe()

    this.subscriptions.set('notifications', notificationSub)

    // Subscribe to game sessions
    const gameSub = supabase
      .channel('game_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          this.handleGameUpdate(payload)
        }
      )
      .subscribe()

    this.subscriptions.set('game_sessions', gameSub)

    // Subscribe to game responses
    const responsesSub = supabase
      .channel('game_responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_responses'
        },
        (payload) => {
          this.handleGameResponse(payload.new)
        }
      )
      .subscribe()

    this.subscriptions.set('game_responses', responsesSub)

    // Subscribe to consequences
    const consequenceSub = supabase
      .channel('active_consequences')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_consequences',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleConsequenceUpdate(payload)
        }
      )
      .subscribe()

    this.subscriptions.set('consequences', consequenceSub)

    // Subscribe to SOS sessions
    const sosSub = supabase
      .channel('sos_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_sessions'
        },
        (payload) => {
          this.handleSOSUpdate(payload)
        }
      )
      .subscribe()

    this.subscriptions.set('sos_sessions', sosSub)

    // Subscribe to couple score updates
    const couplesSub = supabase
      .channel('couples')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couples'
        },
        (payload) => {
          this.handleCoupleScoreUpdate(payload.new)
        }
      )
      .subscribe()

    this.subscriptions.set('couples', couplesSub)
  }

  // Event handlers
  private handleNotification(notification: any): void {
    const realtimeNotification: RealtimeNotification = {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      drMarcieMessage: notification.dr_marcie_message,
      actionUrl: notification.action_url,
      priority: notification.priority || 'medium',
      isRead: notification.is_read,
      createdAt: notification.created_at
    }

    this.emit('notification', realtimeNotification)

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/dr-marcie-icon.png',
        badge: '/dr-marcie-badge.png'
      })
    }

    // Update dashboard cache
    this.updateDashboardNotifications(notification.user_id, realtimeNotification)
  }

  private handleGameUpdate(payload: any): void {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      type: 'game_started',
      userId: payload.new?.initiated_by || '',
      coupleId: payload.new?.couple_id || '',
      data: payload.new,
      timestamp: new Date().toISOString()
    }

    this.emit('game_update', event)
    this.updateDashboardActivity(event.coupleId, event)
  }

  private handleGameResponse(response: any): void {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      type: 'score_update',
      userId: response.user_id,
      coupleId: '', // Would need to get from session
      data: {
        responseId: response.id,
        scores: {
          emotional: response.emotional_score,
          vulnerability: response.vulnerability_score,
          honesty: response.honesty_score
        }
      },
      timestamp: new Date().toISOString()
    }

    this.emit('game_response', event)
  }

  private handleConsequenceUpdate(payload: any): void {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      type: 'consequence_triggered',
      userId: payload.new?.user_id || '',
      coupleId: payload.new?.couple_id || '',
      data: payload.new,
      timestamp: new Date().toISOString()
    }

    this.emit('consequence_update', event)
    this.updateDashboardActivity(event.coupleId, event)
  }

  private handleSOSUpdate(payload: any): void {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      type: 'sos_activated',
      userId: payload.new?.initiated_by || '',
      coupleId: payload.new?.couple_id || '',
      data: payload.new,
      timestamp: new Date().toISOString()
    }

    this.emit('sos_update', event)
    this.updateDashboardActivity(event.coupleId, event)
  }

  private handleCoupleScoreUpdate(couple: any): void {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      type: 'score_update',
      userId: couple.partner_1_id,
      coupleId: couple.id,
      data: {
        totalScore: couple.total_score,
        currentStreak: couple.current_streak,
        longestStreak: couple.longest_streak
      },
      timestamp: new Date().toISOString()
    }

    this.emit('score_update', event)
    this.updateDashboardScores(couple.id, couple)
  }

  // Dashboard management
  async getLiveDashboard(coupleId: string): Promise<LiveDashboard> {
    // Check cache first
    const cached = this.dashboardCache.get(coupleId)
    if (cached && this.isCacheValid(cached.lastUpdated)) {
      return cached
    }

    // Fetch fresh data
    const dashboard = await this.buildLiveDashboard(coupleId)
    this.dashboardCache.set(coupleId, dashboard)
    return dashboard
  }

  private async buildLiveDashboard(coupleId: string): Promise<LiveDashboard> {
    // Get couple data
    const { data: couple } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single()

    // Get active games
    const { data: activeGames } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('couple_id', coupleId)
      .in('status', ['starting', 'in-progress', 'paused'])

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('game_events')
      .select('*')
      .eq('couple_id', coupleId)
      .order('timestamp', { ascending: false })
      .limit(10)

    // Get active consequences
    const { data: consequences } = await supabase
      .from('active_consequences')
      .select('*')
      .eq('couple_id', coupleId)
      .in('status', ['pending_consent', 'active'])

    // Get unread notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${couple?.partner_1_id},user_id.eq.${couple?.partner_2_id}`)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate vulnerability points and trust thermometer
    const { data: gameResponses } = await supabase
      .from('game_responses')
      .select('vulnerability_score, honesty_score, user_id')
      .in('session_id', activeGames?.map(g => g.id) || [])

    const partner1Responses = gameResponses?.filter(r => r.user_id === couple?.partner_1_id) || []
    const partner2Responses = gameResponses?.filter(r => r.user_id === couple?.partner_2_id) || []

    const dashboard: LiveDashboard = {
      coupleId,
      scores: {
        partner1: {
          totalPoints: Math.floor(couple?.total_score / 2) || 0,
          vulnerabilityPoints: partner1Responses.reduce((sum, r) => sum + (r.vulnerability_score || 0), 0),
          trustThermometer: partner1Responses.reduce((sum, r) => sum + (r.honesty_score || 0), 0) / Math.max(partner1Responses.length, 1),
          currentStreak: couple?.current_streak || 0,
          longestStreak: couple?.longest_streak || 0
        },
        partner2: {
          totalPoints: Math.floor(couple?.total_score / 2) || 0,
          vulnerabilityPoints: partner2Responses.reduce((sum, r) => sum + (r.vulnerability_score || 0), 0),
          trustThermometer: partner2Responses.reduce((sum, r) => sum + (r.honesty_score || 0), 0) / Math.max(partner2Responses.length, 1),
          currentStreak: couple?.current_streak || 0,
          longestStreak: couple?.longest_streak || 0
        },
        combined: {
          totalPoints: couple?.total_score || 0,
          relationshipHealth: this.calculateRelationshipHealth(couple, gameResponses),
          challengesCompleted: activeGames?.filter(g => g.status === 'completed').length || 0,
          conflictsResolved: 0 // Would calculate from SOS sessions
        }
      },
      activeGames: activeGames || [],
      recentActivity: (recentActivity || []).map(this.mapToRealtimeEvent),
      notifications: (notifications || []).map(this.mapToRealtimeNotification),
      consequences: consequences || [],
      lastUpdated: new Date().toISOString()
    }

    return dashboard
  }

  private calculateRelationshipHealth(couple: any, responses: any[]): number {
    if (!responses || responses.length === 0) return 50 // Neutral starting point

    const avgVulnerability = responses.reduce((sum, r) => sum + (r.vulnerability_score || 0), 0) / responses.length
    const avgHonesty = responses.reduce((sum, r) => sum + (r.honesty_score || 0), 0) / responses.length
    const streakBonus = Math.min(couple?.current_streak * 2, 20) // Max 20 bonus points

    return Math.min(100, Math.max(0, (avgVulnerability + avgHonesty) / 2 + streakBonus))
  }

  private mapToRealtimeEvent(dbEvent: any): RealtimeEvent {
    return {
      id: dbEvent.id,
      type: dbEvent.type,
      userId: dbEvent.user_id || '',
      coupleId: dbEvent.couple_id || '',
      data: dbEvent.data,
      timestamp: dbEvent.timestamp
    }
  }

  private mapToRealtimeNotification(dbNotification: any): RealtimeNotification {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      type: dbNotification.type,
      title: dbNotification.title,
      message: dbNotification.message,
      drMarcieMessage: dbNotification.dr_marcie_message,
      actionUrl: dbNotification.action_url,
      priority: dbNotification.priority || 'medium',
      isRead: dbNotification.is_read,
      createdAt: dbNotification.created_at,
      expiresAt: dbNotification.expires_at
    }
  }

  // Cache management
  private isCacheValid(lastUpdated: string): boolean {
    const cacheAge = Date.now() - new Date(lastUpdated).getTime()
    return cacheAge < 30000 // 30 seconds cache validity
  }

  private updateDashboardScores(coupleId: string, couple: any): void {
    const cached = this.dashboardCache.get(coupleId)
    if (cached) {
      cached.scores.combined.totalPoints = couple.total_score
      cached.scores.partner1.currentStreak = couple.current_streak
      cached.scores.partner2.currentStreak = couple.current_streak
      cached.scores.partner1.longestStreak = couple.longest_streak
      cached.scores.partner2.longestStreak = couple.longest_streak
      cached.lastUpdated = new Date().toISOString()
    }
  }

  private updateDashboardActivity(coupleId: string, event: RealtimeEvent): void {
    const cached = this.dashboardCache.get(coupleId)
    if (cached) {
      cached.recentActivity.unshift(event)
      cached.recentActivity = cached.recentActivity.slice(0, 10) // Keep only latest 10
      cached.lastUpdated = new Date().toISOString()
    }
  }

  private updateDashboardNotifications(userId: string, notification: RealtimeNotification): void {
    // Update all dashboards where this user is a partner
    this.dashboardCache.forEach((dashboard, coupleId) => {
      dashboard.notifications.unshift(notification)
      dashboard.notifications = dashboard.notifications.slice(0, 20) // Keep only latest 20
      dashboard.lastUpdated = new Date().toISOString()
    })
  }

  // WebSocket room management
  joinCoupleRoom(coupleId: string): void {
    if (this.socket) {
      this.socket.emit('join_couple_room', coupleId)
    }
  }

  leaveCoupleRoom(coupleId: string): void {
    if (this.socket) {
      this.socket.emit('leave_couple_room', coupleId)
    }
  }

  // Send real-time updates to partner
  sendToPartner(coupleId: string, event: string, data: any): void {
    if (this.socket) {
      this.socket.emit('partner_update', {
        coupleId,
        event,
        data,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Listen for partner updates
  onPartnerUpdate(callback: (event: string, data: any) => void): void {
    if (this.socket) {
      this.socket.on('partner_update', callback)
    }
  }

  // Generic event emitter for UI components
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Relationship story management
  async updateRelationshipStory(coupleId: string, updates: Partial<RelationshipStory>): Promise<void> {
    const { error } = await supabase
      .from('relationship_stories')
      .upsert({
        couple_id: coupleId,
        ...updates,
        last_updated: new Date().toISOString()
      })

    if (error) throw error

    // Emit real-time update
    this.emit('relationship_story_updated', { coupleId, updates })
  }

  // Cleanup
  disconnect(): void {
    // Unsubscribe from all Supabase channels
    this.subscriptions.forEach(sub => {
      supabase.removeChannel(sub)
    })
    this.subscriptions.clear()

    // Disconnect WebSocket
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    // Clear caches and listeners
    this.dashboardCache.clear()
    this.listeners.clear()
  }
}

export const realtimeService = new RealtimeService()