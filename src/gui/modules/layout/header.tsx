import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import {
  defaultHeaderComponents,
  HeaderComponents,
  PATHS,
  playingHeaderComponents,
} from "src/router/path";
import styled from "styled-components";
import { button } from "src/utils/styled";

export const HeaderWrapper = styled.div<{ bottom?: boolean }>`
  display: flex;
  box-shadow: 0 0 5px #00000055;
`;

export const TopButton = styled.div`
  ${button}
  border-bottom: 2px solid transparent;
`;

export const IconButton = styled(TopButton)`
  max-width: 4em;
`;

const Header = () => {
  const {
    fetchSubscriptions,
    fetchWatchList,
    setDescriptionOpened,
    playVideo,
    nextVideo,
    prevVideo,
    videoPlaying,
  } = useContext(VideoContext);
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
              <IconButton key="CLOSE_BTN" onClick={() => playVideo()}>
                <FontAwesomeIcon icon={faXmark} />
              </IconButton>
            );
          case HeaderComponents.DESC_BTN:
            return (
              <TopButton key="DESC_BTN" onClick={() => setDescriptionOpened((old) => !old)}>
                Description
              </TopButton>
            );
          case HeaderComponents.PREV_BTN:
            return (
              <IconButton key="PREV_BTN" onClick={prevVideo}>
                <FontAwesomeIcon icon={faCaretLeft} />
              </IconButton>
            );
          case HeaderComponents.NEXT_BTN:
            return (
              <IconButton key="NEXT_BTN" onClick={nextVideo}>
                <FontAwesomeIcon icon={faCaretRight} />
              </IconButton>
            );
          default:
            return null;
        }
      })}
    </HeaderWrapper>
  );
};
export default Header;
