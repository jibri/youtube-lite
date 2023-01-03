import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { Link } from "react-router-dom";
import { PATHS } from "src/router/path";
import { ActionButton, Text } from "src/utils/styled";
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

const Container = styled.div<{ sx: any }>`
  ${(props) => props.sx}
`;

const Input = styled.input`
  border: unset;
  background-color: ;
`;

function Login() {
  const [minDurationInputValue, setMinDurationInputValue] = useState<string>("0");
  const [maxAgeInputValue, setMaxAgeInputValue] = useState<string>("0");
  const [playlists, setPlaylists] = useState<gapi.client.youtube.Playlist[]>([]);
  const { loggedIn, googleAuth, handleError, incLoading } = useContext(LoginContext);
  const { minDuration, maxAge, playlistId } = useContext(ConfigContext);
  const [not, setNot] = useState(false);

  const userId = googleAuth?.currentUser.get().getId();

  const updateMinDuration = (e: React.FocusEvent<HTMLInputElement>) => {
    if (loggedIn && userId) {
      updateDoc(doc(db, "configuration", userId), {
        minDuration: e.target.value,
      });
    }
  };

  const updateMaxAge = (e: React.FocusEvent<HTMLInputElement>) => {
    if (loggedIn && userId) {
      updateDoc(doc(db, "configuration", userId), {
        maxAge: e.target.value,
      });
    }
  };

  const updatePlaylistId = (id?: string) => {
    if (loggedIn && userId && id) {
      updateDoc(doc(db, "configuration", userId), {
        playlistId: id,
      });
    }
  };

  const updateTheme = (theme: "dark" | "light") => {
    if (loggedIn && userId && theme) {
      updateDoc(doc(db, "configuration", userId), {
        theme,
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
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "min(100%, 800px)",
        margin: "auto",
      }}
    >
      {!googleAuth ? (
        <Text>Waiting for auth initialization...</Text>
      ) : (
        <>
          {loggedIn && (
            <>
              <Container sx={{ alignSelf: "start" }}>
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
              </Container>
              <Container sx={{ alignSelf: "start" }}>
                <Text>Theme :</Text>
                <PlaylistItems>
                  <ActionButton onClick={() => updateTheme("dark")}>Dark Theme</ActionButton>
                  <ActionButton onClick={() => updateTheme("light")}>Light Theme</ActionButton>
                </PlaylistItems>
              </Container>
              <Container sx={{ alignSelf: "start" }}>
                <Text>Min video duration in feed (seconds) : </Text>
                <Input
                  onBlur={updateMinDuration}
                  value={minDurationInputValue}
                  onChange={(e) => setMinDurationInputValue(e.target.value)}
                />
              </Container>
              <Container sx={{ alignSelf: "start" }}>
                <Text>Max age video in feed (days) : </Text>
                <Input
                  onBlur={updateMaxAge}
                  value={maxAgeInputValue}
                  onChange={(e) => setMaxAgeInputValue(e.target.value)}
                />
              </Container>
            </>
          )}
          <ActionButton onClick={handleAuthClick}>
            {loggedIn ? "Sign out" : "Sign In/Authorize"}
          </ActionButton>
          {loggedIn && <ActionButton onClick={revokeAccess}>Revoke access</ActionButton>}
          <YoutubeButton href="http://youtube.com" target="_blank" rel="noopener noreferer">
            <img
              src={`${process.env.PUBLIC_URL}/logo192.png`}
              width="100px"
              alt="Logo Youtube-lite"
            />
            <Text>Go to Youtube</Text>
          </YoutubeButton>
          <ActionButton onClick={() => setNot((n) => !n)}>Notif</ActionButton>
          <Notification show={not}>
            <Text>Ma notif</Text>
            <ActionButton onClick={() => setNot((n) => !n)}>Fermer</ActionButton>
          </Notification>
          <Container sx={{ alignSelf: "end" }}>
            <Text>version v{process.env.REACT_APP_VERSION}</Text>
          </Container>
        </>
      )}
    </Container>
  );
}

export default Login;
