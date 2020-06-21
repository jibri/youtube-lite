import React, { createContext, useState, useEffect, useCallback } from 'react'
import { API_KEY } from 'src/utils/constants'

interface LoginData {
  loggedIn: boolean
  googleAuth?: gapi.auth2.GoogleAuth
  error?: string

  handleError: (reason: gapi.client.HttpRequestRejected) => void
}

const defaultData = {
  loggedIn: false,
  handleError: () => {/** */ },
}

const SCOPE = "https://www.googleapis.com/auth/youtube"
export const LoginContext = createContext<LoginData>(defaultData)

const LoginProvider = ({ children }: any) => {

  const [loggedIn, setLoggedIn] = useState(false)
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth>()
  const [error, setError] = useState<string>()

  useEffect(() => {

    function initClient() {
      // Retrieve the discovery document for version 3 of YouTube Data API.
      // In practice, your app can retrieve one or more discovery documents.
      var discoveryUrl = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"

      // Initialize the gapi.client object, which app uses to make API requests.
      // Get API key and client ID from API Console.
      // 'scope' field specifies space-delimited list of access scopes.
      gapi.client.init({
        clientId: API_KEY,
        discoveryDocs: [discoveryUrl],
        scope: SCOPE,
      })
        .then(function () {
          setGoogleAuth(gapi.auth2.getAuthInstance())
        })
    }

    gapi.load("client:auth2", initClient)
  }, [])

  useEffect(() => {

    function setSigninStatus() {

      if (googleAuth) {
        var user = googleAuth.currentUser.get()
        console.log("user connected", user)
        setLoggedIn(user.hasGrantedScopes(SCOPE))
      } else {
        setLoggedIn(false)
      }
    }

    // Listen for sign-in state changes.
    googleAuth?.isSignedIn.listen(setSigninStatus)
    // Handle initial sign-in state. (Determine if user is already signed in.)
    setSigninStatus()

  }, [googleAuth])

  const handleError = useCallback((reason: gapi.client.HttpRequestRejected) => {
    setError(`Error : ${reason.result.error.message}`)
    setTimeout(() => setError(undefined), 5000)
  }, [])

  const values: LoginData = {
    loggedIn,
    googleAuth,
    error,
    handleError,
  }

  return <LoginContext.Provider value={values} > {children} </LoginContext.Provider>
}
export default LoginProvider
