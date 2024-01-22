import {verifiedFetch} from '@github-ui/verified-fetch'

const UPDATE_EXPAND_PREFERENCES_URL = '/repos/preferences'

export function useUpdatePanelExpandPreferences() {
  async function updateExpandPreferences(treeValue: boolean | null, symbolsValue: boolean | null) {
    const formData = new FormData()
    formData.set('tree_view_expanded_preference', treeValue === null ? '' : treeValue ? 'true' : 'false')
    formData.set('symbols_view_expanded_preference', symbolsValue === null ? '' : symbolsValue ? 'true' : 'false')
    verifiedFetch(UPDATE_EXPAND_PREFERENCES_URL, {
      method: 'PUT',
      body: formData,
      headers: {Accept: 'application/json'},
    })
  }

  return updateExpandPreferences
}
