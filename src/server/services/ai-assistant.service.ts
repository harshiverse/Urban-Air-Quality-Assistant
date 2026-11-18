import { airQualityService } from './air-quality.service';
import { weatherService } from './weather.service';
import { getAiProvider } from '../providers/ai/ai.factory';
import type {
  AiAssistantRequestDto,
  AiAssistantResponseDto,
  AiGroundingContext,
  GroundedPollutantItem,
} from '@/features/assistant/types';
import { POLLUTANT_NAMES } from '@/lib/constants';
import { formatAqiValue } from '@/lib/formatters';

export class AiAssistantService {
  /**
   * Processes a user question, retrieves authoritative server-side environmental context,
   * enforces safety boundaries, and generates grounded guidance.
   */
  public async answerUserQuery(request: AiAssistantRequestDto): Promise<AiAssistantResponseDto> {
    const city = request.location?.trim() || 'Delhi';
    const stationCode = request.stationCode;

    // 1. Sanitize user input against prompt injection patterns
    const sanitizedMessage = this.sanitizeInput(request.message);

    // 2. Retrieve authoritative server-side air quality snapshot
    const snapshot = await airQualityService.getCurrentAirQuality({
      city,
      stationCode,
    });

    // 3. Retrieve server-side weather context
    const weather = await weatherService.getWeatherForCity(city);

    // 4. Retrieve historical summary for the last 24h
    const history = await airQualityService.getHistoricalAirQuality({
      city,
      stationCode,
      range: '24h',
    });

    // 5. Detect comparison city in user query and retrieve its snapshot
    let comparisonCitySnapshot: AiGroundingContext['comparisonCitySnapshot'] = null;
    const detectedCity = this.detectComparisonCity(sanitizedMessage, city);
    if (detectedCity) {
      try {
        const compSnapshot = await airQualityService.getCurrentAirQuality({ city: detectedCity });
        if (compSnapshot) {
          comparisonCitySnapshot = {
            city: compSnapshot.city,
            stationName: compSnapshot.station.name,
            aqi: compSnapshot.aqi,
            categoryLabel: compSnapshot.categoryLabel,
            dominantPollutant: compSnapshot.dominantPollutantName || compSnapshot.dominantPollutant || null,
          };
        }
      } catch {
        // Fallback silently if comparison city is unavailable
      }
    }

    // 6. Construct verified grounding context
    const groundingContext = this.buildGroundingContext(
      city,
      snapshot,
      weather,
      history?.summary ?? null,
      comparisonCitySnapshot
    );

    // 7. Build strict grounding system prompt
    const systemPrompt = this.constructSystemPrompt(groundingContext);

    // 8. Invoke configured AI provider with fallback resilience
    const provider = getAiProvider();
    const generationResult = await provider.generateResponse({
      systemPrompt,
      userMessage: sanitizedMessage,
      conversationHistory: request.conversationHistory || [],
      context: groundingContext,
    });

    return {
      reply: generationResult.reply,
      groundingContext,
      suggestions: generationResult.suggestions,
      isFallback: generationResult.isFallback,
      provider: generationResult.provider,
      model: generationResult.model,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Builds the structured grounding context from authoritative server data
   */
  private buildGroundingContext(
    city: string,
    snapshot: Awaited<ReturnType<typeof airQualityService.getCurrentAirQuality>>,
    weather: Awaited<ReturnType<typeof weatherService.getWeatherForCity>>,
    historicalSummary: Awaited<ReturnType<typeof airQualityService.getHistoricalAirQuality>> extends infer H
      ? H extends { summary: infer S }
        ? S
        : null
      : null,
    comparisonCitySnapshot?: AiGroundingContext['comparisonCitySnapshot']
  ): AiGroundingContext {
    const pollutants: GroundedPollutantItem[] =
      snapshot?.pollutants.map((p) => ({
        pollutant: p.pollutant,
        name: POLLUTANT_NAMES[p.pollutant] || p.pollutant,
        concentration: p.concentration,
        unit: p.unit,
        subIndex: p.subIndex,
        category: p.category,
      })) || [];

    const now = Date.now();
    const measurementTime = snapshot?.measurementTimestamp ? new Date(snapshot.measurementTimestamp).getTime() : now;
    const ageHours = Math.max(0, Math.round(((now - measurementTime) / (1000 * 3600)) * 10) / 10);
    const isStale = ageHours > 24;

    return {
      location: snapshot?.city || city,
      stationName: snapshot?.station.name || `${city} Central Monitoring Station`,
      stationCode: snapshot?.station.stationCode || 'DEFAULT',
      aqi: snapshot?.aqi ?? null,
      category: snapshot?.category ?? null,
      categoryLabel: snapshot?.categoryLabel || 'Unavailable',
      dominantPollutant: snapshot?.dominantPollutant ?? null,
      dominantPollutantName: snapshot?.dominantPollutantName ?? null,
      pollutants,
      isDataSufficient: snapshot?.sufficiency.isSufficient ?? false,
      dataSufficiencyMessage: snapshot?.sufficiency.isSufficient
        ? 'CPCB minimum 3 pollutants with PM satisfied.'
        : snapshot?.sufficiency.missingRequirements.join('; ') || 'Data sufficiency not met.',
      measurementStatus: snapshot?.measurementStatus || 'LIVE',
      measurementTimestamp: snapshot?.measurementTimestamp || new Date().toISOString(),
      dataAgeHours: ageHours,
      isStale,
      weather: weather ?? null,
      historicalSummary: historicalSummary ?? null,
      comparisonCitySnapshot: comparisonCitySnapshot ?? null,
      sourceAttribution: snapshot?.sourceAttribution || 'Central Pollution Control Board (CPCB) / CAAQMS Network',
    };
  }

  /**
   * Fortified system prompt instructing the model to remain strictly grounded in verified facts
   */
  private constructSystemPrompt(context: AiGroundingContext): string {
    const weatherSummary = context.weather
      ? `Temperature: ${context.weather.temperature}°C, Humidity: ${context.weather.humidity}%, Wind: ${context.weather.windSpeed} km/h (${context.weather.windDirection}), Inversion Risk: ${context.weather.inversionRisk}, Dispersion Potential: ${context.weather.dispersionPotential}`
      : 'Weather data unavailable';

    const comparisonSummary = context.comparisonCitySnapshot
      ? `\n- **Comparison City**: ${context.comparisonCitySnapshot.city} (${context.comparisonCitySnapshot.stationName}): AQI ${formatAqiValue(context.comparisonCitySnapshot.aqi)} [${context.comparisonCitySnapshot.categoryLabel}], Dominant: ${context.comparisonCitySnapshot.dominantPollutant || 'N/A'}`
      : '';

    const pollutantsSummary = context.pollutants
      .map(
        (p) =>
          `- ${p.name} (${p.pollutant}): ${p.concentration !== null ? `${p.concentration} ${p.unit}` : 'N/A'}, Sub-Index: ${p.subIndex !== null ? p.subIndex : 'N/A'} [${p.category || 'N/A'}]`
      )
      .join('\n');

    return `You are the official Urban Air Quality Assistant for India, built to provide evidence-based, scientifically accurate environmental intelligence.

### VERIFIED REAL-TIME MONITORING CONTEXT (CPCB INDIA):
- **Location**: ${context.location}
- **Monitoring Station**: ${context.stationName} (Code: ${context.stationCode})
- **Current AQI**: ${formatAqiValue(context.aqi)} (${context.categoryLabel})
- **Dominant Pollutant**: ${context.dominantPollutantName || context.dominantPollutant || 'None'}
- **Measurement Status**: ${context.measurementStatus} (Data Age: ${context.dataAgeHours} hours)
- **Data Sufficiency**: ${context.dataSufficiencyMessage}
- **Meteorology**: ${weatherSummary}
- **24-Hour Range**: ${context.historicalSummary ? `Min ${context.historicalSummary.minAqi}, Max ${context.historicalSummary.maxAqi}, Avg ${context.historicalSummary.avgAqi}` : 'N/A'}${comparisonSummary}
- **Station Pollutant Measurements**:
${pollutantsSummary}

### STRICT MANDATORY RULES:
1. **ABSOLUTE GROUNDING**: You must strictly use the environmental measurements provided above. NEVER invent or hallucinate an AQI number, pollutant concentration, or weather condition. If data for a specific pollutant or query is absent, explicitly state that it is unavailable.
2. **CPCB METHODOLOGY**: All AQI calculations adhere to the Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) guidelines.
3. **NO MEDICAL DIAGNOSIS**: Do NOT provide medical prescriptions or clinical diagnoses. Provide general, practical, evidence-based precautions (e.g. N95 respirators, HEPA air cleaners, timing outdoor activities) and advise consulting a physician for individual health conditions.
4. **NO UNSUPPORTED CAUSALITY**: Atmospheric conditions (like temperature inversions and calm winds) correlate with trapped pollution, but do not assert unverified industrial incidents or fires without empirical data.
5. **COMPARISONS**: When comparing cities, use the exact AQI and category values provided above. Clearly state which city currently has lower particulate exposure and note differing geographic or meteorological contexts.
6. **TONE & FORMAT**: Be calm, clear, scientific, and encouraging. Structure your reply in clean markdown. Provide 3 suggested follow-up questions at the very end in a section titled "### Suggested questions:".`;
  }

  /**
   * Detects whether the query mentions a secondary Indian city for comparison
   */
  private detectComparisonCity(message: string, currentCity: string): string | null {
    const supportedCities = [
      'delhi',
      'mumbai',
      'bengaluru',
      'bangalore',
      'kolkata',
      'chennai',
      'hyderabad',
      'lucknow',
      'pune',
      'ahmedabad',
      'jaipur',
    ];

    const currentCityLower = currentCity.toLowerCase();
    for (const city of supportedCities) {
      if (city === currentCityLower || (city === 'bangalore' && currentCityLower === 'bengaluru')) {
        continue;
      }
      // Check whole-word boundary
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      if (regex.test(message)) {
        if (city === 'bangalore') return 'Bengaluru';
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    return null;
  }

  /**
   * Sanitizes user input against prompt injection techniques
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi, '[filtered prompt]')
      .replace(/system\s*:\s*/gi, '')
      .replace(/<\/?(?:system|assistant|grounding|rules)[^>]*>/gi, '')
      .trim();
  }
}

export const aiAssistantService = new AiAssistantService();
