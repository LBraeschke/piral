[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# [Piral Tracking](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-tracking.svg?style=flat)](https://www.npmjs.com/package/piral-tracking) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Community Chat](https://dcbadge.vercel.app/api/server/kKJ2FZmK8t?style=flat)](https://discord.gg/kKJ2FZmK8t)

This is a plugin that only has a peer dependency to `piral-core`. What `piral-tracking` brings to the table is a set of Pilet API extensions that can be used with `piral` or `piral-core`.

The set includes the `track...` APIs to be used in pilets for using a set of analytics, telemetry, and tracking tools from your Piral instance.

By default, these API extensions are not integrated in `piral`, so you'd need to add them to your Piral instance.

## Why and When

Quite often somebody is interested how a particular action was done. Which button was clicked? How far was the webpage scrolled? The tracker tools are among the standard reportoire to cover these questions. The problem in a distributed context is "how to reach them"? Should every microfrontend come up with their own tracking solution?

Usually, the answer to this should be **no**. This plugin gives you an abstraction that can be used with almost *any* tracking solution. The abstraction allows each pilet to use a common API to track.

Alternatives: Use your preferred tracking application standalone.

## Video

We also have a video for this plugin:

@[youtube](https://youtu.be/wCNflOoXS2c)

## Documentation

The following functions are brought to the Pilet API.

### `trackEvent()`

Tracks a custom event incl. properties and other standard metrics.

### `trackError()`

Tracks an error or exceptional behavior incl. properties.

### `trackFrame()`

Starts a tracking frame. The frame can be ended via the returned callback.

## Usage

::: summary: For pilet authors

You can use the `trackEvent` function from the Pilet API to track a custom event with an arbitrary definition.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  piral.trackEvent('sample-pilet-ready');
}
```

You can use the `trackError` function from the Pilet API to track an error from the pilet.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  try {
    throw new Error('Ouch!');
  } catch (e) {
    piral.trackError(e);
  }
}
```

You can use the `trackFrame` function from the Pilet API to track a custom event with integrated running time measurement.

Example use:

```ts
import { PiletApi } from '<name-of-piral-instance>';

export function setup(piral: PiletApi) {
  const frame = piral.trackFrame('sample-pilet-computation');

  setTimeout(() => {
    frame();
  }, 4000);
}
```

:::

::: summary: For Piral instance developers

The provided library only brings API extensions for pilets to a Piral instance.

For the setup of the library itself you'll need to import `createTrackingApi` from the `piral-tracking` package.

```ts
import { createTrackingApi } from 'piral-tracking';
```

The integration looks like:

```ts
const instance = createInstance({
  // important part
  plugins: [createTrackingApi()],
  // ...
});
```

There are no options available.

The integration of other trackers is done by listening to the events. Example for Application Insights:

```js
import { createInstance } from 'piral';
import { createTrackingApi } from 'piral-tracking';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  // ...
});

appInsights.loadAppInsights();

const instance = createInstance({
  plugins: [createTrackingApi()]
});

instance.on('track-event', evt => {
  const name = evt.name;
  const properties = {
    ...evt.properties,
    piletName: evt.pilet,
  };
  appInsights.trackEvent({ name, properties });
});
```

:::

## Events

The extension gives the core a set of new events to be listened to:

- `track-event`
- `track-error`
- `track-frame-start` and `track-frame-end`

The events are fully typed.

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
