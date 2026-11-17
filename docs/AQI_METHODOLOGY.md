# CPCB National Air Quality Index — Methodology Requirements

- **Jurisdiction:** India
- **Methodology owner:** Central Pollution Control Board (CPCB)
- **Status:** Requirements documented; executable implementation not started
- **Last reviewed:** 2026-11-17

## 1. Authoritative references

- [CPCB — How is AQI calculated?](https://www.cpcb.nic.in/displaypdf.php?id=bmF0aW9uYWwtYWlyLXF1YWxpdHktaW5kZXgvSG93X0FRSV9DYWxjdWxhdGVkLnBkZg%3D%3D)
- [CPCB — AQI resources and documents](https://app.cpcbccr.com/ccr_docs)
- [CPCB — National AQI report (2014)](https://app.cpcbccr.com/ccr_docs/FINAL-REPORT_AQI_.pdf)
- [CPCB — AQI dashboard](https://app.cpcbccr.com/AQIIndia)

The exact current official breakpoint table, pollutant parameter definitions, units, averaging rules, and any subsequent official amendments must be checked against CPCB material before coding the calculation engine. Do not copy thresholds from third-party charts or invent values.

## 2. AQI categories

| AQI range | CPCB category |
|---:|---|
| 0–50 | Good |
| 51–100 | Satisfactory |
| 101–200 | Moderately Polluted |
| 201–300 | Poor |
| 301–400 | Very Poor |
| 401–500 | Severe |

Keep category labels and colours in one configuration module. Display the numeric range and text label; never rely on colour alone.

## 3. Pollutants considered

The CPCB framework considers eight pollutants:

- PM2.5
- PM10
- Nitrogen dioxide (NO2)
- Sulphur dioxide (SO2)
- Carbon monoxide (CO)
- Ozone (O3)
- Ammonia (NH3)
- Lead (Pb)

Not every monitoring station measures every pollutant. Absence of a measurement is not zero concentration.

## 4. Sub-index concept

For each pollutant with valid data, its measured concentration is mapped to the applicable concentration breakpoint interval and the corresponding AQI interval using the CPCB sub-index interpolation method.

The general linear interpolation form is:

`Ip = ((IHI - ILO) / (BHI - BLO)) * (Cp - BLO) + ILO`

Where:

- `Ip` is the pollutant sub-index.
- `Cp` is the measured pollutant concentration.
- `BLO` and `BHI` are the lower and upper concentration breakpoints surrounding `Cp`.
- `ILO` and `IHI` are the corresponding lower and upper AQI breakpoints.

The implementation must use the official pollutant-specific breakpoint table and the correct units. The formula above is not sufficient by itself: table values, concentration validity, averaging, data sufficiency, and rounding all matter.

## 5. Overall AQI and sufficiency

CPCB's published calculation guidance states:

- Pollutant sub-indices use 24-hour average concentrations, with 8-hour averages for CO and O3.
- Overall AQI is calculated only when at least three pollutants have the required data, including at least one of PM2.5 or PM10.
- A minimum of 16 hours of data is required for calculating a sub-index.
- The overall AQI is the worst/highest valid pollutant sub-index.
- Pollutant sub-indices may still be reported when there is insufficient data to calculate an overall AQI.
- The real-time system uses running averages; a real-time value must not be confused with an arbitrary instantaneous sensor reading.

These requirements must be implemented and tested as domain rules. If the input period or completeness does not satisfy the official requirements, return a structured insufficient-data result rather than a guessed value.

## 6. Provider-reported versus application-calculated AQI

Keep separate fields and labels for:

1. Provider-reported AQI, including provider/source and methodology if known.
2. Application-calculated CPCB AQI, calculated only from suitable raw measurements with known units and valid averaging periods.
3. Individual pollutant sub-indices.

Never silently recalculate, overwrite, or relabel a provider value. If only a provider AQI is available and source methodology is unclear, display it as provider-reported and document the limitation.

## 7. Engineering requirements

- Keep official breakpoint tables in a versioned, reviewed configuration file with source/version metadata.
- Keep the calculation pure and deterministic.
- Represent missing and invalid inputs explicitly.
- Never treat missing pollutant data as zero.
- Validate units and averaging periods before calculation.
- Test every breakpoint, category boundary, just-below/just-above value, rounding transition, and insufficient-data condition.
- Compare implementation results with CPCB's official calculator or published examples.
- Record the source document/version used to encode the breakpoint table.
- Add a regression test whenever an official methodology update is adopted.

## 8. Required test cases before release

- Each pollutant's lower and upper breakpoint.
- Values immediately below, at, and above each breakpoint.
- Category transitions at 50/51, 100/101, 200/201, 300/301, and 400/401.
- Concentrations outside the official valid input range.
- Missing PM2.5 and PM10.
- Only two valid pollutants.
- Three or more valid pollutants with no particulate pollutant.
- At least three valid pollutants including PM2.5 or PM10.
- Fewer than 16 hours of required data.
- CO/O3 8-hour handling versus other pollutant averaging.
- Missing, duplicate, out-of-order, or time-zone-ambiguous records.
- Different averaging intervals that must not be combined.
- Highest sub-index selection and tie handling.
- Rounding behavior aligned to CPCB's documented calculator/examples.

## 9. Important limitation

A monitoring-station AQI is representative of the station and its defined methodology, not necessarily the user's exact street, home, or personal exposure. The UI and AI assistant must communicate this limitation clearly.
