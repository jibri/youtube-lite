import React, { useContext } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { VideoContext } from 'src/data/context/videoProvider'
import Video from 'src/gui/components/video'
import { PLAYLIST_ID } from 'src/utils/constants'
import { Flex, Loader, VideoWrapper, ActionButton } from 'src/utils/styled'
import { LoginContext } from 'src/data/context/loginProvider'

function Feed() {
  const { feedVideos, loading, totalApiCall } = useContext(VideoContext)
  const { handleError } = useContext(LoginContext)

  function addToWatchlist(video: gapi.client.youtube.PlaylistItem) {
    gapi.client.youtube.playlistItems.insert({
      part: "snippet",
      resource: {
        snippet: {
          resourceId: video.snippet?.resourceId,
          playlistId: PLAYLIST_ID
        }
      }
    }).then(undefined, handleError)
  }

  return (
    <div>
      <Flex>
        {loading > 0 ? <Loader /> : 'Ok'}
        <div>{`${loading}/${totalApiCall} => ${feedVideos.length}`}</div>
      </Flex>
      {feedVideos.map(video => (
        <VideoWrapper key={video.id}>
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
