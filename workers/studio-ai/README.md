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

## Everything this one Worker does

| Task | Used by | Needs |
| --- | --- | --- |
| `copy`, `names`, `taglines` | Copy Writer, Name Generator, Brand Studio | AI binding |
| `transcribe`, `speak` | Voice Studio, Video Studio voice-over | AI binding |
| `chat` | The VR assistant (answers from your price list and store) | AI binding |
| `rewrite` | CV Builder, Flyer & Post Maker, news "VR take" | AI binding |
| `image` | Flyer & Post Maker, Video Studio AI pictures | AI binding |
| `contact` | Contact form | optional KV `LEADS`, `RESEND_API_KEY`, `TURNSTILE_SECRET` |
| `verify-payment` | Store checkout (Paystack, Flutterwave) | `PAYSTACK_SECRET` / `FLW_SECRET` |

Everything optional is off until you add it. Secrets are added with `wrangler secret put NAME` and never go in a file. After any change run `wrangler deploy` again.

**Model names** are at the top of `worker.js`. Check them in the Workers AI model catalogue; if one changes, edit it there.

**Per-visitor limits** (per 10 minutes): chat 20, contact 5, payment checks 20, images 6, rewrites 30, everything else 40.

**News takes:** add a secret `NEWS_KEY` to the Worker, then in GitHub (Settings, Secrets and variables, Actions) add secret `VR_NEWS_KEY` with the same text and a variable `VR_WORKER_URL` with your Worker link. The news workflow then writes a short "VR take" under new stories. They are labelled "AI-assisted" and arrive in the pull request, so read them before you merge.

## Reliability
- **Fallback models.** Each task tries a short list of models in order. If the first is down, renamed or busy, the next one answers. Override a list with a Worker variable: `TEXT_MODELS`, `STT_MODELS`, `TTS_MODELS` or `IMG_MODELS` (comma separated, first is tried first).
- **Check it is alive.** Open your Worker link in a browser. You should see `{"ok":true,"service":"vr-studio-ai",...}` and a list showing which optional features are set up.
- **Cache.** The assistant remembers the answer to a repeated first question for an hour, so common questions cost nothing.
- More models do not make a site more reliable by themselves. Fallbacks, limits and caching do, and every extra feature uses more of your free allowance. Watch Workers AI usage in the Cloudflare dashboard.

### Fallback chains (what happens when a model fails)

Model names were checked against the Workers AI catalogue in October 2026. Cloudflare adds and retires models often, so look at https://developers.cloudflare.com/workers-ai/models/ now and then.

| Job | Tried in this order |
|---|---|
| Text (assistant, copy, CV, cover letters, descriptions) | Llama 3.3 70B fast, Llama 4 Scout, Mistral Small 3.1, GPT-OSS 20B, Llama 3.1 8B (three variants) |
| Speech to text | Whisper large v3 turbo, Whisper |
| AI images | FLUX schnell, SDXL Lightning, Dreamshaper 8 LCM, SDXL base |
| Voice (MP3) | MeloTTS (many languages), then Aura-1 (English only) |

A model that errors, is retired or is not on your account is skipped silently and the next one answers. The Worker understands the different answer formats the models use. Change any list with the variables `TEXT_MODELS`, `STT_MODELS`, `TTS_MODELS`, `IMG_MODELS` (comma separated model names). If every model fails, the website falls back to its built-in templates, so visitors still get a result.
