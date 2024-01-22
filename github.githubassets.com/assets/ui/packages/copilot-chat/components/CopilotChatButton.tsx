import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useToastContext} from '@github-ui/toast'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import type {ReactNode} from 'react'
import {useCallback, useState} from 'react'

import {publishAddCopilotChatReference, publishOpenCopilotChat} from '../utils/copilot-chat-events'
import {CopilotChatIntents, type CopilotChatReference} from '../utils/copilot-chat-types'
import {BaseCopilotChatButton, squareHeightSx} from './BaseCopilotChatButton'

export default function CopilotChatButton({
  copilotAccessAllowed,
  messageReference,
  hideDropdown,
}: {
  copilotAccessAllowed: boolean
  messageReference: CopilotChatReference
  hideDropdown?: boolean
}) {
  const [open, setOpen] = useState(false)
  const suggestIcebreakerEnabled = useFeatureFlag('copilot_smell_icebreaker_ux')
  const {addToast} = useToastContext()

  const handleExplain = useCallback(() => {
    publishOpenCopilotChat({
      content: 'Explain',
      intent: CopilotChatIntents.explain,
      references: [messageReference],
    })
    setOpen(false)
  }, [messageReference])

  const handleSuggest = useCallback(() => {
    publishOpenCopilotChat({
      content: 'Suggest improvements to this code.',
      intent: CopilotChatIntents.suggest,
      references: [messageReference],
    })
    setOpen(false)
  }, [messageReference])

  const handleAskAbout = useCallback(() => {
    publishOpenCopilotChat({
      intent: CopilotChatIntents.conversation,
      references: [messageReference],
    })
    setOpen(false)
  }, [messageReference])

  const handleAddReferenceCallback = useCallback(() => {
    handleAddReference(messageReference, false, addToast)
    setOpen(false)
  }, [addToast, messageReference])

  return copilotAccessAllowed ? (
    <BaseCopilotChatButton
      referenceType={messageReference.type}
      onClick={hideDropdown ? () => handleAddReference(messageReference, true, undefined, true) : handleAskAbout}
      containerSx={hideDropdown ? {pr: 0} : {}}
    >
      {hideDropdown ? undefined : (
        <ActionMenu open={open} onOpenChange={setOpen}>
          <ActionMenu.Anchor>
            <IconButtonWithTooltip
              icon={TriangleDownIcon}
              label="Copilot menu"
              hideTooltip={open}
              onSelect={() => setOpen(true)}
              size="small"
              sx={{...squareHeightSx, '>span': {mb: 0}, color: 'fg.muted'}}
              tooltipDirection="sw"
              data-testid="more-copilot-button"
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay align="end">
            <ActionList>
              <ActionList.Item onSelect={handleExplain}>Explain</ActionList.Item>
              {suggestIcebreakerEnabled ? (
                <ActionList.Item onSelect={handleSuggest}>Suggest improvements</ActionList.Item>
              ) : null}
              <ActionList.Divider />
              <ActionList.Item onSelect={handleAddReferenceCallback}>Attach to current thread</ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </BaseCopilotChatButton>
  ) : null
}

/** `addToast` prop is required if `shouldOpenPanel` is false */
export const handleAddReference = (
  messageReference: CopilotChatReference,
  shouldOpenPanel: boolean,
  addToast?: (toast: {message: ReactNode; type: 'info' | 'success' | 'error'}) => void,
  shouldAppend?: boolean,
) => {
  if (shouldOpenPanel) {
    if (shouldAppend) {
      publishAddCopilotChatReference(messageReference, true)
    }
    publishOpenCopilotChat({intent: CopilotChatIntents.conversation, references: [messageReference]})
  } else if (addToast) {
    publishAddCopilotChatReference(messageReference)
    addToast({message: 'Reference added to thread', type: 'success'})
  }
}

try{ CopilotChatButton.displayName ||= 'CopilotChatButton' } catch {}