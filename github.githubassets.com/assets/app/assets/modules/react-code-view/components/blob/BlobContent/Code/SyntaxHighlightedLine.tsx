/* eslint github/unescaped-html-literal: off */
import type {StylingDirective, StylingDirectivesLine} from '@github-ui/code-view-types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {SafeHTMLDiv, type SafeHTMLString} from '@github-ui/safe-html'
import React, {useMemo, useSyncExternalStore} from 'react'

import {useCurrentBlob} from '../../../../hooks/CurrentBlob'
import {useIsCursorEnabled} from '../../../../hooks/use-cursor-navigation'
import {
  getBIDIReplacement,
  hasBidiCharacters,
  hiddenBidiCharacterHTMLString,
  isBidiShown,
  showBidiCharactersHTML,
  splitAroundBIDICharacters,
} from '../../Banners/Bidi'

interface SyntaxHighlightedLineProps {
  id?: string
  rawText?: string
  stylingDirectivesLine?: StylingDirectivesLine
  lineNumber: number
  current?: boolean
  forceVisible?: boolean
}

export const SyntaxHighlightedLine = React.memo(React.forwardRef(SyntaxHighlightedLineWithRef))

function SyntaxHighlightedLineWithRef(
  {id, stylingDirectivesLine, rawText, lineNumber, current, forceVisible}: SyntaxHighlightedLineProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const strategy = useSyntaxHighlightingStrategy()
  const codeLineHTML = useCodeHTML(undefined, stylingDirectivesLine, rawText, forceVisible ? 'plain' : strategy)

  return (
    <SafeHTMLDiv
      id={id}
      className="react-file-line html-div"
      data-testid="code-cell"
      data-line-number={lineNumber}
      html={codeLineHTML}
      ref={ref}
      style={{position: 'relative'}}
      aria-current={current ? 'location' : undefined}
    />
  )
}

type SyntaxHighlightingStrategy = 'plain' | 'data-attribute' | 'separated-characters' | 'separated-characters-chunked'

function useSyntaxHighlightingStrategy(): SyntaxHighlightingStrategy {
  const hiddenFromFind = useIsCursorEnabled()
  const isFirefox = useIsFirefox()
  const chunkSeparatedCharacters = useFeatureFlag('react_blob_chunk_separated_characters')

  if (!hiddenFromFind) return 'plain'

  if (isFirefox && chunkSeparatedCharacters) return 'separated-characters-chunked'
  if (isFirefox) return 'separated-characters'

  return 'data-attribute'
}

/**
 * Given the possible sources of syntax highlighting from the server, returns the appropriate syntax-highlighted HTML
 */
export function useCodeHTML(
  lineHtml: SafeHTMLString | undefined,
  directives: StylingDirectivesLine | undefined,
  rawText: string | undefined,
  strategy: SyntaxHighlightingStrategy = 'plain',
): SafeHTMLString {
  const {tabSize} = useCurrentBlob()

  const bidiShown = isBidiShown()

  return useMemo(
    () => lineHtml ?? buildCodeHTML(rawText, directives, strategy, tabSize, bidiShown),
    [rawText, lineHtml, directives, strategy, tabSize, bidiShown],
  )
}

// Exported for testing
export function buildCodeHTML(
  rawText: string | undefined,
  directives: StylingDirectivesLine | undefined,
  strategy: SyntaxHighlightingStrategy,
  tabSize: number,
  exposeBIDICharacters: boolean,
): SafeHTMLString {
  rawText ||= '\n'
  const tree = makeSyntaxTree(rawText, directives, strategy, tabSize)
  const out: string[] = []
  appendHTMLNodesForSubtree(tree, strategy, exposeBIDICharacters, out)
  return out.join('') as SafeHTMLString
}

function appendHTMLNodesForSubtree(
  node: SyntaxTree,
  strategy: SyntaxHighlightingStrategy,
  exposeBIDICharacters: boolean,
  out: string[],
) {
  if (node.cssClass) {
    out.push(`<span class="${escapeHTML(node.cssClass)}">`)
  }

  for (const child of node.nodes) {
    if (isTree(child)) {
      appendHTMLNodesForSubtree(child, strategy, exposeBIDICharacters, out)
    } else {
      out.push(makeHTMLToken(child, strategy, exposeBIDICharacters))
    }
  }

  if (node.cssClass) {
    out.push(`</span>`)
  }
}

function makeHTMLToken(node: TokenNode, strategy: SyntaxHighlightingStrategy, exposeBIDICharacters: boolean): string {
  switch (strategy) {
    case 'data-attribute': {
      const text = escapeHTML(node.text)

      if (exposeBIDICharacters && hasBidiCharacters(text)) {
        const splitText = splitAroundBIDICharacters(text)
        const children = splitText.map(segment => {
          const bidiReplacement = getBIDIReplacement(segment)
          return bidiReplacement
            ? hiddenBidiCharacterHTMLString(bidiReplacement)
            : makeHTMLToken({...node, text: segment, cssClass: ''}, strategy, false)
        })
        return node.cssClass
          ? `<span class="${escapeHTML(node.cssClass)}">${children.join('')}</span>`
          : children.join('')
      }

      return node.cssClass
        ? `<span class="${escapeHTML(node.cssClass)}" data-code-text="${text}"></span>`
        : `<span data-code-text="${text}"></span>`
    }
    case 'separated-characters-chunked':
    case 'separated-characters': {
      if (node.text && !node.text.trim()) {
        // don't split empty strings / tabs, small optimization to cut down on the number of elements
        return makeHTMLToken({...node}, 'data-attribute', exposeBIDICharacters)
      }

      let nodeText = [...node.text]

      if (strategy === 'separated-characters-chunked' && !exposeBIDICharacters) {
        // chunk characters together in groups of 2
        nodeText = node.text.match(/.{1,2}/g) ?? nodeText
      }

      const separatedText = [...nodeText]
        .map(char => {
          const bidiReplacement = exposeBIDICharacters ? getBIDIReplacement(char) : undefined
          return bidiReplacement
            ? hiddenBidiCharacterHTMLString(bidiReplacement)
            : `<span data-code-text="${escapeHTML(char)}"></span>`
        })
        .join('')
      return node.cssClass ? `<span class="${escapeHTML(node.cssClass)}">${separatedText}</span>` : separatedText
    }
    case 'plain':
    default: {
      const text = escapeHTML(node.text)
      const contents = exposeBIDICharacters ? showBidiCharactersHTML(text) ?? text : text
      return node.cssClass ? `<span class="${escapeHTML(node.cssClass)}">${contents}</span>` : contents
    }
  }
}

interface SyntaxTree extends StylingDirective {
  nodes: Array<SyntaxTree | TokenNode>
}

interface TokenNode extends StylingDirective {
  text: string
}

function makeSyntaxTree(
  rawText: string,
  stylingDirectivesLine: StylingDirectivesLine | undefined,
  strategy: SyntaxHighlightingStrategy,
  tabSize: number,
): SyntaxTree {
  const offset: Offset = {value: 0}
  const tree: SyntaxTree = {nodes: [], start: 0, end: rawText.length, cssClass: ''}

  // Consider only non-empty directives
  const directives = stylingDirectivesLine?.filter(dir => dir.end > dir.start)

  if (!directives || directives.length === 0) {
    tree.nodes.push(makeNode('', rawText, 0, rawText.length, offset, tabSize, strategy))
    return tree
  }

  const currentParentStack = [tree]
  for (let i = 0; i < directives.length; i++) {
    const current = directives[i]!
    const next = directives[i + 1]
    let parent = currentParentStack[currentParentStack.length - 1] ?? tree
    const previous = parent.nodes[parent.nodes.length - 1]

    if (parent.nodes.length === 0 && current.start > parent.start) {
      // Fill the space between the beginning of the parent and the first child (current)
      const beginningOfParent = makeNode('', rawText, parent.start, current.start, offset, tabSize, strategy)
      parent.nodes.push(beginningOfParent)
    } else if (previous && current.start > previous.end) {
      // Fill the space between the end of the previous node and the current one
      const inBetween = makeNode('', rawText, previous.end, current.start, offset, tabSize, strategy)
      parent.nodes.push(inBetween)
    }

    const isContainer = next && next.start < current.end
    if (isContainer) {
      // The current directive contains sub-directives. Make it the new parent, and recurse.
      const newContainer = {...current, nodes: []}
      parent.nodes.push(newContainer)
      currentParentStack.push(newContainer)
    } else {
      // Create a node for the current directive
      const newNode = makeNode(current.cssClass, rawText, current.start, current.end, offset, tabSize, strategy)
      parent.nodes.push(newNode)
    }

    if (next && next.start >= parent.end) {
      let previousParentEnd = current.end
      if (parent.end > previousParentEnd) {
        // Fill the space between the end of the current directive and the end of the parent node
        const restOfCurrentParent = makeNode('', rawText, previousParentEnd, parent.end, offset, tabSize, strategy)
        parent.nodes.push(restOfCurrentParent)
        previousParentEnd = parent.end
      }

      // We are done with the nodes in the current parent. Go back to the grandparent.
      while (currentParentStack.length > 1 && next.start >= parent.end) {
        //pop off all current parents, filling in data as necessary due to nested parents
        currentParentStack.pop()
        parent = currentParentStack[currentParentStack.length - 1] ?? tree
        if (currentParentStack.length > 1 && next.start >= parent.end && parent.end > previousParentEnd) {
          // Fill the space between the end of the current directive and the end of the parent node, but only if
          // the parent is not the same scope as the previous parent
          const restOfCurrentParent = makeNode('', rawText, previousParentEnd, parent.end, offset, tabSize, strategy)
          previousParentEnd = parent.end
          parent.nodes.push(restOfCurrentParent)
        }
      }
    }
  }

  // Fill in the remaining space in any parents left in the stack
  while (currentParentStack.length > 0) {
    const parent = currentParentStack.pop()!

    const lastNode = parent.nodes[parent.nodes.length - 1]
    if (lastNode && lastNode.end < parent.end) {
      // Fill the space between the end of the last directive and the end of the parent.
      const restOfParent = makeNode('', rawText, lastNode.end, parent.end, offset, tabSize, strategy)
      parent.nodes.push(restOfParent)
    }
  }

  return tree
}

type Offset = {value: number}

function makeNode(
  cssClass: string,
  rawText: string,
  start: number,
  end: number,
  offset: Offset,
  tabSize: number,
  strategy: SyntaxHighlightingStrategy,
): TokenNode {
  const substring = rawText.substring(start, end)
  const text = strategy !== 'plain' ? convertTabsToSpaces(substring, tabSize, offset) : substring
  return {cssClass, start, end, text}
}

function isTree(node: SyntaxTree | TokenNode): node is SyntaxTree {
  return 'nodes' in node
}

/**
 * Converts a string containing tabs to a string where all tabs have been
 * replaced with the appropriate number of spaces.
 *
 * @param text The string to convert
 * @param tabSize The number of character widths between tab stops
 * @param offset The position on a line at which the string begins
 *
 * @remarks
 * This is necessary because our html format with no text nodes uses css to
 * put the code text on the page. Unfortunately, the browser does not interpret
 * the css-inserted text of adjacent nodes as being part of the same contiguous
 * block of text. That means that each node is treated as if it were at the
 * start of a line, so tabs do not necessarily get the correct width.
 * Converting them to the right number of spaces here fixes the problem. This
 * does not affect copying/pasting code correctly because the
 * syntax-highlighted overlay is not selectable.
 */
function convertTabsToSpaces(text: string, tabSize: number, offset: Offset) {
  const out: string[] = []
  for (const char of text) {
    if (char === '\t') {
      const numSpaces = tabSize - (offset.value % tabSize)
      out.push(spaces(numSpaces))
      offset.value += numSpaces
    } else {
      out.push(char)
      // Browser textareas appear to count the number of code points rather
      // than the display width of each character when determining tab stops.
      offset.value += numberOfCodePoints(char)
    }
  }
  return out.join('')
}

function spaces(count: number): string {
  return new Array(count).fill(' ').join('')
}

function numberOfCodePoints(str: string): number {
  return Array.from(str).length
}

/**
 * 1. No, there is no standard library solution for this
 * 2. Yes, this is actually the fastest way; the switch statement is slightly
 *    faster than a object lookup or map, and in aggregate, that adds up.
 */
function escapeHTML(unsafe: string): SafeHTMLString {
  return unsafe.replace(/[&<>"']/g, escapeHTMLChar) as SafeHTMLString
}

function escapeHTMLChar(char: string): string {
  switch (char) {
    case '&':
      return '&amp;'
    case '<':
      return '&lt;'
    case '>':
      return '&gt;'
    case '"':
      return '&quot;'
    case "'":
      return '&#039;'
    default:
      return char
  }
}

function useIsFirefox(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    () => false,
  )
}

try{ SyntaxHighlightedLine.displayName ||= 'SyntaxHighlightedLine' } catch {}
try{ SyntaxHighlightedLineWithRef.displayName ||= 'SyntaxHighlightedLineWithRef' } catch {}