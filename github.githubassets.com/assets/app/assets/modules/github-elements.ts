// Primer includes:
// @github/auto-complete-element
// @github/clipboard-copy-element
// @github/tab-container-element
// @github/relative-time-element
// @github/image-crop-element
// @github/details-menu-element
// `modal-dialog`
import '@primer/view-components'

import '@github/auto-check-element'
import '@github/details-dialog-element'
import '@github/file-attachment-element'
import '@github/filter-input-element'
import '@github/g-emoji-element'
import '@github/include-fragment-element'
import '@github/markdown-toolbar-element'
import '@github/remote-input-element'
import '@github/task-lists-element'
import '@github/text-expander-element'
import '@github/typing-effect-element'

// Element hacks
import './github/include-fragment-element-hacks'

// Internal Elements
import './github/fuzzy-list-element'
import './github/git-clone-help-element'
import './github/marked-text-element'
import './github/password-strength-element'
import './github/platform-toggle'
import './github/poll-include-fragment-element'
import './github/slash-command-expander-element'
import './github/text-suggester-element'
import './github/virtual-filter-input-element'
import './github/virtual-list-element'
import './github/visible-password-element'

// Set IncludeFragmentElement to use CSP Trusted Types
import {temporaryPermissiveIncludeFragmentPolicy} from '@github-ui/trusted-types-policies/include-fragment-element'
window.IncludeFragmentElement.setCSPTrustedTypesPolicy(temporaryPermissiveIncludeFragmentPolicy)
