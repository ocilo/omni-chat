import * as Bluebird from "bluebird";

import {Connection, utils, Api} from "palantiri-interfaces";
import {User} from "./interfaces/user";
import {App} from "./interfaces/app";
import {UserAccount} from "./user-account";
import {Incident} from "incident";
import {OChatUser} from "./user";

type ConnectionStrategy = (account: UserAccount) => Bluebird.Thenable <Connection>;

export class OChatApp implements App {
  /**
   * The set of available connection-providers.
   */
  private connectionStrategies: {[driverName: string]:  ConnectionStrategy;};

  useConnectionStrategy (driverName: string, strategy: ConnectionStrategy): this {
    this.connectionStrategies[driverName] = strategy;
    return this;
  }

  private activeConnections: {
    [driverName: string]: {
      [accountId: string]: Connection;
    };
  };

  setActiveConnection (account: UserAccount, connection: Connection): this {
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

  users: User[];          // All users connected to this client

  getOrCreateUser (username: string): OChatUser {
    let users = this.getUsers((user) => user.username === username);
    if (users.length === 0) {
      return new OChatUser(this, username);
    } else {
      return <OChatUser> users[0];
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

  addUser(user: User, callback?: (err: Error, users: User[]) => any): Bluebird.Thenable<OChatApp> {
    let err: Error = null;
    if(this.users.indexOf(user) === -1) {
      err = new Error("This user is already connected to this client.");
    } else {
      this.users.push(user);
    }
    if(callback) {
      callback(err, this.users);
    }
    return Bluebird.resolve(this);
  }

  removeUser(user: User, callback?: (err: Error, users: User[]) => any): Bluebird.Thenable<OChatApp> {
    let err: Error = null;
    if(this.users.indexOf(user) === -1) {
      err = new Error("This user was not connected to this client.");
    } else {
      this.users.splice(0, 1, user);
    }
    if(callback) {
      callback(err, this.users);
    }
    return Bluebird.resolve(this);
  }
}
