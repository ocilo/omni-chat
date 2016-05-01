import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import MessageInterface from "./interfaces/message";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";

import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import {Message} from "./message";

/**
 * This class is a high-level wrapper for a palantiri discussion (mono-account, mono-driver) bound to a single account of a single user
 */
export class SimpleDiscussion implements DiscussionInterface {
  private account: UserAccountInterface;
  private discussionData: palantiri.Discussion;

  constructor (account: UserAccountInterface, discussionData: palantiri.Discussion) {
    this.account = account;
    this.discussionData = discussionData;
  }

  /**
   * Private: fetch the data about this discussion from the service
   * @returns {Thenable<palantiri.Discussion>}
   */
  private getDiscussionInfo(): Bluebird<palantiri.Discussion> {
    return Bluebird.resolve(this.account.getOrCreateApi())
      .then((api: palantiri.Api) => {
        // TODO: fetch the real informations
        // return api.getDiscussionInfo(this.discussionReference);

        return Bluebird.resolve(this.discussionData);
      });
  }

  getName(): Bluebird<string> {
    return this.getDiscussionInfo().then(info => info.name);
  }

  getDescription(): Bluebird<string> {
    return this.getDiscussionInfo().then(info => info.description);
  }

  getCreationDate(): Bluebird<Date> {
    return this.getDiscussionInfo().then(info => info.creationDate);
  }

  getLocalUserAccount(): Bluebird.Thenable<UserAccountInterface> {
    return Bluebird.resolve(this.account);
  }

  isHeterogeneous(): Bluebird<boolean> {
    return Bluebird.resolve(false); // This implementation represents mono-service discussions!
  }

  getMessages (options?: GetMessagesOptions): Bluebird<MessageInterface[]> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:getMessages is not implemented"));

    // TODO: add .getMessages to palantiri api
    /*
      let palOptions: palantiri.Api.GetMessagesOptions;
      palOptions = {
        max: options.maxNumber,
        etc.
      };
      return this.account.getOrCreateApi()
        .then(api => api.getMessages(palOptions))
        .map(...) // wrap the palantiri messages in a higher-level object
        .filter(...);
    */
  }


  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:removeParticipants is not implemented"));
  }

  getSubdiscussions(): Bluebird<DiscussionInterface[]> {
    return Bluebird.resolve([]); // There is no sub-discussion in a simple discussion (maybe return null ?)
  }

  sendMessage(newMessage: NewMessage): Bluebird<Message> {
    return Bluebird.resolve(this.account.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.sendMessage(newMessage, this.discussionData.id);
      })
      .then((message: palantiri.Message) => {
        // TODO: create a SimpleMessage and Message class to differenciate messages on simple-discussion and multi-driver discussions ?
        return new Message();
      });
  }
}

export default SimpleDiscussion;
