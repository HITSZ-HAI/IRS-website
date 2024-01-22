import type {CodeSymbol} from '@github-ui/code-nav'
import {HighlightedText} from '@github-ui/ref-selector/highlighted-text'
import {ActionList, Box, Link} from '@primer/react'
import React from 'react'

import {SymbolIndicator} from './SymbolIndicator'

interface JumpToItemProps {
  symbol: CodeSymbol
  filterText: string
  onSelect: (symbol: CodeSymbol) => void
  focused: boolean
  index: number
}
export const JumpToItem = React.memo(function JumpToItemInner({
  symbol,
  filterText,
  onSelect,
  focused,
  index,
}: JumpToItemProps) {
  const extraSx = focused ? {backgroundColor: 'var(--bgColor-muted, var(--color-canvas-subtle)) !important'} : {}

  return (
    <ActionList.Item
      role="option"
      id={`jump-to-item-${index}`}
      aria-selected={focused}
      sx={{minWidth: 0, ...extraSx}}
      onSelect={() => onSelect(symbol)}
    >
      <Link
        href={symbol.href()}
        sx={{
          ':hover': {
            textDecoration: 'none',
          },
        }}
      >
        <Box style={{display: 'flex'}}>
          <SymbolIndicator symbolKind={symbol.kind} />
          {
            '  ' // space for screen reader to read out text correctly
          }
          <Box style={{display: 'flex', minWidth: 0, alignItems: 'flex-end'}}>
            <HighlightedText
              key={symbol.fullyQualifiedName}
              search={filterText}
              text={symbol.name}
              overflowWidth={175}
              hideOverflow={true}
            />
          </Box>
        </Box>
      </Link>
    </ActionList.Item>
  )
})

try{ JumpToItem.displayName ||= 'JumpToItem' } catch {}