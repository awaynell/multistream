export interface Streamer {
  id: string;
  username: string;
  platform: "twitch" | "kick" | "goodgame" | "vkplay";
}

export type LayoutPreset = "1x1" | "2x2" | "3x3" | "3x4";

export interface Layout {
  type: "preset";
  preset: LayoutPreset;
}

export interface AppData {
  streamers: Streamer[];
  layout: Layout;
  selectedStreams: string[]; // id стримеров для отображения в лейауте
}

export type Stream = {
  id: string;
  url: string;
  title: string;
  chatUrl?: string;
};
