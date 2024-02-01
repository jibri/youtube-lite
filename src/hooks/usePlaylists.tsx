import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";

export type Playlist = {
  id: string;
};

const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<string[]>([]);
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
                oldPl = oldPl.concat(playlistDoc.doc.data().id);
              }
              if (playlistDoc.type === "removed") {
                oldPl = oldPl.filter((pl) => pl !== playlistDoc.doc.data().id);
              }
            });
            return oldPl;
          });
        },
      );
    }
  }, [userId, fb]);

  return playlists;
};
export default usePlaylists;
