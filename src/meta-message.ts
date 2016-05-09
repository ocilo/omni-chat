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
    // TODO: for the moment we trust the first sub-message, the test should be stronger:
    // what if there are differences between the simple messages ?
    return Bluebird.resolve(this.subMessages[0].getBody());
  }

  /**
   * Returns true if every sub-message is delivered
   * @returns {Bluebird<boolean>}
   */
  isDelivered(): Bluebird<boolean> {
    return this.getSubMessages()
      .map((subMsg: MessageInterface) => subMsg.isDelivered())
      .reduce((acc: boolean, isDelivered: boolean) => acc && isDelivered, true);
  }

  getLastEditingDate(): Bluebird<Date> {
    return Bluebird.reject(new Incident("todo", "getLastEditingDate is not implemented yet"));;
  }

  getCreationDate(): Bluebird<Date> {
    return Bluebird.reject(new Incident("todo", "getCreationDate is not implemented yet"));;
  }

  // CLASS-SPECIFIC METHODS
  /**
   * Return the list of all the submessages constituting the
   * current MetaMessage.
   */
  getSubMessages (): Bluebird<MessageInterface[]> {
    return Bluebird.resolve(this.subMessages);
  }
}

export default MetaMessage;
