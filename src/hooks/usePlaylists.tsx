import { useContext } from "react";
import { PlaylistsContext } from "src/data/context/playlistsProvider";

export type Playlist = {
  id: string;
  autoplay: boolean;
  random: boolean;
  loop: boolean;
};

const usePlaylists = () => {
  const playlists = useContext(PlaylistsContext);
  return playlists;
};
export default usePlaylists;
