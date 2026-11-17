# System Architecture
# Urban Air Quality Assistant

**Version:** 1.0  
**Date:** November 17, 2026  
**Status:** Initial Design  

---

## 1. Architecture Overview

### 1.1 Architecture Style

**Modular Full-Stack Monolith** with clear separation of concerns.

The application uses a **layered architecture** pattern with the following primary layers:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│              (Next.js Frontend / React UI)               │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────────┐
│                      API LAYER                           │
│              (Next.js Route Handlers)                    │
│         Request Validation, Rate Limiting                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│          (Services, Business Logic, Use Cases)           │
└───────┬──────────────────────────┬─────────────────┬────┘
        │                          │                 │
┌───────▼──────────┐    ┌─────────▼────────┐   ┌───▼────────────┐
│  DOMAIN LAYER    │    │  INTEGRATION     │   │   AI PROVIDER  │
│  (AQI Engine,    │    │     LAYER        │   │   (LLM SDK)    │
│   Calculations,  │    │  (Data Provider  │   │                │
│   Core Models)   │    │    Adapters)     │   │                │
└──────────────────┘    └──────┬───────────┘   └────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │   DATA LAYER         │
                    │  (PostgreSQL/Prisma) │
                    │   (Cache Layer)      │
                    └──────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  EXTERNAL SOURCES    │
                    │  CPCB, OpenAQ, etc.  │
                    └──────────────────────┘
```

### 1.2 Design Rationale

**Why Monolith?**
- Single deployment artifact reduces operational complexity
- No network latency between layers
- Easier local development and testing
- Simpler transaction management
- Appropriate scale for MVP and initial user base

**Why Not Microservices?**
- Unnecessary complexity for initial scope
- No independent scaling requirements identified
- No team boundaries requiring separation
- Domain not yet stable enough to warrant service boundaries

**Future Evolution Path:**
Architecture supports future extraction of:
- AI service (if scaling or isolation required)
- Data ingestion pipeline (if real-time streaming needed)
- Calculation engine (if shared across multiple applications)

---

## 2. Layer Responsibilities

### 2.1 Presentation Layer

**Technology:** Next.js App Router, React 19, TypeScript, Tailwind CSS

**Responsibilities:**
- Render UI components
- Handle user interactions
- Client-side routing and navigation
- Form validation (client-side, UI feedback)
- Display data received from API layer
- Manage UI state (loading, error, success)
- Responsive layout
- Accessibility implementation

**Rules:**
- ❌ NO business logic in components
- ❌ NO direct database access
- ❌ NO direct external API calls to data providers
- ❌ NO API keys or secrets
- ✅ Call internal API routes only
- ✅ Display validated, sanitized data
- ✅ Implement proper error boundaries

**Key Directories:**
- `src/app/` - Next.js pages and layouts
- `src/components/` - Reusable React components
- `src/features/*/components/` - Feature-specific components

---

### 2.2 API Layer

**Technology:** Next.js Route Handlers (server-side)

**Responsibilities:**
- HTTP request/response handling
- Request validation (Zod schemas)
- Response formatting
- Rate limiting enforcement
- CORS configuration
- Error handling and sanitization
- Authentication/authorization (if added)
- Request logging
- Timeout enforcement

**Rules:**
- ✅ Validate ALL incoming requests
- ✅ Sanitize ALL outgoing responses
- ✅ Return consistent error formats
- ✅ Implement rate limiting on all public endpoints
- ❌ NO business logic (delegate to Application Layer)
- ❌ NO direct database queries (use services/repositories)
- ❌ NO complex calculations (delegate to Domain Layer)

**Key Directories:**
- `src/app/api/v1/` - API route handlers

**API Versioning:**
All routes under `/api/v1/` to allow future breaking changes via `/api/v2/`.

---

### 2.3 Application Layer (Services)

**Technology:** TypeScript classes/functions, Dependency Injection pattern

**Responsibilities:**
- Orchestrate use cases
- Coordinate between Domain, Integration, and Data layers
- Transaction management
- Business workflow implementation
- Caching strategy execution
- Service-level error handling
- Logging and monitoring

**Key Services:**

**AirQualityService:**
- Fetch current air quality for location
- Retrieve historical data
- Coordinate provider selection and failover
- Cache management for air quality data

**LocationService:**
- Search locations/cities
- Find nearby monitoring stations
- Geocoding (if implemented)
- Location metadata management

**AIAssistantService:**
- Construct AI context from environmental data
- Call AI provider
- Validate and format AI responses
- Manage conversation context
- Rate limiting per user

**WeatherService:**
- Fetch weather data for locations
- Correlate weather with air quality timestamps
- Cache weather information

**Rules:**
- ✅ Coordinate multiple domain/integration operations
- ✅ Handle cross-cutting concerns (caching, logging)
- ❌ NO HTTP request handling (done in API layer)
- ❌ NO direct UI concerns
- ❌ NO pollutant calculations (use Domain Layer)

**Key Directories:**
- `src/server/services/`

---

### 2.4 Domain Layer

**Technology:** Pure TypeScript functions and classes (framework-agnostic)

**Responsibilities:**
- AQI calculation engine
- Pollutant sub-index calculations
- Breakpoint table management
- Data sufficiency validation
- Unit conversions
- Core business rules
- Domain models and types

**Key Modules:**

**AQI Calculation Engine:**
```typescript
// Core function signature
calculateAqi(measurements: PollutantMeasurement[]): AqiResult
calculateSubIndex(pollutant: Pollutant, concentration: number): SubIndex
determineDominantPollutant(subIndices: SubIndex[]): Pollutant
mapAqiToCategory(aqi: number): AqiCategory
```

**Domain Models:**
- `AirQualitySnapshot`
- `PollutantMeasurement`
- `MonitoringStation`
- `AqiResult`
- `AqiCategory`

**Rules:**
- ✅ Pure, deterministic functions where possible
- ✅ Independently testable (no external dependencies)
- ✅ Framework-agnostic
- ❌ NO I/O operations
- ❌ NO HTTP calls
- ❌ NO database access
- ❌ NO external API calls

**Key Directories:**
- `src/features/air-quality/domain/`
- `src/features/air-quality/types/`

---

### 2.5 Integration Layer (Provider Adapters)

**Technology:** TypeScript adapter pattern

**Responsibilities:**
- Abstract external data sources
- Normalize provider-specific data formats
- Handle provider-specific authentication
- Implement retry logic and error handling
- Rate limit management per provider
- Data provenance tracking

**Provider Adapter Interface:**
```typescript
interface AirQualityProvider {
  name: string;
  getCurrentAirQuality(location: LocationIdentifier): Promise<AirQualitySnapshot>;
  getHistoricalData(location: LocationIdentifier, range: TimeRange): Promise<AirQualitySnapshot[]>;
  searchLocations(query: string): Promise<Location[]>;
  isAvailable(): Promise<boolean>;
}
```

**Planned Adapters:**
1. **CPCBAdapter** (Primary)
2. **DataGovInAdapter** (Primary)
3. **OpenAQAdapter** (Fallback/Supplementary)
4. **XKDRAdapter** (Historical bulk data)

**Normalization Requirements:**
- Convert all concentrations to consistent units (μg/m³ or mg/m³)
- Standardize timestamp formats (ISO 8601, UTC)
- Map provider-specific station IDs to internal IDs
- Preserve source attribution

**Rules:**
- ✅ Return normalized internal models (not provider-specific formats)
- ✅ Handle provider errors gracefully
- ✅ Implement timeouts
- ✅ Log all external API calls
- ❌ NO business logic
- ❌ NO AQI calculations (return raw concentrations)

**Key Directories:**
- `src/server/providers/air-quality/`
- `src/server/providers/weather/`
- `src/server/providers/ai/`

---

### 2.6 AI Provider Layer

**Technology:** Official LLM provider SDK (OpenAI, Anthropic, etc.)

**Responsibilities:**
- LLM API communication
- Prompt construction
- Response parsing and validation
- Token management
- Error handling for AI-specific errors
- Rate limiting

**AIProvider Interface:**
```typescript
interface AIProvider {
  name: string;
  generateResponse(prompt: string, context: EnvironmentalContext): Promise<AIResponse>;
  validateResponse(response: string): boolean;
  estimateTokens(text: string): number;
  isAvailable(): Promise<boolean>;
}
```

**Security Requirements:**
- API keys stored server-side only (environment variables)
- Treat all user prompts as untrusted
- Validate model outputs before returning
- Implement input/output length limits
- No model access to privileged operations

**Key Directories:**
- `src/server/providers/ai/`

---

### 2.7 Data Layer

**Technology:** PostgreSQL 14+, Prisma ORM

**Responsibilities:**
- Persistent data storage
- Data retrieval and querying
- Database migrations
- Connection pooling
- Transaction management
- Data integrity constraints

**Core Entities:**

**MonitoringStation**
- Station ID (unique)
- Name
- Location (lat/lon)
- City/State
- Provider source
- Active status
- Created/Updated timestamps

**PollutantObservation**
- Observation ID
- Station ID (foreign key)
- Pollutant type
- Concentration value
- Unit
- Observed timestamp
- Data quality flag
- Source provider
- Ingested timestamp

**AirQualitySnapshot** (computed, may be cached)
- Location identifier
- Timestamp
- Overall AQI
- AQI category
- Dominant pollutant
- Individual sub-indices
- Data freshness indicator
- Source attribution

**WeatherObservation** (if weather integrated)
- Location identifier
- Timestamp
- Temperature, humidity, wind, etc.
- Source provider

**Rules:**
- ✅ Use Prisma migrations for all schema changes
- ✅ Implement appropriate indexes
- ✅ Use parameterized queries (Prisma ORM)
- ✅ Validate data before insertion
- ❌ NO raw SQL with user input
- ❌ NO storing unnecessary PII

**Key Directories:**
- `prisma/` - Schema and migrations
- `src/server/repositories/` - Data access layer

---

### 2.8 Caching Layer

**Technology:** In-memory caching (initial), Redis (if needed)

**Responsibilities:**
- Cache frequently accessed data
- Reduce external API calls
- Improve response times
- Respect data freshness requirements

**Caching Strategy:**

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| Current AQI | 15 minutes | Time-based |
| Historical data (>1 day old) | 24 hours | None (immutable) |
| Location search results | 1 hour | Time-based |
| Weather data | 30 minutes | Time-based |
| Station metadata | 24 hours | Manual/deployment |

**Rules:**
- ✅ Always include cache timestamp in response
- ✅ Indicate data freshness to user
- ❌ DO NOT cache user-specific AI responses across users
- ❌ DO NOT cache data longer than provider update frequency

**Key Directories:**
- `src/server/cache/`

---

## 3. Data Flow Diagrams

### 3.1 Current Air Quality Retrieval Flow

```
User Request: "Show me current AQI for Delhi"
│
│ 1. HTTP GET /api/v1/air-quality/current?location=delhi
▼
┌─────────────────────────────────────────────────┐
│         API Route Handler (Route)               │
│  - Validate query params (Zod)                  │
│  - Check rate limit                             │
└────────────────┬────────────────────────────────┘
                 │ 2. Call service
                 ▼
┌─────────────────────────────────────────────────┐
│      AirQualityService.getCurrentAQI()          │
│  - Check cache                                  │
│  - If cache miss, call provider adapter         │
└────────────────┬────────────────────────────────┘
                 │ 3. Fetch from provider
                 ▼
┌─────────────────────────────────────────────────┐
│       CPCBAdapter.getCurrentAirQuality()        │
│  - Call external CPCB API                       │
│  - Normalize response                           │
│  - Return AirQualitySnapshot                    │
└────────────────┬────────────────────────────────┘
                 │ 4. Raw measurements
                 ▼
┌─────────────────────────────────────────────────┐
│      AQI Calculation Engine (Domain)            │
│  - Calculate sub-indices for each pollutant     │
│  - Determine overall AQI (max sub-index)        │
│  - Identify dominant pollutant                  │
│  - Map to category                              │
└────────────────┬────────────────────────────────┘
                 │ 5. Calculated AQI
                 ▼
┌─────────────────────────────────────────────────┐
│       AirQualityService                         │
│  - Store in cache                               │
│  - Optionally persist to database               │
│  - Return to API handler                        │
└────────────────┬────────────────────────────────┘
                 │ 6. JSON response
                 ▼
┌─────────────────────────────────────────────────┐
│         API Response                            │
│  {                                              │
│    "location": "Delhi",                         │
│    "aqi": 287,                                  │
│    "category": "Poor",                          │
│    "dominantPollutant": "PM2.5",                │
│    "measurements": [...],                       │
│    "timestamp": "2026-11-17T13:45:00Z",         │
│    "source": "CPCB"                             │
│  }                                              │
└────────────────┬────────────────────────────────┘
                 │ 7. Display in UI
                 ▼
┌─────────────────────────────────────────────────┐
│      React Dashboard Component                  │
│  - Render AQI indicator                         │
│  - Display pollutant cards                      │
│  - Show timestamp and source                    │
└─────────────────────────────────────────────────┘
```

---

### 3.2 AI Assistant Query Flow

```
User Question: "Why is the AQI high today?"
│
│ 1. POST /api/v1/assistant
│    { "question": "Why is AQI high?", "locationId": "delhi" }
▼
┌─────────────────────────────────────────────────┐
│         API Route Handler                       │
│  - Validate request (Zod)                       │
│  - Check rate limit (per IP/user)               │
│  - Sanitize user input                          │
└────────────────┬────────────────────────────────┘
                 │ 2. Call AI service
                 ▼
┌─────────────────────────────────────────────────┐
│      AIAssistantService.ask()                   │
│  ⚠️ CRITICAL: DO NOT trust user-provided data   │
└────────────────┬────────────────────────────────┘
                 │ 3. Retrieve TRUSTED context
                 ▼
┌─────────────────────────────────────────────────┐
│  Parallel context retrieval:                    │
│  ┌────────────────────────────────────────────┐ │
│  │ AirQualityService.getCurrentAQI(delhi)     │ │
│  │ → Current measurements, AQI, pollutants    │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ AirQualityService.getHistoricalData()      │ │
│  │ → Last 24h trends                          │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ WeatherService.getCurrentWeather(delhi)    │ │
│  │ → Temperature, wind, humidity              │ │
│  └────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────┘
                 │ 4. Construct AI prompt
                 ▼
┌─────────────────────────────────────────────────┐
│  Prompt Construction:                           │
│                                                 │
│  SYSTEM: You are an air quality assistant.      │
│  Current verified data:                         │
│  - Location: Delhi                              │
│  - AQI: 287 (Poor) at 2026-11-17T13:45:00Z     │
│  - Dominant: PM2.5 (142 μg/m³)                  │
│  - PM10: 201 μg/m³                              │
│  - Historical: [trend data]                     │
│  - Weather: 18°C, Wind: 5 km/h NE, Humid: 65%  │
│                                                 │
│  RULES:                                         │
│  - Use ONLY the data provided above             │
│  - DO NOT invent measurements                   │
│  - Explain uncertainty clearly                  │
│  - DO NOT diagnose health conditions            │
│                                                 │
│  USER: Why is the AQI high today?               │
└────────────────┬────────────────────────────────┘
                 │ 5. Call AI provider
                 ▼
┌─────────────────────────────────────────────────┐
│      OpenAIAdapter.generateResponse()           │
│  - Call OpenAI API                              │
│  - Handle rate limits                           │
│  - Timeout: 30 seconds                          │
└────────────────┬────────────────────────────────┘
                 │ 6. AI response
                 ▼
┌─────────────────────────────────────────────────┐
│  AI Response Validation:                        │
│  - Check for fabricated numbers                 │
│  - Verify measurements cited match context      │
│  - Ensure no medical diagnoses                  │
│  - Validate response structure                  │
└────────────────┬────────────────────────────────┘
                 │ 7. Return to user
                 ▼
┌─────────────────────────────────────────────────┐
│      JSON Response                              │
│  {                                              │
│    "answer": "The AQI is 287 (Poor) primarily   │
│               due to elevated PM2.5 (142 μg/m³).│
│               Low wind speeds (5 km/h) may be   │
│               limiting pollutant dispersion...", │
│    "context": {                                 │
│      "aqi": 287,                                │
│      "timestamp": "2026-11-17T13:45:00Z",       │
│      "source": "CPCB"                           │
│    }                                            │
│  }                                              │
└─────────────────────────────────────────────────┘
```

**Security Critical Points:**
- ⚠️ User input NEVER trusted as authoritative environmental data
- ✅ Server retrieves ALL context data from trusted sources
- ✅ AI responses validated before returning
- ✅ Rate limiting prevents abuse

---

## 4. Security Architecture

### 4.1 Defense in Depth Strategy

```
┌──────────────────────────────────────────────────────┐
│              Security Layer 1: Edge                   │
│  - HTTPS only                                         │
│  - Security headers (CSP, HSTS, etc.)                │
│  - Rate limiting (global)                            │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│       Security Layer 2: API Gateway                   │
│  - Request validation (Zod schemas)                   │
│  - Size limits                                        │
│  - Rate limiting (per endpoint)                       │
│  - CORS configuration                                 │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│     Security Layer 3: Application Logic               │
│  - Input sanitization                                 │
│  - Output encoding                                    │
│  - Business rule enforcement                          │
│  - Authorization checks                               │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│       Security Layer 4: Data Access                   │
│  - Parameterized queries (Prisma ORM)                 │
│  - Principle of least privilege                       │
│  - Data validation before storage                     │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│      Security Layer 5: Infrastructure                 │
│  - Database access controls                           │
│  - Network segmentation                               │
│  - Secrets management (env variables)                 │
└──────────────────────────────────────────────────────┘
```

### 4.2 Secrets Management

**Environment Variables (Required):**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# AI Provider
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Data Providers
CPCB_API_KEY=xxx  # if required
DATA_GOV_IN_API_KEY=xxx  # if required
OPENAQ_API_KEY=xxx  # optional

# Weather Provider
WEATHER_API_KEY=xxx

# Application
NODE_ENV=production
NEXTAUTH_SECRET=xxx  # if auth added
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Rules:**
- ✅ All secrets in environment variables (never hardcoded)
- ✅ Validate required secrets on startup
- ✅ Use `.env.example` with placeholders
- ❌ NEVER commit `.env` to Git
- ❌ NEVER expose secrets to client (no `NEXT_PUBLIC_` for secrets)
- ❌ NEVER log secrets

### 4.3 Security Headers Configuration

```typescript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(self), microphone=(), camera=()'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];
```

---

## 5. Performance Architecture

### 5.1 Caching Strategy

**Multi-Level Caching:**

```
┌────────────────────────────────────────────────┐
│         Browser Cache                          │
│  - Static assets (images, CSS, JS)             │
│  - Cache-Control headers                       │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│         Application Cache (In-Memory)          │
│  - Current AQI (15 min TTL)                    │
│  - Location metadata (1 hour TTL)              │
│  - Weather data (30 min TTL)                   │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│         Database (PostgreSQL)                  │
│  - Historical observations                     │
│  - Station metadata                            │
│  - Persistent cache for immutable historical   │
└────────────────────────────────────────────────┘
```

### 5.2 Query Optimization

**Database Indexes:**
```sql
-- Monitoring stations by location
CREATE INDEX idx_stations_location ON monitoring_stations(city, state);

-- Observations by station and time (most common query)
CREATE INDEX idx_observations_station_time 
ON pollutant_observations(station_id, observed_at DESC);

-- Observations by pollutant type
CREATE INDEX idx_observations_pollutant 
ON pollutant_observations(pollutant_type, observed_at DESC);
```

### 5.3 API Response Optimization

- **Pagination**: Historical data endpoints support `limit` and `offset`
- **Field Selection**: Return only requested fields where appropriate
- **Compression**: gzip/brotli for API responses
- **Parallel Queries**: Fetch independent data concurrently

---

## 6. Error Handling Architecture

### 6.1 Error Classification

```typescript
enum ErrorCategory {
  VALIDATION = 'VALIDATION',           // User input errors (400)
  AUTHENTICATION = 'AUTHENTICATION',   // Auth errors (401) - future
  AUTHORIZATION = 'AUTHORIZATION',     // Permission errors (403) - future
  NOT_FOUND = 'NOT_FOUND',            // Resource not found (404)
  RATE_LIMIT = 'RATE_LIMIT',          // Too many requests (429)
  PROVIDER_ERROR = 'PROVIDER_ERROR',   // External API failure (502)
  CALCULATION_ERROR = 'CALCULATION',   // AQI calc issues (500)
  DATABASE_ERROR = 'DATABASE',         // DB errors (500)
  INTERNAL_ERROR = 'INTERNAL'          // Unknown errors (500)
}
```

### 6.2 Error Response Format

```typescript
interface ErrorResponse {
  error: {
    category: ErrorCategory;
    message: string;              // User-friendly message
    code: string;                 // Machine-readable code
    timestamp: string;            // ISO 8601
    requestId?: string;           // For support/debugging
    details?: Record<string, any>; // Additional context (no sensitive data)
  }
}
```

### 6.3 Error Handling Flow

```
Error Occurs
│
▼
┌────────────────────────────────────────┐
│  Error Logger                          │
│  - Log to monitoring system            │
│  - Include requestId, stack trace      │
│  - Sanitize before logging             │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Error Classifier                      │
│  - Map to ErrorCategory                │
│  - Determine HTTP status code          │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Error Sanitizer                       │
│  - Remove sensitive data               │
│  - Remove stack traces                 │
│  - Generate user-friendly message      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Error Response                        │
│  - Return ErrorResponse JSON           │
│  - Include recovery suggestions        │
└────────────────────────────────────────┘
```

**Rules:**
- ❌ NEVER expose stack traces to clients
- ❌ NEVER expose internal paths or configuration
- ❌ NEVER expose database schema details
- ✅ Log detailed errors server-side
- ✅ Return actionable messages to users

---

## 7. Testing Architecture

### 7.1 Testing Pyramid

```
                    ▲
                   / \
                  /   \
                 /     \
                / E2E   \          ~ 10% of tests
               /---------\         (Critical user journeys)
              /           \
             / Integration \       ~ 20% of tests
            /---------------\      (API contracts, DB, Providers)
           /                 \
          /   Unit Tests      \   ~ 70% of tests
         /---------------------\  (Domain logic, calculations, utilities)
```

### 7.2 Test Coverage Requirements

| Layer | Coverage Target | Tool |
|-------|----------------|------|
| Domain (AQI Engine) | 95%+ | Vitest |
| Application Services | 80%+ | Vitest |
| API Routes | 75%+ | Vitest + Supertest |
| React Components | 70%+ | React Testing Library |
| E2E Critical Paths | 100% | Playwright |

### 7.3 Test Categories

**Unit Tests:**
- AQI calculation engine (CPCB methodology)
- Pollutant sub-index calculations
- Unit conversions
- Data validation functions
- Utility functions

**Integration Tests:**
- API route handlers with mocked services
- Database operations
- Provider adapter integration (with mocked external APIs)
- Cache behavior

**E2E Tests:**
1. View dashboard with current AQI
2. Search and select location
3. Ask AI assistant question and receive grounded response
4. View historical charts
5. Compare two locations

**Security Tests:**
- Input validation (SQL injection attempts)
- XSS prevention
- Rate limiting enforcement
- Authentication/authorization (if implemented)
- AI prompt injection resistance

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌────────────────────────────────────────────────────────┐
│                  CDN / Edge Network                     │
│              (Static Assets, Images)                    │
└────────────────┬───────────────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────────────┐
│            Next.js Application                          │
│      (Vercel / AWS / Docker Container)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Frontend (SSR + Client Components)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes (Serverless Functions or Node)       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────────────┐
│PostgreSQL│ │AI APIs │ │ Data Providers │
│ Database │ │(OpenAI)│ │ (CPCB, OpenAQ) │
└──────────┘ └────────┘ └────────────────┘
```

### 8.2 Hosting Recommendations

**Option 1: Vercel (Recommended for MVP)**
- ✅ Zero-config Next.js deployment
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ Environment variable management
- ⚠️ Database: External PostgreSQL (Supabase, Neon, AWS RDS)

**Option 2: AWS**
- Next.js on AWS Amplify or App Runner
- PostgreSQL on RDS
- CloudFront CDN
- More control, more complexity

**Option 3: Docker + Cloud VM**
- Full control
- Docker Compose for app + PostgreSQL
- Requires DevOps expertise
- Cost-effective for stable workloads

### 8.3 Environment Strategy

| Environment | Purpose | Database | AI Provider | Data Providers |
|-------------|---------|----------|-------------|----------------|
| Development | Local dev | Docker PostgreSQL | Dev API key (low quota) | Dev/test endpoints |
| Staging | Pre-production testing | Staging DB | Staging API key | Real endpoints |
| Production | Live users | Production DB | Production API key (quota monitoring) | Real endpoints |

---

## 9. Monitoring and Observability

### 9.1 Logging Strategy

**Log Levels:**
- **ERROR**: Failures requiring immediate attention
- **WARN**: Recoverable issues (provider timeout, cache miss)
- **INFO**: Important state changes (AQI calculated, AI query)
- **DEBUG**: Detailed information (dev only)

**Structured Logging:**
```typescript
logger.info('AQI calculated', {
  location: 'Delhi',
  aqi: 287,
  category: 'Poor',
  dominantPollutant: 'PM2.5',
  dataSource: 'CPCB',
  calculationTime: '45ms',
  requestId: 'req_abc123'
});
```

### 9.2 Metrics to Monitor

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (errors/minute)
- Cache hit rate (%)

**Business Metrics:**
- AQI calculations per hour
- AI queries per hour
- Locations queried
- Data provider call distribution

**Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Database connection pool
- Database query time

**External Dependency Metrics:**
- Provider API response time
- Provider error rate
- AI API response time
- AI token usage

### 9.3 Alerting Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | >1% | Page on-call |
| API response time | p95 >5s | Investigate |
| Database connections | >80% pool | Scale up |
| AI provider errors | >10% | Failover/disable AI |
| Data provider timeout | >50% | Switch to fallback provider |

---

## 10. Scalability Considerations

### 10.1 Current Architecture Limits

**Estimated Capacity (MVP):**
- **Concurrent Users**: 100-500
- **Requests/Second**: 50-100
- **Database Size**: <10 GB (historical data for 1 year)
- **AI Queries/Hour**: 100-500 (rate limited)

### 10.2 Scaling Strategies

**Vertical Scaling (First Step):**
- Increase server resources (CPU, RAM)
- Increase database instance size
- Relatively simple, limited ceiling

**Horizontal Scaling (Future):**
- Stateless API design enables multiple instances
- Load balancer distributes traffic
- Database read replicas for read-heavy workloads
- Shared cache (Redis) across instances

**Caching Improvements:**
- Add Redis for distributed caching
- CDN for API responses (location metadata)
- Browser caching for static AQI category content

**Database Optimization:**
- Partition large tables (pollutant_observations by month)
- Archive old data (>1 year) to cold storage
- Database connection pooling (Prisma already supports)

### 10.3 Cost Optimization

**Data Provider API Costs:**
- Cache aggressively (respect data freshness)
- Use bulk historical data APIs where available (xKDR)
- Implement provider failover to free tiers

**AI API Costs:**
- Rate limit per user (5 queries/minute)
- Optimize prompts (reduce tokens)
- Cache common questions (semantic similarity)
- Implement daily/monthly user quotas

**Database Costs:**
- Implement data retention policies (keep 1 year, archive older)
- Compress historical data
- Use cost-effective managed database services

---

## 11. Future Architecture Evolution

### 11.1 Potential Enhancements

**Phase 2 (3-6 months):**
- User authentication and preferences
- Personalized AQI alerts
- Multiple AQI standard support (US EPA, EU CAQI)
- Mobile-optimized PWA

**Phase 3 (6-12 months):**
- Real-time data ingestion pipeline (Kafka, streaming)
- Machine learning-based forecasting
- Heatmap visualizations
- IoT sensor integration

**Phase 4 (12+ months):**
- Microservices extraction (if scaling requires)
- Multi-region deployment
- Advanced geospatial analysis
- Public API for third-party developers

### 11.2 Architectural Evolution Triggers

**When to Extract Microservices:**
- AI service: if requiring independent scaling, GPU instances
- Data ingestion: if real-time streaming requirements emerge
- Calculation engine: if shared across multiple applications

**When to Add Message Queue:**
- Asynchronous data processing needs
- Batch operations (daily reports, alerts)
- Decoupling data ingestion from API serving

**When to Add GraphQL:**
- Complex client data requirements
- Need for flexible querying
- Third-party API consumers

---

## 12. Technology Justification

### 12.1 Next.js + React

**Chosen:** Next.js 15 with App Router, React 19

**Rationale:**
- ✅ Server-side rendering for performance and SEO
- ✅ API routes eliminate need for separate backend
- ✅ Built-in optimization (images, fonts, code splitting)
- ✅ Strong TypeScript support
- ✅ Large ecosystem and community
- ✅ Vercel deployment simplicity
- ✅ App Router provides modern patterns (Server Components, Streaming)

**Alternatives Considered:**
- **Remix**: Similar benefits, smaller ecosystem
- **SvelteKit**: Performance benefits, smaller community
- **Separate React + Express**: More complexity, no clear benefit

---

### 12.2 PostgreSQL + Prisma

**Chosen:** PostgreSQL 14+, Prisma ORM

**Rationale:**
- ✅ Relational data model fits air quality observations well
- ✅ Excellent time-series data support
- ✅ Strong ACID guarantees for data integrity
- ✅ Geospatial support (PostGIS if needed)
- ✅ Prisma provides type-safe queries
- ✅ Automatic migrations
- ✅ Excellent TypeScript integration

**Alternatives Considered:**
- **MongoDB**: Less suitable for relational monitoring station data
- **TimescaleDB**: Overkill for current scale, PostgreSQL sufficient
- **MySQL**: Fewer advanced features, less geospatial support

---

### 12.3 TypeScript

**Chosen:** TypeScript with strict mode

**Rationale:**
- ✅ Catch errors at compile time
- ✅ Better IDE support and autocomplete
- ✅ Self-documenting code (types as documentation)
- ✅ Refactoring confidence
- ✅ Industry standard for serious applications

**Alternative:** JavaScript - rejected due to lack of type safety in data-heavy application

---

### 12.4 Tailwind CSS

**Chosen:** Tailwind CSS + Radix UI + shadcn/ui

**Rationale:**
- ✅ Rapid development without leaving HTML
- ✅ Consistent design system
- ✅ Small bundle size (only used classes)
- ✅ Excellent responsive design utilities
- ✅ No CSS naming conflicts
- ✅ Radix provides accessible primitives
- ✅ shadcn/ui provides ready-to-use components

**Alternatives Considered:**
- **CSS Modules**: More verbose, less rapid
- **Styled Components**: Runtime overhead, larger bundle
- **Material UI**: Opinionated design, harder to customize

---

## 13. Architectural Decisions

### ADR-001: Monolith vs Microservices

**Decision:** Modular monolith

**Context:** Initial application with unknown scale and evolving requirements

**Rationale:**
- Simpler deployment and operations
- Faster development velocity
- No premature optimization
- Can extract services later if needed

**Consequences:**
- All code in single repository
- Single deployment artifact
- Need clear module boundaries to enable future extraction

---

### ADR-002: Server-Side AI Context Construction

**Decision:** Server retrieves all environmental data for AI context; frontend sends only user question

**Context:** Need to prevent AI from fabricating environmental measurements

**Rationale:**
- Frontend cannot be trusted to provide authoritative data
- Server has access to real-time trusted data sources
- Prevents malicious users from submitting false measurements
- Enables consistent AI responses across users

**Consequences:**
- Extra server-side queries per AI request
- Need efficient caching strategy
- Clear separation of concerns

---

### ADR-003: Provider Abstraction Layer

**Decision:** Create independent adapters for each data provider

**Context:** Multiple data sources with varying reliability and formats

**Rationale:**
- Enables provider failover
- Normalizes inconsistent data formats
- Supports future provider addition/removal
- Testability through mocking

**Consequences:**
- More upfront abstraction code
- Need consistent normalization logic
- Clear provider interface contract required

---

### ADR-004: CPCB AQI Standard for India

**Decision:** Implement CPCB National Air Quality Index as primary standard

**Context:** India-focused application with official government methodology

**Rationale:**
- Official government standard for India
- Most relevant to target users
- Clear documentation of methodology
- Consistent with official reporting

**Consequences:**
- Need separate implementation for other standards (future)
- Must follow CPCB breakpoints exactly
- Requires thorough testing against official examples

---

### ADR-005: No User Authentication in V1

**Decision:** No user accounts or authentication in initial version

**Context:** MVP focused on core air quality features

**Rationale:**
- Reduces scope and complexity
- Faster time to market
- No privacy concerns from storing user data
- Sufficient for core value proposition

**Consequences:**
- No personalized alerts or preferences
- Rate limiting by IP instead of user
- No history tracking per user
- Can add authentication later without breaking core features

---

## 14. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 17, 2026 | Development Team | Initial architecture document |

---

**END OF ARCHITECTURE DOCUMENT**
