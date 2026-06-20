---
created_at: 2026-05-20T13:13:26-04:00
modified_at: 2026-06-16T19:00:13-04:00
tags: ["computer-science/backend", "computer-science/theory"]
---
All nodes see the same data -- in other words there is only one observable state at a time. That is to say, the observable state remains consistent across nodes. Whereas [[strong eventual consistency]] reaches this state during a period of no-mutations, nodes in the system will always see the same updated data after a mutation. Another way to look at this is that no matter what order nodes access a state between consecutive mutations, they will receive the same data.
