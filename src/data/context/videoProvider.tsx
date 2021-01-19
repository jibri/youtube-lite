import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { DEFAULT_PLAYLIST_ID } from "src/utils/constants";
import { LoginContext } from "./loginProvider";
import { VideoItem } from "src/utils/types";
import {
  defaultHeaderComponents,
  playingHeaderComponents,
} from "src/router/path";
import { get, set } from "idb-keyval";
import { differenceInDays, differenceInMinutes } from "date-fns";

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

// fetch subscription => 1 request to get 50 result
// for each batch of 50 subs => fetch Channels => 1 request to get 50 channels
// for each channel => fetch Playlistitems => 1 request to get 10 playlist item
// for each batch of 10 Playlistitems => fetch videos => 1 request to get 10 videos

// nb request (if nb subs = 50) : 1 => 1 => 50 => 50 = 102 request

interface VideoData {
  feedVideos: VideoItem[];
  wlVideos: VideoItem[];
  loading: number;
  videoPlaying?: VideoItem;
  descriptionOpened: boolean;
  setDescriptionOpened: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWatchList: (pageToken?: string) => void;
  fetchSubscriptions: () => void;
  deleteFromWatchlist: (playlistItemId?: string) => void;
  playVideo: (video?: VideoItem) => void;
  setPlaylistId: React.Dispatch<React.SetStateAction<string>>;
}
const defaultData: VideoData = {
  feedVideos: [],
  wlVideos: [],
  loading: 0,
  descriptionOpened: false,
  setDescriptionOpened: (e) => e,
  fetchWatchList: (e) => e,
  fetchSubscriptions: () => {
    /** */
  },
  deleteFromWatchlist: (e) => e,
  playVideo: () => {
    /** */
  },
  setPlaylistId: (e) => e,
};

export const VideoContext = createContext<VideoData>(defaultData);

const VideoProvider = ({ children }: any) => {
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [wlVideos, setWlVideos] = useState<VideoItem[]>([]);
  const [playlistId, setPlaylistId] = useState<string>(
    DEFAULT_PLAYLIST_ID || ""
  );
  const [videoPlaying, setVideoPlaying] = useState<VideoItem>();
  const { handleError, loading, incLoading, setHeaderComponents } = useContext(
    LoginContext
  );
  const [descriptionOpened, setDescriptionOpened] = useState<boolean>(false);

  useEffect(() => {
    if (loading === 0) {
      setFeedVideos((currentFeeds) => {
        if (currentFeeds.length > 0) {
          const newFeeds = [...currentFeeds];
          newFeeds.sort(
            (v1, v2) =>
              v2.video?.snippet?.publishedAt?.localeCompare(
                v1.video?.snippet?.publishedAt || ""
              ) || 0
          );
          // set indexedDb values and when it is sets
          set("feed", newFeeds);
          set("updateDate", new Date());
          return newFeeds;
        }
        return [];
      });
    }
  }, [loading]);

  const fetchVideos = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<VideoItem[]>>,
      playlistItems: gapi.client.youtube.PlaylistItem[],
      filter?: (v: gapi.client.youtube.Video) => boolean
    ) => {
      incLoading(1);
      gapi.client.youtube.videos
        .list({
          part: "snippet,contentDetails,player",
          id: playlistItems
            .map((i) => i.snippet?.resourceId?.videoId)
            .join(","),
          maxResults: 50,
        })
        .then((response) => {
          const keepVideos = filter
            ? response.result.items?.filter(filter)
            : response.result.items;
          if (keepVideos) {
            setter((currentVideos) => {
              const newVideos = [...currentVideos];
              keepVideos.forEach((v) => {
                if (!newVideos.find((cv) => v.id === cv.video.id)) {
                  newVideos.push({
                    playlistItem:
                      playlistItems.find(
                        (i) => i.snippet?.resourceId?.videoId === v.id
                      ) || {},
                    video: v,
                  });
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
              const fiveDaysAgo = new Date();
              fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
              const filter = (v: gapi.client.youtube.Video) => {
                return new Date(v.snippet?.publishedAt || "") > fiveDaysAgo;
              };
              fetchVideos(setFeedVideos, response.result.items, filter);
            }
          }, handleError)
          .then(() => {
            incLoading(-1);
            resolve(true);
          });
      });
    },
    [incLoading, handleError, fetchVideos]
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
                result.items
                  .map((sub) => sub.snippet?.resourceId?.channelId)
                  .join(",")
              );
            if (result.nextPageToken) fetchSubscriptions(result.nextPageToken);
          }, handleError)
          .then(() => incLoading(-1));
      }
    },
    [incLoading, fetchChannels, handleError]
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
    setHeaderComponents(
      video ? playingHeaderComponents : defaultHeaderComponents
    );
  };

  useEffect(() => {
    // we have a one day cache in idb
    get("updateDate").then((date) => {
      if (!date || differenceInDays(new Date(), date) >= 1) {
        fetchSubscriptions();
      } else {
        get("feed").then((videos) => {
          setFeedVideos(videos);
        });
      }
    });
  }, [fetchSubscriptions]);
  useEffect(() => {
    fetchWatchList();
  }, [fetchWatchList]);

  const values: VideoData = {
    feedVideos,
    wlVideos,
    loading,
    videoPlaying,
    descriptionOpened,
    playVideo,
    fetchWatchList,
    fetchSubscriptions,
    deleteFromWatchlist,
    setPlaylistId,
    setDescriptionOpened,
  };

  return (
    <VideoContext.Provider value={values}> {children} </VideoContext.Provider>
  );
};
export default VideoProvider;
