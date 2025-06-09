import { NextResponse } from "next/server"

export async function GET() {
  const serverApiKey = process.env.GOOGLE_PLACES_API_KEY
  const clientApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  return NextResponse.json({
    serverApiKey: {
      exists: !!serverApiKey,
      length: serverApiKey?.length || 0,
      firstChars: serverApiKey?.substring(0, 10) || "N/A",
    },
    clientApiKey: {
      exists: !!clientApiKey,
      length: clientApiKey?.length || 0,
      firstChars: clientApiKey?.substring(0, 10) || "N/A",
    },
    allGoogleEnvVars: Object.keys(process.env).filter((key) => key.includes("GOOGLE")),
  })
}
