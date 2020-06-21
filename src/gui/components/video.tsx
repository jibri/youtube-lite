import React from 'react'
import styled from 'styled-components'
import { theme } from 'src/utils/theme'
import { VideoItem } from 'src/utils/types'

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
const Image = styled.img`
  flex: 0 0 110px;
`

const getTime = (duration?: string) => {
  return duration?.replace('PT', '').replace('M', ':').replace('S', '')
}

const Video = ({ video }: { video: VideoItem }) => (
  // TODO show video duration
  <VideoWrapper key={video.video.id} href={`https://www.youtube.com/watch?v=${video.video.id}`}>
    <Image
      alt="youtube thumbnail"
      src={video.video.snippet?.thumbnails?.default?.url}
      width={video.video.snippet?.thumbnails?.default?.width}
      height={video.video.snippet?.thumbnails?.default?.height}
    />
    <div>
      <Author>{video.video.snippet?.channelTitle}</Author>
      <Title>{video.video.snippet?.title}</Title>
      <div>{getTime(video.video.contentDetails?.duration)}</div>
    </div>
  </VideoWrapper>
)
export default Video