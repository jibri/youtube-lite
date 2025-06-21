import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  SnapshotOptions,
  UpdateData,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useFirebase } from "src/hooks/useFirebase";

export const largeScreenMq = window.matchMedia("(min-width: 600px)");

const useFirebaseDoc = <T extends { id: string } & DocumentData>(path?: string) => {
  const [document, setDocument] = useState<T>();
  const [reference, setReference] = useState<DocumentReference<T>>();
  const fb = useFirebase();

  useEffect(() => {
    if (fb && path) {
      console.log("useFirebaseDoc", path);
      const unsub = fb.onSnapshot(
        fb.doc(fb.db, path).withConverter({
          toFirestore(config: T): DocumentData {
            return config;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
            return snapshot.data(options) as T;
          },
        }),
        (snapshot) => {
          setReference(snapshot.ref);
          if (snapshot.exists()) {
            setDocument(snapshot.data());
          }
        },
      );
      return () => {
        console.log("useFirebaseDoc cleanup", path);
        unsub();
      };
    }
  }, [fb, path]);

  const updateDoc = useCallback(
    async (data: UpdateData<T>) => {
      if (fb && reference && path) {
        if ((await fb.getDoc(reference)).exists()) {
          fb.updateDoc(reference, data);
        } else {
          fb.setDoc(reference, data as T);
        }
      }
    },
    [fb, path, reference],
  );

  return [document, updateDoc] as const;
};

export default useFirebaseDoc;
