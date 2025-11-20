export interface Streamer {
  id: string
  username: string
  platform: 'twitch' | 'kick' | 'goodgame' | 'vkplay'
}

export type LayoutPreset = '1x1' | '2x1' | '1+2' | '2x2' | '3x3'

export interface CustomLayout {
  cols: number
  rows: number
}

export interface Layout {
  type: 'preset' | 'custom'
  preset?: LayoutPreset
  custom?: CustomLayout
}

export interface AppData {
  streamers: Streamer[]
  layout: Layout
  selectedStreams: string[] // id стримеров для отображения в лейауте
}

