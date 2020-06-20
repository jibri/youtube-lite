import React, { useContext, useState, useEffect } from 'react'
import { LoginContext } from 'src/data/context/loginProvider'


let GoogleAuth: gapi.auth2.GoogleAuth

function Login() {
  const [playlists, setPlaylists] = useState<gapi.client.youtube.Playlist[]>([])
  const { loggedIn, googleAuth, handleError } = useContext(LoginContext)

  useEffect(() => {
    const loadPlaylists = (pageToken?: string) => {
      const request = gapi.client.youtube.playlists.list({
        part: "snippet,contentDetails",
        mine: true,
        pageToken,
      })
      request.execute((response) => {
        if (handleError(response)) return

        if (response.items?.length) {
          if (pageToken) {
            setPlaylists(pl => pl.concat(response.items || []))
          } else {
            console.log(response.items)
            setPlaylists(response.items)
          }
        }
        if (response?.nextPageToken) {
          loadPlaylists(response.nextPageToken)
        }
      })
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
