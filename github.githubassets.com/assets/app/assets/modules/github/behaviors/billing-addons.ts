import {addThrottledInputEventListener} from '../throttled-input'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {replaceState} from '../history'
import visible from '../visible'
import {softNavigate} from '@github-ui/soft-navigate'

const priceSelectors = ['.unstyled-additional-seats-price-obj', '.unstyled-base-price-obj', '.unstyled-final-price-obj']

interface PriceStruct {
  default_currency: string
  local_currency: string
}

type SelectorValue = PriceStruct | string | number

function isAPriceStruct(obj: SelectorValue): obj is PriceStruct {
  if (typeof obj === 'string') return false
  if (typeof obj === 'number') return false
  return 'default_currency' in obj && 'local_currency' in obj
}

interface UserPlan {
  free: boolean
  is_enterprise_cloud_trial: boolean
  seats: number
  no_additional_seats: boolean
  selectors: Record<string, SelectorValue>
  url: string
}

let previousController: AbortController | null = null
on('click', '.js-org-signup-duration-change', event => {
  event.preventDefault()
  const el = event.currentTarget
  const newDuration = el.getAttribute('data-plan-duration')!

  updateDurationFields(newDuration)
  updateSeatFieldURLs(newDuration)
  for (const seatsField of document.querySelectorAll<HTMLInputElement>('.js-seat-field')) {
    updateTotals(seatsField)
  }
  toggleDurationUnitPrices()
})

on('change', '.js-org-signup-duration-toggle', function ({currentTarget}) {
  const url = new URL(currentTarget.getAttribute('data-url')!, window.location.origin)

  softNavigate(url.toString())
})

async function updateTotals(el: HTMLInputElement | HTMLSelectElement) {
  const itemKey = el.getAttribute('data-item-name') || 'items'
  const itemRawCount = el.value
  const url = new URL(el.getAttribute('data-url')!, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  const itemMinimum = parseInt(el.getAttribute('data-item-minimum')!) || 0
  const itemMaximum = parseInt(el.getAttribute('data-item-maximum')!) || 1_000_000 //1 mil is default when limit_maximum_seats_for_plan_upgrades is disabled
  const itemCount = parseInt(el.getAttribute('data-item-count')!) || 0
  const itemDelta = Math.max(itemMinimum, parseInt(itemRawCount) || 0)
  const contactUs = itemDelta > itemMaximum

  const downgradeButton = document.querySelector('.js-downgrade-button')
  const downgradeDisabledMessage = document.getElementById('downgrade-disabled-message')
  if (downgradeButton instanceof HTMLButtonElement) {
    downgradeButton.disabled = itemDelta === itemCount
  }

  if (downgradeDisabledMessage instanceof HTMLElement && downgradeButton instanceof HTMLButtonElement) {
    downgradeDisabledMessage.hidden = !downgradeButton.disabled
  }

  params.append(itemKey, itemDelta.toString())

  const transformInput = document.querySelector('.js-transform-user')
  if (transformInput) params.append('transform_user', '1')

  url.search = params.toString()

  previousController?.abort()
  const {signal} = (previousController = new AbortController())
  let data: UserPlan | null = null
  try {
    const response = await fetch(url.toString(), {signal, headers: {Accept: 'application/json'}})
    if (!response.ok) return
    data = (await response.json()) as UserPlan
  } catch {
    // ignore network errors
  }
  if (signal.aborted) return
  if (!data) return

  const contact = document.querySelector('.js-contact-us')
  /* eslint-disable-next-line github/no-d-none */
  if (contact) contact.classList.toggle('d-none', !contactUs)

  const planCost = document.querySelector('.js-cost-info') as HTMLElement
  if (planCost) planCost.hidden = contactUs

  const paymentSummary = document.querySelector('.js-payment-summary')
  /* eslint-disable-next-line github/no-d-none */
  if (paymentSummary) paymentSummary.classList.toggle('d-none', contactUs)

  const submit = document.querySelector('.js-submit-billing')
  if (submit instanceof HTMLElement) submit.hidden = contactUs

  const billing = document.querySelector('.js-billing-section')
  if (billing) billing.classList.toggle('has-removed-contents', data.free || data.is_enterprise_cloud_trial)

  const upgrade = document.querySelector('.js-upgrade-info')
  /* eslint-disable-next-line github/no-d-none */
  if (upgrade) upgrade.classList.toggle('d-none', itemDelta <= 0)

  const downgrade = document.querySelector('.js-downgrade-info')
  /* eslint-disable-next-line github/no-d-none */
  if (downgrade) downgrade.classList.toggle('d-none', itemDelta >= 0)

  const extraSeats = document.querySelector('.js-extra-seats-line-item')
  /* eslint-disable-next-line github/no-d-none */
  if (extraSeats) extraSeats.classList.toggle('d-none', data.no_additional_seats)

  const seatField = document.querySelector('.js-seat-field')
  if (seatField) updateSeatFields(itemRawCount)

  const minimumSeatsTooltip = document.querySelector('.js-minimum-seats-disclaimer')
  if (minimumSeatsTooltip) {
    minimumSeatsTooltip.classList.toggle('tooltipped', data.seats === 5)
    minimumSeatsTooltip.classList.toggle('tooltipped-nw', data.seats === 5)
  }

  const ref = data.selectors
  for (const selector in ref) {
    for (const element of document.querySelectorAll(selector)) {
      if (isPriceSelector(selector) && isAPriceStruct(ref[selector]!)) {
        element.textContent = ''
        element.appendChild(priceCurrencyTag('default-currency', (<PriceStruct>ref[selector]).default_currency))
        element.appendChild(priceCurrencyTag('local-currency', (<PriceStruct>ref[selector]).local_currency))
      } else {
        element.textContent = <string>ref[selector]
      }
    }
  }

  replaceState(history.state, '', data.url)
}

function isPriceSelector(selector: string): boolean {
  return priceSelectors.includes(selector)
}

function priceCurrencyTag(className: string, price: string): HTMLSpanElement {
  const span = document.createElement('span')
  span.classList.add(className)
  span.textContent = price
  return span
}

function toggleDurationUnitPrices() {
  for (const unitPrice of document.querySelectorAll<HTMLElement>('.js-unit-price')) {
    unitPrice.hidden = !unitPrice.hidden
  }
}

function updateDurationFields(newDuration: string) {
  const oldDuration = newDuration === 'year' ? 'month' : 'year'
  for (const planDurationText of document.querySelectorAll('.js-plan-duration-text')) {
    planDurationText.textContent = newDuration
  }

  for (const planDurationAdjective of document.querySelectorAll('.unstyled-available-plan-duration-adjective')) {
    planDurationAdjective.textContent = `${newDuration}ly`
  }

  for (const durationLink of document.querySelectorAll('.js-org-signup-duration-change')) {
    durationLink.setAttribute('data-plan-duration', oldDuration)
  }
  const planDurationInput = <HTMLInputElement>document.getElementById('signup-plan-duration')
  if (planDurationInput) {
    planDurationInput.value = newDuration
  }
}

function updateSeatFields(numberOfSeats: string) {
  for (const el of document.querySelectorAll<HTMLInputElement>('.js-seat-field')) {
    const maxSeatForPlan = el.getAttribute('data-item-maximum')!
    const popover = el?.parentNode?.querySelector<HTMLElement>('.Popover')

    if (maxSeatForPlan && maxSeatForPlan.length) {
      if (parseInt(numberOfSeats, 10) > parseInt(maxSeatForPlan, 10)) {
        el.classList.add('color-border-danger-emphasis')
        popover?.removeAttribute('hidden')
      } else {
        el.classList.remove('color-border-danger-emphasis')
        popover?.setAttribute('hidden', 'true')
      }
    }
  }
}

function updateSeatFieldURLs(newDuration: string) {
  for (const el of document.querySelectorAll<HTMLInputElement>('.js-seat-field')) {
    const url = new URL(el.getAttribute('data-url')!, window.location.origin)
    const params = new URLSearchParams(url.search.slice(1))
    params.delete('plan_duration')
    params.append('plan_duration', newDuration)
    url.search = params.toString()
    el.setAttribute('data-url', url.toString())
  }
}

observe('.js-addon-purchase-field', {
  constructor: HTMLInputElement,
  add(el) {
    if (visible(el)) updateTotals(el)

    addThrottledInputEventListener(el, function () {
      updateTotals(el)
    })
  },
})

observe('.js-addon-downgrade-field', {
  constructor: HTMLSelectElement,
  add(el) {
    if (visible(el)) updateTotals(el)

    el.addEventListener('change', function () {
      updateTotals(el)
    })
  },
})

function handleOrgChange(event: Event) {
  const addonField = document.querySelector('.js-addon-purchase-field')
  const selectedRadio = (event.target as Element).querySelector('input:checked')

  if (addonField instanceof HTMLInputElement && selectedRadio instanceof HTMLInputElement) {
    const newUrl = selectedRadio.getAttribute('data-upgrade-url')

    if (newUrl) {
      addonField.setAttribute('data-url', newUrl)
      addonField.value = '0'
      updateTotals(addonField)
    }
  }
}

on('details-menu-selected', '.js-organization-container', handleOrgChange, {capture: true})
