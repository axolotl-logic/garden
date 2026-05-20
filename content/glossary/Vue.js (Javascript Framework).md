A [[Progressive Web App (PWA)]] framework with declarative and component based [[Programming Model]]. You can not only target the web, but desktop, mobile, WebGL, and even terminal.

## Single-File-Components (SFC)

You build a Vue.js's UI with Single-File-Components. The standard file convention is to use a suffix of `.vue`

Here's an example from the official documentation

```vuejs
<script setup>
import { ref, onMounted } from 'vue'

// reactive state
const count = ref(0)

// functions that mutate state and trigger updates
function increment() {
  count.value++
}

// lifecycle hooks
onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

### Related Technologies

The project creation tool offers to setup technologies such as [[Prettier]], [[Eslint]], [[Pinia (State Management)]],  [[Typescript (Programming Language)]], and [[Vue Devtools]].

