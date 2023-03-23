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
  incLoading: (inc: number) => void;
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
  incLoading: () => null,
  login: () => null,
  logout: () => null,
  callYoutube: () => new Promise((r) => null),
};

const SCOPE =
  "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
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
    setLoading((l) => l + inc);
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
          console.log(errMsg, userInfos);
          handleError(errMsg);
        }
      } catch (e) {
        console.log(errMsg, userInfos);
        handleError(errMsg);
      }
    },
    [handleError]
  );

  const initClient = useCallback(() => {
    // on crée le client d'accès à l'api youtube
    oAuthClient.current = google.accounts.oauth2.initTokenClient({
      client_id: API_KEY,
      scope: SCOPE,
      prompt: "",
      callback: async (tokenResponse) => {
        // Réception des accès aux API youtube, après client.requestAccessToken();
        console.log("token response", tokenResponse);
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
      const response = await service(...args);
      // Unauthorize => try to get another accessToken
      if (response.status >= 400 && response.status < 500) login();

      // Ok => return data
      // autre erreurs => return data
      return response;
    },
    [login]
  );

  const values: LoginData = {
    userId,
    token,
    error,
    loading,
    handleError,
    incLoading,
    login,
    logout,
    callYoutube,
  };

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>;
};
export default LoginProvider;
