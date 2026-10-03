# Optional: real AI replies for the chat assistant

The assistant already works without this, using answers from `assets/data/assistant.json`.
This Worker adds real AI answers. It costs money per use (Anthropic bills by usage), so:
1. Create an Anthropic API key at console.anthropic.com and SET A MONTHLY SPEND LIMIT there.
2. In Cloudflare: Workers & Pages > Create > Worker. Paste `worker.js`, deploy.
3. Worker > Settings > Variables: add secret `ANTHROPIC_API_KEY`, and text `ALLOWED_ORIGIN` = https://vibrantrevolve.com
4. Add a Cloudflare rate-limiting rule for the worker URL (the built-in limiter is best-effort only).
5. Put the Worker URL in `assets/js/site-config.js` as `assistantUrl`.
6. If prices or services change, update the FACTS list in `worker.js` and `assets/data/assistant.json`.
Never put the API key in the website files.
