import { lazy, useContext } from "react";
import Router from "src/router";
import Footer from "src/gui/modules/layout/footer";
import { LoginContext } from "src/data/context/loginProvider";
import VideoProvider, { VideoContext } from "src/data/context/videoProvider";
import styled from "styled-components";
import Notification from "src/gui/components/notification";
import Loader from "src/gui/components/loader";
import Player from "src/gui/components/player";
import Header from "../layout/header";
import { ErrorContext } from "src/data/context/errorProvider";

const MainScreen = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.background};
`;

const MainContainer = styled.div`
  max-width: ${(props) => props.theme.appMaxWidth};
  margin: auto;
  background-color: ${(props) => props.theme.background};
  padding-bottom: ${(props) => props.theme.headerHeigth};

  @media (max-height: 650px) {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-areas:
      "video ."
      "video .";
  }
`;

const ContentWrapper = styled.div``;
const VideoContainer = styled.div`
  z-index: ${(props) => props.theme.zIndex.player};
  max-width: ${(props) => props.theme.appMaxWidth};
  position: sticky;
  top: 0;

  @media (max-height: 650px) {
    grid-area: video;

    position: initial;
    > :first-child {
      position: sticky;
      top: 0;
    }
  }
`;

const Login = lazy(() => import("src/gui/modules/login/login"));

const VideoModule = () => {
  const { loading } = useContext(LoginContext);
  const { videoPlaying } = useContext(VideoContext);

  return (
    <>
      {loading > 0 && <Loader />}
      <VideoContainer>
        <div>
          {videoPlaying && <Player key={`${videoPlaying.video.id}`} video={videoPlaying} />}
          <Header />
        </div>
      </VideoContainer>
      <ContentWrapper>
        <Router />
      </ContentWrapper>
      <Footer />
    </>
  );
};

const Home = () => {
  const { userId } = useContext(LoginContext);
  const error = useContext(ErrorContext);

  return (
    <MainScreen>
      <MainContainer>
        {userId ? (
          <VideoProvider>
            <VideoModule />
          </VideoProvider>
        ) : (
          <Login />
        )}
        <Notification show={!!error}>{error}</Notification>
      </MainContainer>
    </MainScreen>
  );
};

export default Home;
