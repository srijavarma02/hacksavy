# Deployment

The Vercel frontend needs a separately hosted Node backend. The frontend's
`/api/*` requests cannot be served by Vercel until its API URLs point to that
backend.

## Deploy the backend on Render

1. In Render, choose **New > Blueprint** and select this repository. Render
   reads `render.yaml` and creates the `ecopulsehacksavy-api` web service.
2. Wait for the service to deploy. Open its `/health` URL; it should return
   `{"ok":true}`. Also check `/api/ml/status`.
3. The free service may sleep while idle. The frontend reconnects its WebSocket
   and falls back to HTTP polling while the service wakes.

SMS is disabled by default. Keep `ENABLE_SMS=false` unless real SMS delivery
has been intentionally configured. Do not commit Twilio credentials or
recipient phone numbers; enter them only as Render environment variables.
`ENABLE_DEMO_ENDPOINTS` remains disabled by default, so the test-notification
endpoint returns 404.

## Connect the Vercel frontend

The frontend defaults to the current Render service URL in production. If you
need to override it, add these environment variables to the Vercel project for
Production:

```text
VITE_API_URL=https://YOUR-SERVICE.onrender.com
VITE_WS_URL=wss://YOUR-SERVICE.onrender.com
```

Redeploy the Vercel project after saving them; Vite bakes these values into the
frontend at build time. The Render `FRONTEND_URL` is preconfigured for
`https://ecopulsehacksavy.vercel.app`. If the Vercel domain changes, update
`FRONTEND_URL` in Render to the exact frontend origin (no trailing slash).

Verify the connection by opening `/health` and `/api/ml/status` on Render, then
reload the Vercel site and check the browser console and Network panel. API
requests should go to Render and the WebSocket should use `wss://`.

## Runtime storage and PDF export

Reports and generated exports use local files under `.kiro/reports`. Render's
free filesystem is ephemeral, so those files can disappear when the service is
restarted or redeployed. PDF export also requires a compatible Chromium
installation; `PUPPETEER_SKIP_DOWNLOAD=true` avoids downloading Chromium during
the Render build, so PDF export is not available with this default Blueprint.
