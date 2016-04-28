import MessageInterface from "./interfaces/message";
import * as Bluebird from "bluebird";

/**
 * Represents a high-level message (wrap passive message objects in accessors)
 */
export class Message implements MessageInterface {
  // How do we differentiate the same message sent in shared discussion to multiple drivers -> it has one id per driver
  // TODO: Create a simple-message and meta-message implementation like for the discussions ?
  body: string;

  constructor() {
    this.body = "todo: support message.body";
  }

  getBody (): Bluebird<string> {
    return Bluebird.resolve(this.body);
  }
}

export default Message;
