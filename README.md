<div align="center">
  <img src="https://storage.googleapis.com/hume-public-logos/hume/hume-banner.png">
  <h1>EVI Next.js App Router Example</h1>
</div>

![preview.png](preview.png)

## Overview

This project features a sample implementation of Hume's [Empathic Voice Interface](https://hume.docs.buildwithfern.com/docs/empathic-voice-interface-evi/overview) using Hume's React SDK. Here, we have a simple EVI that uses the Next.js App Router.

## Project deployment

Click the button below to deploy this example project with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhumeai%2Fhume-evi-next-js-starter&env=HUME_API_KEY,HUME_SECRET_KEY)

Below are the steps to completing deployment:

1. Create a Git Repository for your project.
2. Provide the required environment variables. To get your API key and Client Secret key, log into the portal and visit the [API keys page](https://beta.hume.ai/settings/keys).

## Support

If you have questions, require assistance, or wish to engage in discussions pertaining to this starter template, [please reach out to us on Discord](https://link.hume.ai/discord).


---

## /api/metrics — Lightweight health & metrics endpoint

This project includes `app/api/metrics/route.ts` — a small server-side endpoint that returns a cached
health snapshot for the Hume AI EVI integration. It is intended to be polled by an external dashboard
(e.g., a Vite + React UI) to display live health, token status, latency and simple expression data.

**Environment variables**
Add these to your Vercel environment or `.env.local`:

```
HUME_API_KEY=<your-hume-api-key>
HUME_SECRET_KEY=<your-hume-secret-key>

# optional tuning:
METRICS_CACHE_TTL_MS=15000
METRICS_HUME_TEST_PATH=https://api.hume.ai/v0/evi
METRICS_TEST_TIMEOUT_MS=5000
```

**Notes**
- The endpoint uses `getHumeAccessToken()` (server-side) — keep your Hume secrets server-side.
- The test call is intentionally light; change `METRICS_HUME_TEST_PATH` if you have a preferred lightweight endpoint.
- If you publish an admin endpoint with logs/details, secure it behind auth.
