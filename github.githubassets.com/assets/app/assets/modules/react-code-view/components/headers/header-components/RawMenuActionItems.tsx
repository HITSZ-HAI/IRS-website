import {ActionList} from '@primer/react'
import {useCallback} from 'react'

import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useShortcut} from '../../../hooks/shortcuts'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {type CopyState, getCopyStateUI} from '../../../utilities/Copy'
import {KeyboardVisual} from '../../../utilities/KeyboardVisual'

export default function RawMenuActionItems({
  viewable,
  onCopy,
  name,
  updateTooltipMessage,
  all,
}: {
  viewable: boolean
  onCopy: () => Promise<CopyState>
  name: string
  updateTooltipMessage: (message: string) => void
  all?: boolean
}) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {rawBlobUrl} = useCurrentBlob()
  const {downloadRawContentShortcut} = useShortcut()
  const downloadFileCallback = useCallback(async () => await downloadFile(rawBlobUrl, name), [name, rawBlobUrl])

  return (
    <ActionList.Group title="Raw file content">
      {all && <CopyActionItem viewable={viewable} onCopy={onCopy} updateTooltipMessage={updateTooltipMessage} />}
      {all && <RawActionItem onClick={() => sendRepoClickEvent('BLOB_RAW_DROPDOWN.VIEW')} rawHref={rawBlobUrl} />}
      <ActionList.LinkItem onClick={downloadFileCallback}>
        Download
        {downloadRawContentShortcut.text && (
          <ActionList.TrailingVisual aria-hidden="true">
            <KeyboardVisual shortcut={downloadRawContentShortcut} />
          </ActionList.TrailingVisual>
        )}
      </ActionList.LinkItem>
    </ActionList.Group>
  )
}

export async function downloadFile(rawHref: string, name: string) {
  const result = await fetch(rawHref, {method: 'get'})
  const blob = await result.blob()
  const aElement = document.createElement('a')
  aElement.setAttribute('download', name)
  const href = URL.createObjectURL(blob)
  aElement.href = href
  aElement.setAttribute('target', '_blank')
  aElement.click()
  URL.revokeObjectURL(href)
}

function CopyActionItem({
  viewable,
  onCopy,
  updateTooltipMessage,
}: {
  viewable: boolean
  onCopy: () => Promise<CopyState>
  updateTooltipMessage: (message: string) => void
}): JSX.Element | null {
  const {copyRawContentShortcut} = useShortcut()
  return viewable ? (
    <ActionList.Item
      onClick={async () => {
        const result = await onCopy()
        const {ariaLabel} = getCopyStateUI(result)
        updateTooltipMessage(ariaLabel)
      }}
    >
      Copy
      {copyRawContentShortcut.text && (
        <ActionList.TrailingVisual aria-hidden="true">
          <KeyboardVisual shortcut={copyRawContentShortcut} />
        </ActionList.TrailingVisual>
      )}
    </ActionList.Item>
  ) : null
}

function RawActionItem({onClick, rawHref}: {onClick?: () => void; rawHref: string}) {
  const {viewRawContentShortcut} = useShortcut()
  return (
    <ActionList.LinkItem onClick={onClick} href={rawHref}>
      View
      {viewRawContentShortcut.text && (
        <ActionList.TrailingVisual aria-hidden="true">
          <KeyboardVisual shortcut={viewRawContentShortcut} />
        </ActionList.TrailingVisual>
      )}
    </ActionList.LinkItem>
  )
}

try{ RawMenuActionItems.displayName ||= 'RawMenuActionItems' } catch {}
try{ CopyActionItem.displayName ||= 'CopyActionItem' } catch {}
try{ RawActionItem.displayName ||= 'RawActionItem' } catch {}