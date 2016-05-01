import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";

import {User} from "./user";
import {ConnectionStrategy} from "./interfaces/app";

export let app: AppInterface = {
  useDriver: useDriver,
  setActiveConnection: setActiveConnection,
  getConnection: getConnection,
  getOrCreateConnection: getOrCreateConnection,
  getOrCreateApi: getOrCreateApi,
  getUsers: getUsers,
  addUser: addUser,
  removeUser: removeUser
};

/**
 * The list of all the users using this app instance
 */
let users: UserInterface[] = [];

/**
 * The set of available drivers with the function to require the data needed to create th connection.
 * (This function can be an access to the database, a console prompt, a gui modal, a read from a config file, etc.)
 */
let connectionStrategies: {[driverName: string]:  ConnectionStrategy;} = {};

/**
 * A collection/cache of currently open connections.
 */
interface ActiveConnections {
  [accountGlobalId: string]: palantiri.Connection;
}
let activeConnections: ActiveConnections = {};

/**
 * Register a new driver with its data acquisition function
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
 * Adds this connection to the set of active connections.
 * @param account
 * @param connection
 * @returns {OChatApp}
 */
function setActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Bluebird<AppInterface> {
  return Bluebird.resolve(account.getGlobalId())
    .then((globalId: palantiri.AccountGlobalId) => {
      let parsed: palantiri.ParsedId = palantiri.GlobalId.parse(globalId);
      if (parsed.driverName !== connection.driver) {
        throw new Incident("account-connection-mismatch", {account: account, connection: connection}, "The driver required by account does not match the one of connection");
      }
      activeConnections[globalId] = connection;
    })
    .thenReturn(app);
}

// TODO: optional argument to throw if not found
function getConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
  return Bluebird.resolve(account.getGlobalId())
    .then((globalId: palantiri.AccountGlobalId) => {
      return activeConnections[globalId] || null;
    });
}

function getOrCreateConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
  return getConnection(account)
    .then((connection: palantiri.Connection) => {
      if (connection !== null) {
        return Bluebird.resolve(connection);
      }
      return account.getGlobalId()
        .then((globalId: palantiri.AccountGlobalId) => {
          let parsed: palantiri.ParsedId = palantiri.GlobalId.parse(globalId);
          if (!(parsed.driverName in connectionStrategies)) {
            return Bluebird.reject(new Incident("Unable to get connection, no registered driver for "+parsed.driverName));
          }
          return Bluebird.resolve(connectionStrategies[parsed.driverName](account))
            .tap((connection) => setActiveConnection(account, connection));
        });
    });
}

/**
 * get or create connection and api for account
 * @param account
 * @returns {Bluebird<R>}
 */
function getOrCreateApi (account: UserAccountInterface): Bluebird<palantiri.Api> {
  return getOrCreateConnection(account)
    .then((connection) => {
      return connection.connect();
    });
}

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

function addUser(user: UserInterface): AppInterface {
  if(users.indexOf(user) === -1) {
    throw new Error("This user is already connected to this client.");
  } else {
    users.push(user);
  }
  return app;
}

function removeUser(user: UserInterface): AppInterface {
  if(users.indexOf(user) === -1) {
    throw new Error("This user was not connected to this client.");
  } else {
    users.splice(0, 1, user);
  }
  return app;
}

export default app;
