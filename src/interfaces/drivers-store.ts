import * as palantiri from "palantiri-interfaces";
import {UserAccountInterface} from "./user-account";
import {Thenable} from "bluebird";

/**
 * The type of function we must use to connect an account.
 * Most of the time it will be done the asynchronous way.
 */
export type ConnectionStrategy = (account: UserAccountInterface) => palantiri.Connection | Thenable <palantiri.Connection>;

/**
 * DriversStore is a big tool that allows us to maintain the
 * list of connections and drivers curently used.
 * It's mostly useful servor side, and is made to be static.
 */
export interface DriversStoreInterface {
  /**
   * Register a new driver with its data acquisition function
   */
  useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): Thenable<DriversStoreInterface>;

  /**
   * Add this connection to the set of active connections.
   */
  addActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Thenable<DriversStoreInterface>;

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
}

export default DriversStoreInterface;
