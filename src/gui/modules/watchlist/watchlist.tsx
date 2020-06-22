import React, { useContext } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { VideoContext } from 'src/data/context/videoProvider'
import Video from 'src/gui/components/video'
import { VideoWrapper, ActionButton, TopButton } from 'src/utils/styled'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoItem } from 'src/utils/types'

function Watchlist() {
  const { handleError, incLoading } = useContext(LoginContext)
  const { wlVideos, fetchWatchList, deleteFromWatchlist } = useContext(VideoContext)

  const removeFromWatchlist = (video: VideoItem) => {
    incLoading(1)
    gapi.client.youtube.playlistItems.delete({
      id: video.playlistItem.id || '',
    }).then(() => deleteFromWatchlist(video.playlistItem.id), handleError)
      .then(() => incLoading(-1))
  }

  const likeVideo = (video: VideoItem) => {
    incLoading(1)
    gapi.client.youtube.videos.rate({
      id: video.video.id || '',
      rating: 'like',
    }).then(undefined, handleError)
      .then(() => incLoading(-1))
  }

  return (
    <div>
      <TopButton onClick={() => fetchWatchList()}>Reload</TopButton>
      {wlVideos.map(video => (
        <VideoWrapper key={video.video.id}>
          <Video video={video} />
          <div>
            <ActionButton onClick={e => removeFromWatchlist(video)}>
              <FontAwesomeIcon icon={faMinus} />
            </ActionButton>
            <ActionButton onClick={() => likeVideo(video)}>
              <FontAwesomeIcon icon={faThumbsUp} />
            </ActionButton>
          </div>
        </VideoWrapper>
      ))}
    </div>
  )
}
export default Watchlist
