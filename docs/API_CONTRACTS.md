# API Contracts Documentation
# Urban Air Quality Assistant

**Version:** 1.0  
**Date:** November 17, 2026  
**API Version:** v1  
**Base URL:** `/api/v1`  

---

## 1. Overview

All API endpoints follow RESTful conventions with:
- JSON request/response bodies
- Consistent error formats
- Request validation using Zod schemas
- Rate limiting on all endpoints
- Proper HTTP status codes
- CORS restrictions

---

## 2. Common Conventions

### 2.1 Request Headers

```http
Content-Type: application/json
Accept: application/json
```

### 2.2 Response Format

**Success Response:**
```typescript
{
  "success": true,
  "data": { /* response data */ },
  "meta"?: { /* pagination, timing, etc. */ }
}
```

**Error Response:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION" | "NOT_FOUND" | "RATE_LIMIT" | "PROVIDER_ERROR" | "INTERNAL_ERROR",
    "message": "User-friendly error message",
    "code": "MACHINE_READABLE_CODE",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123",
    "details"?: { /* additional context */ }
  }
}
```

### 2.3 HTTP Status Codes

| Status Code | Usage |
|-------------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Bad Request (validation failed) |
| 404 | Resource Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |
| 502 | Bad Gateway (external provider error) |
| 503 | Service Unavailable (maintenance) |

### 2.4 Pagination

For list endpoints returning multiple items:

**Query Parameters:**
```typescript
{
  limit?: number;  // Default: 50, Max: 100
  offset?: number; // Default: 0
}
```

**Response Meta:**
```typescript
{
  "meta": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2.5 Timestamps

All timestamps in ISO 8601 format (UTC):
```
2026-11-17T13:45:00.000Z
```

---

## 3. Endpoint Specifications

### 3.1 GET `/api/v1/air-quality/current`

**Purpose:** Retrieve current air quality data for a specific location.

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `city` | string | Yes* | City name | `Delhi` |
| `stationId` | string | Yes* | Specific station identifier | `DL_Anand_Vihar` |

*Either `city` or `stationId` must be provided.

**Request Example:**
```http
GET /api/v1/air-quality/current?city=Delhi
```

**Success Response (200):**
```typescript
{
  "success": true,
  "data": {
    "location": {
      "city": "Delhi",
      "state": "Delhi",
      "stationId": "DL_Anand_Vihar",
      "stationName": "Delhi - Anand Vihar",
      "coordinates": {
        "latitude": 28.6469,
        "longitude": 77.2958
      }
    },
    "aqi": {
      "value": 287,
      "category": "POOR",
      "dominantPollutant": "PM2_5",
      "calculatedAt": "2026-11-17T13:45:00.000Z",
      "methodology": "CPCB_INDIA"
    },
    "pollutants": [
      {
        "type": "PM2_5",
        "name": "PM2.5 (Particulate Matter < 2.5µm)",
        "concentration": 142.5,
        "unit": "µg/m³",
        "subIndex": 287,
        "averagingPeriod": "24h",
        "category": "POOR"
      },
      {
        "type": "PM10",
        "name": "PM10 (Particulate Matter < 10µm)",
        "concentration": 201.3,
        "unit": "µg/m³",
        "subIndex": 201,
        "averagingPeriod": "24h",
        "category": "MODERATELY_POLLUTED"
      },
      {
        "type": "NO2",
        "name": "Nitrogen Dioxide",
        "concentration": 52.1,
        "unit": "µg/m³",
        "subIndex": 26,
        "averagingPeriod": "24h",
        "category": "GOOD"
      }
      // ... other pollutants
    ],
    "dataQuality": {
      "freshness": "LIVE",
      "measurementTimestamp": "2026-11-17T13:30:00.000Z",
      "retrievedAt": "2026-11-17T13:45:00.000Z",
      "source": "CPCB",
      "dataAvailability": {
        "pm25": true,
        "pm10": true,
        "no2": true,
        "so2": true,
        "co": true,
        "o3": false,
        "nh3": false
      }
    },
    "healthRecommendation": {
      "generalPublic": "Reduce prolonged or heavy outdoor physical activities",
      "sensitiveGroups": "Avoid prolonged or heavy exertion"
    }
  }
}
```

**Error Responses:**

**404 - Location Not Found:**
```typescript
{
  "success": false,
  "error": {
    "category": "NOT_FOUND",
    "message": "No monitoring stations found for the specified location",
    "code": "LOCATION_NOT_FOUND",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**400 - Validation Error:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "Either 'city' or 'stationId' query parameter is required",
    "code": "MISSING_LOCATION_PARAMETER",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**502 - Provider Error:**
```typescript
{
  "success": false,
  "error": {
    "category": "PROVIDER_ERROR",
    "message": "Unable to retrieve air quality data at this time. Please try again later.",
    "code": "UPSTREAM_SERVICE_ERROR",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Rate Limit:** 60 requests per minute per IP

---

### 3.2 GET `/api/v1/air-quality/history`

**Purpose:** Retrieve historical air quality data for a location over a specified time range.

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `city` | string | Yes* | City name | `Delhi` |
| `stationId` | string | Yes* | Specific station identifier | `DL_Anand_Vihar` |
| `startDate` | string (ISO 8601) | Yes | Start of time range | `2026-11-10T00:00:00Z` |
| `endDate` | string (ISO 8601) | Yes | End of time range | `2026-11-17T23:59:59Z` |
| `pollutant` | string | No | Filter by specific pollutant | `PM2_5` |
| `interval` | string | No | Aggregation interval: `hourly`, `daily`, `weekly` | `daily` |
| `limit` | number | No | Max results (default: 100, max: 1000) | `168` |

*Either `city` or `stationId` must be provided.

**Request Example:**
```http
GET /api/v1/air-quality/history?city=Delhi&startDate=2026-11-10T00:00:00Z&endDate=2026-11-17T23:59:59Z&interval=daily
```

**Success Response (200):**
```typescript
{
  "success": true,
  "data": {
    "location": {
      "city": "Delhi",
      "state": "Delhi",
      "stationId": "DL_Anand_Vihar",
      "stationName": "Delhi - Anand Vihar"
    },
    "timeRange": {
      "start": "2026-11-10T00:00:00.000Z",
      "end": "2026-11-17T23:59:59.000Z",
      "interval": "daily"
    },
    "observations": [
      {
        "timestamp": "2026-11-10T00:00:00.000Z",
        "aqi": {
          "value": 245,
          "category": "POOR",
          "dominantPollutant": "PM2_5"
        },
        "pollutants": {
          "PM2_5": { "concentration": 115.2, "unit": "µg/m³", "subIndex": 245 },
          "PM10": { "concentration": 180.5, "unit": "µg/m³", "subIndex": 180 }
          // ... other pollutants
        }
      },
      {
        "timestamp": "2026-11-11T00:00:00.000Z",
        "aqi": {
          "value": 268,
          "category": "POOR",
          "dominantPollutant": "PM2_5"
        },
        "pollutants": {
          "PM2_5": { "concentration": 128.7, "unit": "µg/m³", "subIndex": 268 },
          "PM10": { "concentration": 195.3, "unit": "µg/m³", "subIndex": 195 }
        }
      }
      // ... more observations
    ],
    "statistics": {
      "avgAqi": 256.3,
      "minAqi": 198,
      "maxAqi": 312,
      "dataCompleteness": 0.95  // 95% of expected data points present
    }
  },
  "meta": {
    "total": 8,
    "limit": 100,
    "offset": 0
  }
}
```

**Error Responses:**

**400 - Invalid Date Range:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "startDate must be before endDate",
    "code": "INVALID_DATE_RANGE",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**400 - Date Range Too Large:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "Date range cannot exceed 90 days for hourly data",
    "code": "DATE_RANGE_TOO_LARGE",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Rate Limit:** 30 requests per minute per IP

---

### 3.3 GET `/api/v1/locations/search`

**Purpose:** Search for cities, localities, or monitoring stations.

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `query` | string | Yes | Search term (min 2 characters) | `delhi` |
| `limit` | number | No | Max results (default: 20, max: 50) | `10` |
| `type` | string | No | Filter by type: `city`, `station` | `city` |

**Request Example:**
```http
GET /api/v1/locations/search?query=delhi&limit=10
```

**Success Response (200):**
```typescript
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "city",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "stationCount": 38,
        "coordinates": {
          "latitude": 28.7041,
          "longitude": 77.1025
        }
      },
      {
        "type": "station",
        "stationId": "DL_Anand_Vihar",
        "stationName": "Delhi - Anand Vihar",
        "city": "Delhi",
        "state": "Delhi",
        "isActive": true,
        "provider": "CPCB",
        "coordinates": {
          "latitude": 28.6469,
          "longitude": 77.2958
        }
      },
      {
        "type": "station",
        "stationId": "DL_RK_Puram",
        "stationName": "Delhi - RK Puram",
        "city": "Delhi",
        "state": "Delhi",
        "isActive": true,
        "provider": "CPCB",
        "coordinates": {
          "latitude": 28.5631,
          "longitude": 77.1717
        }
      }
      // ... more results
    ]
  },
  "meta": {
    "total": 45,
    "limit": 10,
    "query": "delhi"
  }
}
```

**Error Responses:**

**400 - Query Too Short:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "Search query must be at least 2 characters long",
    "code": "QUERY_TOO_SHORT",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Rate Limit:** 60 requests per minute per IP

---

### 3.4 POST `/api/v1/assistant`

**Purpose:** Submit a question to the AI assistant and receive a grounded, contextual response.

**Method:** `POST`

**Request Body:**

```typescript
{
  "question": string;          // User's natural language question (1-500 characters)
  "locationContext": {         // Location for context retrieval
    "city"?: string;           // City name
    "stationId"?: string;      // Specific station
  };
  "conversationId"?: string;   // Optional: for conversation context
}
```

**Request Example:**
```http
POST /api/v1/assistant
Content-Type: application/json

{
  "question": "Why is the AQI high today in Delhi?",
  "locationContext": {
    "city": "Delhi"
  }
}
```

**Success Response (200):**
```typescript
{
  "success": true,
  "data": {
    "answer": "The Air Quality Index in Delhi is currently 287 (Poor) primarily due to elevated PM2.5 concentrations of 142.5 µg/m³. This is significantly above the safe threshold of 60 µg/m³ for 24-hour exposure.\n\nSeveral factors may be contributing:\n\n1. **Low wind speeds** (5 km/h): Limited air circulation prevents pollutant dispersion\n2. **High humidity** (68%): Can trap particulate matter closer to ground level\n3. **Temperature inversion**: Cooler temperatures may be trapping pollutants\n\nHistorical data shows AQI has increased 15% compared to yesterday (245), indicating worsening conditions.\n\n**Recommended precautions:**\n- Reduce prolonged outdoor physical activities\n- Keep windows closed during peak pollution hours\n- Use air purifiers indoors if available\n- Sensitive groups (children, elderly, respiratory conditions) should avoid outdoor exertion\n\nNote: This assessment is based on measurements from CPCB monitoring stations as of 13:30 UTC today.",
    
    "context": {
      "location": {
        "city": "Delhi",
        "stationName": "Delhi - Anand Vihar"
      },
      "currentAqi": {
        "value": 287,
        "category": "POOR",
        "dominantPollutant": "PM2_5",
        "timestamp": "2026-11-17T13:30:00.000Z"
      },
      "pollutants": {
        "PM2_5": { "concentration": 142.5, "unit": "µg/m³" },
        "PM10": { "concentration": 201.3, "unit": "µg/m³" }
      },
      "weather": {
        "temperature": 18,
        "humidity": 68,
        "windSpeed": 5,
        "windDirection": "NE"
      },
      "dataSource": "CPCB",
      "dataCurrency": "LIVE"
    },
    
    "conversationId": "conv_xyz789",
    "responseMetadata": {
      "generatedAt": "2026-11-17T13:45:15.000Z",
      "tokensUsed": 542,
      "processingTime": 1240  // milliseconds
    }
  }
}
```

**Error Responses:**

**400 - Invalid Question:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "Question must be between 1 and 500 characters",
    "code": "INVALID_QUESTION_LENGTH",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**400 - Missing Location Context:**
```typescript
{
  "success": false,
  "error": {
    "category": "VALIDATION",
    "message": "Location context is required (city or stationId)",
    "code": "MISSING_LOCATION_CONTEXT",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**429 - Rate Limit Exceeded:**
```typescript
{
  "success": false,
  "error": {
    "category": "RATE_LIMIT",
    "message": "AI assistant rate limit exceeded. Please try again in 60 seconds.",
    "code": "AI_RATE_LIMIT_EXCEEDED",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "retryAfter": 60  // seconds
    }
  }
}
```

**503 - AI Service Unavailable:**
```typescript
{
  "success": false,
  "error": {
    "category": "PROVIDER_ERROR",
    "message": "AI assistant is temporarily unavailable. Core air quality data remains accessible.",
    "code": "AI_SERVICE_UNAVAILABLE",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123"
  }
}
```

**Rate Limit:** 10 requests per minute per IP (stricter due to AI costs)

**Security Notes:**
- ⚠️ **Server retrieves all environmental context** - frontend only sends question and location identifier
- ✅ AI responses validated before returning (no fabricated measurements)
- ✅ Conversation context sanitized (no sensitive data exposure)

---

## 4. Request Validation Schemas

### 4.1 Current AQI Request Schema

```typescript
import { z } from 'zod';

export const currentAqiQuerySchema = z.object({
  city: z.string().min(2).max(100).optional(),
  stationId: z.string().min(1).max(100).optional(),
}).refine(
  (data) => data.city || data.stationId,
  { message: "Either 'city' or 'stationId' must be provided" }
);

export type CurrentAqiQuery = z.infer<typeof currentAqiQuerySchema>;
```

### 4.2 Historical AQI Request Schema

```typescript
export const historicalAqiQuerySchema = z.object({
  city: z.string().min(2).max(100).optional(),
  stationId: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  pollutant: z.enum(['PM2_5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'NH3', 'PB']).optional(),
  interval: z.enum(['hourly', 'daily', 'weekly']).optional().default('daily'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
}).refine(
  (data) => data.city || data.stationId,
  { message: "Either 'city' or 'stationId' must be provided" }
).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: "startDate must be before endDate" }
);

export type HistoricalAqiQuery = z.infer<typeof historicalAqiQuerySchema>;
```

### 4.3 Location Search Request Schema

```typescript
export const locationSearchQuerySchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  type: z.enum(['city', 'station']).optional(),
});

export type LocationSearchQuery = z.infer<typeof locationSearchQuerySchema>;
```

### 4.4 AI Assistant Request Schema

```typescript
export const assistantRequestSchema = z.object({
  question: z.string().min(1).max(500),
  locationContext: z.object({
    city: z.string().min(2).max(100).optional(),
    stationId: z.string().min(1).max(100).optional(),
  }).refine(
    (data) => data.city || data.stationId,
    { message: "Either 'city' or 'stationId' must be provided in locationContext" }
  ),
  conversationId: z.string().optional(),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
```

---

## 5. Rate Limiting

### 5.1 Rate Limit Configuration

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `/api/v1/air-quality/current` | 60 req/min | Per IP | Frequent dashboard refreshes |
| `/api/v1/air-quality/history` | 30 req/min | Per IP | More expensive queries |
| `/api/v1/locations/search` | 60 req/min | Per IP | Interactive search |
| `/api/v1/assistant` | 10 req/min | Per IP | AI provider costs |

### 5.2 Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1700234567
```

### 5.3 Rate Limit Exceeded Response

```typescript
{
  "success": false,
  "error": {
    "category": "RATE_LIMIT",
    "message": "Rate limit exceeded. Please retry after indicated time.",
    "code": "RATE_LIMIT_EXCEEDED",
    "timestamp": "2026-11-17T13:45:00.000Z",
    "requestId": "req_abc123",
    "details": {
      "limit": 60,
      "window": "1 minute",
      "retryAfter": 45  // seconds
    }
  }
}
```

---

## 6. CORS Configuration

### 6.1 Allowed Origins

**Development:**
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**Production:**
- `https://your-production-domain.com`

### 6.2 Allowed Methods

```
GET, POST, OPTIONS
```

### 6.3 Allowed Headers

```
Content-Type, Accept, Authorization
```

---

## 7. Caching Strategy

### 7.1 Cache Headers

| Endpoint | Cache-Control | Rationale |
|----------|---------------|-----------|
| `/api/v1/air-quality/current` | `public, max-age=900` | 15 min cache (data refresh rate) |
| `/api/v1/air-quality/history` | `public, max-age=3600` | 1 hour cache (historical data immutable) |
| `/api/v1/locations/search` | `public, max-age=3600` | 1 hour cache (station list stable) |
| `/api/v1/assistant` | `no-store` | Never cache (user-specific, conversational) |

### 7.2 ETag Support

Historical data endpoints support ETags for efficient caching:

```http
ETag: "abc123def456"
If-None-Match: "abc123def456"
```

**304 Not Modified Response:**
```http
HTTP/1.1 304 Not Modified
ETag: "abc123def456"
Cache-Control: public, max-age=3600
```

---

## 8. Security Considerations

### 8.1 Input Validation

- ✅ All inputs validated with Zod schemas
- ✅ Maximum length limits enforced
- ✅ Type coercion for query parameters
- ✅ Enum validation for constrained values

### 8.2 Output Sanitization

- ✅ Error messages never expose internal details
- ✅ Stack traces excluded from responses
- ✅ Database errors mapped to generic messages

### 8.3 Rate Limiting

- ✅ Per-IP rate limiting implemented
- ✅ Stricter limits on expensive endpoints (AI)
- ✅ Rate limit headers included

### 8.4 SSRF Protection

- ✅ No user-controlled URLs in server-side requests
- ✅ Provider URLs hardcoded or environment-configured

---

## 9. Monitoring and Logging

### 9.1 Request Logging

Each API request logs:
```typescript
{
  requestId: "req_abc123",
  method: "GET",
  path: "/api/v1/air-quality/current",
  query: { city: "Delhi" },
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  timestamp: "2026-11-17T13:45:00.000Z",
  responseTime: 245,  // ms
  statusCode: 200
}
```

### 9.2 Error Logging

Errors log additional context:
```typescript
{
  requestId: "req_abc123",
  error: {
    name: "ProviderTimeoutError",
    message: "CPCB API request timed out after 10000ms",
    stack: "Error: ...",  // Server-side only
    provider: "CPCB",
    endpoint: "https://api.cpcb.gov.in/..."
  },
  timestamp: "2026-11-17T13:45:00.000Z"
}
```

---

## 10. Versioning Strategy

### 10.1 Current Version

**API Version:** `v1`  
**Base Path:** `/api/v1`

### 10.2 Future Versioning

Breaking changes will introduce new version:
- `/api/v2/...`

Non-breaking changes (additions) can be made to existing version.

### 10.3 Deprecation Policy

- Deprecated endpoints: 6-month notice
- Version support: Minimum 2 versions
- Deprecation warnings in response headers:
  ```http
  Deprecation: version=v1, sunset=2027-06-01
  ```

---

## 11. Testing Endpoints

### 11.1 Health Check

**Endpoint:** `GET /api/health`

**Response:**
```typescript
{
  "status": "healthy",
  "timestamp": "2026-11-17T13:45:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cpcb_provider": "healthy",
    "ai_provider": "healthy"
  }
}
```

---

## 12. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 17, 2026 | Development Team | Initial API contracts |

---

**END OF API CONTRACTS DOCUMENT**
