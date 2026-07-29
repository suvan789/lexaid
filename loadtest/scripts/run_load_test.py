"""
LexAid API — Python Baseline Load Test Runner
===============================================
Simulates 100 concurrent users for 60 seconds using threading.
Generates HTML + Markdown report with real RPS and response times.

Usage:
  python loadtest/scripts/run_load_test.py
"""

import concurrent.futures
import threading
import time
import statistics
import json
import os
import sys
import requests
from datetime import datetime

# ─── Configuration ────────────────────────────────────────
API_URL     = os.environ.get("API_URL", "https://lexaid-api.onrender.com")
WEB_URL     = os.environ.get("WEB_URL", "https://suvan789.github.io/lexaid")
VUS         = int(os.environ.get("VUS", "100"))
DURATION    = int(os.environ.get("DURATION", "60"))    # seconds
BUILD       = os.environ.get("BUILD_NUMBER", f"LOCAL-{int(time.time())}")

HEADERS = {
    "Content-Type": "application/json",
    "Accept":       "application/json",
    "User-Agent":   "LexAid-LoadTest/Python/1.0",
}

CHAT_QUERIES = [
    {"query": "my bike crashed by government bus what to do"},
    {"query": "tenant not paying rent for 3 months"},
    {"query": "what is section 302 IPC murder"},
    {"query": "cheque bounce notice legal procedure india"},
    {"query": "explain fundamental rights article 21"},
    {"query": "domestic violence act 2005 complaint procedure"},
    {"query": "salary not paid by employer what to do"},
    {"query": "false FIR filed against me what are my rights"},
]

# ─── Shared Metrics Store ─────────────────────────────────
results_lock  = threading.Lock()
all_durations = []
all_errors    = []
req_count     = [0]
endpoint_data = {}


def make_request(vu_id: int):
    """Single virtual user iteration."""
    import random

    tasks = [
        ("GET",  f"{API_URL}/api/legal/health",  None,                               "Health Check"),
        ("POST", f"{API_URL}/api/auth/login",     {"email": "suvansenthils@gmail.com", "password": "password123"}, "Auth Login"),
        ("POST", f"{API_URL}/api/legal/query",    random.choice(CHAT_QUERIES),       "AI Chat Query"),
        ("GET",  f"{API_URL}/api/lawyers",        None,                               "Lawyers List"),
        ("GET",  f"{WEB_URL}/",                   None,                               "Static Page"),
    ]

    for method, url, payload, name in tasks:
        t_start = time.time()
        error   = None
        status  = 0
        try:
            if method == "POST":
                resp = requests.post(url, json=payload, headers=HEADERS, timeout=15)
            else:
                resp = requests.get(url, headers=HEADERS, timeout=15)
            status = resp.status_code
            if status >= 500:
                error = f"HTTP {status}"
        except Exception as exc:
            error = str(exc)[:80]

        dur_ms = (time.time() - t_start) * 1000

        with results_lock:
            req_count[0] += 1
            all_durations.append(dur_ms)
            if error:
                all_errors.append({"vu": vu_id, "endpoint": name, "error": error})
            if name not in endpoint_data:
                endpoint_data[name] = []
            endpoint_data[name].append(dur_ms)

        time.sleep(0.3)   # think time between requests


def run_load_test():
    """Run 100 concurrent VUs for DURATION seconds."""
    print(f"\n{'='*60}")
    print(f"  LEXAID API BASELINE LOAD TEST")
    print(f"  Target      : {API_URL}")
    print(f"  Virtual Users: {VUS}")
    print(f"  Duration     : {DURATION}s")
    print(f"  Build        : {BUILD}")
    print(f"{'='*60}\n")

    # Warm up the server first
    print("Warming up API server (Render free tier cold-start)...")
    try:
        r = requests.post(f"{API_URL}/api/auth/login",
                          json={"email": "warmup@test.com", "password": "warmup"},
                          headers=HEADERS, timeout=30)
        print(f"  Warmup response: HTTP {r.status_code} ({r.elapsed.total_seconds()*1000:.0f}ms)")
    except Exception as e:
        print(f"  Warmup warning: {e}")
    time.sleep(3)

    print(f"\nStarting {VUS} virtual users for {DURATION} seconds...\n")

    start_time = time.time()
    end_time   = start_time + DURATION
    futures    = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=VUS) as executor:
        # Keep submitting tasks until duration expires
        while time.time() < end_time:
            for vu_id in range(VUS):
                if time.time() >= end_time:
                    break
                futures.append(executor.submit(make_request, vu_id))
            time.sleep(0.5)

        # Wait for all futures to complete
        concurrent.futures.wait(futures, timeout=30)

    actual_duration = time.time() - start_time

    # ─── Compute Metrics ──────────────────────────────
    if not all_durations:
        print("No requests completed. Check API connectivity.")
        return

    total_reqs = req_count[0]
    rps        = total_reqs / actual_duration
    avg_ms     = statistics.mean(all_durations)
    min_ms     = min(all_durations)
    max_ms     = max(all_durations)
    sorted_d   = sorted(all_durations)
    p50_ms     = sorted_d[int(len(sorted_d) * 0.50)]
    p95_ms     = sorted_d[int(len(sorted_d) * 0.95)]
    p99_ms     = sorted_d[int(len(sorted_d) * 0.99)]
    err_count  = len(all_errors)
    err_rate   = (err_count / total_reqs * 100) if total_reqs else 0

    # ─── Print Live Summary ────────────────────────────
    print(f"\n{'='*60}")
    print(f"  FINAL LOAD TEST RESULTS")
    print(f"{'='*60}")
    print(f"  Duration         : {actual_duration:.1f}s")
    print(f"  Total Requests   : {total_reqs:,}")
    print(f"  Requests/Second  : {rps:.1f} req/sec")
    print(f"  Failures         : {err_count} ({err_rate:.2f}%)")
    print(f"")
    print(f"  Response Times:")
    print(f"    Average        : {avg_ms:.0f} ms")
    print(f"    Minimum        : {min_ms:.0f} ms")
    print(f"    Maximum        : {max_ms:.0f} ms")
    print(f"    P50 (Median)   : {p50_ms:.0f} ms")
    print(f"    P95            : {p95_ms:.0f} ms")
    print(f"    P99            : {p99_ms:.0f} ms")
    print(f"")
    print(f"  Per-Endpoint Averages:")
    for ep, times in endpoint_data.items():
        ep_avg = statistics.mean(times)
        print(f"    {ep:<25} : {ep_avg:.0f} ms  ({len(times)} reqs)")
    print(f"{'='*60}")

    sla_passed = err_rate < 5.0 and p95_ms < 2000
    print(f"\n  SLA STATUS: {'PASSED' if sla_passed else 'FAILED'}")
    print(f"    Error Rate < 5%     : {'PASS' if err_rate < 5 else 'FAIL'} ({err_rate:.2f}%)")
    print(f"    P95 < 2000ms        : {'PASS' if p95_ms < 2000 else 'FAIL'} ({p95_ms:.0f}ms)")
    print(f"    Avg < 500ms         : {'PASS' if avg_ms < 500 else 'WARN'} ({avg_ms:.0f}ms)")
    print(f"\n{'='*60}\n")

    # ─── Save JSON Results ─────────────────────────────
    os.makedirs("loadtest/results", exist_ok=True)
    json_data = {
        "build": BUILD,
        "timestamp": datetime.now().isoformat(),
        "config": {"vus": VUS, "duration": DURATION, "api_url": API_URL},
        "metrics": {
            "total_requests": total_reqs,
            "rps": round(rps, 2),
            "error_count": err_count,
            "error_rate_pct": round(err_rate, 2),
            "response_time_ms": {
                "avg": round(avg_ms, 1), "min": round(min_ms, 1), "max": round(max_ms, 1),
                "p50": round(p50_ms, 1), "p95": round(p95_ms, 1), "p99": round(p99_ms, 1),
            }
        },
        "endpoints": {ep: {"avg_ms": round(statistics.mean(t), 1), "count": len(t)}
                      for ep, t in endpoint_data.items()},
        "errors": all_errors[:20],
        "sla_passed": sla_passed,
    }
    with open("loadtest/results/raw.json", "w") as f:
        json.dump(json_data, f, indent=2)

    # ─── Generate Reports ──────────────────────────────
    generate_reports(json_data)
    return json_data


def generate_reports(d: dict):
    """Generate HTML and Markdown reports from load test data."""
    m   = d["metrics"]
    rt  = m["response_time_ms"]
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    os.makedirs("loadtest/reports", exist_ok=True)

    pass_color = "#10B981" if d["sla_passed"] else "#EF4444"
    status_txt = "PASSED" if d["sla_passed"] else "FAILED"

    ep_rows = ""
    for ep, info in d.get("endpoints", {}).items():
        sla_ok = info["avg_ms"] < 3000
        ep_rows += f"""
        <tr>
          <td>{ep}</td>
          <td><strong>{info['avg_ms']} ms</strong></td>
          <td>{info['count']}</td>
          <td style="color:{'#10B981' if sla_ok else '#EF4444'};font-weight:700">{'PASS' if sla_ok else 'WARN'}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LexAid API Baseline Load Test Report</title>
  <style>
    :root{{--navy:#1F4E78}}
    body{{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#F8FAFC;color:#1E293B;padding:32px;max-width:1100px;margin:0 auto}}
    .header{{background:linear-gradient(135deg,#1F4E78,#0F172A);color:#fff;padding:32px;border-radius:20px;margin-bottom:28px}}
    .header h1{{font-size:24px;font-weight:800;margin-bottom:8px}}
    .header p{{opacity:.75;font-size:13px}}
    .badge{{display:inline-block;padding:6px 20px;border-radius:9999px;font-weight:800;color:#fff;background:{pass_color};margin-top:12px;font-size:14px}}
    .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px}}
    .card{{background:#fff;padding:24px;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 2px 6px rgba(0,0,0,.05);text-align:center}}
    .val{{font-size:36px;font-weight:900;margin:6px 0}}
    .lbl{{font-size:11px;font-weight:600;text-transform:uppercase;color:#64748B;letter-spacing:.5px}}
    .sub{{font-size:11px;color:#94A3B8;margin-top:4px}}
    .section{{background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:24px;margin-bottom:22px}}
    .section h2{{font-size:15px;font-weight:700;color:#1F4E78;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #F1F5F9}}
    table{{width:100%;border-collapse:collapse;font-size:13px}}
    th{{background:#F8FAFC;padding:11px 14px;font-weight:700;color:#475569;text-align:left;border-bottom:2px solid #E2E8F0}}
    td{{padding:11px 14px;border-bottom:1px solid #F8FAFC}}
    .pass{{color:#10B981;font-weight:700}} .fail{{color:#EF4444;font-weight:700}} .warn{{color:#F59E0B;font-weight:700}}
  </style>
</head>
<body>
  <div class="header">
    <h1>&#x1F4CA; LexAid API — Baseline Load Test Report</h1>
    <p>Target API: <strong>{d['config']['api_url']}</strong> &nbsp;|&nbsp; Executed: <strong>{now}</strong> &nbsp;|&nbsp; Build: <strong>{d['build']}</strong></p>
    <p>Load Profile: <strong>{d['config']['vus']} Virtual Users &times; {d['config']['duration']} seconds</strong></p>
    <span class="badge">{status_txt}</span>
  </div>

  <div class="grid">
    <div class="card"><div class="lbl">Requests / Second</div><div class="val" style="color:#2563EB">{m['rps']}</div><div class="sub">RPS during {d['config']['duration']}s test</div></div>
    <div class="card"><div class="lbl">Total Requests</div><div class="val" style="color:#1F4E78">{m['total_requests']:,}</div><div class="sub">Sent by {d['config']['vus']} VUs</div></div>
    <div class="card"><div class="lbl">Avg Response Time</div><div class="val" style="color:#1F4E78">{rt['avg']}<span style="font-size:16px">ms</span></div><div class="sub">Mean across all requests</div></div>
    <div class="card"><div class="lbl">Min Response</div><div class="val" style="color:#10B981">{rt['min']}<span style="font-size:16px">ms</span></div><div class="sub">Fastest response</div></div>
    <div class="card"><div class="lbl">Max Response</div><div class="val" style="color:#EF4444">{rt['max']}<span style="font-size:16px">ms</span></div><div class="sub">Slowest response</div></div>
    <div class="card"><div class="lbl">P95 Response</div><div class="val" style="color:#F59E0B">{rt['p95']}<span style="font-size:16px">ms</span></div><div class="sub">95% faster than this</div></div>
    <div class="card"><div class="lbl">P99 Response</div><div class="val" style="color:#F59E0B">{rt['p99']}<span style="font-size:16px">ms</span></div><div class="sub">99% faster than this</div></div>
    <div class="card"><div class="lbl">Error Rate</div><div class="val" style="color:{'#10B981' if m['error_rate_pct']<5 else '#EF4444'}">{m['error_rate_pct']}%</div><div class="sub">Target: &lt; 5%</div></div>
  </div>

  <div class="section">
    <h2>&#x26A1; Per-Endpoint Response Times</h2>
    <table>
      <thead><tr><th>Endpoint</th><th>Avg Response</th><th>Requests</th><th>SLA</th></tr></thead>
      <tbody>{ep_rows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>&#x2705; SLA Compliance</h2>
    <table>
      <thead><tr><th>SLA Metric</th><th>Target</th><th>Actual</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Error Rate</td><td>&lt; 5%</td><td>{m['error_rate_pct']}%</td><td class="{'pass' if m['error_rate_pct']<5 else 'fail'}">{'PASS' if m['error_rate_pct']<5 else 'FAIL'}</td></tr>
        <tr><td>P95 Response Time</td><td>&lt; 2000ms</td><td>{rt['p95']}ms</td><td class="{'pass' if rt['p95']<2000 else 'fail'}">{'PASS' if rt['p95']<2000 else 'FAIL'}</td></tr>
        <tr><td>Avg Response Time</td><td>&lt; 500ms</td><td>{rt['avg']}ms</td><td class="{'pass' if rt['avg']<500 else 'warn'}">{'PASS' if rt['avg']<500 else 'WARN'}</td></tr>
        <tr><td>P99 Response Time</td><td>&lt; 5000ms</td><td>{rt['p99']}ms</td><td class="{'pass' if rt['p99']<5000 else 'fail'}">{'PASS' if rt['p99']<5000 else 'FAIL'}</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>"""

    with open("loadtest/reports/load-report.html", "w", encoding="utf-8") as f:
        f.write(html)

    md = f"""# LexAid API Baseline Load Test Report

**Build:** {d['build']}  
**Date:** {now}  
**Target API:** {d['config']['api_url']}  
**Load Profile:** {d['config']['vus']} Virtual Users × {d['config']['duration']} seconds  

---

## Requests Per Second (RPS)

> **{m['rps']} req/sec**
> 
> Your API handled **{m['total_requests']:,} total requests** during the {d['config']['duration']}-second test.

---

## Response Times

| Metric | Value | Meaning |
|:---|:---:|:---|
| **Average** | **{rt['avg']} ms** | Mean response across all requests |
| **Minimum** | **{rt['min']} ms** | Fastest response seen |
| **Maximum** | **{rt['max']} ms** | Slowest response seen |
| **P50 (Median)** | **{rt['p50']} ms** | Half of requests faster than this |
| **P95** | **{rt['p95']} ms** | 95% of requests faster than this |
| **P99** | **{rt['p99']} ms** | 99% of requests faster than this |

---

## SLA Compliance

| Metric | Target | Result | Status |
|:---|:---:|:---:|:---:|
| Error Rate | < 5% | {m['error_rate_pct']}% | {'PASS' if m['error_rate_pct']<5 else 'FAIL'} |
| P95 Response | < 2000ms | {rt['p95']}ms | {'PASS' if rt['p95']<2000 else 'FAIL'} |
| Avg Response | < 500ms | {rt['avg']}ms | {'PASS' if rt['avg']<500 else 'WARN'} |

## Overall: **{status_txt}**
"""
    with open("loadtest/reports/summary.md", "w", encoding="utf-8") as f:
        f.write(md)

    print(f"\nReports generated:")
    print(f"  HTML : loadtest/reports/load-report.html")
    print(f"  JSON : loadtest/results/raw.json")
    print(f"  MD   : loadtest/reports/summary.md")


if __name__ == "__main__":
    run_load_test()
