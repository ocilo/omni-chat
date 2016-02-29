import {Transform} from "stream";
import {Duplex} from "stream";
import * as pump from "pump";
import * as duplexify from "duplexify";

// Create a new duplex stream by piping an array of streams
export function pipeline(transforms: NodeJS.ReadWriteStream[]): NodeJS.ReadWriteStream {
  if (transforms.length < 2) {
    throw new Error("At least two streams are required");
  }

  pump(transforms);

  let first:NodeJS.WritableStream = transforms[0];
  let last:NodeJS.ReadableStream = transforms[transforms.length - 1];
  let writableObjectMode: boolean = first._writableState.objectMode;
  let readableObjectMode: boolean = last._readableState.objectMode;

  return duplexify(first, last, {writableObjectMode: writableObjectMode, readableObjectMode: readableObjectMode});
}
