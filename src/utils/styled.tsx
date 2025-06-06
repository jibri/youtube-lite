import styled, { css } from "styled-components";
import { NavLink } from "react-router-dom";

export const Flex = styled.div<{
  jc?: string;
  ai?: string;
  fw?: string;
  fd?: string;
}>`
  display: flex;
  justify-content: ${(p) => p.jc};
  align-items: ${(p) => p.ai};
  flex-wrap: ${(p) => p.fw};
  flex-direction: ${(p) => p.fd};
`;

export const button = css`
  color: ${(props) => props.theme.palette.text.primary};
  /* text-align: center; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 3em;
  /* line-height: 3em; */
  font-weight: bold;
  background-color: ${(props) => props.theme.palette.secondary.dark};
  flex: 1 0 auto;
  cursor: pointer;
  &:hover {
    border-color: ${(props) => props.theme.palette.primary.main};
    color: ${(props) => props.theme.palette.primary.main};
  }
`;

export const ButtonLink = styled(NavLink).attrs({ activeClassName: "active" })`
  ${button}
  text-decoration: none;
  border-top: 2px solid transparent;

  &.active {
    border-color: ${(props) => props.theme.palette.primary.main};
    color: ${(props) => props.theme.palette.primary.main};
  }
`;

export const ActionButton = styled.button<{
  height?: string;
}>`
  background-color: transparent;
  padding: 0 10px;
  height: ${(p) => p.height};
  color: ${(props) => props.theme.palette.primary.main};
  border: none;
  font-size: inherit;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.palette.text.primary};
  }
  &:active {
    color: ${(props) => props.theme.palette.primary.main};
  }
`;
export const ActionWrapper = styled.div`
  /* width: ${(props) => props.theme.video.height}; */
  font-size: ${(props) => `calc(${props.theme.video.height} - 50px)`};
  display: flex;
  justify-content: center;
  align-items: center;

  > * {
    margin: 0 10px;
    color: ${(props) => props.theme.palette.text.primary};
    &:hover {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }
`;
export const VideoWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

export const Text = styled.span`
  color: ${(props) => props.theme.palette.text.primary};
`;
