import type {CodeownersError, SplitCodeownersError} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {codeownersErrorPath} from '@github-ui/paths'
import type {RefInfo} from '@github-ui/repos-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {BugIcon, DotFillIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, Flash, Octicon} from '@primer/react'
import {useState} from 'react'

export enum CodeOwnerValidationState {
  ERROR,
  LOADING,
  VALIDATED,
}

export function CodeownerFileBanner({
  errors,
  state,
}: {
  errors: SplitCodeownersError[]
  state: CodeOwnerValidationState
}) {
  const [open, setOpen] = useState(false)

  if (state === CodeOwnerValidationState.ERROR) {
    return (
      <Flash variant="warning" sx={{mt: 3}}>
        Failed to validate this CODEOWNERS file
      </Flash>
    )
  }

  if (state === CodeOwnerValidationState.LOADING) {
    return (
      <Flash variant="default" sx={{mt: 3}}>
        Validating CODEOWNERS rules...
      </Flash>
    )
  }

  if (errors.length === 0) {
    return (
      <Flash variant="success" sx={{mt: 3}}>
        This CODEOWNERS file is valid.
      </Flash>
    )
  }

  return (
    <Flash variant="warning" sx={{display: 'flex', flexDirection: 'row', mt: 3}}>
      <Octicon icon={BugIcon} />
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          p: 0,
        }}
      >
        This CODEOWNERS file contains errors
        <Button
          as="a"
          sx={{
            alignSelf: 'center',
            borderRadius: '1px',
            height: '12px',
            lineHeight: '6px',
            ml: 1,
            px: '5px',
            py: 0,
          }}
        >
          ...
        </Button>
      </Box>
      <Dialog
        isOpen={open}
        onDismiss={() => setOpen(false)}
        sx={{display: 'flex', flexDirection: 'column', width: '640px'}}
      >
        <Dialog.Header>CODEOWNERS errors</Dialog.Header>
        <Box sx={{overflowX: 'hidden', overflowY: 'auto', p: 3}}>
          {errors.map((error, index) => {
            return <CodeownersErrorDetails key={index} error={error} />
          })}
        </Box>
      </Dialog>
    </Flash>
  )
}

function CodeownersErrorDetails({error}: {error: SplitCodeownersError}) {
  return (
    <Box
      sx={{
        padding: '16px',
        listStyleType: 'none',
        borderTop: '1px solid var(--borderColor-muted, var(--color-border-muted))',
      }}
    >
      {`${error.kind} on line ${error.line}${error.suggestion ? `: ${error.suggestion}` : ''}`}
      <Box as="pre" sx={{mt: 3}}>
        <code>
          {error.linePrefix}
          <Box
            as="b"
            sx={{
              cursor: 'help',
              fontStyle: 'italic',
              color: 'var(--fgColor-danger, var(--color-danger-fg))',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '101%',
                left: 0,
                width: '100%',
                height: '0.25em',
                background:
                  'linear-gradient(135deg, transparent, transparent 45%, var(--fgColor-danger, var(--color-danger-fg)), transparent 55%, transparent 100%),linear-gradient(45deg, transparent, transparent 45%, var(--fgColor-danger, var(--color-danger-fg)), transparent 55%, transparent 100%)',
                backgroundRepeat: 'repeat-x,repeat-x',
                backgroundSize: '0.5em 0.5em',
              },
            }}
          >
            {error.lineError}
          </Box>
          {error.lineSuffix}
        </code>
      </Box>
    </Box>
  )
}

const MAX_ERROR_OFFSET = 30
const TRUNCATED_LINE_PREFIX = '…'

export function splitCodeownersError(error: CodeownersError): SplitCodeownersError {
  let line = error.source.trim()
  let errorOffset = error.column - 1
  let endOffset = calculateEndOffset(errorOffset, error.end_column, line)

  if (errorOffset > MAX_ERROR_OFFSET) {
    const trimmedCharacters = errorOffset - MAX_ERROR_OFFSET
    line = TRUNCATED_LINE_PREFIX + line.slice(trimmedCharacters)
    errorOffset -= trimmedCharacters - TRUNCATED_LINE_PREFIX.length
    endOffset -= trimmedCharacters - TRUNCATED_LINE_PREFIX.length
  }

  return {
    ...error,
    linePrefix: line.substring(0, errorOffset),
    lineError: line.substring(errorOffset, endOffset),
    lineSuffix: line.substring(endOffset),
  }
}

function calculateEndOffset(errorOffset: number, endColumn: number | null, line: string) {
  if (endColumn) {
    return endColumn
  } else if (line.substring(errorOffset).indexOf(' ') > 0) {
    return line.indexOf(' ', errorOffset)
  } else {
    return line.length
  }
}

export function CodeownersErrorLineIndicator() {
  return (
    <Octicon
      icon={DotFillIcon}
      sx={{color: 'var(--fgColor-danger, var(--color-danger-fg))'}}
      aria-label="This line contains CODEOWNERS errors"
    />
  )
}

export function fetchCodeownersValidity(repo: Repository, refInfo: RefInfo, path: string) {
  return verifiedFetchJSON(
    codeownersErrorPath({owner: repo.ownerLogin, repo: repo.name, commitish: refInfo.name, filePath: path}),
    {method: 'GET'},
  )
}

try{ CodeownerFileBanner.displayName ||= 'CodeownerFileBanner' } catch {}
try{ CodeownersErrorDetails.displayName ||= 'CodeownersErrorDetails' } catch {}
try{ CodeownersErrorLineIndicator.displayName ||= 'CodeownersErrorLineIndicator' } catch {}