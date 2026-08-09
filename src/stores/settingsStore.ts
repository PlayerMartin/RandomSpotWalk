import { create } from "zustand";
import type { LatLng, MapTheme, MapViewState } from "../types";
import {
  loadMapTheme,
  loadMapView,
  saveMapTheme,
  saveMapView,
} from "../utils/storage";

interface SettingsState {
  mapTheme: MapTheme;
  mapView: MapViewState | null;
  loaded: boolean;
  toggleTheme: () => void;
  setMapView: (center: LatLng, zoom: number) => void;
  load: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  mapTheme: "light",
  // Hydrated synchronously so the MapView can restore the viewport on its
  // very first render (localStorage is synchronous).
  mapView: loadMapView(),
  loaded: false,

  toggleTheme: () => {
    const next: MapTheme = get().mapTheme === "light" ? "dark" : "light";
    set({ mapTheme: next });
    saveMapTheme(next);
  },

  setMapView: (center, zoom) => {
    const mapView: MapViewState = {
      center: { lat: center.lat, lng: center.lng },
      zoom,
    };
    set({ mapView });
    saveMapView(mapView);
  },

  load: () => {
    if (get().loaded) return;
    set({ mapTheme: loadMapTheme(), mapView: loadMapView(), loaded: true });
  },
}));
