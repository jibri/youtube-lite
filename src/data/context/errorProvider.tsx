import { createContext, useState, useCallback, useContext } from "react";
import { ConfigContext } from "src/data/context/configProvider";
import { login } from "src/init/youtubeOAuth";
import { ActionButton, Text } from "src/utils/styled";

export const ErrorContext = createContext<React.ReactNode | undefined>(undefined);
export const ErrorUpdaterContext = createContext<(status: number, message?: string) => void>(
  () => null,
);

const ErrorProvider = ({ children }: React.PropsWithChildren) => {
  const [error, setError] = useState<React.ReactNode>();
  const { autoAuth } = useContext(ConfigContext);

  // Unauthorize => try to get another accessToken
  const handleError = useCallback(
    (status: number, message?: string) => {
      if (status === 401) {
        if (autoAuth) {
          login(true);
        } else {
          setError(
            <>
              <Text>Session timeout</Text>
              <ActionButton onClick={() => login(true)}>login</ActionButton>
            </>,
          );
          setTimeout(() => setError(undefined), 5000);
        }
      } else {
        setError(<Text>Error : {message || "erreur inconnue"}</Text>);
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
