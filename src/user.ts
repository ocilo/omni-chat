import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import ContactInterface from "./interfaces/contact";
import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";
import MessageInterface from "./interfaces/message";

import {Discussion} from "./discussion";

export class User implements UserInterface {
  /**
   * The app used by this user
   * @type {null}
   */
  private app: AppInterface = null;

  /**
   * A human-readable name
   */
  username: string;

  /**
   * The list of accounts associated with this user
   * @type {Array}
   */
  accounts: UserAccountInterface[] = [];

  constructor (app: AppInterface, username: string) {
    this.app = app;
    this.username = username;
  }

  getOrCreateDiscussion(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird.reject(new Incident("todo", "User:getOrCreateDiscussion is not implemented"));
    // let discussion: DiscussionInterface = new Discussion(this.app, this); // The discussion we are looking for
    // let that = this;
    // let ownerAccount: UserAccountInterface = undefined;
    // for(let account of this.accounts) {
    //   if(account.hasContactAccount(contactAccount)) {
    //     ownerAccount = account;
    //     account.getDiscussions(1, (disc): boolean => {
    //       let contains: boolean = false;
    //       disc.getParticipants()
    //         .then((part) => {
    //           for(let participant of part) {
    //             if(participant === contactAccount) {
    //               contains = true;
    //             }
    //           }
    //           contains = false;
    //         });
    //       return contains;
    //     })
    //       .then((discussions) => {
    //       if(discussions && discussions.length !== 0) {
    //         discussion.creationDate = discussions[0].creationDate;
    //         discussion.name = discussions[0].name;
    //         discussion.description = discussions[0].description;
    //         discussion.addSubdiscussion(discussions[0]);
    //       } else {
    //         discussion.creationDate = new Date();
    //         discussion.name = "Discussion with " + contactAccount.fullname;
    //         discussion.description = "Discussion with " + contactAccount.fullname;
    //         // TODO : fix what's under this comment. It comes from export and type alias.
    //         let subdisc: GroupChat = <GroupChat> {
    //           protocol: contactAccount.protocol,
    //           localDiscussionID: undefined,
    //           creationDate: new Date(),
    //           name: undefined,
    //           description: undefined,
    //           isPrivate: true,
    //           participants: [contactAccount],
    //           owner: ownerAccount,
    //           authorizations: undefined,
    //           settings: undefined
    //         };
    //         // TODO : for the moment, the contact has no clue that we started a Discussion with him.
    //         //        is that a problem ?
    //         discussion.addSubdiscussion(subdisc);
    //       }
    //         discussion.heterogeneous = false;
    //         discussion.owner = that;
    //     });
    //     break;
    //   }
    // }
    // return Bluebird.resolve(discussion);
  }

	getAllDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]> {
    return Bluebird.reject(new Incident("todo", "User:getAllDiscussions is not implemented"));
		// let discussions: Discussion[] = []; // The discussions we are looking for
		// // TODO
		// return Bluebird.resolve(discussions);
	}

	getHeterogeneousDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]> {
    return Bluebird.reject(new Incident("todo", "User:getHeterogeneousDiscussions is not implemented"));
		// let discussions: Discussion[] = []; // The discussions we are looking for
		// // TODO : access db
		// return Bluebird.resolve(discussions);
	}

  leaveDiscussion(discussion: Discussion): Bluebird.Thenable<User> {
    return Bluebird.reject(new Incident("todo", "User:leaveDiscussion is not implemented"));
    // // TODO : two ways to implements this :
    // //        -> for each accounts, get the connection, then the api, then call leaveGroupChat().
    // //        -> just emit and event and connections will catch it and do what they need to do.
		// return Bluebird.resolve(this);
  }

	sendMessage(msg: MessageInterface, discussion: Discussion, callback?: (err: Error) => any): Bluebird.Thenable<User> {
    return Bluebird.reject(new Incident("todo", "User:sendMessage is not implemented"));
		// let err: Error = null;
		// for(let subdiscussion of discussion.subdiscussions) {
		// 	subdiscussion.discussion.owner.sendMessage(msg, subdiscussion.discussion, (error) => {
		// 		if(error) {
		// 			err = error;
		// 		}
		// 	});
		// }
		// if(callback) {
		// 	callback(err);
		// }
		// return Bluebird.resolve(this);
	}

	getContacts(filter?: (contact: ContactInterface) => boolean): Bluebird<ContactInterface[]> {
    return Bluebird.reject(new Incident("todo", "User:getContacts is not implemented"));
		// // TODO : we can do lots of improvements :
		// //        -use the mail address(a lot more efficient !)
		// //        -do not compare otherContact with other someContacts we already added to contacts
		// //        -improve how we check if ContactAccount are the same Contact
		// //        -check in base if the user specified some time ago that some accounts are the same
		// let contacts: Contact[] = null;
		// for(let account of this.accounts) {
		// 	account.getContacts().then((someContacts) => {
		// 		let othersContacts: Contact[] = [];
		// 		for(let someContact of someContacts) {
		// 			let ctc = new OChatContact();
		// 			ctc.fullname = someContact.name;
		// 			if(!ctc.nicknames) {
		// 				ctc.nicknames = [];
		// 			}
		// 			if(!ctc.accounts) {
		// 				ctc.accounts = [];
		// 			}
		// 			ctc.nicknames.push(ctc.fullname);
		// 			ctc.accounts.push(someContact);
		// 			if(!filter || filter(ctc)) {
		// 				othersContacts.push(ctc);
		// 			}
		// 			// TODO : correctly use filter
		// 		}
		// 		if(!contacts) {
		// 			contacts = othersContacts;
		// 		} else {
		// 			for(let otherContact of othersContacts) {
		// 				let merge: boolean = false;
		// 				for(let actualContact of contacts) {
		// 					if(otherContact.name === actualContact.name) {
		// 						actualContact.mergeContacts(otherContact);
		// 						merge = true;
		// 						break;
		// 					}
		// 				}
		// 				if(!merge) {
		// 					contacts.push(otherContact);
		// 				}
		// 			}
		// 		}
		// 	})
		// }
		// return Bluebird.resolve(contacts);
	}
	addContact(contact: ContactInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "User:addContact is not implemented"));
		// TODO : this is advanced option.
		//        It's about writing on an account,
		//        and not only reading it.
		//        We will do this later.
		// return Bluebird.resolve(this);
	}

	removeContact(contact: ContactInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "User:removeContact is not implemented"));
		// // WARNING : we need to warn the user that this will remove the contact from all his accounts
		// // TODO : this is advanced option.
		// //        It's about writing on an account,
		// //        and not only reading it.
		// //        We will do this later.
		// return Bluebird.resolve(this);
	}
  
  getAccounts(protocols?: string[]): Bluebird<UserAccountInterface[]> {
    return Bluebird.reject(new Incident("todo", "User:getAccounts is not implemented"));
    // if(protocols) {
    //   let accounts: UserAccountInterface[] = [];
    //   for(let account of this.accounts) {
    //     for(let protocol of protocols) {
    //       if(account.driver.toLowerCase() === protocol.toLowerCase()) {
    //         accounts.push(account);
    //         break;
    //       }
    //     }
    //   }
    //   return Bluebird.resolve(accounts);
    // }
    // return Bluebird.resolve(this.accounts);
  }

  addAccount(account: UserAccountInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "User:addAccount is not implemented"));
    // let index: number = this.accounts.indexOf(account);
    // let err: Error = null;
    // if(index === -1) {
     //  this.accounts.push(account);
    // } else {
     //  err = new Error("This account already exists.");
    // }
    // if(callback) {
     //  callback(err, this.accounts);
    // }
	  // return Bluebird.resolve(this);
  }

  removeAccount(account: UserAccountInterface): Bluebird.Thenable<this> {
    return Bluebird.reject(new Incident("todo", "User:removeAccount is not implemented"));
    // let index: number = this.accounts.indexOf(account);
    // let err: Error = null;
    // if(index === -1) {
    //   this.accounts.splice(0, 1, account);
    // } else {
    //   err = new Error("This account does not exist.");
    // }
    // if(callback) {
    //   callback(err, this.accounts);
    // }
    // return Bluebird.resolve(this);
  }

	on(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
    return Bluebird.reject(new Incident("todo", "User:on is not implemented"));
		// for(let account of this.accounts) {
		// 	if(account.connection && account.connection.connected) {
		// 		account.getOrCreateConnection().then((co) => {
		// 			co.on(eventname, handler);
		// 		})
		// 	}
		// }
		// return Bluebird.resolve(this);
	}

	once(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User> {
    return Bluebird.reject(new Incident("todo", "User:once is not implemented"));
		// for(let account of this.accounts) {
		// 	if(account.connection && account.connection.connected) {
		// 		account.getOrCreateConnection().then((co) => {
		// 			co.once(eventname, handler);
		// 		})
		// 	}
		// }
		// return Bluebird.resolve(this);
	}
}

export default User;
