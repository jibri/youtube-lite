import { useContext } from "react";
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
  const { fetchSubscriptions, fetchWatchList, setDescriptionOpened, playVideo, videoPlaying } =
    useContext(VideoContext);
  const location = useLocation();

  const headerComponents = videoPlaying ? playingHeaderComponents : defaultHeaderComponents;

  return (
    <HeaderWrapper>
      {headerComponents[location.pathname as PATHS]?.map((component) => {
        switch (component) {
          case HeaderComponents.FEED_RELOAD_BTN:
            return (
              <TopButton key="FEED_RELOAD_BTN" onClick={() => fetchSubscriptions()}>
                Reload feed
              </TopButton>
            );
          case HeaderComponents.WL_RELOAD_BTN:
            return (
              <TopButton key="WL_RELOAD_BTN" onClick={() => fetchWatchList()}>
                Reload playlist
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
          default:
            return null;
        }
      })}
    </HeaderWrapper>
  );
};
export default Header;
