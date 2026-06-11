A CRDT is a data structure with the following properties:

1. Individual replicas can update without coordination, even if other updates are happening concurrently. 
2. Contains an algorithm (yes, part of the data type) that automatically resolves inconsistencies.
3. All replicas are guaranteed to eventually converge. This is called [[Strong eventual consistency]]

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

#computer-science/local-first #computer-science/backend #computer-science/theory 