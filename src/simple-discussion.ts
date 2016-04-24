// The class simple discussion adds higher-level methods to a palantiri discussion
// It is a discussion beteween one local account and one remote native Discussion

import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import {OChatApp} from "./app"; // todo: use interface

import {ContactAccount} from "./interfaces/contact-account";
import {Discussion, GetMessagesOptions} from "./interfaces/discussion";
import {Message} from "./interfaces/message";
import {User} from "./interfaces/user";
import {UserAccount} from "./interfaces/user-account";

/**
 * This class is a high-level wrapper for a palantiri discussion (mono-account, mono-driver) bound to the single account of a single user
 */
class SimpleDiscussion implements Discussion {
  private app: OChatApp;
  private account: UserAccount;
  private palantiriDiscussion: palantiri.DiscussionToken;

  constructor (app: OChatApp, account: UserAccount, palantiriDiscussion: palantiri.DiscussionToken) {
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

  getUser(): Bluebird<User> {
    return this.account.getUser();
  }

  isHeterogeneous(): Bluebird<boolean> {
    return Bluebird.resolve(false); // Tells that this discussion uses a single account for a single discussion
  }

  getMessages (options?: GetMessagesOptions): Bluebird<Message[]> {
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


  removeParticipants(contactAccount: ContactAccount): Bluebird<this> {
    return Promise.reject(new Incident("todo", "SimpleDiscussion:removeParticipants is not implemented"));
  }

  getSubdiscussions(): Bluebird<Discussion[]> {
    return return Bluebird.resolve([]); // There is no sub-discussion
  }
}
