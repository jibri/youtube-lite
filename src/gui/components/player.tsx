import React, { useContext, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { Text } from "src/utils/styled";

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

const Player = ({ video }: { video: VideoItem }) => {
  const player = useRef<YT.Player>();
  const readyPlayerOne = useRef<boolean>(false);
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
          autoplay: 1,
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

  return (
    <IFrameWrapper>
      {/* This div will be replaced by an iframe */}
      <div id="video_player" title="video_player" />
      <Description open={descriptionOpened}>
        <Text>{video.video.snippet?.description}</Text>
      </Description>
    </IFrameWrapper>
  );
};
export default Player;
