import { API_KEY } from "src/utils/constants";

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

// OAuth access token déclaré en global car les composant ne doivent pas se recharger lorsqu'il change.
export let token: google.accounts.oauth2.TokenResponse | undefined;
let oAuthClient: google.accounts.oauth2.TokenClient;

export const login = () => {
  if (oAuthClient) oAuthClient.requestAccessToken();
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
  // on crée le client d'accès à l'api youtube
  oAuthClient = google.accounts.oauth2.initTokenClient({
    client_id: API_KEY,
    scope: SCOPES.join(" "),
    prompt: "",
    callback: async (tokenResponse) => {
      // Réception des accès aux API youtube, après client.requestAccessToken();
      token = tokenResponse;
      cb();
    },
  });
};

export const fetchUserInfos = async (
  handleUserId: (id: string) => void,
  handleError: (err: string) => void
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
        handleError(errMsg);
      }
    } catch (err) {
      handleError(errMsg);
    }
  }
};
