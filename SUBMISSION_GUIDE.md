# Mini Project Submission Notes

## Project title
**Multi-Currency Treasury Dashboard — Simulated FX Exposure & Scenario Analysis**

## Problem statement
Finance teams can have exposure to multiple currencies. This prototype demonstrates how a treasury dashboard can summarize positions, visualize exchange-rate movement, and estimate the directional impact of hypothetical rate changes.

## Objectives
- Present multiple currency positions in one dashboard.
- Visualize illustrative exchange-rate history.
- Let users test currency moves with interactive sliders.
- Recalculate estimated portfolio impact and a simple risk indicator in the browser.
- Provide responsive navigation and basic display settings.

## Tech stack
- React for reusable UI components and state.
- Vite for local development and production bundling.
- CSS for responsive styling.
- JavaScript for scenario calculations and currency formatting.
- Browser localStorage for display preferences only.

## Key calculation
For each currency, `scenario P&L = INR-equivalent exposure × (scenario percentage / 100)`. The portfolio impact is the sum of the individual impacts, and adjusted exposure is base exposure plus that impact. The current model assumes asset positions; liabilities require the opposite sign.

## UI/UX decisions
- A dedicated demo sign-in screen separates the entry point from the dashboard.
- Sidebar navigation separates the dashboard into five understandable views.
- KPI cards expose the most important totals immediately.
- A currency selector changes the chart, and scenario sliders recalculate values without a page reload.
- Risk color labels, table badges, focus outlines, horizontal table scrolling and responsive layout improve scanning and accessibility.
- Settings provide display-currency and compact-layout preferences.

## What was fixed/improved in this version
- Scenario impact, adjusted exposure, per-currency table P&L and risk score update from the slider values.
- The risk gauge now includes a value-dependent indicator rather than only static colored bands.
- Display-currency selection now converts the notional/P&L values instead of only changing the setting label.
- Settings persist in the browser when localStorage is available.
- Mobile navigation no longer hides all inactive pages.
- Login inputs have required/email/password-length validation and the password can be shown or hidden.
- The chart reads from a bundled simulated daily-change series and clearly identifies itself as simulated.

## Limitations to state honestly
This is a front-end educational simulation. It does not have real authentication, a backend, a database, live exchange rates, or a validated financial risk model. The data and conversion rates are illustrative. Do not describe the sign-in as secure production authentication or the risk gauge as real VaR.

## Short viva explanation
“My mini project is a Multi-Currency Treasury Dashboard built with React and Vite. It displays simulated FX exposure for USD, EUR, GBP, JPY and AUD against INR. The scenario sliders let a user model percentage changes and the dashboard recalculates estimated P&L impact, adjusted exposure and an illustrative risk score instantly on the client side. I also implemented currency display conversion, responsive navigation and browser-local preferences. It is a prototype; live rates and secure authentication would require a backend/API integration.”
