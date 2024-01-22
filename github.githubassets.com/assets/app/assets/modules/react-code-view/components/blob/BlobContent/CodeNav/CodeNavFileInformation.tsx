import type {DefinitionOrReference} from '@github-ui/code-nav'
import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ChevronDownIcon, ChevronRightIcon, FoldIcon, UnfoldIcon} from '@primer/octicons-react'
import {Box, Button, CounterLabel, Octicon, Truncate} from '@primer/react'
import React, {useCallback, useEffect, useState} from 'react'

import {useCurrentBlame} from '../../../../hooks/CurrentBlame'
import {useFilesPageInfo} from '../../../../hooks/FilesPageInfo'
import {useKeyboardNavUsed} from '../../../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../../../hooks/use-repos-analytics'
import {textAreaId} from '../../../../utilities/lines'
import {CodeNavCell, focusSibling} from './CodeNavCell'

const MaxReferences = 10

export interface CodeNavFileInformationProps {
  results: DefinitionOrReference[]
  repo: Repository
  filePath: string
  highlightedIndex?: number
  isDefinition?: boolean
  onClick?: (index: number) => void
  offset: number
  initiallyExpanded: boolean
  enableExpandCollapse: boolean
  symbol: string
  setFocusOnFile?: boolean
}

export function CodeNavFileInformation({
  results,
  repo,
  filePath,
  highlightedIndex,
  isDefinition,
  onClick,
  // The offset counts how many references are above this one
  offset,
  initiallyExpanded,
  enableExpandCollapse,
  symbol,
  setFocusOnFile,
}: CodeNavFileInformationProps) {
  const hasBlame = !!useCurrentBlame()
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)
  const currentRepo = useCurrentRepository()
  const {path: currentPath} = useFilesPageInfo()
  const firstFileRef = React.useRef<HTMLDivElement>(null)

  const [showAllRefs, setShowAllRefs] = useState(false)

  const keyboardNavUsed = useKeyboardNavUsed()

  const initialVisibleRefs = results.slice(0, MaxReferences)
  const hiddenRefs = results.length > MaxReferences ? results.slice(MaxReferences) : []

  const {sendRepoClickEvent} = useReposAnalytics()
  const isFromCurrentRepo = currentRepo.ownerLogin === repo.ownerLogin && currentRepo.name === repo.name

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter' || e.key === ' ') {
        setIsExpanded(!isExpanded)
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowLeft') {
        setIsExpanded(false)
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowRight') {
        setIsExpanded(true)
        if (isExpanded) {
          firstFileRef.current?.focus()
        }
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowDown') {
        focusSibling('nextElementSibling')
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowUp') {
        focusSibling('previousElementSibling')
        e.preventDefault()
      }
    },
    [isExpanded],
  )

  useEffect(() => {
    if (highlightedIndex && highlightedIndex >= MaxReferences + offset) {
      setShowAllRefs(true)
    }
  }, [highlightedIndex, offset])

  useEffect(() => {
    if (setFocusOnFile && keyboardNavUsed) {
      firstFileRef.current?.focus()
    }
  }, [setFocusOnFile, keyboardNavUsed])

  useEffect(() => {
    //this effect will always run after the above one, so we will focus back to the text area if necessary
    if (!keyboardNavUsed) {
      document.getElementById(textAreaId)?.focus()
    }
  }, [keyboardNavUsed])

  const groupId = `${filePath}-${isDefinition ? 'definition' : 'reference'}-group`

  return (
    <Box key={filePath}>
      <Box
        sx={{
          fontSize: 0,
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'border.muted',
          cursor: enableExpandCollapse ? 'pointer' : 'auto',
        }}
        onClick={enableExpandCollapse ? () => setIsExpanded(!isExpanded) : undefined}
        onKeyDown={onKeyDown}
        ref={firstFileRef}
      >
        <Box sx={{display: 'flex'}}>
          {isDefinition && currentRepo.id !== repo.id && (
            <>
              <GitHubAvatar square src={repo.ownerAvatar} sx={{mr: 2, backgroundColor: '#FFFFFF'}} size={16} />
              <Box sx={{fontWeight: '600', mr: 1}}>{repo.name}</Box>
            </>
          )}
          <Box
            as="button"
            aria-expanded={isExpanded}
            aria-controls={groupId}
            sx={{
              fontWeight: '400',
              color: 'fg.muted',
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'canvas.default',
              border: 'none',
              padding: 0,
            }}
          >
            {enableExpandCollapse && (
              <Octicon aria-hidden="true" icon={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
            )}
            {/* display table to fill and fix to 100% content - needed for display table-cell */}
            <Box sx={{display: 'table', width: '100%', tableLayout: 'fixed'}}>
              <Truncate
                aria-label={`${isDefinition ? 'Definitions' : 'References'} in ${
                  filePath !== currentPath ? filePath : 'this file'
                }`}
                title={filePath}
                sx={{
                  // Truncate the start of the path instead of the end
                  direction: 'rtl',
                  maxWidth: '100%',
                  pl: 2,
                  // used to allow for responsive truncation so we dont horizontal overflow
                  display: 'table-cell',
                  // display table + rtl will text align left, force left alignment
                  textAlign: 'left',
                }}
              >
                &lrm;{!isFromCurrentRepo || filePath !== currentPath ? filePath : 'In this file'}&lrm;
              </Truncate>
            </Box>
          </Box>
        </Box>
        {results && !isExpanded && <CounterLabel sx={{ml: 2}}>{results.length}</CounterLabel>}
      </Box>
      {isExpanded && (
        <Box
          aria-label={`Results in ${filePath !== currentPath ? filePath : 'this file'}`}
          id={groupId}
          sx={{overflowX: 'hidden'}}
          role="group"
          className={'code-nav-file-information'}
        >
          {initialVisibleRefs.map((reference, i) => {
            return (
              <CodeNavCell
                key={`codeNavigation${i + offset}`}
                reference={reference}
                isHighlighted={highlightedIndex === i + offset}
                href={reference.href(hasBlame)}
                onClick={() => {
                  if (onClick) onClick(i + offset)
                  sendRepoClickEvent('BLOB_SYMBOLS_MENU.SYMBOL_DEFINITION_CLICK')
                }}
                symbol={symbol}
                index={i + offset}
              />
            )
          })}

          {showAllRefs &&
            hiddenRefs.map((reference, i) => {
              return (
                <CodeNavCell
                  key={`codeNavigation${i + offset + MaxReferences}`}
                  reference={reference}
                  isHighlighted={highlightedIndex === i + offset + MaxReferences}
                  href={reference.href(hasBlame)}
                  onClick={() => {
                    if (onClick) onClick(i + offset + MaxReferences)
                    sendRepoClickEvent('BLOB_SYMBOLS_MENU.SYMBOL_DEFINITION_CLICK')
                  }}
                  symbol={symbol}
                  index={i + offset + MaxReferences}
                  focusElement={i === 0}
                />
              )
            })}

          {hiddenRefs.length > 0 && (
            <Box sx={{px: 3, pt: 1, pb: 2, fontSize: 0, color: 'fg.muted', borderColor: 'border.muted'}}>
              <Button
                leadingVisual={showAllRefs ? FoldIcon : UnfoldIcon}
                onClick={() => setShowAllRefs(!showAllRefs)}
                sx={{color: 'fg.default'}}
                variant="invisible"
                size="small"
                aria-selected={false}
              >
                {showAllRefs ? 'Show less' : 'Show more'}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

try{ CodeNavFileInformation.displayName ||= 'CodeNavFileInformation' } catch {}