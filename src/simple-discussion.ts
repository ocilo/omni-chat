import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import MessageInterface from "./interfaces/message";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";

import {GetMessagesOptions} from "./interfaces/discussion";

/**
 * This class is a high-level wrapper for a palantiri discussion (mono-account, mono-driver) bound to a single account of a single user
 */
class SimpleDiscussion implements DiscussionInterface {
  private app: AppInterface;
  private account: UserAccountInterface;
  private palantiriDiscussion: palantiri.DiscussionToken;

  constructor (app: AppInterface, account: UserAccountInterface, palantiriDiscussion: palantiri.DiscussionToken) {
    this.app = app;
    this.account = account;
    this.palantiriDiscussion = palantiriDiscussion;
  }

  /**
   * Private: fetch the data about this discussion from the service
   * @returns {Thenable<palantiri.Discussion>}
   */
  private getPalantiriDiscussion(): Bluebird<palantiri.Discussion> {
    return this.account.getOrCreateApi()
      .then((api: palantiri.Api) => {
        // TODO: fetch the real informations
        // return api.getDiscussionInfo(this.palantiriDiscussion);

        // Temporary partial filler
        return <palantiri.Discussion> <any> {
          driver: this.palantiriDiscussion.driver,
          id: this.palantiriDiscussion.id,
          name: "simple-discussion",
          description: "Description of discussion",
          creationDate: new Date(),
        }
      });
  }

  getName(): Bluebird<string> {
    return this.getPalantiriDiscussion().then(info => info.name);
  }

  getDescription(): Bluebird<string> {
    return this.getPalantiriDiscussion().then(info => info.description);
  }

  getCreationDate(): Bluebird<Date> {
    return this.getPalantiriDiscussion().then(info => info.creationDate);
  }

  getUser(): Bluebird<UserInterface> {
    return this.account.getUser();
  }

  isHeterogeneous(): Bluebird<boolean> {
    return Bluebird.resolve(false); // Tells that this discussion uses a single account for a single discussion
  }

  getMessages (options?: GetMessagesOptions): Bluebird<MessageInterface[]> {
    return Promise.reject(new Incident("todo", "SimpleDiscussion:getMessages is not implemented"));

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
    return Promise.reject(new Incident("todo", "SimpleDiscussion:removeParticipants is not implemented"));
  }

  getSubdiscussions(): Bluebird<DiscussionInterface[]> {
    return return Bluebird.resolve([]); // There is no sub-discussion
  }
}
