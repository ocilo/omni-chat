import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import UserAccountInterface from "./interfaces/user-account";
import MessageInterface from "./interfaces/message";

import ContactAccount from "./contact-account";
import {SimpleDiscussion} from "./simple-discussion";
import app from "./app";

export interface UserAccountData {
  driverName: string;
  id: string;

  username?: string;
  // email?: string;
}

export class UserAccount implements UserAccountInterface {
  accountData: palantiri.UserAccount;

  constructor (accountData: palantiri.UserAccount) {
    this.accountData = accountData;
  }

  getGlobalId(): Bluebird<palantiri.AccountGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.accountData));
  }

  /*
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Bluebird<palantiri.Connection> {
    return Bluebird.resolve(app.getOrCreateConnection(this));
  }

  getOrCreateApi(): Bluebird<palantiri.Api> {
    return Bluebird.resolve(app.getOrCreateApi(this));
  }

  /**
   * Send the message "msg" in the discussion "discussion".
   * If the protocol used by "discussion" does not support group discussion,
   * the message will be send to each member individually.
   * If the discussion does not already exist on the accessible service,
   * it will be created.
   * @param msg
   * @param discussion
   */
  sendMessage(msg: MessageInterface, discussion: DiscussionInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "UserAccount:sendMessage is not implemented"));
    // Use discussion.sendMessage instead
  }

  getContactAccounts(): Bluebird<ContactAccount[]> {
    return Bluebird.resolve(this.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.getContacts()
      })
      .map((account: palantiri.Account) => {
        return new ContactAccount(account);
      });
  }

  getDiscussions(): Bluebird<SimpleDiscussion[]> {
    return Bluebird.resolve(this.getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.getDiscussions()
      })
      .map((discussion: palantiri.Discussion) => {
        return new SimpleDiscussion(this, discussion);
      });
  }

  getOrCreateDiscussion(remoteContactAccount:ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird.reject(new Incident("todo", "UserAccount:getOrCreateDiscussion is not implemented"));
  }
}

export default UserAccount;
