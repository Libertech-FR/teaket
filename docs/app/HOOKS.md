# Hooks
**Regex** :
`/^(pages|components|layouts):([\w\/-]+):([\w\/-]+)$/`
## Syntax
```ts
const hook = `${prefix}:${file_path}:${hook_name}`
const prefix = pages | components | layouts
const file_path = tickets/_id
const hook_name = sidebar/top_actions
```
## List

| Hook | Description            |
| ---- |------------------------|
|pages:tickets/_id:sidebar/top_actions| Ce n'est qu'un exemple |
