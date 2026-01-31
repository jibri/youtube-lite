export enum PATHS {
  FEED = "/feed",
  PLAYLIST = "/playlist",
  PLAYLISTS = "/playlists",
  PARAMETERS = "/parameters",
}
export enum HeaderComponents {
  FEED_RELOAD_BTN = "FEED_RELOAD_BTN",
  WL_RELOAD_BTN = "WL_RELOAD_BTN",
  DESC_BTN = "DESC_BTN",
  AUTOPLAY_BTN = "AUTOPLAY_BTN",
  LOOP_BTN = "LOOP_BTN",
  SHUFFLE_BTN = "SHUFFLE_BTN",
  PREV_BTN = "PREV_BTN",
  NEXT_BTN = "NEXT_BTN",
  CLOSE_BTN = "CLOSE_BTN",
  SAVE_ON_PAUSE_BTN = "SAVE_ON_PAUSE_BTN",
}
export type HeaderComponentsType = { [key in PATHS]: HeaderComponents[] };
export const defaultHeaderComponents = {
  [PATHS.FEED]: [HeaderComponents.FEED_RELOAD_BTN],
  [PATHS.PLAYLIST]: [
    HeaderComponents.WL_RELOAD_BTN,
    HeaderComponents.AUTOPLAY_BTN,
    HeaderComponents.LOOP_BTN,
    HeaderComponents.SHUFFLE_BTN,
    HeaderComponents.SAVE_ON_PAUSE_BTN,
  ],
  [PATHS.PLAYLISTS]: [],
  [PATHS.PARAMETERS]: [],
};
export const playingHeaderComponents = {
  [PATHS.FEED]: [
    HeaderComponents.FEED_RELOAD_BTN,
    HeaderComponents.DESC_BTN,
    HeaderComponents.PREV_BTN,
    HeaderComponents.NEXT_BTN,
    HeaderComponents.CLOSE_BTN,
  ],
  [PATHS.PLAYLIST]: [
    HeaderComponents.WL_RELOAD_BTN,
    HeaderComponents.DESC_BTN,
    HeaderComponents.AUTOPLAY_BTN,
    HeaderComponents.LOOP_BTN,
    HeaderComponents.SHUFFLE_BTN,
    HeaderComponents.SAVE_ON_PAUSE_BTN,
    HeaderComponents.PREV_BTN,
    HeaderComponents.NEXT_BTN,
    HeaderComponents.CLOSE_BTN,
  ],
  [PATHS.PLAYLISTS]: [
    HeaderComponents.DESC_BTN,
    HeaderComponents.PREV_BTN,
    HeaderComponents.NEXT_BTN,
    HeaderComponents.CLOSE_BTN,
  ],
  [PATHS.PARAMETERS]: [
    HeaderComponents.DESC_BTN,
    HeaderComponents.PREV_BTN,
    HeaderComponents.NEXT_BTN,
    HeaderComponents.CLOSE_BTN,
  ],
};
