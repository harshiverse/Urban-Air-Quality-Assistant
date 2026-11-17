# Data Sources Documentation
# Urban Air Quality Assistant

**Version:** 1.0  
**Date:** November 17, 2026  
**Last Evaluated:** November 17, 2026  

---

## 1. Overview

This document evaluates and documents available data sources for air quality monitoring in India. Each provider is assessed for:
- API availability and documentation
- Data coverage and quality
- Authentication requirements
- Rate limits and quotas
- Licensing and attribution
- Integration priority

---

## 2. Priority Tier Classification

**Tier 1 (Primary - Authoritative):**
- Official government sources
- Highest data reliability
- First choice for implementation

**Tier 2 (Supplementary):**
- Aggregators of official data
- Fallback sources
- Historical bulk data

**Tier 3 (Contextual):**
- Weather data providers
- Supporting information

---

## 3. Air Quality Data Providers

### 3.1 Central Pollution Control Board (CPCB)

**Status:** Tier 1 (Primary - Authoritative)

**Provider Information:**
- **Organization:** Central Pollution Control Board, Government of India
- **Website:** https://cpcb.nic.in/
- **Air Quality Portal:** https://airquality.cpcb.gov.in/

**Data Availability:**
- **Coverage:** 550+ monitoring stations across India
- **Pollutants:** PM2.5, PM10, NO2, SO2, CO, O3, NH3
- **Update Frequency:** Hourly
- **Historical Data:** Available (varies by station)
- **AQI Methodology:** CPCB National Air Quality Index (official)

**API Access:**
- **Direct API:** ⚠️ **STATUS UNCLEAR** - No publicly documented REST API found
- **Alternative Access Methods:**
  - Web portal: https://airquality.cpcb.gov.in/
  - Potential data scraping (check terms of service)
  - May require official access request

**Authentication:**
- Unknown - requires investigation
- May require API key via official request

**Rate Limits:**
- Unknown

**Data Format:**
- Likely JSON (if API exists)
- Web interface uses dynamic loading

**Licensing:**
- Government data - typically open for non-commercial use
- Verify specific terms before deployment
- Attribution required

**Assessment:**
- ✅ Most authoritative source for India
- ✅ Official AQI methodology
- ✅ Comprehensive station coverage
- ⚠️ API documentation unclear
- ⚠️ May need to explore alternative access methods

**Integration Priority:** **HIGH** (Primary source)

**Action Required:**
1. Investigate if official API exists
2. Check data.gov.in for CPCB datasets
3. Contact CPCB for API access if needed
4. Review terms of service for web portal access

---

### 3.2 Open Government Data Platform India (data.gov.in)

**Status:** Tier 1 (Primary - Authoritative)

**Provider Information:**
- **Organization:** Government of India
- **Website:** https://data.gov.in/
- **Catalog:** Open Government Data (OGD) Platform India

**Data Availability:**
- **Coverage:** Varies by dataset (includes CPCB data)
- **Datasets:** Multiple air quality related datasets
- **Update Frequency:** Varies (hourly to daily)
- **Format:** CSV, JSON, XML

**API Access:**
- **API Available:** YES ✅
- **Documentation:** https://data.gov.in/sites/default/files/API_0.pdf
- **Base URL:** `https://api.data.gov.in/resource/[resource_id]`
- **Example Endpoint:** Real-time air quality data

**Authentication:**
- **API Key Required:** YES
- **How to Obtain:** Register at data.gov.in
- **Key Format:** Query parameter `api-key=YOUR_KEY`

**Rate Limits:**
- **Default:** 10,000 requests per day
- **Can request higher quota** for registered applications

**Example Request:**
```http
GET https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69
?api-key=YOUR_API_KEY
&format=json
&filters[state]=Delhi
&limit=100
```

**Data Format:**
```json
{
  "index_name": "real-time-air-quality-index",
  "title": "Real-time Air Quality Index",
  "records": [
    {
      "id": "...",
      "station": "Delhi - Anand Vihar",
      "last_update": "2026-11-17 13:30:00",
      "pollutant_id": "PM2.5",
      "pollutant_avg": "142.5",
      "pollutant_min": "135.2",
      "pollutant_max": "158.7"
    }
  ]
}
```

**Licensing:**
- **License:** Open Government Data License - India
- **Commercial Use:** Allowed
- **Attribution:** Required
- **Redistribution:** Allowed with attribution

**Assessment:**
- ✅ Official government platform
- ✅ Documented REST API
- ✅ Clear licensing
- ✅ Reasonable rate limits
- ⚠️ Data structure may vary by dataset
- ⚠️ API key required (not instant)

**Integration Priority:** **HIGH** (Primary source)

**Implementation Notes:**
1. Register for API key immediately
2. Identify specific real-time air quality dataset resource IDs
3. Test data format and update frequency
4. Implement data normalization layer
5. Handle API key securely (environment variables)

---

### 3.3 OpenAQ

**Status:** Tier 2 (Supplementary - Aggregator)

**Provider Information:**
- **Organization:** OpenAQ (Non-profit)
- **Website:** https://openaq.org/
- **API Documentation:** https://docs.openaq.org/

**Data Availability:**
- **Coverage:** Global (includes India CPCB stations)
- **Pollutants:** PM2.5, PM10, NO2, SO2, CO, O3
- **Update Frequency:** Varies by source (typically hourly)
- **Historical Data:** Last 90 days via API, longer in bulk downloads
- **Data Sources:** Aggregates from CPCB, state pollution boards, embassies

**API Access:**
- **API Available:** YES ✅
- **Current Version:** v2 (v3 in beta)
- **Base URL:** `https://api.openaq.org/v2/`
- **Documentation:** https://docs.openaq.org/docs

**Authentication:**
- **API Key Required:** NO for basic usage
- **Rate Limit:** 2,000 requests per day (unauthenticated)
- **With API Key:** 10,000 requests per day (free registration)

**Example Request:**
```http
GET https://api.openaq.org/v2/latest?country=IN&city=Delhi&limit=100
```

**Example Response:**
```json
{
  "meta": {
    "name": "openaq-api",
    "found": 38
  },
  "results": [
    {
      "location": "Delhi - Anand Vihar",
      "city": "Delhi",
      "country": "IN",
      "coordinates": {
        "latitude": 28.6469,
        "longitude": 77.2958
      },
      "measurements": [
        {
          "parameter": "pm25",
          "value": 142.5,
          "lastUpdated": "2026-11-17T13:30:00Z",
          "unit": "µg/m³"
        },
        {
          "parameter": "pm10",
          "value": 201.3,
          "lastUpdated": "2026-11-17T13:30:00Z",
          "unit": "µg/m³"
        }
      ]
    }
  ]
}
```

**Licensing:**
- **License:** CC BY 4.0
- **Commercial Use:** Allowed
- **Attribution:** Required (OpenAQ + original source)
- **Data Redistribution:** Allowed

**Assessment:**
- ✅ Well-documented REST API
- ✅ No API key required for basic usage
- ✅ Aggregates CPCB data (convenient)
- ✅ Global coverage enables future expansion
- ⚠️ Secondary source (not original authority)
- ⚠️ 90-day historical limit via API
- ⚠️ May have slight lag vs. CPCB direct

**Integration Priority:** **MEDIUM** (Fallback/Supplementary)

**Implementation Strategy:**
1. Use as fallback when primary sources unavailable
2. Cross-validate data with CPCB/data.gov.in
3. Clearly attribute source in UI
4. Consider for international expansion

---

### 3.4 xKDR Forum - India Air Quality Database

**Status:** Tier 2 (Supplementary - Bulk Historical Data)

**Provider Information:**
- **Organization:** xKDR Forum (Research organization)
- **Website:** https://airquality.xkdr.org/
- **Documentation:** https://github.com/xKDR/Air-Quality-Database

**Data Availability:**
- **Coverage:** 553 CPCB stations (2009 onwards) + 5 US Embassy/Consulate stations
- **Pollutants:** PM2.5, PM10, NO2, SO2, CO, O3, NH3
- **Update Frequency:** Daily bulk file updates
- **Historical Data:** From 2009 (extensive historical archive)
- **Format:** Parquet files, API access

**API Access:**
- **API Available:** YES ✅
- **Type:** SQL-style queries on Parquet files
- **Base URL:** `https://airquality.xkdr.org/api/v1/query`
- **Documentation:** https://airquality.xkdr.org/docs

**Example Query:**
```sql
SELECT station_id, pollutant, value, timestamp
FROM observations_2024
WHERE station_id = 'DL_Anand_Vihar'
  AND timestamp >= '2026-11-01'
  AND timestamp <= '2026-11-17'
ORDER BY timestamp DESC
LIMIT 1000
```

**Authentication:**
- **Demo API Key:** Available (10,000 row limit per query)
- **Own API Key:** Recommended for production (no limits)
- **Registration:** Free via GitHub

**Rate Limits:**
- **With demo key:** 10,000 rows per query
- **With own key:** Unlimited queries
- **Bulk Files:** Unlimited downloads

**Licensing:**
- **License:** Open Database License (ODbL)
- **Commercial Use:** Allowed
- **Attribution:** Required
- **Sharealike:** Modified databases must use same license

**Assessment:**
- ✅ Extensive historical data (2009+)
- ✅ Standardized format (Parquet)
- ✅ SQL-like query interface
- ✅ Research-quality data curation
- ⚠️ Not real-time (daily updates)
- ⚠️ Requires own API key for production

**Integration Priority:** **MEDIUM** (Historical Analysis)

**Use Cases:**
1. Backfill historical data for trend analysis
2. Training data for forecasting models (if implemented)
3. Long-term pattern analysis
4. Research and reporting features

**Implementation Strategy:**
1. Use for historical data ingestion (one-time or periodic)
2. Not suitable for real-time dashboard (daily lag)
3. Combine with real-time sources for complete picture

---

## 4. Weather Data Providers

### 4.1 OpenWeatherMap

**Status:** Tier 3 (Contextual)

**Provider Information:**
- **Organization:** OpenWeather Ltd.
- **Website:** https://openweathermap.org/
- **API Documentation:** https://openweathermap.org/api

**Data Availability:**
- **Coverage:** Global (including India cities)
- **Parameters:** Temperature, humidity, wind speed/direction, pressure, precipitation
- **Update Frequency:** Hourly
- **Historical Data:** Available (paid tiers)

**API Access:**
- **API Available:** YES ✅
- **Current Weather:** `https://api.openweathermap.org/data/2.5/weather`
- **Forecast:** `https://api.openweathermap.org/data/2.5/forecast`

**Authentication:**
- **API Key Required:** YES
- **Free Tier:** 1,000 calls/day, 60 calls/minute
- **Registration:** Instant (email verification)

**Example Request:**
```http
GET https://api.openweathermap.org/data/2.5/weather
?q=Delhi,IN
&appid=YOUR_API_KEY
&units=metric
```

**Example Response:**
```json
{
  "coord": {"lat": 28.7041, "lon": 77.1025},
  "weather": [{"main": "Haze", "description": "haze"}],
  "main": {
    "temp": 18.2,
    "feels_like": 17.5,
    "humidity": 68,
    "pressure": 1013
  },
  "wind": {
    "speed": 5.2,
    "deg": 45
  },
  "dt": 1700234567
}
```

**Pricing:**
- **Free:** 1,000 calls/day
- **Startup:** $40/month (100,000 calls/day)
- **Developer:** $120/month (1M calls/day)

**Licensing:**
- **Attribution:** Required
- **Commercial Use:** Allowed (check specific tier terms)

**Assessment:**
- ✅ Reliable and well-documented
- ✅ Free tier sufficient for MVP
- ✅ Easy integration
- ⚠️ Free tier limits may require caching strategy

**Integration Priority:** **MEDIUM** (Weather Context Feature)

---

### 4.2 WeatherAPI.com

**Status:** Tier 3 (Contextual - Alternative)

**Provider Information:**
- **Website:** https://www.weatherapi.com/
- **Documentation:** https://www.weatherapi.com/docs/

**Data Availability:**
- Similar to OpenWeatherMap
- Current weather, forecast, historical

**API Access:**
- **Free Tier:** 1M calls/month
- **API Key:** Required (instant registration)

**Assessment:**
- ✅ More generous free tier than OpenWeatherMap
- ✅ Good documentation
- ⚠️ Less established than OpenWeatherMap

**Integration Priority:** **LOW** (Alternative to OpenWeatherMap)

---

## 5. Data Source Integration Plan

### 5.1 Phase 1 Implementation (MVP)

**Primary Air Quality Source:**
1. **data.gov.in API** (if real-time CPCB data available)
   - Register for API key
   - Implement adapter
   - Test data quality and latency

2. **OpenAQ** (fallback/supplementary)
   - No key required for basic usage
   - Implement adapter
   - Use when data.gov.in unavailable

**Weather Context:**
- **OpenWeatherMap** (free tier)
  - Register for API key
  - Implement weather adapter
  - Cache aggressively (1-hour TTL)

### 5.2 Phase 2 Enhancement

**Historical Data:**
- **xKDR Air Quality Database**
  - Register for API key
  - Implement historical data ingestion
  - Backfill database with 1-2 years of history

**Additional Real-Time Sources:**
- Direct CPCB API integration (if documented)
- State Pollution Control Board APIs (where available)

### 5.3 Provider Adapter Pattern

All providers implement a common interface:

```typescript
interface AirQualityProvider {
  name: string;
  priority: number;  // Lower = higher priority
  
  getCurrentAirQuality(
    location: LocationIdentifier
  ): Promise<AirQualitySnapshot>;
  
  getHistoricalData(
    location: LocationIdentifier,
    range: TimeRange
  ): Promise<AirQualitySnapshot[]>;
  
  searchLocations(query: string): Promise<Location[]>;
  
  isAvailable(): Promise<boolean>;
}
```

**Provider Failover Strategy:**
```
1. Try data.gov.in (priority 1)
   ↓ If fails or timeout
2. Try OpenAQ (priority 2)
   ↓ If fails
3. Return cached data with stale indicator
   ↓ If no cache
4. Return error with user-friendly message
```

---

## 6. Data Quality Validation

### 6.1 Cross-Provider Validation

When multiple sources available:
1. Compare measurements from different providers
2. Flag significant discrepancies (>20% difference)
3. Log mismatches for investigation
4. Prefer higher-priority source in case of conflict

### 6.2 Temporal Validation

- Reject future timestamps (allow 5-minute clock skew)
- Flag measurements >6 hours old as "stale"
- Reject measurements >7 days old for "current" queries

### 6.3 Range Validation

See DATABASE_SCHEMA.md Section 5.1 for pollutant-specific ranges.

---

## 7. Attribution Requirements

### 7.1 UI Attribution

**Dashboard Footer:**
```
Air quality data: CPCB via data.gov.in | Weather: OpenWeatherMap
Last updated: 13:45 UTC, Nov 17, 2026
```

**Detailed View:**
```
Data Source: Central Pollution Control Board
Provider: Open Government Data Platform India (data.gov.in)
Monitoring Station: Delhi - Anand Vihar
Measurement Time: 13:30 UTC, Nov 17, 2026
Retrieved: 13:45 UTC, Nov 17, 2026
```

### 7.2 API Response Attribution

Every API response includes `sourceAttribution` field:
```json
{
  "sourceAttribution": {
    "provider": "data.gov.in",
    "originalSource": "CPCB",
    "license": "Open Government Data License - India",
    "url": "https://data.gov.in/"
  }
}
```

---

## 8. Rate Limit Management

### 8.1 Internal Rate Tracking

Track API calls per provider:
```typescript
interface ProviderUsage {
  provider: string;
  window: string;  // '1h', '1d'
  limit: number;
  used: number;
  resetAt: Date;
}
```

### 8.2 Caching Strategy

| Data Type | Cache TTL | Rationale |
|-----------|-----------|-----------|
| Current AQI | 15 minutes | Balance freshness with API usage |
| Historical data (>24h old) | 24 hours | Immutable historical data |
| Weather current | 30 minutes | Weather changes slower than AQI |
| Station metadata | 24 hours | Rarely changes |
| Location search results | 1 hour | Static station list |

### 8.3 Quota Monitoring

- Log daily API usage per provider
- Alert when approaching 80% of quota
- Implement automatic failover before hitting limit

---

## 9. Testing Strategy

### 9.1 Provider Integration Tests

```typescript
describe('DataGovInAdapter', () => {
  it('should fetch current AQI for Delhi', async () => {
    const adapter = new DataGovInAdapter();
    const result = await adapter.getCurrentAirQuality({ city: 'Delhi' });
    
    expect(result.aqi).toBeGreaterThan(0);
    expect(result.location.city).toBe('Delhi');
    expect(result.pollutants).toHaveProperty('PM2_5');
  });
  
  it('should handle provider timeout gracefully', async () => {
    // Mock timeout scenario
    // Verify proper error handling
  });
});
```

### 9.2 Mock Data for Development

Create fixtures for offline development:
```typescript
// tests/fixtures/air-quality-snapshots.ts
export const delhiAqiSnapshot: AirQualitySnapshot = {
  location: { city: 'Delhi', stationId: 'DL_Anand_Vihar' },
  aqi: 287,
  category: 'POOR',
  dominantPollutant: 'PM2_5',
  // ...
};
```

---

## 10. Action Items for Implementation

### 10.1 Immediate (Week 1)

- [x] Register for data.gov.in API key
- [x] Register for OpenWeatherMap API key
- [ ] Test data.gov.in real-time air quality endpoint
- [ ] Verify data format and update frequency
- [ ] Implement first provider adapter (data.gov.in or OpenAQ)

### 10.2 Short-Term (Week 2-3)

- [ ] Implement OpenAQ adapter (fallback)
- [ ] Implement weather adapter
- [ ] Set up provider failover logic
- [ ] Implement caching layer
- [ ] Add rate limit tracking

### 10.3 Medium-Term (Month 2)

- [ ] Register for xKDR API key
- [ ] Implement historical data ingestion
- [ ] Explore direct CPCB API access
- [ ] Add provider health monitoring

---

## 11. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 17, 2026 | Development Team | Initial data sources evaluation |

---

**END OF DATA SOURCES DOCUMENT**
