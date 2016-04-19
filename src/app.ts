import * as Bluebird from "bluebird";

import {User} from "./interfaces/user";
import {Proxy} from "./interfaces/proxy";
import {App} from "./interfaces/app";

export class OChatApp implements App {
  drivers: Proxy[] = [];  // All drivers supported by the app

  users: User[];          // All users connected to this client

  getProxyFor(protocol: string): Bluebird<Proxy> {
    for(let i=0; i<this.drivers.length; i++){
      if(this.drivers[i].isCompatibleWith(protocol)){
        return Bluebird.resolve(this.drivers[i]);
      }
    }
  }

  addDriver(driver: Proxy, callback?: (err: Error, drivers: Proxy[]) => any): OChatApp {
    let err: Error = null;
    for(let prox of this.drivers) {
      if(prox.isCompatibleWith(driver.protocol)) {
        err = new Error("This app already has a compatible protocol");
      }
    }
    if(!err) {
      this.drivers.push(driver);
    }
    if(callback) {
      callback(err, this.drivers);
    }
    return this;
  }

  removeDriversFor(protocol: string, callback?: (err: Error, drivers: Proxy[]) => any): OChatApp {
    let err = new Error("This app does not support protocol " + protocol);
    for(let index: number = 0; index<this.drivers.length; index++) {
      let prox = this.drivers[index];
      if(prox.isCompatibleWith(protocol)) {
        err = null;
        this.drivers.splice(index, 1);
      }
    }
    if(callback) {
      callback(err, this.drivers);
    }
    return this;
  }

  addUser(user: User, callback?: (err: Error, users: User[]) => any): OChatApp {
    let err: Error = null;
    if(this.users.indexOf(user) === -1) {
      err = new Error("This user is already connected to this client.");
    } else {
      this.users.push(user);
    }
    if(callback) {
      callback(err, this.users);
    }
    return this;
  }

  removeUser(user: User, callback?: (err: Error, users: User[]) => any): OChatApp {
    let err: Error = null;
    if(this.users.indexOf(user) === -1) {
      err = new Error("This user was not connected to this client.");
    } else {
      this.users.splice(0, 1, user);
    }
    if(callback) {
      callback(err, this.users);
    }
    return this;
  }
}
