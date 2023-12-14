import type { ExtensionSlotProps, PiletApi } from 'piral-core';
import { createElement, Component } from 'react-15';
import { anyPropType } from './mount';

function compareObjects(a: any, b: any) {
  for (const i in a) {
    if (!(i in b)) {
      return false;
    }
  }

  for (const i in b) {
    if (!compare(a[i], b[i])) {
      return false;
    }
  }

  return true;
}

function compare<T>(a: T, b: T) {
  if (a !== b) {
    const ta = typeof a;
    const tb = typeof b;

    if (ta === tb && ta === 'object' && a && b) {
      return compareObjects(a, b);
    }

    return false;
  }

  return true;
}

export function createExtension(rootName: string) {
  const React15Extension: any = class extends Component<ExtensionSlotProps> {
    static contextTypes = {
      piral: anyPropType,
    };

    private onRefChange = (element: HTMLElement) => {
      if (element) {
        const { piral } = this.context as { piral: PiletApi };
        element.innerHTML = '';
        piral.renderHtmlExtension(element, this.props);
      }
    };

    shouldComponentUpdate(nextProps: ExtensionSlotProps) {
      return !compare(this.props, nextProps);
    }

    render() {
      return createElement(rootName, {
        ref: this.onRefChange,
      });
    }
  };

  return React15Extension;
}
