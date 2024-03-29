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
  color: ${(props) => props.theme.text.main};
  text-align: center;
  height: 3em;
  line-height: 3em;
  font-weight: bold;
  background-color: ${(props) => props.theme.primary};
  flex: 1 0 auto;
  cursor: pointer;
  &:hover {
    border-color: ${(props) => props.theme.active};
    color: ${(props) => props.theme.active};
  }
`;
export const ButtonLink = styled(NavLink).attrs({ activeClassName: "active" })`
  ${button}
  text-decoration: none;
  border-top: 2px solid transparent;

  &.active {
    border-color: ${(props) => props.theme.active};
    color: ${(props) => props.theme.active};
  }
`;

export const ActionButton = styled.button<{
  height?: string;
}>`
  background-color: transparent;
  padding: 0 10px;
  height: ${(p) => p.height};
  color: ${(props) => props.theme.active};
  border: none;
  font-size: inherit;
  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.text.main};
  }
  &:active {
    color: ${(props) => props.theme.active};
  }
`;
export const VideoWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

export const Text = styled.span`
  color: ${(props) => props.theme.text.main};
`;
