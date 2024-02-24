export interface VideoItem {
  playlistItem: youtube.PlaylistItem;
  video: youtube.Video;
}

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
