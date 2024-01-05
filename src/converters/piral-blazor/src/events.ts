import type { ExtensionRegistration } from 'piral-core';
import { createElement } from 'react';
import { isInternalNavigation, performInternalNavigation } from './navigation';

const blazorRootId = 'blazor-root';
const eventParents: Array<HTMLElement> = [];

const globalEventNames = [
  'abort',
  'blur',
  'change',
  'error',
  'focus',
  'load',
  'loadend',
  'loadstart',
  'mouseenter',
  'mouseleave',
  'progress',
  'reset',
  'scroll',
  'submit',
  'unload',
  'DOMNodeInsertedIntoDocument',
  'DOMNodeRemovedFromDocument',
  'click',
  'dblclick',
  'mousedown',
  'mousemove',
  'mouseup',
];

const eventNames = {
  render: 'render-blazor-extension',
  navigate: 'navigate-blazor',
  piral: 'piral-blazor',
};

function isRooted(target: HTMLElement) {
  let parent = target.parentElement;

  while (parent) {
    if (parent.id === blazorRootId) {
      return true;
    }

    parent = parent.parentElement;
  }

  return false;
}

function findTarget(target: HTMLElement = document.body) {
  if (eventParents.length === 0) {
    return target;
  } else if (target === document.body) {
    return eventParents[0];
  } else {
    return target;
  }
}

function dispatchToRoot(event: any) {
  if (isInternalNavigation(event)) {
    performInternalNavigation(event);
  }

  // the mutation event cannot be cloned (at least in Webkit-based browsers)
  if (!(event instanceof MutationEvent) && !event.processed) {
    const eventClone = new event.constructor(event.type, event);
    document.getElementById(blazorRootId)?.dispatchEvent(eventClone);
    // make sure to only process every event once; even though multiple boundaries might be active
    event.processed = true;
  }
}

export function emitRenderEvent(
  source: HTMLElement,
  name: string,
  params: any,
  sourceRef: any,
  fallbackComponent: string | null,
) {
  const target = findTarget(source);
  const empty =
    typeof fallbackComponent === 'string'
      ? () => createElement('piral-extension', { name: fallbackComponent, params })
      : undefined;
  const order =
    typeof sourceRef !== 'undefined'
      ? (elements: Array<ExtensionRegistration>) => {
          const oldItems = elements.map((el, id) => ({
            id,
            pilet: el.pilet,
            defaults: el.defaults ?? {},
          }));
          const newItems: Array<{ id: number }> = sourceRef.invokeMethod('Order', oldItems);
          return newItems.map(({ id }) => elements[id]).filter(Boolean);
        }
      : undefined;
  const eventInit = {
    bubbles: true,
    detail: {
      target,
      props: {
        name,
        params,
        empty,
        order,
      },
    },
  };
  const delayEmit = () =>
    requestAnimationFrame(() => {
      if (!isRooted(target)) {
        target.dispatchEvent(new CustomEvent(eventNames.render, eventInit));
      } else {
        delayEmit();
      }
    });
  delayEmit();
}

export function emitPiralEvent(type: string, args: any) {
  document.body.dispatchEvent(
    new CustomEvent(eventNames.piral, {
      bubbles: false,
      detail: {
        type,
        args,
      },
    }),
  );
}

export function emitNavigateEvent(source: HTMLElement, to: string, replace = false, state?: any) {
  findTarget(source).dispatchEvent(
    new CustomEvent(eventNames.navigate, {
      bubbles: true,
      detail: {
        to,
        replace,
        state,
      },
    }),
  );
}

export function attachEvents(
  host: HTMLElement,
  render: (ev: CustomEvent) => void,
  navigate: (ev: CustomEvent) => void,
  forward: (ev: CustomEvent) => void,
) {
  eventParents.push(host);
  host.addEventListener(eventNames.render, render, false);
  host.addEventListener(eventNames.navigate, navigate, false);

  if (eventParents.length === 1) {
    document.body.addEventListener(eventNames.piral, forward, false);
  }

  return () => {
    eventParents.splice(eventParents.indexOf(host), 1);
    host.removeEventListener(eventNames.render, render, false);
    host.removeEventListener(eventNames.navigate, navigate, false);

    if (eventParents.length === 0) {
      document.body.removeEventListener(eventNames.piral, forward, false);
    }
  };
}

export function addGlobalEventListeners(el: HTMLElement) {
  globalEventNames.forEach((eventName) => el.addEventListener(eventName, dispatchToRoot));
}

export function removeGlobalEventListeners(el: HTMLElement) {
  globalEventNames.forEach((eventName) => el.removeEventListener(eventName, dispatchToRoot));
}
