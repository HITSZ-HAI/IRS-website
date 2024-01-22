import type {SafeHTMLString} from '@github-ui/safe-html'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {useClientValue} from '@github-ui/use-client-value'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Link, Octicon, Tooltip} from '@primer/react'
import type React from 'react'

// There are 9 unicode codepoints in two contiguous blocks that act as
// bidi (bidirectional) control characters which can obscure malicious code:
// +-----------+----------------------------------+
// | codepoint | Control character name           |
// +-----------+----------------------------------+
// |  \u202A   | LEFT-TO-RIGHT EMBEDDING (LRE)    |
// |  \u202B   | RIGHT-TO-LEFT EMBEDDING (RLE)    |
// |  \u202C   | POP DIRECTIONAL FORMATTING (PDF) |
// |  \u202D   | LEFT-TO-RIGHT OVERRIDE (LRO)     |
// |  \u202E   | RIGHT-TO-LEFT OVERRIDE (RLO)     |
// |        [ ... ].                              |
// |  \u2066   | LEFT-TO-RIGHT ISOLATE (LRI)      |
// |  \u2067   | RIGHT-TO-LEFT ISOLATE (RLI)      |
// |  \u2068   | FIRST STRONG ISOLATE (FSI)       |
// |  \u2069   | POP DIRECTIONAL ISOLATE (PDI)    |
// +-----------+----------------------------------+
const bidiRegex = /[\u202A-\u202E]|[\u2066-\u2069]/
const bidiRegexG = /[\u202A-\u202E]|[\u2066-\u2069]/g
const bidiBoundaryRegex = /([\u202A-\u202E]|[\u2066-\u2069])/g
const bidiReplacements = {
  '\u202A': 'U+202A', // LEFT-TO-RIGHT EMBEDDING
  '\u202B': 'U+202B', // RIGHT-TO-LEFT EMBEDDING
  '\u202C': 'U+202C', // POP DIRECTIONAL FORMATTING
  '\u202D': 'U+202D', // LEFT-TO-RIGHT OVERRIDE
  '\u202E': 'U+202E', // RIGHT-TO-LEFT OVERRIDE
  '\u2066': 'U+2066', // LEFT-TO-RIGHT ISOLATE
  '\u2067': 'U+2067', // RIGHT-TO-LEFT ISOLATE
  '\u2068': 'U+2068', // FIRST STRONG ISOLATE
  '\u2069': 'U+2069', // POP DIRECTIONAL ISOLATE
} as const
type BIDIChar = keyof typeof bidiReplacements
type BIDIReplacement = (typeof bidiReplacements)[BIDIChar]
const bidiReplacementMap = new Map<string, BIDIReplacement>(Object.entries(bidiReplacements))

export function BidiAlert() {
  //doing it this way so that there are not hydration errors
  const [usableWindow] = useClientValue(() => ssrSafeWindow, ssrSafeWindow, [])

  if (!usableWindow) return null
  const revealButtonUrl = new URL(usableWindow.location.href, usableWindow.location.origin)
  const shown = revealButtonUrl.searchParams.get('h') === '1'

  shown ? revealButtonUrl.searchParams.delete('h') : revealButtonUrl.searchParams.set('h', '1')

  return (
    <Flash full variant="warning" sx={{alignItems: 'center', display: 'flex'}}>
      <Octicon icon={AlertIcon} />
      <Box as="span">
        This file contains bidirectional Unicode text that may be interpreted or compiled differently than what appears
        below. To review, open the file in an editor that reveals hidden Unicode characters.{' '}
        <Link href="https://github.co/hiddenchars" target="_blank" rel="noreferrer">
          Learn more about bidirectional Unicode characters
        </Link>
      </Box>
      <Button
        as="a"
        onClick={() => {
          window.location.href = revealButtonUrl.href
        }}
        size="small"
        sx={{
          float: 'right',
          ml: '24px',
          backgroundClip: 'padding-box',
        }}
      >
        {shown ? 'Hide revealed characters' : 'Show hidden characters'}
      </Button>
    </Flash>
  )
}

export function BidiTooltip() {
  return (
    <Tooltip direction="e" text="This line has hidden Unicode characters">
      <Octicon icon={AlertIcon} sx={{mr: '12px'}} />
    </Tooltip>
  )
}

function BidiCharacter({char}: {char: BIDIReplacement}) {
  return (
    <Box as="span" className="bidi-replacement padded">
      {char}
    </Box>
  )
}

function bidiCharacterHtmlString(bidiReplacementString: BIDIReplacement): SafeHTMLString {
  // We purposely don't want to escape the HTML because we know that the string will be from the replacementMap
  // eslint-disable-next-line github/unescaped-html-literal
  return `<span class="bidi-replacement">${bidiReplacementString}</span>` as SafeHTMLString
  // Casting to SafeHTMLString is safe because we know this exact html,
  // and we know that `bidiReplacementString` can only have a few specific values
}

export function hiddenBidiCharacterHTMLString(bidiReplacementString: BIDIReplacement): SafeHTMLString {
  // We purposely don't want to escape the HTML because we know that the string will be from the replacementMap
  // eslint-disable-next-line github/unescaped-html-literal
  return `<span class="bidi-replacement" data-code-text="${bidiReplacementString}"></span>` as SafeHTMLString
  // Casting to SafeHTMLString is safe because we know this exact html,
  // and we know that `bidiReplacementString` can only have a few specific values
}

/**
 * Split the given text into an array of strings and bidi control characters.
 */
export function splitAroundBIDICharacters(text: SafeHTMLString): SafeHTMLString[] {
  return text.split(bidiBoundaryRegex) as SafeHTMLString[]
}

export function showBidiCharactersHTML(text: SafeHTMLString): SafeHTMLString | null {
  if (!hasBidiCharacters(text)) {
    return null
  }

  // Split the text into an array of strings and bidi control characters.
  const splitText = splitAroundBIDICharacters(text)

  const replacedSegments = splitText.map(segment => {
    const replacement: BIDIReplacement | undefined = bidiReplacementMap.get(segment)
    if (!replacement) return segment
    return bidiCharacterHtmlString(replacement)
  })

  // Casting to SafeHTMLString is safe because we all we have done is take
  // verified html and replaced dangerous unicode characters with safe strings.
  return replacedSegments.join('') as SafeHTMLString
}

export function showBidiCharactersRaw(text: string): string {
  if (!hasBidiCharacters(text)) return text

  return text.replaceAll(bidiRegexG, (char: string) => bidiReplacementMap.get(char) ?? '')
}

export function showBidiCharacters(text: SafeHTMLString): React.ReactNode[] | null {
  if (!hasBidiCharacters(text)) {
    return null
  }

  // Split the text into an array of strings and bidi control characters.
  const splitText = splitAroundBIDICharacters(text)

  return splitText.map((segment, index) => {
    const replacement: BIDIReplacement | undefined = bidiReplacementMap.get(segment)
    return replacement ? <BidiCharacter key={index} char={replacement} /> : segment
  })
}

export function hasBidiCharacters(text: string): boolean {
  return bidiRegex.test(text)
}

export function isBidiShown(): boolean {
  if (!ssrSafeWindow) return false
  const url = new URL(ssrSafeWindow.location.href, ssrSafeWindow.location.origin)
  return url.searchParams.get('h') === '1'
}

export function getBIDIReplacement(char: string): BIDIReplacement | undefined {
  return bidiReplacementMap.get(char)
}

try{ BidiAlert.displayName ||= 'BidiAlert' } catch {}
try{ BidiTooltip.displayName ||= 'BidiTooltip' } catch {}
try{ BidiCharacter.displayName ||= 'BidiCharacter' } catch {}