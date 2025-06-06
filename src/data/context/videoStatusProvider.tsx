import React, { createContext, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import useFirebaseCollection from "src/hooks/useFirebaseCollection";
import { VideoStatus } from "src/utils/types";

export const VideoStatusContext = createContext<VideoStatus[]>([]);

/**
 * Permet de gérer le statut des videos regardéés.
 * On y stock par exemple le watchtime
 */
const VideoStatusProvider = ({ children }: React.PropsWithChildren) => {
  const { userId } = useContext(LoginContext);
  const videosStatus = useFirebaseCollection<VideoStatus>(
    userId && `videosStatus/${userId}/videosStatus`,
  );
  return <VideoStatusContext.Provider value={videosStatus}>{children}</VideoStatusContext.Provider>;
};
export default VideoStatusProvider;
