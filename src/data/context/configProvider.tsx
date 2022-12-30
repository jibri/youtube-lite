import {
  doc,
  DocumentData,
  onSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  SnapshotOptions,
} from "firebase/firestore";
import React, { createContext, useState, useEffect, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { db } from "src/init/firestore";

interface ConfigData {
  /** Durée mini en seconde des videos à remonter dans le feed (permet d'eviter les #short) */
  minDuration: number;
  /** Age max en jour des video à remonter dans le feed */
  maxAge: number;
  /** id de la playlist que l'on souhaite afficher, et remplir à partir de feed */
  playlistId: string;
}

const defaultData: ConfigData = {
  minDuration: 0,
  maxAge: 0,
  playlistId: "",
};

export const ConfigContext = createContext<ConfigData>(defaultData);

const ConfigProvider = ({ children }: any) => {
  const [config, setConfig] = useState<ConfigData>(defaultData);
  const { googleAuth } = useContext(LoginContext);
  const userId = googleAuth?.currentUser.get().getId();

  useEffect(() => {
    if (userId) {
      return onSnapshot(
        doc(db, "configuration", userId).withConverter({
          toFirestore(config: ConfigData): DocumentData {
            return config;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ConfigData {
            return snapshot.data(options) as ConfigData;
          },
        }),
        (snapshot) => {
          if (snapshot.exists()) setConfig(snapshot.data());
          else {
            // Creation du doc s'il n'exist pas (permiere connexion)
            setDoc(doc(db, "configuration", userId), defaultData);
          }
        }
      );
    }
  }, [userId]);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
export default ConfigProvider;
