import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photoReference = searchParams.get("photo_reference")
  const maxWidth = searchParams.get("maxwidth") || "400"

  if (!photoReference) {
    return NextResponse.json({ error: "Photo reference is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 })
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/photo")
    url.searchParams.set("photo_reference", photoReference)
    url.searchParams.set("maxwidth", maxWidth)
    url.searchParams.set("key", apiKey)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Places Photo API error:", errorText)
      return NextResponse.json(
        { 
          error: "Failed to fetch photo",
          details: errorText
        },
        { status: 500 }
      )
    }

    // Get the final URL after any redirects
    const finalUrl = response.url
    return NextResponse.json({ photoUrl: finalUrl })
  } catch (error) {
    console.error("Error getting photo URL:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
