// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {onInput} from '../onfocus'

let changedPrivacyManually = false
const urlSearchParams = new URLSearchParams(window.location.search)
const profileReadmeParam = urlSearchParams.get('profile_readme')

function handleOwnerChange() {
  const name = document.querySelector<HTMLElement>('.js-repo-name')!
  // Trigger auto-check to ensure repo name is available under the new org selected
  fire(name, 'input')

  const selectedOwner = document.querySelector<HTMLElement>('.js-owner-container [aria-checked="true"]')!

  const allowPublicRepos = selectedOwner.getAttribute('data-org-allow-public-repos') !== 'false'
  const publicRadio = document.querySelector<HTMLInputElement>('.js-privacy-toggle[value=public]')!
  const publicLabel = document.querySelector<HTMLElement>('.js-privacy-toggle-label-public')
  const publicDescription = document.querySelector<HTMLElement>('.js-public-description')
  const publicRestrictedByPolicyDescription = document.querySelector<HTMLElement>(
    '.js-public-restricted-by-policy-description',
  )
  enableDisableRepoType(
    allowPublicRepos,
    publicRadio,
    publicLabel,
    publicDescription,
    publicRestrictedByPolicyDescription,
  )

  const businessId = selectedOwner.getAttribute('data-business-id')
  const internalRadio = updateInternalDiv(businessId, selectedOwner)

  const allowPrivateRepos = selectedOwner.getAttribute('data-org-allow-private-repos') !== 'false'
  const privateRadio = document.querySelector<HTMLInputElement>('.js-privacy-toggle[value=private]')!
  const privateLabel = document.querySelector<HTMLElement>('.js-privacy-toggle-label-private')
  const privateDescription = document.querySelector<HTMLElement>('.js-private-description')
  const privateRestrictedByPolicyDescription = document.querySelector<HTMLElement>(
    '.js-private-restricted-by-policy-description',
  )
  enableDisableRepoType(
    allowPrivateRepos,
    privateRadio,
    privateLabel,
    privateDescription,
    privateRestrictedByPolicyDescription,
  )

  checkOwnerSelected()

  // Display upgrade/upsell for private repos when relevant
  hideOrgUpgradeLinks()
  const privateRestrictedByPlan = selectedOwner.getAttribute('data-org-private-restricted-by-plan') !== 'false'
  const upgradePrivateDescription = document.querySelector<HTMLElement>('.js-upgrade-private-description')
  const displayUpsell = selectedOwner.getAttribute('data-org-show-upgrade') !== 'false'
  const orgName = selectedOwner.getAttribute('data-org-name')
  const orgUpgradeLink = orgName ? document.querySelector<HTMLElement>(`a[data-upgrade-link="${orgName}"]`) : null
  const askOwnerMessage = document.querySelector<HTMLElement>('.js-ask-owner-message')
  if (allowPrivateRepos || !privateRestrictedByPlan) {
    if (upgradePrivateDescription) upgradePrivateDescription.hidden = true
    if (orgUpgradeLink) orgUpgradeLink.hidden = true
    if (askOwnerMessage) askOwnerMessage.hidden = true
  } else {
    if (privateRestrictedByPolicyDescription) privateRestrictedByPolicyDescription.hidden = privateRestrictedByPlan
    if (upgradePrivateDescription) upgradePrivateDescription.hidden = false
    if (orgUpgradeLink) orgUpgradeLink.hidden = !displayUpsell
    if (askOwnerMessage) askOwnerMessage.hidden = displayUpsell
  }

  updateRepoDestinationMessageFromSelectedOwner(selectedOwner)

  // Handle default branch name based on owner setting
  const defaultNewRepoBranch = selectedOwner.getAttribute('data-default-new-repo-branch')
  const defaultNewRepoBranchDescription = document.querySelector<HTMLElement>('.js-new-repo-owner-default-branch')
  if (defaultNewRepoBranchDescription) {
    defaultNewRepoBranchDescription.textContent = defaultNewRepoBranch
  }
  const settingsLinkPrefix = selectedOwner.getAttribute('data-owner-settings-link-prefix')
  const settingsLinkPrefixDescription = document.querySelector<HTMLElement>('.js-new-repo-owner-settings-link-prefix')
  if (settingsLinkPrefixDescription) {
    settingsLinkPrefixDescription.textContent = settingsLinkPrefix
  }
  const settingsUrl = selectedOwner.getAttribute('data-owner-settings-url')
  const settingsLinkContainer = document.querySelector<HTMLElement>(
    '.js-repo-owner-default-branch-settings-link-container',
  )
  const orgSettingsInfoContainer = document.querySelector<HTMLElement>(
    '.js-org-repo-owner-default-branch-settings-info',
  )
  if (settingsUrl) {
    const settingsLink = document.querySelector<HTMLAnchorElement>('.js-new-repo-owner-settings-link')
    if (settingsLink) {
      settingsLink.href = settingsUrl
      if (settingsLinkContainer) {
        settingsLinkContainer.hidden = false
      }
    }
    if (orgSettingsInfoContainer) {
      orgSettingsInfoContainer.hidden = true
    }
  } else if (settingsLinkContainer) {
    settingsLinkContainer.hidden = true
    if (orgSettingsInfoContainer) {
      const ownerIsAnOrg = selectedOwner.hasAttribute('data-viewer-is-org-admin')
      orgSettingsInfoContainer.hidden = !ownerIsAnOrg
    }
  }

  // Handle trade restrictions on private repos
  const tradeRestricted = selectedOwner.getAttribute('data-org-show-trade-controls') === 'true'
  const viewerIsOrganizationAdmin = selectedOwner.getAttribute('data-viewer-is-org-admin') === 'true'
  const individualTradeRestricted = selectedOwner.getAttribute('data-user-show-trade-controls') === 'true'
  const orgRestrictedWithoutPrivateRepos = tradeRestricted && !allowPrivateRepos
  const tradeControlsDescription = document.querySelector<HTMLElement>('.js-trade-controls-description')
  const individualTradeControlsDescription = document.querySelector<HTMLElement>(
    '.js-individual-trade-controls-description',
  )
  // Hide all the plan/org policy stuff if there is a trade restriction in place.
  if (individualTradeRestricted || orgRestrictedWithoutPrivateRepos) {
    const showPolicyTextForOrgMember =
      !individualTradeRestricted && !viewerIsOrganizationAdmin && orgRestrictedWithoutPrivateRepos

    if (privateRestrictedByPolicyDescription) {
      // we are are making an exception here to show the policy text for org non-admins
      if (showPolicyTextForOrgMember) {
        privateRestrictedByPolicyDescription.hidden = false
      } else {
        privateRestrictedByPolicyDescription.hidden = true
      }
    }

    // Hide/Disable the rest
    privateRadio.disabled = true
    if (privateDescription) privateDescription.hidden = true
    if (upgradePrivateDescription) upgradePrivateDescription.hidden = true
    if (orgUpgradeLink) orgUpgradeLink.hidden = true
    if (askOwnerMessage) askOwnerMessage.hidden = true
  } else {
    // Hide all previously displayed trade restriction texts
    if (tradeControlsDescription) tradeControlsDescription.hidden = true
    if (individualTradeControlsDescription) individualTradeControlsDescription.hidden = true
  }
  // If both individual and org are restricted, prefer the individual message.
  // If only the org is restricted, show that.
  if (individualTradeRestricted) {
    if (tradeControlsDescription) tradeControlsDescription.hidden = true
    if (individualTradeControlsDescription) individualTradeControlsDescription.hidden = false
  } else if (orgRestrictedWithoutPrivateRepos) {
    if (tradeControlsDescription) {
      if (individualTradeControlsDescription) individualTradeControlsDescription.hidden = true
      // we only want to show the OFAC text to org admins
      if (viewerIsOrganizationAdmin) {
        tradeControlsDescription.hidden = false
      } else {
        tradeControlsDescription.hidden = true
      }
    }
  }

  ensureOneRadioIsSelected(selectedOwner, publicRadio, internalRadio, privateRadio)
  togglePermissionFields(selectedOwner.getAttribute('data-permission') === 'yes')
  toggleRepoNameAutoCheck(selectedOwner)
  handlePrivacyChange()

  const quickInstallContainer = document.querySelector('.js-quick-install-container')
  if (quickInstallContainer) {
    const quickInstallDivider = quickInstallContainer.querySelector<HTMLElement>('.js-quick-install-divider')!
    quickInstallDivider.hidden = true
    const owner = document.querySelector<HTMLInputElement>('input[name=owner]:checked')!
    const ownerParent = owner.parentElement
    if (ownerParent) {
      const installList = ownerParent.querySelector('.js-quick-install-list-template')
      if (installList instanceof HTMLTemplateElement) {
        const quickInstallDestination = quickInstallContainer.querySelector<HTMLElement>('.js-account-apps')!
        quickInstallDestination.textContent = ''
        quickInstallDestination.append(installList.content.cloneNode(true))
        if (installList.children.length > 0) {
          quickInstallDivider.hidden = false
        }
      }
    }
  }

  validate()
}

function updateRepoDestinationMessage(visibility: string | undefined, selectedOwner: HTMLElement) {
  const orgName = selectedOwner.getAttribute('data-org-name')
  const enterpriseName = selectedOwner.getAttribute('data-business-name')
  const isUserOrOrg = selectedOwner.getAttribute('data-is-user-or-org') === 'true'

  const creatingOrgMessage = orgName ? `the ${orgName} organization` : 'your personal account'
  const creatingEnterpriseMessage = enterpriseName ? ` (${enterpriseName})` : ''

  const repoDestinationMessage = (creatingRepoPreamble: string) =>
    isUserOrOrg
      ? `${creatingRepoPreamble} in ${creatingOrgMessage}${creatingEnterpriseMessage}.`
      : `${creatingRepoPreamble}.`

  const repoDestinationMessageElement = document.querySelector<HTMLInputElement>('.js-new-repo-destination-message')
  if (repoDestinationMessageElement) {
    const visibilityMessage = visibility ? (visibility === 'internal' ? 'n internal' : ` ${visibility}`) : ''

    repoDestinationMessageElement.textContent = repoDestinationMessage(
      // eslint-disable-next-line i18n-text/no-en
      `You are creating a${visibilityMessage} repository`,
    )
    return
  }
}

function updateRepoDestinationMessageFromVisibility(visibility: string) {
  const selectedOwner = document.querySelector<HTMLElement>('.js-owner-container [aria-checked="true"]')!
  updateRepoDestinationMessage(visibility, selectedOwner)
}

function updateRepoDestinationMessageFromSelectedOwner(selectedOwner: HTMLElement) {
  const radio = document.querySelector<HTMLInputElement>('.js-privacy-toggle:checked')
  updateRepoDestinationMessage(radio?.value, selectedOwner)
}

function enableDisableRepoType(
  enabled: boolean,
  radio: HTMLInputElement | null,
  label: HTMLElement | null,
  description: HTMLElement | null,
  restrictedDescription: HTMLElement | null,
) {
  if (enabled) {
    if (radio) radio.disabled = false
    if (label) label.classList.remove('color-fg-muted')
    if (description) description.hidden = false
    if (restrictedDescription) restrictedDescription.hidden = true
  } else {
    if (radio) radio.disabled = true
    if (label) label.classList.add('color-fg-muted')
    if (description) description.hidden = true
    if (restrictedDescription) restrictedDescription.hidden = false
  }
}

function checkOwnerSelected() {
  const selectedOwnerElement = getSelectedOwnerElement()
  if (!selectedOwnerElement) {
    return
  }

  const ownerFormGroup = selectedOwnerElement.closest('.form-group')
  if (!ownerFormGroup) {
    return
  }

  const repoNameInput = getRepoNameInput()
  if (!repoNameInput) {
    return
  }

  const ownerSelected = selectedOwnerElement.getAttribute('data-is-user-or-org') === 'true'
  const isOwnerFormFocused = ownerFormGroup.querySelector('#repository-owner') === document.activeElement

  ownerSelected || !repoNameInput.value || isOwnerFormFocused
    ? ownerFormGroup.classList.remove('errored')
    : ownerFormGroup.classList.add('errored')
}

function hideOrgUpgradeLinks() {
  const visibleOrgUpgradeLinks = document.querySelectorAll<HTMLElement>('.js-org-upgrade-link:not([hidden=""]')
  for (const visibleOrgUpgradeLink of visibleOrgUpgradeLinks) {
    visibleOrgUpgradeLink.hidden = true
  }
}

function getSelectedOwnerElement() {
  return document.querySelector<HTMLElement>('.js-owner-container [aria-checked="true"]')
}

function getRepoNameInput() {
  return document.querySelector<HTMLInputElement>('.js-owner-reponame .js-repo-name')
}

function ensureOneRadioIsSelected(
  selectedOwner: HTMLElement,
  publicRadio: HTMLInputElement | null,
  internalRadio: HTMLInputElement | null,
  privateRadio: HTMLInputElement,
) {
  // Determine the best default visibility to select based on the org's default and what's enabled.
  let selectRadio = null
  if (selectedOwner.getAttribute('data-default') === 'private' && privateRadio && !privateRadio.disabled)
    selectRadio = privateRadio
  else if (selectedOwner.getAttribute('data-default') === 'internal' && internalRadio && !internalRadio.disabled)
    selectRadio = internalRadio
  else if (publicRadio && !publicRadio.disabled) selectRadio = publicRadio
  else if (internalRadio && !internalRadio.disabled) selectRadio = internalRadio

  if (privateRadio && !privateRadio.disabled && profileReadmeParam === 'member') selectRadio = privateRadio
  else if (publicRadio && !publicRadio.disabled && profileReadmeParam) selectRadio = publicRadio

  // Not possible because orgs with no enabled visibilities can't be selected, but flow doesn't know that so here we are.
  if (!selectRadio) return

  // Is a disabled option currently selected?
  const disabledSelected =
    (publicRadio && publicRadio.disabled && publicRadio.checked) ||
    (privateRadio.disabled && privateRadio.checked) ||
    (internalRadio && internalRadio.disabled && internalRadio.checked)

  // Are none of the visible options currently selected?
  const noneSelected =
    (!publicRadio || !publicRadio.checked) && (!internalRadio || !internalRadio.checked) && !privateRadio.checked

  // If the user hasn't manually changed visibility or we're in an invalid state, either because
  //  nothing is selected or a disabled option is selected, select the best available default.
  if (changedPrivacyManually === false || disabledSelected === true || noneSelected === true) {
    selectRadio.checked = true
    fire(selectRadio, 'change')
  }
}

// Display only the currently selected org's internal repos div, if any, and
// update its enabled/disabled state and labels.
function updateInternalDiv(businessId: string | null, selectedOwner: HTMLElement): HTMLInputElement | null {
  let internalSelected = false
  // Hide all internal divs
  const divs = document.querySelectorAll<HTMLElement>('.js-new-repo-internal-visibility')
  for (const div of divs) {
    div.hidden = true
    const internalRadio = div.querySelector('.js-privacy-toggle[value=internal]')
    // Preserve selection of Internal if we're hiding one and showing another.
    if (internalRadio instanceof HTMLInputElement && internalRadio.checked) internalSelected = true
  }

  if (businessId) {
    const selectedDiv = document.querySelector<HTMLElement>(`#new-repo-internal-visibility-${businessId}`)
    if (selectedDiv) {
      selectedDiv.hidden = false

      const label = selectedDiv.querySelector('.js-privacy-toggle-label-internal')
      const description = selectedDiv.querySelector<HTMLElement>('.js-internal-description')
      const restrictedByPolicyDescription = selectedDiv.querySelector<HTMLElement>(
        '.js-internal-restricted-by-policy-description',
      )

      const internalRadio = selectedDiv.querySelector('.js-privacy-toggle[value=internal]')
      if (internalRadio instanceof HTMLInputElement) {
        if (selectedOwner.getAttribute('data-org-allow-internal-repos') === 'false') {
          internalRadio.disabled = true
          if (label) label.classList.add('color-fg-muted')
          if (description) description.hidden = true
          if (restrictedByPolicyDescription) restrictedByPolicyDescription.hidden = false
        } else {
          // Preserve selection of Internal if we're hiding one and showing another.
          if (internalSelected) {
            internalRadio.checked = true
            fire(internalRadio, 'change')
          }
          internalRadio.disabled = false
          if (label) label.classList.remove('color-fg-muted')
          if (description) description.hidden = false
          if (restrictedByPolicyDescription) restrictedByPolicyDescription.hidden = true
        }
        return internalRadio
      }
    }
  }
  return null
}

function toggleRepoNameAutoCheck(selectedOwner: HTMLElement) {
  const autoCheck = document.querySelector<HTMLInputElement>('auto-check.js-repo-name-autocheck')!

  const src = autoCheck.getAttribute('src')
  const disabledSrc = autoCheck.getAttribute('disabled-src')

  const isOwnerSelected = selectedOwner.getAttribute('data-is-user-or-org') === 'true'
  if (isOwnerSelected) {
    if (disabledSrc) autoCheck.setAttribute('src', disabledSrc)
    autoCheck.removeAttribute('disabled-src')
  } else {
    if (src) autoCheck.setAttribute('disabled-src', src)
    autoCheck.removeAttribute('src')
  }
}

function togglePermissionFields(hasPermission: boolean) {
  for (const field of document.querySelectorAll<HTMLElement>('.js-with-permission-fields')) {
    field.hidden = !hasPermission
  }
  for (const field of document.querySelectorAll<HTMLElement>('.js-without-permission-fields')) {
    field.hidden = hasPermission
  }

  const erroredEl = document.querySelector<HTMLElement>('.errored')
  const warnEl = document.querySelector<HTMLElement>('dl.warn')
  if (erroredEl) erroredEl.hidden = !hasPermission
  if (warnEl) warnEl.hidden = !hasPermission
}

function handlePrivacyChange(event?: Event) {
  const radio =
    (event?.target as HTMLInputElement | null) || document.querySelector<HTMLInputElement>('.js-privacy-toggle:checked')

  if (!radio) {
    return
  }

  updateRepoDestinationMessageFromVisibility(radio.value)

  validate()
}

function validate() {
  const form = document.querySelector<HTMLElement>('.js-repo-form')!
  const repoOwner = form.querySelector('.js-repository-owner-choice:checked')
  const repoName = form.querySelector('.js-repo-name')
  const repoUrl = form.querySelector('.js-repo-url')

  let valid = repoUrl ? !repoUrl.classList.contains('is-autocheck-errored') : true

  // If the repo already exists (e.g. importing into an existing empty repo) then there's no owner on the form to check
  const ownerValid = !!document.querySelector('.js-page-repo-persisted') || !!repoOwner

  valid = valid && ownerValid

  if (valid && repoName) {
    valid = repoName.classList.contains('is-autocheck-successful')
  }

  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!
  submit.disabled = !valid
}

function toggleDefaultBranchInfo(checkbox: HTMLInputElement) {
  const container = checkbox.closest<HTMLElement>('form')!
  const defaultBranchInfo = container.querySelector<HTMLElement>('.js-new-repo-default-branch-info')
  if (!defaultBranchInfo) {
    return
  }

  const checkedCheckboxes = container.querySelectorAll<HTMLInputElement>(
    '.js-toggle-new-repo-default-branch-info:checked',
  )
  const anyChecked = checkedCheckboxes.length > 0

  // Hide the info about what the default branch will be called if no
  // files are getting added for the user upon repo creation.
  defaultBranchInfo.hidden = !anyChecked
}

observe('.js-page-new-repo', function () {
  const ownerContainer = document.querySelector<HTMLElement>('.js-owner-container')
  if (!ownerContainer) {
    return
  }

  focusFirstFormField()
  handleOwnerChange()
})

const focusFirstFormField = () => {
  const form = document.querySelector<HTMLElement>('.js-repo-form')!
  const repoUrlInput = form.querySelector<HTMLInputElement>('.js-repo-url')
  if (repoUrlInput) {
    repoUrlInput.focus()
    return
  }
  const templateSelect = form.querySelector<HTMLElement>('.js-template-repository-select')
  if (templateSelect) {
    templateSelect.focus()
    return
  }
  const ownerSelect = form.querySelector<HTMLElement>('.js-owner-select')
  if (ownerSelect) ownerSelect.focus()
}

on('focusout', '#repository-owner', function () {
  checkOwnerSelected()
})

on('click', '.js-reponame-suggestion', function (event) {
  const field = document.querySelector<HTMLInputElement>('.js-repo-name')!
  field.value = event.currentTarget.textContent!
  checkOwnerSelected()
  fire(field, 'input', false)
})

on('click', '.js-use-pages-url', function (e) {
  const checkbox = e.currentTarget as HTMLInputElement
  const input = document.querySelector<HTMLInputElement>('.js-pages-url-input')!
  const pageUrl = document.getElementById('page-url')!

  input.readOnly = checkbox.checked
  input.value = pageUrl.textContent!
  if (checkbox.checked) {
    input.classList.add('color-fg-subtle')
    input.classList.add('color-bg-subtle')
    input.classList.remove('color-bg-default')
    input.classList.remove('color-fg-default')
  } else {
    input.classList.remove('color-fg-subtle')
    input.classList.remove('color-bg-subtle')
    input.classList.add('color-fg-default')
    input.classList.add('color-bg-default')
  }
})

on('click', '.js-privacy-toggle', function () {
  changedPrivacyManually = true
})

on('change', '.js-privacy-toggle', handlePrivacyChange)
on('details-menu-selected', '.js-owner-container', handleOwnerChange, {capture: true})

const renderOrgProfileHint = (event: Event | null) => {
  const orgMessageElement = document.querySelector<HTMLElement>('.js-org-profile')
  if (orgMessageElement) {
    const ownerInput = document.querySelector<HTMLInputElement>(
      '.js-owner-container input.js-repository-owner-is-org:checked',
    )
    const input = (event?.target as HTMLInputElement) || document.querySelector<HTMLInputElement>('.js-repo-name')
    const hideMessage = !(ownerInput && input.value.toLowerCase() === '.github')
    orgMessageElement.hidden = hideMessage
    const nameSuggestion = document.querySelector<HTMLElement>('#repo-name-suggestion')!
    nameSuggestion.hidden = !hideMessage
  }
}

const renderOrgPrivateProfileHint = (event: Event | null) => {
  const orgMessageElement = document.querySelector<HTMLElement>('.js-org-private-profile')
  if (orgMessageElement) {
    const ownerInput = document.querySelector<HTMLInputElement>(
      '.js-owner-container input.js-repository-owner-is-org:checked',
    )
    const input = (event?.target as HTMLInputElement) || document.querySelector<HTMLInputElement>('.js-repo-name')
    const hideMessage = !(ownerInput && input.value.toLowerCase() === '.github-private')
    orgMessageElement.hidden = hideMessage
    const nameSuggestion = document.querySelector<HTMLElement>('#repo-name-suggestion')!
    nameSuggestion.hidden = !hideMessage
  }
}

const renderPersonalProfileHint = (event: Event | null) => {
  const messageElement = document.querySelector<HTMLElement>('.js-personal')
  if (messageElement) {
    const ownerInput = document.querySelector<HTMLInputElement>(
      '.js-owner-container input.js-repository-owner-is-viewer',
    )
    const input = (event?.target as HTMLInputElement) || document.querySelector<HTMLInputElement>('.js-repo-name')
    const hideMessage = !(
      ownerInput &&
      ownerInput.checked &&
      ownerInput.defaultValue.toLowerCase() === input.value.toLowerCase()
    )
    messageElement.hidden = hideMessage
    const nameSuggestion = document.querySelector<HTMLElement>('#repo-name-suggestion')!
    nameSuggestion.hidden = !hideMessage
  }
}

// When the user is filling in the name of their repo, we give them
// specific hints if they're creating their profile repo or their
// org's .github repo
onInput('.js-owner-reponame .js-repo-name', function (event) {
  renderPersonalProfileHint(event)
  renderOrgProfileHint(event)
  renderOrgPrivateProfileHint(event)
  checkOwnerSelected()

  validate()
})

on('auto-check-send', '.js-repo-name-auto-check', function (event) {
  const input = event.currentTarget as HTMLInputElement
  const form = input.form!
  const owner = form.querySelector<HTMLInputElement>('input[name=owner]:checked')!.value
  event.detail.body.append('owner', owner)
})

// when the repository name is entered validate the contents
on('auto-check-complete', '.js-repo-name-auto-check', validate)

onInput('.js-repo-url', function (event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return

  const formGroup = input.closest('.form-group')
  if (!(formGroup instanceof HTMLDListElement)) return

  const insecureUrlWarning = document.querySelector<HTMLElement>('.js-insecure-url-warning')!
  const svnProtocolError = document.querySelector<HTMLElement>('.js-svn-url-error')!
  const gitProtocolError = document.querySelector<HTMLElement>('.js-git-url-error')!

  const url = input.value.toLowerCase()

  insecureUrlWarning.hidden = !url.startsWith('http://')
  svnProtocolError.hidden = !url.startsWith('svn://')
  gitProtocolError.hidden = !url.startsWith('git://')

  if (url.startsWith('svn://') || url.startsWith('git://')) {
    input.classList.add('is-autocheck-errored')
    formGroup.classList.add('errored')
  } else {
    input.classList.remove('is-autocheck-errored')
    formGroup.classList.remove('errored')
  }

  validate()
})

// Monitor when a menu option is selected for one of the repo
// initialization options like .gitignore or license.
on('change', '.js-repo-init-setting-menu-option', validate)

// Monitor when repo initialization option for "Add a README" is toggled
on('change', '.js-repo-readme', validate)

// Monitor when any of the repo initialization options is toggled so that we can
// show a message about what the default branch will be if a readme, gitignore,
// or license file is added.
on('change', '.js-toggle-new-repo-default-branch-info', evt => {
  const checkbox = evt.currentTarget as HTMLInputElement
  toggleDefaultBranchInfo(checkbox)
})

renderPersonalProfileHint(null)
renderOrgProfileHint(null)
renderOrgPrivateProfileHint(null)
