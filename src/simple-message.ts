import MessageInterface from "./interfaces/message";
import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import {UserAccountInterface} from "./interfaces/user-account";
import {ContactAccountInterface} from "./interfaces/contact-account";

/**
 * Represents a high-level message (wrap passive message objects in accessors).
 */
export class SimpleMessage implements MessageInterface {
	/**
   * The low-level message from palantiri.
   */
  protected messageData: palantiri.Message;

	/**
   * The author of the current message.
   */
  protected author: UserAccountInterface | ContactAccountInterface;

	/**
   * True only if the current message was already delivered.
   */
  protected delivered: boolean;
  // TODO: the previous two attributes are maybe redondant with properties in messageData.

  constructor(messageData: palantiri.Message) {
    this.messageData = messageData;
    this.author = null;
    this.delivered = false;
  }

  /* MessageInterface implementation*/
  /**
   * Return the body of the current Message.
   */
  getBody (): Bluebird<string> {
    return Bluebird.resolve(this.messageData.body);
  }

  /**
   * Return true only if this message is delivered.
   * For simple-messages, it means that the service acknowledged the reception of the message.
   */
  isDelivered(): Bluebird<boolean> {
    return Bluebird.resolve(this.delivered);
  }

  /**
   * Return the date of last editing.
   */
  getLastEditingDate(): Bluebird<Date> {
    return Bluebird.resolve(this.messageData.lastUpdated);
  }

  /**
   * Return the date of the current Message creation.
   */
  getCreationDate (): Bluebird<Date> {
    return Bluebird.resolve(this.messageData.creationDate);
  }

  /* Specific methods */
	/**
   * Return the author of the current message.
   */
  getAuthorAccount (): Bluebird<UserAccountInterface | ContactAccountInterface> {
    return Bluebird.resolve(this.author);
  }

	/**
   * Specify that the current message has been delivered.
   * @returns {SimpleMessage}
   */
  setDelivered (): SimpleMessage {
    this.delivered = true;
    return this;
  }

	/**
   * Return true only if the two messages have the same body.
   */
  // TODO: be sure that they have the same body.
  hasTheSameBodyAs(message: SimpleMessage): boolean {
    return this.messageData.body.toLowerCase().replace(/ /g, '') === message.messageData.body.toLowerCase().replace(/ /g, '');
  }
}

export default SimpleMessage;
