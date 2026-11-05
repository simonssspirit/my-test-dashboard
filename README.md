# My Test Dashboard

A clean, responsive dashboard starter built with React, TypeScript, and Vite.

## Requirements

Node.js 20.19+ or 22.12+ (a supported LTS release is recommended), with npm.

## Get started

```sh
git clone https://github.com/simonssspirit/my-test-dashboard.git
cd my-test-dashboard
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).
After the first install, use `npm ci` to install the locked dependency versions.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Type-check the project and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally after building. |
| `npm run lint` | Check TypeScript and React code with Oxlint. |
| `npm test` | Type-check and run the Chromium browser regression tests against a production build. |

Deploy the contents of `dist/` to a static hosting provider. The preview server
is for checking the build locally, not serving it in production. For hosting
under a subdirectory, configure Vite's `base` option before building.

## Starter features

- Revenue, orders, customer, and conversion summary cards.
- A revenue chart bound to an editable data grid, plus a recent activity list.
- Immediate chart updates and browser-local persistence of valid revenue edits.
- A period selector that switches between weekly and monthly sample reports.
- CSV export of the selected report.
- Responsive layouts, keyboard focus indicators, and a skip-to-content link.

Revenue values are relative sample scores from 0 to 100, not currency amounts.
Edit them in the **Revenue data** table to update the chart immediately. Weekly
and monthly edits are saved independently in local storage under
`my-test-dashboard:revenue:v1` and restored when you reload. Blank or out-of-range
edits show an error and leave the last valid chart and saved values unchanged.
If browser storage is blocked or full, edits still work in the current tab and
the dashboard displays a warning. Invalid saved data falls back to the samples.
Changes are local to this browser and origin, not shared across devices.
Other open tabs pick up saved values on reload, not through live synchronization.

Summary cards, CSV summary exports, and recent activity remain separate,
illustrative demo data. There is no backend, authentication, payment processing,
or live analytics connection.
The interface uses system fonts and does not require external font services.

## Project structure

```text
src/
  App.tsx         Dashboard UI, sample data, and CSV export
  App.css         Dashboard components and responsive layouts
  RevenueGrid.tsx Editable revenue table and cell validation
  revenueData.ts  Sample revenue data and local-storage handling
  index.css       Global styles
  main.tsx        React entry point
```

Edit `src/App.tsx` to customize the dashboard or connect your own data source.
Update `src/App.css` and `src/index.css` to change the theme.

## Tests

After installing dependencies, install the Chromium test browser once:

```sh
npx playwright install chromium
npm test
```

On Linux CI hosts without browser system libraries, use
`npx playwright install --with-deps chromium` during setup. Tests cover live
grid/chart updates, both report periods, reload persistence, invalid edits,
malformed saved data, blocked/full storage, keyboard and mobile use, and the
existing CSV summary export. The test server uses `127.0.0.1:4173` and stops when
the run finishes.
