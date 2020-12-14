import React from 'react'
import styled, { css } from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Flex = styled.div<{ jc?: string, ai?: string, fw?: string, fd?: string }>`
  display: flex;
  justify-content: ${p => p.jc};
  align-items: ${p => p.ai};
  flex-wrap: ${p => p.fw};
  flex-direction: ${p => p.fd};
`
const FixedLayout = styled.div<{ bottom?: boolean }>`
  position: fixed;
  display: flex;
  width: 100%;
  box-shadow: 0 0 5px #00000055;
  z-index: ${props => props.theme.zIndex.header};
  
  ${props => props.bottom && css`bottom: 0;`}
`
export const HeaderWrapper = (props: any) => <FixedLayout {...props} />
export const FooterWrapper = (props: any) => <FixedLayout bottom={true}  {...props} />

export const button = css`
  color: ${props => props.theme.text.main};
  text-align: center;
  height: 3em;
  line-height: 3em;
  font-weight: bold;
  background-color: ${props => props.theme.primary};
  flex: 1 1 0;
  cursor: pointer;
  :hover {
    border-color: ${props => props.theme.active};
    color: ${props => props.theme.active};
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
    border-color: ${props => props.theme.active};
    color: ${props => props.theme.active};
  }
`

export const ActionButton = styled(Flex).attrs(() => ({ ai: 'center' })) <{ height?: string }>`
  background-color: ${props => props.theme.primary};
  padding: 0 10px;
  border-left: 1px solid ${props => props.theme.text.light};
  height: ${p => p.height};
  color: ${props => props.theme.text.main};
  cursor: pointer;
    &:hover {
    background-color: ${props => props.theme.secondary};
    color: ${props => props.theme.active};
  }
`
export const VideoWrapper = styled(Flex)`
  margin-bottom: 1px;
  cursor: pointer;
    &:hover {
    background-color: ${props => props.theme.secondary};
  }
`

export const Text = styled.span`
  color: ${props => props.theme.text.main};
`