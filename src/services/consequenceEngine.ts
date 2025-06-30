import { supabase } from '@/lib/supabase'
import { drMarcieAI } from './drMarcieAI'
import { realtimeService } from './realtimeService'
import type { 
  ConsequenceRule, 
  ActiveConsequence, 
  ConsequencePreferences,
  ScreensaverImage
} from '@/types/consequences'
import type { ConversationContext } from '@/types/drMarcie'

class ConsequenceEngine {
  private screensaverImages: ScreensaverImage[] = [
    {
      id: 'guilt-1',
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      category: 'guilt-trip',
      drMarcieCaption: "Your partner is waiting... Still avoiding that challenge?",
      isActive: true
    },
    {
      id: 'motivational-1',
      url: 'https://images.pexels.com/photos/1509428/pexels-photo-1509428.jpeg',
      category: 'motivational',
      drMarcieCaption: "Growth happens outside your comfort zone. Get back in there!",
      isActive: true
    },
    {
      id: 'humorous-1',
      url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
      category: 'humorous',
      drMarcieCaption: "This cat has more commitment than you right now.",
      isActive: true
    },
    {
      id: 'romantic-1',
      url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
      category: 'romantic',
      drMarcieCaption: "Remember why you're doing this work together.",
      isActive: true
    }
  ]

  async triggerConsequence(
    userId: string, 
    coupleId: string, 
    triggeredBy: ConsequenceRule['triggeredBy'],
    context: string
  ): Promise<ActiveConsequence | null> {
    // Get user preferences
    const preferences = await this.getUserPreferences(userId)
    if (!preferences) return null

    // Find appropriate consequence rule
    const rule = await this.selectConsequenceRule(triggeredBy, preferences)
    if (!rule) return null

    // Generate Dr. Marcie's consequence message
    const drMarcieMessage = await this.generateConsequenceMessage(rule, context, userId)

    // Create active consequence
    const consequence: Omit<ActiveConsequence, 'id'> = {
      ruleId: rule.id,
      userId,
      coupleId,
      status: rule.requiresConsent ? 'pending_consent' : 'active',
      triggeredBy: context,
      assignedAt: new Date().toISOString(),
      startedAt: rule.requiresConsent ? undefined : new Date().toISOString(),
      userConsent: !rule.requiresConsent,
      metadata: {},
      drMarcieCommentary: [drMarcieMessage.message]
    }

    const { data, error } = await supabase
      .from('active_consequences')
      .insert(consequence)
      .select()
      .single()

    if (error) throw error

    // If no consent required, activate immediately
    if (!rule.requiresConsent) {
      await this.activateConsequence(data.id)
    }

    // Emit real-time event
    realtimeService.emit('consequence_triggered', {
      userId,
      consequenceId: data.id,
      type: rule.type,
      requiresConsent: rule.requiresConsent
    })

    return data as ActiveConsequence
  }

  async giveConsent(consequenceId: string, consent: boolean): Promise<ActiveConsequence> {
    const { data: consequence, error } = await supabase
      .from('active_consequences')
      .select('*')
      .eq('id', consequenceId)
      .single()

    if (error) throw error

    if (consent) {
      // User consented, activate consequence
      const { data: updated, error: updateError } = await supabase
        .from('active_consequences')
        .update({
          status: 'active',
          userConsent: true,
          startedAt: new Date().toISOString()
        })
        .eq('id', consequenceId)
        .select()
        .single()

      if (updateError) throw updateError

      await this.activateConsequence(consequenceId)
      return updated as ActiveConsequence
    } else {
      // User declined, cancel consequence
      const { data: updated, error: updateError } = await supabase
        .from('active_consequences')
        .update({
          status: 'cancelled',
          userConsent: false,
          cancelledAt: new Date().toISOString()
        })
        .eq('id', consequenceId)
        .select()
        .single()

      if (updateError) throw updateError
      return updated as ActiveConsequence
    }
  }

  private async activateConsequence(consequenceId: string): Promise<void> {
    const { data: consequence, error } = await supabase
      .from('active_consequences')
      .select('*, consequence_rules(*)')
      .eq('id', consequenceId)
      .single()

    if (error) return

    const rule = consequence.consequence_rules as ConsequenceRule

    switch (rule.type) {
      case 'screensaver':
        await this.activateScreensaverConsequence(consequence)
        break
      
      case 'app_block':
        await this.activateAppBlockConsequence(consequence)
        break
      
      case 'notification_spam':
        await this.activateNotificationSpamConsequence(consequence)
        break
      
      case 'challenge_assignment':
        await this.activateChallengeAssignmentConsequence(consequence)
        break
    }
  }

  private async activateScreensaverConsequence(consequence: ActiveConsequence): Promise<void> {
    // Select appropriate screensaver image based on context
    const imageCategory = this.selectScreensaverCategory(consequence.triggeredBy)
    const selectedImage = this.screensaverImages.find(img => 
      img.category === imageCategory && img.isActive
    ) || this.screensaverImages[0]

    // Generate personalized Dr. Marcie message
    const personalizedCaption = await this.generatePersonalizedScreensaverMessage(
      consequence.userId,
      consequence.triggeredBy,
      selectedImage.drMarcieCaption
    )

    // Update consequence metadata
    await supabase
      .from('active_consequences')
      .update({
        metadata: {
          screensaverImage: selectedImage.url,
          originalScreensaver: 'default', // Would capture actual screensaver in real implementation
          drMarcieCaption: personalizedCaption,
          imageCategory: selectedImage.category
        }
      })
      .eq('id', consequence.id)

    // Create notification to user about screensaver change
    await supabase
      .from('notifications')
      .insert({
        user_id: consequence.userId,
        type: 'consequence',
        title: '📱 Dr. Marcie Has Redecorated Your Phone!',
        message: personalizedCaption,
        action_url: '/consequences/active',
        is_read: false,
        priority: 'medium'
      })

    // Emit real-time update
    realtimeService.emit('screensaver_changed', {
      userId: consequence.userId,
      imageUrl: selectedImage.url,
      caption: personalizedCaption
    })
  }

  private async activateAppBlockConsequence(consequence: ActiveConsequence): Promise<void> {
    // Get user preferences for which apps to block
    const preferences = await this.getUserPreferences(consequence.userId)
    const defaultApps = ['instagram', 'tiktok', 'twitter', 'facebook', 'snapchat']
    const appsToBlock = preferences?.blockedAppCategories.length > 0 
      ? preferences.blockedAppCategories 
      : defaultApps

    const blockDuration = this.calculateBlockDuration(consequence.triggeredBy)

    // Generate Dr. Marcie's blocking message
    const blockingMessage = await this.generateAppBlockMessage(
      consequence.userId,
      appsToBlock,
      blockDuration
    )

    // Update consequence metadata
    await supabase
      .from('active_consequences')
      .update({
        metadata: {
          blockedApps: appsToBlock,
          blockDuration,
          blockStartTime: new Date().toISOString(),
          drMarcieBlockMessage: blockingMessage
        }
      })
      .eq('id', consequence.id)

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: consequence.userId,
        type: 'consequence',
        title: '🚫 Apps Temporarily Blocked',
        message: blockingMessage,
        action_url: '/consequences/active',
        is_read: false,
        priority: 'high'
      })

    // In a real implementation, this would integrate with device management APIs
    // For now, we'll emit a real-time event that the client can handle
    realtimeService.emit('apps_blocked', {
      userId: consequence.userId,
      blockedApps: appsToBlock,
      duration: blockDuration,
      message: blockingMessage
    })
  }

  private async activateNotificationSpamConsequence(consequence: ActiveConsequence): Promise<void> {
    const preferences = await this.getUserPreferences(consequence.userId)
    const frequency = preferences?.maxNotificationFrequency || 5 // minutes
    const totalDuration = this.calculateSpamDuration(consequence.triggeredBy)
    const notificationCount = Math.floor(totalDuration / frequency)

    // Generate variety of Dr. Marcie messages
    const messages = await this.generateSpamMessages(
      consequence.userId,
      consequence.triggeredBy,
      notificationCount
    )

    // Update consequence metadata
    await supabase
      .from('active_consequences')
      .update({
        metadata: {
          notificationCount,
          frequency,
          totalDuration,
          messages,
          startTime: new Date().toISOString()
        }
      })
      .eq('id', consequence.id)

    // Schedule notifications (in real implementation, would use a job queue)
    for (let i = 0; i < Math.min(notificationCount, 20); i++) { // Limit to 20 notifications
      const message = messages[i % messages.length]
      
      setTimeout(async () => {
        await supabase
          .from('notifications')
          .insert({
            user_id: consequence.userId,
            type: 'consequence',
            title: '💕 Dr. Marcie Reminder',
            message,
            action_url: '/challenges',
            is_read: false,
            priority: 'medium'
          })

        // Emit real-time notification
        realtimeService.emit('spam_notification', {
          userId: consequence.userId,
          message,
          notificationNumber: i + 1,
          totalNotifications: notificationCount
        })
      }, i * frequency * 60 * 1000) // Convert minutes to milliseconds
    }
  }

  private async activateChallengeAssignmentConsequence(consequence: ActiveConsequence): Promise<void> {
    // Select appropriate makeup challenge based on what was skipped
    const challengeCategory = this.selectMakeupChallengeCategory(consequence.triggeredBy)
    
    const { data: challenges } = await supabase
      .from('challenges')
      .select('*')
      .eq('category', challengeCategory)
      .eq('difficulty_level', 1) // Start with easier makeup challenges
      .limit(1)

    if (challenges && challenges.length > 0) {
      const challenge = challenges[0]
      
      // Assign the challenge
      await supabase
        .from('challenge_attempts')
        .insert({
          couple_id: consequence.coupleId,
          challenge_id: challenge.id,
          status: 'pending'
        })

      // Generate Dr. Marcie's assignment message
      const assignmentMessage = await this.generateChallengeAssignmentMessage(
        consequence.userId,
        challenge.title,
        consequence.triggeredBy
      )

      // Update consequence metadata
      await supabase
        .from('active_consequences')
        .update({
          metadata: {
            challengeAssigned: challenge.id,
            challengeTitle: challenge.title,
            assignmentMessage
          }
        })
        .eq('id', consequence.id)

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: consequence.userId,
          type: 'consequence',
          title: '📋 Makeup Challenge Assigned',
          message: assignmentMessage,
          action_url: `/challenges/${challenge.id}`,
          is_read: false,
          priority: 'high'
        })

      // Emit real-time event
      realtimeService.emit('challenge_assigned', {
        userId: consequence.userId,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        message: assignmentMessage
      })
    }
  }

  // Helper methods for consequence logic
  private selectScreensaverCategory(triggeredBy: string): ScreensaverImage['category'] {
    switch (triggeredBy) {
      case 'missed_challenge':
        return 'guilt-trip'
      case 'low_score':
        return 'motivational'
      case 'skipped_task':
        return 'humorous'
      case 'game_abandoned':
        return 'romantic'
      default:
        return 'motivational'
    }
  }

  private calculateBlockDuration(triggeredBy: string): number {
    // Duration in minutes
    switch (triggeredBy) {
      case 'missed_challenge':
        return 60
      case 'low_score':
        return 30
      case 'skipped_task':
        return 45
      case 'game_abandoned':
        return 90
      default:
        return 30
    }
  }

  private calculateSpamDuration(triggeredBy: string): number {
    // Duration in minutes
    switch (triggeredBy) {
      case 'missed_challenge':
        return 120
      case 'low_score':
        return 60
      case 'skipped_task':
        return 90
      case 'game_abandoned':
        return 180
      default:
        return 60
    }
  }

  private selectMakeupChallengeCategory(triggeredBy: string): string {
    switch (triggeredBy) {
      case 'missed_challenge':
        return 'communication'
      case 'low_score':
        return 'trust'
      case 'skipped_task':
        return 'fun'
      case 'game_abandoned':
        return 'conflict-resolution'
      default:
        return 'communication'
    }
  }

  // AI message generation methods
  private async generatePersonalizedScreensaverMessage(
    userId: string,
    triggeredBy: string,
    baseCaption: string
  ): Promise<string> {
    const context: ConversationContext = {
      userId,
      sessionType: 'consequence',
      currentMood: 'frustrated',
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `Personalize this screensaver message for a user who ${triggeredBy}:
    Base message: "${baseCaption}"
    
    Make it Dr. Marcie's signature style - sweet but savage. Keep it under 50 characters for mobile display.`

    const response = await drMarcieAI.generateResponse(
      prompt,
      context,
      { tone: 'sweet-savage', sassLevel: 4, context: 'consequence' }
    )

    return response.message.substring(0, 50) // Ensure mobile compatibility
  }

  private async generateAppBlockMessage(
    userId: string,
    blockedApps: string[],
    duration: number
  ): Promise<string> {
    const context: ConversationContext = {
      userId,
      sessionType: 'consequence',
      currentMood: 'frustrated',
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `Generate a message about blocking these apps: ${blockedApps.join(', ')} for ${duration} minutes.
    
    Be Dr. Marcie - firm but caring. Explain why this helps their relationship growth.`

    const response = await drMarcieAI.generateResponse(
      prompt,
      context,
      { tone: 'direct', sassLevel: 3, context: 'consequence' }
    )

    return response.message
  }

  private async generateSpamMessages(
    userId: string,
    triggeredBy: string,
    count: number
  ): Promise<string[]> {
    const baseMessages = [
      "Your relationship is calling! 📞💕",
      "Don't ignore your partner's needs! 💔",
      "Dr. Marcie reminder: Love requires effort! 💪❤️",
      "Your couple goals are waiting! ⏰👫",
      "Relationship maintenance in progress... 🔧💕",
      "Skipping again? I'm starting to think you're hiding something... 👀",
      "Your partner deserves better than excuses. Step up! 💪",
      "This is your conscience speaking. Well, it's actually me, Dr. Marcie. 😏",
      "Commitment issues are so last season, darling. 💅",
      "Your relationship won't fix itself. Get back in there! 🏃‍♀️💨"
    ]

    // Generate additional personalized messages if needed
    const messages = [...baseMessages]
    
    while (messages.length < count) {
      const context: ConversationContext = {
        userId,
        sessionType: 'consequence',
        currentMood: 'frustrated',
        recentChallenges: [],
        previousResponses: []
      }

      const prompt = `Generate a short, witty reminder message for someone who ${triggeredBy}. 
      Keep it under 60 characters. Be Dr. Marcie - sweet but savage.`

      const response = await drMarcieAI.generateResponse(
        prompt,
        context,
        { tone: 'sweet-savage', sassLevel: 3, context: 'consequence' }
      )

      messages.push(response.message.substring(0, 60))
    }

    return messages.slice(0, count)
  }

  private async generateChallengeAssignmentMessage(
    userId: string,
    challengeTitle: string,
    triggeredBy: string
  ): Promise<string> {
    const context: ConversationContext = {
      userId,
      sessionType: 'consequence',
      currentMood: 'frustrated',
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `Generate a message assigning the "${challengeTitle}" challenge as a consequence for ${triggeredBy}.
    
    Be Dr. Marcie - firm but fair. Explain why this specific challenge will help them grow.`

    const response = await drMarcieAI.generateResponse(
      prompt,
      context,
      { tone: 'direct', sassLevel: 3, context: 'consequence' }
    )

    return response.message
  }

  // Existing methods from previous implementation...
  private async selectConsequenceRule(
    triggeredBy: ConsequenceRule['triggeredBy'],
    preferences: ConsequencePreferences
  ): Promise<ConsequenceRule | null> {
    const { data: rules, error } = await supabase
      .from('consequence_rules')
      .select('*')
      .eq('triggered_by', triggeredBy)
      .eq('is_active', true)

    if (error || !rules || rules.length === 0) return null

    // Filter rules based on user preferences
    const allowedRules = rules.filter(rule => {
      switch (rule.type) {
        case 'screensaver':
          return preferences.allowScreensaverChanges
        case 'app_block':
          return preferences.allowAppBlocking
        case 'notification_spam':
          return preferences.allowNotificationSpam
        default:
          return true
      }
    })

    if (allowedRules.length === 0) return null

    // Select rule based on severity and randomness
    return allowedRules[Math.floor(Math.random() * allowedRules.length)] as ConsequenceRule
  }

  private async getUserPreferences(userId: string): Promise<ConsequencePreferences | null> {
    const { data, error } = await supabase
      .from('consequence_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Create default preferences if none exist
      const defaultPreferences: Omit<ConsequencePreferences, 'userId'> = {
        allowScreensaverChanges: true,
        allowAppBlocking: false, // Default to false for privacy
        allowNotificationSpam: true,
        maxNotificationFrequency: 5,
        blockedAppCategories: [],
        exemptionHours: [],
        emergencyBypass: true,
        updatedAt: new Date().toISOString()
      }

      const { data: created } = await supabase
        .from('consequence_preferences')
        .insert({ ...defaultPreferences, user_id: userId })
        .select()
        .single()

      return created as ConsequencePreferences
    }

    return data as ConsequencePreferences
  }

  private async generateConsequenceMessage(
    rule: ConsequenceRule,
    context: string,
    userId: string
  ): Promise<any> {
    const conversationContext: ConversationContext = {
      userId,
      sessionType: 'consequence',
      currentMood: 'frustrated',
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `The user has triggered a consequence for: ${context}
    Consequence type: ${rule.type}
    Consequence description: ${rule.description}
    
    Deliver this consequence with your signature "sweet-but-savage" style. Be firm but caring. Explain why this matters for their relationship growth. Keep it under 100 words.`

    return drMarcieAI.generateResponse(
      prompt,
      conversationContext,
      { tone: 'direct', sassLevel: 4, context: 'consequence' }
    )
  }

  async completeConsequence(consequenceId: string): Promise<void> {
    await supabase
      .from('active_consequences')
      .update({
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      .eq('id', consequenceId)

    // Clean up any active effects (restore screensaver, unblock apps, etc.)
    // This would be implemented based on the specific consequence type
    realtimeService.emit('consequence_completed', { consequenceId })
  }

  async getActiveConsequences(userId: string): Promise<ActiveConsequence[]> {
    const { data, error } = await supabase
      .from('active_consequences')
      .select('*, consequence_rules(*)')
      .eq('user_id', userId)
      .in('status', ['pending_consent', 'active'])

    if (error) return []
    return data as ActiveConsequence[]
  }
}

export const consequenceEngine = new ConsequenceEngine()