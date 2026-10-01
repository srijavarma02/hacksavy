# Smart Campus Energy Dashboard

A React dashboard and Node.js API for exploring campus energy metrics, alerts,
analytics, and reports. The current app is a **demo**: the backend generates
simulated readings for seven example buildings; it is not connected to physical
meters or a building-management system.

## Live demo

- **Dashboard:** <https://ecopulsehacksavy.vercel.app/>
- **Backend health:** <https://ecopulsehacksavy-api.onrender.com/health>
- **Backend ML status:** <https://ecopulsehacksavy-api.onrender.com/api/ml/status>

The frontend is hosted on Vercel and the API/WebSocket server is hosted on
Render. Render's free instance can sleep when idle, so the first request after
inactivity may take a while. The dashboard reconnects its WebSocket and uses
HTTP polling as a fallback.

## Features

- Dashboard for seven simulated campus buildings with power, occupancy,
  temperature, and zone readings.
- Simulated readings are generated every three seconds and streamed initially
  and then every 60 seconds over WebSocket, with HTTP polling as a fallback
  while the socket is unavailable.
- Alert acknowledgement, notification log, and configurable monitoring
  thresholds.
- Historical analytics, trends, heatmap, sustainability metrics, and
  recommendations.
- Report generation, report settings, CSV export, and optional PDF export.
- ML status, anomaly detection, and power-consumption predictions. Models train
  from generated readings in memory; training restarts from scratch when the
  backend process restarts.
- Optional Twilio SMS/WhatsApp and SMTP report distribution. These require
  explicit server configuration and are disabled or unavailable by default.

## Tech stack

- **Frontend:** React 18, Vite, Recharts
- **Backend:** Node.js (18+), Express, `ws`
- **Other:** `ml-random-forest`, Twilio, Puppeteer, Jest

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

The Vite frontend runs at <http://localhost:3000>; the API and WebSocket server
run at <http://localhost:3001>. `npm run dev` starts both.

To run either process separately:

```bash
npm run client
npm run server
```

To build the production frontend:

```bash
npm run build
```

The production server can be started with `npm start`. It serves the API and
WebSocket endpoint; it does not serve Vite's generated `dist` directory.

## Deployment

The live backend is deployed as a Render web service from [`render.yaml`](./render.yaml).
The live Vercel frontend is configured to use that backend by default in
production. To override the URLs, define these Vercel environment variables
and redeploy:

```text
VITE_API_URL=https://YOUR-SERVICE.onrender.com
VITE_WS_URL=wss://YOUR-SERVICE.onrender.com
```

Set Render's `FRONTEND_URL` to the exact Vercel origin (no trailing slash) if
the frontend domain changes; CORS uses this value. See
[`DEPLOYMENT.md`](./DEPLOYMENT.md) for the setup and verification steps.

### Hosting limitations

- Render's free instance may spin down when idle and can take 50 seconds or
  more to wake.
- Reports and exports are stored on the server filesystem under `.kiro/reports`.
  They may be lost when an ephemeral host restarts or redeploys. Use persistent
  storage for data that must survive.
- The Render Blueprint sets `PUPPETEER_SKIP_DOWNLOAD=true`, so it does not
  download Chromium during deployment. PDF export may fail unless a compatible
  browser is provided separately. CSV export does not require Puppeteer.
- Simulated readings, alert history, notification logs, and ML training state
  are process-local demo data, not a persistent production data store.

## Configuration and notifications

The root [`.env.example`](./.env.example) documents optional local environment
variables. Copy it to `.env` only if you need to configure integrations; `.env`
is ignored by Git. Never commit credentials, actual phone numbers, or API keys.

SMS notifications are paused by default, and the demo test-notification
endpoint is disabled unless `ENABLE_DEMO_ENDPOINTS=true`. To intentionally
enable real SMS, configure valid Twilio credentials and recipient phone
environment variables on the backend, then set `ENABLE_SMS=true`. For email
report distribution, configure the SMTP environment variables used by the
report distributor. Keep these credentials in the hosting provider's secret
environment settings, not in the frontend or repository.

## API overview

All endpoints are served by the backend host. API requests are rate-limited.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Hosting health check |
| `GET /api/current-data` | Current simulated dashboard data |
| `GET /api/analytics/:buildingId?range=24h` | Historical analytics |
| `GET /api/alerts` | Current alerts |
| `POST /api/alerts/:alertId/acknowledge` | Acknowledge an alert |
| `GET /api/notifications` | Notification log |
| `POST /api/test-notification` | Demo notification; hidden unless explicitly enabled |
| `GET /api/sustainability` | Sustainability metrics |
| `GET /api/monitoring/config` | Monitoring thresholds and settings |
| `POST /api/monitoring/thresholds` | Update thresholds |
| `POST /api/monitoring/adaptive` | Update adaptive monitoring |
| `GET /api/monitoring/history/:buildingId` | Building power history |
| `GET /api/sms/status` | SMS paused/active status |
| `POST /api/sms/pause` | Pause SMS |
| `POST /api/sms/resume` | Resume SMS |
| `GET /api/ml/status` | ML model status |
| `GET /api/ml/predict/:buildingId` | Building predictions |
| `GET /api/ml/anomalies` | Anomaly results |
| `POST /api/reports/generate` | Generate a report |
| `GET /api/reports` | List reports |
| `GET`/`PUT /api/reports/config` | Read or update report settings |
| `GET /api/reports/:id` | Retrieve a report |
| `DELETE /api/reports/:id` | Delete a report |
| `GET /api/reports/:id/export/csv` | Export a report as CSV |
| `GET /api/reports/:id/export/pdf` | Export a report as PDF (requires Chromium) |
| `POST /api/reports/:id/distribute` | Distribute a report via configured channels |
| `GET /api/reports/schedule/next` | Next scheduled report time |
| WebSocket `/` | Initial live data and periodic updates |

## Tests

Run the test suite with:

```bash
npm test
```

The current Jest setup has a known initialization issue (`jest is not defined`
in `tests/setup.js`); test suites may fail before individual tests run.
Build the frontend with `npm run build`.
