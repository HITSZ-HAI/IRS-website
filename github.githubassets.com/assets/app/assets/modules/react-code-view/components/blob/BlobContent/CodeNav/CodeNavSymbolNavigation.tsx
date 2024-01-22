import {debounce} from '@github/mini-throttle'
import type {CodeSymbol, TreeNode} from '@github-ui/code-nav'
import {FilterIcon, XCircleFillIcon, XIcon} from '@primer/octicons-react'
import {Box, IconButton, Octicon, Text, TextInput} from '@primer/react'
import {useEffect, useMemo, useRef, useState} from 'react'

// eslint-disable-next-line no-restricted-imports
import {filterSort} from '../../../../../github/filter-sort'
// eslint-disable-next-line no-restricted-imports
import {compare, fuzzyScore} from '../../../../../github/fuzzy-filter'
import {AllShortcutsEnabled} from '../../../../components/AllShortcutsEnabled'
import {useFocusSymbolPane} from '../../../../hooks/use-focus-symbol-pane'
import {useReposAnalytics} from '../../../../hooks/use-repos-analytics'
import {CodeNavSymbolTree} from './CodeNavSymbolTree'
import {JumpToItemList} from './JumpToItemList'
import {SymbolZeroState} from './SymbolZeroState'

export const symbolsHeaderId = 'symbols-pane-header'
/**
 * An action menu that allows the user to navigate to certain sections of a given
 * file.
 *
 * This was modeled after RefSelector, but couldn't be shoehorned into a generic
 * ActionMenu component because it needs to have different functionality and specific
 * visual rendering. It could potentially be made into a generic ActionMenu component
 * where RefSelector and this component could both use it, but it didn't seem worth the
 * effort.
 *
 */
export function CodeNavSymbolNavigation({
  codeSymbols,
  onSymbolSelect,
  treeSymbols,
  autoFocusSearch,
  onClose,
}: {
  codeSymbols: CodeSymbol[]
  onSymbolSelect: (sym: CodeSymbol) => void
  treeSymbols: TreeNode[]
  autoFocusSearch: boolean
  onClose: () => void
}) {
  const [filterText, setFilterText] = useState('')
  const [filteredCodeSymbols, setFilteredCodeSymbols] = useState(codeSymbols)
  useEffect(() => {
    if (filterText === '') {
      setFilteredCodeSymbols(codeSymbols)
      return
    }
    const filteredResult = getFilteredCodeSymbols(filterText, codeSymbols)
    setFilteredCodeSymbols(filteredResult)
  }, [filterText, codeSymbols])
  return (
    <JumpToActionList
      treeSymbols={treeSymbols}
      codeSymbols={filteredCodeSymbols}
      filterText={filterText}
      setFilterText={setFilterText}
      onSymbolSelect={onSymbolSelect}
      autoFocusSearch={autoFocusSearch}
      onClose={onClose}
    />
  )
}

export function JumpToActionList({
  codeSymbols,
  setFilterText,
  filterText,
  onSymbolSelect,
  treeSymbols,
  autoFocusSearch,
  onClose,
}: {
  codeSymbols: CodeSymbol[]
  setFilterText: (filterText: string) => void
  filterText: string
  onSymbolSelect: (sym: CodeSymbol) => void
  treeSymbols: TreeNode[]
  autoFocusSearch: boolean
  onClose: () => void
}) {
  const hasCodeSymbols = codeSymbols?.length > 0
  const hasLocalCodeSymbols = treeSymbols.length > 0
  const hasAnySymbols = hasCodeSymbols || hasLocalCodeSymbols
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const {sendRepoKeyDownEvent} = useReposAnalytics()
  const filterSymbolsRef = useRef<HTMLInputElement>(null)
  const listIsFilteredOrEmpty = !hasLocalCodeSymbols || filterText !== ''

  useEffect(() => {
    if (autoFocusSearch) {
      filterSymbolsRef.current?.focus()
    }
  }, [autoFocusSearch])

  useFocusSymbolPane(() => {
    filterSymbolsRef.current?.focus()
  })

  //TODO: this debounce does NOT cancel all outstanding debounce events for some reason, look into why that is the case
  //for the case of this event, it will send a keydown event for every key pressed in the filter, which is obviously
  //not what we care about. In the meantime, using a timeout that is declared globally (becuase it is reset on every
  // render) to cancel the timeout and only send the event when the user stops typing
  const debouncedSendStats = useMemo(
    () =>
      debounce(() => {
        sendRepoKeyDownEvent('BLOB_SYMBOLS_MENU.FILTER_SYMBOLS')
      }, 400),
    [sendRepoKeyDownEvent],
  )
  return (
    <Box sx={{py: 2, px: 3}} aria-labelledby={symbolsHeaderId}>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <Box
          as={'h2'}
          sx={{
            fontSize: 1,
            order: 1,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 600,
          }}
          id={symbolsHeaderId}
          tabIndex={-1}
        >
          Symbols
        </Box>

        <IconButton
          aria-label="Close symbols"
          data-hotkey="Escape"
          icon={XIcon}
          sx={{
            order: 3,
            color: 'fg.default',
            mr: -2,
          }}
          onClick={onClose}
          variant="invisible"
        />
      </Box>
      {hasAnySymbols && (
        <Box sx={{fontSize: 0, color: 'fg.muted', pt: 2}}>
          Find definitions and references for functions and other symbols in this file by clicking a symbol below or in
          the code.
        </Box>
      )}
      {(hasCodeSymbols || filterText !== '') && (
        <TextInput
          block
          leadingVisual={() => <Octicon aria-hidden="true" icon={FilterIcon} />}
          ref={filterSymbolsRef}
          trailingAction={
            filterText ? (
              <TextInput.Action
                onClick={() => {
                  setFilterText('')
                  setFocusedIndex(-1)
                }}
                icon={XCircleFillIcon}
                aria-label="Clear input"
                data-testid="clear-search"
                sx={{color: 'fg.subtle'}}
              />
            ) : (
              <></>
            )
          }
          trailingVisual={
            filterText
              ? undefined
              : () => (
                  <AllShortcutsEnabled>
                    <Box sx={{mr: '6px'}}>
                      <kbd>r</kbd>
                    </Box>
                  </AllShortcutsEnabled>
                )
          }
          sx={{mt: 2, borderRadius: 2}}
          placeholder="Filter symbols"
          value={filterText}
          name="Filter symbols"
          aria-label="Filter symbols"
          aria-controls={!hasCodeSymbols && listIsFilteredOrEmpty ? 'filter-zero-state' : 'filter-results'}
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={focusedIndex === -1 ? undefined : `jump-to-item-${focusedIndex}`}
          onKeyDown={e => {
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            if (e.key === 'ArrowDown' || ((e.key === 'N' || e.key === 'n') && e.ctrlKey)) {
              const nextIndex = Math.min(focusedIndex + 1, codeSymbols.length - 1)
              setFocusedIndex(nextIndex)
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            } else if (e.key === 'ArrowUp' || ((e.key === 'P' || e.key === 'p') && e.ctrlKey)) {
              const nextIndex = Math.max(focusedIndex - 1, 0)
              setFocusedIndex(nextIndex)
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            } else if (e.key === 'Enter' && codeSymbols[focusedIndex]) {
              onSymbolSelect(codeSymbols[focusedIndex]!)
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            } else if (e.key === 'Escape') {
              onClose()
            }
          }}
          role="combobox"
          onChange={e => {
            const target = e.target
            setFilterText(target.value)

            debouncedSendStats()
            setFocusedIndex(-1)
          }}
        />
      )}
      {!listIsFilteredOrEmpty && (
        // The underlying Tree component has a padding built into it with no sx available (due to it being a raw ul element).
        // In order to "trim" the padding off, we use negative margin. In a perfect world, either the wrapping component defines
        // the padding of its children or an sx override is provided. We may want to follow up with this relatively soon.
        <Box sx={{ml: -3, mb: -2}}>
          <CodeNavSymbolTree treeSymbols={treeSymbols} onTreeSymbolSelect={onSymbolSelect} />
        </Box>
      )}
      {hasCodeSymbols && listIsFilteredOrEmpty && (
        <JumpToItemList
          codeSymbols={codeSymbols}
          filterText={filterText}
          onSelect={onSymbolSelect}
          focusedIndex={focusedIndex}
        />
      )}
      {!hasCodeSymbols && listIsFilteredOrEmpty && (
        <Text sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2}}>
          <SymbolZeroState filterText={filterText} />
        </Text>
      )}
    </Box>
  )
}

function getFilteredCodeSymbols(searchTerm: string, codeSymbols: CodeSymbol[]): CodeSymbol[] {
  const fuzzyQuery = searchTerm.replace(/\s/g, '')
  const key = (r: CodeSymbol) => {
    const score = fuzzyScore(r.name, fuzzyQuery)
    return score > 0 ? {score, text: r.name} : null
  }
  return filterSort(codeSymbols, key, compare)
}

try{ CodeNavSymbolNavigation.displayName ||= 'CodeNavSymbolNavigation' } catch {}
try{ JumpToActionList.displayName ||= 'JumpToActionList' } catch {}