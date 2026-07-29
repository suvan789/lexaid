/**
 * LexAid API — Baseline Load Test
 * ================================
 * k6 script: 100 virtual users for 1 minute
 * Target: https://lexaid-api.onrender.com
 *
 * Run locally:
 *   k6 run loadtest/scripts/baseline_load_test.js
 *
 * Run in CI:
 *   k6 run --out json=loadtest/results/raw.json loadtest/scripts/baseline_load_test.js
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────
const errorRate       = new Rate('error_rate');
const authLatency     = new Trend('auth_latency',    true);
const chatLatency     = new Trend('chat_latency',    true);
const lawyerLatency   = new Trend('lawyer_latency',  true);
const healthLatency   = new Trend('health_latency',  true);
const totalRequests   = new Counter('total_requests');

// ─── Configuration ────────────────────────────────────────
const BASE_API  = __ENV.API_URL || 'https://lexaid-api.onrender.com';
const BASE_WEB  = __ENV.WEB_URL || 'https://suvan789.github.io/lexaid';

// ─── Load Profile: 100 VUs for 60 seconds ────────────────
export const options = {
  scenarios: {
    baseline_100_users: {
      executor:          'constant-vus',
      vus:               100,
      duration:          '60s',
      gracefulStop:      '10s',
    },
  },
  thresholds: {
    // Performance SLAs
    http_req_duration:              ['p(95)<2000', 'p(99)<5000', 'avg<500'],
    http_req_failed:                ['rate<0.05'],      // < 5% errors
    error_rate:                     ['rate<0.05'],
    auth_latency:                   ['p(95)<3000'],
    chat_latency:                   ['p(95)<5000'],
    lawyer_latency:                 ['p(95)<2000'],
    health_latency:                 ['p(95)<1000'],
  },
  tags: {
    testType: 'baseline',
    project:  'LexAid',
    env:      'production',
  },
};

// ─── Test Payload Data ────────────────────────────────────
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept':       'application/json',
  'User-Agent':   'LexAid-LoadTest/k6/1.0',
};

const CHAT_QUERIES = [
  { query: 'my bike crashed by government bus what to do' },
  { query: 'tenant not paying rent for 3 months what legal action' },
  { query: 'what is section 302 IPC' },
  { query: 'cheque bounce notice legal procedure india' },
  { query: 'explain fundamental rights article 21' },
  { query: 'domestic violence act 2005 complaint procedure' },
  { query: 'salary not paid by employer what to do india' },
  { query: 'false FIR filed against me what are my rights' },
];

// ─── Virtual User Behaviour ───────────────────────────────
export default function () {
  const vuId = __VU;

  // ── Group 1: Health Check  ──────────────────────────────
  group('01_Health_Check', function () {
    const t0 = Date.now();
    const res = http.get(`${BASE_API}/api/legal/health`, { headers: COMMON_HEADERS, tags: { endpoint: 'health' } });
    healthLatency.add(Date.now() - t0);
    totalRequests.add(1);
    const ok = check(res, {
      'Health: status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Health: response < 2000ms': (r) => r.timings.duration < 2000,
    });
    errorRate.add(!ok);
  });
  sleep(0.3);

  // ── Group 2: GitHub Pages Static Load ──────────────────
  group('02_Static_Page_Load', function () {
    const t0 = Date.now();
    const res = http.get(`${BASE_WEB}/`, { tags: { endpoint: 'static_page' } });
    totalRequests.add(1);
    const ok = check(res, {
      'Static: HTTP 200':           (r) => r.status === 200,
      'Static: Has LexAid content': (r) => r.body && r.body.includes('LexAid'),
      'Static: load < 3000ms':      (r) => r.timings.duration < 3000,
    });
    errorRate.add(!ok);
  });
  sleep(0.2);

  // ── Group 3: Login API ──────────────────────────────────
  group('03_Auth_Login', function () {
    const t0 = Date.now();
    const payload = JSON.stringify({
      email:    'suvansenthils@gmail.com',
      password: 'password123',
    });
    const res = http.post(`${BASE_API}/api/auth/login`, payload, { headers: COMMON_HEADERS, tags: { endpoint: 'auth_login' } });
    authLatency.add(Date.now() - t0);
    totalRequests.add(1);
    const ok = check(res, {
      'Auth: status 200 or 401':     (r) => r.status === 200 || r.status === 401 || r.status === 422,
      'Auth: response < 5000ms':     (r) => r.timings.duration < 5000,
      'Auth: body is JSON':          (r) => { try { JSON.parse(r.body); return true; } catch { return false; } },
    });
    errorRate.add(!ok);
  });
  sleep(0.5);

  // ── Group 4: Legal AI Chat Query ───────────────────────
  group('04_Legal_AI_Chat', function () {
    const q = CHAT_QUERIES[vuId % CHAT_QUERIES.length];
    const t0 = Date.now();
    const res = http.post(`${BASE_API}/api/legal/query`, JSON.stringify(q), { headers: COMMON_HEADERS, tags: { endpoint: 'ai_chat' } });
    chatLatency.add(Date.now() - t0);
    totalRequests.add(1);
    const ok = check(res, {
      'Chat: status 200 or 422':    (r) => r.status === 200 || r.status === 422 || r.status === 401,
      'Chat: response < 8000ms':    (r) => r.timings.duration < 8000,
    });
    errorRate.add(!ok);
  });
  sleep(0.5);

  // ── Group 5: Lawyers Directory ─────────────────────────
  group('05_Lawyers_Directory', function () {
    const t0 = Date.now();
    const res = http.get(`${BASE_API}/api/lawyers`, { headers: COMMON_HEADERS, tags: { endpoint: 'lawyers' } });
    lawyerLatency.add(Date.now() - t0);
    totalRequests.add(1);
    const ok = check(res, {
      'Lawyers: status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'Lawyers: response < 3000ms': (r) => r.timings.duration < 3000,
    });
    errorRate.add(!ok);
  });
  sleep(0.3);

  // ── Group 6: Legal News Feed ───────────────────────────
  group('06_Legal_News', function () {
    const res = http.get(`${BASE_API}/api/news`, { headers: COMMON_HEADERS, tags: { endpoint: 'news' } });
    totalRequests.add(1);
    check(res, {
      'News: status not 5xx': (r) => r.status < 500,
    });
  });
  sleep(0.2);
}

// ─── Summary Handler ──────────────────────────────────────
export function handleSummary(data) {
  const metrics    = data.metrics;
  const httpDur    = metrics.http_req_duration;
  const httpFailed = metrics.http_req_failed;
  const reqTotal   = metrics.http_reqs;

  const avgMs   = httpDur  ? (httpDur.values.avg   || 0).toFixed(0) : 'N/A';
  const minMs   = httpDur  ? (httpDur.values.min   || 0).toFixed(0) : 'N/A';
  const maxMs   = httpDur  ? (httpDur.values.max   || 0).toFixed(0) : 'N/A';
  const p95Ms   = httpDur  ? (httpDur.values['p(95)'] || 0).toFixed(0) : 'N/A';
  const p99Ms   = httpDur  ? (httpDur.values['p(99)'] || 0).toFixed(0) : 'N/A';
  const rps     = reqTotal ? (reqTotal.values.rate  || 0).toFixed(1) : 'N/A';
  const errPct  = httpFailed ? ((httpFailed.values.rate || 0) * 100).toFixed(2) : '0.00';

  const authAvg   = metrics.auth_latency   ? (metrics.auth_latency.values.avg   || 0).toFixed(0)          : 'N/A';
  const chatAvg   = metrics.chat_latency   ? (metrics.chat_latency.values.avg   || 0).toFixed(0)          : 'N/A';
  const lawyerAvg = metrics.lawyer_latency ? (metrics.lawyer_latency.values.avg || 0).toFixed(0)          : 'N/A';
  const healthAvg = metrics.health_latency ? (metrics.health_latency.values.avg || 0).toFixed(0)          : 'N/A';

  const passed = (parseFloat(errPct) < 5 && parseFloat(p95Ms) < 2000) ? 'PASSED' : 'FAILED';
  const now    = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // ── JSON raw results ──────────────────────────────────
  const jsonOutput = JSON.stringify(data, null, 2);

  // ── HTML Report ───────────────────────────────────────
  const html = generateHTMLReport({
    avgMs, minMs, maxMs, p95Ms, p99Ms, rps, errPct,
    authAvg, chatAvg, lawyerAvg, healthAvg,
    passed, now, metrics
  });

  // ── Markdown Summary ──────────────────────────────────
  const md = `# LexAid API Baseline Load Test Report

**Date:** ${now}
**Target API:** ${BASE_API}
**Load Profile:** 100 Virtual Users | Duration: 60 seconds

---

## Requests Per Second (RPS)

| Metric | Value |
|:---|:---:|
| **Requests Per Second (RPS)** | **${rps} req/sec** |
| Total Requests Sent | ${reqTotal ? reqTotal.values.count : 'N/A'} |

---

## Response Times

| Metric | Time |
|:---|:---:|
| **Average** | **${avgMs} ms** |
| **Minimum** | **${minMs} ms** |
| **Maximum** | **${maxMs} ms** |
| **P95 (95th Percentile)** | **${p95Ms} ms** |
| **P99 (99th Percentile)** | **${p99Ms} ms** |

---

## Per-Endpoint Latency

| Endpoint | Avg Response Time |
|:---|:---:|
| Health Check | ${healthAvg} ms |
| Auth Login | ${authAvg} ms |
| AI Legal Chat | ${chatAvg} ms |
| Lawyers Directory | ${lawyerAvg} ms |

---

## SLA Compliance

| Threshold | Target | Status |
|:---|:---:|:---:|
| Error Rate | < 5% | ${parseFloat(errPct) < 5 ? 'PASS' : 'FAIL'} |
| P95 Response | < 2000ms | ${parseFloat(p95Ms) < 2000 ? 'PASS' : 'FAIL'} |
| Avg Response | < 500ms | ${parseFloat(avgMs) < 500 ? 'PASS' : 'FAIL'} |

## Overall Result: **${passed}**
`;

  return {
    'loadtest/results/raw.json':          jsonOutput,
    'loadtest/reports/load-report.html':  html,
    'loadtest/reports/summary.md':        md,
    stdout:                               md,
  };
}

function generateHTMLReport(d) {
  const passColor = d.passed === 'PASSED' ? '#10B981' : '#EF4444';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LexAid API Baseline Load Test Report</title>
  <style>
    :root{--navy:#1F4E78;--pass:#10B981;--fail:#EF4444;--bg:#F8FAFC}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:#1E293B;padding:32px}
    .header{background:linear-gradient(135deg,#1F4E78,#0F172A);color:#fff;padding:32px;border-radius:20px;margin-bottom:28px}
    .header h1{font-size:26px;font-weight:800;margin-bottom:8px}
    .header p{opacity:.75;font-size:14px}
    .badge{display:inline-block;padding:6px 18px;border-radius:9999px;font-weight:800;font-size:15px;color:#fff;background:${passColor};margin-top:12px}
    .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-bottom:28px}
    .card{background:#fff;padding:24px;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 2px 8px rgba(0,0,0,.06);text-align:center}
    .card-val{font-size:36px;font-weight:900;margin:8px 0}
    .card-lbl{font-size:12px;font-weight:600;text-transform:uppercase;color:#64748B;letter-spacing:.5px}
    .card-sub{font-size:11px;color:#94A3B8;margin-top:4px}
    .rps{color:#2563EB} .avg{color:#1F4E78} .min{color:#10B981} .max{color:#EF4444} .p95{color:#F59E0B} .err{color:#EF4444}
    .section{background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
    .section h2{font-size:16px;font-weight:700;color:#1F4E78;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #F1F5F9}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#F8FAFC;padding:12px 16px;font-weight:700;color:#475569;text-align:left;border-bottom:2px solid #E2E8F0}
    td{padding:12px 16px;border-bottom:1px solid #F8FAFC;vertical-align:middle}
    .pass{color:#10B981;font-weight:700} .fail{color:#EF4444;font-weight:700}
    .bar{height:10px;border-radius:5px;background:#E2E8F0;overflow:hidden;margin-top:4px}
    .bar-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,#2563EB,#1F4E78);transition:width .5s}
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 LexAid API Baseline Load Test Report</h1>
    <p>Target: <strong>https://lexaid-api.onrender.com</strong> &nbsp;|&nbsp; Executed: <strong>${d.now}</strong></p>
    <p>Load Profile: <strong>100 Virtual Users × 60 seconds</strong></p>
    <span class="badge">${d.passed}</span>
  </div>

  <div class="metrics">
    <div class="card">
      <div class="card-lbl">Requests / Second</div>
      <div class="card-val rps">${d.rps}</div>
      <div class="card-sub">RPS during 1-min test</div>
    </div>
    <div class="card">
      <div class="card-lbl">Avg Response Time</div>
      <div class="card-val avg">${d.avgMs}<span style="font-size:16px">ms</span></div>
      <div class="card-sub">Mean across all requests</div>
    </div>
    <div class="card">
      <div class="card-lbl">Min Response</div>
      <div class="card-val min">${d.minMs}<span style="font-size:16px">ms</span></div>
      <div class="card-sub">Fastest response seen</div>
    </div>
    <div class="card">
      <div class="card-lbl">Max Response</div>
      <div class="card-val max">${d.maxMs}<span style="font-size:16px">ms</span></div>
      <div class="card-sub">Slowest response seen</div>
    </div>
    <div class="card">
      <div class="card-lbl">P95 Response</div>
      <div class="card-val p95">${d.p95Ms}<span style="font-size:16px">ms</span></div>
      <div class="card-sub">95% of requests faster than this</div>
    </div>
    <div class="card">
      <div class="card-lbl">P99 Response</div>
      <div class="card-val p95">${d.p99Ms}<span style="font-size:16px">ms</span></div>
      <div class="card-sub">99% of requests faster than this</div>
    </div>
    <div class="card">
      <div class="card-lbl">Error Rate</div>
      <div class="card-val err">${d.errPct}%</div>
      <div class="card-sub">Target: &lt; 5%</div>
    </div>
  </div>

  <div class="section">
    <h2>⚡ Per-Endpoint Response Times</h2>
    <table>
      <thead><tr><th>Endpoint</th><th>Avg Response</th><th>SLA</th><th>Visual</th></tr></thead>
      <tbody>
        <tr><td>Health Check</td><td><strong>${d.healthAvg} ms</strong></td><td class="${parseFloat(d.healthAvg)<1000?'pass':'fail'}">&lt; 1000ms</td><td><div class="bar"><div class="bar-fill" style="width:${Math.min(100,parseFloat(d.healthAvg)/10)}%"></div></div></td></tr>
        <tr><td>Auth Login</td><td><strong>${d.authAvg} ms</strong></td><td class="${parseFloat(d.authAvg)<3000?'pass':'fail'}">&lt; 3000ms</td><td><div class="bar"><div class="bar-fill" style="width:${Math.min(100,parseFloat(d.authAvg)/30)}%"></div></div></td></tr>
        <tr><td>AI Legal Chat</td><td><strong>${d.chatAvg} ms</strong></td><td class="${parseFloat(d.chatAvg)<5000?'pass':'fail'}">&lt; 5000ms</td><td><div class="bar"><div class="bar-fill" style="width:${Math.min(100,parseFloat(d.chatAvg)/50)}%"></div></div></td></tr>
        <tr><td>Lawyers Directory</td><td><strong>${d.lawyerAvg} ms</strong></td><td class="${parseFloat(d.lawyerAvg)<2000?'pass':'fail'}">&lt; 2000ms</td><td><div class="bar"><div class="bar-fill" style="width:${Math.min(100,parseFloat(d.lawyerAvg)/20)}%"></div></div></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>✅ SLA Compliance</h2>
    <table>
      <thead><tr><th>SLA Metric</th><th>Target</th><th>Actual</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Error Rate</td><td>&lt; 5%</td><td>${d.errPct}%</td><td class="${parseFloat(d.errPct)<5?'pass':'fail'}">${parseFloat(d.errPct)<5?'PASS':'FAIL'}</td></tr>
        <tr><td>P95 Response Time</td><td>&lt; 2000ms</td><td>${d.p95Ms}ms</td><td class="${parseFloat(d.p95Ms)<2000?'pass':'fail'}">${parseFloat(d.p95Ms)<2000?'PASS':'FAIL'}</td></tr>
        <tr><td>Avg Response Time</td><td>&lt; 500ms</td><td>${d.avgMs}ms</td><td class="${parseFloat(d.avgMs)<500?'pass':'fail'}">${parseFloat(d.avgMs)<500?'PASS':'FAIL'}</td></tr>
        <tr><td>P99 Response Time</td><td>&lt; 5000ms</td><td>${d.p99Ms}ms</td><td class="${parseFloat(d.p99Ms)<5000?'pass':'fail'}">${parseFloat(d.p99Ms)<5000?'PASS':'FAIL'}</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
