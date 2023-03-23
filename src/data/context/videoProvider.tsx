import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { LoginContext } from "./loginProvider";
import { VideoItem } from "src/utils/types";
import { getTimeSeconds } from "src/utils/utils";
import { ConfigContext } from "src/data/context/configProvider";
import {
  collection,
  DocumentData,
  onSnapshot,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { db } from "src/init/firestore";
import {
  listChannels,
  listPlaylistItems,
  listSubscriptions,
  listVideos,
} from "src/utils/youtubeApi";

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

// fetch subscription => 1 request to get 50 result
// for each batch of 50 subs => fetch Channels => 1 request to get 50 channels
// for each channel => fetch Playlistitems => 1 request to get 10 playlist item
// for each batch of 10 Playlistitems => fetch videos => 1 request to get 10 videos

// nb request (if nb subs = 50) : 1 => 1 => 50 => 50 = 102 request

interface VideoData {
  feedVideos: VideoItem[];
  playlistVideos: VideoItem[];
  loading: number;
  videoPlaying?: VideoItem;
  descriptionOpened: boolean;
  setDescriptionOpened: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWatchList: (pageToken?: string) => void;
  fetchSubscriptions: () => void;
  deleteFromWatchlist: (playlistItemId?: string) => void;
  playVideo: (video?: VideoItem) => void;
}
const defaultData: VideoData = {
  feedVideos: [],
  playlistVideos: [],
  loading: 0,
  descriptionOpened: false,
  setDescriptionOpened: (e) => e,
  fetchWatchList: (e) => e,
  fetchSubscriptions: () => null,
  deleteFromWatchlist: (e) => e,
  playVideo: () => null,
};

export const VideoContext = createContext<VideoData>(defaultData);

const VideoProvider = ({ children }: any) => {
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<VideoItem[]>([]);
  const [feedCache, setFeedCache] = useState<VideoItem[]>([]);
  const [videoPlaying, setVideoPlaying] = useState<VideoItem>();
  const { userId, token, handleError, loading, incLoading, callYoutube } = useContext(LoginContext);
  const { minDuration, maxAge, playlistId } = useContext(ConfigContext);
  const [descriptionOpened, setDescriptionOpened] = useState<boolean>(false);

  const fetchVideos = useCallback(
    async (
      setter: React.Dispatch<React.SetStateAction<VideoItem[]>>,
      playlistItems: gapi.client.youtube.PlaylistItem[],
      filter?: (v: gapi.client.youtube.Video) => boolean,
      sortBy?: "publishedAt"
    ) => {
      if (!token) return;
      incLoading(1);
      const response = await callYoutube(listVideos, playlistItems, token.access_token);
      incLoading(-1);
      if (!response.ok) {
        handleError(response.error);
      } else {
        const videos = response.data;
        const keepVideos = filter ? videos.items?.filter(filter) : videos.items;
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
      }
    },
    [callYoutube, handleError, incLoading, token]
  );

  const fetchPlaylistItems = useCallback(
    async (idPlaylist: string) => {
      if (!token) return;
      incLoading(1);
      const response = await callYoutube(listPlaylistItems, idPlaylist, 10, token.access_token);
      incLoading(-1);
      if (!response.ok) {
        handleError(response.error);
      } else {
        const playlistItems = response.data;
        if (playlistItems.items) {
          const oldestPublishedDate = new Date();
          oldestPublishedDate.setDate(oldestPublishedDate.getDate() - maxAge);
          const filter = (v: gapi.client.youtube.Video) => {
            if (feedCache.find((cachedVideo) => cachedVideo.video.id === v.id)) {
              return false;
            }
            if (getTimeSeconds(v.contentDetails?.duration) < minDuration) {
              return false;
            }
            return new Date(v.snippet?.publishedAt || "") > oldestPublishedDate;
          };
          fetchVideos(setFeedVideos, playlistItems.items, filter, "publishedAt");
        }
      }
    },
    [token, incLoading, callYoutube, handleError, maxAge, fetchVideos, feedCache, minDuration]
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
    async (chanIds: string) => {
      if (!token) return;
      incLoading(1);
      const response = await callYoutube(listChannels, chanIds, token.access_token);
      incLoading(-1);
      if (!response.ok) {
        handleError(response.error);
      } else {
        const channels = response.data;
        const playlistIds = channels.items?.map(
          (chan) => chan.contentDetails?.relatedPlaylists?.uploads
        );
        // FIXME pourquoi pas un foreach ici ?
        if (playlistIds) fetchPlaylistItemsCascade(playlistIds, 0);
      }
    },
    [token, incLoading, callYoutube, handleError, fetchPlaylistItemsCascade]
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
        if (!token) return;
        if (!pageToken) setFeedVideos([]);
        incLoading(1);
        const response = await listSubscriptions(token.access_token, pageToken);
        incLoading(-1);
        if (!response.ok) {
          handleError(response.error);
        } else {
          const subs = response.data;
          if (subs.items?.length) {
            fetchChannels(subs.items.map((sub) => sub.snippet?.resourceId?.channelId).join(","));
          }
          if (subs.nextPageToken) fetchSubscriptions(subs.nextPageToken);
        }
      }
    },
    [incLoading, handleError, fetchChannels, token]
  );

  const fetchWatchList = useCallback(
    async (pageToken?: string) => {
      if (!playlistId || !token) {
        setPlaylistVideos([]);
        return;
      }
      if (!pageToken) setPlaylistVideos([]);
      incLoading(1);
      const response = await callYoutube(
        listPlaylistItems,
        playlistId,
        50,
        token.access_token,
        pageToken
      );
      incLoading(-1);
      if (!response.ok) {
        handleError(response.error);
      } else {
        const videos = response.data;
        fetchVideos(setPlaylistVideos, videos.items || []);
        if (videos.nextPageToken) fetchWatchList(videos.nextPageToken);
      }
    },
    [callYoutube, fetchVideos, handleError, incLoading, playlistId, token]
  );

  const deleteFromWatchlist = (playlistItemId?: string) => {
    setPlaylistVideos((playlist) => playlist.filter((v) => v.playlistItem.id !== playlistItemId));
  };

  const playVideo = (video?: VideoItem) => {
    setVideoPlaying(video);
  };

  useEffect(() => {
    if (userId) {
      return onSnapshot(
        // FIXME ajouter une query sur la date pour pas tout remonter inutilement
        collection(db, "feedCache", userId, "videos").withConverter({
          toFirestore(video: VideoItem): DocumentData {
            return video;
          },
          fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VideoItem {
            return snapshot.data(options) as VideoItem;
          },
        }),
        (querySnapshot) => {
          const addedVideos: VideoItem[] = [];
          querySnapshot.docChanges().forEach((videoDoc) => {
            // We deal only with added videos
            if (videoDoc.type === "added") addedVideos.push(videoDoc.doc.data());
          });
          // add new videos to the local cache liste
          setFeedCache((oldCache) => {
            let newCache = [...oldCache];
            newCache.push(...addedVideos);
            return newCache;
          });
        }
      );
    }
  }, [userId]);

  useEffect(() => {
    // filter the cachedVideo from the local feed list
    setFeedVideos((oldFeed) => {
      let newFeed = [...oldFeed];
      const cachedVideoIds = feedCache.map((cachedVideo) => cachedVideo.video.id);
      newFeed = newFeed.filter((feedVideo) => !cachedVideoIds.includes(feedVideo.video.id));
      return newFeed;
    });
  }, [feedCache]);

  useEffect(() => {
    fetchWatchList();
  }, [fetchWatchList]);

  const values: VideoData = {
    feedVideos,
    playlistVideos,
    loading,
    videoPlaying,
    descriptionOpened,
    playVideo,
    fetchWatchList,
    fetchSubscriptions,
    deleteFromWatchlist,
    setDescriptionOpened,
  };

  return <VideoContext.Provider value={values}> {children} </VideoContext.Provider>;
};
export default VideoProvider;
