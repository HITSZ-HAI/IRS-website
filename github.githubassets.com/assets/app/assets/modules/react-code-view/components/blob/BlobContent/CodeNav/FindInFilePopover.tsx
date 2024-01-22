import type {DefinitionOrReference} from '@github-ui/code-nav'
import {ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon} from '@primer/octicons-react'
import {Box, IconButton, Label, Octicon, Text, TextInput} from '@primer/react'
import {lazy, Suspense, useEffect, useRef, useState} from 'react'

import {useShortcut} from '../../../../hooks/shortcuts'
import {useIsCursorEnabled} from '../../../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../../../hooks/use-repos-analytics'
import {scrollLineIntoView} from '../../../../hooks/use-scroll-line-into-view'
import {textAreaId} from '../../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../../DuplicateOnKeydownButton'

const ScrollMarks = lazy(() => import('./ScrollMarks'))

export default function FindInFilePopover({
  stickied,
  searchTerm,
  searchResults,
  setSearchTerm,
  focusedSearchResult,
  setFocusedSearchResult,
  onClose,
}: {
  stickied?: boolean
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  focusedSearchResult: number | undefined
  setFocusedSearchResult: (idx: number | undefined) => void
  searchResults: DefinitionOrReference[]
  onClose: () => void
}) {
  const cursorEnabled = useIsCursorEnabled()
  const inputContainer = useRef<HTMLInputElement>(null)

  const {findInFileShortcut, findSelectionShortcut, findNextShortcut, findPrevShortcut} = useShortcut()
  const [escapeToBrowserOnNextKeyPress, setEscapeToBrowserOnNextKeyPress] = useState(true)
  const clearSearch = () => {
    setSearchTerm('')
    setFocusedSearchResult(0)
  }
  const {sendRepoKeyDownEvent} = useReposAnalytics()

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setEscapeToBrowserOnNextKeyPress(false)
      setSearchTerm(event.target.value)

      if (focusedSearchResult === undefined) {
        setFocusedSearchResult(0)
      }
    } else {
      setEscapeToBrowserOnNextKeyPress(true)
      clearSearch()
    }
  }

  const jumpToResult = (direction: number) => {
    if (focusedSearchResult === undefined) {
      setFocusedSearchResult(0)
      return
    }

    if (direction === 1) {
      setFocusedSearchResult(focusedSearchResult === searchResults.length - 1 ? 0 : focusedSearchResult + 1)
    } else {
      setFocusedSearchResult(focusedSearchResult === 0 ? searchResults.length - 1 : focusedSearchResult - 1)
    }
  }

  useEffect(() => {
    inputContainer.current?.focus()
    inputContainer.current?.select()
  }, [])

  const onHotkey = () => {
    const selected = window.getSelection()?.toString()
    if (selected?.length) {
      setSearchTerm(selected)
      setFocusedSearchResult(0)
      sendRepoKeyDownEvent('BLOB_FIND_IN_FILE_MENU.FIND_IN_FILE_FROM_SELECTION')
    }
    inputContainer.current?.focus()
    inputContainer.current?.select()
  }

  useEffect(() => {
    if (searchResults.length > 0 && focusedSearchResult !== undefined) {
      scrollLineIntoView({
        line: searchResults[focusedSearchResult]!.lineNumber,
        column: searchResults[focusedSearchResult]!.ident.start.column,
      })
    }
  }, [searchResults, focusedSearchResult])

  if (cursorEnabled) return null

  return (
    <Box
      className={`find-in-file-popover ${
        stickied ? 'find-in-file-popover-stickied' : 'find-in-file-popover-not-stickied'
      }`}
    >
      <Box
        sx={{
          fontSize: 0,
          py: 2,
          pl: 3,
          pr: 2,
          borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'baseline'}}>
          <Text as="h5" sx={{color: 'fg.default', pr: 2, fontWeight: 'bold'}}>
            Find
          </Text>
          <Text
            className={'find-text-help-tooltip'}
            sx={{color: 'fg.subtle', visibility: escapeToBrowserOnNextKeyPress ? 'visible' : 'hidden'}}
          >
            Press <Label>{findInFileShortcut.text}</Label> again to open the browser&apos;s find menu
          </Text>
        </Box>
        <Box sx={{flex: 1}} />
        <IconButton
          variant="invisible"
          size="small"
          onClick={onClose}
          icon={XIcon}
          sx={{color: 'fg.subtle'}}
          aria-label="Close find in file"
        />
      </Box>
      <Box sx={{px: 2, py: '6px'}}>
        <TextInput
          ref={inputContainer}
          sx={{pl: 1, border: 'none', boxShadow: 'none'}}
          validationStatus={searchResults.length > 1000 ? 'error' : undefined}
          type="text"
          leadingVisual={() => <Octicon icon={SearchIcon} aria-hidden="true" />}
          aria-labelledby="find-in-file-label"
          aria-expanded="true"
          autoComplete="off"
          name="Find in file input"
          placeholder="Search this file"
          value={searchTerm}
          block
          onChange={onChange}
          trailingAction={
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <Text className="text-small" sx={{textAlign: 'center', color: 'fg.subtle', m: 2}}>
                {searchResults.length === 0 || focusedSearchResult === undefined ? 0 : focusedSearchResult + 1}/
                {searchResults.length}
              </Text>
              <IconButton
                size="small"
                variant="invisible"
                onClick={() => {
                  jumpToResult(-1)
                }}
                icon={ChevronUpIcon}
                aria-label="Up"
                data-testid="up-search"
                sx={{color: 'fg.subtle'}}
              />
              <IconButton
                size="small"
                variant="invisible"
                onClick={() => {
                  jumpToResult(1)
                }}
                icon={ChevronDownIcon}
                aria-label="Down"
                data-testid="down-search"
                sx={{color: 'fg.subtle'}}
              />
            </Box>
          }
          onKeyDown={(keyboardEvent: React.KeyboardEvent) => {
            if (keyboardEvent.code === 'Enter' || keyboardEvent.code === 'NumpadEnter') {
              if (keyboardEvent.shiftKey) {
                jumpToResult(-1)
              } else {
                jumpToResult(1)
              }
            } else if (
              (keyboardEvent.metaKey || keyboardEvent.ctrlKey) &&
              (keyboardEvent.key === 'g' || keyboardEvent.key === 'G')
            ) {
              keyboardEvent.preventDefault()
              keyboardEvent.shiftKey ? jumpToResult(-1) : jumpToResult(1)
            } else if (
              (keyboardEvent.metaKey || keyboardEvent.ctrlKey) &&
              (keyboardEvent.key === 'f' || keyboardEvent.key === 'F')
            ) {
              if (escapeToBrowserOnNextKeyPress) {
                // The user wants to use the browser's find in page functionality.
                // So just close this pane and get it out of their way.
                sendRepoKeyDownEvent('BLOB_FIND_IN_FILE_MENU.FALLBACK_TO_BROWSER_SEARCH')
                onClose()
              } else {
                setEscapeToBrowserOnNextKeyPress(true)
                keyboardEvent.preventDefault()
                inputContainer.current?.focus()
                inputContainer.current?.select()
              }
            } else if (keyboardEvent.key === 'Escape') {
              onClose()
            }
          }}
        />

        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={findInFileShortcut.hotkey}
          onButtonClick={onHotkey}
          buttonTestLabel={'hotkey-button'}
        />
        <button
          hidden={true}
          data-hotkey={findSelectionShortcut.hotkey}
          onClick={onHotkey}
          data-testid="selection-hotkey"
        />
        <button
          hidden={true}
          data-hotkey={findNextShortcut.hotkey}
          onClick={() => jumpToResult(1)}
          data-testid="find-next-button"
        />
        <button
          hidden={true}
          data-hotkey={findPrevShortcut.hotkey}
          onClick={() => jumpToResult(-1)}
          data-testid="find-prev-button"
        />
        <Suspense fallback={null}>
          <ScrollMarks definitionsOrReferences={searchResults} />
        </Suspense>
      </Box>
    </Box>
  )
}

try{ ScrollMarks.displayName ||= 'ScrollMarks' } catch {}
try{ FindInFilePopover.displayName ||= 'FindInFilePopover' } catch {}