import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rachel — clear, neutral American English voice
// Sarah — official ElevenLabs premade voice, available on free plan
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text } = await request.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 4096),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('[POST /api/tts]', err)
      return NextResponse.json({ error: 'TTS service failed' }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[POST /api/tts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}