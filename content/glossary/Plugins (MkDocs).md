MkDoc plugins from third parties are installed via [[pip]] and listed in the [[MkDocs Configuration]] like so:

```yaml
plugins:
	- search
```

If a plugin requires options, they can be specified like so.

```yaml
plugins: 
	- search:
		lang: en 
		foo: bar
```

For more information, see https://www.mkdocs.org/dev-guide/plugins/

