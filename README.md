# Renewable Energy Site Suitability & Environmental Assessment System

A web-based decision-support platform that evaluates the suitability of a location for renewable energy development by combining renewable-resource analysis with environmental assessment.

## Overview

This project allows users to select a location on an interactive map, enter a site area, and receive a detailed assessment based on:

- Solar resource potential (GHI)
- Wind resource potential
- Temperature conditions
- Soil erosion risk
- Integrated site suitability analysis

The goal is to provide a preliminary screening tool for identifying promising renewable-energy locations before detailed engineering studies are conducted.

## Features

### Frontend
- React + Vite application
- Interactive Leaflet map
- Glassmorphism-inspired UI
- Renewable energy assessment dashboard
- Environmental risk visualization
- Detailed printable report generation
- Charts and graphical indicators

### Backend
- FastAPI REST API
- Open-Meteo weather integration
- Renewable-resource classification engine
- Soil erosion assessment pipeline
- Decision engine for site recommendations
- Structured JSON responses

## Technology Stack

### Frontend
- React
- Vite
- React Leaflet
- Leaflet
- CSS

### Backend
- Python
- FastAPI
- Pandas
- NumPy
- Requests

### Geospatial & Environmental Data
- Google Earth Engine
- SRTM Elevation Data
- OpenLandMap
- ESA WorldCover
- CHIRPS Rainfall Data
- Sentinel-2 Imagery

## Datasets Used

| Dataset | Purpose |
|----------|----------|
| Open-Meteo | Solar irradiance, wind speed, temperature |
| SRTM | Elevation and slope analysis |
| OpenLandMap | Soil properties |
| ESA WorldCover | Land-cover classification |
| CHIRPS | Rainfall assessment |
| Sentinel-2 | Vegetation and NDVI analysis |

## System Workflow

1. User selects a location.
2. Frontend sends coordinates and site area to FastAPI.
3. Weather and environmental datasets are processed.
4. Renewable-energy indicators are classified.
5. Soil erosion is estimated.
6. Decision engine combines all factors.
7. Final recommendation and report are generated.

## Project Structure

```text
frontend/
├── src/
├── public/
└── package.json

backend/
├── main.py
├── decision_engine.py
├── energy/
├── soil/
└── requirements.txt
```

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Assessment Categories

- HIGHLY SUITABLE
- SUITABLE
- CONDITIONALLY SUITABLE
- NOT RECOMMENDED
- NOT SUITABLE

## Academic Purpose

This project was developed as an academic renewable-energy site assessment and environmental screening system. The results are intended for preliminary evaluation only and should not replace detailed engineering, environmental, or regulatory studies.

## Future Enhancements

- Multi-year climate analysis
- Energy generation estimates
- Capacity factor calculations
- Grid proximity analysis
- Flood-risk assessment
- Multi-site comparison and ranking
- Machine-learning assisted site recommendations
