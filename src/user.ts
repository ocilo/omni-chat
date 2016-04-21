import * as Bluebird from "bluebird";

import {Contact} from "palantiri-interfaces";
import {User} from "palantiri-interfaces";
import {Discussion} from "palantiri-interfaces";
import {UserAccount} from "palantiri-interfaces";
import {GroupAccount} from "palantiri-interfaces";
import {OChatApp} from "./app";
import {EventEmitter} from "events";
import {OChatContact} from "../build/node/contact";

export class OChatUser extends EventEmitter implements User {
  username: string;

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

  leaveDiscussion(discussion: Discussion): Bluebird.Thenable<User> {
	  // TODO : two ways to implements this :
	  //        -> for each accounts, get the connection, then the api, then call leaveGroupChat().
	  //        -> just emit and event and connections will catch it and do what they need to do.
		return Bluebird.resolve(this);
  }

  getAccounts(protocols?: string[]): Bluebird<UserAccount[]> {
    if(protocols) {
      let accounts: UserAccount[] = [];
      for(let account of this.accounts) {
	      for(let protocol of protocols) {
		      if(account.protocol.toLowerCase() === protocol.toLowerCase()) {
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
	      let othersContacts: Contact[] = [];
	      for(let someContact of someContacts) {
		      let ctc = new OChatContact();
		      ctc.fullname = someContact.contactName;
		      if(!ctc.nicknames) {
			      ctc.nicknames = [];
		      }
		      if(!ctc.accounts) {
			      ctc.accounts = [];
		      }
		      ctc.nicknames.push(ctc.fullname);
		      ctc.accounts.push(someContact);
		      othersContacts.push(ctc);
	      }
        if(!contacts) {
          contacts = othersContacts;
        } else {
          for(let otherContact of othersContacts) {
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

  addAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User> {
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
	  return Bluebird.resolve(this);
  }

  removeAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User> {
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
	  return Bluebird.resolve(this);
  }

  addContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User> {
    // TODO : this is advanced option.
    //        It's about writing on an account,
    //        and not only reading it.
    //        We will do this later.
	  return Bluebird.resolve(this);
  }

  removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User> {
    // WARNING : we need to warn the user that this will remove the contact from all his accounts
    // TODO : this is advanced option.
    //        It's about writing on an account,
    //        and not only reading it.
    //        We will do this later.
	  return Bluebird.resolve(this);
  }

	connectionsOn(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.on(event, handler);
				})
			}
		}
		return Bluebird.resolve(this);
	}

	connectionsOnce(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.once(event, handler);
				})
			}
		}
		return Bluebird.resolve(this);
	}

	removeConnectionsListener(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.removeListener(event, handler);
				})
			}
		}
		return Bluebird.resolve(this);
	}

	connectionsSetMaxListeners(n: number): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.setMaxListeners(n);
				})
			}
		}
		return Bluebird.resolve(this);
	}
}
