"""
Standalone Concurrent Load & Performance Benchmark Tool
Uses Python's asyncio and HTTPX to simulate concurrent virtual students.
Executes load profiles (10, 25, and 50 virtual users) and reports
throughput (req/s), latency percentiles (P50, P95, P99), and error rates.
"""
import asyncio
import time
import statistics
import uuid
import httpx

BASE_URL = "http://127.0.0.1:8000"


async def simulate_student_session(client: httpx.AsyncClient, user_idx: int, project_ids: list, metrics: list):
    student_id = f"stu_perf_{uuid.uuid4().hex[:6]}"
    headers = {"X-Student-Id": student_id, "Content-Type": "application/json"}

    # 1. Health check
    t0 = time.perf_counter()
    try:
        r = await client.get("/health", headers=headers)
        dt = (time.perf_counter() - t0) * 1000
        metrics.append({"endpoint": "GET /health", "status": r.status_code, "latency": dt})
    except Exception as e:
        metrics.append({"endpoint": "GET /health", "status": 0, "latency": 0, "error": str(e)})

    # 2. Browse Gallery ranked by upvotes
    t0 = time.perf_counter()
    try:
        r = await client.get("/api/v1/projects?sort=upvotes", headers=headers)
        dt = (time.perf_counter() - t0) * 1000
        metrics.append({"endpoint": "GET /api/v1/projects", "status": r.status_code, "latency": dt})
    except Exception as e:
        metrics.append({"endpoint": "GET /api/v1/projects", "status": 0, "latency": 0, "error": str(e)})

    # 3. Upvote a project
    if project_ids:
        proj_id = project_ids[user_idx % len(project_ids)]
        t0 = time.perf_counter()
        try:
            r = await client.post(f"/api/v1/projects/{proj_id}/upvote", json={"student_id": student_id}, headers=headers)
            dt = (time.perf_counter() - t0) * 1000
            # 200 (voted) or 409 (already voted) are both valid responses under single-vote rule
            metrics.append({"endpoint": "POST /upvote", "status": r.status_code, "latency": dt})
        except Exception as e:
            metrics.append({"endpoint": "POST /upvote", "status": 0, "latency": 0, "error": str(e)})

    # 4. Post feedback comment
    if project_ids:
        proj_id = project_ids[user_idx % len(project_ids)]
        t0 = time.perf_counter()
        try:
            payload = {
                "content": f"Benchmark automated critique from user {student_id}",
                "student_id": student_id,
                "author_name": f"Tester {student_id}",
            }
            r = await client.post(f"/api/v1/projects/{proj_id}/comments", json=payload, headers=headers)
            dt = (time.perf_counter() - t0) * 1000
            metrics.append({"endpoint": "POST /comments", "status": r.status_code, "latency": dt})
        except Exception as e:
            metrics.append({"endpoint": "POST /comments", "status": 0, "latency": 0, "error": str(e)})


async def run_stage(concurrent_users: int, project_ids: list):
    print(f"\n=======================================================")
    print(f"[*] Running Load Test Profile: {concurrent_users} Concurrent Virtual Students")
    print(f"=======================================================")

    metrics = []
    limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0, limits=limits) as client:
        start_overall = time.perf_counter()
        tasks = [
            simulate_student_session(client, i, project_ids, metrics)
            for i in range(concurrent_users)
        ]
        await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_overall

    successful = [m for m in metrics if m["status"] in (200, 201, 409)]
    errors = [m for m in metrics if m["status"] not in (200, 201, 409)]
    latencies = [m["latency"] for m in successful]

    throughput = len(metrics) / total_time if total_time > 0 else 0
    p50 = statistics.median(latencies) if latencies else 0
    p95 = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies or [0])
    p99 = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max(latencies or [0])

    print(f"Total Requests Executed: {len(metrics)}")
    print(f"Total Duration:          {total_time:.2f} seconds")
    print(f"Throughput:              {throughput:.1f} requests/sec")
    print(f"Success Rate:            {(len(successful)/len(metrics)*100):.1f}%")
    print(f"Error Count:             {len(errors)}")
    print(f"Latency P50 (Median):    {p50:.2f} ms")
    print(f"Latency P95:             {p95:.2f} ms")
    print(f"Latency P99:             {p99:.2f} ms")
    return {
        "users": concurrent_users,
        "total_requests": len(metrics),
        "throughput": throughput,
        "p50": p50,
        "p95": p95,
        "p99": p99,
        "success_rate": (len(successful) / len(metrics)) * 100,
    }


async def main():
    print("[+] Connecting to target API at:", BASE_URL)
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=5.0) as client:
        try:
            r = await client.get("/health")
            if r.status_code != 200:
                print(f"[!] Target API /health returned status {r.status_code}")
                return
            print(f"[OK] Target API is ONLINE and HEALTHY: {r.json().get('status')}")

            # Grab project IDs
            r_proj = await client.get("/api/v1/projects?limit=30")
            project_ids = [p["id"] for p in r_proj.json().get("data", [])]
            print(f"[OK] Fetched {len(project_ids)} sample project IDs for testing.")
        except Exception as e:
            print(f"[!] Could not connect to API at {BASE_URL}: {e}")
            print("    Please start FastAPI first: uvicorn app.main:app --port 8000")
            return

    results = []
    for users in [10, 25, 50]:
        res = await run_stage(users, project_ids)
        results.append(res)
        await asyncio.sleep(1)

    print("\n================ BENCHMARK SUMMARY ================")
    print(f"{'Users':<10} {'Req/s':<12} {'P50 (ms)':<12} {'P95 (ms)':<12} {'Success Rate':<12}")
    print("-" * 60)
    for r in results:
        print(f"{r['users']:<10} {r['throughput']:<12.1f} {r['p50']:<12.2f} {r['p95']:<12.2f} {r['success_rate']:<11.1f}%")
    print("===================================================\n")


if __name__ == "__main__":
    asyncio.run(main())
