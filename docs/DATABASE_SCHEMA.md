# Database Schema Design
# Urban Air Quality Assistant

**Version:** 1.0  
**Date:** November 17, 2026  
**Database:** PostgreSQL 14+  
**ORM:** Prisma  

---

## 1. Schema Overview

The database schema is designed to support:
- Monitoring station metadata
- Time-series pollutant observations
- Historical air quality snapshots
- Data quality tracking
- Efficient querying for current and historical data

### 1.1 Entity Relationship Diagram

```
┌──────────────────────┐
│  MonitoringStation   │
│──────────────────────│
│  id (PK)             │
│  stationCode         │◄──────┐
│  name                │       │
│  city                │       │ 1:N
│  state               │       │
│  latitude            │       │
│  longitude           │       │
│  provider            │       │
│  isActive            │       │
│  metadata            │       │
│  createdAt           │       │
│  updatedAt           │       │
└──────────────────────┘       │
                               │
┌──────────────────────────────▼───────────────────┐
│         PollutantObservation                     │
│──────────────────────────────────────────────────│
│  id (PK)                                         │
│  stationId (FK)                                  │
│  pollutantType                                   │
│  concentration                                   │
│  unit                                            │
│  averagingPeriod                                 │
│  observedAt                                      │
│  dataQualityFlag                                 │
│  sourceProvider                                  │
│  ingestedAt                                      │
│  metadata                                        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         AirQualitySnapshot (Computed/Cached)     │
│──────────────────────────────────────────────────│
│  id (PK)                                         │
│  stationId (FK)                                  │
│  city                                            │
│  aqi                                             │
│  aqiCategory                                     │
│  dominantPollutant                               │
│  subIndices                                      │
│  measurementTimestamp                            │
│  calculatedAt                                    │
│  dataFreshness                                   │
│  sourceAttribution                               │
└──────────────────────────────────────────────────┘
```

---

## 2. Table Definitions

### 2.1 MonitoringStation

Stores metadata about air quality monitoring stations.

```prisma
model MonitoringStation {
  id           String   @id @default(cuid())
  stationCode  String   @unique  // Provider-specific station identifier
  name         String                // e.g., "Delhi - Anand Vihar"
  city         String                // e.g., "Delhi"
  state        String                // e.g., "Delhi"
  latitude     Float?               // Decimal degrees
  longitude    Float?               // Decimal degrees
  provider     String                // e.g., "CPCB", "OpenAQ"
  isActive     Boolean  @default(true)
  metadata     Json?                // Additional provider-specific metadata
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  observations        PollutantObservation[]
  airQualitySnapshots AirQualitySnapshot[]
  
  @@index([city, state])
  @@index([provider, stationCode])
  @@index([isActive])
  @@map("monitoring_stations")
}
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Internal unique identifier |
| `stationCode` | String | UNIQUE | Provider-specific station code (e.g., "DL_Anand_Vihar") |
| `name` | String | NOT NULL | Human-readable station name |
| `city` | String | NOT NULL | City name (normalized) |
| `state` | String | NOT NULL | State/UT name |
| `latitude` | Float | NULL | Geographic latitude |
| `longitude` | Float | NULL | Geographic longitude |
| `provider` | String | NOT NULL | Source provider (CPCB, OpenAQ, etc.) |
| `isActive` | Boolean | DEFAULT true | Whether station is currently operational |
| `metadata` | JSON | NULL | Additional attributes (address, elevation, etc.) |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | AUTO UPDATE | Last modification timestamp |

**Indexes:**
- `idx_stations_city_state` on `(city, state)` - For location search
- `idx_stations_provider_code` on `(provider, stationCode)` - For provider lookups
- `idx_stations_active` on `(isActive)` - For filtering active stations

**Rationale:**
- `stationCode` unique constraint prevents duplicate stations from same provider
- `latitude`/`longitude` nullable because not all providers supply coordinates
- `isActive` flag allows soft deletion (preserve historical data)
- `metadata` JSON field for flexibility without schema changes

---

### 2.2 PollutantObservation

Stores individual pollutant measurements from monitoring stations.

```prisma
enum PollutantType {
  PM2_5
  PM10
  NO2
  SO2
  CO
  O3
  NH3
  PB  // Lead
}

enum DataQualityFlag {
  VALID
  SUSPECT          // Unusual but possible value
  INVALID          // Failed validation checks
  MISSING          // Expected but not provided
  UNCHECKED        // Not yet validated
}

model PollutantObservation {
  id               String          @id @default(cuid())
  stationId        String
  pollutantType    PollutantType
  concentration    Float            // Numeric value
  unit             String           // e.g., "µg/m³", "mg/m³"
  averagingPeriod  String           // e.g., "24h", "8h", "1h"
  observedAt       DateTime         // When measurement was taken
  dataQualityFlag  DataQualityFlag  @default(UNCHECKED)
  sourceProvider   String           // e.g., "CPCB", "OpenAQ"
  ingestedAt       DateTime         @default(now())  // When we stored it
  metadata         Json?            // Additional context
  
  // Relations
  station          MonitoringStation @relation(fields: [stationId], references: [id], onDelete: Cascade)
  
  @@index([stationId, observedAt(sort: Desc)])
  @@index([pollutantType, observedAt(sort: Desc)])
  @@index([observedAt(sort: Desc)])
  @@index([dataQualityFlag])
  @@unique([stationId, pollutantType, observedAt, averagingPeriod])
  @@map("pollutant_observations")
}
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique observation identifier |
| `stationId` | String | FK, NOT NULL | Reference to monitoring station |
| `pollutantType` | Enum | NOT NULL | Pollutant measured (PM2.5, PM10, etc.) |
| `concentration` | Float | NOT NULL | Measured concentration value |
| `unit` | String | NOT NULL | Measurement unit (µg/m³, mg/m³, ppm) |
| `averagingPeriod` | String | NOT NULL | Time period over which measurement was averaged |
| `observedAt` | DateTime | NOT NULL | Timestamp of measurement |
| `dataQualityFlag` | Enum | DEFAULT UNCHECKED | Data validation status |
| `sourceProvider` | String | NOT NULL | Provider that supplied this data |
| `ingestedAt` | DateTime | DEFAULT now() | When record was created in our database |
| `metadata` | JSON | NULL | Additional attributes (raw provider data, etc.) |

**Indexes:**
- `idx_observations_station_time` on `(stationId, observedAt DESC)` - Most common query (station's recent data)
- `idx_observations_pollutant_time` on `(pollutantType, observedAt DESC)` - Pollutant-specific queries
- `idx_observations_time` on `(observedAt DESC)` - Time-range queries
- `idx_observations_quality` on `(dataQualityFlag)` - Filter by quality

**Unique Constraint:**
- `(stationId, pollutantType, observedAt, averagingPeriod)` - Prevent duplicate observations

**Rationale:**
- Separate row per pollutant per timestamp (denormalized) for efficient time-series queries
- `dataQualityFlag` enables quality control without deleting potentially valuable data
- `observedAt` vs `ingestedAt` distinguishes measurement time from storage time
- `unit` stored per observation (not assumed) to handle provider differences
- `averagingPeriod` critical for correct AQI calculation (24h vs 1h averaging)

---

### 2.3 AirQualitySnapshot

Pre-calculated or cached air quality summaries for efficient retrieval.

```prisma
enum AqiCategory {
  GOOD                 // 0-50
  SATISFACTORY        // 51-100
  MODERATELY_POLLUTED // 101-200
  POOR                // 201-300
  VERY_POOR           // 301-400
  SEVERE              // 401-500
}

enum DataFreshness {
  LIVE         // < 1 hour old
  RECENT       // 1-3 hours old
  STALE        // 3-6 hours old
  OUTDATED     // > 6 hours old
  UNKNOWN
}

model AirQualitySnapshot {
  id                    String         @id @default(cuid())
  stationId             String?        // Nullable if city-level aggregate
  city                  String
  state                 String?
  aqi                   Int            // Overall AQI value
  aqiCategory           AqiCategory
  dominantPollutant     PollutantType
  subIndices            Json           // { "PM2_5": 142, "PM10": 98, ... }
  measurements          Json           // Raw concentrations
  measurementTimestamp  DateTime       // When underlying data was measured
  calculatedAt          DateTime       @default(now())
  dataFreshness         DataFreshness  @default(UNKNOWN)
  sourceAttribution     String         // "CPCB via station XYZ"
  metadata              Json?
  
  // Relations
  station               MonitoringStation? @relation(fields: [stationId], references: [id], onDelete: Cascade)
  
  @@index([city, measurementTimestamp(sort: Desc)])
  @@index([stationId, measurementTimestamp(sort: Desc)])
  @@index([measurementTimestamp(sort: Desc)])
  @@index([aqiCategory])
  @@map("air_quality_snapshots")
}
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | PK, CUID | Unique snapshot identifier |
| `stationId` | String | FK, NULL | Specific station (null if city-level) |
| `city` | String | NOT NULL | City name |
| `state` | String | NULL | State/UT name |
| `aqi` | Int | NOT NULL | Calculated overall AQI (0-500+) |
| `aqiCategory` | Enum | NOT NULL | AQI category (Good, Poor, etc.) |
| `dominantPollutant` | Enum | NOT NULL | Pollutant with highest sub-index |
| `subIndices` | JSON | NOT NULL | Individual pollutant sub-indices |
| `measurements` | JSON | NOT NULL | Raw concentration values |
| `measurementTimestamp` | DateTime | NOT NULL | When measurements were taken |
| `calculatedAt` | DateTime | DEFAULT now() | When AQI was calculated |
| `dataFreshness` | Enum | DEFAULT UNKNOWN | How recent the data is |
| `sourceAttribution` | String | NOT NULL | Data provenance |
| `metadata` | JSON | NULL | Additional context |

**Indexes:**
- `idx_snapshots_city_time` on `(city, measurementTimestamp DESC)` - City-specific recent AQI
- `idx_snapshots_station_time` on `(stationId, measurementTimestamp DESC)` - Station-specific history
- `idx_snapshots_time` on `(measurementTimestamp DESC)` - Recent snapshots
- `idx_snapshots_category` on `(aqiCategory)` - Filter by severity

**Rationale:**
- Denormalized for read performance (dashboard queries)
- `subIndices` and `measurements` as JSON for flexibility
- `stationId` nullable to support city-level aggregates
- `measurementTimestamp` vs `calculatedAt` tracks data age
- `dataFreshness` enum enables clear UI indicators

**Storage Consideration:**
- This table grows quickly (1 row per hour per station)
- Implement retention policy (e.g., detailed data for 90 days, daily summaries after)
- Partition by month if table grows beyond 10M rows

---

## 3. Data Retention Strategy

### 3.1 Retention Policies

| Data Type | Retention Period | Archive Strategy |
|-----------|------------------|------------------|
| Live observations (< 7 days) | Kept in hot storage | None |
| Recent observations (7-90 days) | Kept in database | None |
| Historical observations (90 days - 1 year) | Kept in database | None |
| Old observations (> 1 year) | Archive to cold storage or aggregate | Daily/weekly summaries only |
| AQI snapshots (< 90 days) | Full detail | None |
| AQI snapshots (> 90 days) | Daily aggregates only | Archive hourly snapshots |

### 3.2 Archival Process (Future)

```sql
-- Example: Archive old hourly observations older than 1 year
-- Replace with daily averages

INSERT INTO pollutant_observations_daily_summary (
  station_id,
  pollutant_type,
  date,
  avg_concentration,
  min_concentration,
  max_concentration,
  observation_count
)
SELECT
  station_id,
  pollutant_type,
  DATE(observed_at) as date,
  AVG(concentration) as avg_concentration,
  MIN(concentration) as min_concentration,
  MAX(concentration) as max_concentration,
  COUNT(*) as observation_count
FROM pollutant_observations
WHERE observed_at < NOW() - INTERVAL '1 year'
GROUP BY station_id, pollutant_type, DATE(observed_at);

-- Then delete archived raw data
DELETE FROM pollutant_observations
WHERE observed_at < NOW() - INTERVAL '1 year';
```

---

## 4. Indexes and Performance

### 4.1 Index Strategy

**Time-Series Queries (Most Common):**
```sql
-- Get latest observations for a station
SELECT * FROM pollutant_observations
WHERE station_id = 'xyz'
ORDER BY observed_at DESC
LIMIT 100;

-- Covered by: idx_observations_station_time
```

**Historical Range Queries:**
```sql
-- Get observations for date range
SELECT * FROM pollutant_observations
WHERE station_id = 'xyz'
  AND observed_at BETWEEN '2026-11-01' AND '2026-11-17'
ORDER BY observed_at DESC;

-- Covered by: idx_observations_station_time
```

**City-Level Current AQI:**
```sql
-- Get latest snapshot for city
SELECT * FROM air_quality_snapshots
WHERE city = 'Delhi'
ORDER BY measurement_timestamp DESC
LIMIT 1;

-- Covered by: idx_snapshots_city_time
```

### 4.2 Query Optimization Tips

1. **Use Prepared Statements**: Prisma handles this automatically
2. **Limit Result Sets**: Always use `LIMIT` for time-series queries
3. **Index Coverage**: Ensure WHERE and ORDER BY columns are indexed
4. **Avoid SELECT ***: Select only needed columns
5. **Batch Inserts**: Use Prisma `createMany` for bulk data ingestion

---

## 5. Data Validation Rules

### 5.1 Validation at Ingestion

**Pollutant Concentration Ranges:**

| Pollutant | Valid Range | Unit | Rationale |
|-----------|-------------|------|-----------|
| PM2.5 | 0 - 1000 µg/m³ | µg/m³ | Values >1000 extremely rare, flag as suspect |
| PM10 | 0 - 2000 µg/m³ | µg/m³ | Values >2000 extremely rare |
| NO2 | 0 - 1000 µg/m³ | µg/m³ | Values >1000 unlikely |
| SO2 | 0 - 1000 µg/m³ | µg/m³ | Values >1000 unlikely |
| CO | 0 - 50 mg/m³ | mg/m³ | Values >50 extremely rare |
| O3 | 0 - 500 µg/m³ | µg/m³ | Values >500 unusual |
| NH3 | 0 - 1000 µg/m³ | µg/m³ | Values >1000 unlikely |
| Pb | 0 - 10 µg/m³ | µg/m³ | Values >10 extremely unusual |

**Timestamp Validation:**
- `observedAt` must not be in the future (allow 5-minute clock skew tolerance)
- `observedAt` should not be more than 7 days in the past for "live" data
- Timezone must be consistent (store as UTC)

**Data Quality Flags:**
```typescript
function validateObservation(obs: PollutantObservation): DataQualityFlag {
  // Check for null/undefined
  if (obs.concentration == null) return DataQualityFlag.MISSING;
  
  // Check for negative values (impossible)
  if (obs.concentration < 0) return DataQualityFlag.INVALID;
  
  // Check for suspicious ranges
  const ranges = getValidRanges(obs.pollutantType);
  if (obs.concentration > ranges.suspect) return DataQualityFlag.SUSPECT;
  if (obs.concentration > ranges.max) return DataQualityFlag.INVALID;
  
  // Check for future timestamps
  if (obs.observedAt > new Date()) return DataQualityFlag.INVALID;
  
  return DataQualityFlag.VALID;
}
```

### 5.2 Handling Invalid Data

**Rules:**
1. ❌ NEVER silently replace invalid values with fabricated data
2. ✅ Store invalid data with `dataQualityFlag = INVALID`
3. ✅ Exclude invalid data from AQI calculations
4. ✅ Log validation failures for monitoring
5. ✅ Display data quality warnings in UI when appropriate

---

## 6. Database Migrations

### 6.1 Migration Strategy

**Prisma Migration Workflow:**
```bash
# 1. Modify schema.prisma
# 2. Create migration
pnpm prisma migrate dev --name add_station_metadata

# 3. Review generated SQL in prisma/migrations/
# 4. Test migration on dev database
# 5. Apply to staging
pnpm prisma migrate deploy

# 6. Apply to production (with backup!)
pnpm prisma migrate deploy
```

### 6.2 Migration Best Practices

1. **Always Backup Production**: Before any schema change
2. **Incremental Changes**: Small, reversible migrations
3. **Test on Staging**: Full migration dry-run before production
4. **Handle Data Migrations**: Separate data-only migrations if needed
5. **Zero-Downtime**: For critical tables, use:
   - Add new column (nullable)
   - Backfill data
   - Make non-nullable (if required)
   - Remove old column

---

## 7. Database Security

### 7.1 Access Control

**Database User Roles:**

| Role | Permissions | Used By |
|------|-------------|---------|
| `app_user` | SELECT, INSERT, UPDATE on all tables | Application (Next.js) |
| `migration_user` | All permissions including DDL | Migration scripts |
| `readonly_user` | SELECT only | Analytics, reporting |
| `postgres` (superuser) | All | DBA only (emergency) |

**Connection Strings:**
```env
# Application (limited permissions)
DATABASE_URL="postgresql://app_user:secure_password@host:5432/airquality_prod"

# Migrations (elevated permissions)
MIGRATION_DATABASE_URL="postgresql://migration_user:secure_password@host:5432/airquality_prod"
```

### 7.2 SQL Injection Prevention

**Prisma ORM Protection:**
- ✅ All queries parameterized automatically
- ✅ No raw SQL with user input
- ❌ Avoid `prisma.$executeRawUnsafe` with user data

**Example Safe Query:**
```typescript
// ✅ SAFE: Prisma parameterizes automatically
const observations = await prisma.pollutantObservation.findMany({
  where: {
    stationId: userProvidedStationId,  // Safely parameterized
    observedAt: {
      gte: userProvidedStartDate
    }
  }
});

// ❌ UNSAFE: Never do this
const observations = await prisma.$queryRawUnsafe(
  `SELECT * FROM pollutant_observations WHERE station_id = '${userInput}'`
);
```

### 7.3 Data Privacy

**PII Considerations:**
- ❌ NO user-specific location tracking without explicit consent
- ❌ NO storing precise user coordinates long-term
- ✅ Only store city-level location preferences (if user accounts added)
- ✅ Anonymous usage analytics only

**GDPR Compliance (if applicable):**
- Right to access: Provide user their data
- Right to erasure: Implement hard delete (not just soft delete)
- Right to portability: Export user data in machine-readable format

---

## 8. Backup and Disaster Recovery

### 8.1 Backup Strategy

**Frequency:**
- **Production**: Automated daily backups (managed by database provider)
- **Retention**: 30 days of daily backups
- **Point-in-Time Recovery**: Enabled (last 7 days)

**Critical Data:**
- Monitoring station metadata (rarely changes, low volume)
- Pollutant observations (time-series, high volume)
- AQI snapshots (computed, can be regenerated)

**Backup Verification:**
- Weekly: Restore test backup to staging environment
- Monthly: Verify data integrity post-restore

### 8.2 Disaster Recovery

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours (daily backup)

**Recovery Procedure:**
1. Provision new database instance
2. Restore from latest backup
3. Update application DATABASE_URL
4. Run smoke tests
5. Redirect traffic

---

## 9. Monitoring and Maintenance

### 9.1 Database Monitoring Metrics

**Performance Metrics:**
- Query execution time (slow query log: >1s)
- Connection pool utilization
- Database CPU and memory usage
- Table sizes and growth rate
- Index usage statistics

**Health Metrics:**
- Failed queries per minute
- Deadlocks
- Replication lag (if using replicas)
- Disk space remaining

**Query Monitoring:**
```sql
-- Find slow queries (PostgreSQL)
SELECT
  query,
  calls,
  total_exec_time / 1000 as total_seconds,
  mean_exec_time / 1000 as mean_seconds,
  max_exec_time / 1000 as max_seconds
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 9.2 Maintenance Tasks

**Weekly:**
- Review slow query log
- Check table sizes and growth
- Verify backup success

**Monthly:**
- `VACUUM ANALYZE` (usually auto-vacuumed)
- Review and optimize indexes
- Check for unused indexes
- Review data retention compliance

**Quarterly:**
- Capacity planning review
- Schema optimization review
- Archival process execution (if implemented)

---

## 10. Example Queries

### 10.1 Get Current AQI for City

```typescript
// Get latest AQI snapshot for city
const latestSnapshot = await prisma.airQualitySnapshot.findFirst({
  where: {
    city: 'Delhi'
  },
  orderBy: {
    measurementTimestamp: 'desc'
  },
  include: {
    station: true
  }
});
```

### 10.2 Get Station's Recent Observations

```typescript
// Get last 24 hours of PM2.5 observations for station
const observations = await prisma.pollutantObservation.findMany({
  where: {
    stationId: stationId,
    pollutantType: 'PM2_5',
    observedAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    dataQualityFlag: {
      in: ['VALID', 'SUSPECT']  // Exclude INVALID
    }
  },
  orderBy: {
    observedAt: 'desc'
  }
});
```

### 10.3 Get Historical AQI for Date Range

```typescript
// Get daily AQI snapshots for last 30 days
const historicalAqi = await prisma.airQualitySnapshot.findMany({
  where: {
    city: 'Delhi',
    measurementTimestamp: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  orderBy: {
    measurementTimestamp: 'asc'
  },
  select: {
    measurementTimestamp: true,
    aqi: true,
    aqiCategory: true,
    dominantPollutant: true
  }
});
```

### 10.4 Search Stations by City

```typescript
// Find active monitoring stations in city
const stations = await prisma.monitoringStation.findMany({
  where: {
    city: {
      contains: searchQuery,
      mode: 'insensitive'  // Case-insensitive
    },
    isActive: true
  },
  orderBy: {
    name: 'asc'
  }
});
```

---

## 11. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 17, 2026 | Development Team | Initial database schema design |

---

**END OF DATABASE SCHEMA DOCUMENT**
