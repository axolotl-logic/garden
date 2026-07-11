---
created_at: 2026-05-26T09:26:09-04:00
modified_at: 2026-06-20T12:15:10-04:00
growth: seedling
tags:
- computer-science/software-engineering
- computer-science/c-programming-language
global_pagerank: 0.004277457377825095
cluster_pagerank: 1.0
cluster_id: 90d48ea290c9ec6efdc5002ab0b9027c
---

The following is a anti-bikeshedding clang-tidy configuration for C projects. This would go in your `.clang-tidy` file in the root of the project.

```
bugprone-*
cert-*
clang-analyzer-*
concurrency-*
misc-*
modernize-*
performance-*
readability-*
```