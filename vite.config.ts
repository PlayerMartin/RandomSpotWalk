import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Local dev certificates generated with mkcert (see README / setup guide).
// These are required for the dev & preview servers (which are HTTPS-only),
// but must NOT block `vite build` inside a Docker container where .certs/
// isn't present. Only load them when they exist (or when serving, not building).
const certPath = path.resolve(process.cwd(), '.certs')
const certKey = path.join(certPath, 'nb.tail770aef.ts.net.key')
const certFile = path.join(certPath, 'nb.tail770aef.ts.net.crt')
const hasCerts = fs.existsSync(certKey) && fs.existsSync(certFile)

let https: { key: Buffer; cert: Buffer } | undefined
if (hasCerts) {
  https = {
    key: fs.readFileSync(certKey),
    cert: fs.readFileSync(certFile),
  }
} else if (process.env.NODE_ENV !== 'production') {
  // Running dev/preview but the certs are missing -> fail fast, HTTPS-only.
  throw new Error(
    'HTTPS certificates not found in .certs/ (nb.tail770aef.ts.net.crt + nb.tail770aef.ts.net.key). ' +
      'Generate them with mkcert (see README) or run a production build.'
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // HTTPS only. `host: '0.0.0.0'` lets you reach it from your phone on the
    // same Wi-Fi via https://<LAN-IP>:5173 (needed for mobile GPS).
    https,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true
  },
  preview: {
    // Make `npm run preview` HTTPS-only too.
    https,
  },
})
