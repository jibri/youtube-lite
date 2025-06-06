import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirebase } from "src/hooks/useFirebase";

export const largeScreenMq = window.matchMedia("(min-width: 600px)");

const useFirebaseCollection = <T extends { id: string } & DocumentData>(path?: string) => {
  const [collection, setCollection] = useState<T[]>([]);
  const fb = useFirebase();

  useEffect(() => {
    if (fb && path) {
      console.log("useFirebaseCollection", path);
      return fb.onSnapshot(
        fb.collection(fb.db, path).withConverter({
          toFirestore(item: T): DocumentData {
            return item;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
            return snapshot.data(options) as T;
          },
        }),
        (querySnapshot) => {
          setCollection((oldCollection) => {
            querySnapshot.docChanges().forEach((document) => {
              if (document.type === "added") {
                oldCollection = oldCollection.concat(document.doc.data());
              }
              if (document.type === "removed") {
                oldCollection = oldCollection.filter((item) => item.id !== document.doc.data().id);
              }
              if (document.type === "modified") {
                oldCollection = oldCollection
                  .filter((item) => item.id !== document.doc.data().id)
                  .concat(document.doc.data());
              }
            });
            return oldCollection;
          });
        },
      );
    }
  }, [fb, path]);

  return collection;
};
export default useFirebaseCollection;
