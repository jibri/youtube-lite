import React, { useContext } from "react";
import styled from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VideoWrapper = styled.div<{ height?: number }>`
  display: flex;
  width: 100%;
  height: ${(props) => `${props.height}px`};
  background-color: ${(props) => props.theme.primary};
  &:hover {
    background-color: ${(props) => props.theme.secondary};
    color: ${(props) => props.theme.active};
    * {
      color: ${(props) => props.theme.active};
    }
  }
`;
const ThumbnailContainer = styled.div`
  position: relative; // in order to position Time at the bottom of it
`;
const LinkWrapper = styled.a`
  padding-left: 5px;
  text-decoration: none;
  width: 100%;
  color: ${(props) => props.theme.text.main};
`;
const Author = styled.h6`
  font-size: 0.8em;
  font-weight: initial;
  margin: 0;
  padding: 0;
`;
const Title = styled(Author)`
  font-size: 1em;
  line-height: 1.1em;
  color: inherit;
  font-weight: bold;
`;
const Time = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  color: ${(props) => props.theme.text.main};
  background-color: ${(props) => props.theme.background};
`;
const Image = styled.img`
  flex: 0 0 110px;
`;
const ActionWrapper = styled.div`
  width: ${(props) => props.theme.video.height};
  font-size: ${(props) => `calc(${props.theme.video.height} - 30px)`};
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Transforme a time string from 'PT123H45M67S' to '123:45:67'
 */
export const getTime = (duration?: string) => {
  if (!duration) return "00:00";
  const regex = /PT((\d*)H)?((\d*)M)?((\d*)S)?/;
  const result = duration.match(regex);
  if (!result || !result[0]) return "00:00";
  const hours = (result[2] && `${result[2]}:`) || "";
  const minutes =
    (result[4] && (result[4].length === 1 ? `0${result[4]}:` : `${result[4]}:`)) || "00:";
  const seconds = (result[6] && (result[6].length === 1 ? `0${result[6]}` : result[6])) || "00";
  return `${hours}${minutes}${seconds}`;
};

const Video = ({
  video,
  action,
  actionIcon,
}: {
  video: VideoItem;
  action?: () => void;
  actionIcon?: IconDefinition;
}) => {
  const { playVideo } = useContext(VideoContext);
  return (
    <VideoWrapper key={video.video.id} height={video.video.snippet?.thumbnails?.default?.height}>
      <ThumbnailContainer>
        <Image
          alt="youtube thumbnail"
          src={video.video.snippet?.thumbnails?.default?.url}
          width={video.video.snippet?.thumbnails?.default?.width}
          height={video.video.snippet?.thumbnails?.default?.height}
          onClick={() => playVideo(video)}
        />
        <Time>{getTime(video.video.contentDetails?.duration)}</Time>
      </ThumbnailContainer>
      <LinkWrapper href={`https://www.youtube.com/watch?v=${video.video.id}`}>
        <Author>{video.video.snippet?.channelTitle}</Author>
        <Title>{video.video.snippet?.title}</Title>
      </LinkWrapper>
      {action && actionIcon && (
        <ActionWrapper onClick={action}>
          <FontAwesomeIcon icon={actionIcon} />
        </ActionWrapper>
      )}
    </VideoWrapper>
  );
};
export default Video;
