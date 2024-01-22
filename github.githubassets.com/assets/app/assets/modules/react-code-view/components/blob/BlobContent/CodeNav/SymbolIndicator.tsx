import type {SymbolKind} from '@github-ui/code-nav'
import {Box} from '@primer/react'

export function SymbolIndicator({symbolKind, showFullSymbol}: {symbolKind: SymbolKind; showFullSymbol?: boolean}) {
  const smallSx = {fontSize: 'smaller', px: 1, py: '1px'}
  const mediumSx = {fontSize: 'small', px: 2, py: '1px', mt: '2px'}
  const symbolSx = showFullSymbol ? mediumSx : smallSx
  const sx = showFullSymbol ? {} : {mr: 2}

  if (!symbolKind) {
    return null
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', position: 'relative', ...sx}}>
      <Box
        sx={{
          backgroundColor: symbolKind.plColor,
          opacity: 0.1,
          position: 'absolute',
          borderRadius: 5,
          alignItems: 'stretch',
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
      />
      <Box
        sx={{
          color: symbolKind.plColor,
          borderRadius: 5,
          fontWeight: 600,
          ...symbolSx,
        }}
      >
        {showFullSymbol ? symbolKind.fullName : symbolKind.shortName}
      </Box>
    </Box>
  )
}

try{ SymbolIndicator.displayName ||= 'SymbolIndicator' } catch {}