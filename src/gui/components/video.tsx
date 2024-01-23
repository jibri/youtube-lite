import { useContext } from "react";
import styled from "styled-components";
import { VideoItem } from "src/utils/types";
import { VideoContext } from "src/data/context/videoProvider";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTimeDisplay } from "src/utils/utils";

export type VisualAction = {
  action: (video: VideoItem) => void;
  actionIcon: IconDefinition;
};

const LinkWrapper = styled.a`
  padding-left: 5px;
  text-decoration: none;
  width: 100%;
  color: ${(props) => props.theme.text.main};
`;
const VideoWrapper = styled.div<{ height?: number }>`
  display: flex;
  width: 100%;
  height: ${(props) => `${props.height}px`};
  background-color: ${(props) => props.theme.background};
  &:hover {
    /* background-color: ${(props) => props.theme.secondary}; */
    ${LinkWrapper} {
      color: ${(props) => props.theme.active};
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
  color: ${(props) => props.theme.white};
  background-color: ${(props) => props.theme.black};
`;
const Image = styled.img`
  flex: 0 0 110px;
`;
const ActionWrapper = styled.div`
  /* width: ${(props) => props.theme.video.height}; */
  font-size: ${(props) => `calc(${props.theme.video.height} - 50px)`};
  display: flex;
  justify-content: center;
  align-items: center;

  > * {
    margin: 0 10px;
    color: ${(props) => props.theme.text.main};
    &:hover {
      color: ${(props) => props.theme.active};
    }
  }
`;

const Video = ({ video, actions }: { video: VideoItem; actions: VisualAction[] }) => {
  const { playVideo } = useContext(VideoContext);
  return (
    <VideoWrapper height={video.video.snippet?.thumbnails?.default?.height}>
      <ThumbnailContainer>
        <Image
          alt="youtube thumbnail"
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
