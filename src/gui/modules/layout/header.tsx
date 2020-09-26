import React, { useContext } from "react"
import { useLocation } from 'react-router-dom'
import { LoginContext } from 'src/data/context/loginProvider'
import { VideoContext } from 'src/data/context/videoProvider'
import { HeaderComponents, PATHS } from 'src/router/path'
import { HeaderWrapper, TopButton } from 'src/utils/styled'

const Header = () => {

  const { headerComponents } = useContext(LoginContext)
  const { fetchSubscriptions, fetchWatchList, setDescriptionOpened, playVideo } = useContext(VideoContext)
  const location = useLocation()

  return (
    <HeaderWrapper>
      {headerComponents[location.pathname as PATHS]?.map(component => {
        switch (component) {
          case HeaderComponents.FEED_RELOAD_BTN:
            return <TopButton onClick={() => fetchSubscriptions()}> Reload</TopButton >
          case HeaderComponents.WL_RELOAD_BTN:
            return <TopButton onClick={() => fetchWatchList()}>Reload</TopButton>
          case HeaderComponents.CLOSE_BTN:
            return <TopButton onClick={() => playVideo()}>Close</TopButton>
          case HeaderComponents.DESC_BTN:
            return <TopButton onClick={() => setDescriptionOpened(old => !old)}>Description</TopButton>
        }
        return null
      })
      }
    </HeaderWrapper>
  )
}
export default Header

