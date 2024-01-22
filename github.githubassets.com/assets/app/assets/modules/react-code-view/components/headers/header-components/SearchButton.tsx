import {SearchIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type React from 'react'

import {appendAndFocusSearchBar} from '../../../../blackbird-monolith/utilities/append-and-focus-search-bar'
import {useShortcut} from '../../../hooks/shortcuts'
import {textAreaId} from '../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../DuplicateOnKeydownButton'

export default function SearchButton({sx, onClick}: {sx?: BetterSystemStyleObject; onClick?: () => void}) {
  const {searchShortcut} = useShortcut()
  return (
    <>
      <IconButton
        aria-label="Search this repository"
        icon={SearchIcon}
        data-hotkey={searchShortcut.hotkey}
        sx={{color: 'fg.subtle', fontSize: 14, fontWeight: 'normal', flexShrink: 0, ...sx}}
        size="medium"
        onClick={(e: React.MouseEvent) => {
          onClick?.()
          appendAndFocusSearchBar({
            retainScrollPosition: true,
            returnTarget: (e.target as HTMLElement).closest('button') as HTMLElement,
          })
        }}
      />

      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={searchShortcut.hotkey}
        onButtonClick={() => {
          const textArea = document.getElementById(textAreaId)
          onClick?.()
          appendAndFocusSearchBar({
            retainScrollPosition: true,
            returnTarget: textArea ?? undefined,
          })
        }}
        onlyAddHotkeyScopeButton={true}
      />
    </>
  )
}

try{ SearchButton.displayName ||= 'SearchButton' } catch {}