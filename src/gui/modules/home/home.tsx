import React, { useContext } from "react";
import Router from "src/router";
import Footer from "src/gui/modules/layout/footer";
import Login from "src/gui/modules/login/login";
import { LoginContext } from "src/data/context/loginProvider";
import VideoProvider, { VideoContext } from "src/data/context/videoProvider";
import styled from "styled-components";
import Notification from "src/gui/components/notification";
import Loader from "src/gui/components/loader";
import Player from "src/gui/components/player";
import Header from "../layout/header";
import { Text } from "src/utils/styled";

const MainScreeen = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.background};
`;

const MainContainer = styled.div`
  height: 100vh;
  max-width: ${(props) => props.theme.appMaxWidth};
  margin: auto;
  background-color: ${(props) => props.theme.background};

  overflow: hidden;

  @media (max-height: 650px) {
    display: flex;
    > * {
      min-width: 50%;
    }
  }
`;
const ContentWrapper = styled.div<{ playerOpened: boolean }>`
  padding: ${(props) => props.theme.headerHeigth} 0;
  overflow-y: auto;
  height: calc(
    100vh - 2 * ${(props) => props.theme.headerHeigth} -
      ${(props) => (props.playerOpened ? props.theme.playerHeight : "0px")}
  );

  @media (max-height: 650px) {
    height: calc(100vh - 2 * ${(props) => props.theme.headerHeigth});
  }
`;
const VideoContainer = styled.div`
  @media (max-height: 650px) {
    display: flex;
    align-items: center;
  }
`;

const VideoModule = () => {
  const { loading } = useContext(LoginContext);
  const { videoPlaying } = useContext(VideoContext);

  return (
    <>
      {loading > 0 && <Loader />}
      {videoPlaying && (
        <VideoContainer>
          <Player video={videoPlaying} />
        </VideoContainer>
      )}
      <Header />
      <ContentWrapper playerOpened={!!videoPlaying}>
        <Router />
      </ContentWrapper>
      <Footer />
    </>
  );
};

const Home = () => {
  const { error, userId } = useContext(LoginContext);

  return (
    <MainScreeen>
      <MainContainer>
        {userId ? (
          <VideoProvider>
            <VideoModule />
          </VideoProvider>
        ) : (
          <Login />
        )}
        <Notification show={!!error}>
          <Text>{error}</Text>
        </Notification>
      </MainContainer>
    </MainScreeen>
  );
};

export default Home;
