import {handleAddReference} from '@github-ui/copilot-chat/components/CopilotChatButton'
import type {CopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ActionList} from '@primer/react'

export default function CopilotMenuItems({fileReference}: {fileReference: CopilotChatReference}) {
  return (
    <>
      <ActionList.Item onClick={() => handleAddReference(fileReference, true)}>Ask about this file</ActionList.Item>
    </>
  )
}

try{ CopilotMenuItems.displayName ||= 'CopilotMenuItems' } catch {}