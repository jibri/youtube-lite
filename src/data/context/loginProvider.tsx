import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { API_KEY } from "src/utils/constants";
import { ResponseYoutube } from "src/utils/youtubeApi";

interface LoginData {
  // id google de l'utilisateur connecté
  userId?: string;
  // OAuth access token
  token?: google.accounts.oauth2.TokenResponse;
  error?: string;
  loading: number;

  handleError: (error?: string) => void;
  login: () => void;
  logout: (revokeToken: google.accounts.oauth2.TokenResponse) => void;
  callYoutube: <T extends unknown[], D>(
    service: (...args: T) => Promise<ResponseYoutube<D>>,
    ...args: T
  ) => Promise<ResponseYoutube<D>>;
}
const defaultData: LoginData = {
  loading: 0,
  handleError: () => null,
  login: () => null,
  logout: () => null,
  callYoutube: () => new Promise((r) => null),
};

const SCOPES = [
  // Accès en écriture à son compte youtube (like, supprimer les videos des playlists)
  "https://www.googleapis.com/auth/youtube.force-ssl",
  // Accès en lecture à son compte youtube (afficher les playlists et leur contenu, accéder aux abonnements)
  "https://www.googleapis.com/auth/youtube.readonly",
  // Accès aux info du user (no, prénom, id google ...)
  "https://www.googleapis.com/auth/userinfo.profile",
  // Accès au mail du user
  "https://www.googleapis.com/auth/userinfo.email",
];
export const LoginContext = createContext<LoginData>(defaultData);

const LoginProvider = ({ children }: any) => {
  const [userId, setUserId] = useState<string>();
  const [token, setToken] = useState<google.accounts.oauth2.TokenResponse>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(0);
  const oAuthClient = useRef<google.accounts.oauth2.TokenClient>();

  const login = useCallback(() => {
    if (oAuthClient.current) oAuthClient.current.requestAccessToken();
  }, []);

  const logout = useCallback((revokeToken: google.accounts.oauth2.TokenResponse) => {
    google.accounts.oauth2.revoke(revokeToken.access_token, () => {
      setUserId(undefined);
      setToken(undefined);
    });
  }, []);

  const handleError = useCallback((error?: string) => {
    setError(`Error : ${error || "erreur inconnue"}`);
    setTimeout(() => setError(undefined), 5000);
  }, []);

  const incLoading = useCallback((inc: number) => {
    // Petit délai sur le décrément pour permettre un chevauchement en cas d'appels chainés
    if (inc < 0) setTimeout(() => setLoading((l) => l + inc), 200);
    else setLoading((l) => l + inc);
  }, []);

  const fetchUserInfos = useCallback(
    async (token: google.accounts.oauth2.TokenResponse) => {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json",
        },
      });
      const errMsg = "Impossible de récupérer les infos de l'utilisateur";
      let userInfos;
      try {
        userInfos = await userInfoResponse.json();
        if (userInfoResponse.ok) {
          setUserId((userInfos as { sub: string }).sub);
        } else {
          handleError(errMsg);
        }
      } catch (e) {
        handleError(errMsg);
      }
    },
    [handleError]
  );

  const initClient = useCallback(() => {
    // on crée le client d'accès à l'api youtube
    oAuthClient.current = google.accounts.oauth2.initTokenClient({
      client_id: API_KEY,
      scope: SCOPES.join(" "),
      prompt: "",
      callback: async (tokenResponse) => {
        // Réception des accès aux API youtube, après client.requestAccessToken();
        setToken(tokenResponse);
        await fetchUserInfos(tokenResponse);
      },
    });
  }, [fetchUserInfos]);

  useEffect(() => {
    // on crée le client d'accès à l'api youtube
    initClient();
    // Connexion auto
    login();
  }, [initClient, login]);

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
      if (response.status >= 400 && response.status < 500) login();

      // Ok => return data
      // autre erreurs => return data
      return response;
    },
    [login, incLoading]
  );

  const values: LoginData = {
    userId,
    token,
    error,
    loading,
    handleError,
    login,
    logout,
    callYoutube,
  };

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>;
};
export default LoginProvider;
