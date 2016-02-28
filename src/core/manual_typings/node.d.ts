declare module NodeJS {
  interface WritableStream {
    write(data: any, cb?: Function): boolean;
    _writableState?: {
      objectMode: boolean;
    };
  }
  interface ReadableStream {
    _readableState?: {
      objectMode: boolean;
    };
  }
}

declare module "stream" {
  interface TransformOptions {
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;
    transform?: Function;
    flush?: Function;
  }

  interface DuplexOptions {
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;
  }
}
