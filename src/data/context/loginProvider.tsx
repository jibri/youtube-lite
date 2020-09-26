import React, { createContext, useState, useEffect, useCallback } from 'react'
import { defaultHeaderComponents, HeaderComponentsType } from 'src/router/path'
import { API_KEY } from 'src/utils/constants'

interface LoginData {
  loggedIn: boolean
  googleAuth?: gapi.auth2.GoogleAuth
  error?: string
  loading: number
  headerComponents: HeaderComponentsType

  handleError: (reason: gapi.client.HttpRequestRejected) => void
  incLoading: (inc: number) => void
  setHeaderComponents: React.Dispatch<React.SetStateAction<HeaderComponentsType>>
}

const defaultData = {
  loggedIn: false,
  loading: 0,
  headerComponents: defaultHeaderComponents,
  handleError: () => {/** */ },
  incLoading: () => {/** */ },
  setHeaderComponents: () => {/** */ },
}

const SCOPE = "https://www.googleapis.com/auth/youtube"
export const LoginContext = createContext<LoginData>(defaultData)

const LoginProvider = ({ children }: any) => {

  const [loggedIn, setLoggedIn] = useState(false)
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(0)
  const [totalCalls, setTotalCalls] = useState(0)
  const [headerComponents, setHeaderComponents] = useState<HeaderComponentsType>(defaultHeaderComponents)


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

  useEffect(() => console.log('totalCalls', totalCalls), [totalCalls])

  const handleError = useCallback((reason: gapi.client.HttpRequestRejected) => {
    setError(`Error : ${reason.result.error.message}`)
    setTimeout(() => setError(undefined), 5000)
  }, [])

  const incLoading = useCallback((inc: number) => {
    setLoading(l => l + inc)
    if (inc === 1) setTotalCalls(c => c + 1)
  }, [])

  const values: LoginData = {
    loggedIn,
    googleAuth,
    error,
    loading,
    headerComponents,
    handleError,
    incLoading,
    setHeaderComponents
  }

  return <LoginContext.Provider value={values}>{children}</LoginContext.Provider>
}
export default LoginProvider
