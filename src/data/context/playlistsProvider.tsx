import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";

export type PlaylistConfig = {
  id: string;
  autoplay: boolean;
  random: boolean;
  loop: boolean;
};

export const PlaylistsContext = createContext<PlaylistConfig[]>([]);

const PlaylistsProvider = ({ children }: React.PropsWithChildren) => {
  const [playlists, setPlaylists] = useState<PlaylistConfig[]>([]);
  const { userId } = useContext(LoginContext);
  const fb = useFirebase();

  useEffect(() => {
    if (userId && fb) {
      return fb.onSnapshot(
        fb.collection(fb.db, "playlists", userId, "playlists").withConverter({
          toFirestore(playlist: PlaylistConfig): DocumentData {
            return playlist;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): PlaylistConfig {
            return snapshot.data(options) as PlaylistConfig;
          },
        }),
        (querySnapshot) => {
          setPlaylists((oldPl) => {
            querySnapshot.docChanges().forEach((playlistDoc) => {
              if (playlistDoc.type === "added") {
                oldPl = oldPl.concat(playlistDoc.doc.data());
              }
              if (playlistDoc.type === "removed") {
                oldPl = oldPl.filter((pl) => pl.id !== playlistDoc.doc.data().id);
              }
              if (playlistDoc.type === "modified") {
                oldPl = oldPl
                  .filter((pl) => pl.id !== playlistDoc.doc.data().id)
                  .concat(playlistDoc.doc.data());
              }
            });
            return oldPl;
          });
        },
      );
    }
  }, [userId, fb]);

  return <PlaylistsContext.Provider value={playlists}>{children}</PlaylistsContext.Provider>;
};
export default PlaylistsProvider;
