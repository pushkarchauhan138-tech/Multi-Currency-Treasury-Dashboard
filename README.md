# Multi-Currency Treasury Dashboard

A responsive React + Vite frontend prototype for visualizing simulated foreign-exchange (FX) exposure and testing exchange-rate scenarios. This is an educational mini-project, not a real trading or treasury system.

## Run locally (Windows)

1. Install Node.js LTS (Node 20+ recommended).
2. Extract this folder and open `treasury-dashboard` in VS Code.
3. In the terminal run:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

4. Open the localhost URL printed by Vite (usually `http://localhost:5173`).
5. To create a production build, run `npm.cmd run build`.

If PowerShell says running `npm.ps1` is disabled, use `npm.cmd` as shown above.

## Demo access

This is a **demo-only sign-in screen**. Enter any valid email address and a password of at least 6 characters. No account is created and no credentials are sent to a server.

## Implemented features

- Responsive sign-in screen with email/password validation and show/hide password.
- Sidebar navigation: Dashboard, FX Exposure, Analytics, Risk Monitor and Settings. Mobile navigation remains available as icon buttons.
- KPI cards for total exposure, scenario-adjusted exposure, scenario impact and risk score.
- Simulated seven-day FX history chart with a currency-pair selector (USD, EUR, GBP, JPY and AUD quoted against INR).
- Risk gauge with a moving indicator and low/medium/high label.
- Exposure table with per-currency scenario, risk and P&L impact.
- Five scenario sliders (-20% to +20%) with immediate recalculation and a reset action.
- Display-currency conversion (INR, USD, EUR, GBP, JPY, AUD) using bundled illustrative rates.
- Compact-layout toggle and browser-local persistence for settings.

## Calculation assumptions

- Exposure values are stored as **INR-equivalent sample notionals**. The selected display currency changes the way those notional and P&L values are displayed.
- P&L impact for each row is `INR-equivalent exposure × scenario change (%)`. The portfolio impact is the sum of the row impacts.
- The demo assumes each position behaves like a foreign-currency asset: a positive FX move produces positive P&L and a negative move produces negative P&L. Liabilities would need the opposite sign.
- The risk score is a simple illustrative weighted-volatility indicator, not a validated financial risk model or VaR calculation.
- Rate-history movements and rates are illustrative/simulated; they are not live exchange rates.

## Known limitations (important for the viva)

- No backend, real user authentication, database, role permissions or server-side settings.
- No live FX provider or automatic refresh.
- No real financial data, hedging instruments, liability positions, transaction fees, VaR, or stress-testing methodology.
- Currency conversion uses the same bundled sample rates as the prototype, so it is not suitable for financial decisions.

## Suggested demo flow

1. Sign in with any valid email and 6+ character password.
2. Show the four KPI cards and simulated FX chart.
3. Move the GBP or USD scenario slider and show the impact, exposure and risk gauge update immediately.
4. Open FX Exposure and explain the table columns.
5. Open Analytics and Risk Monitor to show chart/gauge views.
6. Open Settings, change display currency and toggle compact layout. Refresh the page to demonstrate browser-local settings persistence.
7. Reset a scenario and sign out.
