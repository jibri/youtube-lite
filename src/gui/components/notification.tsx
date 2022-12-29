import React from "react";
import styled from "styled-components";

const Container = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 3.5em;
  padding: 5px 1em;
  min-width: min(35vw, 15em);
  max-width: calc(100vw - 2 * 1em);
  min-height: 2em;
  max-height: 5em;
  z-index: ${(props) => props.theme.zIndex.popup};
  overflow: hidden;
  border-radius: 0 10px 10px 0;
  box-shadow: 2px 2px 5px #00000055;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${(props) => props.theme.notification.background};

  transition: all 0.3s ease-in-out;
  left: ${(p) => (p.show ? 0 : "-100%")};
  opacity: ${(p) => (p.show ? 1 : 0)};
`;

const Notification = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <Container show={show}>{children}</Container>
);
export default Notification;
