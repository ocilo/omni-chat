import {Thenable} from "bluebird";

/**
 * Represents a message sent to the network (this is not a partial message)
 */
// TODO: add methods like "respond" and events like "delivered", "read", etc. ?
export interface MessageInterface {
  getBody(): Thenable<string>;
}

export default MessageInterface;
