import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { faPlus, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video, { VisualAction } from "src/gui/components/video";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import { WlVideoWrapper } from "../watchlist/watchlist";
import ReactSwipe from "react-swipe";
import useDelayAction from "src/hooks/useDelayAction";
import Notification from "src/gui/components/notification";
import { ActionButton, Flex, Text } from "src/utils/styled";
import { ConfigContext } from "src/data/context/configProvider";
import { insertPlaylistItem, rateVideos } from "src/utils/youtubeApi";
import { useLargeScreenMq } from "src/hooks/useMq";
import SwipableVideo from "src/gui/components/SwipableVideo";
import { token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import { useFirebase } from "src/hooks/useFirebase";

function Feed() {
  const [removing, setRemoving] = useState<string[]>([]);
  const { playlistId, useSwipe } = useContext(ConfigContext);
  const { feedVideos, playlistVideos } = useContext(VideoContext);
  const { userId } = useContext(LoginContext);
  const handleError = useContext(ErrorUpdaterContext);
  const { delayedActions, delayAction, cancelAction } = useDelayAction();
  const matchesLageScreen = useLargeScreenMq();
  const reactSwipeEl = useRef<ReactSwipe>(null);
  const callYoutube = useYoutubeService();
  const fb = useFirebase();

  const shouldNotSwipe = !useSwipe || matchesLageScreen;

  const addVideoToWatchlistCache = useCallback(
    (video: VideoItem) => {
      if (userId && fb) {
        fb.addDoc(fb.collection(fb.db, "feedCache", userId, "videos"), video);
      }
    },
    [userId, fb],
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
            token.access_token,
          );
          if (!response.ok) {
            const message =
              response.status === 403
                ? "You cannot add video to the current playlist. The current playlist must belong to your channel if you want to add videos."
                : response.error;
            handleError(response.status, message);
            return;
          }
        }
        addVideoToWatchlistCache(video);
      }
    },
    [addVideoToWatchlistCache, callYoutube, handleError, playlistId, playlistVideos],
  );

  const deleteFromFeed = useCallback(
    (video: VideoItem) => {
      setTimeout(() => setRemoving((rem) => [...rem, video.video.id!]), 100);
      delayAction("Video supprimée", () => addVideoToWatchlistCache(video));
    },
    [addVideoToWatchlistCache, delayAction],
  );

  const likeVideo = useCallback(
    async (video: VideoItem) => {
      if (token && video.video.id) {
        const response = await callYoutube(rateVideos, video.video.id, token.access_token);
        if (!response.ok) handleError(response.status, response.error);
        reactSwipeEl.current?.prev();
      }
    },
    [callYoutube, handleError],
  );

  const swipeActions: [VisualAction, VisualAction] = useMemo(
    () => [
      { action: (video) => deleteFromFeed(video), actionIcon: faTrash },
      { action: (video) => likeVideo(video), actionIcon: faThumbsUp },
    ],
    [deleteFromFeed, likeVideo],
  );

  const videoActions = useMemo(() => {
    const actions: VisualAction[] = [];
    if (shouldNotSwipe) actions.push(...swipeActions);
    actions.push({ action: (video) => addToWatchlist(video), actionIcon: faPlus });
    return actions;
  }, [addToWatchlist, shouldNotSwipe, swipeActions]);

  return (
    <>
      {feedVideos.length === 0 && (
        <Flex jc="center">
          <Text>Aucune vidéo dans votre feed.</Text>
        </Flex>
      )}
      {feedVideos.map((video) => (
        <WlVideoWrapper key={video.video.id} $removing={removing.includes(video.video.id!)}>
          {shouldNotSwipe ? (
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
