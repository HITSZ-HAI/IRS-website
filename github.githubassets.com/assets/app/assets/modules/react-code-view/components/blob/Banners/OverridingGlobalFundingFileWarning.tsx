import {Flash, Link} from '@primer/react'

export function OverridingGlobalFundingFileWarning({
  globalPreferredFundingPath,
}: {
  globalPreferredFundingPath: string | null
}) {
  return (
    <Flash sx={{mt: 3}}>
      This file is overriding the organization-wide <code>FUNDING.yml</code> file. Removing <code>FUNDING.yml</code> in
      this repository will use the organization default.
      <Link href={globalPreferredFundingPath ?? undefined}> View organization funding file.</Link>
    </Flash>
  )
}

try{ OverridingGlobalFundingFileWarning.displayName ||= 'OverridingGlobalFundingFileWarning' } catch {}