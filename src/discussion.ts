import * as Bluebird from "bluebird";
import Incident from "incident";

import AppInterface from "./interfaces/app";
import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import UserInterface from "./interfaces/user";
import MessageInterface from "./interfaces/message";
import {GetMessagesOptions} from "./interfaces/discussion";

export class Discussion implements DiscussionInterface {
  app: AppInterface;
  user: UserInterface;

  // should be a Set, we should implement or import a Set class
  subDiscussions: Discussion[];

  constructor (app: AppInterface, user: UserInterface) {
    this.app = app;
    this.user = user;
  }

  getName(): Bluebird<string> {
    return Bluebird.resolve("Compound-discussion");
  }

  getDescription(): Bluebird<string> {
    return Bluebird.resolve("This is a discussion containing some sub-discussions");
  }

  /**
   * Returns the oldest creation date
   * @returns {any}
   */
  getCreationDate(): Bluebird<Date> {
    return Bluebird.resolve(this.getSubdiscussions())
      .map((discussion: DiscussionInterface) => {
        return discussion.getCreationDate();
      })
      .then((creationDates: Date[]) => {
        // TODO: choose the oldest...
        return new Date();
      });
  }

  /**
   * The user associated to the local accounts of this discussion
   * @returns {Bluebird<UserInterface>}
   */
  getUser(): Bluebird<UserInterface> {
    return Bluebird.resolve(this.user);

    // return Bluebird.resolve(this.getSubdiscussions())
    //   .map(discussion => discussion.getUser())
    //   .then((users: UserInterface[]) => {
    //     if (users.length === 0) {
    //       return Bluebird.reject(new Incident("no-user", "This discussion has"))
    //     }
    //
    //     users = _.uniq(users);
    //
    //     if (users.length > 1) {
    //       console.warn("This discussion has to many users!");
    //       return users[0]
    //       return Bluebird.reject()
    //     }
    //     return
    //   });
  }

  isHeterogeneous(): Bluebird<boolean> {
    return Bluebird.resolve(false); // Tells that this discussion uses a single account for a single discussion
  }


  getSubdiscussions (): Bluebird<DiscussionInterface[]> {
    return Bluebird.resolve(this.subDiscussions);
  }

	addSubdiscussion(subDiscussion: Discussion): Bluebird<this> {
    return Bluebird
      .try(() => {
        return subDiscussion.getUser()
          .then((user: UserInterface) => {
            if (this.user !== user) {
              return Bluebird.reject(new Incident("mixed-users", {user: this.user, subUser: this.user}, "A discussions tree can only have one local user"))
            }
            if (this.subDiscussions.indexOf(subDiscussion) < 0) {
              this.subDiscussions.push(subDiscussion);
            }
          })
      })
      .thenReturn(this);

		// TODO : rework all of this. This is probably wrong now: we decided that we don't automatically resolve the account to use so the above implementation is easier (but maybe incomplete)
		// if(this.subdiscussions.indexOf({since: undefined, discussion: subdiscuss}) === -1) {
		// 	let param: string[] = [subdiscuss.protocol];
		// 	this.owner.getAccounts(param).then((ownerAccounts) => {
		// 		let compatibleSubdiscussions: GroupChat[] = [];
		// 		for(let subdiscussion of this.subdiscussions) {
		// 			if(subdiscussion.discussion.protocol === subdiscuss.protocol) {
		// 				compatibleSubdiscussions.push(subdiscuss);
		// 			}
		// 		}
		// 		let gotIt: boolean = false;
		// 		for(let compatibleParticipant of compatibleSubdiscussions) {
		// 			for(let ownerAccount of ownerAccounts) {
		// 				if(ownerAccount.hasContactAccount(compatibleParticipant.participants[0])) {
		// 					// Ok, we have determined which one of the user's accounts
		// 					// owns the current compatible participant.
		// 					// Now if it owns the ContactAccounts that we want to add
		// 					// to this discussion too, we win.
		// 					if(ownerAccount.hasContactAccount(subdiscuss.participants[0])) {
		// 						// That's it, we win !
		// 						// TODO : well, almost. We need to check if every member is accessible,
		// 						//        or it could lead to some problems.
		// 						ownerAccount.getOrCreateConnection()
		// 							.then((co) => {
		// 								return co.getConnectedApi();
		// 							})
		// 							.then((api) => {
		// 								api.addMembersToDiscussion(subdiscuss.participants, compatibleParticipant, (err) => {
		// 									if(!err) {
		// 										compatibleParticipant.addParticipants(subdiscuss.participants);
		// 									}
		// 								});
		// 							});
		// 						gotIt = true;
		// 						break;
		// 					}
		// 				}
		// 			}
		// 			if(gotIt) {
		// 				break;
		// 			}
		// 		}
		// 		// In the case where we still not have been able to add these participants,
		// 		// there is two solutions :
		// 		if(!gotIt) {
		// 			let currentDate = new Date();
		// 			if(compatibleSubdiscussions.length === 0) {
		// 				// First, we are trying to add accounts using a protocol which is
		// 				// not in this discussion yet. We just have to add these participants
		// 				// to this discussion, which will become heterogeneous.
		// 				this.subdiscussions.push({since: currentDate, discussion: subdiscuss});
		// 				this.heterogeneous = true;
		// 			} else {
		// 				// Second, we are trying to add accounts from an UserAccount which has
		// 				// no current contacts in this discussion. We just have to add them.
		// 				this.subdiscussions.push({since: currentDate, discussion: subdiscuss});
		// 			}
		// 			let that = this;
		// 			subdiscuss.owner.connection.on("msgRcv", (msg: Message) => {
		// 				let sender = msg.author;
		// 				let foundSender: boolean = false;
		// 				for(let subdiscussion of that.subdiscussions) {
		// 					if(!foundSender) {
		// 						for(let contact of subdiscussion.discussion.participants) {
		// 							if(sender === contact) {
		// 								foundSender = true;
		// 								break;
		// 							}
		// 						}
		// 					}
		// 					if(!foundSender) {
		// 						subdiscussion.discussion.owner.sendMessage(msg, subdiscussion.discussion);
		// 					}
		// 				}
		// 			});
		// 			// TODO : but how the new participants will know that they are in this discussion ?
		// 			//        For the moment, they won't know until we send a message to them.
		// 			//        I don't think that it is a real problem.
		// 			//        If it is, we coud just auto-send a message to them.
     //      // TODO: add palantiri.Api.sendInvitation(accountId, discussionId)
		// 		}
		// 	});
		// }
		// return Bluebird.resolve(this);
	}

  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<Discussion> {
    return Bluebird.reject(new Incident("todo", "Discussion:removeParticipants is not implemented"));
  }

  getMessages (options?: GetMessagesOptions): Bluebird<MessageInterface[]> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:getMessages is not implemented"));
  }
}

export default Discussion;
