import type { ForeignComponent, BaseComponentProps, Disposable } from 'piral-core';
import type { Type, NgLazyType, NgModuleDefiner, PrepareBootstrapResult } from './types';
import { BehaviorSubject } from 'rxjs';
import { enqueue } from './queue';
import { defineModule } from './module';
import { bootstrap, prepareBootstrap } from './bootstrap';
import { NgExtension } from '../common';

export interface NgConverterOptions {}

export interface NgConverter {
  <TProps extends BaseComponentProps>(component: any): ForeignComponent<TProps>;
  defineModule: NgModuleDefiner;
  Extension: any;
}

interface NgState<TProps> {
  queued: Promise<void | Disposable>;
  props: BehaviorSubject<TProps>;
  active: boolean;
}

export function createConverter(_: NgConverterOptions = {}): NgConverter {
  const registry = new Map<any, PrepareBootstrapResult>();
  const convert = <TProps extends BaseComponentProps>(component: Type<any> | NgLazyType): ForeignComponent<TProps> => ({
    mount(el, props, ctx, locals: NgState<TProps>) {
      locals.active = true;

      if (!locals.props) {
        locals.props = new BehaviorSubject(props);
      }

      if (!locals.queued) {
        locals.queued = Promise.resolve();
      }

      locals.queued = locals.queued.then(() =>
        enqueue(async () => {
          if (!registry.has(component)) {
            registry.set(component, await prepareBootstrap(component, props.piral));
          }

          if (locals.active) {
            return await bootstrap(registry.get(component), el, locals.props, ctx);
          }
        }),
      );
    },
    update(el, props, ctx, locals: NgState<TProps>) {
      locals.props.next(props);
    },
    unmount(el, locals: NgState<TProps>) {
      locals.active = false;
      locals.queued = locals.queued.then((dispose) => dispose && enqueue(dispose));
    },
  });
  convert.defineModule = defineModule;
  convert.Extension = NgExtension;
  return convert;
}
