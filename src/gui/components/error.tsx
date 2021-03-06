import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ error: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  z-index: ${props => props.theme.zIndex.popup};

  display: flex;
  align-items: center;

  background-color: ${props => props.theme.black};
  color: ${props => props.theme.white};

  transition: all 0.3s ease;
  padding: ${p => p.error ? '5px 0' : 0};
  min-height: ${p => p.error ? '2em' : 0};
  opacity: ${p => p.error ? 1 : 0};

`

const Error = ({ error }: { error?: string }) => (
  <Wrapper error={!!error}>
    {error}
  </Wrapper>
)
export default Error