import {Box} from '@primer/react'
import type React from 'react'

interface PanelProps {
  children: React.ReactNode
  sx?: Record<string, unknown>
  id?: string
  className?: string | undefined
}

export const Panel: React.FC<PanelProps> = ({children, sx, ...rest}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: '6px',
        contain: 'paint',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        maxHeight: '100vh',
        overflowY: 'auto',
        right: 0,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}

try{ Panel.displayName ||= 'Panel' } catch {}