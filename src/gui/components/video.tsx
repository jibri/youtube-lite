import { useContext } from "react";
import styled from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTimeDisplay } from "src/utils/utils";
import { ActionWrapper } from "src/utils/styled";

export type VisualAction = {
  action: (video: VideoItem) => void;
  actionIcon: IconDefinition;
};

const LinkWrapper = styled.a`
  padding-left: 5px;
  text-decoration: none;
  color: ${(props) => props.theme.palette.text.primary};
  overflow: hidden;
`;
const VideoWrapper = styled.div<{ $height?: number; $videoWidth?: number; $highlight: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => props.$videoWidth}px 1fr min-content;

  height: ${(props) => `${props.$height}px`};
  background-color: ${(props) =>
    props.$highlight ? props.theme.palette.secondary.main : props.theme.palette.background.main};
  &:hover {
    ${LinkWrapper} {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }
`;
const ThumbnailContainer = styled.div`
  position: relative; // in order to position Time at the bottom of it
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
  color: ${(props) => props.theme.palette.common.white};
  background-color: ${(props) => props.theme.palette.common.black};
`;
const Image = styled.img`
  display: block;
  width: 120px;
  height: 90px;
`;

const Video = ({ video, actions }: { video: VideoItem; actions: VisualAction[] }) => {
  const { playVideo, videoPlaying } = useContext(VideoContext);
  return (
    <VideoWrapper
      id={video.video.id}
      $highlight={videoPlaying?.video.id === video.video.id}
      $height={video.video.snippet?.thumbnails?.default?.height}
      $videoWidth={video.video.snippet?.thumbnails?.default?.width}
    >
      <ThumbnailContainer>
        <Image
          alt="youtube thumbnail"
          loading="lazy"
          src={video.video.snippet?.thumbnails?.default?.url}
          width={video.video.snippet?.thumbnails?.default?.width}
          height={video.video.snippet?.thumbnails?.default?.height}
          onClick={() => playVideo(video)}
        />
        <Time>{getTimeDisplay(video.video.contentDetails?.duration)}</Time>
      </ThumbnailContainer>
      <LinkWrapper href={`https://www.youtube.com/watch?v=${video.video.id}`}>
        <Author>{video.video.snippet?.channelTitle}</Author>
        <Title>{video.video.snippet?.title}</Title>
      </LinkWrapper>
      <ActionWrapper>
        {actions.map((a) => (
          <FontAwesomeIcon
            key={a.actionIcon.iconName}
            icon={a.actionIcon}
            onClick={() => a.action(video)}
          />
        ))}
      </ActionWrapper>
    </VideoWrapper>
  );
};

export default Video;
