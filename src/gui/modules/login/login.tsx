import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { Link } from "react-router-dom";
import { PATHS } from "src/router/path";
import { ActionButton, Text } from "src/utils/styled";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "src/init/firestore";
import { ConfigContext, ConfigData } from "src/data/context/configProvider";
import Notification from "src/gui/components/notification";
import { listMyPlaylists } from "src/utils/youtubeApi";

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
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 800px);
  margin: auto;

  > * {
    margin-bottom: 0.5em;
  }
`;

const Separator = styled.div`
  width: 50%;
  border-top: 1px solid ${(props) => props.theme.primary};
`;

const Container = styled.div<{ sx: any }>`
  ${(props) => props.sx}
`;

const Input = styled.input`
  border: 1px solid;
  border-color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.secondary};
  border-radius: 5px;
  padding: 0.5em;
  color: ${(props) => props.theme.text.main};
  font-size: 1em;
  width: 2em;
`;

function Login() {
  const [minDurationInputValue, setMinDurationInputValue] = useState<string>("0");
  const [maxAgeInputValue, setMaxAgeInputValue] = useState<string>("0");
  const [playlists, setPlaylists] = useState<youtube.Playlist[]>([]);
  const { userId, token, handleError, login, logout, callYoutube } = useContext(LoginContext);
  const { minDuration, maxAge, playlistId } = useContext(ConfigContext);
  const [not, setNot] = useState(false);

  const updateConfig = <K extends keyof ConfigData>(key: K, value?: ConfigData[K]) => {
    if (userId && key) {
      updateDoc(doc(db, "configuration", userId), {
        [key]: value,
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
    const loadPlaylists = async () => {
      if (token) {
        let nextToken: string | undefined;
        const myPlaylists: youtube.Playlist[] = [];

        do {
          const response = await callYoutube(listMyPlaylists, token.access_token, nextToken);
          if (!response.ok) {
            handleError(response.error);
          } else {
            const { items, nextPageToken } = response.data;
            myPlaylists.push(...items);
            nextToken = nextPageToken;
          }
        } while (nextToken);
        setPlaylists(myPlaylists);
      }
    };
    loadPlaylists();
  }, [callYoutube, handleError, token]);

  function handleAuthClick() {
    if (token) {
      // User is authorized and has clicked "Sign out" button.
      logout(token);
    } else {
      // User is not signed in. Start Google auth flow.
      login();
    }
  }

  return (
    <MainContainer>
      {token && (
        <>
          <Container sx={{ alignSelf: "start" }}>
            <Text>My playlists :</Text>
            <PlaylistItems>
              {playlists.map((pl) => (
                <PlaylistItem
                  to={PATHS.WATCHLIST}
                  onClick={() => updateConfig("playlistId", pl.id)}
                  $active={pl.id === playlistId}
                  key={pl.id}
                >
                  {pl.snippet?.title}
                </PlaylistItem>
              ))}
            </PlaylistItems>
          </Container>
          <Separator />
        </>
      )}
      {userId && (
        <>
          <Container sx={{ alignSelf: "start" }}>
            <Text>Theme :</Text>
            <PlaylistItems>
              <ActionButton onClick={() => updateConfig("theme", "dark")}>Dark Theme</ActionButton>
              <ActionButton onClick={() => updateConfig("theme", "light")}>
                Light Theme
              </ActionButton>
            </PlaylistItems>
          </Container>
          <Container sx={{ alignSelf: "start" }}>
            <Text>Min video duration in feed (seconds) : </Text>
            <Input
              onBlur={(e) => updateConfig("minDuration", +e.target.value)}
              value={minDurationInputValue}
              onChange={(e) => setMinDurationInputValue(e.target.value)}
            />
          </Container>
          <Container sx={{ alignSelf: "start" }}>
            <Text>Max age video in feed (days) : </Text>
            <Input
              onBlur={(e) => updateConfig("maxAge", +e.target.value)}
              value={maxAgeInputValue}
              onChange={(e) => setMaxAgeInputValue(e.target.value)}
            />
          </Container>
          <Separator />
        </>
      )}
      <ActionButton onClick={handleAuthClick}>
        {userId ? "Sign out" : "Sign In/Authorize"}
      </ActionButton>
      <YoutubeButton href="http://youtube.com" target="_blank" rel="noopener noreferer">
        <img src={`${process.env.PUBLIC_URL}/logo192.png`} width="100px" alt="Logo Youtube-lite" />
        <Text>Go to Youtube</Text>
      </YoutubeButton>
      <Separator />
      <ActionButton onClick={() => setNot((n) => !n)}>Notif</ActionButton>
      <Notification show={not}>
        <Text>
          Ma notif mega long parce que je veux faire un test sur la fluidité d'apparition de la
          notif depuis la gauche de l'ecran.
        </Text>
        <ActionButton onClick={() => setNot((n) => !n)}>Fermer</ActionButton>
      </Notification>
      <Container sx={{ alignSelf: "end" }}>
        <Text>version v{process.env.REACT_APP_VERSION}</Text>
      </Container>
    </MainContainer>
  );
}

export default Login;
