import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MapPicker from "./MapPicker";
import AssessmentCharts from "./AssessmentCharts";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "./Report.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


function WorldCoverLayer({ layer, visible }) {
  const [tileUrl, setTileUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!visible) {
      setTileUrl("");
      return undefined;
    }

    const loadLayer = async () => {
      try {
        const response = await fetch(
          `${API_URL}/map/worldcover?layer=${encodeURIComponent(layer)}`
        );
        if (!response.ok) throw new Error("WorldCover layer unavailable");
        const payload = await response.json();
        if (!cancelled) setTileUrl(payload.tile_url || "");
      } catch (err) {
        console.error(`Could not load WorldCover ${layer} layer:`, err);
        if (!cancelled) setTileUrl("");
      }
    };

    loadLayer();
    return () => {
      cancelled = true;
    };
  }, [layer, visible]);

  if (!visible || !tileUrl) return null;

  return (
    <TileLayer
      url={tileUrl}
      opacity={layer === "landcover" ? 0.62 : 0.72}
      attribution="© ESA WorldCover project 2021"
      zIndex={layer === "landcover" ? 250 : 300}
    />
  );
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function App() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapPosition, setMapPosition] = useState(null);
  const [siteArea, setSiteArea] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [satellite, setSatellite] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showWorldCover, setShowWorldCover] = useState(false);
  const [showVegetation, setShowVegetation] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => setCursor({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (result && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const evaluateSite = async () => {
    const lat = Number(latitude);
    const lon = Number(longitude);
    const area = Number(siteArea);

    if (
      latitude === "" ||
      longitude === "" ||
      siteArea === "" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180 ||
      !Number.isFinite(area) ||
      area <= 0
    ) {
      setError("Please provide valid latitude, longitude and site area.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          site_area_km2: area,
        }),
      });

      if (!response.ok) {
        let message = "Unable to evaluate the site.";
        try {
          const payload = await response.json();
          message = payload.detail || message;
        } catch {}
        throw new Error(message);
      }

      setResult(await response.json());
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not connect to the assessment service. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMapPosition = (position) => {
    setMapPosition(position);
    setLatitude(position[0].toFixed(5));
    setLongitude(position[1].toFixed(5));
  };

  const updateCoordinate = (type, value) => {
    if (type === "lat") setLatitude(value);
    else setLongitude(value);

    const lat = type === "lat" ? Number(value) : Number(latitude);
    const lon = type === "lon" ? Number(value) : Number(longitude);

    if (
      value !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      setMapPosition([lat, lon]);
    }
  };

  const printReport = () => window.print();
  const report = result?.report;
  const solarReport = report?.factor_analysis?.solar;
  const windReport = report?.factor_analysis?.wind;
  const soilReport = report?.factor_analysis?.soil;
  const temperatureReport = report?.factor_analysis?.temperature;

  const mapTileUrl = satellite
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const mapAttribution = satellite
    ? "Tiles © Esri"
    : "&copy; OpenStreetMap contributors";

  return (
    <div className="app">
      <div
        className="cursor-glow"
        style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
      />

      <nav className="navbar">
        <div className="brand">
          <div className="brand-mark">RE</div>
          <div className="brand-copy">
            <strong>Renewable Assessment</strong>
            <span>Site screening platform</span>
          </div>
        </div>
        <div className="nav-status">
          <span className="status-dot" />
          Assessment system
        </div>
      </nav>

      <main className="container">
        <section className="page-header">
          <p className="section-label">SITE ASSESSMENT</p>
          <h1>
            Renewable energy
            <br />
            site screening
          </h1>
          <p className="page-description">
            Evaluate renewable-energy resources and environmental conditions for
            a proposed site using geographic and environmental data. The result
            combines resource strength and erosion risk into one screening decision.
          </p>
        </section>

        <section className="assessment-layout">
          <div className="card site-details">
            <div className="card-header">
              <div>
                <p className="section-label">01 / SITE</p>
                <h2>Site information</h2>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="23.00000"
                  value={latitude}
                  onChange={(e) => updateCoordinate("lat", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="45.00000"
                  value={longitude}
                  onChange={(e) => updateCoordinate("lon", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Site area</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="7.00"
                    value={siteArea}
                    onChange={(e) => setSiteArea(e.target.value)}
                  />
                  <span>km²</span>
                </div>
              </div>
            </div>

            <div className="coordinates-note">
              <span className="info-icon">i</span>
              <span>
                Enter coordinates manually or select a location directly on the map.
                Draw the site boundary to estimate its area automatically.
              </span>
            </div>

            <button
              className="analyze-button"
              onClick={evaluateSite}
              disabled={loading}
            >
              {loading ? (
                <span className="button-content">
                  <span className="loading-spinner" />
                  Running assessment
                </span>
              ) : (
                <span className="button-content">
                  Run site assessment
                  <span className="button-arrow">→</span>
                </span>
              )}
            </button>

            {error && <div className="error">{error}</div>}
          </div>

          <div className="card map-card">
            <div className="map-header">
              <div>
                <p className="section-label">LOCATION</p>
                <h2>Site map</h2>
              </div>
              <span className="map-badge">
                {satellite ? "Satellite" : "Base map"}
              </span>
            </div>

            <div className="map-interface">
              <aside className="map-sidebar">
                <div className="map-sidebar-section">
                  <p className="map-sidebar-label">MAP LAYERS</p>

                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={!satellite}
                      onChange={() => setSatellite(false)}
                    />
                    <span className="custom-check" />
                    <span>Base map</span>
                  </label>

                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={satellite}
                      onChange={() => setSatellite(true)}
                    />
                    <span className="custom-check" />
                    <span>Satellite</span>
                  </label>

                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={showBoundary}
                      onChange={(e) => setShowBoundary(e.target.checked)}
                    />
                    <span className="custom-check" />
                    <span>Site boundary</span>
                  </label>
                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={showWorldCover}
                      onChange={(e) => setShowWorldCover(e.target.checked)}
                    />
                    <span className="custom-check" />
                    <span>ESA WorldCover</span>
                  </label>

                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={showVegetation}
                      onChange={(e) => setShowVegetation(e.target.checked)}
                    />
                    <span className="custom-check" />
                    <span>Vegetation filter</span>
                  </label>

                  <label className="layer-toggle">
                    <input
                      type="checkbox"
                      checked={showWater}
                      onChange={(e) => setShowWater(e.target.checked)}
                    />
                    <span className="custom-check" />
                    <span>Water filter</span>
                  </label>
                </div>

                <div className="map-sidebar-divider" />

                <div className="map-sidebar-section">
                  <p className="map-sidebar-label">SITE PARAMETERS</p>

                  <div className="sidebar-field">
                    <span>Latitude</span>
                    <strong>{latitude || "—"}</strong>
                  </div>

                  <div className="sidebar-field">
                    <span>Longitude</span>
                    <strong>{longitude || "—"}</strong>
                  </div>

                  <div className="sidebar-field">
                    <span>Area</span>
                    <strong>{siteArea ? `${siteArea} km²` : "—"}</strong>
                  </div>
                </div>

                <div className="map-sidebar-divider" />

                <div className="map-sidebar-section">
                  <p className="map-sidebar-label">SITE STATUS</p>
                  <div className={`map-status ${mapPosition ? "active" : ""}`}>
                    <span />
                    {mapPosition ? "Location selected" : "Awaiting location"}
                  </div>
                  <p className="map-sidebar-help">
                    Click anywhere on the map to place the site marker. Use Draw
                    Site to outline the boundary.
                  </p>
                </div>
              </aside>

              <div className="map-main">
                <MapContainer
                  center={[20, 78]}
                  zoom={5}
                  className="site-map"
                >
                  <TileLayer
                    attribution={mapAttribution}
                    url={mapTileUrl}
                  />
                  <WorldCoverLayer
                    layer="landcover"
                    visible={showWorldCover}
                  />
                  <WorldCoverLayer
                    layer="vegetation"
                    visible={showVegetation}
                  />
                  <WorldCoverLayer
                    layer="water"
                    visible={showWater}
                  />
                  <MapPicker
                    position={mapPosition}
                    setPosition={handleMapPosition}
                    onAreaCalculated={(area) => setSiteArea(area)}
                    showBoundary={showBoundary}
                  />
                </MapContainer>

                {(showWorldCover || showVegetation || showWater) && (
                  <div className="map-data-legend">
                    {showWorldCover && (
                      <>
                        <div><span className="legend-swatch tree" />Tree</div>
                        <div><span className="legend-swatch crop" />Cropland</div>
                        <div><span className="legend-swatch built" />Built-up</div>
                        <div><span className="legend-swatch water" />Water</div>
                      </>
                    )}
                    {showVegetation && (
                      <div><span className="legend-swatch vegetation" />Vegetation filter</div>
                    )}
                    {showWater && (
                      <div><span className="legend-swatch water" />Permanent water</div>
                    )}
                  </div>
                )}

                <div className="map-overlay-top">
                  <span className="map-live-dot" />
                  {mapPosition ? "SITE SELECTED" : "SELECT A LOCATION"}
                </div>
              </div>
            </div>

            <div className="map-footer">
              <span>
                {mapPosition
                  ? "Location locked — draw a boundary or run the assessment"
                  : "Click the map to select a location"}
              </span>

              {mapPosition && (
                <span className="coordinates-display">
                  {mapPosition[0].toFixed(4)} , {mapPosition[1].toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </section>

        {result && (
          <section ref={resultsRef} className="results-section">
            <div className="results-header">
              <div>
                <p className="section-label">02 / ASSESSMENT</p>
                <h2>Assessment results</h2>
              </div>

              <div className="decision">
                <span>OVERALL SUITABILITY</span>
                <strong>{result.final_decision}</strong>
                {result.recommendation && (
                  <div className="recommendation-box">
                    <span>RECOMMENDED ACTION</span>
                    <strong>{result.recommendation.action}</strong>
                    <p>{result.recommendation.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="results-tools">
              <button className="report-button" onClick={printReport}>
                Print detailed report ↗
              </button>
            </div>

            <div className="results-grid">
              <div className="result-card">
                <div className="result-card-top">
                  <span className="result-number">01</span>
                  <span className="status-badge">{result.energy.solar.class}</span>
                </div>
                <h3>Solar resource</h3>
                <div className="result-value">
                  <strong>{formatNumber(result.energy.solar.ghi_avg)}</strong>
                  <span>W/m²</span>
                </div>
                <p className="result-card-description">
                  Average global horizontal irradiance
                </p>
                <div className="card-detail">
                  Peak: <strong>{formatNumber(result.energy.solar.ghi_max)}</strong>{" "}
                  W/m²
                </div>
              </div>

              <div className="result-card">
                <div className="result-card-top">
                  <span className="result-number">02</span>
                  <span className="status-badge">{result.energy.wind.class}</span>
                </div>
                <h3>Wind resource</h3>
                <div className="result-value">
                  <strong>{formatNumber(result.energy.wind.wind_avg)}</strong>
                  <span>m/s</span>
                </div>
                <p className="result-card-description">
                  Average wind speed at the assessed site
                </p>
                <div className="card-detail">
                  Peak: <strong>{formatNumber(result.energy.wind.wind_max)}</strong>{" "}
                  m/s
                </div>
              </div>

              <div className="result-card">
                <div className="result-card-top">
                  <span className="result-number">03</span>
                  <span className="status-badge">
                    {String(result.soil.risk || "").toUpperCase()} RISK
                  </span>
                </div>
                <h3>Soil erosion</h3>
                <div className="result-value">
                  <strong>{formatNumber(result.soil.soil_loss, 3)}</strong>
                  <span>t/ha/yr</span>
                </div>
                <p className="result-card-description">
                  Estimated annual soil loss
                </p>
                <div className="card-detail">Environmental constraint</div>
              </div>

              <div className="result-card">
                <div className="result-card-top">
                  <span className="result-number">04</span>
                  <span className="status-badge neutral">Climate</span>
                </div>
                <h3>Temperature</h3>
                <div className="result-value">
                  <strong>{formatNumber(result.energy.temperature.avg)}</strong>
                  <span>°C</span>
                </div>
                <p className="result-card-description">
                  Average temperature for the assessed location
                </p>
              </div>
            </div>

            <div className="assessment-summary">
              <div>
                <p className="section-label">ASSESSMENT SUMMARY</p>
                <h3>
                  Preliminary site screening indicates{" "}
                  <span>{result.final_decision.toLowerCase()}.</span>
                </h3>
              </div>
              <div className="summary-text">
                <p>{report?.executive_summary || result.recommendation?.message}</p>
                <p>
                  The assessment combines solar and wind resource indicators with
                  estimated soil erosion risk so the final recommendation reflects
                  the balance of development opportunity and environmental constraint.
                </p>
              </div>
            </div>

            {report && (
              <div className="detailed-report">
                <div className="report-tools">
                  <button className="report-button" onClick={printReport}>
                    Print / Save as PDF
                  </button>
                </div>

                <div className="report-block">
                  <p className="section-label">DETAILED SCREENING REPORT</p>
                  <h3>{report.title}</h3>
                  <div className="report-meta">
                    <span>
                      Site: <strong>{result.location.latitude}, {result.location.longitude}</strong>
                    </span>
                    <span>
                      Area: <strong>{formatNumber(result.location.site_area_km2, 2)} km²</strong>
                    </span>
                  </div>
                  <div className="report-callout">
                    <strong>Executive interpretation</strong>
                    <p>{report.executive_summary}</p>
                  </div>
                </div>

                <div className="report-block">
                  <p className="section-label">FACTOR-BY-FACTOR ANALYSIS</p>
                  <h3>What the individual measurements mean</h3>

                  <div className="report-grid">
                    <div className="report-factor">
                      <div className="report-factor-top">
                        <span className="report-factor-label">Solar resource</span>
                        <span className="status-badge">{solarReport?.classification}</span>
                      </div>
                      <h4>Photovoltaic opportunity</h4>
                      <div className="report-factor-value">
                        <strong>{formatNumber(solarReport?.average_value)}</strong>
                        <span>W/m² average</span>
                      </div>
                      <p>{solarReport?.interpretation}</p>
                    </div>

                    <div className="report-factor">
                      <div className="report-factor-top">
                        <span className="report-factor-label">Wind resource</span>
                        <span className="status-badge">{windReport?.classification}</span>
                      </div>
                      <h4>Wind development opportunity</h4>
                      <div className="report-factor-value">
                        <strong>{formatNumber(windReport?.average_value)}</strong>
                        <span>m/s average</span>
                      </div>
                      <p>{windReport?.interpretation}</p>
                    </div>

                    <div className="report-factor">
                      <div className="report-factor-top">
                        <span className="report-factor-label">Soil erosion</span>
                        <span className="status-badge">
                          {String(soilReport?.classification || "").toUpperCase()} RISK
                        </span>
                      </div>
                      <h4>Environmental constraint</h4>
                      <div className="report-factor-value">
                        <strong>{formatNumber(soilReport?.average_value, 3)}</strong>
                        <span>t/ha/yr</span>
                      </div>
                      <p>{soilReport?.interpretation}</p>
                    </div>

                    <div className="report-factor">
                      <div className="report-factor-top">
                        <span className="report-factor-label">Temperature</span>
                        <span className="status-badge neutral">Climate</span>
                      </div>
                      <h4>Climate context</h4>
                      <div className="report-factor-value">
                        <strong>{formatNumber(temperatureReport?.average_value)}</strong>
                        <span>°C average</span>
                      </div>
                      <p>{temperatureReport?.interpretation}</p>
                    </div>
                  </div>
                </div>

                <AssessmentCharts result={result} />

                <div className="report-block">
                  <p className="section-label">INTEGRATED ASSESSMENT</p>
                  <h3>How the factors combine</h3>
                  <div className="report-callout">
                    <strong>Decision reasoning</strong>
                    <p>{report.integrated_assessment.reasoning}</p>
                  </div>
                  <p className="section-label report-sub-label">DOMINANT FACTORS</p>
                  <ul className="report-bullets">
                    {report.integrated_assessment.dominant_factors.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="site-summary">
                  <p className="section-label">SITE PARAMETERS</p>
                  <div className="site-summary-grid">
                    <div>
                      <span>Latitude</span>
                      <strong>{result.location.latitude}</strong>
                    </div>
                    <div>
                      <span>Longitude</span>
                      <strong>{result.location.longitude}</strong>
                    </div>
                    <div>
                      <span>Area</span>
                      <strong>{result.location.site_area_km2} km²</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer>
        <span>Renewable Assessment Platform</span>
        <span>Preliminary screening tool</span>
      </footer>
    </div>
  );
}

export default App;
