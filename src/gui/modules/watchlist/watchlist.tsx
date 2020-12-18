import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faThumbsUp,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { VideoWrapper } from "src/utils/styled";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import ReactSwipe from "react-swipe";
import styled from "styled-components";

const ActionsMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  div {
    font-size: 4em;
    flex: 1 1 33%;
    color: #00000055;
    padding: 0 15px;
  }
`;
const MiddleActionWrapper = styled.div`
  background-image: linear-gradient(to right, #ff5050, #5050ff);
`;

const DeleteActionWrapper = styled.div`
  background-color: #ff5050;
`;
const LikeActionWrapper = styled.div`
  text-align: right;
  background-color: #5050ff;
`;
const WlVideoWrapper = styled(VideoWrapper)<{ removing: boolean }>`
  transition: max-height 2s ease;
  max-height: ${(props) => (props.removing ? "0" : props.theme.video.height)};
`;

function Watchlist() {
  const { handleError, incLoading } = useContext(LoginContext);
  const { wlVideos, deleteFromWatchlist } = useContext(VideoContext);
  const [removing, setRemoving] = useState<string>();

  const removeFromWatchlist = (video: VideoItem) => {
    setRemoving(video.video.id);
    incLoading(1);
    gapi.client.youtube.playlistItems
      .delete({
        id: video.playlistItem.id || "",
      })
      .then(() => deleteFromWatchlist(video.playlistItem.id), handleError)
      .then(() => incLoading(-1));
  };

  const likeVideo = (video: VideoItem) => {
    incLoading(1);
    gapi.client.youtube.videos
      .rate({
        id: video.video.id || "",
        rating: "like",
      })
      .then(undefined, handleError)
      .then(() => {
        incLoading(-1);
        removeFromWatchlist(video);
      });
  };
  const canShare = !!(navigator as any).share;
  const share = (url: string) => {
    if ((navigator as any).share) {
      (navigator as any)
        .share({
          title: "Share video with...",
          url,
        })
        .then(() => {
          console.log("Thanks for sharing !");
        })
        .catch(console.error);
    } else {
      // fallback
    }
  };

  return (
    <>
      {wlVideos.map((video) => (
        <WlVideoWrapper
          key={video.video.id}
          removing={removing === video.video.id}
        >
          <ActionsMask>
            <DeleteActionWrapper>
              <FontAwesomeIcon icon={faTrash} />
            </DeleteActionWrapper>
            <MiddleActionWrapper />
            <LikeActionWrapper>
              <FontAwesomeIcon icon={faThumbsUp} />
            </LikeActionWrapper>
          </ActionsMask>
          <ReactSwipe
            swipeOptions={{
              startSlide: 1,
              continuous: false,
              callback: (idx) => {
                if (idx === 0) removeFromWatchlist(video);
                if (idx === 2) likeVideo(video);
              },
            }}
          >
            <div>
              <div style={{ height: "10px" }}></div>
            </div>
            <div>
              <Video
                video={video}
                action={() =>
                  share(`https://www.youtube.com/watch?v=${video.video.id}`)
                }
                actionIcon={canShare ? faShare : undefined}
              />
            </div>
            <div>
              <div style={{ height: "10px" }}></div>
            </div>
          </ReactSwipe>
        </WlVideoWrapper>
      ))}
    </>
  );
}
export default Watchlist;

// {/* {(navigator as any).share && (
//             <div>
//               <ActionButton onClick={e => share(`https://www.youtube.com/watch?v=${video.video.id}`)} height="100%">
//                 <FontAwesomeIcon icon={faShare} />
//               </ActionButton>
//             </div>
//           )} */}
// {/* <div>
//             <ActionButton onClick={e => removeFromWatchlist(video)} height="50%">
//               <FontAwesomeIcon icon={faTrash} />
//             </ActionButton>
//             <ActionButton onClick={() => likeVideo(video)} height="50%">
//               <FontAwesomeIcon icon={faThumbsUp} />
//             </ActionButton>
//           </div> */}
