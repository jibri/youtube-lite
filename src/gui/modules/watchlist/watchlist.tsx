import React, { useContext } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus } from '@fortawesome/free-solid-svg-icons'
import { VideoContext } from 'src/data/context/videoProvider'
import Video from 'src/gui/components/video'
import { VideoWrapper, ActionButton, Button } from 'src/utils/styled'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoItem } from 'src/utils/types'

function Watchlist() {
  const { handleError } = useContext(LoginContext)
  const { wlVideos, fetchWatchList, deleteFromWatchlist } = useContext(VideoContext)

  const removeFromWatchlist = (video: VideoItem) => {
    gapi.client.youtube.playlistItems.delete({
      id: video.playlistItem.id || '',
    }).then(() => deleteFromWatchlist(video.playlistItem.id), handleError)
  }

  return (
    <div>
      <Button onClick={() => fetchWatchList()}>Reload</Button>
      {wlVideos.map(video => (
        <VideoWrapper key={video.video.id}>
          <Video video={video} />
          <ActionButton onClick={e => removeFromWatchlist(video)}>
            <FontAwesomeIcon icon={faMinus} />
          </ActionButton>
        </VideoWrapper>
      ))}
    </div>
  )
}
export default Watchlist
