import type React from 'react'

import {useAllShortcutsEnabled} from '../hooks/AllShortcutsEnabled'

export function AllShortcutsEnabled({children}: {children: React.ReactNode}) {
  const allShortcutsEnabled = useAllShortcutsEnabled()
  return allShortcutsEnabled ? <>{children}</> : null
}

try{ AllShortcutsEnabled.displayName ||= 'AllShortcutsEnabled' } catch {}