

Set of rules that support mechanical verification of safty.

The code rules primarily operate on C as that is the NASA language
### 10 Rules

1. Restrict all code to simple control concepts -- including no direct/indirect recursion
2. All loops must have a fixed upper bound. It must be trivial to statically prove the upper bound can not be exceeded.
3. No dynamic memory allocation after initialization. Fixed preallocated region of memory.
4. No function should exceed what can be printed on a single sheet of paper, ~60 lines.
5. Assertion density should ~ 2 asserts per function minimum.  The assertion should not have side effects and handle ever failed assertion gracefully.
6. Data objects must be be declared at the smallest possible level of scope.
7. All returns must be checked or explicitly indicated as acknowledged with e.g. a void cast.
8. Simple macro definitions only and only in headers. Minimize usage of conditionally building parts of the code.
9. The use of pointers should be restricted. No more than one level of dereferencing allowed. Function pointers are not permitted.
10. All code must compile with no warnings and be checked by analysis daily from day 1.
