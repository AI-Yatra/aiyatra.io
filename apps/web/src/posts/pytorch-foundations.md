---
title: PyTorch Foundations — Tensors, Autograd and the Training Loop
date: 2026-08-22
excerpt: Tensors, autograd and the training loop — the foundations every AI engineer stands on. We rebuilt nn.Linear from scratch.
cover: https://secure.meetupstatic.com/photos/event/1/0/a/b/highres_535684267.jpeg
eventUrl: https://www.meetup.com/aiyatra/events/316136710/
attendees: 146
---

Tensors, autograd and the training loop — the foundations every AI engineer stands on. We rebuilt nn.Linear from scratch.

## What we covered

Most PyTorch tutorials start with `model.fit` and never look underneath. We went the other way: raw tensors first, then the autograd engine, then the training loop — so every abstraction above feels earned, not magical.

- **Tensors as the lingua franca** — shapes, strides, broadcasting, and why `(batch, features)` runs the world.
- **Autograd by hand** — a tiny scalar engine that builds the computation graph and backpropagates, before touching `torch.autograd`.
- **The training loop, deconstructed** — forward, loss, backward, step, zero-grad. Every line explained, nothing hidden behind a trainer class.

## What we built

By the end of the morning, every laptop in the room had a from-scratch linear layer training on real data — then we swapped in `nn.Linear` and watched the same loop run on the real thing. Same math, same gradients, zero mystery.

## Takeaways

- If you can implement `backward()` for a scalar graph on paper, PyTorch stops being a black box forever.
- Shape errors are the compiler telling you your mental model is wrong — read them, don't fear them.
- The training loop is five lines. Everything else is convenience.

## Join the next one

We run sessions like this every Saturday in Hyderabad — free, hands-on, and open to everyone. [RSVP on Meetup](https://www.meetup.com/aiyatra/events/316136710/) and bring a laptop with Python 3.10+.
