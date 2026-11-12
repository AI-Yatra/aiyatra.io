---
cover: /blog/images/uploads/durable-agents-cover-3.webp
coverAlt: "worker-1 is killed during charge_upi; worker-2 retries with the same key and finishes the order"
title: "Building Durable AI Agents, Part 3: The Chai Agent on Temporal"
urlSlug: beyond-the-harness-part-3-the-chai-agent-on-temporal
excerpt: "The same chai agent as a Temporal workflow. Kill the worker that's charging the customer, type nothing, and watch another worker finish the order and charge once. Free and local, no account needed."
category: Session recap
tags:
  - AGENTS
  - DURABLE EXECUTION
  - TEMPORAL
  - PYTHON
  - HANDS-ON
date: 2026-11-12
author: Jagadeeswara Reddy
coAuthors: []
series: Building Durable AI Agents
---
*Written alongside our session on durable AI agents at LSEG Hyderabad on November 14. Every command here is shown for macOS / Linux and for Windows, so you can follow along on your own laptop.*

In [part 2](/blog/beyond-the-harness-part-2-four-guarantees-tested-with-kill-9-in-langgraph) the chai agent became durable. Kill it anywhere, run it again, and it carries on from the exact step and charges the customer once.

But read that again: *run it again.* After every crash, somebody restarted it. Nothing noticed that the run had died. At 3 AM, nobody would.

In this post we run the same agent on [Temporal](https://temporal.io), a durable execution engine. We start two workers, kill the one that's charging the customer, and **don't touch anything**. The other worker finishes the order, and the customer pays once.

It's free and runs on your laptop. No account is needed.

Code: **https://github.com/been-there-done-that/durable-ai-agents**, file [`temporal_agent.py`](https://github.com/been-there-done-that/durable-ai-agents/blob/main/temporal_agent.py).

## Restarting a process isn't the same as finishing the work

There are two ways to make sure "someone" restarts a crashed agent:

| | Examples | What happens after a crash |
|---|---|---|
| **Restart the process** | Docker restart policy, Kubernetes, systemd | The process comes back. It doesn't know which orders were half-done. You write that part. |
| **Durable execution engine** | Temporal, DBOS, Restate, Inngest | The engine keeps the history of every run, notices a dead one, and hands it to a live worker, which carries on from the last finished step. |

We'll use Temporal. The ideas carry over to the others.

## Four words of Temporal

- **Workflow:** the agent loop. It's ordinary code that says what happens in what order. Temporal records each step it takes.
- **Activity:** one step that touches the outside world: the LLM call, the charge, the SMS, the kitchen. Activities can fail and be retried.
- **Worker:** a process that runs your workflows and activities. You can run as many as you like, and any of them can pick up any run.
- **Server:** keeps the **event history** of every workflow ("read_order finished with this result, charge_upi started…"), and hands work to workers.

The event history plays the role the SQLite checkpoints played in part 2. The difference is that the server *watches* it.

## Start the server

Pick one of these. Both are the same on every OS.

**With Docker** (Docker Desktop on macOS and Windows; it uses the compose file in the repo):

```bash
docker compose --profile temporal up -d temporal
```

**Without Docker**, install the [Temporal CLI](https://docs.temporal.io/cli) (`brew install temporal` on macOS; on Linux and Windows, download it from that page) and leave this running in its own terminal:

```bash
temporal server start-dev
```

Give it about 10 seconds, then open **http://localhost:8233**. That's the Temporal UI, where every order's history will show up.

Keep the shop running from part 1 (`uv run python shop_mock.py`, dashboard at http://localhost:8099).

## The code

### Activities: the steps that touch the world

These are the same four steps as before, with decorators:

```python
@activity.defn
async def read_order(text: str) -> dict:
    return llm_read_order(text)


@activity.defn
async def charge_upi(order_id: str, amount: int, key: str) -> str:
    r = shop("/pay", {"order_id": order_id, "amount": amount, "key": key})
    say(f"charge_upi: ₹{amount} -> {r['receipt']}" + ("  · bank: same key, not charged again" if r["duplicate"] else ""))
    pause = int(os.environ.get("DEMO_PAUSE", "0"))
    for left in range(pause, 0, -1):          # the window to kill this worker
        activity.heartbeat(left)              # "I'm still alive"
        await asyncio.sleep(1)
    return r["receipt"]


@activity.defn
async def send_receipt(phone: str, text: str, key: str) -> None:
    shop("/sms", {"to": phone, "text": text, "key": key})


@activity.defn
async def send_to_kitchen(order_id: str, qty: int, key: str) -> str:
    r = shop("/kitchen", {"order_id": order_id, "qty": qty, "key": key})
    return r.get("ticket", "sold out")
```

Note the **keys** again. Temporal retries an activity that died in the middle, which is the same *at-least-once* problem from part 2. Temporal doesn't make the bank idempotent. You still send a key, and the bank still remembers it.

### How Temporal notices a dead worker

```python
STEP = dict(
    start_to_close_timeout=timedelta(seconds=60),
    heartbeat_timeout=timedelta(seconds=3),        # no heartbeat for 3s → the worker is dead
    retry_policy=RetryPolicy(initial_interval=timedelta(seconds=1)),
)
```

While `charge_upi` runs, it calls `activity.heartbeat()` every second. When a `kill -9` stops the heartbeats, the server waits 3 seconds, marks that attempt as failed, and schedules a retry, which **any** live worker can pick up.

### The workflow: the agent loop

```python
@workflow.defn
class ChaiOrder:
    @workflow.run
    async def run(self, text: str) -> dict:
        order_id = workflow.info().workflow_id
        order = await workflow.execute_activity(read_order, text, **STEP)
        amount = order["qty"] * PRICE
        receipt = await workflow.execute_activity(charge_upi, args=[order_id, amount, f"{order_id}:charge"], **STEP)
        await workflow.execute_activity(send_receipt, args=[order["phone"], f"Paid ₹{amount}, receipt {receipt}", f"{order_id}:sms"], **STEP)
        kitchen = await workflow.execute_activity(send_to_kitchen, args=[order_id, order["qty"], f"{order_id}:kot"], **STEP)
        return {"receipt": receipt, "kitchen": kitchen}
```

It reads like the normal agent from part 1. That's the point.

There's one rule for workflow code: **it must be deterministic.** When a worker picks up a run, it replays the workflow function from the top, and each `execute_activity` that already finished returns its *recorded* result from the history instead of running again. That's how `read_order` (and its LLM call) is never repeated. So no random numbers, clocks or network calls directly in the workflow: those belong in activities. The idempotency key here is built from the workflow id, which is the same on every replay.

### Workers and starting an order

```python
async def worker(name: str):
    client = await Client.connect("127.0.0.1:7233")
    w = Worker(client, task_queue="chai", workflows=[ChaiOrder],
               activities=[read_order, charge_upi, send_receipt, send_to_kitchen])
    await w.run()


async def start(order_id: str):
    client = await Client.connect("127.0.0.1:7233")
    result = await client.execute_workflow(ChaiOrder.run, ORDER, id=order_id, task_queue="chai")
```

The workflow id is the order id. Temporal won't run two live workflows with the same id, so two people "starting" order-1 can't charge twice either.

## Kill it

You need five terminals now: the shop, two workers, one to place the order and one for the kill. Start two workers, each in its own terminal:

**macOS / Linux**

```bash
MOCK_LLM=1 DEMO_PAUSE=8 uv run python temporal_agent.py worker worker-1     # terminal A
MOCK_LLM=1 DEMO_PAUSE=8 uv run python temporal_agent.py worker worker-2     # terminal B
```

**Windows (PowerShell)**

```powershell
# terminal A
$env:MOCK_LLM="1"; $env:DEMO_PAUSE="8"
uv run python temporal_agent.py worker worker-1

# terminal B
$env:MOCK_LLM="1"; $env:DEMO_PAUSE="8"
uv run python temporal_agent.py worker worker-2
```

Each one prints `worker-N polling task queue 'chai'` and waits. Reset the dashboard and place an order:

**macOS / Linux**

```bash
MOCK_LLM=1 uv run python temporal_agent.py start order-1                    # terminal C
```

**Windows (PowerShell)**

```powershell
# terminal C
$env:MOCK_LLM="1"
uv run python temporal_agent.py start order-1
```

One worker picks it up (each line also starts with `[pid …]`; it's left out here):

```
[worker-1] about to charge ₹80 · key order-1:charge
charge_upi: ₹80 -> rcpt-1
▶ charged ₹80 · 8s to kill me…
```

Kill **that** worker (worker-1 here; if worker-2 printed it, kill worker-2 instead) within 8 seconds, from one more terminal (terminal C is busy waiting for the result):

**macOS / Linux**

```bash
pkill -9 -f "worker worker-1"
```

**Windows (PowerShell)**

```powershell
Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%worker worker-1%'" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

(Or `taskkill /F /PID <pid>`, using the pid from that worker's `[pid …]` lines.)

Now **type nothing.** About 3 seconds later, in the other terminal:

```
[worker-2] about to charge ₹80 · key order-1:charge
charge_upi: ₹80 -> rcpt-1  · bank: same key, not charged again
send_receipt: sms sent
send_to_kitchen: kot-1
```

And in terminal C:

```
done · {'receipt': 'rcpt-1', 'kitchen': 'kot-1'} · payments made 1
```

What happened, step by step:

1. Worker-1 ran `read_order`. Its result went into the event history.
2. Worker-1 started `charge_upi`, the bank charged, and then worker-1 died mid-step.
3. The heartbeats stopped. After 3 seconds, the server failed that attempt and scheduled a retry.
4. Worker-2 picked the run up and replayed the workflow. `read_order` came back from history, so there was **no second LLM call**.
5. Worker-2 retried `charge_upi` with the same key, `order-1:charge`. The bank said *already paid*.
6. Worker-2 sent the receipt and the kitchen order. Done.

Nobody restarted anything.

Open the order in the UI (http://localhost:8233 → `order-1`). The screenshots below come from a test run, so the order id in them is different. The compact event history shows it: `read_order` ran once (attempt 1), and `charge_upi` needed **attempt 2**, with the same receipt, `rcpt-1`.

![Temporal event history: charge_upi on attempt 2](/blog/images/uploads/chai-temporal-history.webp)

The Timeline tab shows the same thing over time: the `charge_upi` bar starts red (the dead worker), waits out the heartbeat timeout, and turns green when the other worker finishes it.

![Temporal timeline](/blog/images/uploads/chai-temporal-timeline.webp)

On the shop dashboard, the timeline shows a `worker-1` block that stops after the charge, and a `worker-2` block that finishes the order.

## Docker version

The same on every OS. Stop the local shop, the workers and any local `temporal server start-dev` first (Ctrl+C in their terminals), so the containers get the ports:

```bash
docker compose up -d shop
docker compose --profile temporal up -d temporal worker-1 worker-2
docker compose logs -f worker-1 worker-2      # watch them in one terminal
docker compose run --rm chai-agent python temporal_agent.py start order-1
docker kill worker-1         # or worker-2, whichever printed "charged ₹80"
```

## LangGraph or Temporal?

| | LangGraph + checkpoints (part 2) | Temporal (part 3) |
|---|---|---|
| Resume from the exact step | ✓ the checkpoint | ✓ the event history |
| Side effects once | your idempotency keys | your idempotency keys |
| Wait for a person | `interrupt()` + `Command(resume=…)` | signals + `workflow.wait_condition`, durable timers |
| Write every step down | `get_state_history()` | event history + UI |
| Someone notices a dead run | **you** (restart it) | **the engine** |
| What you run | a SQLite or Postgres file | a server + workers |

A sensible path: start with checkpoints and idempotency keys. That fixes most of the damage. Move to an engine when restarting stalled runs by hand starts eating your time, or when "3 AM" is a real time for your users.

## Try next

The Temporal agent here does only the happy path. The pending-payment and sold-out flow from part 2 is a good exercise:

- Wait for the bank with a **signal**: `@workflow.signal def bank_settled(self, outcome)` plus `await workflow.wait_condition(lambda: self.outcome)`.
- Give the customer 2 hours with a **durable timer**: `await workflow.wait_condition(..., timeout=timedelta(hours=2))`. It survives worker restarts, and the server keeps the clock.
- Kill the workers while they wait, and check the wait is still there.

Or pick one of the 100 problems from the session's hackathon: every one of them has to survive a `kill -9`.

## If something goes wrong

Part 1 covers setup problems (uv, the shop, ports). These are the Temporal ones:

**`can't reach the Temporal server at 127.0.0.1:7233`**
The server isn't up yet. Check that `docker compose --profile temporal up -d temporal` worked (or that `temporal server start-dev` is still running), wait 10 seconds and try again. http://localhost:8233 should open.

**`order-1 is already running`**
An earlier order-1 hasn't finished, often because no worker was running when you started it. Start a worker and it finishes, or use a new id: `start order-2`. You can also cancel it in the UI.

**`start order-1` just sits there**
No worker is running, or the workers are on a different task queue. Each worker should print `polling task queue 'chai'`. If you set `TASK_QUEUE` in one terminal, set the same value in all of them.

**Nobody picked up the order after the kill**
- The other worker isn't running. Two workers are the point of this demo.
- You killed it before the charge. Wait for `▶ charged ₹80 · 8s to kill me…`.
- On Windows, you killed both: `'%worker%'` matches both workers. Include the name: `'%worker worker-1%'`.

**It took longer than 3 seconds**
That's normal. The server waits for the heartbeat timeout (3s), then the retry (1s), then the next poll. Up to about 10 seconds is fine.

**Payments made: 2**
The shop was restarted between the kill and the retry, so the bank forgot the key. Or you ran `start order-1` a second time after resetting the dashboard: a finished order can be started again with the same id. Use a new id for each try.

**`docker compose run ... start` can't reach the shop or Temporal**
Inside Docker, the containers talk to each other by name (`shop`, `temporal`). Start them with compose as shown above, not some of them locally and some in Docker.

---

*This series accompanies the AI Yatra session "Durable AI Agents" at LSEG Hyderabad, 14 Nov 2026. Code: [been-there-done-that/durable-ai-agents](https://github.com/been-there-done-that/durable-ai-agents).*
