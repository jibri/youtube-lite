import React, { useCallback, useContext, useEffect, useRef } from "react";
import styled from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { Text } from "src/utils/styled";
import { insertPlaylistItem } from "src/utils/youtubeApi";
import { ConfigContext } from "src/data/context/configProvider";
import { token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import usePlaylists from "src/hooks/usePlaylists";

const PlayerContainer = styled.div`
  background-color: ${(props) => props.theme.background};
`;

const IFrameWrapper = styled.div`
  height: ${(props) => props.theme.playerHeight};
  display: flex;
  justify-content: center;
`;

const Description = styled.div<{ open: boolean }>`
  white-space: pre-line;
  overflow: auto;
  max-height: ${(props) => (props.open ? "40vh" : "0")};
  transition: max-height 0.5s ease;
`;

const urlRegex = /(https?:\/\/[^\s]+)/gi;
// https://www.youtube.com/watch?v=NZ4Of3lID84
const ytbRegex = /^https?:\/\/(www\.)?youtube\.([a-z]{1,3})\/watch\?(v=|.*&v=)([^&]*)/gi;
// https://youtu.be/NZ4Of3lID84
const ytbLiteRegex = /^https?:\/\/youtu\.be\/(.*)/gi;
const formatDescription = (text?: string, handleYtbLink?: (videoId: string) => void) => {
  const elements: React.ReactNode[] = [];
  text?.split(urlRegex).forEach((elt, i) => {
    if (i % 2 !== 0) {
      elements.push(
        <a href={elt} target="_blank" rel="noreferrer">
          {elt}
        </a>,
      );
      if (handleYtbLink) {
        let result;
        if ((result = ytbRegex.exec(elt)) !== null) {
          const group = result[4];
          if (group) {
            elements.push(" ");
            elements.push(<button onClick={() => handleYtbLink(group)}>add to playlist</button>);
          }
        } else if ((result = ytbLiteRegex.exec(elt)) !== null) {
          const group = result && result[1];
          if (group) {
            elements.push(" ");
            elements.push(<button onClick={() => handleYtbLink(group)}>add to playlist</button>);
          }
        }
        // on reset les index des regex sinon ca part en sucette
        ytbRegex.lastIndex = 0;
        ytbLiteRegex.lastIndex = 0;
      }
    } else {
      elements.push(elt);
    }
  });
  return elements;
};

const Player = ({ video, playedVids }: { video: VideoItem; playedVids: number[] }) => {
  const player = useRef<YT.Player>();
  const { playlistId } = useContext(ConfigContext);
  const handleError = useContext(ErrorUpdaterContext);
  const { descriptionOpened, playlistVideos, playVideo } = useContext(VideoContext);
  const callYoutube = useYoutubeService();
  const playlists = usePlaylists();

  const currentPlaylist = playlistId ? playlists.find((pl) => pl.id === playlistId) : undefined;

  useEffect(() => {
    if (!player.current) {
      new window.YT.Player(`video_player`, {
        height: "100%",
        width: "100%",
        videoId: video.video.id,
        playerVars: {
          autoplay: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => (player.current = event.target),
          onStateChange: (event) => {
            // Fin de video, on en charge une autre random
            if (currentPlaylist?.autoplay && event.data === 0) {
              const vidNumber = playlistVideos.findIndex((pl) => pl.video.id === video.video.id);

              // On s'arrete la si c'est la fin de la playlist
              if (playedVids.length >= playlistVideos.length && !currentPlaylist.loop) return;

              // On calcul le prochain index à jouer
              let next = vidNumber + 1;
              if (currentPlaylist.random) {
                next = Math.floor(Math.random() * playlistVideos.length);
                let iterations = 0;
                while (playedVids.includes(next % playlistVideos.length)) {
                  next++;
                  // Au cas ou pour eviter une ininite loop
                  if (++iterations > playlistVideos.length) break;
                }
              }
              // Modulo pour repasser à zéro si on dépasse
              playVideo(playlistVideos[next % playlistVideos.length]);
            }
          },
          onError: (event) => console.log("onError", event.data),
        },
      });
    }
  }, [currentPlaylist, playVideo, playlistVideos, video, playedVids]);

  const addToWatchlist = useCallback(
    async (videoId: string) => {
      if (token && videoId) {
        const response = await callYoutube(
          insertPlaylistItem,
          { kind: "youtube#video", videoId },
          playlistId,
          token.access_token,
        );
        if (!response.ok) {
          handleError(response.status, response.error);
          return;
        }
      }
    },
    [callYoutube, handleError, playlistId],
  );

  return (
    <PlayerContainer>
      <IFrameWrapper>
        {/* This div will be replaced by an iframe */}
        <div id="video_player" title="video_player" />
      </IFrameWrapper>
      <Description open={descriptionOpened}>
        <Text>{formatDescription(video.video.snippet?.description, addToWatchlist)}</Text>
      </Description>
    </PlayerContainer>
  );
};
export default Player;
