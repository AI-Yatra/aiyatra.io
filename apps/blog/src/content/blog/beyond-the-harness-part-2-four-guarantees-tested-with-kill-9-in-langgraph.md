---
cover: /blog/images/uploads/cover-37z0j.webp
title: "Building Durable AI Agents, Part 2: Making a LangGraph Agent Survive kill -9"
urlSlug: beyond-the-harness-part-2-four-guarantees-tested-with-kill-9-in-langgraph
excerpt: We took a small LangGraph agent, killed it at the worst moments we
  could find, and fixed what broke. Some fixes were one line. One of them
  looked right and still charged the customer twice.
category: Session recap
tags:
  - AGENTS
  - DURABLE EXECUTION
  - LANGGRAPH
  - PYTHON
  - HANDS-ON
date: 2026-11-09
author: Jagadeeswara Reddy
coAuthors: []
---
*This is the second of three posts written alongside our Nov 14 session on durable AI agents. In [Part 1](/blog/beyond-the-harness-part-1-persistent-is-not-durable/) we killed an agent halfway through a task and watched it lose finished work and pay for one order twice. This time we fix it.*

## The setup

At the end of Part 1 we had a list of four things we wanted: carry on from the step you were on, do anything that changes the world exactly once, wait days for a human, and keep a record of every step. We'll go through them in the order they bit us, which isn't quite the order of the list.

Every script here is plain Python. There's no LLM and no API key, so the results are the same on every laptop, including the ones people bring on Saturday. Each script starts a child process, kills it with `SIGKILL`, and then starts a new process on the same `thread_id`, the way a restarted container would.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
alias lg='uv run --no-project -q --with langgraph==1.2.19 --with langgraph-checkpoint-sqlite==3.1.3 python'
```

If you're on Windows, run them in WSL, since Windows doesn't have `SIGKILL`.

## Stop losing finished steps

The first failure in Part 1 was the five-node graph that forgot nodes 1 and 2 after we killed it in node 3. The graph itself was fine. The problem was when LangGraph wrote its checkpoints.

```python
conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
graph = build(SqliteSaver(conn))

graph.invoke({"done": []}, CONFIG, durability="sync")   # process 1, killed in n3
graph.invoke(None, CONFIG, durability="sync")           # process 2, resume
```

Passing `None` to `invoke` tells LangGraph to continue the thread from its last checkpoint instead of starting a new run. With `durability="sync"` the second process does what we wanted the first time:

```text
== process 2: resume same thread_id
  saved state: done=['n1', 'n2'] next=('n3',)
  running n3  (done so far: ['n1', 'n2'])
  running n4 ...
  running n5 ...
  finished: done=['n1', 'n2', 'n3', 'n4', 'n5']
```

Nodes 1 and 2 are skipped. Node 3 runs again from its first line, because it hadn't finished when the process died. Keep that in mind for everything that follows: LangGraph saves progress per node, so a node that was halfway through when the process died starts over from the top.

LangGraph 1.2 has three durability modes, and the default isn't the one you want for an agent that does real work. We ran the same kill test against each:

| Mode | When it writes | What our kill test showed |
|---|---|---|
| `"exit"` | Only when the run ends | No thread at all after the kill |
| `"async"` (default) | In the background while the next step runs | With instant nodes, `n1` and `n2` were lost in 5 of 5 runs |
| `"sync"` | Before the next step starts | Resumed at `n3` every time |

The default makes sense for chat apps, where speed matters more than losing a step now and then. For anything that costs money or touches the outside world, pass `durability="sync"`. You pay one database write per step, which is nothing next to an LLM call.

## Let the approval wait for the weekend

The coding agent from our last session asked a human before writing a file, using LangGraph's `interrupt()`. Picture it asking at 6 PM on a Friday. You see the request on Monday morning and click approve. In last session's version that approval was gone long before Monday, because the paused run was held in `InMemorySaver`, and any restart over the weekend wiped it.

The fix is to swap one class:

```python
from langgraph.checkpoint.sqlite import SqliteSaver   # pip install langgraph-checkpoint-sqlite

with SqliteSaver.from_conn_string("agent_state.db") as saver:
    graph = builder.compile(checkpointer=saver)        # was: InMemorySaver()
    graph.invoke(inputs, config, durability="sync")
```

In our test, process 1 reaches the approval, pauses and exits completely. Process 2 is a brand-new Python process standing in for Monday morning. It loads the thread, sees what's waiting and resumes it:

```text
== process 2: human approves (fresh process, same thread_id)
  loaded thread: next=('approve',)
  pending interrupt value: {'tool': 'write_file', 'path': 'hello.py', ...}
  approve: node body starts (this line re-runs on resume)
  approve: got answer 'approve'
  write: writing hello.py
```

Look closely at the `node body starts` line. It prints once when the node pauses on Friday, and again when it resumes on Monday. The LangGraph docs say it directly: *"the runtime restarts the entire node from the beginning"*. So anything you put before `interrupt()` in that node runs twice. Keep that part free of side effects, and do the real work after the approval comes back.

Two smaller things caught us out. If you open the SQLite connection yourself with `sqlite3.connect()`, you need `check_same_thread=False`. And `PostgresSaver` throws `UndefinedTable` until you call `.setup()` on it once.

## Charge the customer once

This is the failure that costs real money.

The test graph is `plan → charge → report`. We kill the process after `charge` has paid but before the node returns, so the payment happened and LangGraph never found out. As we saw in Part 1, LangGraph does exactly what it should on resume and runs `charge` again.

![](/blog/images/uploads/fig2-double-payment-2d3hh.webp)

You can't stop a step from running twice. A crash at the wrong moment will always leave you unsure whether it finished, so every system that retries steps can run one twice. What you can do is make the second run harmless. Give each side effect an idempotency key, and have the thing doing the work check whether it has already seen that key.

We tried three versions of `charge`. The first, which we called naive, just inserts a payment. The second keeps a ledger table keyed on `(thread_id, tool_call_id)`. It writes the ledger row in the same database transaction as the payment, so either both are saved or neither is, and it creates the key earlier, in `plan`, so the key is saved in the checkpoint. The third, `ledger_bad`, uses the same ledger but creates the key inside `charge` itself.

```python
def idempotent_pay(db, thread_id, tool_call_id, amount):
    with db:  # effect + ledger row commit together, or neither does
        row = db.execute("select result from ledger where thread_id=? and tool_call_id=?",
                         (thread_id, tool_call_id)).fetchone()
        if row:
            return row[0]                     # already paid: return the saved receipt
        receipt = pay(db, thread_id, amount)
        db.execute("insert into ledger values (?, ?, ?)", (thread_id, tool_call_id, receipt))
    return receipt
```

After the kill, the three versions did this:

```text
== naive:      payments made = 2
== ledger:     ledger hit for 6577613a -> returning saved receipt-3, NOT paying again
               payments made = 1
== ledger_bad: payments made = 2
```

The ledger worked. The ledger with the key made in the wrong place didn't, and nothing in the code looks wrong when you read it. Since `charge` runs again from the top, it makes a fresh key on every run, so the ledger never finds a match. The key has to come from somewhere that was saved before the step started. In a real agent, the tool call id in `AIMessage.tool_calls[i]["id"]` does the job. It was written in the previous step, so it's the same on every retry.

When the payment, deploy or message goes to someone else's API rather than your own database, send the same key along: Stripe's `Idempotency-Key` header, an `INSERT ... ON CONFLICT DO NOTHING`, or pushing a known git SHA. Some providers have no way to dedupe at all. In that case a missing result really is unknown. Pause the run and have someone check, rather than retrying and hoping.

## Find out who approved it

The last thing on our list was a record of every step. LangGraph already keeps every checkpoint, so `get_state_history()` gives you an audit log for free:

```text
step=-1  input  __start__ -> {'path': 'hello.py', 'diff': '', 'decision': ''}
step= 0  loop   propose  -> {'diff': "+ print('hello')"}
step= 1  loop   approve [INTERRUPT 'write_file'] -> {'decision': 'approve'}
step= 2  loop   write    -> {}
step= 3  loop   (end)
```

From that you can see who approved what and what the tool returned. You can also go back in time. Pick the checkpoint where the run was paused, change the diff with `update_state(..., as_node="propose")`, and approve the edited version on a new branch.

We hit two surprises doing this. First, `invoke(Command(resume="reject"), old_checkpoint)` quietly ignored our "reject" and reused the old "approve", because the earlier answer is stored on that checkpoint. What worked was calling `invoke(None, old_config)` to raise the interrupt again on a fresh branch, and then answering it. Second, replaying from an old checkpoint isn't like reading from a cache. Every node after that point runs again for real, side effects included. That's one more reason to have the ledger in place before you start time-travelling.

## What's still missing

With these four fixes our little agent survives a crash, waits over a weekend for a human and charges the customer once. We were pretty pleased with it, right up until we asked what happens if the worker dies at 3 AM and nobody is awake.

The answer is nothing. A checkpointer saves state, but it doesn't notice that a run has died, it doesn't restart it, and it won't stop two workers from both resuming the same thread. Somebody, or some script, has to call `invoke(None, config)`. The tools that handle that for you are what Part 3 is about.

## Try it yourself

If you were at our last session, take the `step06_self_evaluate.py` agent and get it to pass three tests:

1. `kill -9` during the evaluate loop, and it resumes without repeating LLM calls that already finished.
2. Leave an approval pending overnight, and it resumes in a new process.
3. Kill `write_file` right after it writes, and it doesn't write a second time. (Key the ledger on the tool call id.)

Bring it on Saturday and we'll try to break it.
