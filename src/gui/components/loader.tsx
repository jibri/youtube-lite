import React from 'react'
import styled from 'styled-components'
import { theme } from 'src/utils/theme'

export const LoadingBar = styled.div`
  position: fixed;
  top: 0;
  z-index: ${theme.zIndex.loader};
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