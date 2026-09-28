import { useEffect, useState } from "react";
import { useMap, useMapEvents, Marker, Popup, Polygon } from "react-leaflet";

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, 12, { duration: 0.7 });
  }, [position, map]);

  return null;
}

function MapClickHandler({ position, setPosition, drawing, setPoints }) {
  useMapEvents({
    click(event) {
      const newPoint = [event.latlng.lat, event.latlng.lng];

      if (drawing) {
        setPoints((prev) => [...prev, newPoint]);
      } else {
        setPosition(newPoint);
      }
    },
  });

  if (!position || drawing) return null;

  return (
    <Marker position={position}>
      <Popup>
        <strong>Selected Site</strong>
        <br />
        Latitude: {position[0].toFixed(5)}
        <br />
        Longitude: {position[1].toFixed(5)}
      </Popup>
    </Marker>
  );
}

function calculateArea(points) {
  if (points.length < 3) return 0;

  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    const x1 = p1[1] * 111.32 * Math.cos((p1[0] * Math.PI) / 180);
    const y1 = p1[0] * 110.57;
    const x2 = p2[1] * 111.32 * Math.cos((p2[0] * Math.PI) / 180);
    const y2 = p2[0] * 110.57;

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
}

export default function MapPicker({
  position,
  setPosition,
  onAreaCalculated,
  showBoundary = true,
}) {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  const startDrawing = () => {
    setPoints([]);
    setDrawing(true);
  };

  const finishDrawing = () => {
    if (points.length < 3) {
      alert("Select at least 3 points.");
      return;
    }

    const area = calculateArea(points);
    onAreaCalculated(area.toFixed(2));
    setDrawing(false);
  };

  const clearBoundary = () => {
    setPoints([]);
    setDrawing(false);
    onAreaCalculated("");
  };

  return (
    <>
      <MapController position={position} />

      <MapClickHandler
        position={position}
        setPosition={setPosition}
        drawing={drawing}
        setPoints={setPoints}
      />

      {showBoundary && points.length >= 2 && (
        <Polygon
          positions={points}
          pathOptions={{
            color: "#2f7b4b",
            weight: 3,
            opacity: 0.95,
            fillColor: "#4caa6b",
            fillOpacity: 0.2,
          }}
        />
      )}

      <div className="map-draw-controls">
        {!drawing && (
          <button type="button" onClick={startDrawing}>
            <span>＋</span> Draw site
          </button>
        )}

        {drawing && (
          <button type="button" className="map-draw-primary" onClick={finishDrawing}>
            <span>✓</span> Finish
          </button>
        )}

        {points.length > 0 && (
          <button type="button" onClick={clearBoundary}>
            Clear
          </button>
        )}
      </div>

      {drawing && (
        <div className="map-drawing-hint">
          Click points around the site, then press <strong>Finish</strong>.
        </div>
      )}
    </>
  );
}
