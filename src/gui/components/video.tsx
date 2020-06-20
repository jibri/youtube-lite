import React from 'react'
import styled from 'styled-components'
import { theme } from 'src/utils/theme'

const VideoWrapper = styled.a`
  display: flex;
  width: 100%;
  text-decoration: none;
  color: ${theme.text.main};
`
const Author = styled.h6`
  font-size: 0.8em;
  color: ${theme.text.light};
  font-weight: initial;
  margin: 0;
  padding: 0;
`
const Title = styled(Author)`
  font-size: 1em;
  color: inherit;
  font-weight: bold;
`

const Video = ({ video }: { video: gapi.client.youtube.PlaylistItem }) => (
  <VideoWrapper key={video.id} href={`https://www.youtube.com/watch?v=${video.snippet?.resourceId?.videoId}`}>
    <img
      alt="youtube thumbnail"
      src={video.snippet?.thumbnails?.default?.url}
      width={video.snippet?.thumbnails?.default?.width}
      height={video.snippet?.thumbnails?.default?.height}
    />
    <div>
      <Author>{video.snippet?.channelTitle}</Author>
      <Title>{video.snippet?.title}</Title>
    </div>
  </VideoWrapper>
)
export default Video