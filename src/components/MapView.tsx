import { useEffect, useRef, type ReactNode } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { DIFFICULTY_THRESHOLDS } from "../types";
import type { Difficulty, LatLng } from "../types";
import { circleBounds } from "../utils/geo";
import { useGpsStore } from "../stores/gpsStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAppStore } from "../stores/appStore";

// ── Custom divIcons (avoid Leaflet's broken default image paths) ──
const DEFAULT_LOCATION: LatLng = { lat: 48.8584, lng: 2.2945 }; // centered-ish
// Initial viewport: whatever was last saved, else the default.
const INITIAL_CENTER = useSettingsStore.getState().mapView?.center ?? DEFAULT_LOCATION;
const INITIAL_ZOOM = useSettingsStore.getState().mapView?.zoom ?? 3;

// Start marker: colored via CSS so it follows the current theme.
const startIcon = L.divIcon({
  className: "custom-marker",
  html: `<div class="marker-dot marker-start"><span>S</span><span class="dot-ring"></span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Signature: destination as a diamond "trail blaze" with a white spot.
const destIcon = L.divIcon({
  className: "custom-marker",
  html: `<div class="blaze-dot"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -13],
});

const gpsIcon = L.divIcon({
  className: "custom-marker",
  html: `<div class="gps-dot"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── Map controller: reacts to start/dest/radius changes ──
function MapController({
  startPoint,
  destPoint,
  radiusKm,
}: {
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  radiusKm: number;
}) {
  const map = useMap();
  const phase = useAppStore((s) => s.phase);
  const hadStartRef = useRef(false);
  const restoredRef = useRef(false);

  // Persist the viewport whenever the map moves (pan/zoom/fit).
  useEffect(() => {
    const onMoveEnd = () => {
      const c = map.getCenter();
      useSettingsStore.getState().setMapView(
        { lat: c.lat, lng: c.lng },
        map.getZoom(),
      );
    };
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map]);

  useEffect(() => {
    // Extra bottom room so points aren't hidden behind the setup control card
    const bottomPad = phase === "setup" ? 340 : 60;
    const fitOptions = {
      paddingTopLeft: [60, 60] as [number, number],
      paddingBottomRight: [60, bottomPad] as [number, number],
    };

    if (startPoint && destPoint) {
      hadStartRef.current = true;
      const bounds = L.latLngBounds([startPoint, destPoint]);
      map.fitBounds(bounds, fitOptions);
    } else if (startPoint) {
      hadStartRef.current = true;
      // Fit the radius circle without creating a detached Leaflet shape
      const b = circleBounds(startPoint, radiusKm * 1000);
      const bounds = L.latLngBounds([b.south, b.west], [b.north, b.east]);
      map.fitBounds(bounds, fitOptions);
    } else if (!hadStartRef.current && !restoredRef.current) {
      // Only restore the last viewport on first mount; when a start point is
      // cleared (Cancel), keep the current zoom/center instead.
      restoredRef.current = true;
      const saved = useSettingsStore.getState().mapView;
      map.setView(saved?.center ?? DEFAULT_LOCATION, saved?.zoom ?? 3);
    }
  }, [startPoint, destPoint, radiusKm, map, phase]);

  return null;
}

// ── Shared MapView ──
export function MapView({
  children,
  onMapClick,
}: {
  children?: ReactNode;
  onMapClick?: (point: LatLng) => void;
}) {
  const mapTheme = useSettingsStore((s) => s.mapTheme);

  const tileUrl =
    mapTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // Keep the latest callback in a ref so react-leaflet doesn't rebind on every render
  const onClickRef = useRef(onMapClick);
  onClickRef.current = onMapClick;

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={true}
        className={mapTheme === "dark" ? "map-dark" : ""}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <MapClickCapture onMapClick={onMapClick} />
        <ControllerBridge />
        <MapInitFix />
        {children}
      </MapContainer>
    </div>
  );
}

// Re-measures the map once it's ready, in case the container wasn't sized at mount
function MapInitFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Binds start-point selection to the map container's DOM click event.
// Leaflet's own 'click' events turned out to be unreliable in this
// react-leaflet v5 setup, so we translate the DOM event directly.
function MapClickCapture({
  onMapClick,
}: {
  onMapClick?: (point: LatLng) => void;
}) {
  const map = useMap();
  const onClickRef = useRef(onMapClick);
  onClickRef.current = onMapClick;
  const lastFireRef = useRef(0);

  useEffect(() => {
    const container = map.getContainer();
    const handler = (e: MouseEvent) => {
      // Ignore clicks on Leaflet's own controls (zoom, attribution)
      if ((e.target as HTMLElement).closest(".leaflet-control")) return;
      // Dedupe clicks that arrive as both Leaflet and DOM events
      const now = Date.now();
      if (now - lastFireRef.current < 250) return;
      lastFireRef.current = now;

      const latlng = map.mouseEventToLatLng(e);
      onClickRef.current?.({ lat: latlng.lat, lng: latlng.lng });
    };
    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
  }, [map]);
  return null;
}

// Connects the app store to the map controller
function ControllerBridge() {
  const startPoint = useAppStore((s) => s.startPoint);
  const destPoint = useAppStore((s) => s.destPoint);
  const radiusKm = useAppStore((s) => s.radiusKm);
  return (
    <MapController
      startPoint={startPoint}
      destPoint={destPoint}
      radiusKm={radiusKm}
    />
  );
}

// ── Overlays ──
export function SetupOverlays({
  startPoint,
  destPoint,
  radiusKm,
  difficulty,
}: {
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  radiusKm: number;
  difficulty: Difficulty;
}) {
  return (
    <>
      {startPoint && (
        <Circle
          center={startPoint}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#1b3a2a",
            weight: 2,
            dashArray: "6 6",
            fillOpacity: 0.06,
          }}
        />
      )}
      {startPoint && <Marker position={startPoint} icon={startIcon} />}
      {destPoint && (
        <>
          <Marker position={destPoint} icon={destIcon} />
          {/* Difficulty-based destination disk, previewed in setup */}
          <Circle
            center={destPoint}
            radius={DIFFICULTY_THRESHOLDS[difficulty]}
            pathOptions={{
              color: "#e85d2f",
              weight: 2,
              dashArray: "4 4",
              fillOpacity: 0.08,
            }}
          />
        </>
      )}
    </>
  );
}

export function WalkingOverlays({
  startPoint,
  destPoint,
  difficulty,
  showRadius,
}: {
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  difficulty: Difficulty;
  showRadius: boolean;
}) {
  const gps = useGpsStore((s) => s.position);

  return (
    <>
      {startPoint && <Marker position={startPoint} icon={startIcon} />}
      {destPoint && (
        <>
          <Marker position={destPoint} icon={destIcon} />
          {showRadius && (
            <Circle
              center={destPoint}
              radius={DIFFICULTY_THRESHOLDS[difficulty]}
              pathOptions={{ color: "#e85d2f", weight: 2, fillOpacity: 0.08 }}
            />
          )}
        </>
      )}
      {gps && <Marker position={gps} icon={gpsIcon} zIndexOffset={1000} />}
    </>
  );
}

export function CompletedOverlays({
  startPoint,
  destPoint,
  difficulty,
}: {
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  difficulty: Difficulty;
}) {
  return (
    <>
      {startPoint && <Marker position={startPoint} icon={startIcon} />}
      {destPoint && (
        <>
          <Marker position={destPoint} icon={destIcon} />
          <Circle
            center={destPoint}
            radius={DIFFICULTY_THRESHOLDS[difficulty]}
            pathOptions={{ color: "#6f9e76", weight: 2, fillOpacity: 0.12 }}
          />
        </>
      )}
    </>
  );
}
