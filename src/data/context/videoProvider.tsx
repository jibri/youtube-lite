import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { get } from "idb-keyval";
import { DEFAULT_PLAYLIST_ID, WL_KEY } from "src/utils/constants";
import { LoginContext } from "./loginProvider";
import { VideoItem } from "src/utils/types";
import { defaultHeaderComponents, playingHeaderComponents } from "src/router/path";
import { getTimeSeconds } from "src/utils/utils";
import { ConfigContext } from "src/data/context/configProvider";

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

// fetch subscription => 1 request to get 50 result
// for each batch of 50 subs => fetch Channels => 1 request to get 50 channels
// for each channel => fetch Playlistitems => 1 request to get 10 playlist item
// for each batch of 10 Playlistitems => fetch videos => 1 request to get 10 videos

// nb request (if nb subs = 50) : 1 => 1 => 50 => 50 = 102 request

interface VideoData {
  feedVideos: VideoItem[];
  wlVideos: VideoItem[];
  wlCache: VideoItem[];
  loading: number;
  videoPlaying?: VideoItem;
  descriptionOpened: boolean;
  setDescriptionOpened: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWatchList: (pageToken?: string) => void;
  fetchSubscriptions: () => void;
  deleteFromWatchlist: (playlistItemId?: string) => void;
  playVideo: (video?: VideoItem) => void;
  setPlaylistId: React.Dispatch<React.SetStateAction<string>>;
  updateWlCache: () => void;
}
const defaultData: VideoData = {
  feedVideos: [],
  wlVideos: [],
  wlCache: [],
  loading: 0,
  descriptionOpened: false,
  setDescriptionOpened: (e) => e,
  fetchWatchList: (e) => e,
  fetchSubscriptions: () => null,
  deleteFromWatchlist: (e) => e,
  playVideo: () => null,
  setPlaylistId: (e) => e,
  updateWlCache: () => null,
};

export const VideoContext = createContext<VideoData>(defaultData);

const VideoProvider = ({ children }: any) => {
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [wlVideos, setWlVideos] = useState<VideoItem[]>([]);
  const [wlCache, setWlCache] = useState<VideoItem[]>([]);
  const [playlistId, setPlaylistId] = useState<string>(DEFAULT_PLAYLIST_ID || "");
  const [videoPlaying, setVideoPlaying] = useState<VideoItem>();
  const { handleError, loading, incLoading, setHeaderComponents } = useContext(LoginContext);
  const { minDuration, maxAge } = useContext(ConfigContext);
  const [descriptionOpened, setDescriptionOpened] = useState<boolean>(false);

  const fetchVideos = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<VideoItem[]>>,
      playlistItems: gapi.client.youtube.PlaylistItem[],
      filter?: (v: gapi.client.youtube.Video) => boolean,
      sortBy?: "publishedAt"
    ) => {
      incLoading(1);
      gapi.client.youtube.videos
        .list({
          part: "snippet,contentDetails,player",
          id: playlistItems.map((i) => i.snippet?.resourceId?.videoId).join(","),
          maxResults: 50,
        })
        .then((response) => {
          const keepVideos = filter ? response.result.items?.filter(filter) : response.result.items;
          if (keepVideos) {
            setter((currentVideos) => {
              const newVideos = [...currentVideos];
              keepVideos.forEach((v) => {
                if (!newVideos.find((cv) => v.id === cv.video.id)) {
                  const videoToInsert = {
                    playlistItem:
                      playlistItems.find((i) => i.snippet?.resourceId?.videoId === v.id) || {},
                    video: v,
                  };
                  if (sortBy === "publishedAt") {
                    // idx pour lequel v est plus récente que oldV
                    const idx = newVideos.findIndex((oldV) => {
                      return (
                        (oldV.video?.snippet?.publishedAt?.localeCompare(
                          v.snippet?.publishedAt || ""
                        ) || 0) < 0
                      );
                    });
                    newVideos.splice(idx === -1 ? newVideos.length : idx, 0, videoToInsert);
                  } else {
                    newVideos.push(videoToInsert);
                  }
                }
              });
              return newVideos;
            });
          }
        }, handleError)
        .then(() => incLoading(-1));
    },
    [handleError, incLoading]
  );

  const fetchPlaylistItems = useCallback(
    (playlistId: string) => {
      return new Promise((resolve, reject) => {
        incLoading(1);
        gapi.client.youtube.playlistItems
          .list({
            part: "snippet",
            playlistId,
            maxResults: 10,
          })
          .then((response) => {
            if (response.result.items) {
              const oldestPublishedDate = new Date();
              oldestPublishedDate.setDate(oldestPublishedDate.getDate() - maxAge);
              const filter = (v: gapi.client.youtube.Video) => {
                if (wlCache.find((cachedVideo) => cachedVideo.video.id === v.id)) return false;
                if (getTimeSeconds(v.contentDetails?.duration) < minDuration) return false;
                return new Date(v.snippet?.publishedAt || "") > oldestPublishedDate;
              };
              fetchVideos(setFeedVideos, response.result.items, filter, "publishedAt");
            }
          }, handleError)
          .then(() => {
            incLoading(-1);
            resolve(true);
          });
      });
    },
    [incLoading, handleError, fetchVideos, wlCache, minDuration, maxAge]
  );

  const fetchPlaylistItemsCascade = useCallback(
    async (playlistIds: (string | undefined)[], idx: number) => {
      const id = playlistIds[idx];
      if (id) {
        await fetchPlaylistItems(id);
        fetchPlaylistItemsCascade(playlistIds, ++idx);
      }
    },
    [fetchPlaylistItems]
  );

  const fetchChannels = useCallback(
    (chanIds: string) => {
      incLoading(1);
      gapi.client.youtube.channels
        .list({
          part: "contentDetails",
          id: chanIds,
          maxResults: 50,
        })
        .then((response) => {
          const playlistIds = response.result.items?.map(
            (chan) => chan.contentDetails?.relatedPlaylists?.uploads
          );
          if (playlistIds) fetchPlaylistItemsCascade(playlistIds, 0);
        }, handleError)
        .then(() => incLoading(-1));
    },
    [handleError, incLoading, fetchPlaylistItemsCascade]
  );

  const fetchSubscriptions = useCallback(
    async (pageToken?: string) => {
      if (process.env.REACT_APP_DEV_MODE === "true") {
        const { FEED_VIDEOS } = await import("src/__mock__/feedVideos");
        incLoading(1);
        setTimeout(() => {
          incLoading(-1);
          setFeedVideos(FEED_VIDEOS);
        }, 200);
      } else {
        if (!pageToken) setFeedVideos([]);
        incLoading(1);
        gapi.client.youtube.subscriptions
          .list({
            part: "snippet",
            mine: true,
            maxResults: 50,
            pageToken: pageToken,
          })
          .then((response) => {
            const result = response.result;
            if (result.items?.length)
              fetchChannels(
                result.items.map((sub) => sub.snippet?.resourceId?.channelId).join(",")
              );
            if (result.nextPageToken) fetchSubscriptions(result.nextPageToken);
          }, handleError)
          .then(() => incLoading(-1));
      }
    },
    [incLoading, handleError, fetchChannels]
  );

  const fetchWatchList = useCallback(
    (pageToken?: string) => {
      if (!pageToken) setWlVideos([]);
      incLoading(1);
      gapi.client.youtube.playlistItems
        .list({
          part: "snippet",
          playlistId: playlistId,
          maxResults: 50,
          pageToken,
        })
        .then((response) => {
          fetchVideos(setWlVideos, response.result.items || []);
        }, handleError)
        .then(() => incLoading(-1));
    },
    [fetchVideos, handleError, incLoading, playlistId]
  );

  const deleteFromWatchlist = (playlistItemId?: string) => {
    setWlVideos((wl) => wl.filter((v) => v.playlistItem.id !== playlistItemId));
  };

  const playVideo = (video?: VideoItem) => {
    setVideoPlaying(video);
    setHeaderComponents(video ? playingHeaderComponents : defaultHeaderComponents);
  };

  const updateWlCache = useCallback(() => {
    get<VideoItem[]>(WL_KEY).then((wl) => {
      setWlCache(wl || []);
      setFeedVideos((feeds) =>
        feeds.filter((v) => !wl?.find((cached) => cached.video.id === v.video.id))
      );
    });
  }, []);

  useEffect(() => {
    updateWlCache();
    fetchWatchList();
  }, [fetchWatchList, updateWlCache]);

  const values: VideoData = {
    feedVideos,
    wlVideos,
    wlCache,
    loading,
    videoPlaying,
    descriptionOpened,
    playVideo,
    fetchWatchList,
    fetchSubscriptions,
    deleteFromWatchlist,
    setPlaylistId,
    setDescriptionOpened,
    updateWlCache,
  };

  return <VideoContext.Provider value={values}> {children} </VideoContext.Provider>;
};
export default VideoProvider;
