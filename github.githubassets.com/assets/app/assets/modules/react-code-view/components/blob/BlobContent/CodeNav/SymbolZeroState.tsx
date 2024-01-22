import {useCurrentRepository} from '@github-ui/current-repository'
import {codeNavGeneralSearchPath, codeNavSearchPath} from '@github-ui/paths'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Heading, Link, Octicon, Text} from '@primer/react'
import {useEffect, useRef, useState} from 'react'

export function SymbolZeroState({filterText, isFindInFile}: {filterText?: string; isFindInFile?: boolean}) {
  const [message, setMessage] = useState(isFindInFile ? 'No matches found' : 'No symbols found')
  const repo = useCurrentRepository()

  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    // This is a hack because aria-live doesn't re-announce updates with the same content
    // But we don't need to do this on the first render or else aria-live will announce twice
    setMessage(`${message}\u200B`) // 0 width space
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText])

  return (
    <Box sx={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', pb: 2}}>
      {filterText === '' && (
        <>
          <Box sx={{bg: 'canvas.subtle', borderRadius: 6, p: '16px'}}>
            <Box sx={{textAlign: 'center'}}>
              <Heading as="h3" sx={{fontSize: 0, marginBottom: '4px'}}>
                Symbol outline not available for this file
              </Heading>

              <Box
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  fontSize: '12px',
                  color: 'fg.muted',
                }}
              >
                To inspect a symbol, try clicking on the symbol directly in the code view.
              </Box>
            </Box>
          </Box>
          <Box sx={{mt: '8px', fontSize: 0, textAlign: 'center', color: 'fg.muted'}}>
            {' '}
            Code navigation supports a limited number of languages.{' '}
            <Link href="https://docs.github.com/repositories/working-with-files/using-files/navigating-code-on-github">
              See which languages are supported.
            </Link>
          </Box>
        </>
      )}
      {filterText && (
        <>
          <Octicon icon={SearchIcon} size={24} />
          <Text
            as="h3"
            sx={{textAlign: 'center', fontWeight: 600, fontSize: 3, py: 2}}
            role="alert"
            aria-relevant="all"
          >
            {message}
          </Text>
        </>
      )}
      {filterText && (
        <Text id="filter-zero-state" sx={{textAlign: 'center', px: 3, mt: 2, fontSize: 0, color: 'fg.subtle'}}>
          No lines in this file contain that string.
          <br />
          Search in{' '}
          <Link
            href={codeNavSearchPath({
              owner: repo.ownerLogin,
              repo: repo.name,
              searchTerm: filterText,
            })}
            inline
          >
            {repo.ownerLogin}/{repo.name}
          </Link>{' '}
          or{' '}
          <Link href={codeNavGeneralSearchPath({searchTerm: filterText})} inline>
            all of GitHub
          </Link>
        </Text>
      )}
    </Box>
  )
}

try{ SymbolZeroState.displayName ||= 'SymbolZeroState' } catch {}