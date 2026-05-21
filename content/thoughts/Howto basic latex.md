A little bit of latex goes a long way when it comes to presenting your ideas clearly and effortlessly. 

## Aligned

If you want to align your equations you use `\begin{aligned}` at the beginning, `\end{aligned}` at the end, and `&=` where you want the centered $=$ to be. The content on the left of `&=` will be right aligned, and the left right will be left aligned -- centering along this symbol. To enter a newline, you provide `\\`.
What if you want to use the tilde? As in x follows a normal distribution, i.e. $x \sim N(\mu,\sigma^2$), use `&\sim`.

$$
\begin{aligned}
\text{hello there friend} &\sim \text{woweee} \\
x & =3
\end{aligned}
$$
