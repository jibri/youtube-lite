import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { Link } from "react-router-dom";
import { ActionButton, Text } from "src/utils/styled";
import { ConfigContext, ConfigData } from "src/data/context/configProvider";
import Notification from "src/gui/components/notification";
import { listMyPlaylists } from "src/utils/youtubeApi";
import { login, token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import logoUrl from "src/assets/logo192.png";
import { useFirebase } from "src/hooks/useFirebase";
import usePlaylists from "src/hooks/usePlaylists";
import { uniqBy } from "lodash";
import CurrentPlaylist from "src/gui/modules/login/currentPlaylist";
import { PlaylistConfig } from "src/data/context/playlistsProvider";

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
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;

  margin: 0.5em;
`;
const PlaylistItem = styled(Link)<{ $active: boolean }>`
  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin-left: 0.5em;
  padding: 0.5em;
  background-color: ${(props) => props.theme.primary};

  display: flex;
  align-items: center;
  gap: 3px;

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

const Container = styled.div<{ $alignSelf?: string }>`
  align-self: ${(props) => (props.$alignSelf ? props.$alignSelf : "start")};
`;

const Input = styled.input<{ width?: string }>`
  border: 1px solid;
  border-color: ${(props) => props.theme.black};
  background-color: ${(props) => props.theme.secondary};
  border-radius: 5px;
  padding: 0.5em;
  color: ${(props) => props.theme.text.main};
  font-size: 1em;
  width: ${(props) => props.width || "auto"};
`;

function Login() {
  const [minDurationInputValue, setMinDurationInputValue] = useState("0");
  const [maxAgeInputValue, setMaxAgeInputValue] = useState("0");
  const [autoAuthInputValue, setAutoAuthInputValue] = useState(false);
  const [useSwipeInputValue, setUseSwipeInputValue] = useState(false);
  const [playlistIdValue, setPlaylistIdValue] = useState("");

  // Playlist youtube gérées par youtube-lite (n'appartienne pas forcément au compte youtube) (info vient de youtube)
  const [mesPlaylistsYtbLite, setMesPlaylistsYtbLite] = useState<youtube.Playlist[]>([]);
  // config des playlists gérées dans youtube-lite (info vient de firestore)
  const mesPlaylistsConfig = usePlaylists();

  const { userId, signout } = useContext(LoginContext);
  const { minDuration, maxAge, playlistId, autoAuth, useSwipe } = useContext(ConfigContext);
  const handleError = useContext(ErrorUpdaterContext);
  const [not, setNot] = useState(false);
  const callYoutube = useYoutubeService();
  const fb = useFirebase();

  const currentPlaylist = playlistId
    ? mesPlaylistsConfig.find((config) => config.id === playlistId)
    : undefined;

  const updateConfig = <K extends keyof ConfigData>(key: K, value?: ConfigData[K]) => {
    if (userId && fb && key) {
      fb.updateDoc(fb.doc(fb.db, "configuration", userId), {
        [key]: value,
      });
    }
  };

  const addPlaylist = async () => {
    if (playlistIdValue) {
      const regex = /list=(.*?)(&|$)/i;
      const match = playlistIdValue.match(regex);

      if (match && match[1]) {
        const playlistId = match[1];
        addPlaylistById(playlistId);
      }
    }
  };

  const addPlaylistById = async (playlistId: string) => {
    if (userId && fb) {
      await fb.setDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlistId), {
        id: playlistId,
        autoplay: false,
        random: false,
        loop: false,
      } as PlaylistConfig);
      setPlaylistIdValue("");
    }
  };

  useEffect(() => {
    setMinDurationInputValue(`${minDuration}`);
  }, [minDuration]);

  useEffect(() => {
    setAutoAuthInputValue(autoAuth);
  }, [autoAuth]);

  useEffect(() => {
    setUseSwipeInputValue(useSwipe);
  }, [useSwipe]);

  useEffect(() => {
    setMaxAgeInputValue(`${maxAge}`);
  }, [maxAge]);

  const addYtbPlaylistsToYtbLitePlaylists = async () => {
    // on charge les playlists seulement si on a token et si on ne les à pas déjà chargé.
    if (token && mesPlaylistsConfig.length) {
      let nextToken: string | undefined;
      const myPlaylists: youtube.Playlist[] = [];
      do {
        const response = await callYoutube(listMyPlaylists, [], token.access_token, nextToken);
        if (!response.ok) {
          handleError(response.status, response.error);
        } else {
          myPlaylists.push(...response.data.items);
          nextToken = response.data.nextPageToken;
        }
      } while (nextToken);

      myPlaylists.forEach((pl) => {
        if (pl.id && !mesPlaylistsConfig.map((cfg) => cfg.id).includes(pl.id)) {
          addPlaylistById(pl.id);
        }
      });
    }
  };

  useEffect(() => {
    const loadMesPlaylistsYtbLite = async () => {
      // on charge les playlists seulement si on a token et si on ne les à pas déjà chargé.
      if (token && mesPlaylistsConfig.length) {
        let nextToken: string | undefined;
        const myPlaylists: youtube.Playlist[] = [];

        do {
          const response = await callYoutube(
            listMyPlaylists,
            mesPlaylistsConfig.map((pl) => pl.id),
            token.access_token,
            nextToken,
          );
          if (!response.ok) {
            handleError(response.status, response.error);
          } else {
            myPlaylists.push(...response.data.items);
            nextToken = response.data.nextPageToken;
          }
        } while (nextToken);

        setMesPlaylistsYtbLite(uniqBy(myPlaylists, "id"));
      }
    };
    loadMesPlaylistsYtbLite();
  }, [callYoutube, handleError, mesPlaylistsConfig]);

  function handleAuthClick() {
    if (token) {
      // User is authorized and has clicked "Sign out" button.
      signout();
    } else {
      // User is not signed in. Start Google auth flow.
      login(true);
    }
  }

  return (
    <MainContainer>
      {userId && (
        <>
          <Container>
            <Text>My Youtube-lite playlists :</Text>
            <PlaylistItems>
              {mesPlaylistsYtbLite.map((pl) => (
                <PlaylistItem
                  to="#"
                  onClick={() => updateConfig("playlistId", pl.id)}
                  $active={pl.id === playlistId}
                  key={pl.id}
                >
                  <img src={pl.snippet?.thumbnails?.medium?.url} height="20px" />
                  {pl.snippet?.title}
                </PlaylistItem>
              ))}
            </PlaylistItems>
          </Container>
          <Container>
            <Text>Add a playlist : </Text>
            <Input value={playlistIdValue} onChange={(e) => setPlaylistIdValue(e.target.value)} />
            <ActionButton onClick={addPlaylist}>Go</ActionButton>
          </Container>
          <Separator />
          <Container>
            {currentPlaylist && (
              <>
                <Text>Current playlist :</Text>
                <CurrentPlaylist playlist={currentPlaylist} key={currentPlaylist.id} />
              </>
            )}
          </Container>
          <Separator />
          <Container>
            <Text>Your Youtube playlists do not show up ?</Text>
            <ActionButton onClick={addYtbPlaylistsToYtbLitePlaylists}>
              Find my playlists
            </ActionButton>
          </Container>
          <Separator />
          <Container>
            <Text>Theme :</Text>
            <PlaylistItems>
              <ActionButton onClick={() => updateConfig("theme", "dark")}>Dark Theme</ActionButton>
              <ActionButton onClick={() => updateConfig("theme", "light")}>
                Light Theme
              </ActionButton>
            </PlaylistItems>
          </Container>
          <Container>
            <Text>Min video duration in feed (seconds) : </Text>
            <Input
              width="2em"
              onBlur={(e) => updateConfig("minDuration", +e.target.value)}
              value={minDurationInputValue}
              onChange={(e) => setMinDurationInputValue(e.target.value)}
            />
          </Container>
          <Container>
            <Text>Max age video in feed (days) : </Text>
            <Input
              width="2em"
              onBlur={(e) => updateConfig("maxAge", +e.target.value)}
              value={maxAgeInputValue}
              onChange={(e) => setMaxAgeInputValue(e.target.value)}
            />
          </Container>
          <Container>
            <Text>Auto auth on 401 : </Text>
            <input
              type="checkbox"
              checked={autoAuthInputValue}
              onChange={(e) => {
                setAutoAuthInputValue(e.target.checked);
                updateConfig("autoAuth", e.target.checked);
              }}
            />
          </Container>
          <Container>
            <Text>Use swipeable videos : </Text>
            <input
              type="checkbox"
              checked={useSwipeInputValue}
              onChange={(e) => {
                setUseSwipeInputValue(e.target.checked);
                updateConfig("useSwipe", e.target.checked);
              }}
            />
          </Container>
          <Separator />
        </>
      )}
      <ActionButton onClick={handleAuthClick}>
        {userId ? "Sign out" : "Sign In/Authorize"}
      </ActionButton>
      <YoutubeButton href="http://youtube.com" target="_blank" rel="noopener noreferer">
        <img src={logoUrl} width="100px" alt="Logo Youtube-lite" />
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
      <Container $alignSelf="end">
        <Text>version v{import.meta.env.VITE_VERSION}</Text>
      </Container>
    </MainContainer>
  );
}

export default Login;
