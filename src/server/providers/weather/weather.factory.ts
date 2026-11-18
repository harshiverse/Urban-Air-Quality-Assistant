import type { IWeatherProvider } from './weather.interface';
import { OpenWeatherProvider } from './open-weather/open-weather.provider';
import { MockWeatherProvider } from './mock/mock-weather.provider';

let cachedWeatherProvider: IWeatherProvider | null = null;

export function getWeatherProvider(): IWeatherProvider {
  if (cachedWeatherProvider) {
    return cachedWeatherProvider;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    cachedWeatherProvider = new OpenWeatherProvider(apiKey);
  } else {
    cachedWeatherProvider = new MockWeatherProvider();
  }

  return cachedWeatherProvider;
}
