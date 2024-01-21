import { useCallback, useContext } from "react";
import { LoginContext } from "src/data/context/loginProvider";
import { ResponseYoutube } from "src/utils/youtubeApi";

// callYoutube: <T extends unknown[], D>(
//   service: (...args: T) => Promise<ResponseYoutube<D>>,
//   ...args: T
// ) => Promise<ResponseYoutube<D>>;

const useYoutubeService = () => {
  const { incLoading } = useContext(LoginContext);

  /** Appel le service youtube donné, et tente de récupérer un access_token en cas d'erreur 4** */
  return useCallback(
    async <T extends unknown[], D>(
      service: (...args: T) => Promise<ResponseYoutube<D>>,
      ...args: T
    ) => {
      incLoading(1);
      const response = await service(...args);
      incLoading(-1);

      // Ok => return data
      // autre erreurs => return data
      return response;
    },
    [incLoading]
  );
};

export default useYoutubeService;
