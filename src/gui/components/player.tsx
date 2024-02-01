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

const Player = ({ video }: { video: VideoItem }) => {
  const player = useRef<YT.Player>();
  const { playlistId, autoPlayNextRandom } = useContext(ConfigContext);
  const handleError = useContext(ErrorUpdaterContext);
  const { descriptionOpened, playlistVideos, playVideo } = useContext(VideoContext);
  const callYoutube = useYoutubeService();

  useEffect(() => {
    // if (player.current?.cueVideoById && video.video.id) {
    //   player.current?.cueVideoById(video.video.id);
    // } else {
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
            console.log("event.data", event.data, autoPlayNextRandom);
            // Fin de video, on en charge une autre random
            if (autoPlayNextRandom && event.data === 0) {
              let vidNumber = Math.floor(Math.random() * playlistVideos.length);
              if (playlistVideos[vidNumber].video.id === video.video.id) vidNumber++;
              playVideo(playlistVideos[vidNumber]);
            }
          },
          onError: (event) => console.log("onError", event.data),
        },
      });
    }
  }, [autoPlayNextRandom, playVideo, playlistVideos, video]);

  useEffect(() => {
    if (player.current?.loadVideoById && video.video.id) {
      player.current.loadVideoById(video.video.id);
    }
  }, [video]);

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
