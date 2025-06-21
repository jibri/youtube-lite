export interface VideoItem {
  playlistItem: youtube.PlaylistItem;
  video: youtube.Video;
  stats?: VideoStats;
}
export type VideoStats = { timer: number };

export type PlaylistConfig = {
  id: string;
  autoplay: boolean;
  random: boolean;
  loop: boolean;
  mine: boolean;
  artists?: string[];
};

export type PlaylistYtbLite = {
  playlist: youtube.Playlist;
  config: PlaylistConfig;
};

export type VideoStatus = {
  /** Video Id */
  id: string;
  /** Là où on est rendu en sec */
  timer: number;
};
