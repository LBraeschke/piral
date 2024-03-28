[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# [Piral Lazy](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-lazy.svg?style=flat)](https://www.npmjs.com/package/piral-lazy) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Community Chat](https://dcbadge.vercel.app/api/server/kKJ2FZmK8t?style=flat)](https://discord.gg/kKJ2FZmK8t)

This is a plugin that only has a peer dependency to `piral-core`. What `piral-lazy` brings to the table is a set of Pilet API extensions that can be used with `piral` or `piral-core`.

The set includes a `fromLazy` shortcut.

By default, these API extensions are not integrated in `piral`, so you'd need to add them to your Piral instance. We recommend integrating `piral-lazy` when you think about an opt-in for *any* third-party framework (e.g., `piral-vue`, `piral-ng`, ...).

## Why and When

Lazy loading of data or other dependencies can be crucial in more complex scenarios. It should not be necessary to include everything in one load to bring a pilet or components of it to live.

`piral-lazy` allows defining generic dependencies that will be loaded *before* loading/using a component. The provided helpers which are exposed via the pilet API give you the power to

1. define new dependencies (given by a unique name and a loader function) and
2. rely on defined dependencies before actually loading/trying to render a component.

If your pilets use lazy loading in some way then `piral-lazy` may be the right choice. Also, if your pilets are too large and could benefit from further resource sharing and lazy loading then this plugin could be helpful. `piral-lazy` remains framework agnostic and thus works beyond React.

Alternative: Just define/use what is there out of the box. By using `React.lazy` together with bundle splitting most of the things may be already properly transported. Remember that you could also lazy load context that provide your dependencies - thus making `React.lazy` a single solution (if your framework is "React").

## Documentation

The following functions are brought to the Pilet API.

### `defineDependency()`

Allows to define lazy loading dependencies in form of lazy loading functions. This can be used to ensure certain data is available or that certain modules are already loaded.

A simple example:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  piral.defineDependency('lodash', () => import('https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js'));
}
```

### `fromLazy()`

Transforms the result of a promise derived from a callback (i.e., lazy loading) to a proper component. This is thought for non-React lazy loading. For React you'll need to use the known way of applying `React.lazy` to your component initialization.

## Usage

::: summary: For pilet authors

You can use the `fromLazy` function from the Pilet API to convert your lazy loaded components to components usable by your Piral instance.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  const LazyPage = piral.fromLazy(() => import('./MyPage'));
  piral.registerPage('/sample', LazyPage);
}
```

**Remark**: For React components `React.lazy` should be preferred. The provided lazy loading wrapper should only be used for third-party components that require a converter.

For lazy loading externals we recommend a combination with import maps. These can be set up in *package.json* as simple as follows:

```json
{
  "name": "my-pilet",
  "version": "1.0.0",
  "importmap": {
    "imports": {
      "lodash": "./node_modules/lodash/index.js"
    }
  }
}
```

Now we can actually use this in combination with `defineDependency`:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  const loadFromImport = (name: string) => require('importmap').ready(name);
  piral.defineDependency('lodash', () => loadFromImport('lodash'));
  const LazyPage = piral.fromLazy(() => import('./MyPage'), ['lodash']);
  piral.registerPage('/sample', LazyPage);
}
```

**Important**: You'll either need to use import maps or `externals` in your package.json to be able to use `require` or `import from` in your lazy loaded bundles. Otherwise, the noted packages will be fixed bundled in. If you follow the setup above you'd be fine in any case.

The other use case could be population of data, e.g., in combination with a global state container:

```ts
// Lazy loaders
const TranslatePageView = () => import('./translatepage').then(m => m.default);
const common = () => import('./common');
const prerequest = () => fetch('/somedata')
  .then(res => import('./setstore').then(m => m.default(res)));

// Components
const TranslatePage = app.fromLazy(TranslatePageView, ['common', 'prerequest']);

// Registrations
app.defineDependency('common', common);
app.defineDependency('prerequest', prerequest);
app.registerPage('/translate', TranslatePage);
```

:::

::: summary: For Piral instance developers

Using lazy loading with Piral is as simple as installing `piral-lazy`.

```ts
import { createLazyApi } from 'piral-lazy';
```

The integration looks like:

```ts
const instance = createInstance({
  // important part
  plugins: [createLazyApi()],
  // ...
});
```

:::

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
