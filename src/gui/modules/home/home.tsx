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
const ContentWrapper = styled.div`
  padding: ${(props) => props.theme.headerHeigth} 0;
`;

const VideoModule = () => {
  const { loading } = useContext(LoginContext);
  const { videoPlaying } = useContext(VideoContext);

  return (
    <>
      {loading > 0 && <Loader />}
      {videoPlaying && <Player video={videoPlaying} />}
      <Header />
      <ContentWrapper>
        <Router />
      </ContentWrapper>
      <Footer />
    </>
  );
};

const Home = () => {
  const { loggedIn, error } = useContext(LoginContext);

  return (
    <MainScreeen>
      {loggedIn ? (
        <VideoProvider>
          <VideoModule />
        </VideoProvider>
      ) : (
        <Login />
      )}
      <Notification show={!!error}>
        <Text>{error}</Text>
      </Notification>
    </MainScreeen>
  );
};

export default Home;
