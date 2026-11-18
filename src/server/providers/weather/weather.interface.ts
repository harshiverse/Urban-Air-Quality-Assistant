import type { WeatherObservationDto } from '@/features/weather/types';

export interface IWeatherProvider {
  readonly id: string;
  getWeatherByCity(city: string): Promise<WeatherObservationDto | null>;
  getWeatherByCoords(lat: number, lon: number): Promise<WeatherObservationDto | null>;
}
