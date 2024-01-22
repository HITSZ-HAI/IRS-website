import {Box} from '@primer/react'
import {useRef} from 'react'

import {useStickyHeaderSx, useStickyObserver} from '../../hooks/use-sticky-observer'
import FileNameStickyHeader from './FileNameStickyHeader'

export default function FolderViewHeader({
  showTree,
  treeToggleElement,
}: {
  showTree: boolean
  treeToggleElement: JSX.Element | null
}) {
  const headerRef = useRef(null)
  const isStickied = useStickyObserver(headerRef)
  const stickyHeaderSx = useStickyHeaderSx()
  const border = '1px solid var(--borderColor-default, var(--color-border-default))'
  return (
    <Box className="react-blob-view-header-sticky" sx={{...stickyHeaderSx, zIndex: isStickied ? 1 : 0}} ref={headerRef}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'canvas.subtle',
          borderBottom: isStickied ? border : 'none',
          overflow: 'hidden',
        }}
      >
        <FileNameStickyHeader isStickied={isStickied} showTree={showTree} treeToggleElement={treeToggleElement} />
      </Box>
    </Box>
  )
}

try{ FolderViewHeader.displayName ||= 'FolderViewHeader' } catch {}