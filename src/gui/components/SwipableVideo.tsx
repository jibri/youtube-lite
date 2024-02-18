import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSwipe from "react-swipe";
import Video, { VisualAction } from "src/gui/components/video";
import { VideoItem } from "src/utils/types";
import styled from "styled-components";

export const ActionsMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  div {
    font-size: ${(props) => `calc(${props.theme.video.height} - 30px)`};
    flex: 1 1 33%;
    color: #00000055;
    padding: 0 15px;
    display: flex;
    align-items: center;
  }
`;
export const MiddleActionWrapper = styled.div`
  background-image: linear-gradient(to right, #ff5050, #5050ff);
`;
export const DeleteActionWrapper = styled.div`
  background-color: #ff5050;
`;
export const LikeActionWrapper = styled.div`
  justify-content: flex-end;
  background-color: #5050ff;
`;

const SwipableVideo = ({
  ref = null,
  video,
  videoActions,
  swipeActions,
}: {
  ref?: ReactSwipe | null;
  video: VideoItem;
  videoActions: VisualAction[];
  swipeActions: [VisualAction | undefined, VisualAction | undefined];
}) => {
  return (
    <>
      <ActionsMask>
        <DeleteActionWrapper>
          {swipeActions[0] && <FontAwesomeIcon icon={swipeActions[0].actionIcon} />}
        </DeleteActionWrapper>
        <MiddleActionWrapper />
        <LikeActionWrapper>
          {swipeActions[1] && <FontAwesomeIcon icon={swipeActions[1].actionIcon} />}
        </LikeActionWrapper>
      </ActionsMask>
      <ReactSwipe
        ref={(el) => (ref = el)}
        swipeOptions={{
          startSlide: swipeActions[0] ? 1 : 0,
          continuous: false,
          callback: (idx) => {
            console.log(ref);
            if (idx === 0) swipeActions[0]?.action(video);
            if (idx === 1) !swipeActions[0] && swipeActions[1]?.action(video);
            if (idx === 2) swipeActions[1]?.action(video);
          },
        }}
      >
        {swipeActions[0] && (
          <div>
            <div style={{ height: "10px" }}></div>
          </div>
        )}
        <div>
          <Video video={video} actions={videoActions} />
        </div>
        {swipeActions[1] && (
          <div>
            <div style={{ height: "10px" }}></div>
          </div>
        )}
      </ReactSwipe>
    </>
  );
};

export default SwipableVideo;
