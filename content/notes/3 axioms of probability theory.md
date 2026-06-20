---
created_at: 2026-05-20T13:13:26-04:00
modified_at: 2026-06-10T15:05:15-04:00
tags: ["mathematics/probability"]
---
Kolmogorov's axioms formalize probability theory with set theory. They serve as a foundation on which to build out the rest of probability theory.

## Definitions

### Sample Space

The sample space is the set of all possible out comes.
Notated here as $\Omega$

### Event Space

A [[Sigma-algebra]] on that sample space.
### Event

Subset of $\Omega$
Notated for example as $A$ and $B$

### Mutually Exclusive

Events $A$ and $B$ are said to be mutually exclusive if $A \cap B = \emptyset$  

## Axioms

Given a sample space of $\Omega$ and a probability function $P$

First axiom is...

$$
\forall A \in \Omega, 0 \le P(A) \le 1
$$

Second axiom is...
$$
P(\Omega)=1
$$
Third axiom is

$$
\text{If $A$ and $B$ are mutually exclusive, } P(A \cup B) = P(A) + P(B)
$$
