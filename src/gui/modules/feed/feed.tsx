import React, { useContext } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video from "src/gui/components/video";
import { DEFAULT_PLAYLIST_ID } from "src/utils/constants";
import { VideoWrapper } from "src/utils/styled";
import { LoginContext } from "src/data/context/loginProvider";
import { VideoItem } from "src/utils/types";

function Feed() {
  const { feedVideos } = useContext(VideoContext);
  const { handleError, incLoading } = useContext(LoginContext);

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
      .then(undefined, handleError)
      .then(() => incLoading(-1));
  }

  return (
    <>
      {feedVideos.map((video) => (
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
