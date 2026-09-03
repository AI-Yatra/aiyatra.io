---
title: Speculative Decoding — 2-3x Faster Inference in 60 Lines of PyTorch
date: 2026-07-25
excerpt: Draft-verify-accept in 60 lines of PyTorch, then HF assisted generation and llama.cpp — faster inference, proven lossless.
cover: https://secure.meetupstatic.com/photos/event/3/5/0/c/highres_535213580.jpeg
eventUrl: https://www.meetup.com/aiyatra/events/315688657/
attendees: 64
---

Draft-verify-accept in ~60 lines of PyTorch, then HF assisted generation + llama.cpp — 2–3× faster inference, proven lossless.

## What we covered

Autoregressive decoding is slow because it generates one token per forward pass. Speculative decoding breaks that bottleneck — with zero change in outputs.

- **Draft-verify-accept** — a small draft model proposes tokens, the big model verifies them in parallel. Accept the matches, keep the guarantees.
- **Why it is lossless** — the acceptance criterion provably preserves the target distribution. Speed without sampling drift.
- **HF assisted generation + llama.cpp** — the same idea in production tooling, configured and benchmarked live.

## What we built

A 60-line PyTorch draft-verify-accept loop, then assisted generation in Transformers and a llama.cpp run — speedups measured on the room's own machines, outputs verified identical.

## Takeaways

- The fastest token is the one you don't recompute — verification parallelizes, drafting is cheap.
- Lossless matters: speculation is an exact optimization, not an approximation.
- 64 people, one lab, every laptop showing the same speedup. That is the AIYatra format.

## Join the next one

We run sessions like this every Saturday in Hyderabad — free, hands-on, and open to everyone. [RSVP on Meetup](https://www.meetup.com/aiyatra/events/315688657/) and bring a laptop with Python 3.10+.
