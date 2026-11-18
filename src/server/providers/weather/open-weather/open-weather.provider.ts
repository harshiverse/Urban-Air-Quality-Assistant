import type {
  DispersionPotential,
  InversionRisk,
  WeatherObservationDto,
  WindSpeedCategory,
} from '@/features/weather/types';
import type { IWeatherProvider } from '../weather.interface';
import { MockWeatherProvider } from '../mock/mock-weather.provider';

interface OpenWeatherApiResponse {
  name: string;
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number; // in meter/sec
    deg: number; // wind direction in degrees
  };
  visibility?: number; // in meters
  dt: number;
}

export class OpenWeatherProvider implements IWeatherProvider {
  public readonly id = 'OPEN_WEATHER_MAP_PROVIDER';
  private readonly fallback = new MockWeatherProvider();
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY;
  }

  public async getWeatherByCity(city: string): Promise<WeatherObservationDto | null> {
    if (!this.apiKey) {
      return this.fallback.getWeatherByCity(city);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )},IN&units=metric&appid=${this.apiKey}`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) {
        return this.fallback.getWeatherByCity(city);
      }
      const data: OpenWeatherApiResponse = await res.json();
      return this.normalizeObservation(city, data);
    } catch {
      return this.fallback.getWeatherByCity(city);
    }
  }

  public async getWeatherByCoords(lat: number, lon: number): Promise<WeatherObservationDto | null> {
    if (!this.apiKey) {
      return this.fallback.getWeatherByCoords(lat, lon);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) {
        return this.fallback.getWeatherByCoords(lat, lon);
      }
      const data: OpenWeatherApiResponse = await res.json();
      return this.normalizeObservation(data.name || 'Current Location', data);
    } catch {
      return this.fallback.getWeatherByCoords(lat, lon);
    }
  }

  private normalizeObservation(city: string, data: OpenWeatherApiResponse): WeatherObservationDto {
    // OpenWeather provides speed in m/s; convert to km/h
    const windSpeedKmH = Math.round(data.wind.speed * 3.6 * 10) / 10;
    const windDegree = data.wind.deg ?? 0;
    const windDirection = this.degreeToCompass(windDegree);
    const windCategory = this.getWindCategory(windSpeedKmH);

    const temp = Math.round(data.main.temp * 10) / 10;
    const feelsLike = Math.round(data.main.feels_like * 10) / 10;
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const visibilityKm = data.visibility ? Math.round((data.visibility / 1000) * 10) / 10 : 5.0;
    const condition = data.weather[0]?.main || 'Clear';

    // Scientific atmospheric calculations
    const inversionRisk = this.calculateInversionRisk(temp, windSpeedKmH, humidity);
    const dispersionPotential = this.calculateDispersionPotential(windSpeedKmH);

    return {
      city,
      temperature: temp,
      feelsLike,
      humidity,
      windSpeed: windSpeedKmH,
      windDirection,
      windDegree,
      windCategory,
      pressure,
      condition,
      visibilityKm,
      inversionRisk,
      dispersionPotential,
      observedAt: new Date(data.dt * 1000).toISOString(),
      sourceAttribution: 'OpenWeatherMap API / Global Meteorological Network',
    };
  }

  private degreeToCompass(degree: number): string {
    const val = Math.floor(degree / 22.5 + 0.5);
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    return directions[val % 16] || 'N';
  }

  private getWindCategory(speedKmH: number): WindSpeedCategory {
    if (speedKmH < 5) return 'CALM';
    if (speedKmH < 15) return 'LIGHT';
    if (speedKmH < 30) return 'MODERATE';
    return 'STRONG';
  }

  private calculateInversionRisk(temp: number, windSpeed: number, humidity: number): InversionRisk {
    // Nocturnal boundary layer trapping happens when wind is calm (<6 km/h), temperatures are cool (<22°C), and humidity is elevated
    if (windSpeed < 6 && temp < 22 && humidity > 60) {
      return 'HIGH';
    }
    if (windSpeed < 12 && humidity > 50) {
      return 'MODERATE';
    }
    return 'LOW';
  }

  private calculateDispersionPotential(windSpeed: number): DispersionPotential {
    if (windSpeed < 6) return 'POOR';
    if (windSpeed < 18) return 'FAIR';
    return 'GOOD';
  }
}
