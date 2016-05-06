import * as palantiri from "palantiri-interfaces";
import {Thenable} from "bluebird";
import {UserInterface} from "./user";
import {UserAccountInterface} from "./user-account";

/***************************************************************
 * App is the entry point for the library.
 * It maintains the list of connected users.
 ***************************************************************/
export type ConnectionStrategy = (account: UserAccountInterface) => palantiri.Connection | Thenable <palantiri.Connection>;

// Idea:
// Rename it to "drivers-store" and only handle the palantiri-API acquisition (available drivers and active connections)

export interface AppInterface {
  /**
   * Register a new driver with its data acquisition function
   */
  useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): AppInterface;

  /**
   * Add this connection to the set of active connections.
   */
  addActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Thenable<AppInterface>;

	/**
   * Look for a Connection for the given account.
   * If no one exists, return a null reference.
   */
  getConnection (account: UserAccountInterface): Thenable<palantiri.Connection>;

	/**
   * Look for a Connection for the given account.
   * If no one exists, try to instanciate one and then return it.
   */
  getOrCreateConnection (account: UserAccountInterface): Thenable<palantiri.Connection>;

  /**
   * Look for an Api for the given account.
   * If the Account has no Connection, try to create one.
   * If the Connection has no Api yet, try to create one then return it.
   */
  getOrCreateApi (account: UserAccountInterface): Thenable<palantiri.Api>;

	/**
   * Return the list of connected Users.
   * If filter is specified, return only the Users for chich
   * filter returns true.
   */
  getUsers(filter?: (user: UserInterface) => boolean): UserInterface[];

	/**
   * Add the User to the app.
   */
  addUser(user: UserInterface): AppInterface;

	/**
   * Remove the first User which matchs user from the app.
   */
  removeUser(user: UserInterface): AppInterface;
}

export default AppInterface;
