import React, { createContext, useState, useEffect, useCallback, useReducer, Reducer } from "react";
import { fetchUserInfos, initClient, login, logout } from "src/init/youtubeOAuth";
import { ResponseYoutube } from "src/utils/youtubeApi";

interface LoginData {
  // id google de l'utilisateur connecté
  userId?: string;
  error?: string;
  loading: number;

  signout: () => void;
  handleError: (error?: string) => void;
  callYoutube: <T extends unknown[], D>(
    service: (...args: T) => Promise<ResponseYoutube<D>>,
    ...args: T
  ) => Promise<ResponseYoutube<D>>;
}
const defaultData: LoginData = {
  loading: 0,
  signout: () => null,
  handleError: () => null,
  callYoutube: () => new Promise((r) => null),
};

export const LoginContext = createContext<LoginData>(defaultData);

const LoginProvider = ({ children }: any) => {
  const [userId, setUserId] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(0);

  const handleError = useCallback((error?: string) => {
    setError(`Error : ${error || "erreur inconnue"}`);
    setTimeout(() => setError(undefined), 5000);
  }, []);

  const incLoading = useCallback((inc: number) => {
    // Petit délai sur le décrément pour permettre un chevauchement en cas d'appels chainés
    if (inc < 0) setTimeout(() => setLoading((l) => l + inc), 200);
    else setLoading((l) => l + inc);
  }, []);

  useEffect(() => {
    // on crée le client d'accès à l'api youtube
    initClient(() => {
      fetchUserInfos(setUserId, handleError);
    });
    // Connexion auto
    login();
  }, [handleError]);

  /** Appel le service youtube donné, et tente de récupérer un access_token en cas d'erreur 4** */
  const callYoutube = useCallback(
    async <T extends unknown[], D>(
      service: (...args: T) => Promise<ResponseYoutube<D>>,
      ...args: T
    ) => {
      incLoading(1);
      const response = await service(...args);
      incLoading(-1);
      // Unauthorize => try to get another accessToken
      if (response.status === 401) login();

      // Ok => return data
      // autre erreurs => return data
      return response;
    },
    [incLoading]
  );

  const signout = () => {
    logout(() => setUserId(undefined));
  };

  const values: LoginData = {
    userId,
    error,
    loading,
    signout,
    handleError,
    callYoutube,
  };

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>;
};
export default LoginProvider;

type UiState = {
  userId?: string;
  error?: string;
  loading: number;
};

const uiReducer: Reducer<UiState, { type: string; payload: unknown }> = (uiState, action) => {
  switch (action.type) {
    case "signout":
      return {
        ...uiState,
        userId: undefined,
      };
    case "error":
      return {
        ...uiState,
        error: (action.payload as string) || "erreur inconnue",
      };
  }
  return uiState;
};
