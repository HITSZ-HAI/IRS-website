import {partialRegistry, type PartialRegistration} from './react-partial-registry'
// Import the web component to get it registered on the window
import './ReactPartialElement'

export function registerReactPartial(name: string, registration: PartialRegistration) {
  partialRegistry.register(name, registration)
}
