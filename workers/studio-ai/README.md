# Optional: AI writing for Studio Tools (Cloudflare Workers AI)

Adds a "Write with AI" button to the Copy Writer, Name Generator and Brand Studio. Without it the tools still work with their built-in generators.
It uses Cloudflare Workers AI, so there is no API key to create or leak. A free daily allowance is included; check Cloudflare's current limits and pricing.

## Deploy (dashboard, no command line)
1. Cloudflare dashboard > Workers & Pages > Create > Worker. Name it `vr-studio-ai`. Deploy, then Edit code, paste `worker.js`, Deploy.
2. Worker > Settings > Bindings > Add > Workers AI. Variable name: `AI`.
3. Worker > Settings > Variables: add text `ALLOWED_ORIGIN` = `https://vibrantrevolve.com,https://www.vibrantrevolve.com`.
4. Copy the Worker URL (ends in `workers.dev`) into `assets/js/site-config.js` as `studioAiUrl`, then publish the site.
5. Recommended: Security > WAF > Rate limiting rules, limit that Worker URL to about 20 requests per 10 minutes per IP.

## Deploy (command line)
`cd workers/studio-ai && npx wrangler deploy`

## Notes
- The model is set at the top of `worker.js` (`MODEL`). Swap it for any text model in Cloudflare's Workers AI catalogue.
- AI copy can be wrong or generic. The page tells visitors to review it before publishing.
