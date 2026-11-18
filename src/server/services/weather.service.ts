import { globalCache } from '@/server/cache/memory-cache';
import type { WeatherObservationDto, WeatherCorrelationContext } from '@/features/weather/types';
import type { IWeatherProvider } from '../providers/weather/weather.interface';
import { getWeatherProvider } from '../providers/weather/weather.factory';

export class WeatherService {
  private readonly provider: IWeatherProvider;

  constructor(provider?: IWeatherProvider) {
    this.provider = provider || getWeatherProvider();
  }

  /**
   * Retrieves weather observation for city with 30-min cache
   */
  public async getWeatherForCity(city: string): Promise<WeatherObservationDto | null> {
    const cacheKey = `weather:city:${city.trim().toLowerCase()}`;
    const cached = globalCache.get<WeatherObservationDto>(cacheKey);
    if (cached) return cached;

    const weather = await this.provider.getWeatherByCity(city);
    if (weather) {
      // 30 minutes TTL
      globalCache.set(cacheKey, weather, 30 * 60 * 1000);
    }
    return weather;
  }

  /**
   * Computes environmental correlation context between atmospheric indicators and AQI
   */
  public getCorrelationContext(weather: WeatherObservationDto, _aqi?: number | null): WeatherCorrelationContext {
    let temperatureInversionNote = 'Normal atmospheric vertical mixing.';
    if (weather.inversionRisk === 'HIGH') {
      temperatureInversionNote =
        'High temperature inversion risk: Shallow nocturnal boundary layer combined with light surface winds prevents upward dispersal, trapping particulates near the breathing zone.';
    } else if (weather.inversionRisk === 'MODERATE') {
      temperatureInversionNote =
        'Moderate boundary layer stability: Minor thermal stratification may inhibit full vertical plume dispersal.';
    }

    let dispersionSummary = 'Favorable ventilation.';
    if (weather.dispersionPotential === 'POOR') {
      dispersionSummary =
        'Stagnant conditions with low ventilation coefficients impede horizontal and vertical pollutant clearance.';
    } else if (weather.dispersionPotential === 'FAIR') {
      dispersionSummary =
        'Moderate ventilation conditions allow partial pollutant dilution throughout urban corridors.';
    } else {
      dispersionSummary =
        'Strong ventilation and active airflow assist rapid dilution and clearance of local emission plumes.';
    }

    const windEffect =
      weather.windSpeed < 5
        ? `Calm winds (${weather.windSpeed} km/h from ${weather.windDirection}) allow local emissions to accumulate directly over source zones.`
        : `Wind speed of ${weather.windSpeed} km/h (${weather.windDirection}) facilitates regional transport and atmospheric mixing.`;

    const humidityEffect =
      weather.humidity > 70
        ? `High relative humidity (${weather.humidity}%) accelerates hygroscopic growth of fine particulates and secondary aerosol formation.`
        : `Relative humidity (${weather.humidity}%) remains within normal ambient parameters.`;

    return {
      temperatureInversionNote,
      dispersionSummary,
      windEffect,
      humidityEffect,
    };
  }
}

export const weatherService = new WeatherService();
