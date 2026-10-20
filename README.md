## Food Tier

A Devvit web app for food subreddits. Users rate the places they've eaten, keep a personal food list, and see community top-10 tier lists per food item.

- **Splash (inline, `splash.html`)**: two tabs
  - _My Food List_: the current user's reviews and ratings
  - _Food Tier_: top 10 places for a selected food, ranked by average rating (S–D tiers)
- **Create (expanded, `create.html`)**: form to add a review; saving it also posts it to the subreddit

### Server

- `src/server/routes/api.ts`: `GET /api/init`, `GET /api/tier?food=…`, `POST /api/reviews`
- `src/server/routes/menu.ts`: mod menu item to create the Food Tier hub post
- `src/server/routes/triggers.ts`: on install, creates the hub post once (idempotent, never fails the install)
- `src/server/core/reviews.ts`: Redis storage for reviews, food popularity and per-food tiers

### Commands

- `npm run dev`: playtest on Reddit
- `npm run build`: build client and server
- `npm run type-check` / `npm run lint` / `npm run test`
- `npm run deploy`: type-check, lint, and upload a new version
- `npm run launch`: deploy and publish for review
