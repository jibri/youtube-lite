import React, { useState } from "react"
import { Link } from 'react-router-dom'
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
const ButtonLink = styled(Link) <{ active: boolean }>`
  ${button}
  width: 35%;
  text-decoration: none;
  border-top: ${p => p.active ? `2px solid ${theme.active}` : 'none'};
  color: ${p => p.active ? theme.active : 'auto'};
`
const Footer = () => {
  const [active, setActive] = useState(0)

  return (
    <FooterWrapper>
      <ButtonLink to={PATHS.FEED} onClick={() => setActive(0)} active={active === 0}>Feed</ButtonLink>
      <ButtonLink to={PATHS.WATCHLIST} onClick={() => setActive(1)} active={active === 1}>Watchlist</ButtonLink>
      <ButtonLink to={PATHS.PROFILE} onClick={() => setActive(2)} active={active === 2}>Profile</ButtonLink>
    </FooterWrapper>
  )
}
export default Footer