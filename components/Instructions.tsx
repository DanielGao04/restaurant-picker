import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, SlidersHorizontal, Shuffle, Star } from "lucide-react"

export function Instructions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">How It Works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-orange-500 mt-1" />
          <div>
            <h3 className="font-medium text-gray-800">1. Share Your Location</h3>
            <p className="text-sm text-gray-600">Allow location access to find restaurants near you</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <SlidersHorizontal className="w-5 h-5 text-orange-500 mt-1" />
          <div>
            <h3 className="font-medium text-gray-800">2. Set Distance</h3>
            <p className="text-sm text-gray-600">Adjust the slider to set your search radius</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shuffle className="w-5 h-5 text-orange-500 mt-1" />
          <div>
            <h3 className="font-medium text-gray-800">3. Pick a Restaurant</h3>
            <p className="text-sm text-gray-600">Click the button to randomly select a restaurant</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-orange-500 mt-1" />
          <div>
            <h3 className="font-medium text-gray-800">4. View Details</h3>
            <p className="text-sm text-gray-600">See ratings, photos, and get directions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 