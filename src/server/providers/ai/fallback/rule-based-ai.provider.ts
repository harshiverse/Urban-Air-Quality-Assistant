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
    // 6. Comparative query (Delhi vs Mumbai, Bengaluru, etc.)
    else if (
      context.comparisonCitySnapshot ||
      lower.includes('compare') ||
      lower.includes(' vs ') ||
      lower.includes(' versus ') ||
      lower.includes('better than') ||
      lower.includes('worse than')
    ) {
      if (context.comparisonCitySnapshot) {
        const comp = context.comparisonCitySnapshot;
        const compAqiStr = formatAqiValue(comp.aqi);
        const aqiDiff = (context.aqi ?? 0) - (comp.aqi ?? 0);
        const cleanerCity = aqiDiff > 0 ? comp.city : aqiDiff < 0 ? city : 'both cities';
        const cleanerNote =
          aqiDiff === 0
            ? `Both ${city} and ${comp.city} currently have identical AQI levels.`
            : `**${cleanerCity}** currently has lower particulate exposure (AQI difference: ${Math.abs(aqiDiff)} points).`;

        reply =
          `### Air Quality Comparison: ${city} vs ${comp.city}\n\n` +
          `Comparative analysis grounded in official CPCB monitoring snapshots:\n\n` +
          `| Environmental Metric | ${city} | ${comp.city} |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Current AQI** | **${aqiStr}** (${category}) | **${compAqiStr}** (${comp.categoryLabel}) |\n` +
          `| **Monitoring Station** | ${station} | ${comp.stationName} |\n` +
          `| **Dominant Pollutant** | ${dominant} | ${comp.dominantPollutant || 'N/A'} |\n\n` +
          `**Assessment**: ${cleanerNote}\n\n` +
          `- **Regional Factors**: Coastal cities (like Mumbai or Chennai) frequently benefit from diurnal marine breeze ventilation and wet aerosol scavenging, whereas landlocked northern plains (like Delhi or Lucknow) experience winter thermal inversions and boundary-layer stagnation.\n` +
          `- **Standard Guidance**: Individuals sensitive to particulate matter should check the primary pollutant driver in their specific locality before prolonged outdoor exertion.`;

        suggestions = [
          `Why does ${city} have different pollution than ${comp.city}?`,
          `What are the historical trends for ${city}?`,
          `Is it safe to exercise outdoors in ${city} today?`,
        ];
      } else {
        reply =
          `### Urban Air Quality Comparison\n\n` +
          `Current official CPCB measurement for **${city}** is **${aqiStr}** (${category}), with **${dominant}** as the primary driver.\n\n` +
          `To compare **${city}** with another Indian metro, mention the city name (e.g., *"How does ${city} compare to Mumbai?"* or *"Compare ${city} with Bengaluru"*). Supported comparison hubs include Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Lucknow, and Pune.`;

        suggestions = [
          `Compare ${city} with Mumbai`,
          `Compare ${city} with Bengaluru`,
          `What is the 24-hour trend in ${city}?`,
        ];
      }
    }
    // 7. Trend analysis (improving vs worsening vs stable)
    else if (
      lower.includes('improv') ||
      lower.includes('worsen') ||
      lower.includes('trend') ||
      lower.includes('getting better') ||
      lower.includes('getting worse') ||
      lower.includes('increasing') ||
      lower.includes('decreasing')
    ) {
      const history = context.historicalSummary;
      if (history && history.avgAqi !== null && context.aqi !== null) {
        const delta = context.aqi - history.avgAqi;
        let trendAnalysis = '';

        if (delta <= -15) {
          trendAnalysis = `Current air quality (**${aqiStr}**) represents an **improving trend** compared to the 24-hour average of **${history.avgAqi}** (${Math.abs(delta)} points below the daily mean).`;
        } else if (delta >= 15) {
          trendAnalysis = `Current air quality (**${aqiStr}**) represents a **deteriorating / worsening trend** compared to the 24-hour average of **${history.avgAqi}** (+${delta} points above the daily mean). Peak exposure reached **${history.maxAqi}**.`;
        } else {
          trendAnalysis = `Air quality has remained **relatively stable** across the 24-hour window, hovering near the 24-hour mean of **${history.avgAqi}** (current AQI: **${aqiStr}**, 24-hour range: ${history.minAqi} to ${history.maxAqi}).`;
        }

        reply =
          `### 24-Hour Air Quality Trend for ${city}\n\n` +
          `${trendAnalysis}\n\n` +
          `**24-Hour Statistical Summary**:\n` +
          `- **Current AQI**: ${aqiStr} (${category})\n` +
          `- **24-Hour Mean**: ${history.avgAqi}\n` +
          `- **Lowest Recorded**: ${history.minAqi}\n` +
          `- **Peak Exposure Spike**: ${history.maxAqi}\n` +
          `- **Dominant Driver**: ${dominant}\n\n` +
          `**Meteorological Context**: ${
            weather
              ? `Wind speeds of ${weather.windSpeed} km/h (${weather.windDirection}) with ${weather.dispersionPotential.toLowerCase()} dispersion potential. ${
                  weather.inversionRisk === 'HIGH'
                    ? 'Nocturnal temperature inversion may restrict evening particulate ventilation.'
                    : 'Atmospheric mixing is aiding regional particulate dilution.'
                }`
              : 'Meteorological observations unavailable.'
          }`;

        suggestions = [
          `Why is ${dominant} the primary driver in ${city}?`,
          `What are safe precautions given this trend?`,
          `How does ${city} compare to Mumbai today?`,
        ];
      } else {
        reply =
          `### Air Quality Trend for ${city}\n\n` +
          `Current official CPCB measurement for **${city}** is **${aqiStr}** (${category}). Continuous 24-hour baseline data is currently compiling. Recheck shortly for diurnal trend comparisons.`;

        suggestions = [
          `What precautions should I take in ${city}?`,
          `Is it safe for outdoor exercise today?`,
          `What is the weather correlation in ${city}?`,
        ];
      }
    }
    // 8. Current air quality / status query
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
