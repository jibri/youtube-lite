import React from 'react'
import styled, { css } from 'styled-components'
import { theme } from './theme'
import { NavLink } from 'react-router-dom'

export const Flex = styled.div<{ jc?: string, ai?: string, fw?: string, fd?: string }>`
  display: flex;
  justify-content: ${p => p.jc};
  align-items: ${p => p.ai};
  flex-wrap: ${p => p.fw};
  flex-direction: ${p => p.fd};
`
const FixedLayout = styled.div<{ top: boolean }>`
  position: fixed;
  display: flex;
  width: 100%;
  box-shadow: 0 0 5px #00000055;
  z-index: ${theme.zIndex.header};
  
  ${props => props.top
    ? css`top: 0;`
    : css`bottom: 0;`
  }
`
export const HeaderWrapper = (props: any) => <FixedLayout top={true} {...props} />
export const FooterWrapper = (props: any) => <FixedLayout top={false} {...props} />

export const button = css`
  color: ${theme.text.main};
  text-align: center;
  height: 3em;
  line-height: 3em;
  font-weight: bold;
  background-color: ${theme.primary};
  flex: 1 1 0;
  cursor: pointer;
  :hover {
    border-color: ${theme.active};
    color: ${theme.active};
  }
`
export const TopButton = styled.div`
  ${button}
  border-bottom: 2px solid transparent;
`
export const ButtonLink = styled(NavLink).attrs({ activeClassName: 'active' })`
  ${button}
  text-decoration: none;
  border-top: 2px solid transparent;
  
  &.active {
    border-color: ${theme.active};
    color: ${theme.active};
  }
`

export const ActionButton = styled(Flex).attrs(() => ({ ai: 'center' })) <{ height?: string }>`
  background-color: ${theme.primary};
  padding: 0 10px;
  border-left: 1px solid #dddddd;
  height: ${p => p.height};
  cursor: pointer;
    &:hover {
    background-color: ${theme.secondary};
    color: ${theme.active};
  }
`
export const VideoWrapper = styled(Flex)`
  margin-bottom: 1px;
  cursor: pointer;
    &:hover {
    background-color: ${theme.secondary};
  }
`
