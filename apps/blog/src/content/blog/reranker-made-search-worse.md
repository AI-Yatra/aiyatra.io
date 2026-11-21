---
cover: https://raw.githubusercontent.com/zaidwhy/tiebreak/main/docs/benchmark-cover.png
coverAlt: "Bar chart of nDCG@10 change after reranking with a MiniLM
  cross-encoder: FiQA +0.109, NFCorpus +0.048, SciFact -0.009, the only dataset
  that got worse."
title: When a reranker makes your search worse
subtitle: One small benchmark, one number that went the wrong way, and what it
  taught me about measuring RAG
urlSlug: reranker-made-search-worse
excerpt: I added a reranker to my local RAG stack expecting a free win. On one
  of three datasets it made search worse. What I checked, and how to test it on
  your own data.
category: Research notes
tags:
  - RAG
  - Ollama
  - Reranking
  - Retrieval
  - BEIR
  - Open WebUI
date: 2026-11-15
author: Zaid Ali Syed
coAuthors: []
authorRole: Final-year B.Tech IT student at MGM University. I build retrieval
  systems and test whether they hold up.
authorUrl: https://github.com/zaidwhy
---
## The free win that wasn't

Every RAG tutorial ends the same way. Retrieve a hundred candidates, put a cross-encoder on top, watch the right document climb to the top. It is presented as the free upgrade, the step you add once everything else works.

So I added one. Ollama serves my chat and embedding models, but it has no rerank endpoint, so I wrote a small CPU server to sit next to it and tested it the boring way: three public BEIR datasets, BM25 retrieves the top 100, the reranker reorders them, nDCG@10 before and after.

Two of the three numbers came back the way the tutorials promise. FiQA, financial questions, jumped from 0.2074 to 0.3164. NFCorpus, medical questions, went from 0.3395 to 0.3871.

The third one went down.

On SciFact, BM25 alone scored 0.7303. After reranking, 0.7218. Same model, same code, same 100 queries per dataset. A small drop, 0.009, but pointing the wrong way.

## First, assume I broke something

A number that goes the wrong way is usually a bug, so that is where I started.

Quantization was my first suspect, because int8 weights are exactly the kind of shortcut that can quietly cost accuracy. But the default MiniLM (ms-marco-MiniLM-L-6-v2) already runs in full fp32, so that could not explain SciFact. I did check it where it could matter: a larger model, bge-reranker-base, had gained almost nothing on NFCorpus in int8. Its fp32 file scored 0.3430. The int8 one scored 0.3431. Not quantization.

Then the sample size. I had also run SciFact on just 30 queries. There, MiniLM's drop looked twice as bad, -0.020, and the larger reranker, bge-reranker-base, showed +0.037. On 100 queries the same two numbers were -0.009 and +0.020. Both shrank by about half just by looking at more questions. A 30-query result can be a mood, not a measurement. I stopped trusting anything under 100, including my own 30-query numbers.

Here is the full table, every row from the same cached candidate pool on one laptop CPU:

| Model | Dataset | BM25 | Reranked | Change | ms per pair |
| --- | --- | --- | --- | --- | --- |
| MiniLM (default) | SciFact | 0.7303 | 0.7218 | \-0.009 | 55.4 |
| bge-reranker-base (int8) | SciFact | 0.7303 | 0.7501 | +0.020 | 174.8 |
| MiniLM (default) | NFCorpus | 0.3395 | 0.3871 | +0.048 | 45.2 |
| bge-reranker-base (int8) | NFCorpus | 0.3395 | 0.3431 | +0.004 | 171.9 |
| MiniLM (default) | FiQA | 0.2074 | 0.3164 | +0.109 | 33.4 |
| bge-reranker-base (int8) | FiQA | 0.2074 | 0.3053 | +0.098 | 110.0 |

Look at the rows together and a second surprise shows up. The bigger model never lost, but on NFCorpus it gained almost nothing. The small model was the best of the two on two datasets and the worst on one. Averaged over all three, MiniLM gained +0.049 and bge-reranker-base +0.041. That average is true and it hides the only row that would hurt you if your documents looked like SciFact.

## Why SciFact might be different

I want to be clear that this part is a hypothesis. I did not run an experiment that isolates the cause.

MiniLM was [trained on the MS MARCO passage ranking task](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2): web search queries paired with short passages that answer them. SciFact is not a question-answering dataset. The "query" is a scientific claim, and the right document is the abstract that supports or refutes it. Asking a web-search reranker to judge that is asking it to do a job it never practised.

SciFact is also a dataset where BM25 is already strong, probably because claims and the abstracts behind them share a lot of technical vocabulary. When the first stage already puts the right abstract near the top, a reranker has little to fix and plenty of room to shuffle a correct result down.

One more thing I did measure: 13% of the SciFact query-document pairs were cut at 512 tokens, because abstracts are long. The reranker never saw the end of those abstracts. I have not tested how much that contributes, but it is the kind of detail that stays invisible until you count it.

## Check it on your own data before you trust it

The useful version of this story is not "rerankers are bad". On FiQA the same model improved ranking by more than half. The useful version is that the sign of the effect depends on your documents, and you only find out by measuring.

You do not need a benchmark suite for that. A few dozen real queries, the documents that should come back for each, and your current retriever are enough. The snippet below shows the shape of the check. It is illustrative: I tested the scoring function on small known cases, but I have not run the whole thing end to end as printed. It assumes a reranker that speaks the Cohere-style `/v1/rerank` request.

```python
import math
import requests

def ndcg_at_10(ranked_ids, relevant_ids):
    # binary relevance
    dcg = sum(
        1.0 / math.log2(i + 2)
        for i, doc_id in enumerate(ranked_ids[:10])
        if doc_id in relevant_ids
    )
    ideal = sum(1.0 / math.log2(i + 2) for i in range(min(len(relevant_ids), 10)))
    return dcg / ideal if ideal else 0.0

def rerank(query, docs, url="http://127.0.0.1:11435/v1/rerank"):
    # docs: list of (doc_id, text) from your first-stage retriever
    body = {"query": query, "documents": [t for _, t in docs]}
    results = requests.post(url, json=body, timeout=60).json()["results"]
    order = sorted(results, key=lambda r: r["relevance_score"], reverse=True)
    return [docs[r["index"]][0] for r in order]

def compare(queries, retrieve, relevant):
    # queries: list of str, retrieve(q) -> [(id, text)], relevant[q] -> set of ids
    before, after = [], []
    for q in queries:
        docs = retrieve(q)
        rel = relevant[q]
        before.append(ndcg_at_10([d for d, _ in docs], rel))
        after.append(ndcg_at_10(rerank(q, docs), rel))
    n = len(queries)
    print(f"first stage: {sum(before)/n:.4f}  reranked: {sum(after)/n:.4f}")
```

A few rules I now follow when I run it:

- Rerank the same fixed candidate pool for every model, so the reranker is the only thing that changes.
- Use the candidate count you would use in production. Reranking 100 documents costs far more than reranking 20.
- Look at per-query changes, not only the mean. A reranker that helps half your queries and hurts the other half can look perfectly flat.
- Keep it only if it beats your retriever alone on your own queries.

## The server I used

The reranker in this story is tiebreak, a small server I wrote because Ollama does not have a rerank endpoint yet (the request, [ollama/ollama#3368](https://github.com/ollama/ollama/issues/3368), is still open). It runs on CPU with ONNX Runtime, needs no GPU and no PyTorch, and answers the Cohere and Jina `/v1/rerank` request shapes, so a client that already speaks one of them only needs a new URL.

```bash
pip install tiebreak-rerank
tiebreak serve                          # 127.0.0.1:11435, downloads the default model once
tiebreak serve --model bge-reranker-v2-m3
```

If you use Open WebUI, two settings point it at the server. The URL has to include the full path, because Open WebUI does not append it for you:

```bash
RAG_RERANKING_ENGINE=external
RAG_EXTERNAL_RERANKER_URL=http://127.0.0.1:11435/v1/rerank
```

The repository, [github.com/zaidwhy/tiebreak](https://github.com/zaidwhy/tiebreak), includes the bench script that produced every number above, so you can rerun them or swap in your own data. Any other reranker that speaks the same API works with the same check. The point is the measurement, not the server.

## What it costs, and what I would watch

Latency is real on a CPU. On my laptop, reranking 20 candidates took about 1 second with MiniLM, about 3.5 seconds with bge-reranker-base int8, and about 10 seconds with bge-reranker-v2-m3. If your chat window waits on that, the quality gain has to earn it.

Bigger is not automatically better. bge-reranker-v2-m3 gave the largest gain I saw, +0.085 on SciFact (0.7409 to 0.8264), but that was on 30 queries of one dataset, and you already know what I think of 30 queries now.

Check truncation. Cross-encoders cap their input, 512 tokens here. If your chunks are long, the reranker never reads their tails, so chunk size and reranker length have to be chosen together.

And never let an average speak for you. A reranker can improve the mean across domains while quietly hurting the one domain you actually serve.

## The limits of this

- 100 queries per dataset, and 30 for the bge-reranker-v2-m3 row. Small samples, and the 30-query rows differ noticeably from the 100-query ones.
- BM25 top 100 was the only first stage. With a dense or hybrid retriever the gap a reranker has to close is different, and the results could move either way.
- Latency comes from one Windows laptop CPU. Yours will differ.
- Three datasets are not a survey. They show that the sign can flip, not how often it does.
- The SciFact explanation is a hypothesis.

The tutorials are not wrong that reranking often helps. They just skip the part where you check. Run the before and after on your own queries, and let your documents decide.
