>[!warning] Work in Progress


A *Position* is the ordered set $\{board, turn, ep, rights\}$  where $board$ is a weighted graph of $64$ vertices, $turn \in \{\text{'w', 'b'}\}$, $0 >= ep <= 64$, $rights \subseteq \{\text{'wk', 'wq', 'bk', 'bq'}\}$. 

Each player is a set of positions, referred to as options. On a turn, a player declares an option as current, changing each set of options.

The $kingbox$ is the square of a king along with neighboring vertices. 
