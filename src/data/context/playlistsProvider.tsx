import React, { createContext, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import useFirebaseCollection from "src/hooks/useFirebaseCollection";
import { PlaylistConfig } from "src/utils/types";

export const PlaylistsContext = createContext<PlaylistConfig[]>([]);

const PlaylistsProvider = ({ children }: React.PropsWithChildren) => {
  const { userId } = useContext(LoginContext);
  const playlists = useFirebaseCollection<PlaylistConfig>(
    userId && `playlists/${userId}/playlists`,
  );
  return <PlaylistsContext.Provider value={playlists}>{children}</PlaylistsContext.Provider>;
};
export default PlaylistsProvider;
