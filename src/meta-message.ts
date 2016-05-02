import MessageInterface from "./interfaces/message";
import * as Bluebird from "bluebird";
import Incident from "incident";

function areMessagesEquivalent(msg1: MessageInterface, msg2: MessageInterface): Bluebird<boolean> {
  return Bluebird.reject(new Incident("todo", "areMessagesEquivalent is not implemented yet"));
}

/**
 * Represents a high-level MetaMessage (cross-account message)
 */
export class MetaMessage implements MessageInterface {
  subMessages: MessageInterface[];

  constructor(messages: MessageInterface[] = []) {
    this.subMessages = messages;
  }

  getBody (): Bluebird<string> {
    if (this.subMessages.length < 1) {
      return Bluebird.reject(new Incident("empty-meta-message", "This meta-message is empty!"));
    }
    // TODO: for the moment we trust the first sub-message, the test should be stronger
    return Bluebird.resolve(this.subMessages[0].getBody());
  }
}

export default MetaMessage;
