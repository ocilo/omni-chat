import * as Bluebird from "bluebird";

import {Connection} from "./interfaces/connection";
import {EventEmitter} from "events";

export class OChatConnection extends EventEmitter implements Connection {
  connected: boolean;
}
