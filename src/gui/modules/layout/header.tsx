import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { VideoContext } from "src/data/context/videoProvider";
import {
  defaultHeaderComponents,
  HeaderComponents,
  PATHS,
  playingHeaderComponents,
} from "src/router/path";
import { HeaderWrapper, TopButton } from "src/utils/styled";

const Header = () => {
  const {
    fetchSubscriptions,
    fetchWatchList,
    setDescriptionOpened,
    playVideo,
    videoPlaying,
    readPlaylist,
  } = useContext(VideoContext);
  const location = useLocation();

  const headerComponents = !!videoPlaying ? playingHeaderComponents : defaultHeaderComponents;

  return (
    <HeaderWrapper>
      {headerComponents[location.pathname as PATHS]?.map((component) => {
        switch (component) {
          case HeaderComponents.FEED_RELOAD_BTN:
            return (
              <TopButton key="FEED_RELOAD_BTN" onClick={() => fetchSubscriptions()}>
                Reload
              </TopButton>
            );
          case HeaderComponents.WL_RELOAD_BTN:
            return (
              <TopButton key="WL_RELOAD_BTN" onClick={() => fetchWatchList()}>
                Reload
              </TopButton>
            );
          case HeaderComponents.CLOSE_BTN:
            return (
              <TopButton key="CLOSE_BTN" onClick={() => playVideo()}>
                Close
              </TopButton>
            );
          case HeaderComponents.DESC_BTN:
            return (
              <TopButton key="DESC_BTN" onClick={() => setDescriptionOpened((old) => !old)}>
                Description
              </TopButton>
            );
          case HeaderComponents.READ_ALL:
            return (
              <TopButton key="READ_ALL" onClick={() => readPlaylist()}>
                Play all
              </TopButton>
            );
          default:
            return null;
        }
      })}
    </HeaderWrapper>
  );
};
export default Header;
