// Click to select clone urls

import {microtask} from '@github-ui/eventloop-tasks'
import {onFocus} from '../onfocus'

onFocus('input[data-autoselect], textarea[data-autoselect]', async function (input) {
  await microtask()
  ;(input as HTMLInputElement | HTMLTextAreaElement).select()
})
