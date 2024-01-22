import {Flash} from '@primer/react'

export function EditingForkBanner({forkName, forkOwner}: {forkName: string; forkOwner: string}) {
  return (
    <Flash sx={{mb: 3}} aria-live="polite">
      You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new
      branch in your fork <b>{`${forkOwner}/${forkName}`}</b>, so you can send a pull request.
    </Flash>
  )
}

try{ EditingForkBanner.displayName ||= 'EditingForkBanner' } catch {}