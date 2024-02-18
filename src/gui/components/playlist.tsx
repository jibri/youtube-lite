import { useContext, useState } from "react";
import styled from "styled-components";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ConfigContext } from "src/data/context/configProvider";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import CurrentPlaylist from "src/gui/components/currentPlaylist";
import { PlaylistYtbLite } from "src/utils/types";

export type VisualAction = {
  action: (video: youtube.Playlist) => void;
  actionIcon: IconDefinition;
};

const thumbnailWidth = "120px";
const thumbnailHeight = "90px";

const ContentWrapper = styled.div`
  padding-left: 5px;
  color: ${(props) => props.theme.text.main};
  overflow: hidden;
`;
const VideoWrapper = styled.div<{
  $highlight: boolean;
}>`
  display: grid;
  grid-template-columns: ${thumbnailWidth} 1fr min-content;

  height: ${thumbnailHeight};
  background-color: ${(props) =>
    props.$highlight ? props.theme.secondary : props.theme.background};
  &:hover {
    ${ContentWrapper} {
      color: ${(props) => props.theme.active};
    }
  }
`;
const ThumbnailContainer = styled.div`
  display: flex;
  justify-content: center;
  background-color: ${(props) => props.theme.black};
`;
const Author = styled.h6`
  font-size: 0.8em;
  font-weight: initial;
  margin: 0;
  padding: 0;
`;
const Title = styled(Author)`
  font-size: 1em;
  line-height: 1.1em;
  color: inherit;
  font-weight: bold;
`;
const Image = styled.img`
  display: block;
  max-width: ${thumbnailWidth};
  max-height: ${thumbnailHeight};
`;
const ActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Animated = styled.div<{ show: boolean }>`
  height: ${(props) => (props.show ? "200px" : 0)};
  overflow: hidden;
  transition: height 0.5s;
  position: absolute;
  right: 1em;
  transform: translate(0, calc(50% + 1.5em));
`;

const Menu = styled.div`
  background-color: ${(props) => props.theme.secondary};
  border-radius: 0.5em;
  padding: 1em;
`;
const Overlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #00000033;
`;
const IconButton = styled.button<{ $highlight: boolean }>`
  background-color: ${(props) =>
    props.$highlight ? props.theme.background : props.theme.secondary};
  border: none;
  border-radius: 50%;
  width: 3em;
  height: 3em;
  margin: 1em;
  color: ${(props) => props.theme.text.main};
  &:hover {
    color: ${(props) => props.theme.active};
  }

  svg {
    font-size: 2em;
  }
`;

const Playlist = ({ playlist, onClick }: { playlist: PlaylistYtbLite; onClick: () => void }) => {
  const { playlistId } = useContext(ConfigContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnail =
    playlist.playlist.snippet?.thumbnails?.default || playlist.playlist.snippet?.thumbnails?.medium;

  const openMenu: React.MouseEventHandler = () => {
    setMenuOpen(true);
  };

  return (
    <VideoWrapper $highlight={playlistId === playlist.playlist.id} onClick={onClick} role="button">
      <ThumbnailContainer>
        <Image alt="youtube thumbnail" loading="lazy" src={thumbnail?.url} />
      </ThumbnailContainer>
      <ContentWrapper>
        <Author>{playlist.playlist.snippet?.channelTitle}</Author>
        <Title>{playlist.playlist.snippet?.title}</Title>
      </ContentWrapper>
      <ActionWrapper onClick={(e) => e.stopPropagation()}>
        <IconButton onClick={openMenu} $highlight={playlistId === playlist.playlist.id}>
          <FontAwesomeIcon icon={faEllipsis} />
        </IconButton>
        {menuOpen && <Overlay onClick={() => setMenuOpen(false)} />}
        <Animated show={menuOpen}>
          {menuOpen && (
            <Menu>
              <CurrentPlaylist playlist={playlist.config} />
            </Menu>
          )}
        </Animated>
      </ActionWrapper>
    </VideoWrapper>
  );
};

export default Playlist;
