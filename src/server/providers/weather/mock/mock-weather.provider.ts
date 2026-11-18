import type {
  DispersionPotential,
  InversionRisk,
  WeatherObservationDto,
  WindSpeedCategory,
} from '@/features/weather/types';
import type { IWeatherProvider } from '../weather.interface';

interface CityWeatherProfile {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  windDegree: number;
  pressure: number;
  condition: string;
  visibilityKm: number;
}

const CITY_WEATHER_PROFILES: Record<string, CityWeatherProfile> = {
  DELHI: {
    temp: 19.5,
    feelsLike: 19.0,
    humidity: 74,
    windSpeed: 4.2,
    windDir: 'NW',
    windDegree: 315,
    pressure: 1016,
    condition: 'Haze / Dense Smog',
    visibilityKm: 2.1,
  },
  LUCKNOW: {
    temp: 18.0,
    feelsLike: 17.5,
    humidity: 78,
    windSpeed: 3.5,
    windDir: 'NW',
    windDegree: 310,
    pressure: 1017,
    condition: 'Mist / Haze',
    visibilityKm: 2.8,
  },
  KOLKATA: {
    temp: 24.5,
    feelsLike: 25.5,
    humidity: 68,
    windSpeed: 6.2,
    windDir: 'N',
    windDegree: 350,
    pressure: 1014,
    condition: 'Hazy',
    visibilityKm: 4.5,
  },
  MUMBAI: {
    temp: 28.5,
    feelsLike: 31.0,
    humidity: 64,
    windSpeed: 14.5,
    windDir: 'WSW',
    windDegree: 240,
    pressure: 1012,
    condition: 'Partly Cloudy',
    visibilityKm: 7.0,
  },
  CHENNAI: {
    temp: 29.0,
    feelsLike: 32.5,
    humidity: 72,
    windSpeed: 12.0,
    windDir: 'NE',
    windDegree: 45,
    pressure: 1011,
    condition: 'Passing Clouds',
    visibilityKm: 8.0,
  },
  BENGALURU: {
    temp: 22.8,
    feelsLike: 22.8,
    humidity: 54,
    windSpeed: 10.2,
    windDir: 'ENE',
    windDegree: 70,
    pressure: 1015,
    condition: 'Clear Sky',
    visibilityKm: 9.5,
  },
  HYDERABAD: {
    temp: 25.0,
    feelsLike: 25.0,
    humidity: 56,
    windSpeed: 8.5,
    windDir: 'E',
    windDegree: 90,
    pressure: 1014,
    condition: 'Sunny',
    visibilityKm: 8.5,
  },
};

export class MockWeatherProvider implements IWeatherProvider {
  public readonly id = 'MOCK_WEATHER_PROVIDER';

  public async getWeatherByCity(city: string): Promise<WeatherObservationDto | null> {
    const key = city.trim().toUpperCase();
    const profile = CITY_WEATHER_PROFILES[key] ?? CITY_WEATHER_PROFILES.DELHI!;

    return this.buildWeatherDto(city, profile);
  }

  public async getWeatherByCoords(lat: number, lon: number): Promise<WeatherObservationDto | null> {
    // Pick closest profile or default to Delhi
    const profile = CITY_WEATHER_PROFILES.DELHI!;
    return this.buildWeatherDto(`Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`, profile);
  }

  private buildWeatherDto(cityName: string, profile: CityWeatherProfile): WeatherObservationDto {
    const windCategory: WindSpeedCategory =
      profile.windSpeed < 5
        ? 'CALM'
        : profile.windSpeed < 12
          ? 'LIGHT'
          : profile.windSpeed < 25
            ? 'MODERATE'
            : 'STRONG';

    const inversionRisk: InversionRisk =
      profile.windSpeed < 5 && profile.humidity > 65
        ? 'HIGH'
        : profile.windSpeed < 10
          ? 'MODERATE'
          : 'LOW';

    const dispersionPotential: DispersionPotential =
      inversionRisk === 'HIGH' ? 'POOR' : inversionRisk === 'MODERATE' ? 'FAIR' : 'GOOD';

    return {
      city: cityName,
      temperature: profile.temp,
      feelsLike: profile.feelsLike,
      humidity: profile.humidity,
      windSpeed: profile.windSpeed,
      windDirection: profile.windDir,
      windDegree: profile.windDegree,
      windCategory,
      pressure: profile.pressure,
      condition: profile.condition,
      visibilityKm: profile.visibilityKm,
      inversionRisk,
      dispersionPotential,
      observedAt: new Date().toISOString(),
      sourceAttribution: 'Indian Meteorological Context & Surface Station Observations',
    };
  }
}
