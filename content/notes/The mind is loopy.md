> [!warning] It's gonna get weird

```mermaid
graph LR
	A[[Subsystem 1]] --> B{Behavior}
	B --> A 
	B --> D[[Subsystem 2]]
    D --> B
	B --> E[[Subsystem *n*]]
    E --> B
```
