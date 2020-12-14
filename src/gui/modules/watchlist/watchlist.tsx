import React, { useContext } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faThumbsUp, faShare } from '@fortawesome/free-solid-svg-icons'
import { VideoContext } from 'src/data/context/videoProvider'
import Video from 'src/gui/components/video'
import { VideoWrapper, ActionButton } from 'src/utils/styled'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoItem } from 'src/utils/types'

function Watchlist() {
  const { handleError, incLoading } = useContext(LoginContext)
  const { wlVideos, deleteFromWatchlist } = useContext(VideoContext)

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
      .then(() => {
        incLoading(-1)
        removeFromWatchlist(video)
      })
  }
  const share = (url: string) => {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'Share video with...',
        url
      }).then(() => {
        console.log('Thanks for sharing !');
      }).catch(console.error);
    } else {
      // fallback
    }
  }

  return (
    <>
      {wlVideos.map(video => (
        <VideoWrapper key={video.video.id}>
          <Video video={video} />
          {(navigator as any).share && (
            <div>
              <ActionButton onClick={e => share(`https://www.youtube.com/watch?v=${video.video.id}`)} height="100%">
                <FontAwesomeIcon icon={faShare} />
              </ActionButton>
            </div>
          )}
          <div>
            <ActionButton onClick={e => removeFromWatchlist(video)} height="50%">
              <FontAwesomeIcon icon={faTrash} />
            </ActionButton>
            <ActionButton onClick={() => likeVideo(video)} height="50%">
              <FontAwesomeIcon icon={faThumbsUp} />
            </ActionButton>
          </div>
        </VideoWrapper>
      ))}
    </>
  )
}
export default Watchlist
