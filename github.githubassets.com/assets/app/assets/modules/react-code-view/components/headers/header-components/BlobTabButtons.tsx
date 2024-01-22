import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useNavigate} from '@github-ui/use-navigate'
import {SegmentedControl} from '@primer/react'
import {useState} from 'react'
import {useSearchParams} from 'react-router-dom'

import {useCurrentBlame} from '../../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useShortcut} from '../../../hooks/shortcuts'
import {useUrlCreator} from '../../../hooks/use-url-creator'
import {textAreaId} from '../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../DuplicateOnKeydownButton'

export default function BlobTabButtons() {
  const {
    headerInfo: {isCSV, isRichtext, shortPath},
    renderedFileInfo,
    image,
    issueTemplate,
    discussionTemplate,
    viewable,
  } = useCurrentBlob()
  const blame = useCurrentBlame()
  const [urlParams] = useSearchParams()

  const isPlain = urlParams.get('plain') === '1' || !!urlParams.get('short_path')?.length
  const isOnlyPreviewable = (renderedFileInfo && !viewable) || image
  const isPreviewable = isRichtext || issueTemplate || discussionTemplate || isCSV || renderedFileInfo
  const plainParams = renderedFileInfo ? `short_path=${shortPath}` : 'plain=1'

  const {getUrl} = useUrlCreator()

  const initialSelectedTab = isPreviewable && !isPlain && !blame ? 0 : blame ? 2 : 1
  const [selectedTab, setSelectedTab] = useState(initialSelectedTab)

  // Reset the tab if previewability changes
  useLayoutEffect(() => {
    setSelectedTab(initialSelectedTab)
  }, [initialSelectedTab])

  const navigate = useNavigate()

  const {viewCodeShortcut, viewPreviewShortcut, viewBlameShortcut} = useShortcut()

  const handleSegmentChange = (selectedTabIndex: number) => {
    if (!isPreviewable) {
      selectedTabIndex += 1
    }
    setSelectedTab(selectedTabIndex)
    if (selectedTab !== selectedTabIndex) {
      switch (selectedTabIndex) {
        case 0:
          navigate(getUrl({action: 'blob', params: '', hash: ''}))
          break
        case 1: {
          // location.hash includes the #
          const hash = location.hash?.substring(1) ?? undefined
          navigate(getUrl({action: 'blob', params: isPreviewable ? plainParams : '', hash}))
          break
        }
        case 2: {
          // location.hash includes the #
          const hash = location.hash?.substring(1) ?? undefined
          navigate(getUrl({action: 'blame', params: '', hash}))
          break
        }
      }
    }
  }

  if (isOnlyPreviewable) {
    return null
  }

  const defaultButtons = [
    <SegmentedControl.Button selected={selectedTab === 1} key="raw" data-hotkey={viewCodeShortcut.hotkey}>
      Code
    </SegmentedControl.Button>,
    <SegmentedControl.Button selected={selectedTab === 2} key="blame" data-hotkey={viewBlameShortcut.hotkey}>
      Blame
    </SegmentedControl.Button>,
  ]

  const previewButton = (
    <SegmentedControl.Button selected={selectedTab === 0} key="preview'" data-hotkey={viewPreviewShortcut.hotkey}>
      Preview
    </SegmentedControl.Button>
  )
  const invisibleFocusButtons = (
    <>
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={viewCodeShortcut.hotkey}
        onlyAddHotkeyScopeButton={true}
        onButtonClick={() => handleSegmentChange(isPreviewable ? 1 : 0)}
      />
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={viewBlameShortcut.hotkey}
        onlyAddHotkeyScopeButton={true}
        onButtonClick={() => handleSegmentChange(isPreviewable ? 2 : 1)}
      />
      {isPreviewable && (
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={viewPreviewShortcut.hotkey}
          onlyAddHotkeyScopeButton={true}
          onButtonClick={() => handleSegmentChange(0)}
        />
      )}
    </>
  )

  const buttons = isPreviewable
    ? isOnlyPreviewable
      ? // If the file is a rendered type ie. pdf, image, etc, we only want to show "Preview" tab
        [previewButton]
      : [previewButton, ...defaultButtons]
    : [...defaultButtons]
  return (
    <>
      <SegmentedControl aria-label="File view" size="small" onChange={handleSegmentChange} sx={{fontSize: 1}}>
        {buttons}
      </SegmentedControl>
      {invisibleFocusButtons}
    </>
  )
}

try{ BlobTabButtons.displayName ||= 'BlobTabButtons' } catch {}