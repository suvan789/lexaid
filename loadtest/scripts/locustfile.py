"""
LexAid API — Python Locust Baseline Load Test
==============================================
Alternative to k6. Runs 100 users for 60 seconds.

Install:
  pip install locust

Run:
  locust -f loadtest/scripts/locustfile.py --headless \
         -u 100 -r 10 --run-time 60s \
         --host https://lexaid-api.onrender.com \
         --html loadtest/reports/locust-report.html \
         --csv  loadtest/results/locust

Then view:
  loadtest/reports/locust-report.html
"""

import random
import json
from locust import HttpUser, task, between, events


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

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "LexAid-LoadTest/Locust/1.0",
}


class LexAidUser(HttpUser):
    """
    Simulates a real LexAid user browsing the API.
    Each VU waits 0.5–1.5 seconds between tasks.
    """

    wait_time = between(0.5, 1.5)

    @task(1)
    def health_check(self):
        """Health / root ping."""
        with self.client.get(
            "/api/legal/health",
            headers=HEADERS,
            name="GET /api/legal/health",
            catch_response=True,
        ) as resp:
            if resp.status_code not in (200, 404):
                resp.failure(f"Unexpected status {resp.status_code}")
            else:
                resp.success()

    @task(3)
    def login(self):
        """Auth login endpoint — highest load in real usage."""
        payload = json.dumps({
            "email":    "suvansenthils@gmail.com",
            "password": "password123",
        })
        with self.client.post(
            "/api/auth/login",
            data=payload,
            headers=HEADERS,
            name="POST /api/auth/login",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 401, 422):
                resp.success()
            else:
                resp.failure(f"Login returned {resp.status_code}")

    @task(4)
    def ai_chat(self):
        """AI Legal Chat — heaviest endpoint."""
        q = random.choice(CHAT_QUERIES)
        with self.client.post(
            "/api/legal/query",
            data=json.dumps(q),
            headers=HEADERS,
            name="POST /api/legal/query",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 401, 422):
                resp.success()
            else:
                resp.failure(f"Chat returned {resp.status_code}")

    @task(2)
    def lawyers_list(self):
        """Lawyers directory listing."""
        with self.client.get(
            "/api/lawyers",
            headers=HEADERS,
            name="GET /api/lawyers",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 401):
                resp.success()
            else:
                resp.failure(f"Lawyers returned {resp.status_code}")

    @task(1)
    def news_feed(self):
        """Legal news feed."""
        with self.client.get(
            "/api/news",
            headers=HEADERS,
            name="GET /api/news",
            catch_response=True,
        ) as resp:
            if resp.status_code < 500:
                resp.success()
            else:
                resp.failure(f"News returned {resp.status_code}")


@events.quitting.add_listener
def on_quitting(environment, **kwargs):
    """Print final summary on exit."""
    stats = environment.stats
    total = stats.total
    print("\n" + "=" * 60)
    print("LEXAID LOAD TEST COMPLETE — FINAL SUMMARY")
    print("=" * 60)
    print(f"  Total Requests   : {total.num_requests}")
    print(f"  Failures         : {total.num_failures}")
    print(f"  RPS              : {total.current_rps:.1f} req/sec")
    print(f"  Avg Response     : {total.avg_response_time:.0f} ms")
    print(f"  Min Response     : {total.min_response_time:.0f} ms")
    print(f"  Max Response     : {total.max_response_time:.0f} ms")
    print(f"  Failure Rate     : {(total.num_failures / max(total.num_requests, 1)) * 100:.2f}%")
    print("=" * 60)
