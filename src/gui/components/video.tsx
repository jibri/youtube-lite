import React, { useContext } from "react";
import styled from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VideoWrapper = styled.div`
  display: flex;
  width: 100%;
  background-color: ${(props) => props.theme.primary};
  &:hover {
    background-color: ${(props) => props.theme.secondary};
    color: ${(props) => props.theme.active};
    * {
      color: ${(props) => props.theme.active};
    }
  }
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
  color: inherit;
  font-weight: bold;
`;
const Image = styled.img`
  flex: 0 0 110px;
`;
const ActionWrapper = styled.div`
  width: ${(props) => props.theme.video.height};
  padding: 15px;
  font-size: 4em;
  display: flex;
  align-items: center;
`;

const getTime = (duration?: string) => {
  return duration?.replace("PT", "").replace("M", ":").replace("S", "");
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
    <VideoWrapper key={video.video.id}>
      <Image
        alt="youtube thumbnail"
        src={video.video.snippet?.thumbnails?.default?.url}
        width={video.video.snippet?.thumbnails?.default?.width}
        height={video.video.snippet?.thumbnails?.default?.height}
        onClick={() => playVideo(video)}
      />
      <LinkWrapper href={`https://www.youtube.com/watch?v=${video.video.id}`}>
        <Author>{video.video.snippet?.channelTitle}</Author>
        <Title>{video.video.snippet?.title}</Title>
        <div>{getTime(video.video.contentDetails?.duration)}</div>
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
