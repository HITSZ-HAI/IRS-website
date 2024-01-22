import {Box, Spinner} from '@primer/react'

export const LoadingFallback = () => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3}} data-testid="suspense-spinner">
      <Spinner aria-label="Loading" />
    </Box>
  )
}

try{ LoadingFallback.displayName ||= 'LoadingFallback' } catch {}