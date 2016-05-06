import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";
import {ConnectionStrategy} from "./interfaces/app";

/**
 * We want the App object to be a static object,
 * so that's a way to do it.
 * Basically, App is just a global tool that some other components need.
 */
export let app: AppInterface = {
  useDriver: useDriver,
  addActiveConnection: addActiveConnection,
  getConnection: getConnection,
  getOrCreateConnection: getOrCreateConnection,
  getOrCreateApi: getOrCreateApi,
  getUsers: getUsers,
  addUser: addUser,
  removeUser: removeUser
};

/**
 * The list of all the users using this app.
 */
let users: UserInterface[] = [];

/**
 * The map of available drivers with the function to require the data needed to create th connection.
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
function useDriver (driver: palantiri.Connection.Constructor<any, any>, strategy: ConnectionStrategy): AppInterface {
  if(!driver || !driver.driver) {
    throw new Incident("missing-driver-name", {driver: driver}, "Cannot register driver, no .driver attribute");
  }
  connectionStrategies[driver.driver] = strategy;
  return app;
}

/**
 * Add this connection to the set of active connections.
 * @param account
 * @param connection
 * @returns {OChatApp}
 */
function addActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Bluebird<AppInterface> {
  return Bluebird.resolve(account.getGlobalId())
    .then((globalId: palantiri.AccountGlobalId) => {
      let accountRef = palantiri.Id.asReference(globalId);
      if (accountRef.driverName !== connection.driver) {
        throw new Incident("account-connection-mismatch", {account: account, connection: connection}, "The driver required by account does not match the one of connection");
      }
      activeConnections[globalId] = connection;
    })
    .thenReturn(app);
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

/**
 * Return the list of connected Users.
 * If filter is specified, return only the Users for chich
 * filter returns true.
 * @param filter
 * @returns {UserInterface[]}
 */
function getUsers(filter?: (user: UserInterface) => boolean): UserInterface[] {
  if(filter) {
    let okUsers: UserInterface[] = [];
    for(let user of users) {
      if(filter(user)) {
        okUsers.push(user);
      }
    }
    return okUsers;
  }
  return users;
}

/**
 * Add the User to the app.
 */
function addUser(user: UserInterface): AppInterface {
  if(users.indexOf(user) === -1) {
    throw new Error("This user is already connected to this client.");
  } else {
    users.push(user);
  }
  return app;
}

/**
 * Remove the first User which matchs user from the app.
 */
function removeUser(user: UserInterface): AppInterface {
  if(users.indexOf(user) === -1) {
    throw new Error("This user was not connected to this client.");
  } else {
    users.splice(0, 1, user);
  }
  return app;
}

export default app;
