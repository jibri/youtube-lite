import { API_KEY } from "src/utils/constants";
import Cookie from "js-cookie";
import { addSeconds } from "date-fns";

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

const ACCESS_TOKEN_COOKIE = "access_token";

// OAuth access token déclaré en global car les composant ne doivent pas se recharger lorsqu'il change.
// normaliement il s'agit d'un "google.accounts.oauth2.TokenResponse" mais on simplifie
export let token: { access_token: string; expires_in: string } | undefined;
let oAuthClient: google.accounts.oauth2.TokenClient;
let tokenRecievedCallback: () => void;

export const login = (force?: boolean) => {
  const accessTokenCookie = Cookie.get(ACCESS_TOKEN_COOKIE);
  if (force || !accessTokenCookie || !tokenRecievedCallback) {
    if (oAuthClient) oAuthClient.requestAccessToken();
  } else if (accessTokenCookie && tokenRecievedCallback) {
    token = {
      access_token: accessTokenCookie,
      expires_in: "",
    };
    tokenRecievedCallback();
  }
};

export const logout = (handleSuccess: () => void) => {
  if (token) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      handleSuccess();
      token = undefined;
    });
  }
};

export const initClient = (cb: () => void) => {
  tokenRecievedCallback = cb;
  // on crée le client d'accès à l'api youtube
  oAuthClient = google.accounts.oauth2.initTokenClient({
    client_id: API_KEY,
    scope: SCOPES.join(" "),
    prompt: "",
    callback: (tokenResponse) => {
      // Réception des accès aux API youtube, après client.requestAccessToken();
      token = tokenResponse;
      Cookie.set(ACCESS_TOKEN_COOKIE, token.access_token, {
        expires: addSeconds(new Date(), +token.expires_in),
      });
      tokenRecievedCallback && tokenRecievedCallback();
    },
  });
};

export const fetchUserInfos = async (
  handleUserId: (id: string) => void,
  handleError: (stauts: number, err?: string) => void
) => {
  if (token) {
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/json",
      },
    });
    const errMsg = "Impossible de récupérer les infos de l'utilisateur";
    let userInfos: { sub: string };
    try {
      userInfos = await userInfoResponse.json();
      if (userInfoResponse.ok) {
        handleUserId(userInfos.sub);
      } else {
        handleError(userInfoResponse.status, errMsg);
      }
    } catch (err) {
      handleError(userInfoResponse.status, errMsg);
    }
  }
};
