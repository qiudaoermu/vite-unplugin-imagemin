# vite-unplugin-imagemin

A vite png compressed plugin

## Install (yarn or npm)

**node version:** >=12.0.0

**vite version:** >=2.0.0

```
npm i vite-unplugin-imagemin -D
```

## Usage

- Configuration plugin in vite.config.ts

```ts
import viteImagemin from "vite-unplugin-imagemin";

export default () => {
  return {
    plugins: [viteImagemin({ dirs: "./dist/build" })],
  };
};
```

### Options

| params | type     | default | default      |
| ------ | -------- | ------- | ------------ |
| dirs   | `string` | -       | build folder |
