import React, { useCallback, useContext, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { Text } from "src/utils/styled";
import { LoginContext } from "src/data/context/loginProvider";
import { insertPlaylistItem } from "src/utils/youtubeApi";
import { ConfigContext } from "src/data/context/configProvider";
import { token } from "src/init/youtubeOAuth";

const IFrameWrapper = styled.div`
  background-color: ${(props) => props.theme.background};
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
        </a>
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

const isArray = (video: VideoItem | VideoItem[]): video is VideoItem[] => {
  return !(video as VideoItem).video;
};

const initPlayer = (video: VideoItem | VideoItem[], playerHeight: string) => {
  return new window.YT.Player(`video_player`, {
    height: playerHeight,
    width: window.innerHeight < 650 ? window.innerWidth / 2 : "100%",
    videoId: isArray(video) ? "" : video.video.id,
    playerVars: {
      // autoplay: 1,
      rel: 0,
    },
    events: {
      onReady: (event) => {
        if (isArray(video)) {
          event.target.cuePlaylist(video.map((v) => v.video.id || ""));
        }
      },
      onStateChange: (event) => {
        console.log("event.data", event.data);
        if (event.data === 5) {
          // quand on queue une playlist, on la shuffle puis on démarre la lecture
          event.target.setShuffle(true);
          event.target.playVideoAt(0);
        }
      },
      onError: (event) => console.log("onError", event.data),
    },
  });
};

const Player = ({ video }: { video: VideoItem | VideoItem[] }) => {
  const player = useRef<YT.Player>();
  const { playlistId } = useContext(ConfigContext);
  const { callYoutube, handleError } = useContext(LoginContext);
  const { descriptionOpened } = useContext(VideoContext);
  const theme = useTheme();

  const playerHeight = theme.playerHeight;

  useEffect(() => {
    if (player.current?.cueVideoById && !isArray(video) && video.video.id) {
      player.current?.cueVideoById(video.video.id);
    } else if (player.current?.cueVideoById && isArray(video)) {
      player.current.cuePlaylist(video.map((v) => v.video.id || ""));
    } else {
      player.current = initPlayer(video, playerHeight);
    }
  }, [video, playerHeight]);

  const addToWatchlist = useCallback(
    async (videoId: string) => {
      if (token && videoId) {
        const response = await callYoutube(
          insertPlaylistItem,
          { kind: "youtube#video", videoId },
          playlistId,
          token.access_token
        );
        if (!response.ok) {
          handleError(response.error);
          return;
        }
      }
    },
    [callYoutube, handleError, playlistId]
  );

  return (
    <IFrameWrapper>
      {/* This div will be replaced by an iframe */}
      <div id="video_player" title="video_player" />
      <Description open={descriptionOpened}>
        {!isArray(video) && (
          <Text>{formatDescription(video.video.snippet?.description, addToWatchlist)}</Text>
        )}
      </Description>
    </IFrameWrapper>
  );
};
export default Player;
