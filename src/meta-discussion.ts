import * as Bluebird from "bluebird";
import Incident from "incident";
import * as _ from "lodash";

import ContactAccountInterface from "./interfaces/contact-account";
import DiscussionInterface from "./interfaces/discussion";
import UserInterface from "./interfaces/user";
import MessageInterface from "./interfaces/message";

import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import MetaMessage from "./meta-message";
import SimpleDiscussion from "./simple-discussion";
import {utils} from "palantiri-interfaces";

/**
 * Traverse the tree of meta-discussions from `parent` and get a list of all the `SimpleDiscussion`
 * @param parent
 * @returns {Bluebird<SimpleDiscussion[]>}
 */
function findSimpleChildren(parent: MetaDiscussion): Bluebird<SimpleDiscussion[]> {
  return Bluebird.resolve(parent.getSubDiscussions())
    .filter<SimpleDiscussion>((discussion: DiscussionInterface) => {
      return discussion instanceof SimpleDiscussion;
    });
}

/**
 * Traverse the tree of meta-discussions from `parent` and get a list of all the `SimpleDiscussion`
 * @param parent
 * @returns {Bluebird<SimpleDiscussion[]>}
 */
function findSimpleDescendants(parent: MetaDiscussion): Bluebird<SimpleDiscussion[]> {
  return parent.getSubDiscussions()
    .then((subs: DiscussionInterface[]) => {
      let simpleChildren: SimpleDiscussion[] = [];
      let descendantsPromises: Bluebird.Thenable<SimpleDiscussion[]>[] = [];
      for(let sub of subs) {
        if (sub instanceof SimpleDiscussion) {
          simpleChildren.push(sub);
        } else {
          descendantsPromises.push(findSimpleDescendants(<MetaDiscussion> sub));
        }
      }
      if (descendantsPromises.length === 0) {
        return Bluebird.resolve(simpleChildren);
      }
      return Bluebird.all(descendantsPromises)
        .then((simpleDescendants: SimpleDiscussion[][]) => {
          return _.concat(simpleChildren, _.flatten(simpleDescendants));
        })
    });
}

/**
 * This class represents a multi-accounts and multi-protocols discussion.
 */
export class MetaDiscussion implements DiscussionInterface {
  // TODO: we need to find a way to get the messages from a meta-discussion
  //       that prevent the discussion's semantic from being screwed up by
  //       messages from a freshly added discussion.
  //       A solution is to associate each subdiscussion to its date of
  //       integration in the meta-discussion.

	/**
   * The user that is currently using this discussion.
   */
  protected user: UserInterface;

	/**
   * The list of all the subdiscussions constituing
   * the current meta-discussion.
   */
  protected subDiscussions: Subdiscussion[];

  constructor (user: UserInterface, principalDiscussion?: DiscussionInterface, otherDiscussions?: DiscussionInterface[]) {
    this.user = user;
    this.subDiscussions = [];
    if(principalDiscussion) {
      this.addSubdiscussion(principalDiscussion);
    }
    if(otherDiscussions) {
      for(let discuss of otherDiscussions) {
        this.addSubdiscussion(discuss);
      }
    }
  }

  /* DiscussionInterface implementation */
  /**
   * Return the name of the Discussion, if it exists.
   * If not, we will generate it.
   */
  // TODO: be more precise. Use the first discussion as reference ?
  getName(): Bluebird<string> {
    return Bluebird.resolve("MetaDiscussion");
  }

  /**
   * Return a string which represents the Discussion.
   */
  // TODO: be more precise.
  getDescription(): Bluebird<string> {
    return Bluebird.resolve("This is a discussion containing some sub-discussions");
  }

  /**
   * Returns the date when the current discussion received a new
   * discussion using another protocol or another single-protocol account.
   */
  getCreationDate(): Bluebird<Date> {
    // TODO: rework this.
    return Bluebird.resolve(this.getSubDiscussions())
      .map((discussion: DiscussionInterface) => discussion.getCreationDate())
      .reduce(
        (accumulator: Date, date: Date) => {
          if (accumulator === null) {
            return date || null;
          }
          if (!date) {
            return accumulator;
          }
          return date.getTime() < accumulator.getTime() ? date : accumulator;
        },
        null // Initialize accumulator with null
      );
  }

  /**
   * Return all the message of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getMessages (options?: GetMessagesOptions): Bluebird<MessageInterface[]> {
    return Bluebird.reject(new Incident("todo", "MetaDiscussion:getMessages is not implemented"));
  }

  /**
   * Add a member to the current Discussion.
   * If no subduscission exists for this contact,
   * it will be created.
   */
  // TODO: use the ghost discussion thing, or directly send a message
  //       to tell the contact that he was added to a meta-discussion
  //       from omni-chat ?
  addParticipant(contactAccount:ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird.reject(new Incident("todo", "Discussion:addParticipant is not implemented"));;
  }

  /**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   */
  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<MetaDiscussion> {
    return Bluebird.reject(new Incident("todo", "MetaDiscussion:removeParticipants is not implemented"));
    // TODO: remove this "-s" (from interfaces too).
  }

  /**
   * Sends the message newMessage to the current discussion.
   * Returns then the sent Message, completed with informations
   * acquired after the send.
   */
  sendMessage(newMessage: NewMessage): Bluebird<MetaMessage> {
    return this.getSubDiscussions()
      .map((discussion: DiscussionInterface) => {
        return discussion.sendMessage(newMessage);
      })
      .then((messages: MessageInterface[]) => {
        return new MetaMessage(messages);
      });
  }

  /* Scpecific methods */
  /**
   * The user associated to the local accounts of this discussion.
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

	/**
   * Returns a boolean indicating wether multiple userAccounts
   * are used in the subtree or not.
   */
  isHeterogeneous(): Bluebird<boolean> {
    // TODO
    return Bluebird.resolve(false);
  }

  /**
   * Return the list of all the subdiscussions constituting the
   * current MetaDiscussion.
   */
  getSubDiscussions (): Bluebird<DiscussionInterface[]> {
    return Bluebird.try(() => {
      let subdiscuss: DiscussionInterface[] = [];
      for(let discuss of this.subDiscussions) {
        subdiscuss.push(discuss.subdiscussion);
      }
    });
  }

	/**
   * Add a whole subdiscussion to the current meta-discussion.
   */
  // TODO: do we need to maintain different subdiscussion even if they are used
  //       by the same user-account and the same protocol ?
	addSubdiscussion(subDiscussion: DiscussionInterface): Bluebird<MetaDiscussion> {
    return Bluebird.reject(new Incident("todo", "MetaDiscussion:addSubdiscussion is not implemented"));
    // return Bluebird
    //   .try(() => {
    //     if(subDiscussion instanceof MetaDiscussion) {
    //       return subDiscussion.getUser()
    //         .then((user: UserInterface) => {
    //           if (this.user !== user) {
    //             return Bluebird.reject(new Incident("mixed-users", {
    //               user: this.user,
    //               subUser: this.user
    //             }, "A discussions tree can only have one local user"))
    //           }
    //           if (this.subDiscussions.indexOf(subDiscussion) < 0) {
    //             this.subDiscussions.push(subDiscussion);
    //           }
    //         })
    //     } else {
    //       // TODO
    //       return Bluebird.resolve(this);
    //     }
    //
    //   })
    //   .thenReturn(this);
  }

  removeSubdiscussion(subDiscussion: DiscussionInterface): Bluebird<MetaDiscussion> {
    return Bluebird.reject(new Incident("todo", "MetaDiscussion:removeSubdiscussion is not implemented"));
  }


	/**
   * TODO: doc.
   * @returns {Bluebird<MetaDiscussion>}
   */
  flatten(): Bluebird<this> {
    return findSimpleDescendants(this)
      .then(simpleDescendants => {
        this.subDiscussions = simpleDescendants;
        return this;
      });
  }

	/**
   * TODO: doc.
   * @returns {Bluebird<MetaDiscussion>}
   */
  mergeSimpleDiscussions(): Bluebird<this> {
    return findSimpleChildren(this)
      .then((children: SimpleDiscussion[]) => {
        let discussionsPerAccount: utils.Dictionary<SimpleDiscussion[]> = {};
        return Bluebird
          // get the user-account id
          .map(children, (child: SimpleDiscussion) => {
            child.getLocalUserAccount()
              .then(userAccount => userAccount.getGlobalId())
          })
          // group by user-account
          .then((userAccountIds) => {
            let grouped = _.groupBy(children, (child: SimpleDiscussion, idx: number) => {
                return userAccountIds[idx];
              });

            return _.pickBy(grouped, (discussions: SimpleDiscussion[]) => {
                return discussions.length > 1;
              });
          })
      })
      .then((discussionsToMerge: utils.Dictionary<SimpleDiscussion[]>) => {
        // We now have a map of AccountId -> SimpleDiscussion[]
        // let discussionsToMerge: {
        //   '["facebook", "0123456789"]': [
        //     // SimpleDiscussionA
        //     // SimpleDiscussionB
        //     // SimpleDiscussionC
        //   ],
        //   '["skype", "9876543210"]': [
        //     // SimpleDiscussionE
        //     // SimpleDiscussionF
        //   ]
        // }
      })
      .thenReturn(this);
  }

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

export interface Subdiscussion {
  subdiscussion: DiscussionInterface;
  added: Date;
}

export default MetaDiscussion;
