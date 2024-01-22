import type {TocEntry} from '@github-ui/code-view-types'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {FilterIcon, XIcon} from '@primer/octicons-react'
import {Box, IconButton, NavList, TextInput} from '@primer/react'
import {useEffect, useRef, useState} from 'react'

import {onHashChange} from '../../../MarkdownContent'

export default function TableOfContentsPanel({onClose, toc}: {onClose?: () => void; toc: TocEntry[] | null}) {
  const [filter, setFilter] = useState<string>('')
  const [hash, setHash] = useState<string>('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    const hashChange = () => {
      if (window.location.hash) {
        setHash(window.location.hash)
      }
    }

    hashChange()
    window.addEventListener('hashchange', hashChange)
    return () => {
      window.removeEventListener('hashchange', hashChange)
    }
  }, [])

  if (!toc) {
    return null
  }

  return (
    <Box sx={{px: 2, pt: 2, maxWidth: '100vw'}} as="section" aria-labelledby="outline-id">
      {onClose ? (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Box
            as="h3"
            id="outline-id"
            ref={headingRef}
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 1, fontWeight: 600, px: 2}}
            tabIndex={-1}
          >
            Outline
          </Box>

          <IconButton
            aria-label="Close outline"
            icon={XIcon}
            onClick={onClose}
            variant="invisible"
            sx={{color: 'fg.muted'}}
          />
        </Box>
      ) : null}
      {toc.length >= 8 ? (
        <Box sx={{pt: 3, px: 2}}>
          <TextInput
            leadingVisual={FilterIcon}
            placeholder="Filter headings"
            aria-label="Filter headings"
            sx={{width: '100%'}}
            onChange={e => {
              setFilter(e.target.value)
            }}
          />
        </Box>
      ) : null}
      <NavList sx={{overflowY: 'auto', '> li': {borderRadius: 2, width: '100%'}}}>
        {toc.map(({level, htmlText, anchor}: TocEntry, index) => {
          if (!htmlText || (filter && !htmlText.toLowerCase().includes(filter.toLowerCase()))) {
            return null
          }
          let sx
          if (level === 1) {
            sx = {fontWeight: 'bold'}
          } else {
            sx = {paddingLeft: `${(level - 1) * 16}px`}
          }
          const hashString = `#${anchor}`
          return (
            <NavList.Item
              key={`outline-${anchor}-${index}`}
              aria-current={hash === hashString ? 'page' : undefined}
              href={hashString}
              onClick={e => {
                // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
                if (e.button === 1 || e.metaKey || e.ctrlKey) {
                  return
                }
                if (hash !== hashString) {
                  location.href = hashString
                }
                onHashChange(hashString)
                e.preventDefault()
              }}
            >
              <SafeHTMLBox sx={{...sx}} html={htmlText} />
            </NavList.Item>
          )
        })}
      </NavList>
    </Box>
  )
}

try{ TableOfContentsPanel.displayName ||= 'TableOfContentsPanel' } catch {}