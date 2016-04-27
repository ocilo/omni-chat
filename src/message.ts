import MessageInterface from "./interfaces/message";

/**
 * Represents a high-level message (wrap passive message objects in accessors)
 */
export class Message implements MessageInterface {
  // How do we differentiate the same message sent in shared discussion to multiple drivers -> it has one id per driver
}

export default Message;
