import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {ContactAccountInterface} from "./contact-account";
import {DiscussionInterface} from "./discussion";

export interface UserAccountInterface {
  /**
   * Returns the global id (driver + internal id) of this user-account.
   */
  getGlobalId(): Thenable<palantiri.AccountGlobalId>;

  /**
   * Connect the current user's account, or retrieve an existing
   * connection. The created connection will already be turned on,
   * but not the retrieved one.
   */
  getOrCreateConnection(): Thenable<palantiri.Connection>;

  /**
   * An alias for getOrCreateConnection().connect().
   */
  getOrCreateApi(): Thenable<palantiri.Api>;

  /**
   * Returns a list of account-specific contact-accounts.
   */
  getContactAccounts(): Thenable<ContactAccountInterface[]>;

  /**
   * Returns a list of account-specific discussions.
   */
  getDiscussions(): Thenable<DiscussionInterface[]>;

	/**
   * Returns a Discussion with the contact-account remoteContactAccount.
   * @param remoteContactAccount
   */
  getOrCreateDiscussion(remoteContactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;
}

export default UserAccountInterface;
