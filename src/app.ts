import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";

import {User} from "./user";

type ConnectionStrategy = (account: UserAccountInterface) => Bluebird.Thenable <palantiri.Connection>;

export class App implements AppInterface {
  /**
   * The list of all the users using this app instance
   */
  users: UserInterface[];

  /**
   * The set of available drivers with the function to require the data needed to create th connection.
   * (This function can be an access to the database, a console prompt, a gui modal, a read from a config file, etc.)
   */
  private connectionStrategies: {[driverName: string]:  ConnectionStrategy;};

  /**
   * A collection/cache of currently open connections.
   */
  private activeConnections: {
    [driverName: string]: {
      [accountId: string]: palantiri.Connection;
    };
  };

  /**
   * Register a new driver with its data acquisition function
   * @param driver
   * @param strategy
   * @returns {OChatApp}
   */
  useDriver (driver: palantiri.Connection.Constructor, strategy: ConnectionStrategy): this {
    this.connectionStrategies[driver.name] = strategy;
    return this;
  }

  /**
   * Adds this connection to the set of active connections.
   * @param account
   * @param connection
   * @returns {OChatApp}
   */
  setActiveConnection (account: UserAccountInterface, connection: palantiri.Connection): Bluebird<this> {
    return Bluebird.resolve(account.getPalantiriToken())
      .then((token: palantiri.AccountToken) => {
        if (token.driver !== connection.driver) {
          throw new Incident("account-connection-mismatch", {account: account, connection: connection}, "The driver required by account does not match the one of connection");
        }
        if (!(token.driver in this.activeConnections)) {
          this.activeConnections[token.driver] = {};
        }
        let driver = this.activeConnections[token.driver];
        driver[token.id] = connection;
        return this;
      })
      .thenReturn(this);
  }

  // TODO: optional argument to throw if not found
  getConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
    return Bluebird.resolve(account.getPalantiriToken())
      .then((token: palantiri.AccountToken) => {
        if (!(token.driver in this.activeConnections)) {
          return null;
        }
        let driver = this.activeConnections[token.driver];
        return driver[token.id] || null;
      })
  }

  getOrCreateConnection (account: UserAccountInterface): Bluebird<palantiri.Connection> {
    return this.getConnection(account)
      .then((connection: palantiri.Connection) => {
        if (connection !== null) {
          return connection;
        }
        return account.getPalantiriToken()
          .then((token: palantiri.AccountToken) => {
            if (!(token.driver in this.connectionStrategies)) {
              return Bluebird.reject(new Incident("Unable to get connection"));
            }
            return Bluebird.resolve(this.connectionStrategies[token.driver](account))
              .tap((connection) => this.setActiveConnection(account, connection));
          });
      });
  }

  /**
   * get or create connection and api for account
   * @param account
   * @returns {Bluebird<R>}
   */
  getOrCreateApi (account: UserAccountInterface): Bluebird<palantiri.Api> {
    return this.getOrCreateConnection(account).then((connection) => {
      return connection.connect();
    });
  }


  /**
   * Creates a new user and already attach it to this app.
   * @param username
   */
  createUser (username: string): User {
    let users = this.getUsers((user) => user.username === username);
    if (users.length === 0) {
      let user = new User(this, username);
      this.addUser(user);
      return user;
    } else {
      throw new Error("The user already exists");
    }
  }

  getUsers(filter?: (user: UserInterface) => boolean): UserInterface[] {
    if(filter) {
      let okUsers: UserInterface[] = [];
      for(let user of this.users) {
        if(filter(user)) {
          okUsers.push(user);
        }
      }
      return okUsers;
    }
    return this.users;
  }

  addUser(user: UserInterface): this {
    if(this.users.indexOf(user) === -1) {
      throw new Error("This user is already connected to this client.");
    } else {
      this.users.push(user);
    }
    return this;
  }

  removeUser(user: UserInterface): this {
    if(this.users.indexOf(user) === -1) {
      throw new Error("This user was not connected to this client.");
    } else {
      this.users.splice(0, 1, user);
    }
    return this;
  }
}

export default App;
