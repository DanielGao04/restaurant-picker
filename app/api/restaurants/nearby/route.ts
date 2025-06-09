import { type NextRequest, NextResponse } from "next/server"

interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  price_level?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  business_status?: string
}

interface GooglePlacesResponse {
  results: PlaceResult[]
  status: string
  error_message?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const radius = searchParams.get("radius") || "5000"

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error("Google Places API key not configured in environment variables")
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
    url.searchParams.set("location", `${lat},${lng}`)
    url.searchParams.set("radius", radius)
    url.searchParams.set("type", "restaurant")
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Places API error:", errorText)
      return NextResponse.json(
        { 
          error: "Failed to fetch restaurants",
          details: errorText
        },
        { status: 500 }
      )
    }

    const data: GooglePlacesResponse = await response.json()

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.error_message)
      return NextResponse.json(
        { 
          error: "Failed to fetch restaurants",
          details: data.error_message
        },
        { status: 500 }
      )
    }

    // Filter and transform the results
    const restaurants = data.results
      .filter((place) => place.business_status !== "CLOSED_PERMANENTLY" && place.rating && place.rating > 3.0)
      .map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        priceLevel: place.price_level,
        placeId: place.place_id,
        photoReference: place.photos?.[0]?.photo_reference,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
      }))

    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
