import {observeHotkey} from '@github-ui/hotkey/observer'

// calling this here keeps the sideffect in behaviors and out of @github-ui/hotkey
observeHotkey('[data-hotkey]')
