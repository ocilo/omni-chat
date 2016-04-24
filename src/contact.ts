import * as Bluebird from "bluebird";
import * as _ from "lodash";
import Incident from "incident";

import ContactInterface from "./interfaces/contact";
import ContactAccountInterface from "./interfaces/contact-account";

export class Contact implements ContactInterface {
  name: string;
  accounts: ContactAccountInterface[];

  getAccounts(): Bluebird<ContactAccountInterface[]> {
    return Bluebird.resolve(this.accounts);
  }

  getNicknames(): Bluebird<string[]> {
    return this.getAccounts()
      .map(account => account.getName())
      .then(names => {
        names.push(this.name);
        return _.uniq(names);
      });
  }

  getName(): Bluebird<string> {
    return Bluebird.resolve(this.name);
  }

  setName(newName: string): Bluebird<this> {
    this.name = newName;
    return Bluebird.resolve(this);
  }

  setPrincipalName(newPrincipalName: string): Bluebird.Thenable<Contact> {
    this.name = newPrincipalName;
	  return Bluebird.resolve(this);
  }

  mergeWithContact (contact: Contact): Bluebird.Thenable<this> {
    return Bluebird.resolve(contact.getAccounts())
      .map((contactAccount: ContactAccountInterface) => {
        return Bluebird.resolve(this.addAccount(contactAccount))
          .thenReturn(null)
          .catch(err => err);
      })
      .then((errors) => {
        errors = _.without(errors, null);
        // TODO: handle errors
        return this;
      });
    // let error: Error = null;
    // let numberOfErrors: number = 0;
    // for(let contactAccount of contact.accounts) {
    //   this.addAccount(contactAccount, (err, acc) => {
    //     if(err) {
    //       numberOfErrors++;
    //     }
    //   });
    // }
    // if(numberOfErrors === contact.accounts.length) {
    //   error = new Error("Unable to merge contact. Maybe the second was part of the current.");
    // } else if(numberOfErrors !== 0) {
    //   error = new Error(numberOfErrors + " account of the contact in parameters could not be added to the current contact.");
    // }
    // if(callback) {
    //   callback(error, this);
    // }
    // return Bluebird.resolve(this);
  }

  unmergeWithContact (contact: Contact): Bluebird.Thenable<this> {
    return Bluebird.resolve(contact.getAccounts())
      .map((contactAccount: ContactAccountInterface) => {
        return Bluebird.resolve(this.removeAccount(contactAccount))
          .thenReturn(null)
          .catch(err => err);
      })
      .then((errors) => {
        errors = _.without(errors, null);
        // TODO: handle errors
        return this;
      });
  }

  addAccount(account: ContactAccountInterface): Bluebird.Thenable<this> {
    return Bluebird.reject(new Incident("todo", "Contact:addAccount is not implemented"));
    // let index: number = this.accounts.indexOf(account);
    // let err: Error = null;
    // if(index === -1) {
     //  this.nicknames.push(account.fullname);
     //  if(!this.name) {
     //    this.name = account.fullname;
     //  }
     //  this.accounts.push(account);
    // } else {
     //  err = new Error("This account already exists for this contact.");
    // }
	  // return Bluebird.resolve(this);
  }

  removeAccount(account: ContactAccountInterface): Bluebird.Thenable<this> {
    return Bluebird.reject(new Incident("todo", "Contact:addAccount is not implemented"));
    // let index: number = this.accounts.indexOf(account);
    // let err: Error = null;
    // if(index === -1) {
     //  this.accounts.splice(0, 1, account);
     //  this.nicknames.splice(0, 1, account.fullname);
    // } else {
     //  err = new Error("This account does not exist for this contact.");
    // }
	  // return Bluebird.resolve(this);
  }
}

export default Contact;
