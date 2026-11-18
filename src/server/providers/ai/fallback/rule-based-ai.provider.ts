import type { IAiProvider, AiPromptPayload, AiGenerationResult } from '../ai.interface';
import { formatAqiValue } from '@/lib/formatters';

export class RuleBasedAiProvider implements IAiProvider {
  public readonly id = 'RULE_BASED_FALLBACK_ASSISTANT';

  public async generateResponse(payload: AiPromptPayload): Promise<AiGenerationResult> {
    const { userMessage, context } = payload;
    const lower = userMessage.toLowerCase();

    const aqiStr = formatAqiValue(context.aqi);
    const category = context.categoryLabel;
    const dominant = context.dominantPollutantName || context.dominantPollutant || 'Particulate Matter';
    const city = context.location;
    const station = context.stationName;
    const weather = context.weather;

    let reply = '';
    let suggestions: string[] = [];

    // 1. Pollutant explanation (PM2.5, PM10, NO2, etc.)
    if (
      lower.includes('pm2.5') ||
      lower.includes('pm25') ||
      lower.includes('pm10') ||
      lower.includes('what is pm') ||
      lower.includes('what is no2') ||
      lower.includes('what is so2') ||
      lower.includes('what is co') ||
      lower.includes('what is o3')
    ) {
      const polKey = lower.includes('pm10') ? 'PM10' : lower.includes('no2') ? 'NO2' : 'PM2_5';
      const polItem = context.pollutants.find((p) => p.pollutant === polKey);

      reply = `### Understanding ${polItem?.name || 'Particulate Matter (PM2.5)'}\n\n` +
        `**${polItem?.name || 'Fine Particulate Matter (PM2.5)'}** consists of tiny airborne solid particles and liquid droplets with an aerodynamic diameter $\\le 2.5\\text{ micrometers}$ (roughly 30 times thinner than a human hair).\n\n` +
        `- **Current Concentration in ${city}**: ${polItem?.concentration !== null ? `${polItem?.concentration} ${polItem?.unit}` : 'Not available'}\n` +
        `- **CPCB Safe 24-hr Standard (NAAQS)**: 60 µg/m³\n` +
        `- **Health Significance**: Due to microscopic size, PM2.5 bypasses nasal cilia, travels directly into alveoli, and can enter the systemic bloodstream.\n` +
        `- **Common Sources**: Vehicular combustion, industrial emissions, brick kilns, stubble burning, and secondary sulfate/nitrate reactions.`;

      suggestions = [
        `How is the overall AQI calculated from PM2.5?`,
        `What is the current AQI in ${city}?`,
        `How can I protect my indoor air quality?`,
      ];
    }
    // 2. Exercise / Outdoor activities
    else if (
      lower.includes('exercise') ||
      lower.includes('running') ||
      lower.includes('jogging') ||
      lower.includes('cycling') ||
      lower.includes('walk') ||
      lower.includes('outdoor') ||
      lower.includes('outside')
    ) {
      const isDangerous =
        context.category === 'VERY_POOR' || context.category === 'SEVERE' || context.category === 'POOR';

      reply = `### Outdoor Activity & Exercise Guidance for ${city} (${aqiStr} - ${category})\n\n` +
        (isDangerous
          ? `**Recommendation**: **Avoid strenuous outdoor endurance exercises (running, intense cycling)** during peak pollution hours.\n\n` +
            `- **High Particulate Inhalation**: During heavy cardiovascular exertion, minute ventilation increases up to 10-fold, drawing deep particulate matter (${dominant}) into alveolar airways.\n` +
            `- **Safer Alternatives**: Exercise indoors in spaces with active air filtration (HEPA), or schedule outdoor movement during midday when solar heating improves atmospheric dispersion.\n` +
            `- **High-Risk Groups**: Children, elderly citizens, and individuals with asthma or COPD should remain strictly indoors.`
          : `**Recommendation**: General outdoor activities and exercise are acceptable under current conditions (**${category}**).\n\n` +
            `- Unusually sensitive individuals experiencing cough or shortness of breath should take frequent breaks.\n` +
            `- Midday hours typically provide the best atmospheric mixing compared to early morning inversions.`);

      suggestions = [
        `What type of mask is effective against ${dominant}?`,
        `When during the day is air quality cleanest?`,
        `What is the current AQI in ${city}?`,
      ];
    }
    // 3. Weather correlation
    else if (
      lower.includes('weather') ||
      lower.includes('wind') ||
      lower.includes('temperature') ||
      lower.includes('humidity') ||
      lower.includes('rain') ||
      lower.includes('inversion')
    ) {
      reply = `### Weather & Environmental Context for ${city}\n\n` +
        `Atmospheric dynamics directly dictate how air pollution concentrates or disperses:\n\n` +
        (weather
          ? `- **Temperature**: ${weather.temperature}°C (Feels like ${weather.feelsLike}°C)\n` +
            `- **Relative Humidity**: ${weather.humidity}%\n` +
            `- **Wind Speed & Direction**: ${weather.windSpeed} km/h (${weather.windDirection})\n` +
            `- **Inversion Risk**: **${weather.inversionRisk}**\n` +
            `- **Dispersion Potential**: **${weather.dispersionPotential}**\n\n` +
            `**Atmospheric Dynamics**: ${
              weather.inversionRisk === 'HIGH'
                ? 'Cool nocturnal temperatures combined with light surface winds create a temperature inversion—a warm lid aloft preventing vertical mixing, trapping pollution close to ground level.'
                : 'Active airflow and solar heating facilitate vertical ventilation and regional pollutant dilution.'
            }`
          : `Surface weather observations are currently unavailable for this location.`);

      suggestions = [
        `Why is my area's AQI high right now?`,
        `Is air quality improving or worsening?`,
        `What are safe precautions for ${city}?`,
      ];
    }
    // 4. Precautions & Guidance
    else if (
      lower.includes('precaution') ||
      lower.includes('mask') ||
      lower.includes('purifier') ||
      lower.includes('protect') ||
      lower.includes('safe')
    ) {
      reply = `### Recommended Everyday Precautions (${category} - AQI ${aqiStr})\n\n` +
        `Based on verified CPCB guidelines for **${category}** air quality in **${city}**:\n\n` +
        `1. **Respiratory Protection**: When outdoors for prolonged periods, use certified N95 or FFP2 respirators with tight facial seal. Cloth and surgical masks do not filter fine PM2.5 particulates.\n` +
        `2. **Ventilation Timing**: Keep windows closed during early mornings and late evenings when boundary layer is lowest. Ventilate briefly in the afternoon if solar heating clears stagnant haze.\n` +
        `3. **Indoor Air Management**: Utilize HEPA air purifiers in sleeping quarters. Avoid indoor incense, unvented biomass cooking, or smoking.\n` +
        `4. **Hydration & Recovery**: Maintain good hydration and monitor for eye irritation, coughing, or throat dryness.\n\n` +
        `*Disclaimer: These precautions represent general environmental guidance and do not constitute individual medical diagnosis or prescriptions.*`;

      suggestions = [
        `Is it safe to exercise outdoors?`,
        `What is the current air quality in ${city}?`,
        `Why is the AQI high today?`,
      ];
    }
    // 5. Why is AQI high / causes
    else if (
      lower.includes('why') ||
      lower.includes('cause') ||
      lower.includes('reason') ||
      lower.includes('high') ||
      lower.includes('bad') ||
      lower.includes('elevated')
    ) {
      reply = `### Contributing Factors for ${city} Air Quality (${aqiStr} - ${category})\n\n` +
        `The elevated AQI is primarily driven by **${dominant}**. Key environmental observations include:\n\n` +
        `1. **Primary Pollutant Driver**: ${dominant} registered the highest sub-index under official CPCB calculations. Fine particulates penetrate deep into lung airways.\n` +
        `2. **Meteorological Dispersion**: ${
          weather
            ? weather.dispersionPotential === 'POOR'
              ? `Light winds (${weather.windSpeed} km/h) and high relative humidity (${weather.humidity}%) create stable boundary-layer conditions that trap surface emissions.`
              : `Wind speeds of ${weather.windSpeed} km/h (${weather.windDirection}) are actively dispersing pollutants across urban corridors.`
            : 'Stagnant local wind fields and thermal inversions often limit upward atmospheric mixing.'
        }\n` +
        `3. **Urban Emission Baseline**: Typical sources include vehicular exhaust, construction dust, road re-suspension, and seasonal biomass/waste combustion.\n\n` +
        `*Note: As an environmental assistant, I report verified sensor observations and atmospheric dynamics; exact source apportionment requires specialized CPCB chemical speciation studies.*`;

      suggestions = [
        `What is ${dominant} and why is it harmful?`,
        `What precautions should I take today?`,
        `How does the weather relate to this pollution?`,
      ];
    }
    // 6. Current air quality / status query
    else {
      reply = `### Current Air Quality in ${city}\n\n` +
        `The current official CPCB Air Quality Index (AQI) for **${city}** (measured at **${station}**) is **${aqiStr}**, placing it in the **${category}** category.\n\n` +
        `- **Dominant Pollutant**: ${dominant}\n` +
        `- **Measurement Station**: ${station} (${context.stationCode})\n` +
        `- **Timestamp**: ${new Date(context.measurementTimestamp).toLocaleString()}\n` +
        `- **Atmospheric Condition**: ${weather ? `${weather.temperature}°C, ${weather.humidity}% humidity, Wind ${weather.windSpeed} km/h (${weather.windDirection})` : 'Surface meteorology unavailable'}\n\n` +
        `**CPCB Advisory**: ${this.getAdvisoryForCategory(context.category ?? 'MODERATE')}`;

      suggestions = [
        `Why is the AQI in ${city} at this level?`,
        `Is it safe for outdoor exercise today?`,
        `What precautions should sensitive groups consider?`,
      ];
    }

    return {
      reply,
      suggestions,
      provider: 'Rule-Based Environmental Intelligence (Offline & Fallback Mode)',
      model: 'cpcb-expert-rules-v1',
      isFallback: true,
    };
  }

  private getAdvisoryForCategory(category: string): string {
    switch (category.toUpperCase()) {
      case 'GOOD':
        return 'Minimal impact. Air quality is considered satisfactory, and air pollution poses little or no risk.';
      case 'SATISFACTORY':
        return 'Minor breathing discomfort to sensitive people. Clean conditions for the general population.';
      case 'MODERATE':
        return 'Breathing discomfort to people with lungs, asthma, and heart diseases. Healthy individuals may notice slight throat irritation.';
      case 'POOR':
        return 'Breathing discomfort to most people on prolonged exposure. Sensitive groups should avoid extended outdoor exertion.';
      case 'VERY_POOR':
        return 'Respiratory illness on prolonged exposure. Significant risk for sensitive groups. General public should limit outdoor exertion.';
      case 'SEVERE':
        return 'Affects healthy people and seriously impacts those with existing diseases. Avoid all outdoor physical activity.';
      default:
        return 'Follow standard CPCB environmental precautions for urban air quality.';
    }
  }
}
