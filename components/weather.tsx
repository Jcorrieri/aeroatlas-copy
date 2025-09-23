import { Cloud, Sun, Umbrella, Thermometer } from "lucide-react"

interface WeatherSummary {
  averageTemperature: number
  condition: "Sunny" | "Cloudy" | "Rainy"
  humidity: number
}

interface WeatherProps {
  summary: WeatherSummary
}

export function Weather({ summary }: WeatherProps) {
  return (
      <div className="bg-transparent rounded-xl p-3 w-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {summary.condition === "Sunny" && <Sun className="w-8 h-8 mr-2 text-yellow-400" />}
            {summary.condition === "Cloudy" && <Cloud className="w-8 h-8 mr-2 text-gray-300" />}
            {summary.condition === "Rainy" && <Umbrella className="w-8 h-8 mr-2 text-blue-300" />}
            <span className="text-xl font-medium">{summary.averageTemperature}°C</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{summary.condition}</p>
            <p className="flex items-center text-xs">
              <Thermometer className="w-3 h-3 mr-1" />
              {summary.humidity}%
            </p>
          </div>
        </div>
      </div>
  )
}