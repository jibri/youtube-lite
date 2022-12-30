import React, { useContext, useState } from "react";
import { faPlus, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { WL_KEY } from "src/utils/constants";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import { update } from "idb-keyval";
import {
  WlVideoWrapper,
  ActionsMask,
  DeleteActionWrapper,
  LikeActionWrapper,
  MiddleActionWrapper,
} from "../watchlist/watchlist";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSwipe from "react-swipe";
import useDelayAction from "src/hooks/useDelayAction";
import Notification from "src/gui/components/notification";
import { ActionButton, Text } from "src/utils/styled";
import { ConfigContext } from "src/data/context/configProvider";

function Feed() {
  const [removing, setRemoving] = useState<string[]>([]);
  const { playlistId } = useContext(ConfigContext);
  const { feedVideos, updateWlCache } = useContext(VideoContext);
  const { handleError, incLoading } = useContext(LoginContext);
  const { delayedActions, delayAction, cancelAction } = useDelayAction();
  let reactSwipeEl: ReactSwipe | null;

  function addToWatchlist(video: VideoItem) {
    incLoading(1);
    setTimeout(() => setRemoving((rem) => [...rem, video.video.id!]), 100);
    gapi.client.youtube.playlistItems
      .insert({
        part: "snippet",
        resource: {
          snippet: {
            resourceId: video.playlistItem.snippet?.resourceId,
            playlistId: playlistId,
          },
        },
      })
      .then(() => {
        addVideoToWatchlistCache(video);
      }, handleError)
      .then(() => incLoading(-1));
  }

  const addVideoToWatchlistCache = (video: VideoItem) => {
    update<VideoItem[]>(WL_KEY, (currentWL) => {
      const newWL = [...(currentWL || [])];
      if (!newWL?.find((cv) => video.video.id === cv.video.id)) {
        newWL.push(video);
      }
      return newWL;
    }).then(() => {
      updateWlCache();
    });
  };

  const deleteFromFeed = (video: VideoItem) => {
    setTimeout(() => setRemoving((rem) => [...rem, video.video.id!]), 100);
    delayAction("Video supprimée", addVideoToWatchlistCache, [video]);
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
        reactSwipeEl?.prev();
      });
  };

  return (
    <>
      {feedVideos.map((video) => (
        <WlVideoWrapper key={video.video.id} removing={removing.includes(video.video.id!)}>
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
            ref={(el) => (reactSwipeEl = el)}
            swipeOptions={{
              startSlide: 1,
              continuous: false,
              callback: (idx) => {
                if (idx === 0) deleteFromFeed(video);
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
                actions={[{ action: () => addToWatchlist(video), actionIcon: faPlus }]}
              />
            </div>
            <div>
              <div style={{ height: "10px" }}></div>
            </div>
          </ReactSwipe>
        </WlVideoWrapper>
      ))}
      <Notification show={!!delayedActions.length}>
        <Text>{delayedActions[delayedActions.length - 1]?.label}</Text>
        <ActionButton onClick={() => cancelAction(() => setRemoving((ids) => ids.slice(0, -1)))}>
          Cancel
        </ActionButton>
      </Notification>
    </>
  );
}

export default Feed;
