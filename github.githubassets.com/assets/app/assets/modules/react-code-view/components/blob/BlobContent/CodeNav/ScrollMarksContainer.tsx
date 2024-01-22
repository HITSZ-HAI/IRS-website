import {Box} from '@primer/react'

export const scrollMarksContainerID = 'find-result-marks-container'

export function ScrollMarksContainer() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100%',
        width: '15px',
        transition: 'transform 0.3s',
        '&:hover': {transform: 'scaleX(1.5)'},
        zIndex: 1,
      }}
      id={scrollMarksContainerID}
    />
  )
}

try{ ScrollMarksContainer.displayName ||= 'ScrollMarksContainer' } catch {}