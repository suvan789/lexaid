"""
LexAid Selenium E2E — HTML & JSON & Markdown Report Generator
=============================================================
Generates:
  - execution-report.html  (interactive, filterable)
  - dashboard.html         (executive summary)
  - execution-results.json
  - summary.md             (GitHub Actions Step Summary)
"""

import os
import json
import logging
from datetime import datetime

logger = logging.getLogger("HTMLReporter")


def _status_badge(status: str) -> str:
    c = {"PASSED": "#10B981", "FAILED": "#EF4444", "SKIPPED": "#F59E0B"}.get(status, "#6B7280")
    return f'<span style="background:{c};color:#fff;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;">{status}</span>'


def generate_html_reports(results: list, target_dir: str, build_number: str = "BUILD-001",
                           base_url: str = "https://suvan789.github.io/lexaid/"):
    os.makedirs(target_dir, exist_ok=True)

    passed  = [r for r in results if r["status"] == "PASSED"]
    failed  = [r for r in results if r["status"] == "FAILED"]
    skipped = [r for r in results if r["status"] == "SKIPPED"]
    total   = len(results)
    pass_rate = (len(passed) / total * 100) if total else 0
    fail_rate = (len(failed) / total * 100) if total else 0
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    rows_html = ""
    for r in results:
        badge = _status_badge(r["status"])
        reason_html = f'<span style="color:#DC2626;font-size:11px">{r.get("reason","")[:100]}</span>' if r.get("reason") else "—"
        ss = f'<a href="../Screenshots/{r["id"]}_FAILURE.png" target="_blank" style="color:#2563EB;font-size:11px">📷 View</a>' if r.get("screenshot") else "—"
        p_color = "#DC2626" if r.get("priority")=="P1" else "#D97706"
        rows_html += f"""
        <tr>
          <td><strong>{r['id']}</strong></td>
          <td>{r['module']}</td>
          <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="{r['name']}">{r['name']}</td>
          <td><span style="color:{p_color};font-weight:700">{r.get('priority','P2')}</span></td>
          <td>{badge}</td>
          <td>{r.get('duration_ms',0)} ms</td>
          <td>{reason_html}</td>
          <td>{ss}</td>
        </tr>"""

    failed_detail_html = ""
    for f in failed:
        failed_detail_html += f"""
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;padding:12px 16px;border-radius:8px;margin-bottom:10px">
          <strong style="color:#991B1B">{f['id']}</strong> — {f['name']}<br>
          <code style="color:#7F1D1D;font-size:11px">{f.get('reason','Assertion failed')}</code>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LexAid Selenium E2E Report — {build_number}</title>
  <style>
    :root{{--navy:#1F4E78;--pass:#10B981;--fail:#EF4444;--skip:#F59E0B;--bg:#F8FAFC}}
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:#1E293B;padding:24px}}
    .header{{background:linear-gradient(135deg,#1F4E78,#0F172A);color:#fff;padding:28px;border-radius:16px;margin-bottom:24px}}
    .header h1{{font-size:22px;font-weight:800;margin-bottom:8px}}
    .header p{{opacity:.8;font-size:13px}}
    .metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}}
    .card{{background:#fff;padding:20px;border-radius:14px;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,.05)}}
    .card-num{{font-size:30px;font-weight:800;margin-top:4px}}
    .card-lbl{{font-size:11px;font-weight:600;text-transform:uppercase;color:#64748B;letter-spacing:.5px}}
    .pass{{color:var(--pass)}}.fail{{color:var(--fail)}}.skip{{color:var(--skip)}}
    .table-wrap{{background:#fff;border-radius:16px;border:1px solid #E2E8F0;overflow:auto;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)}}
    table{{width:100%;border-collapse:collapse;font-size:12px}}
    th{{background:#F1F5F9;padding:12px 14px;font-weight:700;color:#334155;border-bottom:1px solid #E2E8F0;white-space:nowrap}}
    td{{padding:10px 14px;border-bottom:1px solid #F1F5F9;vertical-align:middle}}
    tr:hover{{background:#F8FAFC}}
    .section-title{{font-size:18px;font-weight:700;margin:24px 0 12px;color:#1F4E78}}
    .url-chip{{display:inline-block;background:#EFF6FF;color:#1D4ED8;padding:4px 12px;border-radius:8px;font-size:12px;font-family:monospace;margin-bottom:16px}}
  </style>
</head>
<body>
  <div class="header">
    <h1>🌐 LexAid Selenium E2E Report — Live GitHub Pages Testing</h1>
    <p>Build: <strong>{build_number}</strong> &nbsp;|&nbsp; Executed: <strong>{ts}</strong> &nbsp;|&nbsp; Headless Chrome</p>
  </div>
  <div class="url-chip">🌐 Target: {base_url}</div>

  <div class="metrics">
    <div class="card"><div class="card-lbl">Total Tests</div><div class="card-num">{total}</div></div>
    <div class="card"><div class="card-lbl">Passed</div><div class="card-num pass">{len(passed)}</div></div>
    <div class="card"><div class="card-lbl">Failed</div><div class="card-num fail">{len(failed)}</div></div>
    <div class="card"><div class="card-lbl">Skipped</div><div class="card-num skip">{len(skipped)}</div></div>
    <div class="card"><div class="card-lbl">Pass Rate</div><div class="card-num pass">{pass_rate:.1f}%</div></div>
    <div class="card"><div class="card-lbl">Threshold</div><div class="card-num" style="color:{'#10B981' if pass_rate>=95 else '#EF4444'}">{'✅ MET' if pass_rate>=95 else '❌ FAIL'}</div></div>
  </div>

  {'<div class="section-title">❌ Failed Test Details</div>' + failed_detail_html if failed else ''}

  <div class="section-title">📋 All Test Executions</div>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>Test ID</th><th>Module</th><th>Test Name</th><th>Priority</th>
        <th>Status</th><th>Duration</th><th>Failure Reason</th><th>Screenshot</th>
      </tr></thead>
      <tbody>{rows_html}</tbody>
    </table>
  </div>
</body>
</html>"""

    with open(os.path.join(target_dir, "execution-report.html"), "w", encoding="utf-8") as f:
        f.write(html)

    # Dashboard (simplified executive version)
    with open(os.path.join(target_dir, "dashboard.html"), "w", encoding="utf-8") as f:
        f.write(html.replace("Selenium E2E Report", "Executive Dashboard"))

    # JSON
    json_dir = os.path.join(os.path.dirname(target_dir), "JSON")
    os.makedirs(json_dir, exist_ok=True)
    with open(os.path.join(json_dir, "execution-results.json"), "w") as f:
        json.dump({
            "build_number": build_number, "timestamp": ts, "base_url": base_url,
            "summary": {"total": total, "passed": len(passed), "failed": len(failed),
                        "skipped": len(skipped), "pass_rate": round(pass_rate, 2)},
            "test_cases": results
        }, f, indent=2, default=str)

    # Markdown GitHub Actions Step Summary
    git_sha   = os.environ.get("GITHUB_SHA", "local")[:8]
    branch    = os.environ.get("GITHUB_REF_NAME", "main")
    failed_lines = "\n".join(
        f"- ✗ **{r['id']}** — {r['name'][:60]}\n  *Reason:* `{r.get('reason','Assertion failed')[:80]}`"
        for r in failed
    ) or "None — All tests passed! ✅"
    passing_modules = "\n".join(
        f"| {m} | {d['passed']}/{d['total']} | {d['passed']/d['total']*100:.0f}% |"
        for m, d in sorted(
            ((m, d) for m, d in _build_module_map(results).items()),
            key=lambda x: x[1]["passed"] / x[1]["total"], reverse=True
        )[:5]
    )

    summary_md = f"""# 🌐 Live GitHub Pages Selenium E2E Execution Summary

**Build Number:** {build_number}
**Execution Date:** {ts}
**Git Commit:** `{git_sha}`
**Branch:** `{branch}`
**Target URL:** {base_url}

---

### 📊 Execution Metrics

| Metric | Value | Status |
|:---|:---:|:---:|
| **Total Test Cases** | **{total}** | — |
| **Passed** | 🟢 **{len(passed)}** | — |
| **Failed** | 🔴 **{len(failed)}** | — |
| **Skipped** | 🟡 **{len(skipped)}** | — |
| **Pass Rate** | **{pass_rate:.2f}%** | {'✅ **PASS** (≥95%)' if pass_rate >= 95 else '❌ **FAIL** (<95%)'} |

---

### 🏆 Top Passing Modules

| Module | Pass Count | Rate |
|:---|:---:|:---:|
{passing_modules}

---

### ❌ Failed Tests

{failed_lines}

---

### 📦 Artifacts Generated

✅ Excel Reports (4 files)
✅ HTML Reports (execution-report.html + dashboard.html)
✅ JSON Results (execution-results.json)
✅ Screenshots (failure captures)
✅ Execution Logs

### 🌐 Live Report

👉 [View Full Execution Report](https://suvan789.github.io/lexaid/reports/latest/execution-report.html)
"""

    summary_dir = os.path.join(os.path.dirname(target_dir), "Summary")
    os.makedirs(summary_dir, exist_ok=True)
    with open(os.path.join(summary_dir, "summary.md"), "w", encoding="utf-8") as f:
        f.write(summary_md)

    print(f"✅ HTML, JSON & Markdown reports generated in: {target_dir}")
    return summary_md


def _build_module_map(results: list) -> dict:
    mm: dict = {}
    for r in results:
        m = r["module"]
        if m not in mm:
            mm[m] = {"total": 0, "passed": 0, "failed": 0}
        mm[m]["total"] += 1
        if r["status"] == "PASSED":
            mm[m]["passed"] += 1
        elif r["status"] == "FAILED":
            mm[m]["failed"] += 1
    return mm
