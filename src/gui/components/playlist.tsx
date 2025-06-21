import { useContext } from "react";
import styled from "styled-components";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ConfigContext } from "src/data/context/configProvider";
import { PlaylistYtbLite } from "src/utils/types";
import { useFirebase } from "src/hooks/useFirebase";
import { LoginContext } from "src/data/context/loginProvider";
import { ActionWrapper } from "src/utils/styled";
import { faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    cursor: pointer;

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
const ActivableIcon = styled(FontAwesomeIcon)<{ $highlight: boolean }>`
  color: ${(props) =>
    props.$highlight ? props.theme.palette.primary.main : props.theme.palette.text.primary};
`;

const Playlist = ({ playlist, onClick }: { playlist: PlaylistYtbLite; onClick: () => void }) => {
  const { playlistId } = useContext(ConfigContext);
  const { userId } = useContext(LoginContext);
  const fb = useFirebase();
  const thumbnail =
    playlist.playlist.snippet?.thumbnails?.default || playlist.playlist.snippet?.thumbnails?.medium;

  const artists = playlist.config.artists?.join(", ") || "";
  const artistsEllipsis = artists.length > 30 ? artists?.substring(0, 30).concat("...") : artists;
  const title = playlist.playlist.snippet?.title || "";
  const titleEllipsis = title.length > 30 ? title.substring(0, 30).concat("...") : title;

  const deletePlaylist = () => {
    if (userId && fb) {
      fb.deleteDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlist.config.id));
    }
  };

  const updatePlaylistFavorite = () => {
    if (userId && fb) {
      fb.updateDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlist.config.id), {
        fav: !playlist.config.fav,
      });
    }
  };

  return (
    <VideoWrapper $highlight={playlistId === playlist.config.id} role="button">
      <Image alt="youtube thumbnail" loading="lazy" src={thumbnail?.url} onClick={onClick} />
      <ContentWrapper onClick={onClick}>
        <Author title={artists}>{artistsEllipsis}</Author>
        <Title title={title}>{titleEllipsis}</Title>
      </ContentWrapper>
      <ActionWrapper>
        <ActivableIcon
          icon={faStar}
          $highlight={playlist.config.fav}
          onClick={updatePlaylistFavorite}
          size="xs"
        />
        <FontAwesomeIcon icon={faTrash} onClick={deletePlaylist} size="xs" />
      </ActionWrapper>
    </VideoWrapper>
  );
};

export default Playlist;
