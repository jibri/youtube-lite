import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { LoginContext } from "src/data/context/loginProvider";
import { ActionButton, Text } from "src/utils/styled";
import { ConfigContext, ConfigData } from "src/data/context/configProvider";
import { login, token } from "src/init/youtubeOAuth";
import logoUrl from "src/assets/logo192.png";
import { useFirebase } from "src/hooks/useFirebase";

const BigButton = styled(ActionButton)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  box-shadow: 1px 1px 5px 0 #00000055;
  border-radius: 5px;
  margin: 1em;
  padding: 1em;
  max-width: 300px;

  text-decoration: none;

  span {
    font-weight: bold;
  }
`;

const PlaylistItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  margin: 0.5em;
`;
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 800px);
  margin: auto;

  > * {
    margin-bottom: 0.5em;
  }
`;

const Separator = styled.div`
  width: 50%;
  border-top: 1px solid ${(props) => props.theme.palette.secondary.dark};
`;

const Container = styled.div<{ $alignSelf?: string }>`
  align-self: ${(props) => (props.$alignSelf ? props.$alignSelf : "start")};
`;

const Input = styled.input<{ width?: string }>`
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.common.black};
  background-color: ${(props) => props.theme.palette.secondary.main};
  border-radius: 5px;
  padding: 0.5em;
  color: ${(props) => props.theme.palette.text.primary};
  font-size: 1em;
  width: ${(props) => props.width || "auto"};
`;

// TODO : dans le player, utiliser des event onstatechange pour eviter de recharge le player à chaque fois
// TODO : button "..." sur les video

function Login() {
  const [minDurationInputValue, setMinDurationInputValue] = useState("0");
  const [maxAgeInputValue, setMaxAgeInputValue] = useState("0");
  const [autoAuthInputValue, setAutoAuthInputValue] = useState(false);
  const [useSwipeInputValue, setUseSwipeInputValue] = useState(false);

  const { userId, signout } = useContext(LoginContext);
  const { minDuration, maxAge, autoAuth, useSwipe } = useContext(ConfigContext);
  const fb = useFirebase();

  const updateConfig = <K extends keyof ConfigData>(key: K, value?: ConfigData[K]) => {
    if (userId && fb && key) {
      fb.updateDoc(fb.doc(fb.db, "configuration", userId), {
        [key]: value,
      });
    }
  };

  useEffect(() => {
    setMinDurationInputValue(`${minDuration}`);
  }, [minDuration]);

  useEffect(() => {
    setAutoAuthInputValue(autoAuth);
  }, [autoAuth]);

  useEffect(() => {
    setUseSwipeInputValue(useSwipe);
  }, [useSwipe]);

  useEffect(() => {
    setMaxAgeInputValue(`${maxAge}`);
  }, [maxAge]);

  function handleAuthClick() {
    if (token) {
      // User is authorized and has clicked "Sign out" button.
      signout();
    } else {
      // User is not signed in. Start Google auth flow.
      login(true);
    }
  }

  return (
    <MainContainer>
      {userId && (
        <>
          <Container>
            <Text>Theme :</Text>
            <PlaylistItems>
              <ActionButton onClick={() => updateConfig("theme", "dark")}>Dark Theme</ActionButton>
              <ActionButton onClick={() => updateConfig("theme", "light")}>
                Light Theme
              </ActionButton>
            </PlaylistItems>
          </Container>
          <Container>
            <Text>Min video duration in feed (seconds) : </Text>
            <Input
              width="2em"
              onBlur={(e) => updateConfig("minDuration", +e.target.value)}
              value={minDurationInputValue}
              onChange={(e) => setMinDurationInputValue(e.target.value)}
            />
          </Container>
          <Container>
            <Text>Max age video in feed (days) : </Text>
            <Input
              width="2em"
              onBlur={(e) => updateConfig("maxAge", +e.target.value || 100)}
              value={maxAgeInputValue}
              onChange={(e) => setMaxAgeInputValue(e.target.value)}
            />
          </Container>
          <Container>
            <Text>Auto auth on 401 : </Text>
            <input
              type="checkbox"
              checked={autoAuthInputValue}
              onChange={(e) => {
                setAutoAuthInputValue(e.target.checked);
                updateConfig("autoAuth", e.target.checked);
              }}
            />
          </Container>
          <Container>
            <Text>Use swipeable videos : </Text>
            <input
              type="checkbox"
              checked={useSwipeInputValue}
              onChange={(e) => {
                setUseSwipeInputValue(e.target.checked);
                updateConfig("useSwipe", e.target.checked);
              }}
            />
          </Container>
          <Separator />
        </>
      )}
      <BigButton onClick={handleAuthClick}>
        <img src={logoUrl} width="100px" alt="Logo Youtube-lite" />
        {userId ? "Sign out" : "Sign In"}
      </BigButton>
      <Separator />
      <Container $alignSelf="end">
        <Text>version v{import.meta.env.VITE_VERSION}</Text>
      </Container>
    </MainContainer>
  );
}

export default Login;
