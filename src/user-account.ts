import * as Bluebird from "bluebird";

import {ContactAccount} from "./interfaces/contact-account";
import {User} from "./interfaces/user";
import {Discussion} from "./interfaces/discussion";
import {Connection} from "./interfaces/connection";
import {GroupAccount} from "./interfaces/group-account";
import {Message} from "./interfaces/message";
import {UserAccount} from "./interfaces/user-account";
import {Proxy} from "./interfaces/proxy";
import {Contact} from "./interfaces/contact";
import {Dictionary} from "./interfaces/utils";

export class OChatUserAccount implements UserAccount {
  username: string;

  driver: Proxy;

  connection: Connection;

  data: Dictionary<any>;

  owner: User;

  getContacts(): Bluebird<Contact[]> {
    return Bluebird.resolve(this.driver.getContacts(this));
  }

  hasContactAccount(account: ContactAccount): Bluebird<boolean> {
    return Bluebird.resolve(this.getContacts().then((contacts): boolean => {
      for(let contact of contacts) {
        if(contact.accounts[0].localID === account.localID) {
          return true;
        }
      }
      return false;
    }));
  }

  getDiscussions(max?: number, filter?: (discuss: Discussion) => boolean): Bluebird<Discussion[]> {
    return Bluebird.resolve(this.driver.getDiscussions(this, max, filter));
  }

  getOwner(): Bluebird<User> {
    return Bluebird.resolve(this.owner);
  }

  getOrCreateConnection(): Bluebird<Connection> {
    if(this.connection && this.connection.connected) {
      return Bluebird.resolve(this.connection);
    }
    return Bluebird.resolve(this.driver.createConnection(this));
  }

  sendMessageTo(recipients: GroupAccount, msg: Message, callback?: (err: Error, succes: Message) => any): void {
    this.driver.sendMessage(msg, recipients, callback);
  }

  constructor(owner: User) {
    this.owner = owner;
  }
}
