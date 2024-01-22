import {announce} from '@github-ui/aria-live'
import type {CodeSymbol} from '@github-ui/code-nav'
import {FocusKeys} from '@primer/behaviors'
import {ActionList, useFocusZone} from '@primer/react'
import type React from 'react'
import {useEffect, useRef} from 'react'

import {JumpToItem} from './JumpToItem'

interface JumpToItemListProps {
  filterText: string
  codeSymbols: CodeSymbol[]
  onSelect: (element: CodeSymbol) => void
  focusedIndex: number
}

const maxHeight = '68vh'
/**
 * A list of symbols that can be filtered by a search string
 */
export function JumpToItemList(props: JumpToItemListProps) {
  return <FullJumpToItemList {...props} />
}

function FullJumpToItemList({codeSymbols, filterText, onSelect, focusedIndex}: JumpToItemListProps) {
  const codeSymbolsLength = useRef(codeSymbols.length)
  // Use this ref to append a zero-width space to the end of the message to force aria to reread messages
  const codeSymbolMessageAriaHack = useRef('')
  const {containerRef} = useFocusZone({
    bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd,
  })

  useEffect(() => {
    if (codeSymbols.length === codeSymbolsLength.current) {
      codeSymbolMessageAriaHack.current += '\u200B'
    }
    const codeSymbolText = codeSymbols.length === 1 ? 'symbol' : 'symbols'
    announce(`${codeSymbols.length} ${codeSymbolText} found${codeSymbolMessageAriaHack.current}`)
    codeSymbolsLength.current = codeSymbols.length
  }, [codeSymbols])
  return (
    <ActionList
      ref={containerRef as React.Ref<HTMLUListElement>}
      role="listbox"
      id="filter-results"
      aria-orientation="vertical"
      sx={{maxHeight, overflowY: 'auto'}}
    >
      {codeSymbols.map((sym, index) => {
        const {name, lineNumber} = sym
        return (
          <JumpToItem
            key={`${name}_${lineNumber}`}
            symbol={sym}
            filterText={filterText}
            onSelect={onSelect}
            focused={index === focusedIndex}
            index={index}
          />
        )
      })}
    </ActionList>
  )
}

try{ JumpToItemList.displayName ||= 'JumpToItemList' } catch {}
try{ FullJumpToItemList.displayName ||= 'FullJumpToItemList' } catch {}