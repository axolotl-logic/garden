>[!warning] Source lost
>The code here is likely from Wikipedia. I plan to hand-rewrite them to a different language.

A CRDT is a [[data structure]] with the following properties:

1. Individual replicas can update without coordination, even if other updates are happening concurrently. 
2. Contains an algorithm (yes, part of the data type) that automatically resolves inconsistencies.
3. All replicas are guaranteed to eventually converge. This is called being [[eventually consistent]].

They are useful for [[Local-First]].
## Operations


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


Replicas exchange entirity of state

3 functions: initialization of state,  updating of states through actions, and merge. 

### Merge

Merge is a binary operation with the following properties:

* [[Commutative Property]]
* [[Associative]] 
* [[Idempotent]]

When implementing a CRDT, this list of properties may serve as a great framework for testing.

Formally defined in 2011 by Marc Shapiro, Nuno Preguiça, Carlos Baquero and Marek Zawirski.

### Operation-based CRDTs

Nomerge function. 

## Known CRDTs

### LWW-Element-Set (Last-Write-Wins-Element-Set)


As the name suggests. 


### G-Counter

```
payload integer[n] P
    initial [0,0,...,0]
update increment()
    let g = myId()
    P[g] := P[g] + 1
query value() : integer v
    let v = Σi P[i]
compare (X, Y) : boolean b
    let b = (∀i ∈ [0, n - 1] : X.P[i] ≤ Y.P[i])
merge (X, Y) : payload Z
    let ∀i ∈ [0, n - 1] : Z.P[i] = max(X.P[i], Y.P[i])
```

### PN-Counter (Positive-Negative Counter)

```
payload integer[n] P, integer[n] N
    initial [0,0,...,0], [0,0,...,0]
update increment()
    let g = myId()
    P[g] := P[g] + 1
update decrement()
    let g = myId()
    N[g] := N[g] + 1
query value() : integer v
    let v = Σi P[i] - Σi N[i]
compare (X, Y) : boolean b
    let b = (∀i ∈ [0, n - 1] : X.P[i] ≤ Y.P[i] ∧ ∀i ∈ [0, n - 1] : X.N[i] ≤ Y.N[i])
merge (X, Y) : payload Z
    let ∀i ∈ [0, n - 1] : Z.P[i] = max(X.P[i], Y.P[i])
    let ∀i ∈ [0, n - 1] : Z.N[i] = max(X.N[i], Y.N[i])
```

### G-Set (Grow-only Set)
```
payload set A
    initial ∅
update add(element e)
    A := A ∪ {e}
query lookup(element e) : boolean b
    let b = (e ∈ A)
compare (S, T) : boolean b
    let b = (S.A ⊆ T.A)
merge (S, T) : payload U
```

### 2P-Set (Two-Phase Set)
```
payload set A, set R
    initial ∅, ∅
query lookup(element e) : boolean b
    let b = (e ∈ A ∧ e ∉ R)
update add(element e)
    A := A ∪ {e}
update remove(element e)
    pre lookup(e)
    R := R ∪ {e}
compare (S, T) : boolean b
    let b = (S.A ⊆ T.A ∧ S.R ⊆ T.R)
merge (S, T) : payload U
    let U.A = S.A ∪ T.A
    let U.R = S.R ∪ T.R
```
## Sequence CRDTs

Used by collaborative real-time editors. 

Some known Sequence CRDTs are Treedoc, RGA, Woot, Logoot, and LSEQ.

#computer-science/local-first #computer-science/backend #computer-science/theory 