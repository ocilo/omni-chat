import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import MessageInterface from "./interfaces/message";
import UserAccountInterface from "./interfaces/user-account";

import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import SimpleMessage from "./simple-message";

/**
 * This class is a high-level wrapper for a palantiri discussion
 * (mono-account, mono-driver) bound to a single account of a single user.
 */
export class SimpleDiscussion implements DiscussionInterface {

	/**
   * The account of the user who uses this Discussion.
   */
  private account: UserAccountInterface;

	/**
   * The low-level passive object representing the current Discussion.
   */
  private discussionData: palantiri.Discussion;

  constructor (account: UserAccountInterface, discussionData?: palantiri.Discussion) {
    this.account = account;
    this.discussionData = discussionData ? discussionData : null;
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
    return this.getDiscussionInfo().then(info => {
      if(info.name) {
        return info.name;
      }
      let name: string = "Discussion with ";
      for(let i = 0; i<info.participants.length; i++) {
        let part = info.participants[i];
        name += part.name;
        if(i != info.participants.length -1) {
          name += ", ";
        }
      }
      return name;
    });
  }

  getDescription(): Bluebird<string> {
    return this.getDiscussionInfo().then(info => {
      return info.description ? info.description : this.getName();
    });
  }

  getCreationDate(): Bluebird<Date> {
    return this.getDiscussionInfo().then(info => info.creationDate);
  }

  getLocalUserAccount(): Bluebird.Thenable<UserAccountInterface> {
    return Bluebird.resolve(this.account);
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

  addParticipant(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:addParticipant is not implemented"));
  }

  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:removeParticipants is not implemented"));
  }

  sendMessage(newMessage: NewMessage): Bluebird<SimpleMessage> {
    return Bluebird.resolve(this.account.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.sendMessage(newMessage, this.discussionData.id);
      })
      .then((message: palantiri.Message) => {
        return new SimpleMessage(message);
      });
  }
}

export default SimpleDiscussion;
