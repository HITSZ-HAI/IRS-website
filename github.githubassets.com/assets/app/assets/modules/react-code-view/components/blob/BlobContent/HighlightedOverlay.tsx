import type {DefinitionOrReference} from '@github-ui/code-nav'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export function HighlightedOverlay({
  symbols,
  focusedSymbol,
  lineNumber,
  sx,
  isNotUsingWhitespace,
}: {
  symbols: DefinitionOrReference[]
  focusedSymbol?: DefinitionOrReference
  lineNumber: number
  sx?: BetterSystemStyleObject
  isNotUsingWhitespace?: boolean
}) {
  let startIndex = 0
  const key = `overlay-${lineNumber}-${sx ? 'blob' : 'panel'}`
  const text = symbols.length > 0 ? symbols[0]!.bodyText : ''
  const wrapOption = useCodeViewOptions().codeWrappingOption
  const leadingWhitespace = symbols.length > 0 && !isNotUsingWhitespace ? symbols[0]!.leadingWhitespace ?? 0 : 0

  return (
    <Text
      key={key}
      sx={{
        mb: '-20px',
        color: 'transparent',
        position: 'absolute',
        overflowWrap: wrapOption.enabled ? 'anywhere' : 'unset',
        maxWidth: wrapOption.enabled ? '100%' : 'unset',
        maxHeight: '6rem',
        overflow: 'hidden',
        width: '100%',
        display: 'inline-block',
        userSelect: 'none',
        ...sx,
      }}
    >
      {symbols.map(symbol => {
        const line = (
          <span key={`symbol-${symbol.ident.start.line}-${symbol.ident.start.column + leadingWhitespace}`}>
            <Text sx={{userSelect: 'none', visibility: 'hidden'}}>
              {text.substring(startIndex, symbol.ident.start.column + leadingWhitespace)}
            </Text>
            <Text
              sx={{
                // NOTE: the hex code is the default Chrome find highlight color, just matching browser behaviour
                bg: symbol === focusedSymbol ? '#ff9632' : 'attention.muted',
                zIndex: symbol === focusedSymbol ? 10 : undefined,
                color: symbol === focusedSymbol ? 'black' : undefined,
                position: symbol === focusedSymbol ? 'relative' : undefined,
                userSelect: 'none',
                // NOTE: this makes the overlay unclickable, and passes click
                // events through to the underlying element
                pointerEvents: 'none',
              }}
            >
              <Text
                sx={{visibility: symbol !== focusedSymbol ? 'hidden' : undefined}}
                id={matchElementId(symbol.lineNumber, symbol.ident.start.column + leadingWhitespace)}
              >
                {text.substring(
                  symbol.ident.start.column + leadingWhitespace,
                  symbol.ident.end.column + leadingWhitespace,
                )}
              </Text>
            </Text>
          </span>
        )

        startIndex = symbol.ident.end.column + leadingWhitespace

        return line
      })}
      {
        // Return the rest of the line to wrap properly
        <Text sx={{visibility: 'hidden', userSelect: 'none'}}>{text.substring(startIndex)}</Text>
      }
    </Text>
  )
}

export function matchElementId(line: number, column: number) {
  return `match-${line}-${column}`
}

try{ HighlightedOverlay.displayName ||= 'HighlightedOverlay' } catch {}