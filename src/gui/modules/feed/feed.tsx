import React, { useContext } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { VideoContext } from 'src/data/context/videoProvider'
import Video from 'src/gui/components/video'
import { PLAYLIST_ID } from 'src/utils/constants'
import { VideoWrapper, ActionButton, TopButton } from 'src/utils/styled'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoItem } from 'src/utils/types'

function Feed() {
  const { feedVideos, fetchSubscriptions } = useContext(VideoContext)
  const { handleError, incLoading } = useContext(LoginContext)

  function addToWatchlist(video: VideoItem) {
    incLoading(1)
    gapi.client.youtube.playlistItems.insert({
      part: "snippet",
      resource: {
        snippet: {
          resourceId: video.playlistItem.snippet?.resourceId,
          playlistId: PLAYLIST_ID
        }
      }
    }).then(undefined, handleError)
      .then(() => incLoading(-1))
  }

  return (
    <div>
      <TopButton onClick={() => fetchSubscriptions()}>Reload</TopButton>
      {feedVideos.map(video => (
        <VideoWrapper key={video.video.id}>
          <Video video={video} />
          <ActionButton onClick={e => addToWatchlist(video)}>
            <FontAwesomeIcon icon={faPlus} />
          </ActionButton>
        </VideoWrapper>
      ))}
    </div>
  )
}

export default Feed
