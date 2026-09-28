from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from decision_engine import evaluate_site
from map_layers import get_worldcover_tile


app = FastAPI(
    title="Renewable Site Suitability API",
    description="API for evaluating renewable energy site suitability",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class SiteRequest(BaseModel):
    latitude: float
    longitude: float
    site_area_km2: float
    


@app.get("/")
def home():
    return {
        "message": "Renewable Site Suitability API is running"
    }


@app.post("/evaluate")
def evaluate(request: SiteRequest):

    result = evaluate_site(
        request.latitude,
        request.longitude,
        request.site_area_km2,
        
    )

    return result

@app.get("/map/worldcover")
def worldcover_map(layer: str = "landcover"):
    try:
        return get_worldcover_tile(layer)
    except ValueError as exc:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(exc))
