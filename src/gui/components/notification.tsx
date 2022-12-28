import React from "react";
import styled from "styled-components";

const Container = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: calc(100% - 2em);
  z-index: ${(props) => props.theme.zIndex.popup};

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${(props) => props.theme.black};
  color: ${(props) => props.theme.white};

  transition: all 0.3s ease;
  padding: ${(p) => (p.show ? "5px 1em" : 0)};
  height: ${(p) => (p.show ? "2em" : 0)};
  opacity: ${(p) => (p.show ? 1 : 0)};
`;

const Notification = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <Container show={show}>{children}</Container>
);
export default Notification;
