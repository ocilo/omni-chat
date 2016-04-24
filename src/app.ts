import * as Bluebird from "bluebird";

import {Connection, utils, Api} from "palantiri-interfaces";
import {User} from "./interfaces/user";
import {App} from "./interfaces/app";
import {OChatUserAccount as UserAccount} from "./user-account";
import {Incident} from "incident";
import {OChatUser} from "./user";

type ConnectionStrategy = (account: UserAccount) => Bluebird.Thenable <Connection>;

export class OChatApp implements App {
  /**
   * The list of all users using this app instance
   */
  users: User[];

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
      [accountId: string]: Connection;
    };
  };

  /**
   * Register a new driver with its data acquisition function
   * @param driver
   * @param strategy
   * @returns {OChatApp}
   */
  useDriver (driver: Connection.Constructor, strategy: ConnectionStrategy): this {
    this.connectionStrategies[driver.name] = strategy;
    return this;
  }

  /**
   * Adds this collection to the set of active connections.
   * @param account
   * @param connection
   * @returns {OChatApp}
   */
  setActiveConnection (account: UserAccount, connection: Connection): this {
    if (account.driver !== connection.driver) {
      throw new Incident("account-connection-mismatch", {account: account, connection: connection}, "The driver required by account does not match the one of connection");
    }
    if (!(account.driver in this.activeConnections)) {
      this.activeConnections[account.driver] = {};
    }
    let driver = this.activeConnections[account.driver];
    driver[account.id] = connection;
    return this;
  }

  // TODO: optional argument to throw if not found
  getActiveConnection (account: UserAccount): Connection {
    if (!(account.driver in this.activeConnections)) {
      return null;
    }
    let driver = this.activeConnections[account.driver];
    return driver[account.id] || null;
  }

  getOrCreateConnection (account: UserAccount): Bluebird<Connection> {
    return Bluebird.try(() => {
      let connection: Connection = this.getActiveConnection(account);
      if (connection !== null) {
        return connection;
      }
      if (account.driver in this.connectionStrategies) {
        return Bluebird.resolve(this.connectionStrategies[account.driver](account))
          .tap((connection) => this.setActiveConnection(account, connection));
      }
      return Bluebird.reject(new Incident("Unable to get connection"));
    });
  }

  /**
   * get or create connection and api for account
   * @param account
   * @returns {Bluebird<R>}
   */
  getOrCreateApi (account: UserAccount): Bluebird<Api> {
    return this.getOrCreateConnection(account).then((connection) => {
      return connection.connect();
    });
  }


  /**
   * Creates a new user and already attach it to this app.
   * @param username
   */
  createUser (username: string): OChatUser {
    let users = this.getUsers((user) => user.username === username);
    if (users.length === 0) {
      let user = new OChatUser(this, username);
      this.addUser(user);
      return user;
    } else {
      throw new Error("The user already exists");
    }
  }

  getUsers(filter?: (user: User) => boolean): User[] {
    if(filter) {
      let okUsers: User[] = [];
      for(let user of this.users) {
        if(filter(user)) {
          okUsers.push(user);
        }
      }
      return okUsers;
    }
    return this.users;
  }

  addUser(user: User): this {
    if(this.users.indexOf(user) === -1) {
      throw new Error("This user is already connected to this client.");
    } else {
      this.users.push(user);
    }
    return this;
  }

  removeUser(user: User): this {
    if(this.users.indexOf(user) === -1) {
      throw new Error("This user was not connected to this client.");
    } else {
      this.users.splice(0, 1, user);
    }
    return this;
  }
}
