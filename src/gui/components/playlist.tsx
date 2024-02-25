import { useContext, useState } from "react";
import styled from "styled-components";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ConfigContext } from "src/data/context/configProvider";
import CurrentPlaylist from "src/gui/components/currentPlaylist";
import { PlaylistYtbLite } from "src/utils/types";
import { IconButton } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export type VisualAction = {
  action: (video: youtube.Playlist) => void;
  actionIcon: IconDefinition;
};

const thumbnailWidth = "60px";
const thumbnailHeight = "3em";

const ContentWrapper = styled.div`
  padding-left: 5px;
  color: ${(props) => props.theme.palette.text.primary};
  overflow: hidden;
`;
const VideoWrapper = styled.div<{
  $highlight: boolean;
}>`
  display: grid;
  grid-template-columns: ${thumbnailWidth} 1fr min-content;

  height: ${thumbnailHeight};
  background-color: ${(props) =>
    props.$highlight ? props.theme.palette.secondary.main : props.theme.palette.background.main};
  &:hover {
    ${ContentWrapper} {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }
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
  object-fit: cover;
  width: ${thumbnailWidth};
  height: ${thumbnailHeight};
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
  background-color: ${(props) => props.theme.palette.secondary.main};
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

const Playlist = ({ playlist, onClick }: { playlist: PlaylistYtbLite; onClick: () => void }) => {
  const { playlistId } = useContext(ConfigContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnail =
    playlist.playlist.snippet?.thumbnails?.default || playlist.playlist.snippet?.thumbnails?.medium;

  const artists = playlist.config.artists?.join(", ") || "";
  const artistsEllipsis = artists.length > 30 ? artists?.substring(0, 30).concat("...") : artists;
  const title = playlist.playlist.snippet?.title || "";
  const titleEllipsis = title.length > 30 ? title.substring(0, 30).concat("...") : title;

  const openMenu: React.MouseEventHandler = () => {
    setMenuOpen(true);
  };

  return (
    <VideoWrapper $highlight={playlistId === playlist.playlist.id} onClick={onClick} role="button">
      <Image alt="youtube thumbnail" loading="lazy" src={thumbnail?.url} />
      <ContentWrapper>
        <Author title={artists}>{artistsEllipsis}</Author>
        <Title title={title}>{titleEllipsis}</Title>
      </ContentWrapper>
      <ActionWrapper onClick={(e) => e.stopPropagation()}>
        <IconButton onClick={openMenu}>
          {/* $highlight={playlistId === playlist.playlist.id} */}
          {/* <FontAwesomeIcon icon={faEllipsisVertical} fixedWidth /> */}
          {/* FIXME gestion thme */}
          <MoreVert />
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
