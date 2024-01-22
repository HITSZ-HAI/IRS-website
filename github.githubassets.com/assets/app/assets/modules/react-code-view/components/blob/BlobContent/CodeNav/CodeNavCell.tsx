import type {DefinitionOrReference} from '@github-ui/code-nav'
import {Link} from '@github-ui/react-core/link'
import {SafeHTMLText} from '@github-ui/safe-html'
import {Box, Link as PrimerLink} from '@primer/react'
import {useEffect, useState} from 'react'

import {useCodeHTML} from '../Code/SyntaxHighlightedLine'
import {HighlightedOverlay} from '../HighlightedOverlay'

export function CodeNavCell({
  reference,
  isHighlighted,
  href,
  onClick,
  role,
  ariaLevel,
  symbol,
  index,
  focusElement,
}: {
  reference: DefinitionOrReference
  isHighlighted: boolean
  href: string
  onClick?: () => void
  role?: string
  ariaLevel?: number
  symbol: string
  index?: number
  focusElement?: boolean
}) {
  const [offsetWidth, setOffsetWidth] = useState<number | null>(null)
  const sx = isHighlighted
    ? {
        background: 'var(--bgColor-attention-muted, var(--color-attention-subtle))',
        boxShadow: 'inset 2px 0 0 var(--bgColor-attention-emphasis, var(--color-attention-fg))',
      }
    : {}

  useEffect(() => {
    if (focusElement) {
      const element = document.getElementById(`find-in-file-item-${index}`)
      if (element) {
        element.focus()
      }
    }
  }, [focusElement, index])

  const codeHtml = useCodeHTML(reference.highlightedText, reference.stylingDirectives, reference.bodyText)

  return (
    <PrimerLink
      as={Link}
      className="blob-code blob-code-inner"
      to={href}
      role={role}
      sx={{
        display: 'block',
        p: 0,
        fontWeight: 400,
        fontSize: '12px',
        ':hover:not([disabled])': {bg: 'canvas.default'},
        ':hover': {textDecoration: 'none'},
        '[data-component="text"]': {gridArea: 'auto'},
        gridTemplateAreas: 'text',
        whiteSpace: 'break-spaces',
      }}
      onClick={ev => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (!ev.ctrlKey && !ev.metaKey) {
          onClick?.()
        }
      }}
      onSelect={onClick}
      id={`find-in-file-item-${index}`}
      aria-current={isHighlighted ? 'location' : undefined}
      aria-level={ariaLevel}
      onKeyDown={e => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.key === 'ArrowDown') {
          focusSibling('nextElementSibling')
          e.preventDefault()
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        } else if (e.key === 'ArrowUp') {
          focusSibling('previousElementSibling')
          e.preventDefault()
        }
      }}
    >
      <Box
        sx={{
          p: 1,
          py: '5px',
          ...sx,
        }}
      >
        <div className="d-flex">
          <Box className="text-small blob-num color-fg-muted" sx={{width: 'auto', minWidth: 'auto'}}>
            {reference.lineNumber}
          </Box>
          <Box sx={{overflow: 'hidden', whiteSpace: 'pre', position: 'relative'}}>
            {offsetWidth !== null && (
              <div id={`offset-${reference.href(false)}`} style={{marginLeft: -offsetWidth}}>
                {symbol.length > 0 && (
                  <HighlightedOverlay
                    symbols={[reference]}
                    lineNumber={reference.lineNumber}
                    sx={{overflow: 'initial'}}
                    isNotUsingWhitespace={true}
                  />
                )}
                <SafeHTMLText
                  sx={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                  }}
                  html={codeHtml}
                  aria-current={isHighlighted ? 'location' : undefined}
                />
              </div>
            )}
            {/* This element is used to measure precise offset in px, as it inherits same text styles as the main content */}
            <span
              ref={el => setOffsetWidth(el?.offsetWidth ?? null)}
              style={{visibility: 'hidden', position: 'absolute', whiteSpace: 'pre'}}
            >
              {getOffsetString(symbol, reference)}
            </span>
          </Box>
        </div>
      </Box>
    </PrimerLink>
  )
}

const TOTAL_ALLOWED_CHARS = 34
export function getOffsetString(searchTerm: string, reference: DefinitionOrReference) {
  let canFitLength = TOTAL_ALLOWED_CHARS - searchTerm.length
  const substringBeforeMatch = reference.bodyText.slice(0, reference.ident.start.column)
  if (canFitLength <= 0) {
    // Fully offset to fit the match
    return substringBeforeMatch
  }

  // Maximize spacing based on the string after match
  const substringAfterMatch = reference.bodyText.slice(reference.ident.start.column + searchTerm.length).trimEnd()
  canFitLength = Math.max(canFitLength / 2, canFitLength - substringAfterMatch.length)
  const wordsOffset = substringBeforeMatch.split(' ')
  const fit: string[] = []

  for (let index = wordsOffset.length - 1; index >= 0; index--) {
    const word = wordsOffset[index]!
    fit.unshift(word)

    if (fit.join(' ').length <= canFitLength) {
      wordsOffset.pop()
    } else {
      break
    }
  }

  const offset = wordsOffset.join(' ')
  // If fitting strings starts from the whitespace(s) or tabs, add these characters to the offset as well.
  const whitespaceOffset = (substringBeforeMatch.slice(offset.length).match(/^[ \t]*/) || [])[0] ?? ''

  return `${wordsOffset.join(' ')}${whitespaceOffset}`
}

export function focusSibling(key: 'nextElementSibling' | 'previousElementSibling') {
  const {activeElement} = document
  const elementSibling = activeElement?.[key] as HTMLInputElement | null
  if (elementSibling) {
    if (elementSibling.role !== 'treeitem' && key === 'nextElementSibling') {
      // There is a group element that we don't want to focus between
      // the first level (expandable) and the second level
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const treeItem = elementSibling.querySelector('[role="treeitem"]') as HTMLElement | null
      treeItem?.focus()
    } else {
      elementSibling.focus()
    }
  }
}

try{ CodeNavCell.displayName ||= 'CodeNavCell' } catch {}