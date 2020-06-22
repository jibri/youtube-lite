import React, { useContext } from "react"
import Router from 'src/router'
import Footer from 'src/gui/modules/layout/footer'
import Login from 'src/gui/modules/login/login'
import { LoginContext } from 'src/data/context/loginProvider'
import VideoProvider, { VideoContext } from 'src/data/context/videoProvider'
import styled from 'styled-components'
import Error from 'src/gui/components/error'
import { theme } from 'src/utils/theme'
import Loader from 'src/gui/components/loader'
import { TopButton } from 'src/utils/styled'

const MainScreeen = styled.div`
  min-height: 100vh;
  width: 100%;
`
const ContentWrapper = styled.div`
  margin-bottom: ${theme.footerHeigth};
`
const IFrameWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.popup};
`

const VideoModule = () => {
  const { loading } = useContext(LoginContext)
  const { player, setPlayer } = useContext(VideoContext)
  return (
    <>
      {player && (
        <IFrameWrapper>
          <iframe
            title="video_player"
            width="100%"
            height="270"
            src={`//www.youtube.com/embed/${player}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <TopButton onClick={() => setPlayer(undefined)}>Close</TopButton>
        </IFrameWrapper>
      )}
      <ContentWrapper>
        <Router />
      </ContentWrapper>
      {loading > 0 && <Loader />}
      <Footer />
    </>
  )
}

const Home = () => {
  const { loggedIn, error } = useContext(LoginContext)

  return (
    <MainScreeen>
      {loggedIn
        ? <VideoProvider><VideoModule /></VideoProvider>
        : <Login />
      }
      <Error error={error} />
    </MainScreeen>
  )
}

export default Home
