<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/552f3732-adff-4dc0-b593-bd1c0cef9d10

## Run Locally

**Prerequisites:**  Node.js


1. From the workspace root, run `docker compose up -d`.
2. Open `http://localhost:4200`.

The development container installs dependencies with `npm ci`, keeps Linux `node_modules` in a Docker volume, and runs Angular with host `0.0.0.0` on port `4200`.
