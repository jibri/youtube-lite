import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoContext } from 'src/data/context/videoProvider'
import { Link } from 'react-router-dom'
import { PATHS } from 'src/router/path'
import { ActionButton, Text } from 'src/utils/styled'
import { useMyTheme } from 'src/data/context/ThemeProvider'

const YoutubeButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin: 1em;
  padding: 1em;
  background-color: ${props => props.theme.primary};
  max-width: 300px;
  
  text-decoration: none;
  color: inherit;
  
  span {
    font-weight: bold;
  }
`

const PlaylistItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0.5em;
`
const PlaylistItem = styled(Link)`
  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin-left: 0.5em;
  padding: 0.5em;
  background-color: ${props => props.theme.primary};

  text-decoration: none;
  color: inherit;
`

function Login() {
  const [playlists, setPlaylists] = useState<gapi.client.youtube.Playlist[]>([])
  const { loggedIn, googleAuth, handleError, incLoading } = useContext(LoginContext)
  const { setPlaylistId } = useContext(VideoContext)
  const { dark, light } = useMyTheme()

  useEffect(() => {
    const loadPlaylists = (pageToken?: string) => {
      incLoading(1)
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
        .then(() => incLoading(-1))
    }
    if (loggedIn) loadPlaylists()
  }, [loggedIn, handleError, incLoading])

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

  const updatePlaylist = (playlistId?: string) => {
    if (playlistId) setPlaylistId(playlistId)
  }

  return (
    <div>
      {!googleAuth
        ? <Text>Waiting for auth initialization...</Text>
        : (
          <>
            <div>
              {loggedIn
                ? <Text>You are currently signed in and have granted access to this app.</Text>
                : <Text>You have not authorized this app or you are signed out.</Text>}
            </div>
            <button onClick={handleAuthClick}>
              {loggedIn ? "Sign out" : "Sign In/Authorize"}
            </button>
            {loggedIn && <button onClick={revokeAccess}>Revoke access</button>}
            <YoutubeButton href="http://youtube.com" target="_blank" rel="noopener">
              <img src={`${process.env.PUBLIC_URL}/logo192.png`} width="100px" alt="Logo Youtube-lite" />
              <Text>Go to Youtube</Text>
            </YoutubeButton>
            <div>
              <Text>My playlists :</Text>
              <PlaylistItems>
                {playlists.map(pl => <PlaylistItem to={PATHS.WATCHLIST} onClick={() => updatePlaylist(pl.id)} key={pl.id}><Text>{pl.snippet?.title}</Text></PlaylistItem>)}
              </PlaylistItems>
            </div>
            <div>
              <Text>Theme :</Text>
              <PlaylistItems>
                <ActionButton onClick={dark}>Dark Theme</ActionButton>
                <ActionButton onClick={light}>Light Theme</ActionButton>
              </PlaylistItems>
            </div>
          </>
        )}
    </div>
  )
}

export default Login
