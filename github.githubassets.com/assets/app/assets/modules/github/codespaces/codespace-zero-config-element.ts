import {controller, target, targets} from '@github/catalyst'

@controller
class CodespaceZeroConfigElement extends HTMLElement {
  @target regionConfig: HTMLInputElement
  @target vscsTarget: HTMLSelectElement
  @target vscsTargetUrl: HTMLInputElement
  @targets locationConfigs: HTMLSelectElement[]

  @targets vscsTargets: HTMLInputElement[]
  @targets vscsTargetUrls: HTMLInputElement[]
  @targets locations: HTMLInputElement[]

  connectedCallback() {
    this.toggleLocationConfigs('production')
  }

  updateVscsTargets() {
    this.vscsTargetUrl.disabled = this.vscsTarget.value !== 'local'
    this.toggleLocationConfigs(this.vscsTarget.value)

    for (const vscsTargetElement of this.vscsTargets) {
      vscsTargetElement.value = this.vscsTarget.value
    }
  }

  updateVscsTargetUrls() {
    for (const vscsTargetUrlElement of this.vscsTargetUrls) {
      vscsTargetUrlElement.value = this.vscsTargetUrl.value
    }
  }

  updateLocations(event: Event) {
    const locationSelect = event.currentTarget as HTMLSelectElement
    this.setLocationValues(locationSelect.value)
  }

  setLocationValues(selectedLocation: string) {
    for (const locationSelect of this.locations) {
      locationSelect.value = selectedLocation
    }
  }

  toggleLocationConfigs(vscs_target: string) {
    for (const locationSelect of this.locationConfigs) {
      if (locationSelect.getAttribute('data-vscs-target') === vscs_target) {
        locationSelect.hidden = false
        const firstOption = <HTMLOptionElement>locationSelect.querySelector('option')
        if (firstOption) {
          firstOption.selected = true
          this.setLocationValues(firstOption.value)
        }
      } else {
        locationSelect.hidden = true
      }
    }
  }
}
