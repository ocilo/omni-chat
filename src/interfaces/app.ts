import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {UserInterface} from "./user";
import {ContactAccountInterface} from "./contact-account";
import {DiscussionInterface} from "./discussion";
import {UserAccountInterface} from "./user-account";

/***************************************************************
 * App is the entry point for the library.
 * It maintains the list of connected users.
 ***************************************************************/
export type ConnectionStrategy = (account: UserAccountInterface) => Thenable <palantiri.Connection>;

// Idea:
// Rename it to "drivers-store" and only handle the palantiri-API acquisition (available drivers and active connections)

export interface AppInterface {
  /**
   * Register a new driver with its data acquisition function
   */
  useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): AppInterface;

  /**
   * Adds this connection to the set of active connections.
   */
  setActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Thenable<AppInterface>;

  // TODO: optional argument to throw if not found
  getConnection (account: UserAccountInterface): Thenable<palantiri.Connection>;

  getOrCreateConnection (account: UserAccountInterface): Thenable<palantiri.Connection>;

  /**
   * get or create connection and api for account
   */
  getOrCreateApi (account: UserAccountInterface): Thenable<palantiri.Api>;

  getUsers(filter?: (user: UserInterface) => boolean): UserInterface[];

  addUser(user: UserInterface): AppInterface;

  removeUser(user: UserInterface): AppInterface;

}

export default AppInterface;
