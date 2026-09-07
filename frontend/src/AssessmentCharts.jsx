function MetricBar({ label, value, max, unit }) {
  const numericValue = Number(value) || 0;
  const width = Math.max(0, Math.min(100, (numericValue / max) * 100));

  return (
    <div className="metric-chart">
      <div className="metric-chart-head">
        <span>{label}</span>
        <strong>{numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}</strong>
      </div>
      <div className="metric-track">
        <div className="metric-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function AssessmentCharts({ result }) {
  if (!result?.energy || !result?.soil) return null;

  const solar = result.energy.solar;
  const wind = result.energy.wind;
  const soil = result.soil;
  const soilValue = Number(soil.soil_loss) || 0;
  const soilPosition = Math.max(0, Math.min(100, (soilValue / 30) * 100));

  return (
    <div className="assessment-charts">
      <div className="chart-section-heading">
        <div>
          <p className="section-label">RESOURCE PROFILE</p>
          <h3>Renewable resource indicators</h3>
        </div>
        <span>AVERAGE VS PEAK</span>
      </div>

      <div className="resource-chart-grid">
        <div className="resource-chart-card">
          <div className="resource-chart-header">
            <div><span className="chart-index">01</span><h4>Solar</h4></div>
            <span className="chart-class">{solar.class}</span>
          </div>
          <MetricBar label="Average GHI" value={solar.ghi_avg} max={800} unit="W/m²" />
          <MetricBar label="Peak GHI" value={solar.ghi_max} max={1200} unit="W/m²" />
        </div>

        <div className="resource-chart-card">
          <div className="resource-chart-header">
            <div><span className="chart-index">02</span><h4>Wind</h4></div>
            <span className="chart-class">{wind.class}</span>
          </div>
          <MetricBar label="Average speed" value={wind.wind_avg} max={16} unit="m/s" />
          <MetricBar label="Peak speed" value={wind.wind_max} max={25} unit="m/s" />
        </div>
      </div>

      <p className="chart-footnote">Each resource uses its own physical scale. The bars show where the site's measured indicator sits within a practical screening range.</p>

      <div className="chart-section-heading soil-heading">
        <div>
          <p className="section-label">ENVIRONMENTAL CONSTRAINT</p>
          <h3>Soil erosion risk position</h3>
        </div>
        <span>LOWER RISK IS PREFERABLE</span>
      </div>

      <div className="soil-chart">
        <div
          className="soil-label-row"
          style={{ gridTemplateColumns: "16.6667% 16.6667% 33.3333% 33.3333%" }}
        >
          <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>VERY HIGH</span>
        </div>
        <div className="soil-track">
          <div className="soil-band soil-low" />
          <div className="soil-band soil-moderate" />
          <div className="soil-band soil-high" />
          <div className="soil-band soil-very-high" />
          <div className="soil-marker" style={{ left: `${soilPosition}%` }}>
            <span>{String(soil.risk || "").toUpperCase()}</span><i />
          </div>
        </div>
        <div
          className="soil-thresholds"
          style={{ position: "relative", display: "block", height: "12px", marginTop: "12px" }}
        >
          <span style={{ position: "absolute", left: "0%", transform: "translateX(0)" }}>0</span>
          <span style={{ position: "absolute", left: "16.6667%", transform: "translateX(-50%)" }}>5</span>
          <span style={{ position: "absolute", left: "33.3333%", transform: "translateX(-50%)" }}>10</span>
          <span style={{ position: "absolute", left: "66.6667%", transform: "translateX(-50%)" }}>20</span>
          <span style={{ position: "absolute", left: "100%", transform: "translateX(-100%)" }}>30+</span>
        </div>
        <div className="soil-value-row"><strong>{soilValue.toFixed(3)}</strong><span>t/ha/yr estimated annual soil loss</span></div>
      </div>

      <style>{`
        .detailed-report > .report-block:nth-child(6),
        .detailed-report > .report-two-column {
          display: none !important;
        }

        .detailed-report .report-sub-label + .report-bullets li:nth-child(3) {
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
