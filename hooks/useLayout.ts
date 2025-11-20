import { useCallback, useEffect } from 'react'
import { Layout, LayoutPreset } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const LAYOUT_KEY = 'multistream_layout'
const SELECTED_STREAMS_KEY = 'multistream_selected_streams'

const defaultLayout: Layout = {
  type: 'preset',
  preset: '2x2',
}

export function useLayout() {
  const [layout, setLayout] = useLocalStorage<Layout>(LAYOUT_KEY, defaultLayout)
  const [selectedStreams, setSelectedStreams] = useLocalStorage<string[]>(SELECTED_STREAMS_KEY, [])

  // Логируем изменения layout
  useEffect(() => {
    console.log('[useLayout] Layout changed:', layout)
  }, [layout])

  const setPresetLayout = useCallback((preset: LayoutPreset) => {
    console.log('[useLayout] setPresetLayout called with:', preset)
    const newLayout = {
      type: 'preset' as const,
      preset,
    }
    console.log('[useLayout] Calling setLayout with:', newLayout)
    setLayout(newLayout)
  }, [setLayout])


  const updateSelectedStreams = useCallback((streamIds: string[]) => {
    setSelectedStreams(streamIds)
  }, [setSelectedStreams])

  const getGridConfig = useCallback(() => {
    switch (layout.preset) {
      case '1x1':
        return { cols: 1, rows: 1 }
      case '2x2':
        return { cols: 2, rows: 2 }
      case '3x3':
        return { cols: 3, rows: 3 }
      default:
        return { cols: 2, rows: 2 }
    }
  }, [layout])

  return {
    layout,
    selectedStreams,
    setPresetLayout,
    updateSelectedStreams,
    getGridConfig,
  }
}

