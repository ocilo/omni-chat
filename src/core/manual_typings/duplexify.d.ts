declare module "duplexify" {
  import {DuplexOptions} from "stream";

  interface staticDuplexify {
    (writable: NodeJS.WritableStream, readable: NodeJS.ReadableStream, options: DuplexOptions): NodeJS.ReadWriteStream;
  }
  let duplexify: staticDuplexify;
  export = duplexify;
}
