import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";

export type Playlist = {
  id: string;
  autoplay: boolean;
  random: boolean;
  loop: boolean;
};

const usePlaylists = () => {
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
          console.log("snapshot");
          setPlaylists((oldPl) => {
            querySnapshot.docChanges().forEach((playlistDoc) => {
              console.log("type", playlistDoc.type);
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

  return playlists;
};
export default usePlaylists;
