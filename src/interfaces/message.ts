import {Thenable} from "bluebird";

/**
 * Represents a message sent to the network (this is not a partial message).
 */
// TODO: add methods like "respond()" and events like "delivered", "read", etc. ?
// TODO: add methods like getSubmessages() and so on to looks like DiscussionInterface ?
export interface MessageInterface {
	/**
   * Return the body of the current Message.
   */
  getBody(): Thenable<string>;

	/**
   * Return true only if this message is delivered through several protocols.
   */
  // TODO : rename it ?
  isHeterogeneouslyDelivered(): boolean;

	/**
   * Return the date of last editing.
   */
  getLastEditingDate(): Thenable<Date>;

	/**
   * Return the date of the current Message creation.
   */
  getCreationDate(): Thenable<Date>;
}

export default MessageInterface;
