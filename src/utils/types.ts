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
};

export type PlaylistYtbLite = {
  playlist: youtube.Playlist;
  config: PlaylistConfig;
};
