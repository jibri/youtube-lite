import React, { useContext, useState, useEffect } from 'react'
import { LoginContext } from 'src/data/context/loginProvider'


let GoogleAuth: gapi.auth2.GoogleAuth

function Login() {
  const [playlists, setPlaylists] = useState<gapi.client.youtube.Playlist[]>([])
  const { loggedIn, googleAuth, handleError } = useContext(LoginContext)

  useEffect(() => {
    const loadPlaylists = (pageToken?: string) => {
      gapi.client.youtube.playlists.list({
        part: "snippet,contentDetails",
        mine: true,
        pageToken,
      }).then(response => {
        const result = response.result
        if (result.items?.length) {
          if (pageToken) {
            setPlaylists(pl => pl.concat(result.items || []))
          } else {
            setPlaylists(result.items)
          }
        }
        if (result.nextPageToken) {
          loadPlaylists(result.nextPageToken)
        }
      }, handleError)
    }
    if (loggedIn) loadPlaylists()
  }, [loggedIn, handleError])

  function handleAuthClick() {
    if (googleAuth?.isSignedIn.get()) {
      // User is authorized and has clicked "Sign out" button.
      googleAuth?.signOut()
    } else {
      // User is not signed in. Start Google auth flow.
      googleAuth?.signIn()
    }
  }

  function revokeAccess() {
    googleAuth?.disconnect()
  }

  return (
    <div>
      {!googleAuth
        ? 'Waiting for auth initialization...'
        : (
          <>
            <div>
              {loggedIn
                ? "You are currently signed in and have granted access to this app."
                : "You have not authorized this app or you are signed out."}
            </div>
            <button onClick={handleAuthClick}>
              {loggedIn ? "Sign out" : "Sign In/Authorize"}
            </button>
            {loggedIn && <button onClick={revokeAccess}>Revoke access</button>}
            <div>
              My playlists :
              <ul>
                {playlists.map(pl => <li key={pl.id}>{pl.id} : {pl.snippet?.title}</li>)}
              </ul>
            </div>
          </>
        )}
    </div>
  )
}

export default Login
