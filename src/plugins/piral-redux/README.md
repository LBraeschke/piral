[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# [Piral Redux](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-redux.svg?style=flat)](https://www.npmjs.com/package/piral-redux) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Community Chat](https://dcbadge.vercel.app/api/server/kKJ2FZmK8t?style=flat)](https://discord.gg/kKJ2FZmK8t)

This is a plugin that only has a peer dependency to `piral-core`. What `piral-redux` brings to the table is a set of Pilet API extensions that can be used with `piral` or `piral-core` for including a state container managed by Redux.

By default, these API extensions are not integrated in `piral`, so you'd need to add them to your Piral instance.

## Why and When

Piral comes with an integrated state management. There is no need to use this for your own purposes, but you could use it. If you don't want to use it the chance that you actually want to use the popular `redux` library is quite high. Now, every pilet could come up with its own state management system, however, sharing this kind of library makes sense. Potentially what makes even more sense is having a single store, where all pilets would get a fraction of it. As such states could even be shared and the complexity of knowing what's happening in the application is reduced to monitoring a single store.

Alternatives: Use the integrated state management. Just expose `redux` and `react-redux` as shared dependencies.

## Documentation

The following functions are brought to the Pilet API.

### `createReduxStore()`

Creates a new Redux store for the pilet. The store is tighly coupled to the lifetime of the pilet.

This function returns the `connect` function known from React Redux - just applied to the pilet store.

## Usage

::: summary: For pilet authors

Use the function `createReduxStore` to obtain a store connector. The store connector is a higher-order component that wraps an existing component and removes the `state` and `dispatch` props. Instead, `state` will be "connected" to the created pilet store and `dispatch` allows modifying the state by calling the reducer with the provided action.

Let's see a full example.

```ts
export function setup(api: PiletApi) {
  const connect = api.createReduxStore(myReducer);
  // ...
}
```

The reducer could be defined such as:

```ts
const initialState = {
  count: 0
};

function myReducer(state = initialState, action) {
  switch (action.type) {
    case "increment":
      return {
        count: state.count + 1
      };
    case "decrement":
      return {
        count: state.count - 1
      };
    default:
      return state;
  }
}
```

Using this construct is straight forward and follows other `create...` Pilet APIs.

```jsx
root.registerPage(
  "/sample",
  connect(({ state, dispatch }) => (
    <div>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
      {state.count}
    </div>
  ))
);
```

:::

::: summary: For Piral instance developers

The provided library only brings API extensions for pilets to a Piral instance.

For the setup of the library itself you'll need to import `createReduxApi` from the `piral-redux` package.

```ts
import { createReduxApi } from 'piral-redux';
```

The integration looks like:

```ts
const instance = createInstance({
  // important part
  plugins: [createReduxApi()],
  // ...
});
```

There are two options available. The `reducer` option allows us to define reducers that also access and manipulate the global state. The `enhancer` option allows us to pass in a custom store enhancer. For more details on enhancers please look at the [Redux documentation](https://read.reduxbook.com/markdown/part1/05-middleware-and-enhancers.html).

:::

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
