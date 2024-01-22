import {Text} from '@primer/react'

export default function HeaderState({checksHeaderState}: {checksHeaderState: string}): JSX.Element {
  switch (checksHeaderState) {
    case 'SUCCEEDED':
      return <Text sx={{fontWeight: 'bold', fontSize: 2}}>All checks have passed</Text>
    case 'FAILED':
      return <Text sx={{color: 'checks.donutError', fontWeight: 'bold', fontSize: 2}}>All checks have failed</Text>
    case 'PENDING':
      return (
        <Text sx={{color: 'checks.donutPending', fontWeight: 'bold', fontSize: 2}}>
          Some checks haven’t completed yet
        </Text>
      )
    default:
      return (
        <Text sx={{color: 'checks.donutError', fontWeight: 'bold', fontSize: 2}}>Some checks were not successful</Text>
      )
  }
}

try{ HeaderState.displayName ||= 'HeaderState' } catch {}