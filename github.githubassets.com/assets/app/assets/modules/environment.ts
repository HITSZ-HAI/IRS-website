// Failbot needs to load first so we get errors from system lite.
import '@github-ui/failbot/failbot-error'

// Browser polyfills
import 'smoothscroll-polyfill'
import '@oddbird/popover-polyfill'

// Trusted types support
import '@github-ui/trusted-types'
import '@github-ui/trusted-types-policies/default'

import {apply} from '@github/browser-support'
apply()
