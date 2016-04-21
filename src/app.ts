import * as Bluebird from "bluebird";

import {User} from "palantiri-interfaces";
import {App} from "palantiri-interfaces";

export class OChatApp implements App {
  users: User[];          // All users connected to this client

  getUsers(filter?: (user: User) => boolean): Bluebird.Thenable<User[]> {
    if(filter) {
      let okUsers: User[] = [];
      for(let user of this.users) {
        if(filter(user)) {
          okUsers.push(user);
        }
      }
      return Bluebird.resolve(okUsers);
    }
    return Bluebird.resolve(this.users);
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
