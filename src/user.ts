import * as Bluebird from "bluebird";

import {Contact} from "./interfaces/contact";
import {User} from "./interfaces/user";
import {Discussion} from "./interfaces/discussion";
import {UserAccount} from "./interfaces/user-account";
import {GroupAccount} from "./interfaces/group-account";
import {OChatApp} from "./app";

export class OChatUser implements User {
  username: string;

  app: OChatApp;

  accounts: UserAccount[] = [];

  getOrCreateDiscussion(accounts: GroupAccount[]): Bluebird<Discussion> {
    let discussion: Discussion; // The discussion we are looking for

    // TODO : Oups, we have forgotten something.
    //        There's three different cases :
    //        * accounts contains only one account : easy as pie
    //        * accounts contains several accounts but using the same protocol : easy
    //        * accounts contains severas accounts using different protocols : the oups is here
    //        What do we do here ? Trying to merge several discussions from differents protocols,
    //        or using our own database to store these discussions ?
    // NB : now we just have to use Proxy in each account this.accounts to get discussions.
    //      That's a solved problem.
    return Bluebird.resolve(discussion);
  }

  leaveDiscussion(discussion: Discussion, callback?: (err: Error, succes: Discussion) => any): void {

  }

  getAccounts(protocols?: string[]): Bluebird<UserAccount[]> {
    if(protocols) {
      let accounts: UserAccount[] = [];
      for(let account of this.accounts) {
        for(let protocol of protocols) {
          if(account.driver.isCompatibleWith(protocol)) {
            accounts.push(account);
            break;
          }
        }
      }
      return Bluebird.resolve(accounts);
    }
    return Bluebird.resolve(this.accounts);
  }

  getContacts(): Bluebird<Contact[]> {
    // TODO : we can do lots of improvements :
    //        -do not compare otherContact with other someContacts we already added to contacts
    //        -improve how we check if ContactAccount are the same Contact
    //        -check in base if the user specified some time ago that some accounts are the same
    let contacts: Contact[] = null;
    for(let account of this.accounts) {
      account.getContacts().then((someContacts) => {
        if(!contacts) {
          contacts = someContacts;
        } else {
          for(let otherContact of someContacts) {
            let merge: boolean = false;
            for(let actualContact of contacts) {
              if(otherContact.fullname === actualContact.fullname) {
                actualContact.mergeContacts(otherContact);
                merge = true;
                break;
              }
            }
            if(!merge) {
              contacts.push(otherContact);
            }
          }
        }
      })
    }
    return Bluebird.resolve(contacts);
  }

  addAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): void {
    let index: number = this.accounts.indexOf(account);
    let err: Error = null;
    if(index === -1) {
      this.accounts.push(account);
    } else {
      err = new Error("This account already exists.");
    }
    if(callback) {
      callback(err, this.accounts);
    }
  }

  removeAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): void {
    let index: number = this.accounts.indexOf(account);
    let err: Error = null;
    if(index === -1) {
      this.accounts.splice(0, 1, account);
    } else {
      err = new Error("This account does not exist.");
    }
    if(callback) {
      callback(err, this.accounts);
    }
  }

  addContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void {
    // TODO : this is advanced option.
    //        It's about writing on an account,
    //        and not only reading it.
    //        We will do this later.
  }

  removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void {
    // WARNING : we need to warn the user that this will remove the contact from all his accounts
    // TODO : this is advanced option.
    //        It's about writing on an account,
    //        and not only reading it.
    //        We will do this later.
  }

  onDiscussionRequest(callback: (disc: Discussion) => any): User {
    // TODO : see troubles in interfaces.ts before
    return undefined;
  }

  onContactRequest(callback: (contact: Contact)=> any): User {
    // TODO : see troubles in interfaces.ts before
    return undefined;
  }
}
