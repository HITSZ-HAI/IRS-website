import styled from 'styled-components'

/**
 * A component that hides children from being visible, but still accessible to screen readers. React equivalent to
 * the `sr-only` class.
 */
export const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  /* Elements without a height and width aren't accessible to screen readers
  * however, the negative margin trick is used to hide the element by removing
  * the same amount of margin as the height and width
  * */
  height: 1px;
  width: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
`
