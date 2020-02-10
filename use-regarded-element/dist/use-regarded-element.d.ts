/// <reference types="react" />
import React from 'react';
import Observer from 'regarded-element-observer';
type ObserverOptions = ConstructorParameters<typeof Observer>[0];
type ObserverHookOptions = Omit<ObserverOptions, 'rootElement'>;
declare function useRegardedElement(options: ObserverHookOptions): React.MutableRefObject<null>;
export { ObserverHookOptions, useRegardedElement };