import React, { useCallback, useContext, useEffect, useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { DEFAULT_PLAYLIST_ID, WL_KEY } from "src/utils/constants";
import { VideoWrapper } from "src/utils/styled";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";
import { get, update } from "idb-keyval";

function Feed() {
  const [wlCache, setWlCache] = useState<VideoItem[]>([]);
  const { feedVideos } = useContext(VideoContext);
  const { handleError, incLoading } = useContext(LoginContext);

  const updateWlCache = useCallback(() => {
    get<VideoItem[]>(WL_KEY).then((wl) => {
      setWlCache(wl || []);
    });
  }, []);

  useEffect(() => {
    updateWlCache();
  }, [updateWlCache]);

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
        update<VideoItem[]>(WL_KEY, (currentWL) => {
          if (!currentWL?.find((cv) => video.video.id === cv.video.id)) {
            const newWL = [...(currentWL || [])];
            newWL.push(video);
            return newWL;
          }
          return [];
        }).then(updateWlCache);
      }, handleError)
      .then(() => incLoading(-1));
  }

  return (
    <>
      {feedVideos
        .filter((video) => {
          return !wlCache.find((wlv) => wlv.video.id === video.video.id);
        })
        .map((video) => (
          <VideoWrapper key={video.video.id}>
            <Video
              video={video}
              action={() => addToWatchlist(video)}
              actionIcon={faPlus}
            />
          </VideoWrapper>
        ))}
    </>
  );
}

export default Feed;
