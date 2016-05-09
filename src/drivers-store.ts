import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";
import UserAccountInterface from "./interfaces/user-account";
import {ConnectionStrategy, DriversStoreInterface} from "./interfaces/drivers-store";

/**
 * We want the App object to be a static object,
 * so that's a way to do it.
 * Basically, driversStore is just a global tool
 * that some other components need.
 */
export let driversStore: DriversStoreInterface = {
  useDriver: useDriver,
  addActiveConnection: addActiveConnection,
  getConnection: getConnection,
  getOrCreateConnection: getOrCreateConnection,
  getOrCreateApi: getOrCreateApi,
};

/**
 * The map of available drivers with the function to require the data needed to create the connection.
 * (This function can be an access to the database, a console prompt, a gui modal, a read from a config file, etc.).
 */
let connectionStrategies: {[driverName: string]: ConnectionStrategy;} = {};

/**
 * A map (cache) of currently open connections.
 */
interface ActiveConnections {
  [accountGlobalId: string]: palantiri.Connection;
}
let activeConnections: ActiveConnections = {};

/**
 * Register a new driver with its data acquisition function.
 * @param driver
 * @param strategy
 * @returns {OChatApp}
 */
function useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): Bluebird<DriversStoreInterface> {
  if(!driver || !driver.driver) {
    Bluebird.reject(new Incident("missing-driver-name", {driver: driver}, "Cannot register driver, no .driver attribute"));
  }
  connectionStrategies[driver.driver] = strategy;
  return Bluebird.resolve(driversStore);
}

/**
 * Add this connection to the set of active connections.
 * @param account
 * @param connection
 * @returns {OChatApp}
 */
function addActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Bluebird<DriversStoreInterface> {
  return Bluebird.resolve(account.getGlobalId())
    .then((globalId: palantiri.AccountGlobalId) => {
      let accountRef = palantiri.Id.asReference(globalId);
      if (accountRef.driverName !== connection.driver) {
        throw new Incident("account-connection-mismatch", {account: account, connection: connection}, "The driver required by account does not match the one of connection");
      }
      activeConnections[globalId] = connection;
    })
    .thenReturn(driversStore);
}

/**
 * Look for a Connection for the given account.
 * If no one exists, return a null reference.
 * @param account
 * @returns {Bluebird<palantiri.Connection>}
 */
// TODO: optional argument to throw if not found
function getConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
  return Bluebird.resolve(account.getGlobalId())
    .then((globalId: palantiri.AccountGlobalId) => {
      return activeConnections[globalId] ? activeConnections[globalId] : null;
    });
}

/**
 * Look for a Connection for the given account.
 * If no one exists, try to instanciate one and then return it.
 * @param account
 * @returns {Bluebird<palantiri.Connection>}
 */
function getOrCreateConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
  return getConnection(account)
    .then((connection: palantiri.Connection) => {
      if (connection !== null) {
        return Bluebird.resolve(connection);
      }
      return account.getGlobalId()
        .then((globalId: palantiri.AccountGlobalId) => {
          let accountRef = palantiri.Id.asReference(globalId);
          if (!(accountRef.driverName in connectionStrategies)) {
            return Bluebird.reject(new Incident("Unable to get connection, no registered driver for "+accountRef.driverName));
          }
          return Bluebird.resolve(connectionStrategies[accountRef.driverName](account))
            .tap((connection) => addActiveConnection(account, connection));
        });
    });
}

/**
 * Look for an Api for the given account.
 * If the Account has no Connection, try to create one.
 * If the Connection has no Api yet, try to create one then return it.
 * @param account
 * @returns {Bluebird<R>}
 */
function getOrCreateApi (account: UserAccountInterface): Bluebird<palantiri.Api> {
  return getOrCreateConnection(account)
    .then((connection) => {
      return connection.connect();
    });
}

export default driversStore;
