import {attr, controller, target, targets} from '@github/catalyst'

/**
 * A web component that allows inline editing of <input> fields.
 * The fields work without an outer <form>.
 *
 * @type HTMLElement
 * @example
 * ```html
 * <sidebar-memex-input update-url="http://localhost" csrf-token="1234567890" column-id="1">
 *  <input type="date name="memexProjectColumnValues[][value]" value="" data-target="sidebar-memex-input.read" data-action=" blur:sidebar-memex-input#onBlur keydown:sidebar-memex-input#onKeyDown disabled />
 * </sidebar-memex-input>
 * ```
 */
@controller
class SidebarMemexInputElement extends HTMLElement {
  static attrPrefix = ''
  @attr updateUrl = ''
  @attr csrfToken = ''
  @attr instrumentType = ''
  @attr columnId = 1

  @targets inputs: NodeListOf<HTMLInputElement>
  @target read: HTMLInputElement
  @target write: HTMLElement
  @targets parameters: NodeListOf<HTMLInputElement>

  get isDisabled(): boolean {
    return this.read?.hasAttribute('disabled')
  }

  set hasErrored(value: boolean) {
    value ? this.setAttribute('errored', '') : this.removeAttribute('errored')
  }

  set disabled(value: boolean) {
    value ? this.setAttribute('disabled', '') : this.removeAttribute('disabled')
  }

  get hasExpanded(): boolean {
    return this.read.getAttribute('aria-expanded') === 'true'
  }

  get detailsElement() {
    return this.querySelector('details') ?? null
  }

  connectedCallback() {
    this.disabled = this.read?.disabled ?? true

    // Resetting disabled attribute of the element to true after closing the dropdown, so that
    // iteration field still has cursor pointer on the pencil on subsequent hoverings (cursor style is dependant on the `disabled` attribute).
    // As the filter text input is not focused when opening the iteration field dropdown, `onBlur` does not
    // run when user closes the menu, so that `disabled` is not reset, like for text-based fields.
    this.detailsElement?.addEventListener('toggle', () => this.handleSelectMenuToggle())
  }

  disconnectedCallback() {
    this.detailsElement?.removeEventListener('toggle', () => this.handleSelectMenuToggle())
  }

  handleSelectMenuToggle() {
    if (this.detailsElement && !this.detailsElement?.open) {
      this.disabled = true
    } else if (this.detailsElement && this.detailsElement?.open) {
      this.disabled = false
    }
  }

  handleDetailsSelect(e: Event) {
    const custom = e as CustomEvent
    const details = e.target as HTMLElement
    const el = custom.detail?.relatedTarget as HTMLElement
    const opened = details.closest('details')
    const button = opened?.querySelector('[data-menu-button]')
    const summary = opened?.querySelector('summary')

    if (el.getAttribute('aria-checked') === 'true') {
      el.setAttribute('aria-checked', 'false')
      e.preventDefault()

      for (const input of this.inputs) {
        if (el.contains(input)) {
          this.updateCell(input.name, '')

          if (button?.innerHTML) {
            button.innerHTML = input.placeholder
          }

          break
        }
      }

      opened?.removeAttribute('open')
      /**
       * This function modifies the default behavior of the <details-menu> so that clicking on a
       *  selected item clears an existing value. This causes focus to be lost from the <summary>
       * which results in this element being replaced upon live update. Manually refocusing the
       * summary element here prevents this from happening.
       */
      summary?.focus()
    }
  }

  handleDetailsSelected(e: Event) {
    const custom = e as CustomEvent
    const el = custom.detail?.relatedTarget as HTMLElement
    for (const input of this.inputs) {
      if (el.contains(input)) {
        this.updateCell(input.name, input.value)
        break
      }
    }
  }

  mouseDownFocus(e: Event) {
    if (!this.isDisabled) {
      return
    }
    this.onFocus(e)
  }

  keyDownFocus(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'Space') {
      if (this.detailsElement) {
        this.onSelectMenuOpen()
      }
      if (this.read !== document.activeElement) {
        this.onFocus(e)
      }
    }
  }

  // to handle the clicks on the header (incl. pencil), so that the general mouseDownFocus doesn't interfere with opening the
  // dropdown summary
  mouseDownFocusHeader() {
    if (this.detailsElement) {
      this.onSelectMenuOpen()
    }
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onChange(e: Event) {
    const el = e.target as HTMLElement
    if (el.getAttribute('type') === 'date') {
      return
    }

    this.updateCell(this.read?.name, this.read?.value)
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onFocus(e: KeyboardEvent | Event) {
    e.preventDefault()

    this.disabled = false
    this.read.disabled = false
    this.read.focus()
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onSelectMenuOpen() {
    if (this.detailsElement) {
      this.detailsElement.open = true
    }
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onBlur(e: Event) {
    if (this.hasExpanded) {
      e.preventDefault()
      return
    }

    const el = e.target as HTMLElement
    if (el.getAttribute('type') === 'date') {
      this.updateCell(this.read?.name, this.read?.value)
    }

    this.read.disabled = true
    this.disabled = true
  }

  /* eslint-disable-next-line custom-elements/no-method-prefixed-with-on */
  onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'Tab') {
      e.preventDefault()
      e.stopPropagation()

      if (this.hasExpanded) {
        return
      }

      // eslint-disable-next-line github/no-blur
      this.read.blur()
    }
  }

  async updateCell(name = '', value = '') {
    const data = new FormData()
    data.set(name, value)
    data.set('ui', this.instrumentType)

    for (const input of this.parameters) {
      data.set(input.name, input.value)
    }

    try {
      // this is an opportunistic update
      if (this.write) {
        const update = this.read.value
        const formatted = this.read.type === 'date' && update ? this.format.format(Date.parse(update)) : update
        this.write.textContent = update ? formatted : this.read.placeholder
      }

      const response = await fetch(this.updateUrl, {
        method: 'PUT',
        body: data,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Scoped-CSRF-Token': `${this.csrfToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('connection error')
      }

      // if there is no target to update,
      // break here and leave the opportunistic update of the field
      if (!this.write) {
        return
      }

      // this is the reconciliation
      const content = await response.json()
      const column = content['memexProjectItem']['memexProjectColumnValues'].find(
        (e: Record<string, unknown>) => e['memexProjectColumnId'] === Number(this.columnId),
      )

      const commit = column['value']
      const formatted = this.parseAndFormatUpdate(commit)
      this.write.innerHTML = value ? formatted : this.read.placeholder
    } catch (e) {
      this.hasErrored = true
    }
  }

  parseAndFormatUpdate(commit: {value?: string; html?: string}) {
    switch (this.read.type) {
      case 'date': {
        const update = commit.value ? Date.parse(commit.value) : undefined
        return update ? this.format.format(update) : ''
      }
      case 'number': {
        return commit.value == null ? '' : commit.value
      }
      default: {
        return commit.html ?? ''
      }
    }
  }

  private format = Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
