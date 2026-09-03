---
title: Linear Algebra for AI Engineers — From Vectors to Transformers
date: 2026-08-15
excerpt: Vectors to attention — embeddings, Q/K/V projections, LoRA and SVD, the math beneath the models, by hand.
cover: https://secure.meetupstatic.com/photos/event/5/f/e/highres_535561534.jpeg
eventUrl: https://www.meetup.com/aiyatra/events/316031457/
attendees: 207
---

Vectors to attention: embeddings, Q/K/V projections, LoRA and SVD — the math beneath the models, by hand.

## What we covered

Transformers feel like magic until you do the linear algebra yourself. We started with vectors and worked up to attention — every step computed by hand before it ever touched PyTorch.

- **Vectors, dot products, and projections** — what "similarity" actually means geometrically.
- **Embeddings as learned coordinates** — why words become points and what the space between them encodes.
- **Q/K/V projections** — attention as three linear maps plus a weighted sum. Nothing more.
- **LoRA and SVD** — low-rank updates and decompositions: how giant models get fine-tuned on small GPUs.

## What we built

A miniature attention head from NumPy primitives, then the same computation in PyTorch — matching outputs to the decimal. 207 learners watched the "magic" dissolve into matrix multiplies.

## Takeaways

- Attention is arithmetic, not alchemy — QK^T, scale, softmax, times V.
- SVD explains why LoRA works: big matrices hide small structure.
- Doing one head by hand teaches more than reading ten blog posts about transformers.

## Join the next one

We run sessions like this every Saturday in Hyderabad — free, hands-on, and open to everyone. [RSVP on Meetup](https://www.meetup.com/aiyatra/events/316031457/) and bring a laptop with Python 3.10+.
