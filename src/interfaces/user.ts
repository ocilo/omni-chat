import * as Bluebird from "bluebird";
import {DiscussionInterface} from "./discussion";
import {ContactAccountInterface} from "./contact-account";
import {UserAccountInterface} from "./user-account";
import {MessageInterface} from "./message";
import {MetaDiscussion} from "../meta-discussion";
import {SimpleDiscussion} from "../simple-discussion";

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * It allows you to acceed to yout own Accounts, acceed to your
 * own Contacts, create Discussions with them, and so on.
 ***************************************************************/
export interface UserInterface extends UserEmitter {
	/**
   * Return the global name of this user.
   */
  getName(): Bluebird.Thenable<string>;

  /**
   * Get an existing discussion with exactly all the contact accounts
   * given in parameters, or create one if none exists.
   */
  getOrCreateDiscussion(contactAccounts: ContactAccountInterface[]): Bluebird<DiscussionInterface>;

	/**
   * Return all the discussions of the current user :
   * the meta discussions,
   * the simple ones,
   * accordingly to the options given.
   */
	getAllDiscussions(options?: GetDiscussionsOptions): Bluebird<DiscussionInterface[]>;

  /**
   * Return all the simple-discussions for the current user,
   * or those accordingly to the options parameter.
   */
  getAllSimpleDiscussions(options?: GetDiscussionsOptions): Bluebird<SimpleDiscussion[]>;

	/**
   * Return all the meta-discussions for the current user,
   * or those accordingly to the options parameter.
   */
  getAllMetaDiscussions(options?: GetDiscussionsOptions): Bluebird<MetaDiscussion[]>;

	/**
   * Leave the discussion given in parameter, and manage to prevent
   * the current user from receiving future notifications.
   */
	leaveDiscussion(discussion: DiscussionInterface): Bluebird<UserInterface>;

	/**
   * Return all the acccounts of the current user.
   * If protocols is precised, it returns only the accounts
   * matching the protocols given.
   */
  getAccounts(protocols?: string[]): Bluebird<UserAccountInterface[]>;

	/**
   * Add an account to the current user.
   * If the account already exists, the return promise will be rejected.
   */
  addAccount(account: UserAccountInterface): Bluebird<UserInterface>;

  /**
   * Remove an account to the current user.
   * If the account does not already exist, the return promise will be rejected.
   */
  removeAccount(account: UserAccountInterface): Bluebird<UserInterface>;
}

/**
 * The options for querying the discussions.
 */
export interface GetDiscussionsOptions {
  max?: number;
  filter?: (discussion: DiscussionInterface) => boolean;
}

/**
 * TODO: doc
 * TODO: add other events
 */
export interface UserEmitter extends NodeJS.EventEmitter {
  addListener(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  addListener(event: string, listener: Function): this;

  on(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  on(event: string, listener: Function): this;

  once(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  once(event: string, listener: Function): this;

  emit(event: "message", eventObject: MessageEvent): boolean;
  emit(event: string, ...args: any[]): boolean;
}

/**
 * TODO: doc
 */
export interface MessageEvent {
  // userAccount: UserAccountInterface,
  discussion: DiscussionInterface,
  message: MessageInterface
}

export default UserInterface;
