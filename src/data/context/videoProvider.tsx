import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { LoginContext } from "./loginProvider";
import { PlaylistConfig, VideoItem } from "src/utils/types";
import { getMostPresent, getTimeSeconds } from "src/utils/utils";
import { ConfigContext } from "src/data/context/configProvider";
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import {
  listChannels,
  listPlaylistItems,
  listSubscriptions,
  listVideos,
} from "src/utils/youtubeApi";
import { token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import { useFirebase } from "src/hooks/useFirebase";
import { uniq } from "lodash";
import usePlaylists from "src/hooks/usePlaylists";

// https://stackoverflow.com/questions/19640796/retrieving-all-the-new-subscription-videos-in-youtube-v3-api

// fetch subscription => 1 request to get 50 result
// for each batch of 50 subs => fetch Channels => 1 request to get 50 channels
// for each channel => fetch Playlistitems => 1 request to get 10 playlist item
// for each batch of 10 Playlistitems => fetch videos => 1 request to get 10 videos

// nb request (if nb subs = 50) : 1 => 1 => 50 => 50 = 102 request

interface VideoData {
  feedVideos: VideoItem[];
  playlistVideos: VideoItem[];
  videoPlaying?: VideoItem;
  descriptionOpened: boolean;
  setDescriptionOpened: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWatchList: (pageToken?: string) => void;
  fetchSubscriptions: () => void;
  deleteFromWatchlist: (playlistItemId?: string) => void;
  playVideo: (video?: VideoItem) => void;
  nextVideo: () => void;
  prevVideo: () => void;
}
const defaultData: VideoData = {
  feedVideos: [],
  playlistVideos: [],
  descriptionOpened: false,
  setDescriptionOpened: (e) => e,
  fetchWatchList: (e) => e,
  fetchSubscriptions: () => null,
  deleteFromWatchlist: (e) => e,
  playVideo: () => null,
  nextVideo: () => null,
  prevVideo: () => null,
};

export const VideoContext = createContext<VideoData>(defaultData);

const VideoProvider = ({ children }: React.PropsWithChildren) => {
  const [feedVideos, setFeedVideos] = useState<VideoItem[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<VideoItem[]>([]);
  const [feedCache, setFeedCache] = useState<VideoItem[]>([]);
  const [videoPlaying, setVideoPlaying] = useState<VideoItem>();
  const [playedVideosIdx, setPlayedVideosIdx] = useState<number[]>([]);
  const { userId } = useContext(LoginContext);
  const handleError = useContext(ErrorUpdaterContext);
  const { minDuration, maxAge, playlistId } = useContext(ConfigContext);
  const [descriptionOpened, setDescriptionOpened] = useState<boolean>(false);
  const callYoutube = useYoutubeService();
  const fb = useFirebase();
  const playlists = usePlaylists();

  useEffect(() => {
    if (videoPlaying?.video.id)
      document
        .getElementById(videoPlaying.video.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const fetchVideos = useCallback(
    async (playlistItems: youtube.PlaylistItem[]) => {
      if (!token) return;
      const response = await callYoutube(listVideos, playlistItems, token.access_token);
      if (!response.ok) return handleError(response.status, response.error);
      return response.data.items;
    },
    [callYoutube, handleError],
  );

  const fetchPlaylistItems = useCallback(
    async (idPlaylist: string) => {
      if (!token) return;
      const response = await callYoutube(listPlaylistItems, idPlaylist, 10, token.access_token);
      if (!response.ok) return handleError(response.status, response.error);

      const { items } = response.data;
      if (!items) return;

      // On commence par filtrer les video du cache pour pas aller les fetch inutilement
      const itemsToFetch = items.filter((item) => {
        return !feedCache.find(
          (cachedVideo) => cachedVideo.video.id === item.snippet?.resourceId?.videoId,
        );
      });

      const videos = await fetchVideos(itemsToFetch);
      if (!videos) return;

      const oldestPublishedDate = new Date();
      oldestPublishedDate.setDate(oldestPublishedDate.getDate() - maxAge);
      const videosToAdd = videos
        // Durée minimum (on ne veux pas les shorts)
        .filter((v) => getTimeSeconds(v.contentDetails?.duration) >= minDuration)
        // Date max (on veut seulement les plus récentes)
        .filter((v) => new Date(v.snippet?.publishedAt || "") > oldestPublishedDate)
        .map((v) => ({
          playlistItem: itemsToFetch.find((i) => i.snippet?.resourceId?.videoId === v.id) || {},
          video: v,
        }));

      // Insertion des videos récupérées dans le state des videos feed
      setFeedVideos((currentVideos) => {
        const newVideos = [...currentVideos];
        newVideos.push(...videosToAdd);
        newVideos.sort(
          (v1, v2) =>
            v2.video?.snippet?.publishedAt?.localeCompare(v1.video?.snippet?.publishedAt || "") ||
            0,
        );
        return newVideos;
      });
    },
    [callYoutube, handleError, maxAge, fetchVideos, feedCache, minDuration],
  );

  const fetchChannels = useCallback(
    async (chanIds: string) => {
      if (!token) return;
      const response = await callYoutube(listChannels, chanIds, token.access_token);
      if (!response.ok) return handleError(response.status, response.error);

      const channels = response.data;
      channels.items
        ?.map((chan) => chan.contentDetails?.relatedPlaylists?.uploads)
        ?.filter((id): id is string => !!id)
        .forEach(async (id) => {
          fetchPlaylistItems(id);
        });
    },
    [callYoutube, handleError, fetchPlaylistItems],
  );

  const fetchSubscriptions = useCallback(async () => {
    if (import.meta.env.VITE_DEV_MODE === "true") {
      const { FEED_VIDEOS } = await import("src/__mock__/feedVideos");
      setFeedVideos(FEED_VIDEOS);
    } else {
      if (!token) return;
      let pageToken: string | undefined;
      setFeedVideos([]);
      do {
        const response = await callYoutube(listSubscriptions, token.access_token, pageToken);
        if (!response.ok) return handleError(response.status, response.error);

        const { items, nextPageToken } = response.data;
        if (items?.length) {
          fetchChannels(items.map((sub) => sub.snippet?.resourceId?.channelId).join(","));
        }
        pageToken = nextPageToken;
      } while (pageToken);
    }
  }, [callYoutube, handleError, fetchChannels]);

  const fetchWatchList = useCallback(async () => {
    if (!playlistId || !token) {
      return;
    }
    // Token de la page suivante. on va récupérer les videos tant qu'il n'est pas vide
    let pageToken: string | undefined;
    // Va contenir toutes les videos récupérées (pages par pages), et sera ajouté au state en une fois
    setPlaylistVideos([]);
    do {
      const response = await callYoutube(
        listPlaylistItems,
        playlistId,
        50,
        token.access_token,
        pageToken,
      );
      if (!response.ok) return handleError(response.status, response.error);

      const { items, nextPageToken } = response.data;
      const videos = await fetchVideos(items || []);
      if (videos) {
        const videosToAdd = videos.map((v) => ({
          playlistItem: items.find((i) => i.snippet?.resourceId?.videoId === v.id) || {},
          video: v,
        }));
        setPlaylistVideos((oldList) => {
          return [...oldList, ...videosToAdd];
        });
        // maj de la playlist firestore avec le nom de l'artiste
        if (userId && fb) {
          fb.updateDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlistId), {
            artists: fb.arrayUnion(
              getMostPresent(videosToAdd.map((v) => v.video.snippet?.channelTitle || "")),
            ),
          } as Record<keyof PlaylistConfig, unknown>);
        }
      }
      pageToken = nextPageToken;
    } while (pageToken);
  }, [callYoutube, fb, fetchVideos, handleError, playlistId, userId]);

  const deleteFromWatchlist = (playlistItemId?: string) => {
    setPlaylistVideos((playlist) => playlist.filter((v) => v.playlistItem.id !== playlistItemId));
  };

  const playVideo = useCallback(
    (video?: VideoItem) => {
      setPlayedVideosIdx(
        video?.video.id
          ? (old) => {
              const idx = playlistVideos.findIndex((pl) => pl.video.id === video.video.id);
              if (old.length >= playlistVideos.length) return [];
              return uniq([...old, idx]);
            }
          : [],
      );
      setVideoPlaying(video);
      setDescriptionOpened(false);
    },
    [playlistVideos],
  );
  const nextVideo = useCallback(() => {
    const currentPlaylist = playlistId ? playlists.find((pl) => pl.id === playlistId) : undefined;
    if (videoPlaying && currentPlaylist?.autoplay) {
      const vidNumber = playlistVideos.findIndex((pl) => pl.video.id === videoPlaying.video.id);

      // console.log("vidNumber", vidNumber);
      // console.log("playedVids.length", playedVideosIdx.length);
      // console.log("playlistVideos.length", playlistVideos.length);
      // console.log("currentPlaylist.loop", currentPlaylist.loop);

      // On s'arrete la si c'est la fin de la playlist
      if (playedVideosIdx.length >= playlistVideos.length && !currentPlaylist.loop) return;

      // On calcul le prochain index à jouer
      let next = vidNumber + 1;
      // console.log("currentPlaylist.random", currentPlaylist.random);
      if (currentPlaylist.random) {
        next = Math.floor(Math.random() * playlistVideos.length);
        // console.log("next random", next);
        // console.log("playedVideosIdx", playedVideosIdx);
        let iterations = 0;
        while (playedVideosIdx.includes(next % playlistVideos.length)) {
          next++;
          // Au cas ou pour eviter une ininite loop
          if (++iterations > playlistVideos.length) break;
        }
        // console.log("next after iterations", next);
        // console.log("nb iterations", iterations);
      }
      // console.log("idx next %", next % playlistVideos.length);
      // Modulo pour repasser à zéro si on dépasse
      playVideo(playlistVideos[next % playlistVideos.length]);
    }
  }, [playlistId, playlists, playVideo, playedVideosIdx, playlistVideos, videoPlaying]);

  const prevVideo = useCallback(() => {
    const lastId = playlistVideos[playedVideosIdx[playedVideosIdx.length - 2]];
    if (lastId) {
      playVideo(lastId);
      setPlayedVideosIdx((old) => old.slice(0, old.length - 1));
    }
  }, [playVideo, playedVideosIdx, playlistVideos]);

  useEffect(() => {
    if (userId && fb) {
      const searchMaxDate = new Date();
      searchMaxDate.setDate(new Date().getDate() - maxAge);
      return fb.onSnapshot(
        fb
          .query(
            fb.collection(fb.db, "feedCache", userId, "videos"),
            fb.where("playlistItem.snippet.publishedAt", ">", searchMaxDate.toISOString()),
          )
          .withConverter({
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
          setFeedCache((oldCache) => [...oldCache, ...addedVideos]);
        },
      );
    }
  }, [userId, maxAge, fb]);

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
    videoPlaying,
    descriptionOpened,
    playVideo,
    nextVideo,
    prevVideo,
    fetchWatchList,
    fetchSubscriptions,
    deleteFromWatchlist,
    setDescriptionOpened,
  };

  return <VideoContext.Provider value={values}> {children} </VideoContext.Provider>;
};
export default VideoProvider;
