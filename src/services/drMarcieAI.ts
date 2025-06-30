import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import type { 
  DrMarcieResponse, 
  DrMarciePersonality, 
  ConversationContext,
  AvatarState 
} from '@/types/drMarcie'

class DrMarcieAI {
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private personality: DrMarciePersonality

  constructor() {
    // Initialize AI clients if API keys are available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      })
    }
    
    if (anthropicKey) {
      this.anthropic = new Anthropic({
        apiKey: anthropicKey,
        dangerouslyAllowBrowser: true
      })
    }

    this.personality = {
      tone: 'sweet-savage',
      sassLevel: 3,
      context: 'general'
    }
  }

  async generateResponse(
    prompt: string, 
    context: ConversationContext,
    personality?: Partial<DrMarciePersonality>
  ): Promise<DrMarcieResponse> {
    const currentPersonality = { ...this.personality, ...personality }
    
    const systemPrompt = this.buildSystemPrompt(currentPersonality, context)
    
    try {
      // Use Anthropic for complex analysis, OpenAI for general interactions
      const useAnthropic = context.sessionType === 'fight-solver' || 
                          context.currentMood === 'angry' ||
                          context.currentMood === 'frustrated'

      let response: string

      if (useAnthropic && this.anthropic) {
        response = await this.generateAnthropicResponse(systemPrompt, prompt)
      } else if (this.openai) {
        response = await this.generateOpenAIResponse(systemPrompt, prompt)
      } else {
        // Fallback to mock response if no API keys
        response = this.generateMockResponse(prompt, currentPersonality)
      }

      return this.parseResponse(response, currentPersonality)
    } catch (error) {
      console.error('Dr. Marcie AI Error:', error)
      return this.getFallbackResponse(currentPersonality)
    }
  }

  private async generateOpenAIResponse(systemPrompt: string, prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.8
    })

    return completion.choices[0]?.message?.content || ''
  }

  private async generateAnthropicResponse(systemPrompt: string, prompt: string): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic not initialized')

    const message = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nUser input: ${prompt}` }
      ]
    })

    return message.content[0].type === 'text' ? message.content[0].text : ''
  }

  private generateMockResponse(prompt: string, personality: DrMarciePersonality): string {
    const mockResponses = {
      'sweet-savage': [
        "Oh honey, we need to talk about this. And by 'talk,' I mean I'm going to tell you exactly what's going on here.",
        "Listen sweetie, I've seen this pattern before, and it's not cute. Let's fix this before it gets worse.",
        "Okay, let's be real for a second. This isn't working, and we both know it. Time for some tough love."
      ],
      'supportive': [
        "I can see you're really trying, and that means everything. Let's work through this together.",
        "You're taking the right steps by being here. That shows real commitment to your relationship.",
        "This is challenging, but you have the strength to work through it. I believe in you both."
      ],
      'direct': [
        "Here's what needs to happen: you need to stop making excuses and start making changes.",
        "I'm going to be straight with you because that's what you need right now.",
        "No more dancing around the issue. Let's address this head-on."
      ],
      'playful': [
        "Alright lovebirds, time for some relationship homework! Don't worry, it's the fun kind.",
        "Let's shake things up a bit! I have just the challenge for you two.",
        "Ready to have some fun while fixing your relationship? That's my specialty!"
      ]
    }

    const responses = mockResponses[personality.tone] || mockResponses['supportive']
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private buildSystemPrompt(personality: DrMarciePersonality, context: ConversationContext): string {
    const basePersonality = `You are Dr. Marcie Liss, a couples therapist with a unique "sweet-but-savage" approach. You're caring and supportive but also direct, witty, and sometimes sarcastic when needed. You don't sugarcoat things - you tell couples what they need to hear, not what they want to hear.

Your personality traits:
- Warm but no-nonsense
- Playfully sarcastic when appropriate  
- Encouraging but realistic
- Sometimes blunt about uncomfortable truths
- Always ultimately supportive of the relationship
- Uses humor to defuse tension
- Calls out bad behavior directly
- Celebrates progress genuinely

Current sass level: ${personality.sassLevel}/5
Current context: ${personality.context}
Session type: ${context.sessionType}
User's current mood: ${context.currentMood}`

    const contextualGuidance = this.getContextualGuidance(context)
    
    return `${basePersonality}\n\n${contextualGuidance}\n\nRespond in character as Dr. Marcie Liss. Keep responses conversational, under 150 words, and include specific actionable advice when appropriate. Match your tone to the sass level and context.`
  }

  private getContextualGuidance(context: ConversationContext): string {
    switch (context.sessionType) {
      case 'fight-solver':
        return `You're helping resolve a conflict. Be direct about who's at fault, what needs to happen, and don't let anyone off the hook. Use tough love when necessary. Analyze both perspectives and give clear action steps.`
      
      case 'challenge':
        return `You're guiding a therapy game/challenge. Be encouraging but keep them accountable. Add some playful competition and light teasing. Make it fun but meaningful.`
      
      case 'consequence':
        return `You're delivering consequences for missed tasks. Be firm but fair. Explain why this matters for their relationship growth. Use your sweet-but-savage tone to motivate them.`
      
      default:
        return `You're having a general check-in. Be supportive but probe deeper when you sense they're not being fully honest. Ask follow-up questions and provide insights.`
    }
  }

  private parseResponse(response: string, personality: DrMarciePersonality): DrMarcieResponse {
    // Extract action items and follow-up questions from the response
    const actionItems = this.extractActionItems(response)
    const followUpQuestions = this.extractFollowUpQuestions(response)
    
    return {
      message: response,
      voiceText: this.adaptForVoice(response),
      tone: personality.tone,
      animations: this.suggestAnimations(response, personality),
      followUpQuestions,
      actionItems
    }
  }

  private extractActionItems(response: string): string[] {
    const actionPatterns = [
      /(?:try|do|practice|work on|focus on|start|begin)\s+([^.!?]+)/gi,
      /(?:you should|you need to|i want you to)\s+([^.!?]+)/gi
    ]
    
    const actions: string[] = []
    actionPatterns.forEach(pattern => {
      const matches = response.match(pattern)
      if (matches) {
        actions.push(...matches.map(match => match.trim()))
      }
    })
    
    return actions.slice(0, 3) // Limit to 3 action items
  }

  private extractFollowUpQuestions(response: string): string[] {
    const questionPattern = /[^.!?]*\?/g
    const questions = response.match(questionPattern) || []
    return questions.map(q => q.trim()).slice(0, 2)
  }

  private adaptForVoice(text: string): string {
    // Adapt text for better voice synthesis
    return text
      .replace(/\b(Dr\.)\b/g, 'Doctor')
      .replace(/\b(vs\.)\b/g, 'versus')
      .replace(/\b(etc\.)\b/g, 'etcetera')
      .replace(/\b(i\.e\.)\b/g, 'that is')
      .replace(/\b(e\.g\.)\b/g, 'for example')
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Add pauses between sentences
  }

  private suggestAnimations(response: string, personality: DrMarciePersonality): string[] {
    const animations: string[] = []
    
    // Analyze response content for appropriate animations
    if (response.includes('!') || personality.sassLevel >= 4) {
      animations.push('emphatic-gesture')
    }
    
    if (response.includes('?')) {
      animations.push('questioning-tilt')
    }
    
    if (response.toLowerCase().includes('good') || response.toLowerCase().includes('great')) {
      animations.push('approving-nod')
    }
    
    if (response.toLowerCase().includes('no') || response.toLowerCase().includes('wrong')) {
      animations.push('head-shake')
    }
    
    return animations
  }

  private getFallbackResponse(personality: DrMarciePersonality): DrMarcieResponse {
    const fallbacks = [
      "Hmm, seems like I'm having a moment here. But let's keep going - relationships don't pause for technical difficulties!",
      "Well, that's awkward. Even therapists have off days. What were we talking about?",
      "Oops! Looks like my brain took a little vacation. Where were we in fixing your relationship?"
    ]
    
    const message = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    
    return {
      message,
      voiceText: this.adaptForVoice(message),
      tone: personality.tone,
      animations: ['shrugging'],
      followUpQuestions: ["What would you like to talk about?"],
      actionItems: []
    }
  }

  getAvatarState(response: DrMarcieResponse, context: ConversationContext): AvatarState {
    let expression: AvatarState['expression'] = 'neutral'
    let gesture: AvatarState['gesture'] = 'none'
    
    // Determine expression based on response tone and content
    if (response.tone === 'sweet-savage' && response.message.includes('!')) {
      expression = 'sassy'
      gesture = 'pointing'
    } else if (response.followUpQuestions && response.followUpQuestions.length > 0) {
      expression = 'concerned'
      gesture = 'thinking'
    } else if (response.actionItems && response.actionItems.length > 0) {
      expression = 'encouraging'
      gesture = 'clapping'
    } else if (context.currentMood === 'happy') {
      expression = 'happy'
      gesture = 'none'
    }
    
    return {
      expression,
      gesture,
      eyeContact: true,
      isAnimating: response.animations ? response.animations.length > 0 : false
    }
  }

  // Test if AI services are available
  isAvailable(): boolean {
    return !!(this.openai || this.anthropic)
  }

  // Get available AI providers
  getAvailableProviders(): string[] {
    const providers: string[] = []
    if (this.openai) providers.push('OpenAI')
    if (this.anthropic) providers.push('Anthropic')
    return providers
  }
}

export const drMarcieAI = new DrMarcieAI()