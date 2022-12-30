import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faThumbsUp, faShare } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { VideoWrapper, ActionButton, Text, Flex } from "src/utils/styled";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import ReactSwipe from "react-swipe";
import styled from "styled-components";
import useDelayAction from "src/hooks/useDelayAction";
import Notification from "src/gui/components/notification";
import { ConfigContext } from "src/data/context/configProvider";

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
export const WlVideoWrapper = styled(VideoWrapper)<{ removing: boolean }>`
  transition: max-height 0.5s ease;
  max-height: ${(props) => (props.removing ? "0" : props.theme.video.height)};
  overflow: hidden;
`;

const canShare = !!(navigator as any).share;
const largeScreenMq = window.matchMedia("(min-width: 600px)");

const useMq = (mq: MediaQueryList) => {
  const [matches, setMatches] = useState(mq.matches);

  mq.onchange = function () {
    setMatches(this.matches);
  };
  return matches;
};

function Watchlist() {
  const { handleError, incLoading } = useContext(LoginContext);
  const { wlVideos, deleteFromWatchlist } = useContext(VideoContext);
  const { playlistId } = useContext(ConfigContext);
  const [removing, setRemoving] = useState<string>();
  const { delayedActions, delayAction, cancelAction } = useDelayAction();
  const matches = useMq(largeScreenMq);

  const removeFromWatchlist = (video: VideoItem) => {
    setTimeout(() => setRemoving(video.video.id), 100);
    delayAction("Video supprimée", () => deletePlaylistItem(video));
  };

  const deletePlaylistItem = (video: VideoItem) => {
    incLoading(1);
    gapi.client.youtube.playlistItems
      .delete({
        id: video.playlistItem.id || "",
      })
      .then(() => deleteFromWatchlist(video.playlistItem.id), handleError)
      .then(() => incLoading(-1));
  };

  const likeVideo = (video: VideoItem) => {
    setTimeout(() => setRemoving(video.video.id), 100);
    delayAction("Like ajouté", () => {
      incLoading(1);
      gapi.client.youtube.videos
        .rate({
          id: video.video.id || "",
          rating: "like",
        })
        .then(undefined, handleError)
        .then(() => {
          incLoading(-1);
          deletePlaylistItem(video);
        });
    });
  };

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

  const getActions = (video: VideoItem) => {
    const actions = [];
    if (canShare) {
      actions.push({
        action: () => share(`https://www.youtube.com/watch?v=${video.video.id}`),
        actionIcon: faShare,
      });
    }

    if (matches) {
      actions.push({
        action: () => likeVideo(video),
        actionIcon: faThumbsUp,
      });
      actions.push({
        action: () => removeFromWatchlist(video),
        actionIcon: faTrash,
      });
    }
    return actions;
  };

  return (
    <>
      {wlVideos.length === 0 && (
        <Flex jc="center">
          <Text>
            {!playlistId && "Veuillez sélectionner une playlist à afficher depuis l'écran profil"}
            {!!playlistId && "Aucune vidéo dans votre playlist"}
          </Text>
        </Flex>
      )}
      {wlVideos.map((video) => (
        <WlVideoWrapper key={video.video.id} removing={removing === video.video.id}>
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
              <Video video={video} actions={getActions(video)} />
            </div>
            <div>
              <div style={{ height: "10px" }}></div>
            </div>
          </ReactSwipe>
        </WlVideoWrapper>
      ))}
      <Notification show={!!delayedActions.length}>
        <Text>{delayedActions[delayedActions.length - 1]?.label}</Text>
        <ActionButton onClick={() => cancelAction(setRemoving)}>Cancel</ActionButton>
      </Notification>
    </>
  );
}
export default Watchlist;
