import type {TocEntry} from '@github-ui/code-view-types'
import {ListUnorderedIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import React from 'react'

import type {SetPanelOpenType} from '../../../contexts/OpenPanelContext'
import type {PanelType} from '../../../pages/CodeView'

export default function TableOfContents({
  toc,
  openPanel,
  setOpenPanel,
  isDirectoryReadme,
}: {
  toc: TocEntry[] | null
  openPanel?: PanelType | undefined
  setOpenPanel?: SetPanelOpenType
  isDirectoryReadme?: boolean
}) {
  const ref = React.useRef<HTMLButtonElement>(null)
  return showToc(toc) ? (
    <IconButton
      ref={ref}
      sx={{color: 'var(--fgColor-muted, var(--color-fg-muted))', mr: isDirectoryReadme ? 0 : 2}}
      icon={ListUnorderedIcon}
      variant="invisible"
      aria-label="Outline"
      aria-pressed={openPanel === 'toc'}
      onClick={() => {
        setOpenPanel && setOpenPanel(openPanel === 'toc' ? undefined : 'toc', ref.current)
      }}
      size="small"
    />
  ) : null
}

function showToc(toc: TocEntry[] | null) {
  return toc && toc.length >= 2
}

try{ TableOfContents.displayName ||= 'TableOfContents' } catch {}