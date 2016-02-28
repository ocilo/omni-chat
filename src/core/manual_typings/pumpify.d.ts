declare module "pumpify" {
  import {Transform} from "stream";

  interface staticPumpify {
    (...streams: Transform[]): Transform;
  }
  let pumpify: staticPumpify;
  export = pumpify;
}
