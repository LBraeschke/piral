[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# [Piral Million](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-million.svg?style=flat)](https://www.npmjs.com/package/piral-million) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Community Chat](https://dcbadge.vercel.app/api/server/kKJ2FZmK8t?style=flat)](https://discord.gg/kKJ2FZmK8t)

This is a plugin that only has a peer dependency to `million`. What `piral-million` brings to the table is a set of Pilet API extensions that can be used with `piral` or `piral-core`.

The set includes a Million converter for any component registration, as well as a `fromMillion` shortcut and a `MillionExtension` component.

By default, these API extensions are not integrated in `piral`, so you'd need to add them to your Piral instance.

## Documentation

The following functions are brought to the Pilet API.

### `fromMillion()`

Transforms a standard Million component into a component that can be used in Piral, essentially wrapping it with a reference to the corresponding converter.

### `MillionExtension`

The extension slot component to be used in Million component.

## Usage

::: summary: For pilet authors

You can use the `fromMillion` function from the Pilet API to convert your Million components to components usable by your Piral instance.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';
import { MillionPage } from './MillionPage';

export function setup(piral: PiletApi) {
  piral.registerPage('/sample', piral.fromMillion(MillionPage));
}
```

Within Million components the Piral Million extension component can be used by referring to `MillionExtension`, e.g.,

```jsx
<MillionExtension name="name-of-extension" />
```

Alternatively, if `piral-million` has not been added to the Piral instance you can install and use the package also from a pilet directly.

```ts
import { PiletApi } from '<name-of-piral-instance>';
import { fromMillion } from 'piral-million/convert';
import { MillionPage } from './MillionPage';

export function setup(piral: PiletApi) {
  piral.registerPage('/sample', fromMillion(MillionPage));
}
```

:::

::: summary: For Piral instance developers

Using Million with Piral is as simple as installing `piral-million` and `million@^1`.

```ts
import { createMillionApi } from 'piral-million';
```

The integration looks like:

```ts
const instance = createInstance({
  // important part
  plugins: [createMillionApi()],
  // ...
});
```

The `million` package and its `million/react` module should be shared with the pilets via the *package.json*:

```json
{
  "importmap": {
    "imports": {
      "million": "",
      "million/react": ""
    }
  }
}
```

:::

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
