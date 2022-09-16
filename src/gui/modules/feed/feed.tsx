import React, { useContext, useState } from "react";
import { faPlus, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { DEFAULT_PLAYLIST_ID, WL_KEY } from "src/utils/constants";
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

function Feed() {
  const [removing, setRemoving] = useState<string[]>([]);
  const { feedVideos, updateWlCache } = useContext(VideoContext);
  const { handleError, incLoading } = useContext(LoginContext);
  let reactSwipeEl: ReactSwipe | null;

  function addToWatchlist(video: VideoItem) {
    incLoading(1);
    gapi.client.youtube.playlistItems
      .insert({
        part: "snippet",
        resource: {
          snippet: {
            resourceId: video.playlistItem.snippet?.resourceId,
            playlistId: DEFAULT_PLAYLIST_ID,
          },
        },
      })
      .then(() => {
        addVideoToWatchlistCache(video);
      }, handleError)
      .then(() => incLoading(-1));
  }

  const addVideoToWatchlistCache = (video: VideoItem) => {
    setRemoving((rem) => [...rem, video.video.id!]);
    setTimeout(() => {
      update<VideoItem[]>(WL_KEY, (currentWL) => {
        const newWL = [...(currentWL || [])];
        if (!newWL?.find((cv) => video.video.id === cv.video.id)) {
          newWL.push(video);
        }
        return newWL;
      }).then(() => {
        updateWlCache();
        setRemoving((rem) => rem.filter((id) => id !== video.video.id!));
      });
    }, 500);
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
                if (idx === 0) addVideoToWatchlistCache(video);
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
    </>
  );
}

export default Feed;
