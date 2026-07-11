---
created_at: 2026-06-02T09:27:52-04:00
modified_at: 2026-06-20T12:15:10-04:00
growth: evergreen
tags:
- psychology/behavior-change
global_pagerank: 0.011529988875201068
cluster_pagerank: 0.04174446750512158
cluster_id: bf41d5db23befec8b07ca5b922455ad6
---

The [[The Behavior Change Wheel (Michie, Susan, et al 2011)| COM-B framework]] breaks a behavior change intervention into 3 components which encapsulate factors that influence behavior. These 3 are then each broken down into 2 subdivisions each.

| Component   | Subdivision   | Achieved by                                              | Examples                                  |
| ----------- | ------------- | -------------------------------------------------------- | ----------------------------------------- |
| Capability  | Physical      | physical skill development                               | training, prostheses, surgery             |
| Capability  | Psychological | knowledge, understanding                                 | skill learning, meds                      |
| Motivation  | Automatic     | positive/negative feelings, impulses, and counter-pulses | habit formation, meds, imitative learning |
| Motivation  | Reflective    | eliciting positive/negative feelings                     | imparting knowledge                       |
| Oppertunity | Social        |                                                          | environment change                        |
| Oppertunity | Physical      |                                                          | environment change                        |


```mermaid
graph TD
	A(Capability) --> B(Motivation)
	C(Opportunity) --> B(Motivation)
	A <--> D(Behavior)
	B <--> D
	C <--> D
```

```mermaid
---
title: Components and Subdivisions
---
graph TD 
	classDef focal stroke:#899D03,stroke-width:4px;
	classDef mostImportant stroke:#fe7126,stroke-width:4px;
	classDef sources stroke:#fcb829,stroke-width:4px;
	
	A{{Physical}} --> B((Capability))
	C{{Psychological}} --> B
	D{{Physical}} --> E((Opportunity))
	F{{Social}} --> E
	G{{Automatic}} --> H((Motivation))
	I{{Reflective}} --> H
	
	B --> H
	E --> H
	B <--> J((Behavior))
	E <--> J
	H <--> J

	class B,E,H focal;
	class J mostImportant;
	class A,C,D,F,G,I sources;
```