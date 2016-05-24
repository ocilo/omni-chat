import MessageInterface from "./interfaces/message";
import * as Bluebird from "bluebird";
import {Incident} from "incident";
import * as palantiri from "palantiri-interfaces";
import {v4 as uuid} from "node-uuid";

/**
 * TODO: doc.
 */
function areMessagesEquivalent(msg1: MessageInterface, msg2: MessageInterface): Bluebird<boolean> {
  return Bluebird.reject(new Incident("todo", "areMessagesEquivalent is not implemented yet"));
}

/**
 * Represents a high-level MetaMessage (cross-account message).
 */
export class MetaMessage implements MessageInterface {
	/**
   * The messages composing the current meta-message.
   */
  protected subMessages: MessageInterface[];

	/**
	 * The internal id for the current meta-message.
	 */
  protected id: string;

  constructor(messages: MessageInterface[] = []) {
    this.id = uuid();
    this.subMessages = messages;
  }

  getGlobalId(): Bluebird<palantiri.MessageGlobalId> {
    return Bluebird.try(() => {return this.getGlobalIdSync()});
  }

  getGlobalIdSync(): palantiri.MessageGlobalId {
    return palantiri.Id.asGlobalId({driverName: "_meta", id: this.id});
  }

  /* MessageInterface implementation */
  /**
   * Return the body of the current Message.
   */
  getBody (): Bluebird<string> {
    if (this.subMessages.length < 1) {
      return Bluebird.reject(new Incident("empty-meta-message", "This meta-message is empty!"));
    }
    // TODO: for the moment we trust the first sub-message, the test should be stronger:
    // what if there are differences between the simple messages ?
    return Bluebird.resolve(this.subMessages[0].getBody());
  }

  /**
   * Returns true if every sub-message is delivered.
   * @returns {Bluebird<boolean>}
   */
  isDelivered(): Bluebird<boolean> {
    return this.getSubMessages()
      .map((subMsg: MessageInterface) => subMsg.isDelivered())
      .reduce((acc: boolean, isDelivered: boolean) => acc && isDelivered, true);
  }

  /**
   * Return the date of last editing.
   */
  getLastEditingDate(): Bluebird<Date> {
    return Bluebird.reject(new Incident("todo", "getLastEditingDate is not implemented yet"));;
  }

  /**
   * Return the date of the current Message creation.
   */
  getCreationDate(): Bluebird<Date> {
    return Bluebird.reject(new Incident("todo", "getCreationDate is not implemented yet"));;
  }

  /* Scpecific methods */
  /**
   * Return the list of all the submessages constituting the
   * current MetaMessage.
   */
  getSubMessages (): Bluebird<MessageInterface[]> {
    return Bluebird.resolve(this.subMessages);
  }

  /**
   * Add the submessages of the given meta-message to the current one.
   */
  // TODO: be carreful about the duplicated messages ?
  merge(message: MetaMessage): Bluebird.Thenable<MetaMessage> {
    return Bluebird.try(() => {
      for(let msg of message.subMessages) {
        this.subMessages.push(msg);
      }
      return this;
    });
  }
}

export default MetaMessage;
