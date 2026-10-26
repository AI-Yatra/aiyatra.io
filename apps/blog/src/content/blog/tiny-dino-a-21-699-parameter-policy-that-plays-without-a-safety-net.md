---
title: "Tiny Dino: A 21,699-Parameter Policy That Plays Without a Safety Net"
excerpt: "Inside a tiny Dino-playing network: structured state, teacher-guided
  training, and the checks behind a reported million-frame run without crashes."
category: Research notes
author: Monika Kusumanchi
date: 2026-10-26
cover: https://raw.githubusercontent.com/AI-Yatra/aiyatra.io/fd6ab8569f12fbc2c4c1c50b16dee6aa6381ac46/apps/blog/public/images/uploads/tiny-dino-cover.png
coverAlt: Tiny Dino network schematic with 28 inputs, three hidden layers of 96
  units, and run, jump, and duck outputs. Node counts are illustrative.
tags:
  - small models
  - PyTorch
  - imitation learning
  - model evaluation
  - game AI
---
A cactus is approaching. The dinosaur has three choices: keep running, jump, or duck. Make the wrong choice at the wrong moment and the run ends.

[Tiny Dino](https://github.com/syedazeez337/tiny-dino), a project published by GitHub user syedazeez337, turns that familiar game into a compact machine-learning experiment. Its shipped policy has just **21,699 parameters**. The repository reports that this checkpoint completed **1,000,000 simulated frames without a crash**, with no runtime planner correcting its actions.

The useful story is how the project connects a small model to a precise input contract, an offline teacher, and several checks on the exact artifact being deployed. Reading the code also reveals boundaries that matter when interpreting those results.

## What the network actually sees

This policy does not watch screenshots. It receives a **28-value structured state vector** extracted directly from the simulation.

Those features describe the game speed, the dinosaur’s vertical position and velocity, its movement and control state, and the two nearest obstacles. Obstacle features include relative distance, width, height, vertical position, and type. Missing-obstacle indicators distinguish an absent obstacle from an obstacle whose numeric features happen to be zero.

The distinction matters. Recognizing a cactus in an image and choosing when to jump are separate problems. Tiny Dino focuses on choosing actions once the relevant state is available.

Its engine advances at a fixed 60 frames per second and reimplements Chromium-related physics and collision semantics. Courses are seeded, making runs repeatable within this implementation. This is a controlled simulator rather than a screen-reading agent operating an arbitrary browser game.

## A small network with a clear job

![Architecture diagram separating offline teacher-guided training from live play: 28 state values enter a three-layer MLP, and the selected action advances the engine.](https://raw.githubusercontent.com/AI-Yatra/aiyatra.io/fd6ab8569f12fbc2c4c1c50b16dee6aa6381ac46/apps/blog/public/images/uploads/tiny-dino-architecture.png)

*Architecture at a glance. The teacher supplies supervision offline; the deployed policy chooses each action directly. Diagram based on the repository implementation.*

The deployed architecture is a feed-forward multilayer perceptron with three hidden layers, each 96 units wide, SiLU activations, and three output scores. Its dimensions are:

**28 inputs → 96 → 96 → 96 → 3 action scores**

Including biases, that is 21,699 trainable parameters. The shipped FP32 checkpoint occupies 90,929 bytes; that file includes metadata as well as weights.

At each frame, the runtime extracts and normalizes the state, runs the network, computes action probabilities, and selects the largest probability. It applies that action directly to the engine.

There is no teacher consulted during live play and no fallback rule that replaces a risky prediction. The runtime validates inputs, output shape, and finite values, but those checks do not choose a safer action. The model remains responsible for the gameplay decision.

The probability display in the web app helps readers inspect the model’s preferences. It should not be interpreted as a calibrated probability of surviving the next obstacle.

### A timing intuition

Imagine the same cactus at the same distance in two runs, with the game moving faster in the second. The dinosaur has less time to react in that faster run. If it is already falling from a jump, the useful action may change again. That is why the inputs include speed and motion, as well as obstacle distance.

## An offline teacher supplies the examples

A tiny policy can be cheap at inference because more work happens before deployment.

Tiny Dino’s teacher evaluates the three candidate first actions by forward simulation. After that first step it follows a deterministic continuation policy, looking ahead for a bounded number of frames or until the target obstacle is passed. Certification uses a 90-frame horizon.

This is narrower than searching every possible future action sequence. A teacher-approved action survives the particular bounded rollout used by the checker; it is not a guarantee of indefinite survival.

The corpus generator uses these verdicts to choose labels. It prefers the teacher’s continuation action when acceptable and otherwise picks an acceptable alternative. The training command also adds offline expert trajectories from a separate seed group and repeats boundary examples to emphasize timing-sensitive cases.

The repository contains a DAgger-style collector for states visited by a learned policy. However, the exposed training command currently adds teacher-controlled expert rollouts. These are distinct data-collection paths, and the code does not establish that the shipped checkpoint came from a full iterative DAgger loop.

The model implements a set-valued loss: it rewards probability assigned to the allowed action set. That supports situations where multiple actions are valid, although the corpus and rollout collectors inspected here produce single preferred-action labels.

## What the recorded results show

![Evaluation visual comparing 5,400 frozen-grid states with one million simulated frames, plus the INT8 action-parity result.](https://raw.githubusercontent.com/AI-Yatra/aiyatra.io/fd6ab8569f12fbc2c4c1c50b16dee6aa6381ac46/apps/blog/public/images/uploads/tiny-dino-evaluation.png)

*Different checks answer different questions. These figures summarize committed repository records, not a fresh benchmark.*

The following numbers come from the repository’s committed evidence and deployment records. They are reported results, not measurements independently rerun for this article.

| Check | Recorded result |
| --- | --- |
| Deployed model | 21,699 parameters, FP32 |
| Checkpoint file | 90,929 bytes |
| Frozen certification grid | 5,400 states checked |
| Choices rejected by the bounded teacher | 0 |
| Certification cases excluded for no acceptable action | 0 |
| Held-out and soak evaluation | 20 seeds, 50,000 frames each |
| Total simulated frames | 1,000,000 |
| Recorded crashes | 0 |
| Runtime action interventions | 0 |
| Reported CPU latency | 0.0484 ms p50; 0.0545 ms p95; 0.0709 ms p99 |

The certification grid varies speeds, obstacle distances, obstacle types and bird heights, control ages, and selected paired-obstacle gaps. It deliberately samples distances densely around timing boundaries.

Those latency figures should stay attached to their recorded benchmark. They do not measure browser rendering, HTTP round trips, or an end-to-end user interaction, and they are not a promise for every machine.

## Why certification and long runs answer different questions

The certification checker asks whether each selected action belongs to the teacher’s acceptable set on a fixed grid. Long runs ask whether sequences of the model’s own decisions keep the game alive.

There is an additional detail in the implementation: the corpus generator uses the same synthetic scenario grid as certification. Changing the seed field does not turn these synthetic states into unseen feature combinations. Passing this grid is therefore a finite conformance check, not an independent held-out generalization benchmark.

The trajectory tests provide complementary evidence, but they also remain finite: seeds 201 through 220, with a fixed maximum length per run. They do not cover every possible course, state, physics variation, or future frame.

The project records a useful failure. A GPU-trained candidate passed certification but failed its soak evaluation, so it was rejected. The README also describes a retrained model crashing on seed 202 at frame 2,327 after passing certification.

That is why a successful retraining run cannot simply inherit the shipped model’s results. The new weights need their own checks.

## Two optimizations that did not earn deployment

The repository’s INT8 experiment reduced the candidate artifact to 29,049 bytes, but changed **36 of the 5,400 certification actions**. It failed the project’s exact action-parity criterion, so the FP32 model was retained.

Changed actions are not automatically unsafe actions. The recorded experiment establishes a parity failure; it does not demonstrate that all 36 changes caused collisions. The practical lesson is to re-evaluate behavior after compression before promoting a new artifact.

The GPU training record needs similar care. It reports a training duration of about 16.48 seconds on an RTX 3050 laptop GPU, but identifies a candidate that was rejected. That duration should not be advertised as the verified training time of the deployed checkpoint or the complete data-generation-and-training workflow.

## Keeping the evidence attached to the weights

One of the strongest engineering details is the checkpoint evidence chain.

The runtime checks the checkpoint schema, engine revision, feature version, and feature-layout hash before loading the model. This reduces the risk of silently feeding weights a different interpretation of the inputs.

An end-to-end test then ties the checkpoint’s SHA-256 hash to the certification, evidence summary, and soak records. Its purpose is straightforward: establish that the model being served is the model named in those records.

A passing report for yesterday’s weights should not become evidence for today’s replacement file.

## Try the shipped policy

![Repository screenshot of the Tiny Dino web interface before starting a run, with Play, Arena, and Proof navigation and a seed selector.](https://raw.githubusercontent.com/AI-Yatra/aiyatra.io/fd6ab8569f12fbc2c4c1c50b16dee6aa6381ac46/apps/blog/public/images/uploads/tiny-dino-gameplay.png)

*The project’s web interface before a run starts. Source: syedazeez337/tiny-dino, web/qa/dino-play-1440.png. This screenshot is not evidence of a completed run.*

The repository includes a FastAPI backend and a React interface for gameplay, action probabilities, replay, and arena results. Its README specifies Python 3.13 with uv, plus Node.js 20.19 or later for the frontend build.

To clone the project and build the frontend, use the documented setup:

```bash
git clone https://github.com/syedazeez337/tiny-dino.git
cd tiny-dino
uv sync
cd web
npm ci
npm run build
cd ..
uv run tiny-dino dino-web --checkpoint artifacts/dino/deploy/model.pt --open
```

To recheck the frozen certification grid:

```bash
uv run tiny-dino dino-certify --checkpoint artifacts/dino/deploy/model.pt --output runs/certify
```

The default arena command runs a shorter check on four seeds. It does not reproduce the full million-frame suite by itself.

Tiny Dino makes a useful starting point for studying compact policies because its decisions, input representation, and evaluation boundaries are visible. It shows how much a small network can do in a deliberately scoped environment—and how carefully the claim must follow the evidence.

## Source code and evidence

This article is an implementation walkthrough of [syedazeez337/tiny-dino](https://github.com/syedazeez337/tiny-dino), reviewed at commit [37d4a59](https://github.com/syedazeez337/tiny-dino/tree/37d4a59f9442192c5f3ff123d0ba3698d7e0780c). Project implementation and reported experiment results are credited to that repository.

- [Model architecture and loss](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/tiny_dino/dino_model.py)
- [Feature contract](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/tiny_dino/dino_contract.py)
- [Teacher and bounded rollout](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/tiny_dino/dino_teacher.py)
- [Corpus generation](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/tiny_dino/dino_dataset.py)
- [Deployment evidence](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/reports/dino/evidence.json)
- [Certification and experiment artifacts](https://github.com/syedazeez337/tiny-dino/tree/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/artifacts/dino/deploy)
- [Checkpoint evidence-chain test](https://github.com/syedazeez337/tiny-dino/blob/37d4a59f9442192c5f3ff123d0ba3698d7e0780c/tests/test_dino_end_to_end.py)

