export interface Restaurant {
  id: string
  name: string
  address: string
  rating: number
  priceLevel?: number
  photoReference?: string
  photoUrl?: string
  placeId: string
  location: {
    lat: number
    lng: number
  }
}

export interface UserLocation {
  lat: number
  lng: number
  address: string
}

export interface ApiError {
  error: string
}
