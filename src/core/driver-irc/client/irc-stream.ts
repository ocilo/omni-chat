//i mport * as pumpify from "pumpify";

import {Duplex, Transform} from "stream";
import {lineReader} from "./line-reader";
import {parseMessage} from "./helpers";
import {pipeline} from "./pipeline";

export function ircWriter(): Transform {
  return new ircWriterTransform();
}

export function ircReader(): NodeJS.ReadWriteStream {
  return pipeline([lineReader({ignoreEmpty: true, removeLineEndings: true}), new ircReaderTransform()]);
}

export function ircDuplex(stream: Duplex): Duplex {
  // return duplexify();
  return null;
}

class ircWriterTransform extends Transform {
  constructor() {
    super({writableObjectMode: true});
  }

  _transform(chunk: string[], encoding: string, callback: (err: Error) => any): any {
    console.log(chunk);
    if (!chunk.length) {
      return callback(null);
    }

    let parts: string[] = [];
    for(let i = 0; i<chunk.length; i++){
      parts.push(String(chunk[i]));
    }

    // escape last part
    let lastIdx = parts.length - 1;
    let lastPart = parts[lastIdx];
    if(/\s/.test(lastPart) || /^:/.test(lastPart) || lastPart === "") {
      parts[lastIdx] = `:${lastPart}`;
    }

    this.push(`${parts.join(" ")}\r\n`);
    console.log(">> " + parts.join(" "));

    callback(null);
  }
}

class ircReaderTransform extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(line: string, encoding: any, callback: (err: Error) => any): any {
    console.log("<< " + line);
    this.push(parseMessage(line));
    callback(null);
  }
}
