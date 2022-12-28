import React from "react";
import styled from "styled-components";

const Container = styled.div<{ show: boolean }>`
  position: fixed;
  left: 0;
  padding: 5px 1em;
  width: calc(100% - 2 * 1em);
  height: calc(2em - 2 * 5px);
  z-index: ${(props) => props.theme.zIndex.popup};
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${(props) => props.theme.black};
  color: ${(props) => props.theme.white};

  transition: all 0.3s ease;
  opacity: ${(p) => (p.show ? 1 : 0)};
  bottom: ${(p) => (p.show ? 0 : "-2em")};
`;

const Notification = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <Container show={show}>{children}</Container>
);
export default Notification;
