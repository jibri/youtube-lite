import { PATHS } from "src/router/path";
import { ButtonLink, FooterWrapper } from "src/utils/styled";

const Footer = () => (
  <FooterWrapper>
    <ButtonLink to={PATHS.FEED}>Feed</ButtonLink>
    <ButtonLink to={PATHS.PLAYLIST}>Playlist</ButtonLink>
    <ButtonLink to={PATHS.PLAYLISTS}>Playlists</ButtonLink>
    <ButtonLink to={PATHS.PARAMETERS}>Parameters</ButtonLink>
  </FooterWrapper>
);
export default Footer;
