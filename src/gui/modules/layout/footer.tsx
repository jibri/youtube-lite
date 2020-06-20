import React from "react"
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { PATHS } from 'src/router/path'
import { button } from 'src/utils/styled'

const FooterWrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  border-top: 1px solid #dddddd;
`
const ButtonLink = styled(Link)`
  ${button}
  width: 35%;
  text-decoration: none;
`
const Footer = () => (
  <FooterWrapper>
    <ButtonLink to={PATHS.FEED}>Feed</ButtonLink>
    <ButtonLink to={PATHS.WATCHLIST}>Watchlist</ButtonLink>
    <ButtonLink to={PATHS.PROFILE}>Profile</ButtonLink>
  </FooterWrapper>
)
export default Footer