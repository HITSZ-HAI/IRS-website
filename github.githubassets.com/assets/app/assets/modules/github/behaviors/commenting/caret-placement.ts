import type {CaretCoordinates} from '@koddsson/textarea-caret'
import getCaretCoordinates from '@koddsson/textarea-caret'

type CaretCache = Map<number, CaretPosition>
const inputCache = new WeakMap<HTMLElement, CaretCache>()

/**
 * Bundles together the caret coordinates and the caret's
 * index within a given textarea
 */
class CaretPosition {
  index: number
  coords: CaretCoordinates
  textArea: HTMLTextAreaElement

  constructor(index: number, coords: CaretCoordinates, textArea: HTMLTextAreaElement) {
    this.index = index
    this.coords = coords
    this.textArea = textArea
  }

  get top() {
    return this.coords.top
  }

  get left() {
    return this.coords.left
  }

  get height() {
    return this.coords.height
  }

  currentChar(lookBack = 1) {
    return this.textArea.value.substring(this.index - lookBack, this.index)
  }
  /**
   * Compare the line of the y coordinates to the caret.
   * Returns -1 if y is on a previous line
   * Returns 1 if y is on a subsequent line
   * Returns 0 if y is on the same line
   */
  checkLine(y: number): -1 | 0 | 1 {
    if (y < this.coords.top) {
      return -1
    }

    if (y > this.coords.top + this.coords.height) {
      return 1
    }

    return 0
  }

  /**
   * The absolute horizontal distance between the x position and the
   * caret's x position.
   */
  xDistance(x: number): number {
    return Math.abs(this.left - x)
  }
}

/**
 * Get the cached x/y coordinates for the given caret index and textarea.
 */
function fetchCaretCoords(textArea: HTMLTextAreaElement, caretIndex: number): CaretPosition {
  let caretCache
  if (inputCache.has(textArea)) {
    caretCache = inputCache.get(textArea)!
  } else {
    caretCache = new Map()
    inputCache.set(textArea, caretCache)
  }

  if (caretCache.has(caretIndex)) {
    return caretCache.get(caretIndex)
  } else {
    // calling getCaretCoordinates(textArea, caretIndex, {debug: true})
    // will append a div to the document showing you where `textarea-caret` thinks the caret is
    const coords = new CaretPosition(caretIndex, getCaretCoordinates(textArea, caretIndex), textArea)
    caretCache.set(caretIndex, coords)
    return coords
  }
}

/**
 * This function recursively searches for the caret index that corresponds to the given coordinates.
 * We keep track of the number of iterations purely for logging to the console during
 * this PR.
 */
const binaryCursorSearch = (
  textArea: HTMLTextAreaElement,
  lower: number,
  upper: number,
  mouseX: number,
  mouseY: number,
  iterations: number,
): number => {
  if (upper === lower) {
    return upper
  }

  /**
   * Out of our final candidates, eliminate any that aren't on the same line as the mouse position.
   * Pick the one that's closest in the x direction.
   *
   * If _none_ of the candidates are on the same line, bail and arbitrarily return the upper bound
   */
  const bestPosition = (candidates: CaretPosition[]): number => {
    const sameLineCandidates = candidates
      .filter(c => c.checkLine(mouseY) === 0)
      .sort((a, b) => (a.xDistance(mouseX) > b.xDistance(mouseX) ? 1 : -1))
    if (sameLineCandidates.length === 0) {
      return upper
    } else {
      return sameLineCandidates[0]!.index
    }
  }
  // if we're down to two or three positions check them all
  if (upper - lower === 1) {
    const l = fetchCaretCoords(textArea, lower)
    const u = fetchCaretCoords(textArea, upper)
    return bestPosition([l, u])
  }

  if (upper - lower === 2) {
    const l = fetchCaretCoords(textArea, lower)
    const m = fetchCaretCoords(textArea, upper - 1)
    const u = fetchCaretCoords(textArea, upper)

    return bestPosition([l, m, u])
  }

  // The new midpoint is halfway between the upper and lower bounds
  // If that ends up being the same as the upper or lower, it means we've descended
  // all the way to the bottom of our search tree. We don't backtrack.
  const mid = Math.floor((upper + lower) / 2)
  if (mid === lower || mid === upper) {
    return mid
  }
  const midCoords = fetchCaretCoords(textArea, mid)

  // If the midpoint caret position is below the mouse coordinates, we need to search
  // farther along in the textarea
  if (mouseY > midCoords.top + midCoords.height) {
    return binaryCursorSearch(textArea, mid + 1, upper, mouseX, mouseY, iterations + 1)
  }

  // If the midpoint caret position is above the mouse coordinates, we need to search
  // behind the current midpoint in the textarea
  if (mouseY < midCoords.top) {
    return binaryCursorSearch(textArea, lower, mid - 1, mouseX, mouseY, iterations + 1)
  }

  // if we're within a few pixels, avoid further searching
  const ETA = 3
  if (midCoords.xDistance(mouseX) < ETA) {
    return mid
  }

  // if mid is on the same line as the cursor, we need to check the x position
  if (midCoords.left < mouseX) {
    // if iterating further will cause us to change lines, stop here
    if (fetchCaretCoords(textArea, mid + 1).checkLine(mouseY) !== 0) {
      return mid
    }
    return binaryCursorSearch(textArea, mid + 1, upper, mouseX, mouseY, iterations + 1)
  }

  if (midCoords.left > mouseX) {
    // if iterating further will cause us to change lines, stop here
    if (fetchCaretCoords(textArea, mid - 1).checkLine(mouseY) !== 0) {
      return mid
    }

    return binaryCursorSearch(textArea, lower, mid - 1, mouseX, mouseY, iterations + 1)
  }

  return mid
}

/**
 * The driver function for the binary search.
 */
const findCursorPosition = (textArea: HTMLTextAreaElement, x: number, y: number): number => {
  const startIndex = 0
  const endIndex = textArea.value.length
  const iterations = 0
  return binaryCursorSearch(textArea, startIndex, endIndex, x, y, iterations)
}

/**
 * Assigns the final cursor position after finding it
 */
function setCursorPosition(textarea: HTMLTextAreaElement, x: number, y: number) {
  const newPosition = findCursorPosition(textarea, x, y)

  textarea.setSelectionRange(newPosition, newPosition)
}

/**
 * Sets the caret in a textarea based on a DragEvent within that textarea.
 * Unfortunately there's no html api to do that directly (x/y -> caret). This function uses an iterative
 * approach to find the caret position from the x/y coordinates of the drag event.
 *
 * Under the hood we use the [textarea-caret npm package](https://www.npmjs.com/package/textarea-caret)
 * to find the x/y coordinates of the caret based on the caret index, and feed those results into a binary search.
 *
 * We use a cache to speed up the search, which is reinitialized when the user drags over the textarea for the first time.
 */
export function updateCaret(textArea: HTMLTextAreaElement, dragEvent: DragEvent) {
  const rect = textArea.getBoundingClientRect()
  // We want to clear the cache when the user first drags an attachment into the textarea.
  // It's better to have to recalculate too much than to have a stale cache with wrong results.
  if (dragEvent.type === 'dragenter') {
    inputCache.delete(textArea)
  }

  const x = dragEvent.clientX - rect.left
  const y = dragEvent.clientY - rect.top + textArea.scrollTop
  setCursorPosition(textArea, x, y)
}
