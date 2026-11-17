# Urban Air Quality Assistant

**An intelligent air quality monitoring and assistance platform for India**

---

## Project Status

✅ **Phase 1 Complete: Technical Blueprint**  
✅ **Phase 2 Complete: Project Setup & Dependencies**  
✅ **Phase 3 Complete: Application Foundation & UI System**  
✅ **Phase 4 Complete: Environmental Data Layer & Providers**  
✅ **Phase 5 Complete: CPCB AQI Engine & Connected Dashboard**  
✅ **Phase 6 Complete: Dashboard UI & Current AQI Display**  
📋 **Next: Phase 7 - Historical Data & Trends Visualization**

---

## Overview

The Urban Air Quality Assistant is a full-stack web application that transforms technical environmental measurements into actionable, accessible information for Indian citizens. Built with security-first architecture and grounded AI responses, the platform helps people understand air quality, interpret pollution data, and make informed daily decisions.

### Core Features

- **Real-Time Air Quality Monitoring** with CPCB-compliant AQI calculations
- **AI-Powered Assistant** providing contextual, grounded environmental insights
- **Historical Analysis** with interactive charts and trend visualization
- **Location Intelligence** for city comparisons and nearby station discovery
- **Weather Context** integration for comprehensive environmental understanding

---

## Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Next.js Route Handlers, Node.js, Zod validation
- **Database:** PostgreSQL with Prisma ORM
- **AI Integration:** Provider-independent LLM integration (OpenAI/Anthropic)
- **Testing:** Vitest, React Testing Library, Playwright
- **Package Manager:** pnpm

---

## Architecture Highlights

- **Modular Full-Stack Monolith** with clear layer separation
- **Provider Abstraction** for replaceable data sources
- **Security-First Design** with comprehensive input validation
- **Deterministic AQI Engine** following official CPCB methodology
- **Server-Side AI Context** construction (no client-side data fabrication)

---

## Documentation

Comprehensive technical documentation available in `/docs`:

- **[PRD.md](docs/PRD.md)** - Product Requirements Document
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System Architecture & Design
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database Design & Schema
- **[API_CONTRACTS.md](docs/API_CONTRACTS.md)** - REST API Specifications
- **[DATA_SOURCES.md](docs/DATA_SOURCES.md)** - Data Provider Evaluation
- **[IMPLEMENTATION_ROADMAP.md](docs/IMPLEMENTATION_ROADMAP.md)** - Development Plan

---

## Quick Start

### Prerequisites

- **Node.js 20+** (LTS) - Currently using v22.20.0
- **pnpm 9+** - Package manager (v12.21.0 installed)
- **PostgreSQL 14+** - Database
- **Docker** (optional) - For local PostgreSQL via Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Urban-Air-Quality-Assistant
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

4. **Start PostgreSQL database** (using Docker)
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Seed the database** (optional - adds sample stations)
   ```bash
   pnpm db:seed
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
pnpm typecheck     # Check TypeScript types
pnpm test          # Run unit tests
pnpm test:e2e      # Run end-to-end tests
pnpm format        # Format code with Prettier
pnpm db:migrate    # Run database migrations
pnpm db:studio     # Open Prisma Studio
pnpm db:seed       # Seed database with sample data
```

### Environment Variables

Required environment variables (see `.env.example` for details):

- `DATABASE_URL` - PostgreSQL connection string
- `DATA_GOV_IN_API_KEY` - India government data API key
- `OPENWEATHER_API_KEY` - Weather data provider key
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider key
- `AI_PROVIDER` - Selected AI provider ("openai" or "anthropic")

---

## Project Structure

```
urban-air-quality-assistant/
├── docs/                 # Technical documentation
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific modules
│   ├── server/         # Backend services and providers
│   └── lib/            # Utilities and helpers
├── tests/              # Test suites
└── scripts/            # Build and utility scripts
```

---

## Development Principles

1. **Security First** - Every feature designed with security in mind
2. **Test-Driven** - Critical components developed with comprehensive tests
3. **Incremental Delivery** - Working software at end of each phase
4. **Documentation Driven** - Architecture documented before implementation
5. **Quality Over Speed** - Verifiable engineering over rapid prototyping

---

## Project Goals

### Primary Objectives

✅ Deliver production-grade air quality monitoring platform  
✅ Implement CPCB-compliant AQI calculations (validated)  
✅ Build AI assistant with grounded, trustworthy responses  
✅ Ensure security audit passes with 0 critical issues  
✅ Achieve WCAG 2.2 AA accessibility compliance  

### Success Criteria

- Real-time AQI data from authoritative Indian sources
- AI responses never fabricate environmental measurements
- >70% test coverage, >95% for AQI calculation engine
- Responsive design across desktop, tablet, mobile
- Comprehensive documentation for deployment

---

## License

*To be determined*

---

## Contact & Contribution

*Project developed as part of an AI coding challenge.*

---

**Built with engineering rigor. Designed for impact.**
AI-powered urban air quality monitoring, analysis and intelligent environmental assistance platform.
