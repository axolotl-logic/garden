## Installation

```shell
npm install tailwindcss-mixins
```

```
module.exports = {
  plugins: [
    require('tailwindcss-mixins'),
  ]
}
```
## Usage

```html
<div class="
  mixin/button:inline-block
  mixin/button:font-bold
  mixin/button:underline
  mixin/link:text-blue-500
  mixin/link:hover:underline
">
  <a class="mixin/link" href="#">Link</a>
  <button class="mixin/button">Button</button>
</div>
```