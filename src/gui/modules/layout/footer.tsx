import React from "react"
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { PATHS } from 'src/router/path'
import { button } from 'src/utils/styled'
import { theme } from 'src/utils/theme'

const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  border-top: 1px solid #dddddd;
`
const ButtonLink = styled(NavLink)`
  ${button}
  width: 35%;
  text-decoration: none;
  border-top: 2px solid ${theme.primary};
  
  &.active {
    border-color: ${theme.active};
    color: ${theme.active};
  }
`

const Footer = () => {

  return (
    <FooterWrapper>
      <ButtonLink to={PATHS.FEED} activeClassName="active">Feed</ButtonLink>
      <ButtonLink to={PATHS.WATCHLIST} activeClassName="active">Watchlist</ButtonLink>
      <ButtonLink to={PATHS.PROFILE} activeClassName="active">Profile</ButtonLink>
    </FooterWrapper>
  )
}
export default Footer