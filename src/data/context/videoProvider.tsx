import React, { createContext, useState, useEffect, useContext } from 'react'
import { PLAYLIST_ID } from 'src/utils/constants'
import { LoginContext } from './loginProvider'

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

interface VideoData {
  feedVideos: gapi.client.youtube.PlaylistItem[]
  wlVideos: gapi.client.youtube.PlaylistItem[]
  loading: number
  totalApiCall: number
  loadWatchList: (pageToken?: string) => void
  deleteFromWatchlist: (id?: string) => void
}
const defaultData: VideoData = {
  feedVideos: [],
  wlVideos: [],
  loading: 0,
  totalApiCall: 0,
  loadWatchList: e => e,
  deleteFromWatchlist: e => e,
}

export const VideoContext = createContext<VideoData>(defaultData)

const VideoProvider = ({ children }: any) => {
  const [feedVideos, setFeedVideos] = useState<gapi.client.youtube.PlaylistItem[]>([])
  const [wlVideos, setWlVideos] = useState<gapi.client.youtube.PlaylistItem[]>([])
  const [loading, setLoading] = useState(0)
  const [totalApiCall, setTotalApiCall] = useState(0)
  const { handleError } = useContext(LoginContext)

  useEffect(() => {
    const doIt = async () => {

      const subs = (pageToken?: string) => {
        const request = gapi.client.youtube.subscriptions.list({
          part: "snippet",
          mine: true,
          maxResults: 50,
          pageToken: pageToken,
        })
        setLoading(l => l + 1)
        setTotalApiCall(c => c + 1)
        request.execute((response) => {
          setLoading(l => l - 1)
          if (handleError(response)) return

          if (response?.items?.length) channels(response.items.map((sub) => sub.snippet?.resourceId?.channelId).join(","))
          if (response?.nextPageToken) subs(response?.nextPageToken)
        })
      }

      const channels = (chanIds: string) => {
        const request = gapi.client.youtube.channels.list({
          part: "contentDetails",
          id: chanIds,
        })
        setLoading(l => l + 1)
        setTotalApiCall(c => c + 1)
        request.execute((response) => {
          setLoading(l => l - 1)
          if (handleError(response)) return

          response.items?.forEach(chan => {
            const playlistId = chan.contentDetails?.relatedPlaylists?.uploads
            if (playlistId) playlistItems(playlistId)
          })
        })
      }

      const playlistItems = (playlistId: string) => {
        const request = gapi.client.youtube.playlistItems.list({
          part: "snippet",
          playlistId,
          maxResults: 10,
        })
        setLoading(l => l + 1)
        setTotalApiCall(c => c + 1)
        request.execute((response) => {
          setLoading(l => l - 1)
          if (handleError(response)) return

          setFeedVideos(videos => {
            const fiveDaysAgo = new Date()
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
            const keepVideos = response.items?.filter(v => new Date(v.snippet?.publishedAt || '') > fiveDaysAgo)
            return videos.concat(keepVideos || [])
          })
        })
      }

      if (process.env.REACT_APP_DEV_MODE === 'true') {
        const { FEED_VIDEOS } = await import('src/__mock__/feedVideos')
        setFeedVideos(FEED_VIDEOS)
      } else {
        subs()
      }
    }
    doIt()
  }, [handleError])

  useEffect(() => {
    feedVideos.sort((v1, v2) => v2.snippet?.publishedAt?.localeCompare(v1.snippet?.publishedAt || '') || 0)
    console.log('feedVideos', feedVideos)
  }, [feedVideos])

  const loadWatchList = async (pageToken?: string) => {
    const request = gapi.client.youtube.playlistItems.list({
      part: "snippet",
      playlistId: PLAYLIST_ID,
      pageToken,
    })
    request.execute((response) => {
      if (handleError(response)) return

      if (pageToken) setWlVideos(videos => videos.concat(response.items || []))
      else setWlVideos(response.items || [])
      if (response?.nextPageToken) loadWatchList(response.nextPageToken)
    })
  }

  const deleteFromWatchlist = (id?: string) => {
    setWlVideos(wl => wl.filter(v => v.id !== id))
  }

  const values: VideoData = {
    feedVideos,
    wlVideos,
    loading,
    totalApiCall,
    loadWatchList,
    deleteFromWatchlist,
  }

  return <VideoContext.Provider value={values} > {children} </VideoContext.Provider>
}
export default VideoProvider
