import type { VoiceConfig, DrMarcieResponse } from '@/types/drMarcie'

class VoiceSynthesisService {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  private speechSynthesis: SpeechSynthesis
  private drMarcieVoice: VoiceConfig
  private currentAudio: HTMLAudioElement | null = null

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
    this.speechSynthesis = window.speechSynthesis
    
    // Dr. Marcie's voice configuration - warm but assertive
    this.drMarcieVoice = {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Professional female voice
      stability: 0.75,
      similarityBoost: 0.8,
      style: 0.7,
      speakingRate: 1.1,
      pitch: 1.0
    }
  }

  async synthesizeDrMarcieVoice(response: DrMarcieResponse): Promise<Blob | null> {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured, falling back to browser TTS')
      return this.fallbackTTS(response.voiceText)
    }

    try {
      const voiceSettings = this.getVoiceSettings(response.tone)
      
      const requestBody = {
        text: response.voiceText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      }

      const apiResponse = await fetch(`${this.baseUrl}/text-to-speech/${this.drMarcieVoice.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody)
      })

      if (!apiResponse.ok) {
        throw new Error(`ElevenLabs API error: ${apiResponse.status}`)
      }

      return await apiResponse.blob()
    } catch (error) {
      console.error('Voice synthesis error:', error)
      return this.fallbackTTS(response.voiceText)
    }
  }

  private getVoiceSettings(tone: DrMarcieResponse['tone']) {
    const baseSettings = {
      stability: this.drMarcieVoice.stability,
      similarity_boost: this.drMarcieVoice.similarityBoost,
      style: this.drMarcieVoice.style,
      use_speaker_boost: true
    }

    // Adjust voice settings based on Dr. Marcie's tone
    switch (tone) {
      case 'sweet-savage':
        return {
          ...baseSettings,
          stability: 0.8, // More controlled for sarcasm
          style: 0.8 // Higher style for personality
        }
      
      case 'supportive':
        return {
          ...baseSettings,
          stability: 0.9, // Very stable and warm
          style: 0.5 // Less dramatic
        }
      
      case 'direct':
        return {
          ...baseSettings,
          stability: 0.7, // Slightly less stable for emphasis
          style: 0.9 // High style for authority
        }
      
      case 'playful':
        return {
          ...baseSettings,
          stability: 0.6, // More variation for playfulness
          style: 0.7
        }
      
      default:
        return baseSettings
    }
  }

  private async fallbackTTS(text: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.speechSynthesis) {
        resolve(null)
        return
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Configure for Dr. Marcie's personality
        utterance.rate = this.drMarcieVoice.speakingRate
        utterance.pitch = this.drMarcieVoice.pitch
        utterance.volume = 0.8
        
        // Try to find a suitable voice
        const voices = this.speechSynthesis.getVoices()
        const preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          (voice as any).gender === 'female'
        ) || voices.find(voice => voice.default)
        
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        utterance.onend = () => resolve(null)
        utterance.onerror = () => resolve(null)
        
        this.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Fallback TTS error:', error)
        resolve(null)
      }
    })
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    if (!audioBlob) return

    // Stop any currently playing audio
    this.stopSpeaking()

    const audioUrl = URL.createObjectURL(audioBlob)
    this.currentAudio = new Audio(audioUrl)
    
    return new Promise((resolve, reject) => {
      if (!this.currentAudio) {
        reject(new Error('Audio creation failed'))
        return
      }

      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        this.currentAudio = null
        resolve()
      }
      
      this.currentAudio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        this.currentAudio = null
        reject(error)
      }
      
      this.currentAudio.play().catch(reject)
    })
  }

  async speakDrMarcieResponse(response: DrMarcieResponse): Promise<void> {
    try {
      const audioBlob = await this.synthesizeDrMarcieVoice(response)
      if (audioBlob) {
        await this.playAudio(audioBlob)
      } else {
        // Fallback to browser TTS
        await this.fallbackTTS(response.voiceText)
      }
    } catch (error) {
      console.error('Error playing Dr. Marcie response:', error)
      throw error
    }
  }

  // Stop any currently playing audio
  stopSpeaking(): void {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel()
    }

    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  // Check if speech synthesis is available
  isAvailable(): boolean {
    return 'speechSynthesis' in window || !!this.apiKey
  }

  // Get available voices for fallback
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis ? this.speechSynthesis.getVoices() : []
  }

  // Test voice synthesis
  async testVoice(): Promise<boolean> {
    try {
      const testResponse: DrMarcieResponse = {
        message: "Hello! I'm Dr. Marcie Liss, your AI couples therapist.",
        voiceText: "Hello! I'm Doctor Marcie Liss, your A I couples therapist.",
        tone: 'supportive',
        animations: [],
        followUpQuestions: [],
        actionItems: []
      }

      await this.speakDrMarcieResponse(testResponse)
      return true
    } catch (error) {
      console.error('Voice test failed:', error)
      return false
    }
  }
}

export const voiceSynthesis = new VoiceSynthesisService()