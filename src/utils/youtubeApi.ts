import { API_KEY } from "src/utils/constants";

const YOUTUBE_API = "https://youtube.googleapis.com/youtube/v3/";

export const buildQueryString = (params: Record<string, unknown>) => {
  return Object.keys(params).reduce((queryString, key) => {
    const start = queryString ? `${queryString}&` : "?";
    const value = params[key] === undefined || params[key] === null ? "" : params[key];
    return `${start}${key}=${value}`;
  }, "");
};

const ytbFetch = async (
  service: string,
  params: Record<string, unknown>,
  body: Record<string, unknown> | undefined,
  accessToken: string,
  pageToken?: string,
  method: "GET" | "POST" | "DELETE" = "GET"
) => {
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
  if (response.ok) return response.status === 204 ? undefined : await response.json();
  const error = await response.json();
  console.log("Erreur sur l'appel api : ", service, params, error.error.message);
  throw new Error(error.error.message);
};

export const listSubscriptions = async (
  accessToken: string,
  pageToken?: string
): Promise<{
  items: gapi.client.youtube.Subscription[];
  nextPageToken?: string;
}> => {
  return await ytbFetch(
    "subscriptions",
    {
      part: "snippet",
      maxResult: 50,
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
): Promise<{
  items: gapi.client.youtube.Playlist[];
  nextPageToken?: string;
}> => {
  return await ytbFetch(
    "playlists",
    {
      part: ["snippet", "contentDetails"],
      maxResult: 50,
      mine: true,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const listPlaylistItems = async (
  idPlaylist: string,
  maxResult: number,
  accessToken: string,
  pageToken?: string
): Promise<{
  items: gapi.client.youtube.PlaylistItem[];
  nextPageToken?: string;
}> => {
  return await ytbFetch(
    "playlistItems",
    {
      part: ["snippet"],
      playlistId: idPlaylist,
      maxResult,
    },
    undefined,
    accessToken,
    pageToken
  );
};

export const deletePlaylistItems = async (id: string, accessToken: string): Promise<void> => {
  return await ytbFetch("playlistItems", { id }, undefined, accessToken, undefined, "DELETE");
};

export const listVideos = async (
  playlistItems: gapi.client.youtube.PlaylistItem[],
  accessToken: string,
  pageToken?: string
): Promise<{
  items: gapi.client.youtube.Video[];
  nextPageToken?: string;
}> => {
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

export const rateVideos = async (id: string, accessToken: string): Promise<void> => {
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
): Promise<{
  items: gapi.client.youtube.Channel[];
  nextPageToken?: string;
}> => {
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
): Promise<void> => {
  return await ytbFetch(
    "playlistItems",
    { part: ["snippet"] },
    { snippet: { resourceId, playlistId } },
    accessToken,
    undefined,
    "POST"
  );
};
