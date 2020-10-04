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
import Player from 'src/gui/components/player'
import Header from '../layout/header'

const MainScreeen = styled.div`
  min-height: 100vh;
  width: 100%;
`
const ContentWrapper = styled.div`
  padding: ${theme.headerHeigth} 0;
`

const VideoModule = () => {
  const { loading } = useContext(LoginContext)
  const { videoPlaying } = useContext(VideoContext)

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
