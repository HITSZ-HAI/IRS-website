import {Box} from '@primer/react'

const DiffStatColor: Record<string, string> = {
  addition: 'diffstat.additionBg',
  deletion: 'danger.emphasis',
  neutral: 'neutral.bg',
}

export function DiffSquares({squares}: {squares: string[]}) {
  return (
    <Box sx={{display: 'flex'}}>
      {squares.map((diffStatType, i) => (
        <Box
          key={i}
          data-testid={`${diffStatType} diffstat`}
          sx={{
            backgroundColor: DiffStatColor[diffStatType],
            width: '8px',
            height: '8px',
            marginLeft: '1px',
            outlineOffset: '-1px',
            borderStyle: 'solid',
            borderColor: 'border.subtle',
            borderWidth: '1px',
          }}
        />
      ))}
    </Box>
  )
}

try{ DiffSquares.displayName ||= 'DiffSquares' } catch {}