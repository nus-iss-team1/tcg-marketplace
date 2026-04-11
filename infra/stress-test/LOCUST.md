# Locust Stress Test

Stress test for the TCG Marketplace web-service on ECS.

## Prerequisites

```bash
pip install locust
```

## Run

```bash
locust -f tcg-marketplace/infra/stress-test/locustfile.py --host=https://dev.vaultofcards.io

or

locust -f tcg-marketplace/infra/stress-test/locustfile.py --host=https://vaultofcards.io
```

Open `http://localhost:8089` in your browser.

## Usage

1. Set number of users (use 700)
2. Set spawn rate (use 50 users/sec)
3. Click "Start swarming"
4. Monitor the live charts for requests/sec, response times, and failures

## Endpoints Tested

| Endpoint | Weight | Service |
|----------|--------|---------|
| `/` | 5 | web-service |
| `/marketplace?game=Pokemon%20TCG` | 3 | web-service |
| `/marketplace?game=Digimon%20Card%20Game` | 3 | web-service |
| `/marketplace?game=Magic%3A%20The%20Gathering` | 3 | web-service |
| `/marketplace?game=One%20Piece%20Card%20Game` | 3 | web-service |
| `/marketplace?game=Star%20Wars%3A%20Unlimited` | 3 | web-service |
| `/marketplace?game=Yu-Gi-Oh!` | 3 | web-service |

## Demo Scenarios

### Scenario 1 — Fault Tolerance
1. Ensure web-service has 1 running task in ECS
2. Stop the task via ECS console (Tasks tab → select task → Stop)
3. Observe ECS automatically respawn a replacement task (~1 min for first stop of task, ~4 mins for second stop of same task)

### Scenario 2 — Scalability
1. Run Locust with ~700 users
2. Monitor web-service CPU in ECS console Health and Metrics page with Health panel set to 1h and local timezone
3. When CPU exceeds 40%, ECS auto-scales from 2 to 4 tasks
4. Observe the new task appear in the Tasks tab
5. Show in Locust the Chart Page for No. of Users, Response Time (ms) and Total Requests per Second