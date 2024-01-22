import {Flash, Link} from '@primer/react'

export function InvalidCitationWarning({citationHelpUrl}: {citationHelpUrl: string}) {
  return (
    <Flash variant="warning" sx={{mt: 3}}>
      Your <strong>CITATION.cff</strong> file cannot be parsed. Make sure the formatting is correct.{' '}
      <Link href={citationHelpUrl}>Learn more about CITATION files.</Link>
    </Flash>
  )
}

try{ InvalidCitationWarning.displayName ||= 'InvalidCitationWarning' } catch {}