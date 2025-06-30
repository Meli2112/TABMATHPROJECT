import type { VoiceConfig } from '@/types/app'

class VoiceService {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
  }

  async synthesizeSpeech(text: string, voiceConfig: VoiceConfig): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceConfig.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: voiceConfig.stability,
          similarity_boost: voiceConfig.similarityBoost,
          style: voiceConfig.style,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to synthesize speech')
    }

    return response.blob()
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      audio.onerror = reject
      audio.play()
    })
  }

  // Dr. Marcie Liss voice configuration
  getDrMarcieVoiceConfig(): VoiceConfig {
    return {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Example voice ID
      stability: 0.75,
      similarityBoost: 0.8,
      style: 0.6,
    }
  }
}

export const voiceService = new VoiceService()