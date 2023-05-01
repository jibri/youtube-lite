import React, { useCallback, useContext, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { Text } from "src/utils/styled";
import { LoginContext, token } from "src/data/context/loginProvider";
import { insertPlaylistItem } from "src/utils/youtubeApi";
import { ConfigContext } from "src/data/context/configProvider";

const IFrameWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: ${(props) => props.theme.zIndex.player};
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

const Player = ({ video }: { video: VideoItem }) => {
  const player = useRef<YT.Player>();
  const readyPlayerOne = useRef<boolean>(false);
  const { playlistId } = useContext(ConfigContext);
  const { callYoutube, handleError } = useContext(LoginContext);
  const { descriptionOpened } = useContext(VideoContext);
  const theme = useTheme();
  const playerHeight = theme.playerHeight;

  useEffect(() => {
    if (readyPlayerOne.current && video.video.id) player.current?.loadVideoById(video.video.id);
    else {
      player.current = new window.YT.Player(`video_player`, {
        height: playerHeight,
        width: "100%",
        videoId: video.video.id,
        playerVars: {
          rel: 0,
        },
        events: {
          onReady: () => {
            readyPlayerOne.current = true;
            player.current?.setVolume(50);
          },
        },
      });
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
        <Text>{formatDescription(video.video.snippet?.description, addToWatchlist)}</Text>
      </Description>
    </IFrameWrapper>
  );
};
export default Player;
