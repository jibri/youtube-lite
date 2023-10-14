import React, { useCallback, useContext, useEffect, useRef } from "react";
import styled from "styled-components";
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

const initPlayer = (video: VideoItem, playerHeight: number, playerWidth: number) => {
  return new window.YT.Player(`video_player`, {
    height: playerHeight,
    width: playerWidth,
    videoId: video.video.id,
    playerVars: {
      // autoplay: 1,
      rel: 0,
    },
    events: {
      onStateChange: (event) => {
        console.log("event.data", event.data);
      },
      onError: (event) => console.log("onError", event.data),
    },
  });
};

const Player = ({ video, height, width }: { video: VideoItem; height: number; width: number }) => {
  const player = useRef<YT.Player>();
  const { playlistId } = useContext(ConfigContext);
  const { callYoutube, handleError } = useContext(LoginContext);
  const { descriptionOpened } = useContext(VideoContext);

  useEffect(() => {
    console.log("useeffect", video.video.id, width, height);
    if (player.current?.cueVideoById && video.video.id) {
      console.log("cue video");
      player.current?.cueVideoById(video.video.id);
      player.current.setSize(width, height);
    } else {
      console.log("init player");
      player.current = initPlayer(video, height, width);
    }
  }, [video, height, width]);

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
        <Text>{formatDescription(video.video.snippet?.description, addToWatchlist)}</Text>
      </Description>
    </IFrameWrapper>
  );
};
export default Player;
