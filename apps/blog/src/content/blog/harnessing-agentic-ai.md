---
title: Harnessing Agentic AI — Build Tools That Build Code
date: 2026-09-05
excerpt: Build the loop, the tools and the guardrails — and make your own coding agent that reads, plans, edits, tests and repairs its way to a verified pull request. 100% offline, zero API keys.
category: Session recap
author: AIYatra Team
cover: https://secure.meetupstatic.com/photos/event/3/c/0/a/highres_535815370.jpeg
eventUrl: https://www.meetup.com/aiyatra/events/316241516/
attendees: 282
---

Build the loop, the tools and the guardrails — and make your own coding agent that reads, plans, edits, tests and repairs its way to a verified pull request. 100% offline, zero API keys.

## What we covered

The model is only half the agent. We built the other half — the harness around the LLM that turns proposals into verified work.

- **The agent loop** — the while-model-wants-tools core inside Claude Code and Codex, rebuilt in pure Python stdlib.
- **Agentic AI tools** — read, search, edit, shell, git and a unified-diff applier that refuses to guess.
- **Plan → edit → patch** — structured planning artifacts and surgical, review-ready changes.
- **Self-repair** — an evidence classifier and flail guard so the agent verifies, diagnoses and fixes its own mistakes.
- **Context engineering** — repo maps, AGENTS.md instructions, compaction passes and token-budget discipline.
- **Guardrails & sandboxing** — deny/approve policy at a single choke point, plus prompt-injection defusal.

## What we built

By the end of the morning, every laptop in the room had a working coding agent that inspects an unfamiliar repo, searches code, plans, edits, runs tests, observes its own failures and repairs its patch until it produces a verified git diff. Optional Ollama + open-weights Qwen track ran the whole thing on local GPUs — no internet required.

## Takeaways

- An agent is a loop, not a framework — the harness core is pure Python stdlib with zero runtime dependencies.
- You won't learn to use Claude Code or Codex here. You'll learn to build what's under them.
- 282 learners watched the magic dissolve into loops, tools and guardrails — then built it themselves.

## Join the next one

We run sessions like this every Saturday in Hyderabad — free, hands-on, and open to everyone. [RSVP on Meetup](https://www.meetup.com/aiyatra/events/316241516/) and bring a laptop with Python 3.10+.
