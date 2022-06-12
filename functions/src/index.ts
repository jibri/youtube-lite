import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// The Firebase Admin SDK to access Cloud Firestore.
import { google } from "googleapis";
import * as crypto from "crypto";

/************************************
 *  Initialization
 ************************************/

// init admin
admin.initializeApp();
// init oauth2Client
const oauth2Client = new google.auth.OAuth2(
  // using Env variable => https://firebase.google.com/docs/functions/config-env
  functions.config().oauth.clientid,
  functions.config().oauth.secret,
  functions.config().oauth.redirect
);
google.options({ auth: oauth2Client });

/************************************
 *  Functions
 ************************************/

/**
 * generate a url that asks permissions for Youtube API
 * local url : http://localhost:5000/youtube-lite-280209/us-central1/getOAuthRedirect
 */
export const getOAuthRedirect = functions
  .region("europe-west3")
  .https.onRequest((request, response) => {
    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      scope:
        "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.email",
    });
    response.redirect(url);
  });

/**
 * Called after the user authorized the app to access his youtube data.
 * local url : 'http://localhost:5000/youtube-lite-280209/us-central1/getOAuthToken'
 */
export const getOAuthToken = functions
  .region("europe-west3")
  .https.onRequest(async (request, response) => {
    // This will provide an object with the access_token and refresh_token.
    // Save these somewhere safe so they can be used at a later time.
    const code = request.query.code?.toString();
    if (code) {
      const { tokens } = await oauth2Client.getToken(code);

      // give the tokens to the oauthClient
      oauth2Client.setCredentials(tokens);

      const userInfo = await google.oauth2("v2").userinfo.get();

      // save the tokens in firestore
      if (userInfo.data.email) {
        await generateCookie(response, userInfo.data.email, tokens);

        const redirect = readCookie(request, "redirect");
        if (redirect?.redirect) response.redirect(redirect.redirect);
        else response.send("Ok");
      } else {
        response.status(400).send("No defined email for the connected user.");
      }
    } else {
      response.status(400).send("No query param 'code' found.");
    }
  });

export const test = functions.region("europe-west3").https.onRequest(async (request, response) => {
  if (await retrieveAndSetToken(request, response)) {
    const myChan = await google.youtube("v3").channels.list({
      part: ["contentDetails"],
      mine: true,
    });
    response.json(myChan);
    return;
  }
  const redirectCookie = { redirect: request.url };
  response.cookie("redirect", JSON.stringify(redirectCookie), {
    maxAge: 1000 * 60,
    httpOnly: true,
    secure: true,
  });
  response.redirect("getOAuthRedirect");
  return;
  // const userInfo = await google.oauth2('v2').userinfo.get()
  // console.log("userInfo", JSON.stringify(userInfo.data))
  // if (userInfo.data.email) {
  //   console.log("tokens", JSON.stringify(tokens))
  //   response.send('ok')
  // }
});

export const ping = functions.region("europe-west3").https.onRequest(async (request, response) => {
  response.send("Ok");
});

/************************************
 *  UTILS
 ************************************/
const setCredentials = oauth2Client.setCredentials;
type Credentials = Parameters<typeof setCredentials>[0];
type Creds = { hash: string } & Credentials;

const generateCookie = async (response: functions.Response, email: string, tokens: Credentials) => {
  const rememberme = { email, hash: crypto.randomBytes(20).toString("hex") };
  await admin
    .firestore()
    .collection("tokens")
    .doc(rememberme.email)
    .set({ ...tokens, hash: rememberme.hash });
  response.cookie("rememberme", JSON.stringify(rememberme), {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: true,
  });
};

const readCookie = (request: functions.Request, cookieName: string) => {
  const cookiesString = request.get("cookie");
  if (cookiesString) {
    const cookies = cookiesString.split("; ");
    const myCookies = cookies.reduce((acc: { [key: string]: string }, c) => {
      const [name, value] = c.split("=");
      acc[name] = value;
      return acc;
    }, {});

    if (myCookies[cookieName]) {
      const cookie = JSON.parse(decodeURIComponent(myCookies[cookieName]));
      return cookie;
    }
  }
  return null;
};

const retrieveAndSetToken = async (
  request: functions.Request,
  respone: functions.Response
): Promise<boolean> => {
  const rememberme = readCookie(request, "rememberme");
  if (rememberme && rememberme.email) {
    const tokens = (
      await admin.firestore().collection("tokens").doc(rememberme.email).get()
    ).data() as Creds;

    if (tokens?.hash && tokens?.hash === rememberme.hash && tokens.access_token) {
      // give the tokens to the oauthClient
      oauth2Client.setCredentials(tokens);
      await generateCookie(respone, rememberme.email, tokens);
      return true;
    }
  }
  return false;
};
