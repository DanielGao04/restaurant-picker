"use client"

import { useState, useCallback } from "react"
import type { UserLocation } from "@/lib/types"

interface GeolocationState {
  location: UserLocation | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  })

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation is not supported by this browser" }))
      return null
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocoding to get address - use server-side API route instead
      let address = "Unknown location"
      try {
        const geocodeResponse = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          address = geocodeData.address || "Unknown location"
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        // Fallback to coordinates if geocoding fails
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }

      const location: UserLocation = {
        lat: latitude,
        lng: longitude,
        address,
      }

      setState({ location, loading: false, error: null })
      return location
    } catch (error) {
      const errorMessage =
        error instanceof GeolocationPositionError
          ? getGeolocationErrorMessage(error.code)
          : "Failed to get your location"

      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}

function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location access denied. Please enable location permissions."
    case 2:
      return "Location unavailable. Please try again."
    case 3:
      return "Location request timed out. Please try again."
    default:
      return "Failed to get your location."
  }
}
