import * as Bluebird from "bluebird";
import {Incident} from "incident";
import {getConnection as getFacebookConnection} from "./facebook";
import {Connection} from "palantiri-interfaces";

export interface ConnectionDescriptor {
  driver: string;
  [key: string]: any;
}

export function getConnection(descriptor: ConnectionDescriptor): Bluebird<Connection> {
  switch (descriptor.driver) {
    case "facebook": return getFacebookConnection(descriptor);
    default: return Bluebird.reject(new Incident("unknown-driver", {driver: descriptor.driver}, `Cannot get connection for ${descriptor.driver}`));
  }
}
