import { useContext } from "react";
import { PlaylistsContext } from "src/data/context/playlistsProvider";

const usePlaylists = () => {
  const playlists = useContext(PlaylistsContext);
  return playlists;
};
export default usePlaylists;
