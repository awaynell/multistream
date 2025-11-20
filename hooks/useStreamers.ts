import { useCallback } from 'react'
import { Streamer } from '@/types'
import { useLocalStorage } from './useLocalStorage'
import { parseTwitchInput } from '@/utils/twitch'

const STREAMERS_KEY = 'multistream_streamers'

export function useStreamers() {
  const [streamers, setStreamers] = useLocalStorage<Streamer[]>(STREAMERS_KEY, [])

  const addStreamer = useCallback((input: string) => {
    const username = parseTwitchInput(input)
    if (!username) {
      throw new Error('Invalid Twitch username or URL')
    }

    // Проверяем, не добавлен ли уже этот стример
    if (streamers.some(s => s.username === username && s.platform === 'twitch')) {
      throw new Error('Streamer already added')
    }

    const newStreamer: Streamer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      platform: 'twitch',
    }

    setStreamers(prev => [...prev, newStreamer])
    return newStreamer
  }, [streamers, setStreamers])

  const removeStreamer = useCallback((id: string) => {
    setStreamers(prev => prev.filter(s => s.id !== id))
  }, [setStreamers])

  const getStreamerById = useCallback((id: string) => {
    return streamers.find(s => s.id === id)
  }, [streamers])

  return {
    streamers,
    addStreamer,
    removeStreamer,
    getStreamerById,
  }
}

