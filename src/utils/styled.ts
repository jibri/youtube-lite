import styled, { css } from 'styled-components'
import { theme } from './theme'

export const Flex = styled.div<{ jc?: string, ai?: string, fw?: string }>`
  display: flex;
  justify-content: ${p => p.jc};
  align-items: ${p => p.ai};
  flex-wrap: ${p => p.fw};
`
export const button = css`
  color: ${theme.text.main};
  text-align: center;
  height: 3em;
  line-height: 3em;
  font-weight:bold;
  background-color: ${theme.primary};
  cursor: pointer;
  :hover {
    background-color: ${theme.secondary};
    color: ${theme.active};
  }
`
export const TopButton = styled.div`
  ${button}
  position: relative;
  z-index: ${theme.zIndex.header};
  box-shadow: 0 0 5px #00000055;
`
export const ActionButton = styled(Flex).attrs(() => ({ ai: 'center' }))`
  font-weight: bold;
  font-size: 2em;
  background-color: ${theme.primary};
  padding: 5px;
  border-left: 1px solid #dddddd;
  cursor: pointer;
  &:hover {
    background-color: ${theme.secondary};
    color: ${theme.active};
  }
`
export const VideoWrapper = styled(Flex)`
  margin-bottom: 1px;
  width: 100%;
  cursor: pointer;
  &:hover {
    background-color: ${theme.secondary};
  }
`
