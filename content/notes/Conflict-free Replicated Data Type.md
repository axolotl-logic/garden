---
created_at: 2026-05-20T13:13:26-04:00
modified_at: 2026-06-16T19:00:13-04:00
growth: budding
tags:
- computer-science/local-first
- computer-science/backend
- computer-science/theory
global_pagerank: 0.017656838339128598
cluster_pagerank: 0.2795725072134137
cluster_id: 715c1811896488ca124d8314973d347b
---

A CRDT is a data structure with the following properties:

1. Individual replicas can update without coordination, even if other updates are happening concurrently. 
2. Contains an algorithm (yes, part of the data type) that automatically resolves inconsistencies.
3. All replicas are guaranteed to eventually converge and also those with the same updates have the same value. This is called [[strong eventual consistency]].

They are useful for Local-First architectures.
## Types

### State-based CRDTs
Also called convergent replicated data types, or CvRDTs. 

this data type is two types:
    A type for local states
    A type for actions on that state

And three functions:
     Produce initial state
     Update state through actions
     Merge that state

Replicas exchange entirety of state

3 functions: initialization of state,  updating of states through actions, and merge.