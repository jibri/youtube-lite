import styled from "styled-components";

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  z-index: ${(props) => props.theme.zIndex.loader};
  width: ${(props) => props.theme.appMaxWidth};
  overflow: hidden;
`;

const LoadingBar = styled.div`
  height: 3px;
  background-color: ${(props) => props.theme.active};
  animation: run 1s infinite linear;
  width: 35%;
  @keyframes run {
    0% {
      margin-left: -35%;
    }
    100% {
      margin-left: 100%;
    }
  }
`;

const Loader = () => (
  <LoadingContainer>
    <LoadingBar />
  </LoadingContainer>
);
export default Loader;
