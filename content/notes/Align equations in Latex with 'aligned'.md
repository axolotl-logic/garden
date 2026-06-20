---
created_at: 2026-05-20T13:13:26-04:00
modified_at: 2026-06-10T15:05:15-04:00
tags: ["computer-science/latex"]
---
When writing out multiple equations in a row, to keep things tidy you may want to line up the equal sign. To do this in latex you use the `\begin{aligned}` command.

Start the list of equations you want to align with `\begin{aligned}` and end it with `\end{aligned}`. Within the list of equations, next to the equal sign you use `&`. The lines are centered around `&`  which is invisible. In other words, the content on the left of `&` will be right aligned, and the left  will be left aligned -- centering along the symbol to its right. 

For example, if you ever a series of equations, instead of an equal sign in the middle you'd have `&=` (allows space between). Say if you wanted to center around $\sim$ (`\sim`), you would write `&\sim`. 

You can mix and match too. The `&` is the important part.

$$
\begin{aligned}
\text{hello there friend} &\sim \text{woweee} \\
x & =3
\end{aligned}
$$

But wait! Why is it all on one line? To enter a newline, you provide `\\`.
