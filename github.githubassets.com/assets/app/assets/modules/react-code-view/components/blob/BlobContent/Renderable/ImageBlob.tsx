import {Box} from '@primer/react'

export function ImageBlob({displayName, displayUrl}: {displayName: string; displayUrl: string}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
      <Box as="img" alt={displayName} src={displayUrl} data-hpc sx={{maxWidth: '100%'}} />
    </Box>
  )
}

try{ ImageBlob.displayName ||= 'ImageBlob' } catch {}