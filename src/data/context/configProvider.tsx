import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { createContext, useState, useEffect, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";

export interface ConfigData {
  /** Durée mini en seconde des videos à remonter dans le feed (permet d'eviter les #short) */
  minDuration: number;
  /** Age max en jour des video à remonter dans le feed */
  maxAge: number;
  /** id de la playlist que l'on souhaite afficher, et remplir à partir de feed */
  playlistId: string;
  /** si l'app doit tenter de se re-authentifier après une 401 */
  autoAuth: boolean;
  /** si les video sont swipeable */
  useSwipe: boolean;
  /** si le player doit lire un video aléatoire de la liste après celle ci */
  autoPlayNextRandom: boolean;
  /** le dernier theme selectionné */
  theme: "light" | "dark";
}

const defaultData: ConfigData = {
  minDuration: 0,
  maxAge: 10,
  playlistId: "",
  autoAuth: false,
  useSwipe: false,
  autoPlayNextRandom: false,
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
};

export const ConfigContext = createContext<ConfigData>(defaultData);

const ConfigProvider = ({ children }: React.PropsWithChildren) => {
  const [config, setConfig] = useState<ConfigData>(defaultData);
  const { userId } = useContext(LoginContext);
  const fb = useFirebase();

  useEffect(() => {
    if (userId && fb) {
      return fb.onSnapshot(
        fb.doc(fb.db, "configuration", userId).withConverter({
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
            fb.setDoc(fb.doc(fb.db, "configuration", userId), defaultData);
          }
        },
      );
    }
  }, [userId, fb]);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
export default ConfigProvider;
