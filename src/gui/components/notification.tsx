import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div<{ show: boolean; animationDuration: number }>`
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

  background-color: ${(props) => props.theme.primary};

  transition: all ${(props) => props.animationDuration}ms ease-in-out;
  left: ${(p) => (p.show ? 0 : "-100%")};
  opacity: ${(p) => (p.show ? 1 : 0)};
`;

const Notification = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
  const [showChildren, setShowChildren] = useState(false);
  const animationDuration = 300;

  useEffect(() => {
    if (show) {
      setShowChildren(true);
    } else {
      // Children sont retirés à la fin de l'animation pour eviter de voir la notif se réduire juste avant d'etre retirée
      setTimeout(() => setShowChildren(false), animationDuration);
    }
  }, [show]);

  return (
    <Container show={show} animationDuration={animationDuration}>
      {/* on cache les enfant lorsque la notif n'est pas affichée pour éviter que ses element ne puissent prendre le focus */}
      {showChildren && children}
    </Container>
  );
};
export default Notification;
