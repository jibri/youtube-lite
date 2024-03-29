import { useContext, useState } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { useFirebase } from "src/hooks/useFirebase";
import { ActionButton, Text } from "src/utils/styled";
import { PlaylistConfig } from "src/utils/types";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  input {
    width: 2em;
    height: 2em;
    clip-path: rect(0 0 2em 2em round 20%);
  }
`;

const CurrentPlaylist = ({ playlist }: { playlist: PlaylistConfig }) => {
  const [autoplay, setAutoplay] = useState(playlist.autoplay);
  const [random, setRandom] = useState(playlist.random);
  const [loop, setloop] = useState(playlist.loop);

  const { userId } = useContext(LoginContext);
  const fb = useFirebase();

  const updatePlaylist = (data: Partial<PlaylistConfig>) => {
    if (userId && fb) {
      fb.updateDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlist.id), data);
    }
  };

  const deletePlaylist = () => {
    if (userId && fb) {
      fb.deleteDoc(fb.doc(fb.db, "playlists", userId, "playlists", playlist.id));
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
      <ActionButton onClick={deletePlaylist}>Delete</ActionButton>
    </Container>
  );
};

export default CurrentPlaylist;
