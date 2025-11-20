export interface Streamer {
  id: string;
  username: string;
  platform: "twitch" | "kick" | "goodgame" | "vkplay";
}

export type LayoutPreset = "1x1" | "2x2" | "3x3";

export interface Layout {
  type: "preset";
  preset: LayoutPreset;
}

export interface AppData {
  streamers: Streamer[];
  layout: Layout;
  selectedStreams: string[]; // id стримеров для отображения в лейауте
}
