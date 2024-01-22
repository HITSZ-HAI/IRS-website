import type {DeletedDiff} from '@github-ui/code-view-types'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {DiffSquares} from '@github-ui/diffs/DiffParts'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, IconButton, Link as PrimerLink, Spinner, Text} from '@primer/react'
import {useState} from 'react'

export function DiffEntry({diff, index}: {diff: DeletedDiff; index: number}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [diffLoaded, setDiffLoaded] = useState(false)

  const squares: string[] = []
  for (let i = 0; i < 5; i++) {
    if (diff.deletions > i) {
      squares.push('deletion')
    } else {
      squares.push('neutral')
    }
  }
  if (diff.diffHTML) {
    return (
      <div id="readme" className="readme prose-diff html-blob blob">
        <SafeHTMLBox html={diff.diffHTML} className="markdown-body container-lg" />
      </div>
    )
  }

  return (
    <Box
      sx={{border: '1px solid', borderColor: 'border.default', borderRadius: '6px', mt: 3}}
      id={`diff-entry-${index}`}
    >
      <Box
        sx={{
          backgroundColor: 'canvas.subtle',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          display: 'flex',
          py: 1,
          px: 2,
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          aria-label="Search"
          icon={collapsed ? ChevronRightIcon : ChevronDownIcon}
          size="small"
          variant="invisible"
          onClick={() => setCollapsed(!collapsed)}
        />
        <Text sx={{color: 'fg.muted'}}>{diff.deletions}</Text>
        <DiffSquares squares={squares} />
        <PrimerLink sx={{color: 'fg.default', cursor: 'pointer'}} underline={false} href={`#diff-entry-${index}`}>
          {diff.path}
        </PrimerLink>
        <CopyToClipboardButton textToCopy={diff.path} ariaLabel={'Copy path to clipboard'} />
      </Box>
      {collapsed ? null : (
        <Box sx={{px: showDiff ? 0 : 3, py: showDiff ? 0 : 4, position: 'relative'}} tabIndex={-1}>
          {showDiff ? (
            <include-fragment
              data-testid="delete-diff-fragment"
              src={diff.loadDiffPath}
              onLoad={() => setDiffLoaded(true)}
            >
              {!diffLoaded && (
                // The height of the placeholder is 137px
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '137px'}}>
                  <Spinner />
                </Box>
              )}
            </include-fragment>
          ) : (
            <>
              <DiffPlaceholderSvg />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                }}
              >
                <PrimerLink onClick={() => setShowDiff(true)} sx={{cursor: 'pointer'}}>
                  Load diff
                </PrimerLink>
                This file was deleted.
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

function DiffPlaceholderSvg() {
  return (
    <Box
      as="svg"
      aria-hidden="true"
      className="width-full"
      viewBox="0 0 340 84"
      xmlns="http://www.w3.org/2000/svg"
      sx={{height: '84', maxWidth: '340px'}}
    >
      <Box
        as="path"
        className="js-diff-placeholder"
        clipPath="url(#diff-placeholder)"
        d="M0 0h340v84H0z"
        fillRule="evenodd"
        sx={{fill: 'canvas.subtle'}}
      />
    </Box>
  )
}

try{ DiffEntry.displayName ||= 'DiffEntry' } catch {}
try{ DiffPlaceholderSvg.displayName ||= 'DiffPlaceholderSvg' } catch {}