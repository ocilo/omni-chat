import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import {EventEmitter} from "events";
import Incident from "incident";

import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import UserInterface from "./interfaces/user";
import UserAccountInterface from "./interfaces/user-account";
import MessageInterface from "./interfaces/message";

import {Discussion} from "./discussion";

export class User extends EventEmitter implements UserInterface {
  /**
   * A human-readable name
   */
  username: string;

  /**
   * The list of accounts associated with this user
   * @type {Array}
   */
  accounts: UserAccountInterface[] = [];

  constructor (username: string) {
    super();
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

  getAccounts(driverNames?: string[]): Bluebird<UserAccountInterface[]> {
    return Bluebird.resolve(this.accounts)
      .filter((account: UserAccountInterface) => {
        if (!driverNames) {
          return Bluebird.resolve(true);
        }
        return account.getGlobalId()
          .then((globalId: palantiri.AccountGlobalId) => {
            let parsed = palantiri.GlobalId.parse(globalId);
            return parsed !== null && driverNames.indexOf(parsed.driverName) >= 0;
          });
      });
  }

  addAccount(account: UserAccountInterface): Bluebird<this> {
    return Bluebird
      .try(() => {
        let index = this.accounts.indexOf(account);
        if (index < 0) {
          this.accounts.push(account);
        }
        return this;
      });
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
}

export default User;
