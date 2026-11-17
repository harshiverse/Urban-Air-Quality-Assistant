# Implementation Roadmap
# Urban Air Quality Assistant

**Version:** 1.0  
**Date:** November 17, 2026  
**Project Start:** November 17, 2026  
**Target Completion:** TBD based on development velocity  

---

## Executive Summary

This document provides a phased implementation plan for the Urban Air Quality Assistant. The approach emphasizes:
- **Incremental development** with continuous verification
- **Security-first** implementation from day one
- **Test-driven development** for critical components
- **Working software** at the end of each phase

---

## Phase 0: Challenge Requirement Analysis ✅ COMPLETED

**Duration:** Day 1  
**Status:** ✅ **COMPLETED**

### Deliverables Completed:
- [x] Product Requirements Document (PRD.md)
- [x] System Architecture (ARCHITECTURE.md)
- [x] Database Schema Design (DATABASE_SCHEMA.md)
- [x] API Contracts (API_CONTRACTS.md)
- [x] Data Sources Evaluation (DATA_SOURCES.md)
- [x] Implementation Roadmap (this document)

### Key Decisions Made:
1. **Technology Stack Confirmed:**
   - Next.js 15 + React 19 + TypeScript
   - PostgreSQL + Prisma ORM
   - pnpm package manager
   - Tailwind CSS + Radix UI

2. **Primary Data Sources:**
   - data.gov.in API (Tier 1)
   - OpenAQ (Tier 2 fallback)
   - OpenWeatherMap (weather context)

3. **Architecture Pattern:**
   - Modular monolith with clear layer separation
   - Provider abstraction for data sources
   - Server-side AI context construction

### Next Steps:
→ **Proceed to Phase 1: Project Setup**

---

## Phase 1: Project Setup & Foundation

**Duration:** 2-3 days  
**Status:** 🔄 **NEXT UP**

### Objectives:
- Initialize Next.js project with proper configuration
- Set up development tooling (TypeScript, ESLint, Prettier)
- Configure database with Docker Compose
- Establish testing infrastructure
- Create basic project structure
- Verify clean build

### Tasks:

#### 1.1 Project Initialization
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Install and configure pnpm
- [ ] Set up Git repository with proper .gitignore
- [ ] Configure Node.js version (.nvmrc)
- [ ] Create initial README with setup instructions

#### 1.2 Development Tooling
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint with Next.js rules
- [ ] Configure Prettier with project code style
- [ ] Set up Vitest for unit testing
- [ ] Configure Playwright for E2E testing
- [ ] Add pre-commit hooks (Husky) for linting

#### 1.3 Database Infrastructure
- [ ] Create Docker Compose for PostgreSQL
- [ ] Initialize Prisma
- [ ] Define initial database schema
- [ ] Create first migration
- [ ] Set up database seeding scripts
- [ ] Test database connection

#### 1.4 Environment Configuration
- [ ] Create .env.example with all required variables
- [ ] Implement environment validation (lib/env.ts)
- [ ] Set up local development .env (not committed)
- [ ] Document environment setup process

#### 1.5 Project Structure
- [ ] Create folder structure per ARCHITECTURE.md
- [ ] Set up path aliases in tsconfig.json (@/components, @/lib, etc.)
- [ ] Create initial barrel exports
- [ ] Add placeholder README files in key directories

#### 1.6 Verification
- [ ] Run `pnpm install` successfully
- [ ] Run `pnpm dev` and access localhost:3000
- [ ] Run `pnpm lint` with no errors
- [ ] Run `pnpm typecheck` with no errors
- [ ] Run `pnpm test` (empty test suite passes)
- [ ] Run `pnpm build` successfully

### Acceptance Criteria:
- ✅ Clean Next.js application starts on localhost:3000
- ✅ PostgreSQL database accessible via Prisma
- ✅ All linting and type-checking passes
- ✅ Project builds successfully
- ✅ README documents setup process clearly

### Estimated Effort: 2-3 days

---

## Phase 2: UI Foundation & Design System

**Duration:** 3-4 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Establish design system and UI components
- Create responsive layout structure
- Implement navigation
- Build reusable UI primitives
- Set up Tailwind CSS theming

### Tasks:

#### 2.1 Design System Setup
- [ ] Configure Tailwind CSS with custom theme
- [ ] Install Radix UI primitives
- [ ] Set up shadcn/ui components
- [ ] Define color palette for AQI categories
- [ ] Create typography scale
- [ ] Define spacing system

#### 2.2 Layout Components
- [ ] Create root layout (app/layout.tsx)
- [ ] Implement header with navigation
- [ ] Create footer with attribution
- [ ] Build responsive container components
- [ ] Add loading.tsx and error.tsx templates

#### 2.3 Reusable UI Components
- [ ] Button variants
- [ ] Card components
- [ ] Badge components (AQI categories)
- [ ] Alert/notification components
- [ ] Loading spinners and skeletons
- [ ] Error boundary components

#### 2.4 AQI-Specific Components
- [ ] AQI indicator/gauge component
- [ ] Pollutant card component
- [ ] Data quality indicator
- [ ] Timestamp display component

#### 2.5 Accessibility
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels
- [ ] Ensure focus states visible
- [ ] Test with screen reader
- [ ] Verify color contrast (WCAG AA)

### Acceptance Criteria:
- ✅ All components render correctly desktop/mobile
- ✅ Navigation functional across pages
- ✅ Consistent spacing and typography
- ✅ Accessible via keyboard
- ✅ No console errors or warnings

### Estimated Effort: 3-4 days

---

## Phase 3: Domain Layer - AQI Calculation Engine

**Duration:** 4-5 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Implement CPCB AQI calculation methodology
- Create pollutant sub-index calculators
- Build category mapping logic
- Achieve 95%+ test coverage
- Validate against CPCB reference examples

### Tasks:

#### 3.1 Core Domain Models
- [ ] Define TypeScript types for pollutants
- [ ] Create AQI result types
- [ ] Define pollutant measurement types
- [ ] Create category enums

#### 3.2 CPCB Breakpoint Configuration
- [ ] Implement PM2.5 breakpoint table
- [ ] Implement PM10 breakpoint table
- [ ] Implement NO2 breakpoint table
- [ ] Implement SO2 breakpoint table
- [ ] Implement CO breakpoint table
- [ ] Implement O3 breakpoint table
- [ ] Implement NH3 breakpoint table
- [ ] Implement Pb breakpoint table

#### 3.3 Calculation Functions
- [ ] `calculateSubIndex(pollutant, concentration)` - Core sub-index calculation
- [ ] `calculateAqi(measurements)` - Overall AQI from measurements
- [ ] `determineDominantPollutant(subIndices)` - Identify dominant pollutant
- [ ] `mapAqiToCategory(aqi)` - Map AQI value to category
- [ ] `validateDataSufficiency(measurements)` - Check minimum data requirements

#### 3.4 Unit Conversion Utilities
- [ ] Convert µg/m³ ↔ mg/m³
- [ ] Handle different averaging periods
- [ ] Validate unit consistency

#### 3.5 Comprehensive Testing
- [ ] Test each pollutant breakpoint boundary
- [ ] Test category transitions (50, 100, 200, 300, 400, 500)
- [ ] Test missing pollutant scenarios
- [ ] Test insufficient data scenarios
- [ ] Test against official CPCB examples
- [ ] Property-based testing for edge cases
- [ ] Performance testing for calculation speed

#### 3.6 Documentation
- [ ] Create AQI_METHODOLOGY.md with detailed explanations
- [ ] Document all breakpoint tables
- [ ] Explain calculation steps with examples
- [ ] Document known limitations

### Acceptance Criteria:
- ✅ All calculations match CPCB methodology exactly
- ✅ 95%+ code coverage on calculation functions
- ✅ All category boundaries tested
- ✅ Deterministic results (same input → same output)
- ✅ Performance <1ms for typical calculation
- ✅ Zero TypeScript errors

### Estimated Effort: 4-5 days

---

## Phase 4: Data Integration Layer

**Duration:** 5-7 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Implement provider abstraction interface
- Create adapters for data sources
- Build data normalization pipeline
- Implement caching strategy
- Add error handling and retry logic

### Tasks:

#### 4.1 Provider Interface Definition
- [ ] Create AirQualityProvider interface
- [ ] Define normalized data models
- [ ] Create LocationIdentifier types
- [ ] Define TimeRange types

#### 4.2 data.gov.in Adapter
- [ ] Implement authentication (API key)
- [ ] Create `getCurrentAirQuality()` method
- [ ] Create `getHistoricalData()` method
- [ ] Create `searchLocations()` method
- [ ] Implement data normalization
- [ ] Add error handling
- [ ] Add request timeout
- [ ] Add retry logic (exponential backoff)

#### 4.3 OpenAQ Adapter (Fallback)
- [ ] Implement OpenAQ API client
- [ ] Normalize OpenAQ data format to internal model
- [ ] Handle pagination
- [ ] Add error handling

#### 4.4 Weather Provider Adapter
- [ ] Implement OpenWeatherMap adapter
- [ ] Fetch current weather
- [ ] Normalize weather data
- [ ] Add error handling

#### 4.5 Caching Layer
- [ ] Implement in-memory cache (Map or node-cache)
- [ ] Add TTL support
- [ ] Implement cache key generation
- [ ] Add cache hit/miss metrics
- [ ] Create cache warming strategy

#### 4.6 Provider Failover Logic
- [ ] Implement provider priority system
- [ ] Add automatic failover on provider error
- [ ] Log provider failures
- [ ] Return cached data when all providers fail

#### 4.7 Data Quality Validation
- [ ] Validate pollutant concentration ranges
- [ ] Validate timestamps
- [ ] Flag suspicious data
- [ ] Preserve data provenance

#### 4.8 Integration Testing
- [ ] Test each adapter independently
- [ ] Test failover scenarios
- [ ] Test caching behavior
- [ ] Test with mock data
- [ ] Test rate limit handling

### Acceptance Criteria:
- ✅ Successfully fetch real data from data.gov.in
- ✅ Failover to OpenAQ when primary fails
- ✅ All provider responses normalized to common format
- ✅ Caching reduces redundant API calls
- ✅ Graceful error handling (no crashes)
- ✅ Integration tests passing

### Estimated Effort: 5-7 days

---

## Phase 5: API Layer & Services

**Duration:** 4-5 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Implement REST API endpoints
- Create service layer orchestration
- Add request validation
- Implement rate limiting
- Add security headers

### Tasks:

#### 5.1 Service Layer
- [ ] Create AirQualityService
- [ ] Create LocationService
- [ ] Create WeatherService (if weather integrated)
- [ ] Implement service error handling
- [ ] Add service-level caching

#### 5.2 API Route Handlers
- [ ] `GET /api/v1/air-quality/current`
- [ ] `GET /api/v1/air-quality/history`
- [ ] `GET /api/v1/locations/search`
- [ ] `GET /api/health` (health check)

#### 5.3 Request Validation
- [ ] Implement Zod schemas per API_CONTRACTS.md
- [ ] Add validation middleware
- [ ] Return proper validation errors

#### 5.4 Rate Limiting
- [ ] Implement IP-based rate limiting
- [ ] Configure limits per endpoint
- [ ] Add rate limit headers
- [ ] Return 429 status when exceeded

#### 5.5 Security
- [ ] Add security headers (CSP, X-Content-Type-Options, etc.)
- [ ] Configure CORS
- [ ] Sanitize error responses
- [ ] Add request logging
- [ ] Generate request IDs

#### 5.6 Error Handling
- [ ] Create consistent error response format
- [ ] Map internal errors to user-friendly messages
- [ ] Log errors server-side
- [ ] Never expose stack traces to client

#### 5.7 API Testing
- [ ] Integration tests for each endpoint
- [ ] Test validation error scenarios
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Load testing (basic)

### Acceptance Criteria:
- ✅ All API endpoints functional
- ✅ Proper HTTP status codes returned
- ✅ Request validation working
- ✅ Rate limiting enforced
- ✅ Security headers configured
- ✅ API tests passing

### Estimated Effort: 4-5 days

---

## Phase 6: Dashboard UI & Current AQI Display

**Duration:** 5-6 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Build main dashboard page
- Display current AQI with visual indicators
- Show pollutant breakdown
- Implement location selection
- Connect frontend to API

### Tasks:

#### 6.1 Dashboard Page
- [ ] Create `app/(dashboard)/page.tsx`
- [ ] Implement data fetching (Server Components or client hooks)
- [ ] Add loading states
- [ ] Add error states
- [ ] Implement auto-refresh (optional)

#### 6.2 AQI Display Components
- [ ] Large AQI indicator (number + category)
- [ ] AQI gauge/dial visualization
- [ ] Category badge with color
- [ ] Dominant pollutant highlight
- [ ] Data timestamp and source attribution

#### 6.3 Pollutant Cards
- [ ] PM2.5 card
- [ ] PM10 card
- [ ] NO2, SO2, CO, O3 cards
- [ ] Show concentration + unit
- [ ] Show sub-index
- [ ] Color-code by category
- [ ] Add pollutant descriptions

#### 6.4 Location Selector
- [ ] Search input with autocomplete
- [ ] Call `/api/v1/locations/search`
- [ ] Display search results
- [ ] Handle location selection
- [ ] Update dashboard with new location

#### 6.5 Data Quality Indicators
- [ ] Display "Live" / "Recent" / "Stale" indicator
- [ ] Show measurement timestamp
- [ ] Show data source
- [ ] Handle unavailable data gracefully

#### 6.6 Health Recommendations
- [ ] Display category-specific recommendations
- [ ] Show sensitive group guidance
- [ ] Add contextual advice

#### 6.7 Responsive Design
- [ ] Desktop layout (1280px+)
- [ ] Tablet layout (768px-1279px)
- [ ] Mobile layout (<768px)
- [ ] Test on multiple devices

### Acceptance Criteria:
- ✅ Dashboard displays real AQI data
- ✅ Location search functional
- ✅ All pollutants displayed correctly
- ✅ Responsive on desktop/tablet/mobile
- ✅ Loading and error states work
- ✅ Data refreshes correctly

### Estimated Effort: 5-6 days

---

## Phase 7: Historical Analysis & Charts

**Duration:** 4-5 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Build historical data view
- Implement time-series charts
- Add date range selection
- Support multiple chart types

### Tasks:

#### 7.1 History Page
- [ ] Create `app/(dashboard)/history/page.tsx`
- [ ] Add date range picker
- [ ] Add pollutant selector
- [ ] Add interval selector (hourly/daily/weekly)

#### 7.2 Chart Implementation (Recharts)
- [ ] Line chart for AQI over time
- [ ] Multi-line chart for multiple pollutants
- [ ] Bar chart for daily averages
- [ ] Proper axis labels and units
- [ ] Legend
- [ ] Tooltips with detailed info
- [ ] Responsive chart sizing

#### 7.3 Data Visualization Features
- [ ] Color-code by AQI category
- [ ] Highlight dangerous levels
- [ ] Show missing data gaps (don't fabricate)
- [ ] Add trend indicators
- [ ] Summary statistics (avg, min, max)

#### 7.4 Chart Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support (data tables)
- [ ] Alt text for chart images
- [ ] High contrast mode support

#### 7.5 Export Functionality
- [ ] Export chart as PNG
- [ ] Export data as CSV
- [ ] Share chart (copy link)

### Acceptance Criteria:
- ✅ Charts display historical data correctly
- ✅ Date range filtering works
- ✅ Missing data handled properly (gaps, not fabrication)
- ✅ Charts responsive
- ✅ Export functions work
- ✅ Accessible via keyboard

### Estimated Effort: 4-5 days

---

## Phase 8: AI Assistant Integration

**Duration:** 6-7 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Integrate LLM provider (OpenAI/Anthropic)
- Implement AI assistant API endpoint
- Build chat UI
- Ensure AI responses grounded in real data
- Add security measures

### Tasks:

#### 8.1 AI Provider Setup
- [ ] Choose LLM provider (OpenAI GPT-4 or Anthropic Claude)
- [ ] Register for API key
- [ ] Install official SDK
- [ ] Create AIProvider interface
- [ ] Implement provider adapter

#### 8.2 AI Assistant Service
- [ ] Create AIAssistantService
- [ ] Implement context retrieval from AirQualityService
- [ ] Build prompt construction logic
- [ ] Add conversation context management
- [ ] Implement response validation

#### 8.3 AI API Endpoint
- [ ] Create `POST /api/v1/assistant`
- [ ] Validate request (Zod schema)
- [ ] Retrieve trusted environmental context
- [ ] Call AI provider
- [ ] Validate AI response
- [ ] Return structured response

#### 8.4 Security for AI
- [ ] Keep API key server-side only
- [ ] Sanitize user input
- [ ] Implement prompt injection protection
- [ ] Rate limit AI endpoint (10 req/min/IP)
- [ ] Validate AI output (no fabricated measurements)
- [ ] Add input/output length limits

#### 8.5 Chat UI
- [ ] Create `app/(dashboard)/assistant/page.tsx`
- [ ] Build chat interface
- [ ] Message input with validation
- [ ] Display conversation history
- [ ] Show loading state during AI response
- [ ] Display context used (AQI, pollutants, weather)
- [ ] Handle errors gracefully

#### 8.6 AI Response Quality
- [ ] Test AI with various questions
- [ ] Verify AI uses provided context (not invented data)
- [ ] Test AI refuses to invent data when unavailable
- [ ] Test AI doesn't make medical diagnoses
- [ ] Test AI explains uncertainty

#### 8.7 Testing
- [ ] Unit tests for prompt construction
- [ ] Integration tests for AI service
- [ ] Security tests (prompt injection attempts)
- [ ] Validate AI doesn't fabricate measurements

### Acceptance Criteria:
- ✅ AI assistant functional and responds to questions
- ✅ AI responses grounded in real application data
- ✅ AI never fabricates measurements (tested)
- ✅ AI refuses to diagnose health conditions
- ✅ Chat UI functional and responsive
- ✅ Rate limiting enforced
- ✅ Graceful fallback when AI unavailable

### Estimated Effort: 6-7 days

---

## Phase 9: Location Features & Comparisons

**Duration:** 3-4 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Build location search and selection
- Implement location comparison view
- Add nearby station discovery
- Optional: basic map integration

### Tasks:

#### 9.1 Location Search Page
- [ ] Create `app/(dashboard)/locations/page.tsx`
- [ ] Implement search interface
- [ ] Display search results (cities + stations)
- [ ] Show station details (coordinates, active status)
- [ ] Navigate to station-specific dashboard

#### 9.2 Location Comparison
- [ ] Multi-select location picker
- [ ] Side-by-side AQI comparison
- [ ] Pollutant comparison table
- [ ] Historical trend comparison charts
- [ ] Export comparison data

#### 9.3 Nearby Stations (Optional)
- [ ] Request geolocation permission
- [ ] Find nearest monitoring stations
- [ ] Display distance from user
- [ ] Show map with station markers (basic)

#### 9.4 Station Details
- [ ] Station metadata display
- [ ] Station-specific AQI history
- [ ] Data availability status

### Acceptance Criteria:
- ✅ Location search works correctly
- ✅ Comparison view displays multiple locations
- ✅ Geolocation permission handled properly
- ✅ Nearby stations identified correctly

### Estimated Effort: 3-4 days

---

## Phase 10: Weather Integration & Context

**Duration:** 2-3 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Integrate weather data
- Display weather context on dashboard
- Correlate weather with AQI patterns
- Provide contextual insights

### Tasks:

#### 10.1 Weather Service
- [ ] Implement weather fetching in WeatherService
- [ ] Cache weather data (30-min TTL)
- [ ] Normalize weather data

#### 10.2 Weather Display
- [ ] Add weather widget to dashboard
- [ ] Show temperature, humidity, wind
- [ ] Display weather conditions
- [ ] Update weather with location change

#### 10.3 Weather-AQI Correlation
- [ ] Show weather alongside AQI trends
- [ ] Provide contextual insights (e.g., low wind may trap pollutants)
- [ ] Avoid unsupported causal claims

### Acceptance Criteria:
- ✅ Weather data displayed on dashboard
- ✅ Weather updates with location
- ✅ Weather context aids understanding
- ✅ No false causal claims

### Estimated Effort: 2-3 days

---

## Phase 11: Testing & Quality Assurance

**Duration:** 5-7 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Achieve comprehensive test coverage
- Perform security audit
- Conduct accessibility review
- Fix all critical and high-priority issues

### Tasks:

#### 11.1 Unit Testing
- [ ] Domain layer: 95%+ coverage
- [ ] Services: 80%+ coverage
- [ ] Utilities: 90%+ coverage
- [ ] Fix failing tests

#### 11.2 Integration Testing
- [ ] API endpoints: All tested
- [ ] Provider adapters: All tested
- [ ] Database operations: Tested
- [ ] Error scenarios: Tested

#### 11.3 End-to-End Testing (Playwright)
- [ ] User Journey 1: View dashboard with current AQI
- [ ] User Journey 2: Search and select location
- [ ] User Journey 3: Ask AI assistant question
- [ ] User Journey 4: View historical charts
- [ ] User Journey 5: Compare two locations
- [ ] Test on Chrome, Firefox, Safari

#### 11.4 Security Audit
- [ ] Run `pnpm audit` and fix vulnerabilities
- [ ] Secret scanning (no committed secrets)
- [ ] Input validation review
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Rate limit testing
- [ ] SQL injection testing (Prisma)
- [ ] AI prompt injection testing
- [ ] Security header verification

#### 11.5 Accessibility Review
- [ ] Keyboard navigation (all pages)
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Color contrast verification (WebAIM)
- [ ] ARIA labels review
- [ ] Focus management
- [ ] Lighthouse accessibility score >90

#### 11.6 Performance Testing
- [ ] Lighthouse performance score >85
- [ ] Page load time <3s (broadband)
- [ ] API response time <2s (p95)
- [ ] Database query optimization
- [ ] Bundle size optimization

#### 11.7 Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 11.8 Responsive Testing
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (iPad, Android tablets)
- [ ] Mobile (iPhone, Android phones)

### Acceptance Criteria:
- ✅ >70% overall test coverage
- ✅ All E2E tests passing
- ✅ Zero critical security issues
- ✅ Zero high-priority security issues (or documented)
- ✅ WCAG 2.2 AA compliance (target)
- ✅ Lighthouse scores: Performance >85, Accessibility >90
- ✅ All critical bugs fixed

### Estimated Effort: 5-7 days

---

## Phase 12: Documentation & Deployment Preparation

**Duration:** 3-4 days  
**Status:** ⏳ **PLANNED**

### Objectives:
- Complete all documentation
- Prepare deployment configuration
- Create deployment guide
- Write final security and test reports

### Tasks:

#### 12.1 Documentation Completion
- [ ] Finalize README.md with setup instructions
- [ ] Complete AQI_METHODOLOGY.md
- [ ] Write DEPLOYMENT.md
- [ ] Create SECURITY_REVIEW.md
- [ ] Write TEST_REPORT.md
- [ ] Document known limitations
- [ ] Create API usage examples

#### 12.2 Environment Configuration
- [ ] Document all required environment variables
- [ ] Update .env.example
- [ ] Create environment setup guide
- [ ] Document API key acquisition process

#### 12.3 Deployment Preparation
- [ ] Configure production build settings
- [ ] Set up database migrations for production
- [ ] Configure CDN for static assets
- [ ] Set up logging and monitoring
- [ ] Create health check endpoint documentation
- [ ] Write rollback procedures

#### 12.4 Docker Configuration (Optional)
- [ ] Create production Dockerfile
- [ ] Create docker-compose for production
- [ ] Document Docker deployment

#### 12.5 Final Verification
- [ ] Run production build locally
- [ ] Test production build thoroughly
- [ ] Verify environment variable validation
- [ ] Test database migrations
- [ ] Review all documentation for accuracy

### Acceptance Criteria:
- ✅ README clear and complete
- ✅ All technical docs finalized
- ✅ Production build successful
- ✅ Deployment guide written
- ✅ Known limitations documented

### Estimated Effort: 3-4 days

---

## Total Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0: Requirements & Planning | 1 day | ✅ Complete |
| Phase 1: Project Setup | 2-3 days | 🔄 Next |
| Phase 2: UI Foundation | 3-4 days | ⏳ Planned |
| Phase 3: AQI Engine | 4-5 days | ⏳ Planned |
| Phase 4: Data Integration | 5-7 days | ⏳ Planned |
| Phase 5: API Layer | 4-5 days | ⏳ Planned |
| Phase 6: Dashboard UI | 5-6 days | ⏳ Planned |
| Phase 7: Historical Charts | 4-5 days | ⏳ Planned |
| Phase 8: AI Assistant | 6-7 days | ⏳ Planned |
| Phase 9: Location Features | 3-4 days | ⏳ Planned |
| Phase 10: Weather Integration | 2-3 days | ⏳ Planned |
| Phase 11: Testing & QA | 5-7 days | ⏳ Planned |
| Phase 12: Documentation | 3-4 days | ⏳ Planned |
| **Total Estimated** | **47-60 days** | |

**Note:** This is a sequential estimate. With parallel workstreams and efficient execution, actual calendar time may be shorter.

---

## Risk Management

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data provider API unavailable/undocumented | High | Use OpenAQ as fallback; implement multiple providers |
| AI provider rate limits/costs | Medium | Strict rate limiting; optimize prompts; caching |
| CPCB methodology interpretation unclear | High | Cross-reference multiple sources; test against official examples |
| Database performance at scale | Medium | Proper indexing; query optimization; partitioning strategy |

### Dependencies

**External Dependencies:**
- data.gov.in API key approval
- OpenWeatherMap API key (instant)
- LLM provider API key (instant)
- PostgreSQL hosting (local for dev, managed for prod)

---

## Success Metrics

### Technical Quality Metrics
- ✅ TypeScript strict mode: 0 errors
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Test coverage: >70% overall, >95% for AQI engine
- ✅ Lighthouse performance: >85
- ✅ Lighthouse accessibility: >90
- ✅ Build time: <60 seconds
- ✅ API response time (p95): <2 seconds

### Functional Completeness
- ✅ All P0 features implemented and tested
- ✅ AI responses grounded in real data (verified)
- ✅ AQI calculations match CPCB methodology (tested)
- ✅ Security audit: 0 critical, 0 high issues
- ✅ Cross-browser compatibility verified
- ✅ Mobile responsive design functional

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 17, 2026 | Development Team | Initial roadmap |

---

**END OF IMPLEMENTATION ROADMAP**
