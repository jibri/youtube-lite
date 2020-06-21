import React, { useContext } from "react"
import Router from 'src/router'
import Footer from 'src/gui/modules/layout/footer'
import Login from 'src/gui/modules/login/login'
import { LoginContext } from 'src/data/context/loginProvider'
import VideoProvider from 'src/data/context/videoProvider'
import styled from 'styled-components'
import Error from 'src/gui/components/error'
import { theme } from 'src/utils/theme'

const MainScreeen = styled.div`
  height: 100vh;
  width: 100%;
`
const ContentWrapper = styled.div`
  margin-bottom: ${theme.footerHeigth};
`

const Home = () => {
  const { loggedIn, error } = useContext(LoginContext)

  return (
    <MainScreeen>
      {loggedIn
        ? (
          <VideoProvider>
            <ContentWrapper>
              <Router />
            </ContentWrapper>
            <Footer />
          </VideoProvider>
        ) : <Login />
      }
      <Error error={error} />
    </MainScreeen>
  )
}

export default Home
