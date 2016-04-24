import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {User} from "./user";

export interface UserAccount {
  /**
   * Returns the user owning the account
   * (an account is owned by only one user)
   */
  getUser(): Thenable<User>;

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
}
