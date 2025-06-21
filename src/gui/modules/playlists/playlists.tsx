import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { ActionButton, Text } from "src/utils/styled";
import { ConfigData } from "src/data/context/configProvider";
import { listMyPlaylists } from "src/utils/youtubeApi";
import { token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import { useFirebase } from "src/hooks/useFirebase";
import usePlaylists from "src/hooks/usePlaylists";
import { uniqBy } from "lodash";
import Playlist from "src/gui/components/playlist";
import { PlaylistConfig, PlaylistYtbLite } from "src/utils/types";
import { useHistory } from "react-router-dom";
import { PATHS } from "src/router/path";

const Separator = styled.div`
  width: 50%;
  border-top: 1px solid ${(props) => props.theme.palette.secondary.dark};
  margin: 1em;
`;

const Container = styled.div``;

const Input = styled.input<{ width?: string }>`
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.common.black};
  background-color: ${(props) => props.theme.palette.secondary.main};
  border-radius: 5px;
  padding: 0.5em;
  color: ${(props) => props.theme.palette.text.primary};
  font-size: 1em;
  width: ${(props) => props.width || "auto"};
`;

function Playlists() {
  const [playlistIdValue, setPlaylistIdValue] = useState("");

  // Playlist youtube gérées par youtube-lite (n'appartienne pas forcément au compte youtube) (info vient de youtube)
  const [mesPlaylistsYtbLite, setMesPlaylistsYtbLite] = useState<PlaylistYtbLite[]>([]);
  // config des playlists gérées dans youtube-lite (info vient de firestore)
  const mesPlaylistsConfig = usePlaylists();

  const { userId } = useContext(LoginContext);
  const handleError = useContext(ErrorUpdaterContext);
  const callYoutube = useYoutubeService();
  const fb = useFirebase();
  const history = useHistory();

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
        addPlaylistById(playlistId, false);
      }
    }
  };

  const addPlaylistById = async (playlistId: string, mine: boolean) => {
    if (userId && fb) {
      await fb.setDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlistId), {
        id: playlistId,
        autoplay: false,
        random: false,
        loop: false,
        mine,
        fav: false,
      } satisfies PlaylistConfig);
      setPlaylistIdValue("");
    }
  };

  const addYtbPlaylistsToYtbLitePlaylists = async () => {
    // on charge les playlists seulement si on a token.
    if (token) {
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
          addPlaylistById(pl.id, true);
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

        setMesPlaylistsYtbLite(
          uniqBy(myPlaylists, "id")
            .map((pl) => ({
              playlist: pl,
              config: mesPlaylistsConfig.find((cfg) => cfg.id === pl.id)!,
            }))
            .sort((p1, p2) => {
              // En premier on trie par favoris
              if (p1.config.fav !== p2.config.fav) {
                return p1.config.fav ? -1 : 1;
              }
              // Ensuite on trie par artistes
              if (p1.config.artists && p1.config.artists[0]) {
                if (p2.config.artists && p2.config.artists[0]) {
                  return p1.config.artists[0].localeCompare(p2.config.artists[0]);
                }
                return -1;
              } else if (p2.config.artists && p2.config.artists[0]) {
                return 1;
              }
              // Enfin on trie par titre de la playlist
              return (p1.playlist.snippet?.title || "").localeCompare(
                p2.playlist.snippet?.title || "",
              );
            }),
        );
      }
    };
    loadMesPlaylistsYtbLite();
  }, [callYoutube, handleError, mesPlaylistsConfig]);

  return (
    <div>
      {userId && (
        <>
          <Container>
            <div>
              {mesPlaylistsYtbLite.map((pl) => (
                <Playlist
                  key={pl.playlist.id}
                  playlist={pl}
                  onClick={() => {
                    updateConfig("playlistId", pl.playlist.id);
                    history.push(PATHS.PLAYLIST);
                  }}
                />
              ))}
            </div>
          </Container>
          <Separator />
          <Container>
            <label>
              <Text>Add a playlist : </Text>
              <Input
                id="new-playlist"
                value={playlistIdValue}
                placeholder="url"
                onChange={(e) => setPlaylistIdValue(e.target.value)}
              />
            </label>
            <ActionButton onClick={addPlaylist}>Go</ActionButton>
          </Container>
          <Separator />
          <Container>
            <Text>Your Youtube playlists do not show up ?</Text>
            <ActionButton onClick={addYtbPlaylistsToYtbLitePlaylists}>
              Find my playlists
            </ActionButton>
          </Container>
        </>
      )}
    </div>
  );
}

export default Playlists;
