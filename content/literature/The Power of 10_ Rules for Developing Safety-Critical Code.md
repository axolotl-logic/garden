Coding standard that eliminates some [[C]] coding practices that inhibit static analysis as well as establishing requirements that are meant to make assurances. It was written by  [[Gerard J. Holzmann]], a researcher at [[NASA]] and [[Bell Labs]], for [[Reliable Software]].

```embed
title: "The Power of 10: Rules for Developing Safety-Critical Code: Computer: Vol 39, No 6"
image: "https://dl.acm.org/action/showDoPubAsset?doi=10.1145/contrib-81100589732&format=rel-imgonly&assetId=81100589732.jpg"
description: "Adhering to a set of 10 verifiable coding rules can make the analysis of critical software components more reliable."
url: "https://dl.acm.org/doi/10.1109/MC.2006.212"
```

# Abstract

> Adhering to a set of 10 verifiable coding rules can make the analysis of critical software components more reliable.

## Rules

> Rule 1: Restrict all code to very simple control flow constructs—do not use goto statements, setjmp or longjmp constructs, or direct or indirect recursion.

> Rationale: Simpler control flow translates into stronger capabilities for analysis and often results in improved code clarity.Banishing recursion is perhaps the biggest surprise here. Avoiding recursion results in having an acyclic function call graph, which code analyzers can exploit to prove limits on **stack use and boundedness of executions**. Note that this rule does not require that all functions have a single point of return, although this often also simplifies control flow. In some cases, though, an early error return is the simpler solution.
