import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {UserInterface} from "./user";
import {ContactAccountInterface} from "./contact-account";
import {DiscussionInterface} from "./discussion";

export interface UserAccountInterface {
  /**
   * Returns the palantiri token (driver + internal id) of this user-account
   */
  getPalantiriToken(): Thenable<palantiri.AccountToken>;

  /*
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Thenable<palantiri.Connection>;

  /*
   * A shortcut for getOrCreateConnection().connect()
   */
  getOrCreateApi(): Thenable<palantiri.Api>;

  getContactAccounts(): Thenable<ContactAccountInterface[]>;

  /**
   * Returns a list of account-specific discussions
   * TODO: support a set of similar options to user.getDiscussions
   */
  getDiscussions(): Thenable<DiscussionInterface[]>;

  /**
   *
   * @param remoteContactAccount
   */
  getOrCreateDiscussion(remoteContactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;
}

export default UserAccountInterface;
