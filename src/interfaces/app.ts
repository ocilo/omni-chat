import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {User} from "./user";
import {ContactAccount} from "./contact-account";
import {Discussion} from "./discussion";
import {UserAccount} from "./user-account";

/***************************************************************
 * App is the entry point for the library.
 * It maintains the list of connected users.
 ***************************************************************/
export type ConnectionStrategy = (account: UserAccount) => Thenable <palantiri.Connection>;

export interface App {
  /**
   * Register a new driver with its data acquisition function
   */
  useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): this;

  /**
   * Adds this connection to the set of active connections.
   */
  setActiveConnection (account: UserAccount, connection: palantiri.Connection): Thenable<this>;

  // TODO: optional argument to throw if not found
  getConnection (account: UserAccount): Thenable<palantiri.Connection>;

  getOrCreateConnection (account: UserAccount): Thenable<palantiri.Connection>;

  /**
   * get or create connection and api for account
   */
  getOrCreateApi (account: UserAccount): Thenable<palantiri.Api>;


  /**
   * Creates a new user and already attach it to this app.
   * @param username
   */
  createUser (username: string): User;

  getUsers(filter?: (user: User) => boolean): User[];

  addUser(user: User): this;

  removeUser(user: User): this;

}

export default App;
