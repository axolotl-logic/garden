In CSS a container query allows you to apply styles based on the size of the element's container.
## Nearest Ancestor

In this example from (https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)[mozilla.org] apply styles to elements based on the size of the nearest ancestor with a containment context.
### Step 1 - Write HTML
```html
<div class="post">
  <div class="card">
    <h2>Card title</h2>
    <p>Card content</p>
  </div>
</div>
```

### Step 2 - Create Containment Context
```css
.post {
  container-type: inline-size;
}
```

### Step 3 - Define container query
```css
/* Default heading styles for the card title */
.card h2 {
  font-size: 1em;
}

/* If the container is larger than 700px */
@container (min-width: 700px) {
  .card h2 {
    font-size: 2em;
  }
}
```