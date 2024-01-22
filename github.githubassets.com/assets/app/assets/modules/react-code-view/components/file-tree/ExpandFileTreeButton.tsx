import {useClientValue} from '@github-ui/use-client-value'
import {ArrowLeftIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import React from 'react'

import {ExpandButton} from '../../../react-shared/ExpandButton'
import {useShortcut} from '../../hooks/shortcuts'
import {textAreaId} from '../../utilities/lines'
import {DuplicateOnKeydownButton} from '../DuplicateOnKeydownButton'

interface ExpandFileTreeButtonProps {
  expanded?: boolean
  onToggleExpanded: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  ariaControls: string
}

export const ExpandFileTreeButton = React.forwardRef(
  (
    {expanded, onToggleExpanded, className, ariaControls}: ExpandFileTreeButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const {toggleTreeShortcut} = useShortcut()
    const [isSSR] = useClientValue(() => false, true, [])
    return (
      <>
        {/* on the server, the expanded value will purely be whatever their saved
    setting is, which might be expanded. On mobile widths we don't ever default to
    having the tree expanded, so on the server we need to just hard code it to
    show the regular not expanded version of everything*/}
        {(!expanded || isSSR) && (
          <Button
            aria-label="Expand side panel"
            leadingVisual={ArrowLeftIcon}
            data-hotkey={toggleTreeShortcut.hotkey}
            data-testid="expand-file-tree-button-mobile"
            ref={ref}
            onClick={onToggleExpanded}
            variant="invisible"
            sx={{color: 'fg.muted', px: 2, display: 'none', '@media screen and (max-width: 768px)': {display: 'block'}}}
          >
            Files
          </Button>
        )}
        <ExpandButton
          dataHotkey={toggleTreeShortcut.hotkey}
          className={className}
          expanded={expanded}
          alignment="left"
          ariaLabel="Side panel"
          testid="file-tree-button"
          ariaControls={ariaControls}
          ref={ref}
          onToggleExpanded={onToggleExpanded}
          sx={{
            height: '32px',
            position: 'relative',
            '@media screen and (max-width: 768px)': {display: !expanded || isSSR ? 'none' : 'flex'},
          }}
        />
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={toggleTreeShortcut.hotkey}
          onButtonClick={onToggleExpanded}
          onlyAddHotkeyScopeButton={true}
        />
      </>
    )
  },
)

ExpandFileTreeButton.displayName = 'ExpandFileTreeButton'
