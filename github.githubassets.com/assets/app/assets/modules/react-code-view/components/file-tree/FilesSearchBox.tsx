import {debounce} from '@github/mini-throttle'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {SearchIcon, XCircleFillIcon} from '@primer/octicons-react'
import {Box, type SxProp, TextInput} from '@primer/react'
import React, {type MutableRefObject} from 'react'

import {AllShortcutsEnabled} from '../../components/AllShortcutsEnabled'
import {useShortcut} from '../../hooks/shortcuts'
import {useReposAnalytics} from '../../hooks/use-repos-analytics'
import {textAreaId} from '../../utilities/lines'
import {DuplicateOnKeydownButton} from '../DuplicateOnKeydownButton'

type Props = {
  ariaActiveDescendant?: string
  ariaControls?: string
  ariaExpanded?: boolean
  ariaHasPopup?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onPreload(): void
  onSearch(query: string): void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  query: string
  onFindFilesShortcut?: () => void
} & SxProp

export const FilesSearchBox = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      ariaActiveDescendant,
      ariaControls,
      ariaExpanded,
      ariaHasPopup,
      onBlur,
      onFocus,
      onKeyDown,
      onPreload,
      onSearch,
      query,
      onFindFilesShortcut,
      sx = {},
    },
    ref,
  ) => {
    const {sendRepoClickEvent} = useReposAnalytics()
    const [textValue, setTextValue] = React.useState(query)
    const debouncedOnSearch = React.useRef(debounce((newQuery: string) => onSearch(newQuery), 250))

    React.useEffect(() => {
      setTextValue(query)
    }, [query])

    const clearAction = query ? (
      <TextInput.Action
        onClick={() => {
          sendRepoClickEvent('FILE_TREE.CANCEL_SEARCH')
          onSearch('')
        }}
        icon={XCircleFillIcon}
        aria-label="Clear"
        sx={{color: 'fg.subtle'}}
      />
    ) : undefined

    return (
      <>
        <AllShortcutsEnabled>
          <FindFilesShortcut
            inputRef={ref as MutableRefObject<HTMLInputElement | null>}
            onFindFilesShortcut={onFindFilesShortcut}
          />
        </AllShortcutsEnabled>
        <TextInput
          // support for the search param can be removed once the tree is globally avaialble.
          // We want to focus the search box only if user navigates with ?search=1
          autoFocus={isSearchUrl()}
          ref={ref}
          value={textValue}
          onKeyDown={onKeyDown}
          onChange={e => {
            setTextValue(e.target.value)
            onPreload()
            debouncedOnSearch.current(e.target.value)
          }}
          sx={{display: 'flex', ...sx}}
          aria-label="Go to file"
          aria-activedescendant={ariaActiveDescendant}
          role={ariaHasPopup ? 'combobox' : undefined}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHasPopup ? 'dialog' : undefined}
          autoCorrect="off"
          spellCheck="false"
          placeholder="Go to file"
          leadingVisual={SearchIcon}
          trailingAction={clearAction}
          trailingVisual={
            clearAction
              ? undefined
              : () => (
                  <AllShortcutsEnabled>
                    <Box sx={{mr: '-6px'}}>
                      <kbd>t</kbd>
                    </Box>
                  </AllShortcutsEnabled>
                )
          }
          onFocus={e => {
            onPreload()
            e.target.select()
            onFocus?.(e)
          }}
          onBlur={onBlur}
          onClick={() => sendRepoClickEvent('FILE_TREE.SEARCH_BOX')}
        />
      </>
    )
  },
)

function FindFilesShortcut({
  inputRef,
  onFindFilesShortcut,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  onFindFilesShortcut?: () => void
}) {
  const {sendRepoKeyDownEvent} = useReposAnalytics()
  const {findFilesShortcut} = useShortcut()

  return (
    <DuplicateOnKeydownButton
      buttonFocusId={textAreaId}
      buttonHotkey={findFilesShortcut.hotkey}
      onButtonClick={() => {
        onFindFilesShortcut?.()
        inputRef.current?.focus()
        sendRepoKeyDownEvent('GO_TO_FILE')
      }}
    />
  )
}

/**
 * Whether the URL contains ?search=1 which indicates user is searching for a file
 */
export function isSearchUrl() {
  const params = new URLSearchParams(ssrSafeLocation.search)
  return params.get('search') === '1'
}

FilesSearchBox.displayName = 'FilesSearchBox'

try{ FindFilesShortcut.displayName ||= 'FindFilesShortcut' } catch {}