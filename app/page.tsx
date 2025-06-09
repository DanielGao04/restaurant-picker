"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, Star, ExternalLink, Shuffle, Loader2, AlertCircle, Utensils } from "lucide-react"
import { useGeolocation } from "@/hooks/useGeolocation"
import type { Restaurant } from "@/lib/types"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

declare global {
  interface Window {
    google: any;
  }
}

export default function RestaurantPicker() {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation()
  const [distance, setDistance] = useState([5])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [pickingRestaurant, setPickingRestaurant] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [placesService, setPlacesService] = useState<any>(null)

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'))
        setPlacesService(service)
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleFindLocation = async () => {
    setError(null)
    await getCurrentLocation()
  }

  const fetchNearbyRestaurants = async (lat: number, lng: number, radiusKm: number) => {
    if (!placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise<Restaurant[]>((resolve, reject) => {
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: radiusKm * 1000,
        type: 'restaurant'
      }

      placesService.nearbySearch(request, (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const restaurants = results
            .filter(place => place.rating && place.rating > 3.0)
            .map(place => ({
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              rating: place.rating || 0,
              priceLevel: place.price_level,
              placeId: place.place_id,
              photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 800 }),
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            }))
          resolve(restaurants)
        } else {
          reject(new Error(`Places service error: ${status}`))
        }
      })
    })
  }

  const getPhotoUrl = (photoReference: string): string | null => {
    if (!photoReference) return null
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
  }

  const handlePickRestaurant = async () => {
    if (!location) return

    setPickingRestaurant(true)
    setError(null)

    try {
      const nearbyRestaurants = await fetchNearbyRestaurants(location.lat, location.lng, distance[0])

      if (nearbyRestaurants.length === 0) {
        setError("No restaurants found in your area. Try increasing the search distance.")
        setPickingRestaurant(false)
        return
      }

      setRestaurants(nearbyRestaurants)

      // Pick a random restaurant
      const randomIndex = Math.floor(Math.random() * nearbyRestaurants.length)
      const randomRestaurant = nearbyRestaurants[randomIndex]
      setSelectedRestaurant(randomRestaurant)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find restaurants")
    } finally {
      setPickingRestaurant(false)
    }
  }

  const handlePickAgain = async () => {
    if (restaurants.length === 0) {
      handlePickRestaurant()
      return
    }

    setPickingRestaurant(true)

    // Pick a different restaurant from the existing list
    const availableRestaurants = restaurants.filter((r) => r.id !== selectedRestaurant?.id)

    if (availableRestaurants.length === 0) {
      // If no other restaurants, fetch new ones
      handlePickRestaurant()
      return
    }

    const randomIndex = Math.floor(Math.random() * availableRestaurants.length)
    const randomRestaurant = availableRestaurants[randomIndex]
    setSelectedRestaurant(randomRestaurant)
    setPickingRestaurant(false)
  }

  const handleViewInMaps = () => {
    if (!selectedRestaurant) return

    const query = encodeURIComponent(`${selectedRestaurant.name} ${selectedRestaurant.address}`)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${selectedRestaurant.placeId}`,
      "_blank",
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-lg"
          >
            <Utensils className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              Fork Fortune
          </h1>
          <p className="text-gray-600 text-lg">Spin the fork, taste your fortune.</p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {(error || locationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || locationError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Your Location</h2>
                </div>

                {!location ? (
                  <Button
                    onClick={handleFindLocation}
                    disabled={locationLoading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                    size="lg"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Finding Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5 mr-2" />
                        Find My Location
                      </>
                    )}
                  </Button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-800 font-medium">Location found</span>
                    <span className="text-green-600 text-sm ml-auto truncate">{location.address}</span>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distance Selector */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Search Distance</h3>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                      {distance[0]} km
                    </Badge>
                  </div>
                  <div className="px-2">
                    <Slider 
                      value={distance} 
                      onValueChange={setDistance} 
                      max={10} 
                      min={1} 
                      step={1} 
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>1 km</span>
                      <span>10 km</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pick Restaurant Button */}
        {location && !selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handlePickRestaurant}
              disabled={pickingRestaurant}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
              size="lg"
            >
              {pickingRestaurant ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding Restaurants...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5 mr-2" />
                  Pick a Restaurant
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Restaurant Card */}
        <AnimatePresence>
          {selectedRestaurant && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="h-56 bg-gradient-to-r from-orange-400 to-red-400 relative">
                  {selectedRestaurant.photoUrl ? (
                    <Image
                      src={selectedRestaurant.photoUrl}
                      alt={selectedRestaurant.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black/20"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {selectedRestaurant.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-black/30 px-2 py-1 rounded-full">
                        {renderStars(selectedRestaurant.rating)}
                        <span className="text-white font-medium ml-1">
                          {selectedRestaurant.rating.toFixed(1)}
                        </span>
                      </div>
                      {selectedRestaurant.priceLevel && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {"$".repeat(selectedRestaurant.priceLevel)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 leading-relaxed">{selectedRestaurant.address}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleViewInMaps}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in Maps
                      </Button>
                      <Button
                        onClick={handlePickAgain}
                        disabled={pickingRestaurant}
                        className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        {pickingRestaurant ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shuffle className="w-4 h-4 mr-2" />
                        )}
                        Pick Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <p className="text-sm text-gray-500">Powered by Google Places API</p>
        </motion.div>
      </div>
    </div>
  )
}
