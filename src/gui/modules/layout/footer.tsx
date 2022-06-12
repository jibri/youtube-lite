import React from "react";
import { PATHS } from "src/router/path";
import { ButtonLink, FooterWrapper } from "src/utils/styled";

const Footer = () => (
  <FooterWrapper>
    <ButtonLink to={PATHS.FEED}>Feed</ButtonLink>
    <ButtonLink to={PATHS.WATCHLIST}>Watchlist</ButtonLink>
    <ButtonLink to={PATHS.PROFILE}>Profile</ButtonLink>
  </FooterWrapper>
);
export default Footer;
