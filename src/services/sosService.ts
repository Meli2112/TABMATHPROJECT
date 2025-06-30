import { supabase } from '@/lib/supabase'
import { drMarcieAI } from './drMarcieAI'
import { voiceSynthesis } from './voiceSynthesis'
import { consequenceEngine } from './consequenceEngine'
import type { 
  SOSSession, 
  SOSInput, 
  SOSAnalysis 
} from '@/types/sosSystem'
import type { ConversationContext, DrMarcieResponse } from '@/types/drMarcie'

class SOSService {
  async initiateSOS(coupleId: string, userId: string): Promise<SOSSession> {
    // Check if there's already an active SOS session
    const { data: existingSession } = await supabase
      .from('sos_sessions')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('status', 'active')
      .single()

    if (existingSession) {
      throw new Error('An SOS session is already active for this couple')
    }

    const session: Omit<SOSSession, 'id'> = {
      coupleId,
      initiatedBy: userId,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('sos_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error

    // Generate Dr. Marcie's SOS initiation message
    const initiationMessage = await this.generateSOSInitiationMessage(userId, coupleId)
    
    // Store the initiation message in Dr. Marcie conversations
    await supabase
      .from('dr_marcie_conversations')
      .insert({
        user_id: userId,
        couple_id: coupleId,
        session_type: 'fight-solver',
        context: { sos_session_id: data.id, phase: 'initiation' },
        user_message: 'SOS_INITIATED',
        dr_marcie_response: initiationMessage
      })

    // Notify partner via real-time
    await this.notifyPartner(coupleId, userId, data.id)

    return data as SOSSession
  }

  async submitSOSInput(
    sessionId: string, 
    userId: string, 
    inputData: Omit<SOSInput, 'id' | 'sessionId' | 'userId' | 'submittedAt'>
  ): Promise<SOSInput> {
    // Validate session is active
    const { data: session } = await supabase
      .from('sos_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('status', 'active')
      .single()

    if (!session) {
      throw new Error('SOS session not found or not active')
    }

    // Check if user already submitted input
    const { data: existingInput } = await supabase
      .from('sos_inputs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single()

    if (existingInput) {
      throw new Error('You have already submitted your input for this SOS session')
    }

    const input: Omit<SOSInput, 'id'> = {
      sessionId,
      userId,
      ...inputData,
      submittedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('sos_inputs')
      .insert(input)
      .select()
      .single()

    if (error) throw error

    // Generate Dr. Marcie's acknowledgment
    const acknowledgment = await this.generateInputAcknowledgment(inputData, userId)
    
    // Store acknowledgment
    await supabase
      .from('dr_marcie_conversations')
      .insert({
        user_id: userId,
        couple_id: session.coupleId,
        session_type: 'fight-solver',
        context: { sos_session_id: sessionId, phase: 'input_received' },
        user_message: JSON.stringify(inputData),
        dr_marcie_response: acknowledgment
      })

    // Check if both partners have submitted
    await this.checkForAnalysis(sessionId)

    return data as SOSInput
  }

  private async checkForAnalysis(sessionId: string): Promise<void> {
    const { data: inputs, error } = await supabase
      .from('sos_inputs')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error

    if (inputs && inputs.length === 2) {
      // Both partners have submitted, trigger analysis
      await this.analyzeConflict(sessionId, inputs as SOSInput[])
    }
  }

  private async analyzeConflict(sessionId: string, inputs: SOSInput[]): Promise<SOSAnalysis> {
    // Update session status
    await supabase
      .from('sos_sessions')
      .update({ status: 'analyzing' })
      .eq('id', sessionId)

    try {
      const [partner1Input, partner2Input] = inputs
      
      // Create comprehensive analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(partner1Input, partner2Input)
      
      // Get couple context for personalization
      const context = await this.buildConversationContext(inputs[0].userId, sessionId)
      
      // Generate AI analysis using the most appropriate model
      const useAnthropic = this.shouldUseAnthropic(partner1Input, partner2Input)
      
      const drMarcieResponse = await drMarcieAI.generateResponse(
        analysisPrompt,
        { ...context, sessionType: 'fight-solver' },
        { tone: 'direct', sassLevel: 4, context: 'fight-solver' }
      )

      // Parse the AI response into structured analysis
      const analysis = await this.parseAIAnalysis(drMarcieResponse.message, inputs)

      // Generate personalized feedback for each partner
      const partner1Feedback = await this.generatePersonalizedFeedback(partner1Input, partner2Input, analysis, 'partner1')
      const partner2Feedback = await this.generatePersonalizedFeedback(partner2Input, partner1Input, analysis, 'partner2')

      const sosAnalysis: Omit<SOSAnalysis, 'id'> = {
        sessionId,
        aiProvider: useAnthropic ? 'anthropic' : 'openai',
        analysis: {
          ...analysis,
          personalizedFeedback: {
            partner1: partner1Feedback,
            partner2: partner2Feedback
          }
        },
        drMarcieResponse,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sos_analyses')
        .insert(sosAnalysis)
        .select()
        .single()

      if (error) throw error

      // Update session status to resolved
      await supabase
        .from('sos_sessions')
        .update({ 
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Store analysis conversations for each partner
      await this.storeAnalysisConversations(sessionId, data.id, inputs, partner1Feedback, partner2Feedback)

      // Assign healing challenges based on analysis
      await this.assignHealingChallenges(sessionId, analysis)

      // Notify both partners
      await this.notifyAnalysisComplete(sessionId, data.id)

      return data as SOSAnalysis
    } catch (error) {
      console.error('SOS Analysis error:', error)
      
      // Update session with error status
      await supabase
        .from('sos_sessions')
        .update({ status: 'abandoned' })
        .eq('id', sessionId)
      
      throw error
    }
  }

  private shouldUseAnthropic(input1: SOSInput, input2: SOSInput): boolean {
    // Use Anthropic for complex emotional situations
    const highEmotionalIntensity = input1.severityLevel >= 4 || input2.severityLevel >= 4
    const complexEmotions = ['angry', 'hurt'].includes(input1.emotionalState) || 
                           ['angry', 'hurt'].includes(input2.emotionalState)
    const longDescriptions = input1.perspective.length > 200 || input2.perspective.length > 200
    
    return highEmotionalIntensity || complexEmotions || longDescriptions
  }

  private buildAnalysisPrompt(input1: SOSInput, input2: SOSInput): string {
    return `You are Dr. Marcie Liss, analyzing a relationship conflict with your signature "sweet-but-savage" approach. Be direct, honest, and solution-focused.

CONFLICT ANALYSIS REQUEST:

PARTNER 1 PERSPECTIVE:
- Emotional State: ${input1.emotionalState}
- Severity Level: ${input1.severityLevel}/5
- What Triggered This: ${input1.triggerEvent}
- Their Side of the Story: ${input1.perspective}
- What They Want to Happen: ${input1.desiredOutcome}

PARTNER 2 PERSPECTIVE:
- Emotional State: ${input2.emotionalState}
- Severity Level: ${input2.severityLevel}/5
- What Triggered This: ${input2.triggerEvent}
- Their Side of the Story: ${input2.perspective}
- What They Want to Happen: ${input2.desiredOutcome}

PROVIDE A COMPREHENSIVE ANALYSIS INCLUDING:

1. ROOT CAUSE ANALYSIS: What's really going on beneath the surface?

2. FAULT ASSIGNMENT: Be specific about percentages and who bears responsibility for what. Don't be diplomatic - be honest.

3. COMMUNICATION BREAKDOWN: Where did the conversation go wrong?

4. EMOTIONAL VALIDATION: Acknowledge legitimate feelings while calling out unreasonable reactions.

5. IMMEDIATE ACTION PLAN: Who needs to apologize, what needs to be said, and in what order.

6. HEALING ROADMAP: Specific steps to prevent this from happening again.

Use your direct, no-nonsense style. Call out bad behavior, celebrate good intentions, and focus on practical solutions. Be the therapist they need, not the one they want.`
  }

  private async buildConversationContext(userId: string, sessionId: string): Promise<ConversationContext> {
    // Get user and couple data for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: couple } = await supabase
      .from('couples')
      .select('*')
      .or(`partner_1_id.eq.${userId},partner_2_id.eq.${userId}`)
      .single()

    // Get recent challenges for context
    const { data: recentChallenges } = await supabase
      .from('challenge_attempts')
      .select('challenges(title)')
      .eq('couple_id', couple?.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent fight logs for pattern analysis
    const { data: recentFights } = await supabase
      .from('fight_logs')
      .select('*')
      .eq('couple_id', couple?.id)
      .order('created_at', { ascending: false })
      .limit(3)

    return {
      userId,
      coupleId: couple?.id,
      recentChallenges: recentChallenges?.map(c => c.challenges?.title).filter(Boolean) || [],
      currentMood: 'frustrated', // Default for SOS situations
      sessionType: 'fight-solver',
      previousResponses: [],
      relationshipContext: {
        relationshipLength: couple?.created_at,
        recentConflicts: recentFights?.length || 0,
        lastSuccessfulChallenge: recentChallenges?.[0]?.challenges?.title
      }
    }
  }

  private async parseAIAnalysis(aiResponse: string, inputs: SOSInput[]): Promise<SOSAnalysis['analysis']> {
    // Enhanced parsing with pattern recognition
    const faultPattern = /(\d+)%?\s*(?:fault|responsibility|blame)/gi
    const apologyPattern = /(partner\s*[12]|both)\s*(?:should|needs?\s*to|must)\s*apologize/gi
    
    // Extract fault percentages
    let partner1Fault = 50
    let partner2Fault = 50
    
    const faultMatches = aiResponse.match(faultPattern)
    if (faultMatches && faultMatches.length >= 2) {
      const percentages = faultMatches.map(match => {
        const num = match.match(/\d+/)
        return num ? parseInt(num[0]) : 50
      })
      partner1Fault = percentages[0]
      partner2Fault = percentages[1] || (100 - partner1Fault)
    }

    // Extract action items
    const actionPattern = /(?:needs?\s*to|should|must)\s*([^.!?]+)/gi
    const actions = []
    let match
    while ((match = actionPattern.exec(aiResponse)) !== null) {
      actions.push(match[1].trim())
    }

    return {
      summary: this.extractSummary(aiResponse),
      rootCause: this.extractRootCause(aiResponse),
      faultAssignment: {
        partner1Fault,
        partner2Fault,
        explanation: this.extractFaultExplanation(aiResponse)
      },
      recommendations: {
        partner1Actions: this.extractPartnerActions(aiResponse, 'partner 1'),
        partner2Actions: this.extractPartnerActions(aiResponse, 'partner 2'),
        jointActions: this.extractJointActions(aiResponse)
      },
      apologyRequired: {
        partner1ShouldApologize: this.shouldApologize(aiResponse, 'partner 1'),
        partner2ShouldApologize: this.shouldApologize(aiResponse, 'partner 2'),
        apologyScripts: this.generateApologyScripts(aiResponse, inputs)
      },
      healingChallenges: this.extractHealingChallenges(aiResponse),
      communicationBreakdown: this.extractCommunicationIssues(aiResponse),
      emotionalValidation: this.extractEmotionalValidation(aiResponse)
    }
  }

  private extractSummary(response: string): string {
    const summaryPattern = /(?:summary|in summary|to summarize)[:\s]*([^.!?]*[.!?])/i
    const match = response.match(summaryPattern)
    return match ? match[1].trim() : response.split('.')[0] + '.'
  }

  private extractRootCause(response: string): string {
    const rootCausePattern = /(?:root cause|underlying issue|real problem)[:\s]*([^.!?]*[.!?])/i
    const match = response.match(rootCausePattern)
    return match ? match[1].trim() : 'Communication breakdown and unmet expectations'
  }

  private extractFaultExplanation(response: string): string {
    const explanationPattern = /(?:fault|responsibility|blame)[^.!?]*([^.!?]*[.!?])/i
    const match = response.match(explanationPattern)
    return match ? match[1].trim() : 'Both partners contributed to this conflict'
  }

  private extractPartnerActions(response: string, partner: string): string[] {
    const partnerPattern = new RegExp(`${partner}[^.!?]*(?:needs?\\s*to|should|must)\\s*([^.!?]+)`, 'gi')
    const matches = response.match(partnerPattern) || []
    return matches.map(match => match.replace(new RegExp(`${partner}[^:]*:?\\s*`, 'i'), '').trim()).slice(0, 3)
  }

  private extractJointActions(response: string): string[] {
    const jointPattern = /(?:both|together|jointly)[^.!?]*(?:needs?\\s*to|should|must)\\s*([^.!?]+)/gi
    const matches = response.match(jointPattern) || []
    return matches.map(match => match.replace(/^[^:]*:?\s*/, '').trim()).slice(0, 3)
  }

  private shouldApologize(response: string, partner: string): boolean {
    const apologyPattern = new RegExp(`${partner}[^.!?]*(?:should|needs?\\s*to|must)\\s*apologize`, 'i')
    return apologyPattern.test(response)
  }

  private generateApologyScripts(response: string, inputs: SOSInput[]): { partner1?: string; partner2?: string } {
    const scripts: { partner1?: string; partner2?: string } = {}
    
    // Generate contextual apology scripts based on the conflict
    if (this.shouldApologize(response, 'partner 1')) {
      scripts.partner1 = `I'm sorry for ${this.extractApologyReason(response, inputs[0])}. I understand how that made you feel ${inputs[1].emotionalState}. I will ${this.extractCommitment(response, 'partner 1')} going forward.`
    }
    
    if (this.shouldApologize(response, 'partner 2')) {
      scripts.partner2 = `I'm sorry for ${this.extractApologyReason(response, inputs[1])}. I understand how that made you feel ${inputs[0].emotionalState}. I will ${this.extractCommitment(response, 'partner 2')} going forward.`
    }
    
    return scripts
  }

  private extractApologyReason(response: string, input: SOSInput): string {
    // Extract what they should apologize for based on their trigger event
    return input.triggerEvent.toLowerCase().includes('said') ? 'what I said' : 'my actions'
  }

  private extractCommitment(response: string, partner: string): string {
    const commitmentPattern = new RegExp(`${partner}[^.!?]*(?:will|commit to|promise to)\\s*([^.!?]+)`, 'i')
    const match = response.match(commitmentPattern)
    return match ? match[1].trim() : 'work on better communication'
  }

  private extractHealingChallenges(response: string): string[] {
    const challengePattern = /(?:challenge|exercise|practice|activity)[:\s]*([^.!?]*[.!?])/gi
    const matches = response.match(challengePattern) || []
    return matches.map(match => match.replace(/^[^:]*:?\s*/, '').trim()).slice(0, 3)
  }

  private extractCommunicationIssues(response: string): string {
    const commPattern = /(?:communication|conversation)[^.!?]*([^.!?]*[.!?])/i
    const match = response.match(commPattern)
    return match ? match[1].trim() : 'Communication breakdown occurred'
  }

  private extractEmotionalValidation(response: string): string {
    const emotionPattern = /(?:feel|emotion|valid)[^.!?]*([^.!?]*[.!?])/i
    const match = response.match(emotionPattern)
    return match ? match[1].trim() : 'Both partners have valid emotional responses'
  }

  private async generatePersonalizedFeedback(
    userInput: SOSInput,
    partnerInput: SOSInput,
    analysis: any,
    role: 'partner1' | 'partner2'
  ): Promise<DrMarcieResponse> {
    const isAtFault = role === 'partner1' ? 
      analysis.faultAssignment.partner1Fault > analysis.faultAssignment.partner2Fault :
      analysis.faultAssignment.partner2Fault > analysis.faultAssignment.partner1Fault

    const faultPercentage = role === 'partner1' ? 
      analysis.faultAssignment.partner1Fault : 
      analysis.faultAssignment.partner2Fault

    const personalizedPrompt = `Give personalized feedback to ${role} based on this conflict analysis:

Their input: "${userInput.perspective}"
Their emotional state: ${userInput.emotionalState}
Their fault level: ${faultPercentage}%
Partner's perspective: "${partnerInput.perspective}"

${isAtFault ? 
  'They bear primary responsibility. Be direct about what they did wrong and what they need to do to fix it.' :
  'They are less at fault but still need guidance. Validate their feelings while giving constructive advice.'
}

Be Dr. Marcie: direct, caring, but no-nonsense. Give them specific action steps.`

    const context: ConversationContext = {
      userId: userInput.userId,
      sessionType: 'fight-solver',
      currentMood: userInput.emotionalState,
      recentChallenges: [],
      previousResponses: []
    }

    return drMarcieAI.generateResponse(personalizedPrompt, context, {
      tone: isAtFault ? 'direct' : 'supportive',
      sassLevel: isAtFault ? 4 : 2,
      context: 'fight-solver'
    })
  }

  private async generateSOSInitiationMessage(userId: string, coupleId: string): Promise<DrMarcieResponse> {
    const context: ConversationContext = {
      userId,
      coupleId,
      sessionType: 'fight-solver',
      currentMood: 'frustrated',
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `The user just activated the SOS Fight Solver. They're in conflict with their partner. Welcome them, explain the process, and get them ready to share their side of the story. Be supportive but establish that you're going to get to the truth.`

    return drMarcieAI.generateResponse(prompt, context, {
      tone: 'supportive',
      sassLevel: 2,
      context: 'fight-solver'
    })
  }

  private async generateInputAcknowledgment(inputData: Omit<SOSInput, 'id' | 'sessionId' | 'userId' | 'submittedAt'>, userId: string): Promise<DrMarcieResponse> {
    const context: ConversationContext = {
      userId,
      sessionType: 'fight-solver',
      currentMood: inputData.emotionalState,
      recentChallenges: [],
      previousResponses: []
    }

    const prompt = `Acknowledge that you've received their input about the conflict. Let them know you're waiting for their partner's perspective before providing analysis. Be reassuring but maintain your authority.`

    return drMarcieAI.generateResponse(prompt, context, {
      tone: 'supportive',
      sassLevel: 1,
      context: 'fight-solver'
    })
  }

  private async storeAnalysisConversations(
    sessionId: string,
    analysisId: string,
    inputs: SOSInput[],
    partner1Feedback: DrMarcieResponse,
    partner2Feedback: DrMarcieResponse
  ): Promise<void> {
    const { data: session } = await supabase
      .from('sos_sessions')
      .select('couple_id')
      .eq('id', sessionId)
      .single()

    if (!session) return

    // Store personalized feedback for each partner
    await supabase
      .from('dr_marcie_conversations')
      .insert([
        {
          user_id: inputs[0].userId,
          couple_id: session.couple_id,
          session_type: 'fight-solver',
          context: { sos_session_id: sessionId, analysis_id: analysisId, phase: 'analysis_complete' },
          user_message: 'REQUEST_ANALYSIS_RESULTS',
          dr_marcie_response: partner1Feedback
        },
        {
          user_id: inputs[1].userId,
          couple_id: session.couple_id,
          session_type: 'fight-solver',
          context: { sos_session_id: sessionId, analysis_id: analysisId, phase: 'analysis_complete' },
          user_message: 'REQUEST_ANALYSIS_RESULTS',
          dr_marcie_response: partner2Feedback
        }
      ])
  }

  private async assignHealingChallenges(sessionId: string, analysis: any): Promise<void> {
    const { data: session } = await supabase
      .from('sos_sessions')
      .select('couple_id')
      .eq('id', sessionId)
      .single()

    if (!session) return

    // Select appropriate healing challenges based on the conflict type
    const challengeCategories = this.determineChallengeCategories(analysis)
    
    for (const category of challengeCategories) {
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('category', category)
        .eq('difficulty_level', 1) // Start with easier challenges
        .limit(1)

      if (challenges && challenges.length > 0) {
        await supabase
          .from('challenge_attempts')
          .insert({
            couple_id: session.couple_id,
            challenge_id: challenges[0].id,
            status: 'pending'
          })
      }
    }
  }

  private determineChallengeCategories(analysis: any): string[] {
    const categories = []
    
    if (analysis.rootCause.toLowerCase().includes('communication')) {
      categories.push('communication')
    }
    
    if (analysis.rootCause.toLowerCase().includes('trust')) {
      categories.push('trust')
    }
    
    if (analysis.apologyRequired.partner1ShouldApologize || analysis.apologyRequired.partner2ShouldApologize) {
      categories.push('conflict-resolution')
    }
    
    // Default to communication if no specific category identified
    if (categories.length === 0) {
      categories.push('communication')
    }
    
    return categories.slice(0, 2) // Limit to 2 challenges
  }

  private async notifyPartner(coupleId: string, initiatorId: string, sessionId: string): Promise<void> {
    // Get partner ID
    const { data: couple } = await supabase
      .from('couples')
      .select('partner_1_id, partner_2_id')
      .eq('id', coupleId)
      .single()

    if (!couple) return

    const partnerId = couple.partner_1_id === initiatorId ? couple.partner_2_id : couple.partner_1_id

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: partnerId,
        type: 'sos',
        title: '🚨 SOS Fight Solver Activated',
        message: 'Your partner needs help resolving a conflict. Dr. Marcie is waiting for your perspective.',
        action_url: `/sos/${sessionId}`,
        is_read: false
      })
  }

  private async notifyAnalysisComplete(sessionId: string, analysisId: string): Promise<void> {
    // Get session to find couple
    const { data: session } = await supabase
      .from('sos_sessions')
      .select('couple_id')
      .eq('id', sessionId)
      .single()

    if (!session) return

    // Get both partners
    const { data: couple } = await supabase
      .from('couples')
      .select('partner_1_id, partner_2_id')
      .eq('id', session.couple_id)
      .single()

    if (!couple) return

    // Notify both partners
    const notifications = [
      {
        user_id: couple.partner_1_id,
        type: 'sos',
        title: '📋 Dr. Marcie Has Delivered Her Verdict',
        message: 'Your conflict analysis is ready. Time to face the music and start healing!',
        action_url: `/sos/${sessionId}/results`,
        is_read: false
      },
      {
        user_id: couple.partner_2_id,
        type: 'sos',
        title: '📋 Dr. Marcie Has Delivered Her Verdict',
        message: 'Your conflict analysis is ready. Time to face the music and start healing!',
        action_url: `/sos/${sessionId}/results`,
        is_read: false
      }
    ]

    await supabase
      .from('notifications')
      .insert(notifications)
  }

  // Public methods for retrieving SOS data
  async getSOSSession(sessionId: string): Promise<SOSSession | null> {
    const { data, error } = await supabase
      .from('sos_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) return null
    return data as SOSSession
  }

  async getSOSAnalysis(sessionId: string): Promise<SOSAnalysis | null> {
    const { data, error } = await supabase
      .from('sos_analyses')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) return null
    return data as SOSAnalysis
  }

  async getSOSInputs(sessionId: string): Promise<SOSInput[]> {
    const { data, error } = await supabase
      .from('sos_inputs')
      .select('*')
      .eq('session_id', sessionId)
      .order('submitted_at', { ascending: true })

    if (error) return []
    return data as SOSInput[]
  }

  async getUserSOSHistory(userId: string): Promise<SOSSession[]> {
    const { data, error } = await supabase
      .from('sos_sessions')
      .select('*')
      .or(`initiated_by.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) return []
    return data as SOSSession[]
  }

  // Emergency abort SOS session
  async abortSOSSession(sessionId: string, userId: string): Promise<void> {
    const { data: session } = await supabase
      .from('sos_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session || session.initiated_by !== userId) {
      throw new Error('Unauthorized to abort this SOS session')
    }

    await supabase
      .from('sos_sessions')
      .update({ status: 'abandoned' })
      .eq('id', sessionId)
  }

  // Check if user can initiate SOS (rate limiting)
  async canInitiateSOS(userId: string): Promise<{ canInitiate: boolean; reason?: string }> {
    // Check for recent SOS sessions (limit to 3 per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: recentSessions } = await supabase
      .from('sos_sessions')
      .select('*')
      .eq('initiated_by', userId)
      .gte('created_at', today.toISOString())

    if (recentSessions && recentSessions.length >= 3) {
      return {
        canInitiate: false,
        reason: 'You have reached the daily limit of 3 SOS sessions. Take some time to work on the feedback you\'ve already received.'
      }
    }

    return { canInitiate: true }
  }
}

export const sosService = new SOSService()