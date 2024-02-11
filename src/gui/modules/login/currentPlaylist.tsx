import { useContext, useState } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { PlaylistConfig } from "src/data/context/playlistsProvider";
import { useFirebase } from "src/hooks/useFirebase";
import { Text } from "src/utils/styled";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: 1em;
`;

const CurrentPlaylist = ({ playlist }: { playlist: PlaylistConfig }) => {
  const [autoplay, setAutoplay] = useState(playlist.autoplay);
  const [random, setRandom] = useState(playlist.random);
  const [loop, setloop] = useState(playlist.loop);

  const { userId } = useContext(LoginContext);
  const fb = useFirebase();

  const updatePlaylist = async (data: Partial<PlaylistConfig>) => {
    if (userId && fb) {
      await fb.updateDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlist.id), data);
    }
  };
  return (
    <Container>
      <label>
        <input
          type="checkbox"
          checked={autoplay}
          onChange={(e) => {
            setAutoplay(e.target.checked);
            updatePlaylist({ autoplay: e.target.checked });
          }}
        />
        <Text>Auto play</Text>
      </label>
      <label>
        <input
          type="checkbox"
          checked={random}
          onChange={(e) => {
            setRandom(e.target.checked);
            updatePlaylist({ random: e.target.checked });
          }}
        />
        <Text>Random</Text>
      </label>
      <label>
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => {
            setloop(e.target.checked);
            updatePlaylist({ loop: e.target.checked });
          }}
        />
        <Text>Loop</Text>
      </label>
    </Container>
  );
};

export default CurrentPlaylist;
