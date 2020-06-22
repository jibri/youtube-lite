import React from 'react'
import styled from 'styled-components'
import { theme } from 'src/utils/theme'


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

const Loader = () => (
  <Overlay>
    <Spinner />
  </Overlay>
)
export default Loader