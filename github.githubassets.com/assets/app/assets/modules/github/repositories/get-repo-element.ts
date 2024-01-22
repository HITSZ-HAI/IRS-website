import {controller, target, targets, attr} from '@github/catalyst'
import {getPlatform} from '../platform-toggle'
import safeStorage from '@github-ui/safe-storage'
import {trackView} from '../hydro-tracking'

const {getItem, setItem} = safeStorage('localStorage')

// for persisting which tab was last selected in localstorage
const DefaultTabKey = 'code-button-default-tab'

@controller
export class GetRepoElement extends HTMLElement {
  @attr forceCodespaceTabDefault = false

  @target modal: HTMLElement
  @target codespaceForm: HTMLFormElement
  @target codespaceLoadingMenu: HTMLElement | undefined
  @target codespaceList: HTMLElement | undefined
  @target codespaceSelector: HTMLElement
  @target openOrCreateInCodespace: HTMLElement
  @target vscodePoller: HTMLElement
  @targets platforms: HTMLElement[]
  @target copilotTip: HTMLElement
  private shouldRefreshList = false
  private hasForcedCodespaceTabDefault = false

  showDownloadMessage(event: Event) {
    const app = this.findPlatform(event)
    if (!app) return

    this.showPlatform(app)
  }

  showCodespaces(event: Event) {
    const app = this.findPlatform(event)
    if (!app) return

    this.showPlatform(app)
    this.loadAndUpdateContent()
  }

  showCodespaceSelector(event: Event) {
    const app = this.findPlatform(event)
    if (!app) return

    this.showPlatform(app)
    this.codespaceSelector && (this.codespaceSelector.hidden = false)
  }

  showOpenOrCreateInCodespace() {
    this.openOrCreateInCodespace && (this.openOrCreateInCodespace.hidden = false)
  }

  removeOpenOrCreateInCodespace() {
    this.openOrCreateInCodespace && this.openOrCreateInCodespace.remove()
  }

  refreshList() {
    if (this.shouldRefreshList) {
      this.shouldRefreshList = false
      this.loadAndUpdateContent()
    }
  }

  trackDelete() {
    this.shouldRefreshList = true
  }

  hideSpinner() {
    this.codespaceLoadingMenu && (this.codespaceLoadingMenu.hidden = true)
    this.codespaceList && (this.codespaceList.hidden = false)
  }

  showSpinner() {
    this.codespaceLoadingMenu && (this.codespaceLoadingMenu.hidden = false)
    this.codespaceList && (this.codespaceList.hidden = true)
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onDetailsToggle(e: Event) {
    this.modal.hidden = false

    for (const platform of this.platforms) {
      platform.hidden = true
    }
    const detailsEl = e.target as HTMLDetailsElement

    if (detailsEl && detailsEl.open) {
      if (!this.hasForcedCodespaceTabDefault && this.forceCodespaceTabDefault) {
        this.hasForcedCodespaceTabDefault = true
        this.selectDefaultTab(true)
      } else {
        this.selectDefaultTab(false)
      }

      const copilotEl = this.copilotTip
      if (copilotEl) {
        trackView(copilotEl)
      }
    }
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onDetailsKeydown(e: KeyboardEvent) {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key === 'Escape') {
      this.modal.hidden = true

      const element = e.target as HTMLElement
      element?.closest('details')?.removeAttribute('open')
    }
  }

  showPlatform(app: string) {
    this.modal.hidden = true

    for (const platform of this.platforms) {
      platform.hidden = platform.getAttribute('data-platform') !== app
    }
  }

  findPlatform(event: Event) {
    return (event.currentTarget as HTMLElement).getAttribute('data-open-app') || getPlatform()
  }

  refreshOnError() {
    // If we hit an error loading the codespaces list, reload the page.
    window.location.reload()
  }

  pollForVscode(event: CustomEvent) {
    this.showPlatform('vscode')

    const pollingUrl = (event.currentTarget as HTMLElement).getAttribute('data-src')
    if (pollingUrl) this.vscodePoller.setAttribute('src', pollingUrl)
  }

  backToCodespacesFromVscodePolling() {
    this.loadAndUpdateContent()
    this.showPlatform('codespaces')
  }

  localTabSelected() {
    setItem(DefaultTabKey, 'local')
  }

  cloudTabSelected() {
    setItem(DefaultTabKey, 'cloud')
    if (this.codespaceList?.id !== 'lazyLoadedCodespacesList') return

    this.loadAndUpdateContent()
  }

  // When opening the code menu, select the tab which was most recently used.
  selectDefaultTab(forceCodespaceTabDefault: boolean) {
    const defaultTab = forceCodespaceTabDefault ? 'cloud' : getItem(DefaultTabKey)
    if (!defaultTab) return
    const button = this.querySelector(`button[data-tab="${defaultTab}"`) as HTMLButtonElement
    if (button) {
      button.click()
    }
  }

  private loadAndUpdateContent() {
    // Setting `src` attribute on `<include-fragment>` will trigger a load request,
    // which updates the list content.
    this.codespaceList?.setAttribute('src', this.codespaceList.getAttribute('data-src')!)
  }
}
