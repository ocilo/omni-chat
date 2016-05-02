import MessageInterface from "./interfaces/message";
import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import {UserAccountInterface} from "./interfaces/user-account";
import {ContactAccountInterface} from "./interfaces/contact-account";
import Incident from "incident";

/**
 * Represents a high-level message (wrap passive message objects in accessors)
 */
export class SimpleMessage implements MessageInterface {
  messageData: palantiri.Message;

  constructor(messageData: palantiri.Message) {
    this.messageData = messageData;
  }

  getBody (): Bluebird<string> {
    return Bluebird.resolve(this.messageData.body);
  }

  getAuthorAccount (): Bluebird<UserAccountInterface | ContactAccountInterface> {
    return Bluebird.reject(new Incident("todo", "SimpleMessage:getAuthorAccount is not implemented yet"));
  }

  getCreationDate (): Bluebird<Date> {
    return Bluebird.resolve(this.messageData.creationDate);
  }
}

export default SimpleMessage;
