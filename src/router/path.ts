export enum PATHS {
  FEED = '/feed',
  WATCHLIST = '/watchlist',
  PROFILE = '/profile',
}
export enum HeaderComponents {
  FEED_RELOAD_BTN = 'FEED_RELOAD_BTN',
  WL_RELOAD_BTN = 'WL_RELOAD_BTN',
  DESC_BTN = 'DESC_BTN',
  CLOSE_BTN = 'CLOSE_BTN'
}
export type HeaderComponentsType = { [key in PATHS]: HeaderComponents[] }
export const defaultHeaderComponents = {
  [PATHS.FEED]: [HeaderComponents.FEED_RELOAD_BTN],
  [PATHS.WATCHLIST]: [HeaderComponents.WL_RELOAD_BTN],
  [PATHS.PROFILE]: []
}
export const playingHeaderComponents = {
  [PATHS.FEED]: [HeaderComponents.FEED_RELOAD_BTN, HeaderComponents.DESC_BTN, HeaderComponents.CLOSE_BTN],
  [PATHS.WATCHLIST]: [HeaderComponents.WL_RELOAD_BTN, HeaderComponents.DESC_BTN, HeaderComponents.CLOSE_BTN],
  [PATHS.PROFILE]: [HeaderComponents.DESC_BTN, HeaderComponents.CLOSE_BTN]
}