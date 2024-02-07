import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";
import { Playlist } from "src/hooks/usePlaylists";

export const PlaylistsContext = createContext<Playlist[]>([]);

const PlaylistsProvider = ({ children }: React.PropsWithChildren) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { userId } = useContext(LoginContext);
  const fb = useFirebase();

  useEffect(() => {
    if (userId && fb) {
      return fb.onSnapshot(
        fb.collection(fb.db, "playlists", userId, "playlists").withConverter({
          toFirestore(playlist: Playlist): DocumentData {
            return playlist;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Playlist {
            return snapshot.data(options) as Playlist;
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
