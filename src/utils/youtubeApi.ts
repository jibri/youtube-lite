import { API_KEY } from "src/utils/constants";

const YOUTUBE_API = "https://youtube.googleapis.com/youtube/v3/";

export const buildQueryString = (params: Record<string, unknown>) => {
  return Object.keys(params).reduce((queryString, key) => {
    const start = queryString ? `${queryString}&` : "?";
    const value = params[key] === undefined || params[key] === null ? "" : params[key];
    return `${start}${key}=${value}`;
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
  // ok: boolean;
  // data?: T;
  // error?: string;
};

const ytbFetch = async <T>(
  service: string,
  params: Record<string, unknown>,
  body: Record<string, unknown> | undefined,
  accessToken: string,
  pageToken?: string,
  method: "GET" | "POST" | "DELETE" = "GET"
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
    }
  );
  if (response.ok)
    return {
      status: response.status,
      ok: true,
      data: response.status === 204 ? undefined : await response.json(),
    };
  const error = await response.json();
  console.log("Erreur sur l'appel api : ", service, params, error.error.message);
  return {
    status: response.status,
    ok: false,
    error,
  };
};

export const listSubscriptions = async (
  accessToken: string,
  pageToken?: string
): Promise<
  ResponseYoutube<{
    items: gapi.client.youtube.Subscription[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "subscriptions",
    {
      part: "snippet",
      maxResults: 50,
      mine: true,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const listMyPlaylists = async (
  accessToken: string,
  pageToken?: string
): Promise<
  ResponseYoutube<{
    items: gapi.client.youtube.Playlist[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "playlists",
    {
      part: ["snippet", "contentDetails"],
      maxResults: 50,
      mine: true,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const listPlaylistItems = async (
  idPlaylist: string,
  maxResults: number,
  accessToken: string,
  pageToken?: string
): Promise<
  ResponseYoutube<{
    items: gapi.client.youtube.PlaylistItem[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "playlistItems",
    {
      part: ["snippet"],
      playlistId: idPlaylist,
      maxResults,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const deletePlaylistItems = async (
  id: string,
  accessToken: string
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch("playlistItems", { id }, undefined, accessToken, undefined, "DELETE");
};

export const listVideos = async (
  playlistItems: gapi.client.youtube.PlaylistItem[],
  accessToken: string,
  pageToken?: string
): Promise<
  ResponseYoutube<{
    items: gapi.client.youtube.Video[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "videos",
    {
      part: ["snippet", "contentDetails", "player"],
      maxResult: 50,
      id: playlistItems.map((i) => i.snippet?.resourceId?.videoId).join(","),
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const rateVideos = async (
  id: string,
  accessToken: string
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch(
    "videos/rate",
    { id, rating: "like" },
    undefined,
    accessToken,
    undefined,
    "POST"
  );
};

export const listChannels = async (
  chanIds: string,
  accessToken: string,
  pageToken?: string
): Promise<
  ResponseYoutube<{
    items: gapi.client.youtube.Channel[];
    nextPageToken?: string;
  }>
> => {
  return await ytbFetch(
    "channels",
    {
      part: ["contentDetails"],
      id: chanIds,
      maxResult: 50,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const insertPlaylistItem = async (
  resourceId: gapi.client.youtube.ResourceId,
  playlistId: string,
  accessToken: string
): Promise<ResponseYoutube<void>> => {
  return await ytbFetch(
    "playlistItems",
    { part: ["snippet"] },
    { snippet: { resourceId, playlistId } },
    accessToken,
    undefined,
    "POST"
  );
};
