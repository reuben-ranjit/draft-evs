# Renewable Energy Site Suitability & Environmental Assessment System

A full-stack web application for preliminary renewable-energy site screening. The system combines solar resource, wind resource, temperature, and soil-erosion indicators to produce an integrated site-suitability recommendation.

## Overview

The application lets a user select a geographical site using an interactive map or by entering latitude and longitude, then provide an approximate site area. The backend analyzes renewable-resource and environmental data and passes the resulting classifications to a decision engine.

The key idea is to evaluate the **best balance between renewable-energy opportunity and environmental constraint**, rather than recommending a site from solar or wind potential alone.

## Features

- Interactive Leaflet map for site selection
- Manual latitude and longitude entry
- Site-area input in km²
- Solar resource assessment using GHI
- Wind resource assessment
- Temperature as climate context
- Soil-erosion estimation
- Integrated decision engine
- Detailed factor-by-factor report
- Solar and wind resource indicators
- Soil-erosion risk scale
- Printable report

## System Architecture

```text
USER
  ↓
REACT FRONTEND
  ↓
POST /evaluate
  ↓
FASTAPI BACKEND
  ↓
┌───────────────────────┐
│ Renewable Analysis   │
│ Soil / Erosion       │
└───────────┬───────────┘
            ↓
      DECISION ENGINE
            ↓
   FINAL RECOMMENDATION
            ↓
      DETAILED REPORT
```

## Technology Stack

### Frontend

- React
- Vite
- React Leaflet
- Leaflet
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Pandas
- NumPy
- Requests
- Google Earth Engine

## Datasets and Data Sources

| Dataset / Source | Data Used | Purpose |
|---|---|---|
| **Open-Meteo Historical Weather API** | Shortwave radiation, wind speed at 10 m, temperature at 2 m | Solar, wind and temperature assessment |
| **SRTM** | Elevation | Terrain and slope analysis |
| **OpenLandMap** | Clay, sand, soil organic carbon | Soil-property and erodibility assessment |
| **ESA WorldCover** | Land-cover classification | Land-cover/environmental assessment |
| **CHIRPS** | Rainfall | Rainfall/runoff contribution to erosion |
| **Sentinel-2** | Satellite imagery / NDVI | Vegetation-cover assessment |
| **Google Earth Engine** | Geospatial data access and processing | Processing environmental datasets |

## Renewable Resource Classification

### Solar

| Average GHI | Classification |
|---:|---|
| ≥ 550 W/m² | EXCELLENT |
| 450–549.99 W/m² | GOOD |
| 350–449.99 W/m² | MODERATE |
| < 350 W/m² | POOR |

### Wind

| Average Wind Speed | Classification |
|---:|---|
| ≥ 8 m/s | EXCELLENT |
| 6–7.99 m/s | GOOD |
| 4–5.99 m/s | MODERATE |
| < 4 m/s | POOR |

### Soil Erosion

| Estimated Soil Loss | Risk |
|---:|---|
| < 5 t/ha/yr | LOW |
| 5–9.99 t/ha/yr | MODERATE |
| 10–19.99 t/ha/yr | HIGH |
| ≥ 20 t/ha/yr | VERY HIGH |

## RUSLE-Based Assessment

The soil-loss estimation follows the Revised Universal Soil Loss Equation:

```text
A = R × K × LS × C × P
```

Where A is estimated annual soil loss, R is rainfall erosivity, K is soil erodibility, LS represents slope length and steepness, C is the cover-management factor, and P represents conservation/support practices.

## Decision Engine

The decision engine combines renewable-resource strength with environmental constraints.

| Energy Condition | Soil Condition | Typical Outcome |
|---|---|---|
| Strong solar + strong wind | LOW | HIGHLY SUITABLE |
| Strong solar + strong wind | MODERATE | SUITABLE |
| Strong solar + strong wind | HIGH | CONDITIONALLY SUITABLE |
| Strong solar + strong wind | VERY HIGH | NOT RECOMMENDED |
| Acceptable energy | LOW / MODERATE | CONDITIONALLY SUITABLE |
| Poor energy | Any | NOT SUITABLE |

These are project-defined screening rules and are not regulatory or engineering approval standards.

## Project Flow

1. User selects a geographical site.
2. Latitude, longitude, and site area are submitted.
3. React sends the inputs to the FastAPI `/evaluate` endpoint.
4. The energy pipeline retrieves weather/resource indicators.
5. Google Earth Engine processes environmental datasets.
6. Soil-loss estimation is performed.
7. Solar, wind, and soil results are classified.
8. The decision engine combines the factors.
9. The backend returns the final recommendation and report data.
10. React displays the assessment and visual report.

## Project Structure

```text
renewable-site-project/
├── backend/
│   ├── decision_engine.py
│   ├── energy/
│   ├── soil/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AssessmentCharts.jsx
│   │   ├── MapPicker.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── evs_soil_classifier/
├── renewable-energy/
└── README.md
```

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Backend URL: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`.

## API

### `POST /evaluate`

Example request:

```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "site_area_km2": 10
}
```

The response contains location information, energy results, soil results, the final decision, recommendation, and detailed report information.

## Example Test Result

One tested site produced:

- Latitude: `19.0760`
- Longitude: `72.8777`
- Area: `10 km²`
- Solar: `383.51 W/m²` — **MODERATE**
- Wind: `12.74 m/s` — **EXCELLENT**
- Soil erosion: `20.916 t/ha/yr` — **VERY HIGH**
- Final decision: **NOT RECOMMENDED**

This demonstrates that excellent wind potential does not automatically result in a positive recommendation when environmental constraints are severe.

## Limitations

- Preliminary screening only; not a final engineering feasibility assessment.
- Current renewable-resource analysis uses a configured historical weather-data period.
- Soil-loss results depend on the underlying datasets and modelling assumptions.
- Decision thresholds are project-defined screening criteria.
- Grid connectivity, land ownership, legal restrictions, and detailed engineering design are outside the current scope.

## Future Improvements

- Multi-year climate analysis
- Solar PV energy-generation estimates
- Wind-energy production estimates
- Capacity-factor calculations
- Grid and substation distance analysis
- Additional environmental constraints such as flood risk and protected areas
- Multi-site ranking and comparison
- GIS suitability heatmaps
- Advanced multi-criteria or machine-learning decision models

## Disclaimer

This project is intended for **academic and preliminary site-screening purposes only**. Final renewable-energy development decisions require detailed engineering, geotechnical, environmental, regulatory, and site-specific studies.

## References

- Open-Meteo — https://open-meteo.com/
- NASA SRTM / Earthdata — https://www.earthdata.nasa.gov/data/catalog/lpcloud-srtmgl1-003
- ESA WorldCover — https://esa-worldcover.org/
- CHIRPS — https://www.chc.ucsb.edu/data/chirps
- Google Earth Engine — https://earthengine.google.com/
- Copernicus Sentinel-2 — https://senti-nel.esa.int/web/sentinel/missions/sentinel-2
- FastAPI — https://fastapi.tiangolo.com/
- React — https://react.dev/
- Leaflet — https://leafletjs.com/
