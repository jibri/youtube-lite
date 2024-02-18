import { useCallback, useContext, useMemo, useState } from "react";
import { faTrash, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { VideoContext } from "src/data/context/videoProvider";
import Video, { VisualAction } from "src/gui/components/video";
import { VideoWrapper, ActionButton, Text, Flex } from "src/utils/styled";
import { VideoItem } from "src/utils/types";
import styled from "styled-components";
import useDelayAction from "src/hooks/useDelayAction";
import Notification from "src/gui/components/notification";
import { ConfigContext } from "src/data/context/configProvider";
import { deletePlaylistItems, rateVideos } from "src/utils/youtubeApi";
import { useLargeScreenMq } from "src/hooks/useMq";
import SwipableVideo from "src/gui/components/SwipableVideo";
import { token } from "src/init/youtubeOAuth";
import useYoutubeService from "src/hooks/useYoutubeService";
import { ErrorUpdaterContext } from "src/data/context/errorProvider";
import usePlaylists from "src/hooks/usePlaylists";

export const WlVideoWrapper = styled(VideoWrapper)<{ $removing: boolean }>`
  transition: max-height 0.5s ease;
  max-height: ${(props) => (props.$removing ? "0" : props.theme.video.height)};
  overflow: hidden;
`;

function Watchlist() {
  const handleError = useContext(ErrorUpdaterContext);
  const { playlistVideos, deleteFromWatchlist } = useContext(VideoContext);
  const { playlistId, useSwipe } = useContext(ConfigContext);
  const [removing, setRemoving] = useState<string[]>([]);
  const { delayedActions, delayAction, cancelAction } = useDelayAction();
  const matches = useLargeScreenMq();
  const callYoutube = useYoutubeService();
  const playlistConfig = usePlaylists();

  const currentPlaylistConfig = playlistId
    ? playlistConfig.find((pl) => pl.id === playlistId)
    : undefined;

  const deletePlaylistItem = useCallback(
    async (video: VideoItem) => {
      if (token && video.playlistItem.id) {
        const response = await callYoutube(
          deletePlaylistItems,
          video.playlistItem.id,
          token.access_token,
        );
        if (!response.ok) {
          handleError(response.status, response.error);
          // On retire l'id en erreur des removed video pour réafficher la video dans la playlist
          setRemoving((removedIds) => removedIds.filter((id) => id !== video.video.id));
        } else {
          deleteFromWatchlist(video.playlistItem.id);
        }
      }
    },
    [callYoutube, deleteFromWatchlist, handleError],
  );

  const removeFromWatchlist = useCallback(
    (video: VideoItem) => {
      if (video.video.id) {
        const idToRemove = video.video.id;
        setTimeout(() => setRemoving((videoIds) => [...videoIds, idToRemove]), 100);
        delayAction("Video supprimée", () => deletePlaylistItem(video));
      }
    },
    [delayAction, deletePlaylistItem],
  );

  const likeVideo = useCallback(
    async (video: VideoItem, remove: boolean) => {
      if (video.video.id) {
        const idToRemove = video.video.id;
        if (remove) {
          setTimeout(() => setRemoving((videoIds) => [...videoIds, idToRemove]), 100);
          delayAction("Like ajouté", async () => {
            if (token && video.video.id) {
              const response = await callYoutube(rateVideos, video.video.id, token.access_token);
              if (!response.ok) {
                handleError(response.status, response.error);
                // On retire l'id en erreur des removed video pour réafficher la video dans la playlist
                setRemoving((removedIds) => removedIds.filter((id) => id !== video.video.id));
              } else {
                deletePlaylistItem(video);
              }
            }
          });
        } else {
          if (token && video.video.id) {
            const response = await callYoutube(rateVideos, video.video.id, token.access_token);
            if (!response.ok) {
              handleError(response.status, response.error);
            }
          }
        }
      }
    },
    [callYoutube, delayAction, deletePlaylistItem, handleError],
  );

  const actions: [VisualAction | undefined, VisualAction | undefined] = useMemo(() => {
    return currentPlaylistConfig?.mine
      ? [
          { action: (video) => removeFromWatchlist(video), actionIcon: faTrash },
          { action: (video) => likeVideo(video, true), actionIcon: faThumbsUp },
        ]
      : [undefined, { action: (video) => likeVideo(video, false), actionIcon: faThumbsUp }];
  }, [likeVideo, removeFromWatchlist, currentPlaylistConfig]);

  return (
    <>
      {playlistVideos.length === 0 && (
        <Flex jc="center">
          <Text>
            {!playlistId && "Veuillez sélectionner une playlist à afficher depuis l'écran profil"}
            {!!playlistId && "Aucune vidéo dans votre playlist"}
          </Text>
        </Flex>
      )}
      {playlistVideos.map((video) => (
        <WlVideoWrapper key={video.video.id} $removing={removing.includes(video.video.id || "")}>
          {!useSwipe || matches ? (
            <Video video={video} actions={actions.filter((a) => !!a) as VisualAction[]} />
          ) : (
            <SwipableVideo video={video} videoActions={[]} swipeActions={actions} />
          )}
        </WlVideoWrapper>
      ))}
      <Notification show={!!delayedActions.length}>
        <Text>{delayedActions[delayedActions.length - 1]?.label}</Text>
        <ActionButton onClick={() => cancelAction(() => setRemoving((ids) => ids.slice(0, -1)))}>
          Cancel
        </ActionButton>
      </Notification>
    </>
  );
}
export default Watchlist;
