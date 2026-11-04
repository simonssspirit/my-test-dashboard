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

Deploy the contents of `dist/` to a static hosting provider. The preview server
is for checking the build locally, not serving it in production. For hosting
under a subdirectory, configure Vite's `base` option before building.

## Starter features

- Revenue, orders, customer, and conversion summary cards.
- A revenue chart and recent activity list.
- A period selector that switches between weekly and monthly sample reports.
- CSV export of the selected report.
- Responsive layouts, keyboard focus indicators, and a skip-to-content link.

All metrics and activity are illustrative, hardcoded demo data. There is no
backend, authentication, payment processing, or live analytics connection.
The interface uses system fonts and does not require external font services.

## Project structure

```text
src/
  App.tsx       Dashboard UI, sample data, and CSV export
  App.css       Dashboard components and responsive layouts
  index.css     Global styles
  main.tsx      React entry point
```

Edit `src/App.tsx` to customize the dashboard or connect your own data source.
Update `src/App.css` and `src/index.css` to change the theme.
