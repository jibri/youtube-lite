import React from 'react'
import styled from 'styled-components'
import { theme } from 'src/utils/theme'

/*
export const Spinner = styled.div`
height: 50px;
width: 50px;
border: 5px solid ${theme.active};
border-bottom-color: transparent;
border-radius: 50%;

animation: goRound 1s infinite linear;
  @keyframes goRound {
    from { transform: rotate(0); }
    to { transform: rotate(360deg); }
  }
`
const Overlay = styled.div`
  position: fixed;
  top:0;
  left:0;
  width: 100%;
  height: 100%;
  background-color: #00000011;

  display: flex;
  justify-content: center;
  align-items: center;
`
*/
export const LoadingBar = styled.div`
  position: fixed;
  top: 0;
  z-index: ${theme.zIndex.popup};
  height: 3px;
  width: 15%;
  background-color: ${theme.active};
  animation: run 1s infinite linear;
    @keyframes run {
      0% { margin-left: 0; width: 5%; }
      50% { margin-left: 40%; width: 35%; }
      90% { margin-left: 85%;  width: 15%; }
      100% { margin-left: 100%;  width: 0%; }
    }
`
const Loader = () => (
  <LoadingBar />
)
export default Loader