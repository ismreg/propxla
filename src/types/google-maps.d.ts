declare namespace google.maps.places {
  class Autocomplete {
    constructor(
      inputField: HTMLInputElement,
      opts?: AutocompleteOptions
    )
    addListener(eventName: string, handler: () => void): void
    getPlace(): PlaceResult
  }

  interface AutocompleteOptions {
    bounds?: google.maps.LatLngBounds
    componentRestrictions?: { country: string | string[] }
    strictBounds?: boolean
    types?: string[]
  }

  interface PlaceResult {
    formatted_address?: string
    name?: string
    geometry?: {
      location?: {
        lat(): number
        lng(): number
      }
    }
  }
}

declare namespace google.maps {
  class LatLngBounds {
    constructor(sw: LatLngLiteral, ne: LatLngLiteral)
  }

  interface LatLngLiteral {
    lat: number
    lng: number
  }
}

interface Window {
  google?: typeof google
}

declare const google: {
  maps: typeof google.maps
}
