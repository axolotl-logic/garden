```base
formulas:
  uncreated links: file.links.filter(!value.asFile().isTruthy())
views:
  - type: table
    name: Table
    filters:
      and:
        - formula["uncreated links"]
    order:
      - file.name
      - formula.uncreated links

```


