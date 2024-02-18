import { PATHS } from "src/router/path";
import { ButtonLink } from "src/utils/styled";
import styled from "styled-components";

export const FooterWrapper = styled.div`
  position: fixed;
  z-index: ${(props) => props.theme.zIndex.player};
  width: 100%;
  max-width: ${(props) => props.theme.appMaxWidth};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
  box-shadow: 0 0 5px #00000055;
  bottom: 0;

  @media (max-width: 500px) {
    font-size: 0.8em;
  }
`;

const Footer = () => (
  <FooterWrapper>
    <ButtonLink to={PATHS.FEED}>Feed</ButtonLink>
    <ButtonLink to={PATHS.PLAYLIST}>Current playlist</ButtonLink>
    <ButtonLink to={PATHS.PLAYLISTS}>All playlists</ButtonLink>
    <ButtonLink to={PATHS.PARAMETERS}>Parameters</ButtonLink>
  </FooterWrapper>
);
export default Footer;
