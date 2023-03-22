import { decodeJwt } from "jose";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_KEY } from "src/utils/constants";

interface LoginData {
  // id google de l'utilisateur connecté
  userId?: string;
  // OAuth access token
  token?: google.accounts.oauth2.TokenResponse;
  error?: string;
  loading: number;

  handleError: (reason: Error) => void;
  incLoading: (inc: number) => void;
  login: () => void;
  logout: () => void;
}
const defaultData: LoginData = {
  loading: 0,
  handleError: () => null,
  incLoading: () => null,
  login: () => null,
  logout: () => null,
};

const SCOPE =
  "https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly";
export const LoginContext = createContext<LoginData>(defaultData);

const LoginProvider = ({ children }: any) => {
  const [userId, setUserId] = useState<string>();
  const [token, setToken] = useState<google.accounts.oauth2.TokenResponse>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    // on crée le client d'accès à l'api youtube
    const client = google.accounts.oauth2.initTokenClient({
      client_id: API_KEY,
      scope: SCOPE,
      prompt: "",
      callback: (tokenResponse) => {
        // Réception des accès aux API youtube, après client.requestAccessToken();
        console.log("token response", tokenResponse);
        setToken(tokenResponse);
      },
    });

    // On initialise le service de compte google
    google.accounts.id.initialize({
      client_id: API_KEY,
      auto_select: true,
      callback: (credentials) => {
        // Utilisateur google connecté
        console.log("one tap done", credentials, decodeJwt(credentials.credential));
        setUserId(decodeJwt(credentials.credential).sub);
      },
    });

    // google login
    google.accounts.id.prompt();
    // youtube api authorisation
    client.requestAccessToken();
  }, []);

  const login = google.accounts.id.prompt;
  const logout = () => {
    if (userId) {
      google.accounts.id.revoke(userId, (response) => {
        if (response.successful) {
          setUserId(undefined);
          setToken(undefined);
        }
      });
    }
  };

  const handleError = useCallback((error: Error) => {
    setError(`Error : ${error.message}`);
    setTimeout(() => setError(undefined), 5000);
  }, []);

  const incLoading = useCallback((inc: number) => {
    setLoading((l) => l + inc);
  }, []);

  const values: LoginData = {
    userId,
    token,
    error,
    loading,
    handleError,
    incLoading,
    login,
    logout,
  };

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>;
};
export default LoginProvider;
