import React, { createContext, useState, useEffect, useContext } from 'react'
import { PLAYLIST_ID } from 'src/utils/constants'
import { LoginContext } from './loginProvider'
import { VideoItem } from 'src/utils/types'

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

interface VideoData {
  feedVideos: VideoItem[]
  wlVideos: VideoItem[]
  loading: number
  totalApiCall: number
  fetchWatchList: (pageToken?: string) => void
  fetchSubscriptions: () => void
  deleteFromWatchlist: (playlistItemId?: string) => void
}
const defaultData: VideoData = {
  feedVideos: [],
  wlVideos: [],
  loading: 0,
  totalApiCall: 0,
  fetchWatchList: e => e,
  fetchSubscriptions: () => {/** */ },
  deleteFromWatchlist: e => e,
}

export const VideoContext = createContext<VideoData>(defaultData)

const VideoProvider = ({ children }: any) => {
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([])
  const [wlVideos, setWlVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(0)
  const [totalApiCall, setTotalApiCall] = useState(0)
  const { handleError } = useContext(LoginContext)

  useEffect(() => {
    feedVideos.sort((v1, v2) => v2.video?.snippet?.publishedAt?.localeCompare(v1.video?.snippet?.publishedAt || '') || 0)
  }, [feedVideos])

  const fetchSubscriptions = async (pageToken?: string) => {
    if (process.env.REACT_APP_DEV_MODE === 'true') {
      const { FEED_VIDEOS } = await import('src/__mock__/feedVideos')
      setLoading(100)
      setTotalApiCall(120)

      setTimeout(() => {
        setLoading(0)
        setTotalApiCall(0)
        setFeedVideos(FEED_VIDEOS)
      }, 5000)
    } else {
      if (!pageToken) setFeedVideos([])
      setLoading(l => l + 1)
      setTotalApiCall(c => c + 1)
      gapi.client.youtube.subscriptions.list({
        part: "snippet",
        mine: true,
        maxResults: 50,
        pageToken: pageToken,
      }).then(response => {
        const result = response.result
        if (result.items?.length) fetchChannels(result.items.map((sub) => sub.snippet?.resourceId?.channelId).join(","))
        if (result.nextPageToken) fetchSubscriptions(result.nextPageToken)
      }, handleError)
        .then(() => setLoading(l => l - 1))
    }
  }

  const fetchChannels = (chanIds: string) => {
    setLoading(l => l + 1)
    setTotalApiCall(c => c + 1)
    gapi.client.youtube.channels.list({
      part: "contentDetails",
      id: chanIds,
      maxResults: 50,
    }).then(response => {
      response.result.items?.forEach(chan => {
        const playlistId = chan.contentDetails?.relatedPlaylists?.uploads
        if (playlistId) fetchPlaylistItems(playlistId)
      })
    }, handleError)
      .then(() => setLoading(l => l - 1))
  }

  const fetchPlaylistItems = (playlistId: string) => {
    setLoading(l => l + 1)
    setTotalApiCall(c => c + 1)
    gapi.client.youtube.playlistItems.list({
      part: "snippet",
      playlistId,
      maxResults: 10,
    }).then(response => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      const keepVideos = response.result.items?.filter(v => new Date(v.snippet?.publishedAt || '') > fiveDaysAgo)
      fetchVideos(setFeedVideos, keepVideos || [])
    }, handleError)
      .then(() => setLoading(l => l - 1))
  }

  const fetchVideos = (
    setter: React.Dispatch<React.SetStateAction<VideoItem[]>>,
    playlistItems: gapi.client.youtube.PlaylistItem[]
  ) => {
    gapi.client.youtube.videos.list({
      part: 'snippet,contentDetails',
      id: playlistItems.map(i => i.snippet?.resourceId?.videoId).join(','),
      maxResults: 50,
    }).then(response => {
      setter(currentVideos => {
        return currentVideos.concat(response.result.items?.map(v => ({
          playlistItem: playlistItems.find(i => i.snippet?.resourceId?.videoId === v.id) || {},
          video: v
        })) || [])
      })
    }, handleError)
  }

  const fetchWatchList = (pageToken?: string) => {
    if (!pageToken) setWlVideos([])
    gapi.client.youtube.playlistItems.list({
      part: "snippet",
      playlistId: PLAYLIST_ID,
      maxResults: 50,
      pageToken,
    }).then(response => {
      fetchVideos(setWlVideos, response.result.items || [])
    }, handleError)
  }

  const deleteFromWatchlist = (playlistItemId?: string) => {
    setWlVideos(wl => wl.filter(v => v.playlistItem.id !== playlistItemId))
  }

  const values: VideoData = {
    feedVideos,
    wlVideos,
    loading,
    totalApiCall,
    fetchWatchList,
    fetchSubscriptions,
    deleteFromWatchlist,
  }

  return <VideoContext.Provider value={values} > {children} </VideoContext.Provider>
}
export default VideoProvider
