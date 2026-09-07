function clampPercent(value, max) {
  if (!Number.isFinite(Number(value)) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(value) / max) * 100));
}

function classPosition(value, order) {
  const index = order.indexOf(value);
  if (index === -1) return 0;
  return ((index + 1) / order.length) * 100;
}

function MetricBar({ label, value, unit, percent }) {
  return (
    <div className="chart-metric">
      <div className="chart-metric-head">
        <span>{label}</span>
        <strong>{value} {unit}</strong>
      </div>
      <div className="chart-track">
        <div className="chart-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AssessmentCharts({ result }) {
  if (!result?.energy || !result?.soil) return null;

  const solar = result.energy.solar;
  const wind = result.energy.wind;
  const soil = result.soil;

  const solarMax = Math.max(Number(solar.ghi_max) || 0, Number(solar.ghi_avg) || 0, 1);
  const windMax = Math.max(Number(wind.wind_max) || 0, Number(wind.wind_avg) || 0, 1);

  const soilRiskOrder = ["Very High", "High", "Moderate", "Low"];
  const soilPosition = classPosition(soil.risk, soilRiskOrder);

  return (
    <div className="assessment-charts">
      <div className="report-block chart-section">
        <div className="chart-heading">
          <div>
            <p className="section-label">RESOURCE PROFILE</p>
            <h3>Renewable resource indicators</h3>
          </div>
          <span className="chart-note">Average vs peak</span>
        </div>

        <div className="resource-chart-grid">
          <div className="resource-chart-card">
            <div className="resource-chart-title">
              <span>Solar</span>
              <strong>{solar.class}</strong>
            </div>
            <MetricBar
              label="Average GHI"
              value={solar.ghi_avg}
              unit="W/m²"
              percent={clampPercent(solar.ghi_avg, solarMax)}
            />
            <MetricBar
              label="Peak GHI"
              value={solar.ghi_max}
              unit="W/m²"
              percent={clampPercent(solar.ghi_max, solarMax)}
            />
          </div>

          <div className="resource-chart-card">
            <div className="resource-chart-title">
              <span>Wind</span>
              <strong>{wind.class}</strong>
            </div>
            <MetricBar
              label="Average speed"
              value={wind.wind_avg}
              unit="m/s"
              percent={clampPercent(wind.wind_avg, windMax)}
            />
            <MetricBar
              label="Peak speed"
              value={wind.wind_max}
              unit="m/s"
              percent={clampPercent(wind.wind_max, windMax)}
            />
          </div>
        </div>

        <p className="chart-footnote">
          Bars compare the average and peak values within each resource. Solar and wind use separate scales because their measurement units differ.
        </p>
      </div>

      <div className="report-block chart-section">
        <div className="chart-heading">
          <div>
            <p className="section-label">ENVIRONMENTAL CONSTRAINT</p>
            <h3>Soil erosion risk position</h3>
          </div>
          <span className="chart-note">Lower risk is preferable</span>
        </div>

        <div className="risk-chart">
          <div className="risk-scale">
            <span>Very high</span>
            <span>High</span>
            <span>Moderate</span>
            <span>Low</span>
          </div>
          <div className="risk-track">
            <div className="risk-marker" style={{ left: `${soilPosition}%` }}>
              <span>{soil.risk}</span>
            </div>
          </div>
          <div className="risk-value">
            <strong>{soil.soil_loss}</strong>
            <span>t/ha/yr estimated annual soil loss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
