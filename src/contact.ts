import * as Bluebird from "bluebird";

import {Contact} from "./interfaces/contact";
import {ContactAccount} from "palantiri-interfaces";

export class OChatContact implements Contact {
  fullname: string;

  nicknames: string[];

  accounts: ContactAccount[];

  getAccounts(): Bluebird<ContactAccount[]> {
    return Bluebird.resolve(this.accounts);
  }

  getNicknames(): string[] {
    return this.nicknames;
  }

  getPrincipalName(): string {
    return this.fullname;
  }

  setPrincipalName(newPrincipalName: string): Bluebird.Thenable<Contact> {
    this.fullname = newPrincipalName;
	  return Bluebird.resolve(this);
  }

  mergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Bluebird.Thenable<Contact> {
    let error: Error = null;
    let numberOfErrors: number = 0;
    for(let contactAccount of contact.accounts) {
      this.addAccount(contactAccount, (err, acc) => {
        if(err) {
          numberOfErrors++;
        }
      });
    }
    if(numberOfErrors === contact.accounts.length) {
      error = new Error("Unable to merge contact. Maybe the second was part of the current.");
    } else if(numberOfErrors !== 0) {
      error = new Error(numberOfErrors + " account of the contact in parameters could not be added to the current contact.");
    }
    if(callback) {
      callback(error, this);
    }
    return Bluebird.resolve(this);
  }

  unmergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Bluebird.Thenable<Contact> {
    let error: Error = null;
    for(let contactAccount of contact.accounts) {
      this.removeAccount(contactAccount, (err, acc) => {
        if(err) {
          error = new Error("Unable to unmerge contact. One account in the parameters is not part of the current Contact.");
        }
      });
      if(error)
      {
        break;
      }
    }
    if(callback) {
      callback(error, this);
    }
    return Bluebird.resolve(this);
  }

  addAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): Bluebird.Thenable<Contact> {
    let index: number = this.accounts.indexOf(account);
    let err: Error = null;
    if(index === -1) {
      this.nicknames.push(account.contactName);
      if(!this.fullname) {
        this.fullname = account.contactName;
      }
      this.accounts.push(account);
    } else {
      err = new Error("This account already exists for this contact.");
    }
    if(callback) {
      callback(err, this.accounts);
    }
	  return Bluebird.resolve(this);
  }

  removeAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): Bluebird.Thenable<Contact> {
    let index: number = this.accounts.indexOf(account);
    let err: Error = null;
    if(index === -1) {
      this.accounts.splice(0, 1, account);
      this.nicknames.splice(0, 1, account.contactName);
    } else {
      err = new Error("This account does not exist for this contact.");
    }
    if(callback) {
      callback(err, this.accounts);
    }
	  return Bluebird.resolve(this);
  }
}
