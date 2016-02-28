declare module "pump" {
  import {Transform} from "stream";

  interface staticPump {
    (streams: NodeJS.ReadWriteStream[]): NodeJS.ReadWriteStream;
  }
  let pump: staticPump;
  export = pump;
}
