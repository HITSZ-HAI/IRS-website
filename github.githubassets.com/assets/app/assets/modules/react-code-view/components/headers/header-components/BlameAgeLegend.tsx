import {Box, Text} from '@primer/react'
import React from 'react'

import {useBlameAgeColors} from '../../../../react-shared/Repos/blameUtils'

export default React.memo(BlameAgeLegend)

function BlameAgeLegend() {
  const colors = useBlameAgeColors()
  return (
    <Box aria-hidden sx={{display: 'flex', color: 'fg.muted', alignItems: 'center', gap: '2px', fontSize: 0}}>
      <Text sx={{mr: 2}}>Older</Text>
      {colors.map((color, i) => (
        <Box key={`blame-recency-color-${i}`} sx={{height: '0.5rem', width: '0.5rem', backgroundColor: color}} />
      ))}
      <Text sx={{ml: 2}}>Newer</Text>
    </Box>
  )
}

try{ BlameAgeLegend.displayName ||= 'BlameAgeLegend' } catch {}