import { createContext, useState, useCallback, useContext } from "react";
import { ConfigContext } from "src/data/context/configProvider";
import { login } from "src/init/youtubeOAuth";

export const ErrorContext = createContext<string | undefined>(undefined);
export const ErrorUpdaterContext = createContext<(status: number, message?: string) => void>(
  () => null,
);

const ErrorProvider = ({ children }: React.PropsWithChildren) => {
  const [error, setError] = useState<string>();
  const { autoAuth } = useContext(ConfigContext);

  // Unauthorize => try to get another accessToken
  const handleError = useCallback(
    (status: number, message?: string) => {
      if (status === 401) {
        if (autoAuth) {
          login(true);
        } else {
          setError(`Error : ${message || "erreur inconnue"}`);
        }
      } else {
        setError(`Error : ${message || "erreur inconnue"}`);
        setTimeout(() => setError(undefined), 5000);
      }
    },
    [autoAuth],
  );

  return (
    <ErrorContext.Provider value={error}>
      <ErrorUpdaterContext.Provider value={handleError}>{children}</ErrorUpdaterContext.Provider>
    </ErrorContext.Provider>
  );
};
export default ErrorProvider;
