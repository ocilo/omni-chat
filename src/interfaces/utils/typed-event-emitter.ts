/**
 * This allows to define an EventEmitter with a single event/listener pair.
 * TODO: find a way to easily support multiple event/listener pairs.
 *
 * N name
 * EO eventObject
 */
export interface TypedEventEmitter<N extends string, EO> extends NodeJS.EventEmitter {
  addListener(event: N, listener: (eventObject?: EO) => any): this;
  addListener(event: string, listener: Function): this;
  on(event: N, listener: (eventObject?: EO) => any): this;
  on(event: string, listener: Function): this;
  once(event: N, listener: (eventObject?: EO) => any): this;
  once(event: string, listener: Function): this;
  removeListener(event: N, listener: (eventObject?: EO) => any): this;
  removeListener(event: string, listener: Function): this;
  // removeAllListeners(event?: string): this;
  // setMaxListeners(n: number): this;
  // getMaxListeners(): number;
  // listeners(event: string): Function[];
  emit(event: N, eventObject: EO): boolean;
  emit(event: string, ...args: any[]): boolean;
  // listenerCount(type: string): number;
}
