import * as Bluebird from "bluebird";
import {Contact} from "./interfaces/contact";
import {ContactAccount} from "./interfaces/contact-account";
import {User} from "./interfaces/user";
import {Discussion} from "./interfaces/discussion";
import {OChatContact} from "./contact";
import {UserAccount} from "palantiri-interfaces";
import {Message} from "palantiri-interfaces";

export class OChatUser implements User {
  username: string;

  accounts: UserAccount[] = [];

  getOrCreateDiscussion(contactAccount: ContactAccount): Bluebird<Discussion> {
    let discussion: Discussion = null; // The discussion we are looking for
	  // TODO
    return Bluebird.resolve(discussion);
  }

	getAllDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]> {
		let discussions: Discussion[] = []; // The discussions we are looking for
		// TODO
		return Bluebird.resolve(discussions);
	}

	getHeterogeneousDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]> {
		let discussions: Discussion[] = []; // The discussions we are looking for
		// TODO : access db
		return Bluebird.resolve(discussions);
	}

  leaveDiscussion(discussion: Discussion): Bluebird.Thenable<User> {
	  // TODO : two ways to implements this :
	  //        -> for each accounts, get the connection, then the api, then call leaveGroupChat().
	  //        -> just emit and event and connections will catch it and do what they need to do.
		return Bluebird.resolve(this);
  }

	sendMessage(msg: Message, discussion: Discussion, callback?: (err: Error) => any): Bluebird.Thenable<User> {
		// TODO
		return Bluebird.resolve(this);
	}

	getContacts(): Bluebird<Contact[]> {
		// TODO : we can do lots of improvements :
		//        -use the mail address(a lot more efficient !)
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

	on(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.on(eventname, handler);
				})
			}
		}
		return Bluebird.resolve(this);
	}

	once(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
		for(let account of this.accounts) {
			if(account.connection && account.connection.connected) {
				account.getOrCreateConnection().then((co) => {
					co.once(eventname, handler);
				})
			}
		}
		return Bluebird.resolve(this);
	}
}
