import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  // Debug: Check if API key exists
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  console.log("API Key exists:", !!apiKey)
  console.log("API Key length:", apiKey?.length || 0)
  console.log("API Key first 10 chars:", apiKey?.substring(0, 10) || "N/A")

  if (!apiKey) {
    console.error("Google Places API key not configured in environment variables")
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("GOOGLE")),
    )

    // Return coordinates as fallback when API key is missing
    return NextResponse.json({
      address: `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lng).toFixed(4)}`,
      error: "API key not configured - using coordinates",
    })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    console.log("Making geocoding request...")

    const response = await fetch(url)
    const data = await response.json()

    console.log("Geocoding response status:", data.status)

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const address = data.results[0].formatted_address
      console.log("Geocoding successful:", address)
      return NextResponse.json({ address })
    } else {
      console.error("Geocoding API error:", data.status, data.error_message)
      // Return coordinates as fallback
      return NextResponse.json({
        address: `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lng).toFixed(4)}`,
        error: `Geocoding failed: ${data.status}`,
      })
    }
  } catch (error) {
    console.error("Geocoding fetch error:", error)
    return NextResponse.json({
      address: `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lng).toFixed(4)}`,
      error: "Geocoding request failed",
    })
  }
}
