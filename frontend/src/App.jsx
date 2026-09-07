import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MapPicker from "./MapPicker";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapPosition, setMapPosition] = useState(null);
  const [siteArea, setSiteArea] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cursor, setCursor] = useState({
    x: -200,
    y: -200,
  });

  const resultsRef = useRef(null);

  /* =====================================================
     CURSOR GLOW
     ===================================================== */

  useEffect(() => {
    const handleMouseMove = (event) => {
      setCursor({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* =====================================================
     SCROLL TO RESULTS AFTER ASSESSMENT
     ===================================================== */

  useEffect(() => {
    if (result && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [result]);

  /* =====================================================
     ASSESSMENT
     ===================================================== */

  const evaluateSite = async () => {
    if (
      !latitude ||
      !longitude ||
      !siteArea ||
      Number(siteArea) <= 0
    ) {
      setError(
        "Please provide valid latitude, longitude and site area."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: Number(latitude),
            longitude: Number(longitude),
            site_area_km2: Number(siteArea),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to evaluate the site.");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the assessment service. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     MAP POSITION
     ===================================================== */

  const handleMapPosition = (position) => {
    setMapPosition(position);
    setLatitude(position[0].toFixed(5));
    setLongitude(position[1].toFixed(5));
  };

  return (
    <div className="app">

      {/* =================================================
          CURSOR GLOW
          ================================================= */}

      <div
        className="cursor-glow"
        style={{
          left: `${cursor.x}px`,
          top: `${cursor.y}px`,
        }}
      />

      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-mark">
            RE
          </div>

          <div className="brand-copy">
            <strong>Renewable Assessment</strong>
            <span>Site screening platform</span>
          </div>

        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          Assessment system
        </div>

      </nav>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="container">

        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <section className="page-header">

          <p className="section-label">
            SITE ASSESSMENT
          </p>

          <h1>
            Renewable energy
            <br />
            site screening
          </h1>

          <p className="page-description">
            Evaluate renewable-energy resources and
            environmental conditions for a proposed site
            using geographic and environmental data.
          </p>

        </section>


        {/* =================================================
            SITE INPUT AREA
            ================================================= */}

        <section className="assessment-layout">


          {/* =================================================
              SITE INFORMATION
              ================================================= */}

          <div className="card site-details">

            <div className="card-header">

              <div>
                <p className="section-label">
                  01 / SITE
                </p>

                <h2>
                  Site information
                </h2>
              </div>

            </div>


            <div className="form-grid">


              {/* LATITUDE */}

              <div className="form-group">

                <label>
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="23.00000"
                  value={latitude}
                  onChange={(e) => {

                    const value = e.target.value;

                    setLatitude(value);

                    const lat = Number(value);
                    const lon = Number(longitude);

                    if (
                      value !== "" &&
                      longitude !== "" &&
                      lat >= -90 &&
                      lat <= 90 &&
                      lon >= -180 &&
                      lon <= 180
                    ) {
                      setMapPosition([
                        lat,
                        lon,
                      ]);
                    }

                  }}
                />

              </div>


              {/* LONGITUDE */}

              <div className="form-group">

                <label>
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="45.00000"
                  value={longitude}
                  onChange={(e) => {

                    const value = e.target.value;

                    setLongitude(value);

                    const lat = Number(latitude);
                    const lon = Number(value);

                    if (
                      latitude !== "" &&
                      value !== "" &&
                      lat >= -90 &&
                      lat <= 90 &&
                      lon >= -180 &&
                      lon <= 180
                    ) {
                      setMapPosition([
                        lat,
                        lon,
                      ]);
                    }

                  }}
                />

              </div>


              {/* SITE AREA */}

              <div className="form-group">

                <label>
                  Site area
                </label>

                <div className="input-with-unit">

                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="7.00"
                    value={siteArea}
                    onChange={(e) =>
                      setSiteArea(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    km²
                  </span>

                </div>

              </div>

            </div>


            {/* INFO */}

            <div className="coordinates-note">

              <span className="info-icon">
                i
              </span>

              <span>
                Enter coordinates manually or
                select a location directly on the map.
              </span>

            </div>


            {/* BUTTON */}

            <button
              className="analyze-button"
              onClick={evaluateSite}
              disabled={loading}
            >

              {loading ? (
                <span className="button-content">
                  <span className="loading-spinner"></span>
                  Running assessment
                </span>
              ) : (
                <span className="button-content">
                  Run site assessment
                  <span className="button-arrow">
                    →
                  </span>
                </span>
              )}

            </button>


            {/* ERROR */}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

          </div>


          {/* =================================================
              MAP
              ================================================= */}

          <div className="card map-card">

            <div className="map-header">

              <div>
                <p className="section-label">
                  LOCATION
                </p>

                <h2>
                  Site map
                </h2>
              </div>

              <span className="map-badge">
                Interactive
              </span>

            </div>


            <div className="map-wrapper">

              <MapContainer
                center={[20, 78]}
                zoom={5}
                className="site-map"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapPicker
                  position={mapPosition}
                  setPosition={handleMapPosition}
                  onAreaCalculated={(area) => {
                    setSiteArea(area);
                  }}
                />

              </MapContainer>

            </div>


            <div className="map-footer">

              <span>
                Click the map to select a location
              </span>

              {mapPosition && (
                <span className="coordinates-display">
                  {mapPosition[0].toFixed(4)}
                  {" , "}
                  {mapPosition[1].toFixed(4)}
                </span>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            RESULTS
            ================================================= */}

        {result && (
          <section
            ref={resultsRef}
            className="results-section"
          >


            {/* RESULTS HEADER */}

            <div className="results-header">

              <div>

                <p className="section-label">
                  02 / ASSESSMENT
                </p>

                <h2>
                  Assessment results
                </h2>

              </div>


              {/* DECISION */}

              <div className="decision">

                <span>
                  OVERALL SUITABILITY
                </span>

                <strong>
                  {result.final_decision}
                </strong>


                {result.recommendation && (
                  <div className="recommendation-box">

                    <span>
                      RECOMMENDED ACTION
                    </span>

                    <strong>
                      {result.recommendation.action}
                    </strong>

                    <p>
                      {result.recommendation.message}
                    </p>

                  </div>
                )}

              </div>

            </div>


            {/* =================================================
                RESOURCE CARDS
                ================================================= */}

            <div className="results-grid">


              {/* SOLAR */}

              <div className="result-card">

                <div className="result-card-top">

                  <span className="result-number">
                    01
                  </span>

                  <span className="status-badge">
                    {result.energy.solar.class}
                  </span>

                </div>

                <h3>
                  Solar resource
                </h3>

                <div className="result-value">

                  <strong>
                    {result.energy.solar.ghi_avg}
                  </strong>

                  <span>
                    W/m²
                  </span>

                </div>

                <p className="result-card-description">
                  Average global horizontal irradiance
                </p>

                <div className="card-detail">
                  Peak:{" "}
                  <strong>
                    {result.energy.solar.ghi_max}
                  </strong>{" "}
                  W/m²
                </div>

              </div>


              {/* WIND */}

              <div className="result-card">

                <div className="result-card-top">

                  <span className="result-number">
                    02
                  </span>

                  <span className="status-badge">
                    {result.energy.wind.class}
                  </span>

                </div>

                <h3>
                  Wind resource
                </h3>

                <div className="result-value">

                  <strong>
                    {result.energy.wind.wind_avg}
                  </strong>

                  <span>
                    m/s
                  </span>

                </div>

                <p className="result-card-description">
                  Average wind speed at the assessed site
                </p>

                <div className="card-detail">
                  Peak:{" "}
                  <strong>
                    {result.energy.wind.wind_max}
                  </strong>{" "}
                  m/s
                </div>

              </div>


              {/* SOIL */}

              <div className="result-card">

                <div className="result-card-top">

                  <span className="result-number">
                    03
                  </span>

                  <span className="status-badge">
                    {result.soil.risk} risk
                  </span>

                </div>

                <h3>
                  Soil erosion
                </h3>

                <div className="result-value">

                  <strong>
                    {result.soil.soil_loss}
                  </strong>

                  <span>
                    t/ha/yr
                  </span>

                </div>

                <p className="result-card-description">
                  Estimated annual soil loss
                </p>

                <div className="card-detail">
                  Environmental constraint
                </div>

              </div>


              {/* TEMPERATURE */}

              <div className="result-card">

                <div className="result-card-top">

                  <span className="result-number">
                    04
                  </span>

                  <span className="status-badge neutral">
                    Climate
                  </span>

                </div>

                <h3>
                  Temperature
                </h3>

                <div className="result-value">

                  <strong>
                    {result.energy.temperature.avg}
                  </strong>

                  <span>
                    °C
                  </span>

                </div>

                <p className="result-card-description">
                  Average temperature for the
                  assessed location
                </p>

              </div>

            </div>


            {/* =================================================
                SUMMARY
                ================================================= */}

            <div className="assessment-summary">

              <div>

                <p className="section-label">
                  ASSESSMENT SUMMARY
                </p>

                <h3>
                  Preliminary site screening indicates{" "}
                  <span>
                    {result.final_decision.toLowerCase()}.
                  </span>
                </h3>

              </div>

              <div className="summary-text">

                <p>
                  The assessment combines solar and
                  wind resource indicators with
                  estimated soil erosion risk.
                </p>

                <p>
                  Results are intended for preliminary
                  site screening and should be followed
                  by detailed engineering, environmental
                  and geotechnical studies.
                </p>

              </div>

            </div>


            {/* =================================================
                SITE PARAMETERS
                ================================================= */}

            <div className="site-summary">

              <p className="section-label">
                SITE PARAMETERS
              </p>

              <div className="site-summary-grid">

                <div>

                  <span>
                    Latitude
                  </span>

                  <strong>
                    {result.location.latitude}
                  </strong>

                </div>


                <div>

                  <span>
                    Longitude
                  </span>

                  <strong>
                    {result.location.longitude}
                  </strong>

                </div>


                <div>

                  <span>
                    Area
                  </span>

                  <strong>
                    {result.location.site_area_km2}
                    {" km²"}
                  </strong>

                </div>

              </div>

            </div>

          </section>
        )}

      </main>


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer>

        <div className="footer-content">

          <strong>
            Renewable Assessment Platform
          </strong>

          <span>
            Preliminary site screening tool
          </span>

        </div>

        <span>
          Energy resource + soil assessment
        </span>

      </footer>

    </div>
  );
}

export default App;