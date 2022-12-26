import {
  doc,
  DocumentData,
  onSnapshot,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import React, { createContext, useState, useEffect } from "react";
import { db } from "src/init/firestore";

interface ConfigData {
  /** Durée mini en seconde des videos à remonter dans le feed (permet d'eviter les #short) */
  minDuration: number;
  /** Age max en jour des video à remonter dans le feed */
  maxAge: number;
}

const defaultData = {
  minDuration: 0,
  maxAge: 0,
};

export const ConfigContext = createContext<ConfigData>(defaultData);

const ConfigProvider = ({ children }: any) => {
  const [config, setConfig] = useState<ConfigData>(defaultData);

  useEffect(() => {
    return onSnapshot(
      doc(db, "configuration", "local").withConverter({
        toFirestore(config: ConfigData): DocumentData {
          return config;
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ConfigData {
          return snapshot.data(options) as ConfigData;
        },
      }),
      (snapshot) => {
        if (snapshot.exists()) setConfig(snapshot.data());
      }
    );
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
export default ConfigProvider;
