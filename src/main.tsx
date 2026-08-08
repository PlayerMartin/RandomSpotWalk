import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTE: StrictMode is intentionally omitted. react-leaflet v5 + React 19
// double-mounts in StrictMode dev mode, which leaves the map blank/non-
// interactive with no console error.
createRoot(document.getElementById('root')!).render(
  <App />,
)
