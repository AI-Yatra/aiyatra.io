---
cover: /blog/images/uploads/cover-7dcda.webp
title: "Building Durable AI Agents, Part 1: Resume Isn't Recovery"
urlSlug: beyond-the-harness-part-1-persistent-is-not-durable
excerpt: Your coding agent can pick up the conversation after a crash. What it
  can't tell you is whether the deploy it started ever went out. We killed a
  few agents halfway through a task to see what really survives.
category: Session recap
tags:
  - AGENTS
  - DURABLE EXECUTION
  - LANGGRAPH
  - CLAUDE CODE
  - PI
date: 2026-11-09
author: Jagadeeswara Reddy
coAuthors: []
---
*We're running a session on durable AI agents at LSEG Hyderabad on November 14. While preparing it we ended up with far more material than fits into one morning, so we're writing it up as three posts. This one is about the problem. Part 2 fixes it in LangGraph, and Part 3 looks at the tools built for exactly this job.*

## The agent was on step 47

Imagine you've given a coding agent a real job: upgrade a library across a service, fix whatever breaks, open a PR and deploy to staging. It has been at it for about forty minutes. It has read the repo, written a plan, edited six files and pushed a branch. It's on step 47 of roughly 50, and step 47 is the deploy.

You step away to take a call. While you're gone the laptop goes to sleep. Or the container it was running in gets evicted. Or someone at home restarts the machine because the fan was too loud.

When you come back you type `claude --resume`, or whatever your tool calls it, and the agent is right there with the whole conversation. It says it'll carry on from where it left off.

The trouble is that the agent has no idea whether the deploy went out. The last thing in the transcript is the call that started it, and whatever happened after that went down with the old process. All the agent can do is read the transcript and make its best guess about what happened next.

## Remembering the chat vs remembering the work

What these tools save is the conversation. After a restart they load the transcript back in, the model reads it, and it continues from what it *thinks* happened. We started calling this a **persistent** agent.

What you actually wanted in that moment is something that remembers the work. It would know which step it was on, and whether that step finished. It wouldn't run a deploy or a payment a second time. It could wait for your approval over a long weekend, and afterwards you could see exactly who approved what. We started calling that a **durable** agent.

For a chat assistant the difference hardly matters. For an agent that deploys code or moves money, it matters a lot.

![](/blog/images/uploads/fig1-persistent-vs-durable-e7qfz.webp)

## We checked four coding agents

Before the session we went through the docs, and where we could the source code, of four coding agents that people in our community use. We wanted to know what each one writes to disk and what "resume" really does.

|  | Claude Code | OpenAI Codex CLI | Hermes Agent (Nous) | Pi |
| --- | --- | --- | --- | --- |
| Transcript | JSONL in `~/.claude/projects/` | JSONL rollouts in `~/.codex/sessions/` | SQLite `~/.hermes/state.db` | JSONL tree in `~/.pi/agent/sessions/` |
| Resume | `claude --continue` / `--resume` | `codex resume --last` | `hermes -c` | `pi --continue` |
| File undo | `/rewind` (file-edit tools only, not Bash) | `thread/revert` rewrites history only | Opt-in shadow git, `/rollback` | None built in |
| A tool call cut off by a crash | Not re-run on resume | Replaced with a fake "aborted" result | Read-only: dropped. Side-effecting: kept and marked *"effect is UNKNOWN"* | Fake "No result provided" error |
| Execution resumed? | No | No | No | No (yes in the separate `pi-durable` package) |

Every one of them keeps the transcript, and none of them picks up a half-finished step. Resuming means loading the old conversation into a fresh model and letting the model work out whether that `git push` already happened. Anthropic is upfront about this in the Agent SDK docs, where sessions are described as persisting *"the conversation, not the filesystem."*

We don't think that's a flaw in these tools. They were built to be good at conversations, and they are. But it does mean the job of not deploying twice falls on you.

Hermes was the one that impressed us most here. When a call is interrupted, it checks whether that call could have changed anything. If it was only reading, Hermes drops it. If it might have had a side effect, Hermes keeps it and marks the result as unknown rather than pretending it failed. When a turn is lost in a gateway crash, the session simply stays blocked until a person decides what to do. It's a bit of a hassle, but nobody ends up acting on a guess.

Pi doesn't do this out of the box, but its team ships a separate library for it, `@earendil-works/pi-durable` (v1.0, October 2026). Before running a tool, it writes down what the tool is about to do. After a crash it only re-runs tools that you've marked `replay: "safe"`, and if the agent keeps crashing in a loop, it stops.

The Temporal team took Pi even further in a post called "The immortal life of Pi" (October 2026). They ran Pi on Temporal and killed the active worker every 15 to 40 seconds, and the task kept going on another worker. Pi kept the conversation and Temporal kept the execution. A Pi user on Reddit summed up the difference nicely: *"Base Pi already saves your sessions and tool history. The difference is Pi Durable also tracks the execution state."*

## Then we broke one on purpose

We wanted to see this happen for ourselves, so we wrote two tiny scripts. They don't call an LLM and you don't need an API key. Each one builds a small agent-shaped graph in LangGraph, kills the process with `SIGKILL` partway through, and starts a new process on the same thread. `SIGKILL` gives the program no chance to clean up, which is roughly what a dead laptop or an evicted container does. The code is in Part 2.

The first script has five steps, saves its progress to SQLite, and uses LangGraph's default settings. We killed it in the middle of step 3:

```text
== process 1: run (will be killed in n3)
  running n1  (done so far: [])
  running n2  (done so far: ['n1'])
  running n3  (done so far: ['n1', 'n2'])
  SIGKILL inside n3
== process 2: resume same thread_id
  saved state: done=[] next=('__start__',)
  running n1  (done so far: [])
  running n2  (done so far: ['n1'])
  ...
```

We expected the second process to start at step 3. It started at step 1. Steps 1 and 2 had finished, but by default LangGraph saves progress in the background, and those writes hadn't reached the disk when the process died. In a real agent those are LLM calls you've already paid for, and there's no promise that the model answers the same way the second time.

The second script is even shorter: plan, charge, report. The charge is a stand-in for any step that changes something in the world, like a deploy, a payment or a message to a customer. We let the charge succeed and killed the process just before LangGraph recorded it. Then we resumed:

```text
== naive: payments made = 2
```

One order, two payments, and LangGraph did exactly what it promises: it saw that the charge step had no saved result and ran it again. Saving progress is what *caused* the second payment. On its own, a checkpoint can't tell "never ran" apart from "ran, and we died before writing it down".

## What we want instead

After those two runs we wrote down what we'd want from an agent we could leave alone with something important:

| | We want | Without it |
| --- | --- | --- |
| 1 | If it crashes, it carries on from the step it was on | Work you've paid for runs again, and may come out differently |
| 2 | Anything that changes the world happens once | Two deploys, two payments, two PRs for the same fix |
| 3 | It can wait days for a human | The pause lives in memory, and a restart forgets it |
| 4 | Every step is written down | Nobody can say who approved the diff |

Teams building payment systems and job queues have been solving these exact problems for years, and most of their answers carry over to agents with very little change. That's what the next two posts are about.

## Coming up

In Part 2 we take the agent from these scripts and fix it, one failure at a time. Losing finished steps is a one-line fix. Approvals that survive a restart take one swap. Running a step exactly once needs a little more care, and we'll show the mistake that makes the double payment quietly come back even after you think you've fixed it.

If you're in Hyderabad, join us on **Saturday, November 14, at 9:00 AM at LSEG**. Bring a laptop. We'll be killing agents live, and you'll get to kill a few of your own.
