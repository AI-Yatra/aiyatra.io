---
title: Building DeepSeek-V3 From Scratch — MLA, MoE and RoPE in PyTorch
date: 2026-08-08
excerpt: Multi-head latent attention, MoE load balancing and RoPE scaling — the DeepSeek-V3 paper, live-coded in PyTorch.
cover: https://secure.meetupstatic.com/photos/event/b/6/a/3/highres_535486755.jpeg
eventUrl: https://www.meetup.com/aiyatra/events/315949835/
attendees: 286
---

Multi-head latent attention, MoE load balancing and RoPE scaling — the DeepSeek-V3 paper, live-coded in PyTorch.

## What we covered

Reading a frontier-model paper is one thing; rebuilding its core ideas on your own machine is another. We took DeepSeek-V3 apart into three ideas anyone can implement.

- **Multi-head latent attention (MLA)** — compressing the KV cache into a latent vector, and why it slashes inference memory.
- **Mixture-of-Experts with load balancing** — sparse routing, expert parallelism in miniature, and the auxiliary losses that keep experts honest.
- **RoPE scaling** — rotary position embeddings and how context windows stretch without retraining from scratch.

## What we built

Working miniature versions of MLA, a toy MoE layer with observable routing, and RoPE applied to a small transformer — 286 attendees watching each piece click into place live.

## Takeaways

- Frontier papers are mostly three good ideas plus engineering — isolate the ideas and they become buildable.
- MLA's insight is compression, MoE's is conditional compute, RoPE's is geometry. Each fits in a Saturday.
- Rebuilding beats reading: you keep the intuition, not just the vocabulary.

## Join the next one

We run sessions like this every Saturday in Hyderabad — free, hands-on, and open to everyone. [RSVP on Meetup](https://www.meetup.com/aiyatra/events/315949835/) and bring a laptop with Python 3.10+.
