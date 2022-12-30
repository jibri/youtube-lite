import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { Link } from "react-router-dom";
import { PATHS } from "src/router/path";
import { ActionButton, Text } from "src/utils/styled";
import { useMyTheme } from "src/data/context/ThemeProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "src/init/firestore";
import { ConfigContext } from "src/data/context/configProvider";
import Notification from "src/gui/components/notification";

const YoutubeButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin: 1em;
  padding: 1em;
  background-color: ${(props) => props.theme.primary};
  max-width: 300px;

  text-decoration: none;
  color: inherit;

  span {
    font-weight: bold;
  }
`;

const PlaylistItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0.5em;
`;
const PlaylistItem = styled(Link)<{ $active: boolean }>`
  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin-left: 0.5em;
  padding: 0.5em;
  background-color: ${(props) => props.theme.primary};

  text-decoration: none;
  color: ${(props) => (props.$active ? props.theme.active : props.theme.text.main)};
`;

function Login() {
  const [minDurationInputValue, setMinDurationInputValue] = useState<string>("0");
  const [maxAgeInputValue, setMaxAgeInputValue] = useState<string>("0");
  const [playlists, setPlaylists] = useState<gapi.client.youtube.Playlist[]>([]);
  const { loggedIn, googleAuth, handleError, incLoading } = useContext(LoginContext);
  const { minDuration, maxAge, playlistId } = useContext(ConfigContext);
  const { dark, light } = useMyTheme();
  const [not, setNot] = useState(false);

  const updateMinDuration = (e: React.FocusEvent<HTMLInputElement>) => {
    updateDoc(doc(db, "configuration", "local"), {
      minDuration: e.target.value,
    });
  };

  const updateMaxAge = (e: React.FocusEvent<HTMLInputElement>) => {
    updateDoc(doc(db, "configuration", "local"), {
      maxAge: e.target.value,
    });
  };

  const updatePlaylistId = (id?: string) => {
    if (id) {
      updateDoc(doc(db, "configuration", "local"), {
        playlistId: id,
      });
    }
  };

  useEffect(() => {
    setMinDurationInputValue(`${minDuration}`);
  }, [minDuration]);

  useEffect(() => {
    setMaxAgeInputValue(`${maxAge}`);
  }, [maxAge]);

  useEffect(() => {
    const loadPlaylists = (pageToken?: string) => {
      incLoading(1);
      gapi.client.youtube.playlists
        .list({
          part: "snippet,contentDetails",
          mine: true,
          pageToken,
        })
        .then((response) => {
          const result = response.result;
          if (result.items?.length) {
            if (pageToken) {
              setPlaylists((pl) => pl.concat(result.items || []));
            } else {
              setPlaylists(result.items);
            }
          }
          if (result.nextPageToken) {
            loadPlaylists(result.nextPageToken);
          }
        }, handleError)
        .then(() => incLoading(-1));
    };
    if (loggedIn) loadPlaylists();
  }, [loggedIn, handleError, incLoading]);

  function handleAuthClick() {
    if (googleAuth?.isSignedIn.get()) {
      // User is authorized and has clicked "Sign out" button.
      googleAuth?.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      googleAuth?.signIn();
    }
  }

  function revokeAccess() {
    googleAuth?.disconnect();
  }

  return (
    <div>
      {!googleAuth ? (
        <Text>Waiting for auth initialization...</Text>
      ) : (
        <>
          <div>
            {loggedIn ? (
              <Text>You are currently signed in and have granted access to this app.</Text>
            ) : (
              <Text>You have not authorized this app or you are signed out.</Text>
            )}
          </div>
          <button onClick={handleAuthClick}>{loggedIn ? "Sign out" : "Sign In/Authorize"}</button>
          {loggedIn && <button onClick={revokeAccess}>Revoke access</button>}
          <YoutubeButton href="http://youtube.com" target="_blank" rel="noopener noreferer">
            <img
              src={`${process.env.PUBLIC_URL}/logo192.png`}
              width="100px"
              alt="Logo Youtube-lite"
            />
            <Text>Go to Youtube</Text>
          </YoutubeButton>
          <div>
            <Text>My playlists :</Text>
            <PlaylistItems>
              {playlists.map((pl) => (
                <PlaylistItem
                  to={PATHS.WATCHLIST}
                  onClick={() => updatePlaylistId(pl.id)}
                  $active={pl.id === playlistId}
                  key={pl.id}
                >
                  {pl.snippet?.title}
                </PlaylistItem>
              ))}
            </PlaylistItems>
          </div>
          <div>
            <Text>Theme :</Text>
            <PlaylistItems>
              <ActionButton onClick={dark}>Dark Theme</ActionButton>
              <ActionButton onClick={light}>Light Theme</ActionButton>
            </PlaylistItems>
          </div>
          <div>
            <Text>Min video duration in feed : </Text>
            <br />
            <input
              onBlur={updateMinDuration}
              value={minDurationInputValue}
              onChange={(e) => setMinDurationInputValue(e.target.value)}
            />
            <Text>seconds</Text>
          </div>
          <div>
            <Text>Max age video in feed : </Text>
            <br />
            <input
              onBlur={updateMaxAge}
              value={maxAgeInputValue}
              onChange={(e) => setMaxAgeInputValue(e.target.value)}
            />
            <Text>days</Text>
          </div>
          <Notification show={not}>
            <Text>Mon message</Text>
            <ActionButton onClick={() => setNot((n) => !n)}>Fermer</ActionButton>
          </Notification>
          <button onClick={() => setNot((n) => !n)}>Show notif</button>
          <div>
            <Text>version v{process.env.REACT_APP_VERSION}</Text>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
