import { API_KEY } from "src/utils/constants";

const YOUTUBE_API = "https://youtube.googleapis.com/youtube/v3/";

type primitive = undefined | null | string | boolean | number;

const filterByFields = import.meta.env.VITE_YOUTUBE_API_FILTER_BY_FIELDS === "true";
export const buildQueryString = (params: Record<string, primitive | primitive[]>) => {
  const reducer = (queryString: string, key: string) => {
    const start = queryString ? `${queryString}&` : "?";
    const value = params[key] === undefined || params[key] === null ? undefined : params[key];
    return value ? `${start}${key}=${value}` : queryString;
  };
  return Object.keys(params).reduce((queryString, key) => {
    switch (key) {
      case "fields":
        if (filterByFields) return reducer(queryString, key);
        return queryString;
      default:
        return reducer(queryString, key);
    }
  }, "");
};

type Success<T> = {
  ok: true;
  data: T;
};
type Error = {
  ok: false;
  error: string;
};
export type ResponseYoutube<T> = (Success<T> | Error) & {
  status: number;
};

const ytbFetch = async <T>(
  service: string,
  params: Record<string, unknown>,
  body: Record<string, unknown> | undefined,
  accessToken: string,
  pageToken?: string,
  method: "GET" | "POST" | "DELETE" = "GET",
): Promise<ResponseYoutube<T>> => {
  const response = await fetch(
    `${YOUTUBE_API}${service}${buildQueryString({
      ...params,
      key: API_KEY,
      pageToken,
    })}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (response.ok)
    return {
      status: response.status,
      ok: true,
      data: response.status === 204 ? undefined : await response.json(),
    };
  const error = await response.json();
  console.log("Erreur sur l'appel api : ", service, params, response, error);
  return {
    status: response.status,
    ok: false,
    error: isYoutubeError(error)
      ? `${error.error.code} - ${error.error.status} : ${error.error.errors
          .map((e) => e.message)
          .join(" ; ")} / ${error.error.message}`
      : error,
  };
};

type YoutubeError = {
  error: {
    message: string;
    code: number;
    status: string;
    errors: {
      message: string;
    }[];
  };
};
const isYoutubeError = (error: YoutubeError): error is YoutubeError => {
  return !!error?.error?.errors;
};

export const listSubscriptions = async (
  accessToken: string,
  pageToken?: string,
): Promise<
  ResponseYoutube<{
    items: youtube.Subscription[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "subscriptions",
    {
      part: "snippet",
      fields: "items(snippet(resourceId(channelId))),nextPageToken,etag",
      maxResults: 50,
      mine: true,
    },
    undefined,
    accessToken,
    pageToken,
  );
};

export const listMyPlaylists = async (
  ids: string[],
  accessToken: string,
  pageToken?: string,
): Promise<
  ResponseYoutube<{
    items: youtube.Playlist[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "playlists",
    {
      part: ["snippet"],
      fields: "items(id,snippet(title)),nextPageToken,etag",
      maxResults: 50,
      mine: !ids.length,
      id: ids.length ? ids : undefined,
    },
    undefined,
    accessToken,
    pageToken,
  );
};

export const listPlaylistItems = async (
  idPlaylist: string,
  maxResults: number,
  accessToken: string,
  pageToken?: string,
): Promise<
  ResponseYoutube<{
    items: youtube.PlaylistItem[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "playlistItems",
    {
      part: ["snippet"],
      fields: "items(id,snippet(resourceId,publishedAt)),nextPageToken,etag",
      playlistId: idPlaylist,
      maxResults,
    },
    undefined,
    accessToken,
    pageToken,
  );
};

export const deletePlaylistItems = async (
  id: string,
  accessToken: string,
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch("playlistItems", { id }, undefined, accessToken, undefined, "DELETE");
};

export const listVideos = async (
  playlistItems: youtube.PlaylistItem[],
  accessToken: string,
  pageToken?: string,
): Promise<
  ResponseYoutube<{
    items: youtube.Video[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "videos",
    {
      part: ["snippet", "contentDetails"],
      fields:
        "items(id, snippet(description, thumbnails(default), channelTitle, title, publishedAt), contentDetails(duration)), nextPageToken",
      maxResult: 50,
      id: playlistItems.map((i) => i.snippet?.resourceId?.videoId).join(","),
    },
    undefined,
    accessToken,
    pageToken,
  );
};

export const rateVideos = async (
  id: string,
  accessToken: string,
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch(
    "videos/rate",
    { id, rating: "like" },
    undefined,
    accessToken,
    undefined,
    "POST",
  );
};

export const listChannels = async (
  chanIds: string,
  accessToken: string,
  pageToken?: string,
): Promise<
  ResponseYoutube<{
    items: youtube.Channel[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "channels",
    {
      part: ["contentDetails"],
      fields: "items(contentDetails(relatedPlaylists(uploads))),nextPageToken,etag",
      id: chanIds,
      maxResult: 50,
    },
    undefined,
    accessToken,
    pageToken,
  );
};

export const insertPlaylistItem = async (
  resourceId: youtube.ResourceId,
  playlistId: string,
  accessToken: string,
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch(
    "playlistItems",
    { part: ["snippet"] },
    { snippet: { resourceId, playlistId } },
    accessToken,
    undefined,
    "POST",
  );
};
