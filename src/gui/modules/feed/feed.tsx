import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import { faPlus, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video, { VisualAction } from "src/gui/components/video";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import { WlVideoWrapper } from "../watchlist/watchlist";
import ReactSwipe from "react-swipe";
import useDelayAction from "src/hooks/useDelayAction";
import Notification from "src/gui/components/notification";
import { ActionButton, Text } from "src/utils/styled";
import { ConfigContext } from "src/data/context/configProvider";
import { addDoc, collection } from "firebase/firestore";
import { db } from "src/init/firestore";
import { insertPlaylistItem, rateVideos } from "src/utils/youtubeApi";
import { useLargeScreenMq } from "src/hooks/useMq";
import SwipableVideo from "src/gui/components/SwipableVideo";

function Feed() {
  const [removing, setRemoving] = useState<string[]>([]);
  const { playlistId } = useContext(ConfigContext);
  const { feedVideos, playlistVideos } = useContext(VideoContext);
  const { userId, token, handleError, callYoutube } = useContext(LoginContext);
  const { delayedActions, delayAction, cancelAction } = useDelayAction();
  const matches = useLargeScreenMq();
  const reactSwipeEl = useRef<ReactSwipe>(null);

  const addVideoToWatchlistCache = useCallback(
    (video: VideoItem) => {
      if (userId) {
        addDoc(collection(db, "feedCache", userId, "videos"), video);
      }
    },
    [userId]
  );

  const addToWatchlist = useCallback(
    async (video: VideoItem) => {
      if (token && video.playlistItem.snippet?.resourceId) {
        setTimeout(() => setRemoving((rem) => [...rem, video.video.id!]), 100);
        if (!playlistVideos.find((plv) => plv.video.id === video.video.id)) {
          const response = await callYoutube(
            insertPlaylistItem,
            video.playlistItem.snippet?.resourceId,
            playlistId,
            token.access_token
          );
          if (!response.ok) {
            handleError(response.error);
            return;
          }
        }
        addVideoToWatchlistCache(video);
      }
    },
    [addVideoToWatchlistCache, callYoutube, handleError, playlistId, playlistVideos, token]
  );

  const deleteFromFeed = useCallback(
    (video: VideoItem) => {
      setTimeout(() => setRemoving((rem) => [...rem, video.video.id!]), 100);
      delayAction("Video supprimée", addVideoToWatchlistCache, [video]);
    },
    [addVideoToWatchlistCache, delayAction]
  );

  const likeVideo = useCallback(
    async (video: VideoItem) => {
      if (token && video.video.id) {
        const response = await callYoutube(rateVideos, video.video.id, token.access_token);
        if (!response.ok) handleError(response.error);
        reactSwipeEl.current?.prev();
      }
    },
    [callYoutube, handleError, token]
  );

  const swipeActions: [VisualAction, VisualAction] = useMemo(
    () => [
      { action: (video) => deleteFromFeed(video), actionIcon: faTrash },
      { action: (video) => likeVideo(video), actionIcon: faThumbsUp },
    ],
    [deleteFromFeed, likeVideo]
  );

  const videoActions = useMemo(() => {
    const actions: VisualAction[] = [];
    if (matches) actions.push(...swipeActions);
    actions.push({ action: (video) => addToWatchlist(video), actionIcon: faPlus });
    return actions;
  }, [addToWatchlist, matches, swipeActions]);

  return (
    <>
      {feedVideos.map((video) => (
        <WlVideoWrapper key={video.video.id} removing={removing.includes(video.video.id!)}>
          {matches ? (
            <Video video={video} actions={videoActions} />
          ) : (
            <SwipableVideo
              ref={reactSwipeEl.current}
              video={video}
              videoActions={videoActions}
              swipeActions={swipeActions}
            />
          )}
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
