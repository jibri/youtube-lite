import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import { fetchUserInfos, initClient, login, logout } from "src/init/youtubeOAuth";

interface LoginData {
  // id google de l'utilisateur connecté
  userId?: string;
  loading: number;

  incLoading: (inc: number) => void;
  signout: () => void;
}
const defaultData: LoginData = {
  loading: 0,
  incLoading: () => null,
  signout: () => null,
};

export const LoginContext = createContext<LoginData>(defaultData);

const LoginProvider = ({ children }: React.PropsWithChildren) => {
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(0);
  const handleError = useContext(ErrorUpdaterContext);

  const incLoading = useCallback((inc: number) => {
    // Petit délai sur le décrément pour permettre un chevauchement en cas d'appels chainés
    if (inc < 0) setTimeout(() => setLoading((l) => l + inc), 200);
    else setLoading((l) => l + inc);
  }, []);

  useEffect(() => {
    // on crée le client d'accès à l'api youtube
    initClient(() => fetchUserInfos(setUserId, handleError));
    // Connexion auto
    login();
  }, [handleError]);

  const signout = () => {
    logout(() => setUserId(undefined));
  };

  const values: LoginData = {
    userId,
    loading,
    incLoading,
    signout,
  };

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>;
};
export default LoginProvider;
