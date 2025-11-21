export interface Streamer {
  id: string;
  username: string;
  platform: "twitch" | "kick" | "goodgame" | "vkplay";
}

export enum ELayoutPreset {
  "1x1" = "1x1",
  "2x2" = "2x2",
  "3x3" = "3x3",
  "3x4" = "3x4",
}

export interface Layout {
  type: "preset";
  preset: ELayoutPreset;
}

export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "cmyk"
  | "autumn"
  | "business"
  | "acid"
  | "lemonade"
  | "night"
  | "coffee"
  | "winter"
  | "dim"
  | "nord"
  | "sunset"
  | "caramellatte"
  | "abyss"
  | "silk";

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
