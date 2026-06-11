# PantryPal Pro

> **Note:** Due to limit reaching and Supabase exhausting again and again, the Supabase integration has been removed. Authentication and profile data are now stored entirely in the browser's LocalStorage.

PantryPal Pro is a static web app prototype for a smart kitchen assistant and recipe generator. It combines a marketing landing experience, user authentication, and a dashboard for browsing recipes, saving favorites, and simulating pantry scanning.

---

## What this project includes

- **Landing page**: `src/html/landing.html` with hero sections, features, pricing, and CTA buttons.
- **Authentication**: `src/html/auth.html` and `src/js/auth.js` handle sign up, login, and Supabase authentication.
- **Dashboard**: `src/html/dashboard.html` and `src/js/dashboard.js` show recipe browsing, filters, favorites, and a pantry image upload flow.
- **Supabase integration**: `src/js/supabase.config.js`, `src/js/services/supabaseClient.js`, and `src/js/services/authService.js` handle auth and profile storage.
- **Static content pages**: `src/html/about.html`, `src/html/contact.html`, `src/html/career.html`, `src/html/privacy.html`, and `src/html/terms.html`.
- **Styles**: CSS files in `src/css/` for each page and shared styling.
- **Assets**: Images and icons in `src/assets/`.
- **Database schema**: `database/schema.sql` and `src/database/schema.sql` hold the Supabase schema hints and profile table definitions.

---

## How it works

1. **Splash screen**
   - `index.html` is a quick splash page that redirects to `src/html/landing.html`.
2. **Landing page**
   - Visitors can view app marketing, features, pricing, and click through to sign up or log in.
3. **Authentication**
   - Sign up and login are powered by Supabase Auth.
   - When a user signs up, a profile record is also created in the Supabase `profiles` table.
4. **Dashboard**
   - After login, the dashboard shows recipe cards, filters, saved favorites, and a pantry scanner upload area.
   - Favorites are stored locally in `localStorage`.
   - Pantry image upload is mocked; it currently displays a preview and shows a placeholder notice for AI scanning.
5. **Data and features**
   - The dashboard uses a recipe dataset in `src/js/data.js`.
   - Some features are visual/prototype-only, including goal progress and AI-based pantry scanning.

---

## Setup instructions

1. Open the project folder in your code editor.
2. Configure Supabase:
   - Edit `src/js/supabase.config.js`.
   - Replace `SUPABASE_CONFIG.url` and `anonKey` with your Supabase project values.
   - Keep this file private and do not commit your keys.
3. Open the app:
   - Recommended: use a local HTTP server to avoid browser restrictions.
   - Example: run a simple static server from the project root.
   - Or open `index.html` directly in your browser.
4. Use the app:
   - Landing page → Auth page → Dashboard.
   - For free users, the pantry scanner section is locked and shows an upgrade prompt.
   - Favorites persist in the browser.

---

## Important notes

- `src/js/app.js` is mostly a placeholder for global interactions.
- The app is primarily static HTML/CSS/JS with Supabase handling auth.
- The pantry scanner is currently a planned feature and does not perform real AI detection yet.
- The Supabase client warns if `supabase.config.js` is missing or not configured.
- The current data flow uses `localStorage` for user session/profile caching on the client.

---

## Useful files

- `index.html` — initial splash redirect.
- `src/html/landing.html` — marketing homepage.
- `src/html/auth.html` — login/signup page.
- `src/html/dashboard.html` — main app interface.
- `src/js/services/authService.js` — Supabase auth wrapper.
- `src/js/services/supabaseClient.js` — Supabase client initializer.
- `src/js/supabase.config.js` — Supabase project config.
- `src/js/dashboard.js` — dashboard behavior and filtering.
- `src/js/auth.js` — auth page behavior.
- `database/schema.sql` — DB schema reference.

---

## Project goals

PantryPal Pro is designed to:

- help users plan meals using pantry ingredients,
- make cooking healthier and reduce waste,
- demonstrate a modern static web app with Supabase auth,
- prototype an AI-powered recipe workflow.
