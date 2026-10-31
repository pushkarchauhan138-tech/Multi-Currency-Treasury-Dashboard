import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", exposure: 1250000, rate: 83.45, risk: "Medium", color: "#2563eb" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", exposure: 980000, rate: 90.25, risk: "Low", color: "#ef4444" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", exposure: 750000, rate: 105.60, risk: "High", color: "#16a34a" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", exposure: 620000, rate: 0.56, risk: "Low", color: "#8b5cf6" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", exposure: 450000, rate: 54.20, risk: "Medium", color: "#f59e0b" }
];

// Bundled illustrative daily percentage moves. These are deliberately labelled simulated.
const rateHistory = [
  { day: "Mon", changePct: -0.95 },
  { day: "Tue", changePct: -0.72 },
  { day: "Wed", changePct: -0.46 },
  { day: "Thu", changePct: -0.38 },
  { day: "Fri", changePct: -0.12 },
  { day: "Sat", changePct: 0.10 },
  { day: "Sun", changePct: 0 }
];

// Exposure and scenario P&L are stored as INR-equivalent notionals. The selector
// converts those values for display; market quotes remain quoted as INR per FX unit.
const inrPerUnit = { INR: 1, USD: 83.45, EUR: 90.25, GBP: 105.60, JPY: 0.56, AUD: 54.20 };
const money = (value, currency = "INR") => new Intl.NumberFormat("en-IN", {
  style: "currency", currency, maximumFractionDigits: 0
}).format(value / (inrPerUnit[currency] || 1));
const signedMoney = (value, currency = "INR") => `${value >= 0 ? "+" : "−"}${money(Math.abs(value), currency)}`;

function Sidebar({ activePage, onNavigate }) {
  const items = [
    { label: "Dashboard", icon: "▦" },
    { label: "FX Exposure", icon: "♧" },
    { label: "Analytics", icon: "▥" },
    { label: "Risk Monitor", icon: "⚠" },
    { label: "Settings", icon: "⚙" }
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">₿</div>
        <div><h2>Treasury</h2><span>CONTROL CENTER</span></div>
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {items.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`nav-item ${activePage === item.label ? "selected" : ""}`}
            aria-current={activePage === item.label ? "page" : undefined}
            title={item.label}
            onClick={() => onNavigate(item.label)}
          >
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="profile">
        <div className="profile-avatar">S</div>
        <div><strong>Treasury Manager</strong><small>Administrator</small></div>
      </div>
    </aside>
  );
}

function StatCard({ icon, title, value, note, kind = "" }) {
  return (
    <article className={`stat-card ${kind}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{note}</span>
      </div>
    </article>
  );
}

function RateChart({ pair }) {
  const currency = currencies.find((item) => item.code === pair) || currencies[0];
  const history = rateHistory.map((item) => ({ day: item.day, rate: currency.rate * (1 + item.changePct / 100) }));
  const width = 520, height = 290, left = 48, right = 14, top = 15, bottom = 30;
  const rawMin = Math.min(...history.map((item) => item.rate));
  const rawMax = Math.max(...history.map((item) => item.rate));
  const padding = Math.max((rawMax - rawMin) * 0.25, currency.rate * 0.002);
  const min = rawMin - padding, max = rawMax + padding;
  const points = history.map((item, index) => ({
    ...item,
    x: left + index * (width - left - right) / (history.length - 1),
    y: top + (max - item.rate) * (height - top - bottom) / (max - min)
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${height - bottom} L ${points[0].x} ${height - bottom} Z`;
  const decimals = currency.rate < 1 ? 3 : 2;
  const ticks = Array.from({ length: 5 }, (_, index) => min + (max - min) * index / 4);
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Simulated ${pair} INR rate history`}>
        {ticks.map((tick) => {
          const y = top + (max - tick) * (height - top - bottom) / (max - min);
          return <g key={tick}><line x1={left} y1={y} x2={width - right} y2={y} className="grid-line" /><text x="2" y={y + 4} className="axis-label">{tick.toFixed(decimals)}</text></g>;
        })}
        <path d={area} className="chart-area" />
        <path d={line} className="chart-line" />
        {points.map((point) => <g key={point.day}><circle cx={point.x} cy={point.y} r="4" className="chart-dot" /><text x={point.x} y={height - 7} textAnchor="middle" className="axis-label">{point.day}</text></g>)}
      </svg>
      <div className="chart-tooltip"><span>Latest simulated rate</span><strong>{currency.rate.toFixed(decimals)} INR</strong></div>
    </div>
  );
}

function RiskGauge({ value }) {
  const safe = Math.max(0, Math.min(value, 100));
  const label = safe >= 70 ? "High Risk" : safe >= 45 ? "Medium Risk" : "Low Risk";
  const cx = 130, cy = 130, r = 90;
  const pt = (pct, radius = r) => {
    const a = Math.PI * (1 - pct / 100);
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const arc = (from, to) => {
    const [x1, y1] = pt(from), [x2, y2] = pt(to);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  const [nx, ny] = pt(safe, 68);
  return (
    <div className="risk-gauge-area">
      <svg className="risk-gauge" viewBox="0 0 260 150" aria-label={`Risk ${Math.round(safe)} percent`}>
        <path d={arc(0, 100)} fill="none" stroke="#e2e8f0" strokeWidth="22" />
        <path d={arc(0, 44.5)} fill="none" stroke="#22c55e" strokeWidth="22" />
        <path d={arc(44.5, 69.5)} fill="none" stroke="#facc15" strokeWidth="22" />
        <path d={arc(69.5, 100)} fill="none" stroke="#fb4b59" strokeWidth="22" />
        <g className="gauge-needle">
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#14233f" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="7" fill="#14233f" stroke="#fff" strokeWidth="2" />
        </g>
      </svg>
      <div className="gauge-label"><strong>{Math.round(safe)}%</strong><span className={`risk-label ${label.toLowerCase().replace(" ", "-")}`}>{label}</span></div>
      <div className="gauge-legend">
        <span><i className="dot low-dot" />Low<small>0 – 44%</small></span>
        <span><i className="dot med-dot" />Medium<small>45 – 69%</small></span>
        <span><i className="dot high-dot" />High<small>70 – 100%</small></span>
      </div>
    </div>
  );
}

function ExposureTable({ scenario, baseCurrency }) {
  return (
    <div className="table-scroll">
      <table className="exposure-table">
        <thead><tr><th>Currency</th><th>Name</th><th>Exposure ({baseCurrency})</th><th>Rate (INR)</th><th>Scenario</th><th>Risk</th><th>P&amp;L Impact</th></tr></thead>
        <tbody>
          {currencies.map((item) => {
            const change = scenario[item.code] || 0;
            const pnl = item.exposure * change / 100;
            const currencyRisk = Math.min(100, Math.round(18 + Math.abs(change) * 3 + (item.code === "GBP" ? 8 : item.code === "USD" ? 3 : 0)));
            const riskLabel = currencyRisk >= 70 ? "High" : currencyRisk >= 45 ? "Medium" : "Low";
            return <tr key={item.code}>
              <td><span className="table-flag">{item.flag}</span><b>{item.code}</b></td>
              <td className="muted-cell">{item.name}</td>
              <td>{money(item.exposure, baseCurrency)}</td>
              <td>{(item.rate * (1 + change / 100)).toFixed(item.rate < 1 ? 3 : 2)}</td>
              <td className={change > 0 ? "positive" : change < 0 ? "negative" : "muted-cell"}>{change > 0 ? "+" : ""}{change}%</td>
              <td><span className={`risk-pill ${riskLabel.toLowerCase()}`}>{riskLabel}</span></td>
              <td className={pnl >= 0 ? "positive" : "negative"}>{signedMoney(pnl, baseCurrency)}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioPanel({ scenario, setScenario }) {
  const reset = () => setScenario({ USD: 5, EUR: -3, GBP: 8, JPY: -2, AUD: 4 });
  return (
    <div className="scenario-panel">
      {currencies.map((item) => {
        const value = scenario[item.code] || 0;
        return <div className="slider-block" key={item.code}>
          <div className="slider-heading">
            <span className="flag">{item.flag}</span>
            <strong>{item.code}</strong>
            <span className={`slider-value ${value < 0 ? "negative" : value > 0 ? "positive" : ""}`} style={{ "--slider-color": item.color }}>{value > 0 ? "+" : ""}{value}%</span>
          </div>
          <input aria-label={`${item.code} FX scenario`} type="range" min="-20" max="20" step="1" value={value} style={{ "--slider-color": item.color }} onChange={(e) => setScenario((old) => ({ ...old, [item.code]: Number(e.target.value) }))} />
          <div className="range-labels"><span>-20%</span><span>+20%</span></div>
        </div>;
      })}
      <button className="reset-button" onClick={reset}>⟳ &nbsp; Reset Scenario</button>
    </div>
  );
}


function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    onLogin(email.trim());
  }

  return (
    <main className="login-screen">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">₿</div>
          <div><span>TREASURY INTELLIGENCE</span><h1>Multi-Currency Treasury</h1></div>
        </div>
        <div className="login-welcome">
          <p className="login-eyebrow">SECURE WORKSPACE</p>
          <h2>Welcome back</h2>
          <p>Sign in to monitor FX exposure, explore market scenarios, and review portfolio risk.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="username" required placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <div className="login-password-label"><label htmlFor="login-password">Password</label><span>Demo access</span></div>
          <div className="password-field">
            <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={6} placeholder="Enter at least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-submit">Sign in to dashboard <span>→</span></button>
        </form>
        <div className="login-security"><span>⌑</span><p><strong>Demo environment</strong><br />Use any valid email and a password of 6+ characters to enter.</p></div>
        <p className="login-footnote">Frontend prototype · No credentials are sent to a server</p>
      </section>
      <aside className="login-side-copy">
        <div className="login-side-pill"><span /> LIVE SIMULATION ENVIRONMENT</div>
        <h2>Clarity across<br /><em>every currency.</em></h2>
        <p>One workspace to understand exposure, stress-test exchange rates, and make risk visible.</p>
        <div className="login-preview">
          <div className="preview-top"><span>PORTFOLIO RISK</span><span className="preview-dot">● SIMULATED</span></div>
          <div className="preview-number">68<span>/100</span></div>
          <div className="preview-meter"><i /></div>
          <div className="preview-bottom"><span>FX exposure</span><strong>5 currencies tracked</strong></div>
        </div>
        <div className="login-side-footer"><span>USD / INR</span><span>EUR / INR</span><span>GBP / INR</span><span>JPY / INR</span></div>
      </aside>
    </main>
  );
}

function App() {
  const [scenario, setScenario] = useState({ USD: 5, EUR: -3, GBP: 8, JPY: -2, AUD: 4 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [baseCurrency, setBaseCurrency] = useState(() => {
    try { return localStorage.getItem("treasury-base-currency") || "INR"; } catch { return "INR"; }
  });
  const [compactMode, setCompactMode] = useState(() => {
    try { return localStorage.getItem("treasury-compact-mode") === "true"; } catch { return false; }
  });
  useEffect(() => {
    try {
      localStorage.setItem("treasury-base-currency", baseCurrency);
      localStorage.setItem("treasury-compact-mode", String(compactMode));
    } catch { /* Local storage may be disabled; settings still work for this session. */ }
  }, [baseCurrency, compactMode]);
  const [selectedPair, setSelectedPair] = useState("USD");
  const totalExposure = useMemo(() => currencies.reduce((sum, item) => sum + item.exposure, 0), []);
  const impact = currencies.reduce((sum, item) => sum + item.exposure * (scenario[item.code] || 0) / 100, 0);
  const adjustedExposure = totalExposure + impact;
  const weightedVolatility = currencies.reduce((sum, item) => sum + item.exposure * Math.abs(scenario[item.code] || 0), 0) / totalExposure;
  const riskValue = Math.min(100, Math.round(25 + weightedVolatility * 2.3));
  if (!isLoggedIn) {
    return <LoginScreen onLogin={(email) => { setLoggedInEmail(email); setIsLoggedIn(true); }} />;
  }
  return (
    <div className={`dashboard-shell ${compactMode ? "compact-mode" : ""}`}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <header className="page-header">
          <div><h1>{activePage === "Dashboard" ? "Treasury Dashboard" : activePage}</h1><p>{activePage === "Settings" ? "Configure your dashboard preferences" : "Multi-Currency FX Exposure & Risk Management · Simulated data"}</p></div>
          <div className="header-actions">
            <div className="market-status"><span />Market Simulation Active</div>
            <button type="button" className="logout-button" onClick={() => { setIsLoggedIn(false); setActivePage("Dashboard"); }} title={`Signed in as ${loggedInEmail}`}>Sign out ↗</button>
          </div>
        </header>

        {activePage !== "Settings" && <section className="stats-grid">
          <StatCard kind="blue-card" icon="▤" title={`Total FX Exposure (${baseCurrency})`} value={money(totalExposure, baseCurrency)} note="INR-equivalent sample positions" />
          <StatCard kind="green-card" icon="▥" title={`Scenario Exposure (${baseCurrency})`} value={money(adjustedExposure, baseCurrency)} note="After scenario adjustments" />
          <StatCard kind="purple-card" icon="↗" title={`Scenario Impact (${baseCurrency})`} value={signedMoney(impact, baseCurrency)} note="Positive FX move benefits assumed assets" />
          <StatCard kind="orange-card" icon="⚠" title="Overall Risk" value={`${Math.round(riskValue)}%`} note={riskValue >= 70 ? "High Risk" : riskValue >= 45 ? "Medium Risk" : "Low Risk"} />
        </section>}

        {(activePage === "Dashboard" || activePage === "Analytics" || activePage === "Risk Monitor") && <section className="middle-grid">
          <article className="panel history-panel">
            <div className="panel-heading"><div><h2>FX Rate History</h2><p>Simulated exchange-rate movement</p></div><select aria-label="Currency pair" value={selectedPair} onChange={(event) => setSelectedPair(event.target.value)}>{currencies.map((item) => <option key={item.code} value={item.code}>{item.code} / INR</option>)}</select></div>
            <RateChart pair={selectedPair} />
          </article>
          <article className="panel risk-panel">
            <div className="panel-heading"><div><h2>Risk Overview</h2><p>Current portfolio risk</p></div></div>
            <RiskGauge value={riskValue} />
          </article>
          <article className="panel scenario-card">
            <div className="panel-heading"><div><h2>Scenario Simulation</h2><p>Adjust FX rates to simulate market conditions</p></div></div>
            <ScenarioPanel scenario={scenario} setScenario={setScenario} />
          </article>
        </section>}

        {(activePage === "Dashboard" || activePage === "FX Exposure" || activePage === "Analytics") && <section className="bottom-grid">
          <article className="panel exposure-panel">
            <div className="panel-heading"><div><h2>Currency Exposure</h2><p>Current FX positions</p></div></div>
            <ExposureTable scenario={scenario} baseCurrency={baseCurrency} />
          </article>
          <article className="panel insights-panel">
            <div className="insights-title"><span>♧</span><strong>Quick Insights</strong></div>
            <div className="insight"><b className="insight-red">⌁</b><p>GBP has a high base exposure; use the scenario sliders to test its impact.</p></div>
            <div className="insight"><b className="insight-red">↓</b><p>EUR shows {scenario.EUR < 0 ? "negative" : scenario.EUR > 0 ? "positive" : "neutral"} scenario impact ({scenario.EUR}%).</p></div>
            <div className="insight"><b className="insight-green">↗</b><p>Total exposure {impact >= 0 ? "increased" : "decreased"} by {((Math.abs(impact) / totalExposure) * 100).toFixed(2)}% under current scenario.</p></div>
            <div className="insight"><b className="insight-green">⬟</b><p>Portfolio {riskValue >= 70 ? "is approaching elevated" : "remains within acceptable"} risk limits ({Math.round(riskValue)}%).</p></div>
          </article>
        </section>}

        {activePage === "Settings" && (
          <section className="panel settings-page">
            <div className="panel-heading"><div><h2>Dashboard Settings</h2><p>Update display preferences for this local demo.</p></div></div>
            <div className="settings-row">
              <div><strong>Display currency</strong><p>Convert the displayed exposure and P&amp;L values using the bundled sample rates.</p></div>
              <select value={baseCurrency} onChange={(event) => setBaseCurrency(event.target.value)} aria-label="Base currency">
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
            <div className="settings-row">
              <div><strong>Compact layout</strong><p>Reduce spacing between dashboard cards.</p></div>
              <label className="toggle-control"><input type="checkbox" checked={compactMode} onChange={(event) => setCompactMode(event.target.checked)} /><span>{compactMode ? "On" : "Off"}</span></label>
            </div>
            <div className="settings-row">
              <div><strong>Reset scenario sliders</strong><p>Restore the default simulated currency changes.</p></div>
              <button type="button" className="reset-button settings-reset" onClick={() => setScenario({ USD: 5, EUR: -3, GBP: 8, JPY: -2, AUD: 4 })}>Reset scenario</button>
            </div>
            <p className="settings-note">Selected display currency: <strong>{baseCurrency}</strong>. Exposure and scenario P&amp;L values convert using the bundled sample FX rates. Preferences are saved in this browser only; no settings are sent to a server.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
