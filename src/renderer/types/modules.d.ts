declare module '@opentiny/tiny-engine-builtin-component' {
  import type { Component } from 'vue';

  export const CanvasRow: Component;
  export const CanvasCol: Component;
  export const CanvasRowColContainer: Component;
  export const CanvasFlexBox: Component;
  export const CanvasSection: Component;
}

declare module 'lodash' {
  import * as _ from 'lodash';
  export = _;
}

declare module '@babel/standalone' {
  export interface TransformOptions {
    presets?: any[];
    plugins?: any[];
    sourceType?: 'script' | 'module' | 'unambiguous';
    [key: string]: any;
  }

  export interface TransformResult {
    code: string | null;
    map: any;
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
}

declare module '@opentiny/tiny-schema-renderer' {
  import type { Component } from 'vue';
  import type { ISchemaRendererOptions } from './index';

  export function createSchemaRenderer(options?: ISchemaRendererOptions): Component;

  export * from '../core';
  export * from './index';
}
