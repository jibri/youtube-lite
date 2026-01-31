import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faPlay,
  faXmark,
  faRepeat,
  faShuffle,
  faNewspaper,
  faRotateRight,
  faFloppyDisk,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import {
  defaultHeaderComponents,
  HeaderComponents,
  PATHS,
  playingHeaderComponents,
} from "src/router/path";
import styled from "styled-components";
import { button } from "src/utils/styled";
import { PlaylistConfig } from "src/utils/types";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";
import { ConfigContext } from "src/data/context/configProvider";
import usePlaylists from "src/hooks/usePlaylists";

export const HeaderWrapper = styled.div<{ bottom?: boolean }>`
  display: flex;
  box-shadow: 0 0 5px #00000055;
`;

export const TopButton = styled.div`
  ${button}
  border-bottom: 2px solid transparent;
`;

export const IconButton = styled(TopButton)`
  /* max-width: 4em; */
`;
const ActivableButton = styled(IconButton)<{ $active: boolean }>`
  color: ${(props) =>
    props.$active ? props.theme.palette.primary.main : props.theme.palette.text.primary};
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
  const { userId } = useContext(LoginContext);
  const { playlistId } = useContext(ConfigContext);
  const playlists = usePlaylists();
  const fb = useFirebase();

  const updatePlaylist = (data: Partial<PlaylistConfig>) => {
    if (userId && fb) {
      fb.updateDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlistId), data);
    }
  };

  const headerComponents = videoPlaying ? playingHeaderComponents : defaultHeaderComponents;
  // FIXME : gerer les largerus
  return (
    <HeaderWrapper>
      {headerComponents[location.pathname as PATHS]?.map((component) => {
        switch (component) {
          case HeaderComponents.FEED_RELOAD_BTN:
            return (
              <IconButton key="FEED_RELOAD_BTN" onClick={() => fetchSubscriptions()}>
                <FontAwesomeIcon icon={faRotateRight} />
              </IconButton>
            );
          case HeaderComponents.WL_RELOAD_BTN:
            return (
              <IconButton key="WL_RELOAD_BTN" onClick={() => fetchWatchList()}>
                <FontAwesomeIcon icon={faRotateRight} />
              </IconButton>
            );
          case HeaderComponents.CLOSE_BTN:
            return (
              <IconButton key="CLOSE_BTN" onClick={() => playVideo()}>
                <FontAwesomeIcon icon={faXmark} />
              </IconButton>
            );
          case HeaderComponents.DESC_BTN:
            return (
              <IconButton key="DESC_BTN" onClick={() => setDescriptionOpened((old) => !old)}>
                <FontAwesomeIcon icon={faNewspaper} />
              </IconButton>
            );
          case HeaderComponents.AUTOPLAY_BTN:
            return (
              <ActivableButton
                key="AUTOPLAY_BTN"
                $active={playlists.find((pl) => pl.id === playlistId)?.autoplay || false}
                onClick={() =>
                  updatePlaylist({
                    autoplay: !playlists.find((pl) => pl.id === playlistId)?.autoplay,
                  })
                }
              >
                <FontAwesomeIcon icon={faPlay} />
              </ActivableButton>
            );
          case HeaderComponents.LOOP_BTN:
            return (
              <ActivableButton
                key="LOOP_BTN"
                $active={playlists.find((pl) => pl.id === playlistId)?.loop || false}
                onClick={() =>
                  updatePlaylist({
                    loop: !playlists.find((pl) => pl.id === playlistId)?.loop,
                  })
                }
              >
                <FontAwesomeIcon icon={faRepeat} />
              </ActivableButton>
            );
          case HeaderComponents.SHUFFLE_BTN:
            return (
              <ActivableButton
                key="SHUFFLE_BTN"
                $active={playlists.find((pl) => pl.id === playlistId)?.random || false}
                onClick={() =>
                  updatePlaylist({
                    random: !playlists.find((pl) => pl.id === playlistId)?.random,
                  })
                }
              >
                <FontAwesomeIcon icon={faShuffle} />
              </ActivableButton>
            );
          case HeaderComponents.SAVE_ON_PAUSE_BTN:
            return (
              <ActivableButton
                key="SAVE_ON_PAUSE_BTN"
                $active={playlists.find((pl) => pl.id === playlistId)?.saveOnPause || false}
                onClick={() =>
                  updatePlaylist({
                    saveOnPause: !playlists.find((pl) => pl.id === playlistId)?.saveOnPause,
                  })
                }
              >
                <span className="fa-layers fa-lg">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  <FontAwesomeIcon icon={faPause} transform="shrink-6 right-6 down-6" />
                </span>
              </ActivableButton>
            );
          case HeaderComponents.PREV_BTN:
            return (
              <IconButton key="PREV_BTN" onClick={prevVideo}>
                <FontAwesomeIcon icon={faBackwardStep} />
              </IconButton>
            );
          case HeaderComponents.NEXT_BTN:
            return (
              <IconButton key="NEXT_BTN" onClick={nextVideo}>
                <FontAwesomeIcon icon={faForwardStep} />
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
