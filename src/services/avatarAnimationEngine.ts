import type { AvatarState, DrMarcieResponse, ConversationContext } from '@/types/drMarcie'

export interface AnimationSequence {
  id: string
  name: string
  duration: number
  keyframes: AnimationKeyframe[]
  triggers: AnimationTrigger[]
}

export interface AnimationKeyframe {
  time: number // 0-1 representing progress through animation
  expression: AvatarState['expression']
  gesture: AvatarState['gesture']
  eyeContact: boolean
  customProperties?: {
    headTilt?: number
    eyebrowRaise?: number
    mouthCurve?: number
    blinkRate?: number
  }
}

export interface AnimationTrigger {
  type: 'word' | 'phrase' | 'emotion' | 'pause' | 'emphasis'
  value: string
  animation: string
}

class AvatarAnimationEngine {
  private animationLibrary: Map<string, AnimationSequence> = new Map()
  private currentAnimation: AnimationSequence | null = null
  private animationStartTime: number = 0

  constructor() {
    this.initializeAnimations()
  }

  private initializeAnimations() {
    // Sassy response animation
    this.animationLibrary.set('sassy-response', {
      id: 'sassy-response',
      name: 'Sassy Response',
      duration: 3000,
      keyframes: [
        {
          time: 0,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 0.2,
          expression: 'sassy',
          gesture: 'none',
          eyeContact: true,
          customProperties: { eyebrowRaise: 0.8, headTilt: -5 }
        },
        {
          time: 0.5,
          expression: 'sassy',
          gesture: 'pointing',
          eyeContact: true,
          customProperties: { eyebrowRaise: 1, headTilt: -8 }
        },
        {
          time: 0.8,
          expression: 'sassy',
          gesture: 'none',
          eyeContact: true,
          customProperties: { eyebrowRaise: 0.5, headTilt: 0 }
        },
        {
          time: 1,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        }
      ],
      triggers: [
        { type: 'word', value: 'seriously', animation: 'eye-roll' },
        { type: 'word', value: 'really', animation: 'head-shake' },
        { type: 'phrase', value: 'come on', animation: 'gesture-emphasis' }
      ]
    })

    // Encouraging response animation
    this.animationLibrary.set('encouraging', {
      id: 'encouraging',
      name: 'Encouraging',
      duration: 2500,
      keyframes: [
        {
          time: 0,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 0.3,
          expression: 'encouraging',
          gesture: 'none',
          eyeContact: true,
          customProperties: { mouthCurve: 0.8 }
        },
        {
          time: 0.6,
          expression: 'encouraging',
          gesture: 'clapping',
          eyeContact: true,
          customProperties: { mouthCurve: 1 }
        },
        {
          time: 1,
          expression: 'happy',
          gesture: 'none',
          eyeContact: true
        }
      ],
      triggers: [
        { type: 'word', value: 'great', animation: 'clap' },
        { type: 'word', value: 'excellent', animation: 'nod-approval' },
        { type: 'word', value: 'progress', animation: 'thumbs-up' }
      ]
    })

    // Concerned response animation
    this.animationLibrary.set('concerned', {
      id: 'concerned',
      name: 'Concerned',
      duration: 2000,
      keyframes: [
        {
          time: 0,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 0.4,
          expression: 'concerned',
          gesture: 'thinking',
          eyeContact: true,
          customProperties: { eyebrowRaise: -0.5, headTilt: 3 }
        },
        {
          time: 0.8,
          expression: 'concerned',
          gesture: 'none',
          eyeContact: true,
          customProperties: { eyebrowRaise: -0.3 }
        },
        {
          time: 1,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        }
      ],
      triggers: [
        { type: 'emotion', value: 'worry', animation: 'furrow-brow' },
        { type: 'word', value: 'problem', animation: 'lean-forward' }
      ]
    })

    // Listening animation
    this.animationLibrary.set('listening', {
      id: 'listening',
      name: 'Active Listening',
      duration: 1000,
      keyframes: [
        {
          time: 0,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 0.5,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true,
          customProperties: { headTilt: 2, blinkRate: 0.5 }
        },
        {
          time: 1,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        }
      ],
      triggers: []
    })

    // Speaking emphasis animation
    this.animationLibrary.set('speaking-emphasis', {
      id: 'speaking-emphasis',
      name: 'Speaking with Emphasis',
      duration: 1500,
      keyframes: [
        {
          time: 0,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 0.3,
          expression: 'stern',
          gesture: 'pointing',
          eyeContact: true,
          customProperties: { headTilt: -2 }
        },
        {
          time: 0.7,
          expression: 'stern',
          gesture: 'none',
          eyeContact: true
        },
        {
          time: 1,
          expression: 'neutral',
          gesture: 'none',
          eyeContact: true
        }
      ],
      triggers: [
        { type: 'emphasis', value: '!', animation: 'gesture-point' },
        { type: 'word', value: 'important', animation: 'lean-forward' }
      ]
    })
  }

  selectAnimationForResponse(response: DrMarcieResponse, context: ConversationContext): string {
    // Analyze response content and context to select appropriate animation
    const message = response.message.toLowerCase()
    
    // Check for sassy/sarcastic content
    if (response.tone === 'sweet-savage' || 
        message.includes('seriously') || 
        message.includes('really') ||
        message.includes('come on')) {
      return 'sassy-response'
    }
    
    // Check for encouraging content
    if (response.tone === 'supportive' ||
        message.includes('great') ||
        message.includes('excellent') ||
        message.includes('good job') ||
        message.includes('progress')) {
      return 'encouraging'
    }
    
    // Check for concerned content
    if (message.includes('worried') ||
        message.includes('problem') ||
        message.includes('concern') ||
        context.currentMood === 'frustrated' ||
        context.currentMood === 'sad') {
      return 'concerned'
    }
    
    // Check for emphasis
    if (message.includes('!') || 
        message.includes('important') ||
        response.tone === 'direct') {
      return 'speaking-emphasis'
    }
    
    // Default to neutral listening
    return 'listening'
  }

  startAnimation(animationId: string): AnimationSequence | null {
    const animation = this.animationLibrary.get(animationId)
    if (!animation) return null
    
    this.currentAnimation = animation
    this.animationStartTime = Date.now()
    return animation
  }

  getCurrentAnimationState(): AvatarState | null {
    if (!this.currentAnimation) return null
    
    const elapsed = Date.now() - this.animationStartTime
    const progress = Math.min(elapsed / this.currentAnimation.duration, 1)
    
    // Find the current keyframe
    let currentKeyframe = this.currentAnimation.keyframes[0]
    let nextKeyframe = this.currentAnimation.keyframes[0]
    
    for (let i = 0; i < this.currentAnimation.keyframes.length - 1; i++) {
      if (progress >= this.currentAnimation.keyframes[i].time && 
          progress <= this.currentAnimation.keyframes[i + 1].time) {
        currentKeyframe = this.currentAnimation.keyframes[i]
        nextKeyframe = this.currentAnimation.keyframes[i + 1]
        break
      }
    }
    
    // Interpolate between keyframes
    const keyframeProgress = nextKeyframe.time > currentKeyframe.time 
      ? (progress - currentKeyframe.time) / (nextKeyframe.time - currentKeyframe.time)
      : 0
    
    // For now, return the current keyframe state
    // In a more advanced implementation, we would interpolate between keyframes
    return {
      expression: keyframeProgress > 0.5 ? nextKeyframe.expression : currentKeyframe.expression,
      gesture: keyframeProgress > 0.5 ? nextKeyframe.gesture : currentKeyframe.gesture,
      eyeContact: keyframeProgress > 0.5 ? nextKeyframe.eyeContact : currentKeyframe.eyeContact,
      isAnimating: progress < 1
    }
  }

  isAnimationComplete(): boolean {
    if (!this.currentAnimation) return true
    
    const elapsed = Date.now() - this.animationStartTime
    return elapsed >= this.currentAnimation.duration
  }

  stopAnimation() {
    this.currentAnimation = null
    this.animationStartTime = 0
  }

  // Analyze text for animation triggers
  analyzeTextForTriggers(text: string): AnimationTrigger[] {
    const triggers: AnimationTrigger[] = []
    const words = text.toLowerCase().split(/\s+/)
    
    this.animationLibrary.forEach(animation => {
      animation.triggers.forEach(trigger => {
        switch (trigger.type) {
          case 'word':
            if (words.includes(trigger.value.toLowerCase())) {
              triggers.push(trigger)
            }
            break
          case 'phrase':
            if (text.toLowerCase().includes(trigger.value.toLowerCase())) {
              triggers.push(trigger)
            }
            break
          case 'emphasis':
            if (text.includes(trigger.value)) {
              triggers.push(trigger)
            }
            break
        }
      })
    })
    
    return triggers
  }

  // Get available animations
  getAvailableAnimations(): string[] {
    return Array.from(this.animationLibrary.keys())
  }

  // Add custom animation
  addAnimation(animation: AnimationSequence) {
    this.animationLibrary.set(animation.id, animation)
  }
}

export const avatarAnimationEngine = new AvatarAnimationEngine()