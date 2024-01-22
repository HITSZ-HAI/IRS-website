function camelCase(input: string) {
  return input.toLowerCase().replace(/-(.)/g, function (_match, group1) {
    return group1.toUpperCase()
  })
}

// collect all data-optimizely-meta-* attributes into an object
// that can be passed along when calling optimizely.track()
export function getUserAttributes(element: HTMLElement): {[key: string]: string} {
  const userAttributes: {[key: string]: string} = {}

  for (const {name, value} of element.attributes) {
    if (name.startsWith('data-optimizely-meta-')) {
      const key = name.replace('data-optimizely-meta-', '')
      if (value && value.trim().length) {
        userAttributes[camelCase(key)] = value
      }
    }
  }

  return userAttributes
}
