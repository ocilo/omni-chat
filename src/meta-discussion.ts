import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import * as _ from "lodash";
import {Incident} from "incident";

import {ContactAccountInterface} from "./interfaces/contact-account";
import {DiscussionInterface, GetParticipantsOptions} from "./interfaces/discussion";
import {UserInterface} from "./interfaces/user";
import {MessageInterface} from "./interfaces/message";
import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import {MetaMessage} from "./meta-message";
import {SimpleDiscussion} from "./simple-discussion";
import {SimpleMessage} from "./simple-message";
import {UserAccount} from "./user-account";
import {ContactAccount} from "./contact-account";
import {UserAccountInterface} from "../build/node/interfaces/user-account";

/**
 * This class represents a multi-accounts and multi-protocols discussion.
 */
export class MetaDiscussion implements DiscussionInterface {
	/**
   * The user that is currently using this discussion.
   */
  protected user: UserInterface;

	/**
   * The list of all the subdiscussions constituing
   * the current meta-discussion.
   */
  protected subDiscussions: Subdiscussion[];

  constructor (user: UserInterface, subdiscusions?: Subdiscussion[]) {
    this.user = user;
    if(subdiscusions) {
      this.subDiscussions = subdiscusions;
    } else {
      this.subDiscussions = [];
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
    return Bluebird.resolve(this.getDatedSubdiscussions())
      .map((subdiscussion: Subdiscussion) => subdiscussion.added)
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
    let metaMessages:MetaMessage[] = [];
    let messages:{msg:SimpleMessage, date:Date}[] = [];
    let opts:GetMessagesOptions = null;
    let smallFilter:(msg:MessageInterface) => boolean = null;
    let removedDates:Date[] = [];
    if (options) {
      opts = options;
      smallFilter = options.filter;
    } else {
      opts = {maxMessages: 20, afterDate: null, filter: null};
    }
    return Bluebird
      .resolve(this.getDatedSubdiscussions())
      .then((subdiscuss:Subdiscussion[]) => {
        return Bluebird.all(_.map(subdiscuss, (discuss:Subdiscussion) => {
          opts.afterDate = discuss.added;
          opts.filter = smallFilter;
          return discuss.subdiscussion.getMessages(opts)
            .map((msg:SimpleMessage) => {
              return msg.getCreationDate()
                .then((date:Date) => {
                  return {msg: msg, date: date, removed: discuss.removed}
                });
            })
            .then((datedMsgs:{msg: SimpleMessage, date: Date, removed: Date}[]) => {
              return _.filter(datedMsgs, (datedMsg: {msg: SimpleMessage, date: Date, removed: Date}) => {
                if (datedMsg.removed) {
                  return datedMsg.date.getTime() < datedMsg.removed.getTime();
                }
                return true;
              });
            })
            .map((datedMsgs:{msg: SimpleMessage, date: Date, removed: Date}) => {
              return {msg: datedMsgs.msg, date: datedMsgs.date};
            })
            .then((datedMsgs:{msg: SimpleMessage, date: Date}[]) => {
              for (let msg of datedMsgs) {
                messages.push(msg);
              }
            })
        }))
          .then(() => {
            return _.sortBy(messages, ['date']);
          })
          // ALL RIGHT !
          // We have now a sorted array with all the messages we want.
          // Let's just eliminate duplicated messages (i.e. the ones send to multiple protocols)
          .then((datedMsgs:{msg: SimpleMessage, date: Date}[]) => {
            for (let i:number = 0; i < datedMsgs.length; i++) {
              let message = datedMsgs[i];
              let meta:MetaMessage = new MetaMessage([message.msg]);
              for (let j:number = i + 1; j < datedMsgs.length; j++) {
                if (message.date.getTime() > datedMsgs[j].date.getTime() + 5 * 1000 * 60) { // more than 5 minutes
                  break;
                }
                if (message.msg.hasTheSameBodyAs(datedMsgs[j].msg)) {
                  let tempMeta = new MetaMessage([datedMsgs[j].msg]);
                  meta.merge(tempMeta);   // I dont think we care about the return by promise here
                  datedMsgs.splice(j, 1);
                  j--;  // Otherwise we will jump over the next value
                }
              }
              metaMessages.push(meta);
            }
          });
      })
      .thenReturn(metaMessages);
  }

  /**
   * Return all the participants of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getParticipants(options?: GetParticipantsOptions): Bluebird.Thenable<ContactAccountInterface[]> {
    let part: ContactAccountInterface[] = [];
    let counter: number = 0;
    return Bluebird
      .resolve(this.getSubDiscussions())
      .then((subdiscuss: SimpleDiscussion[]) => {
        return Bluebird.all(_.map(subdiscuss, (discuss: SimpleDiscussion) => {
          return discuss.getParticipants(options)
            .then((parts: ContactAccountInterface[]) => {
              if(options && options.maxParticipants) {
                if(counter + parts.length < options.maxParticipants) {
                  _.concat(part, parts);
                  counter += parts.length;
                } else if (counter !== options.maxParticipants) {
                  _.concat(part, parts.slice(0, options.maxParticipants - counter));
                  counter += options.maxParticipants - counter;
                }
              } else {
                _.concat(part, parts);
                counter += parts.length;  // Not useful in fact, but anyway.
              }
            })
        }))
      })
      .thenReturn(part);
  }

  /**
   * Add a member to the current Discussion.
   * If no subduscission exists for this contact,
   * it will be created.
   */
  // TODO: use the ghost discussion thing, or directly send a message
  //       to tell the contact that he was added to a meta-discussion
  //       from omni-chat ?
  // TODO: do not use indexOf (it compares references)
  // TODO: flatten it
  addParticipant(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird
      .resolve(this.getSubDiscussions())
      .then((subdiscuss: SimpleDiscussion[]) => {
        return Bluebird
          .all(_.map(subdiscuss, (discuss: SimpleDiscussion) => {
            return discuss.getLocalUserAccount()
              .then((userAccount: UserAccount) => {
                return userAccount.getContactAccounts()
                  .map((contact: palantiri.Account) => {
                    return new ContactAccount(contact);
                  })
                  .then((contacts: ContactAccount[]) => {
                    return {discuss: discuss, owner: userAccount, ok: (contacts.indexOf(<ContactAccount>contactAccount)===-1 ? false:true)}
                  });
              });
          }))
          .then((fullDiscuss: {discuss: SimpleDiscussion, owner: UserAccount, ok: boolean}[]) => {
            for(let discuss of fullDiscuss) {
              if(discuss.ok) {
                return discuss.discuss.addParticipant(contactAccount);
              }
            }
            // We have not found a subdiscussion that can welcome the contact.
            // We must create a whole new subdiscussion.
            return this.getUser()
              .then((user: UserInterface) => {
                return user.getAccounts()
                  .map((account: UserAccountInterface) => {
                    return {user: user, account: account};
                  });
              })
              .then((accounts: {user: UserInterface, account: UserAccountInterface}[]) => {
                return Bluebird
                  .all(_.map(accounts, (account: {user: UserInterface, account: UserAccountInterface}) => {
                    return account.account.getContactAccounts()
                      .then((contacts: ContactAccountInterface[]) => {
                        return {user: account.user, account: account.account, ok: (contacts.indexOf(contactAccount) ===-1 ? false:true)};
                      });
                  }))
                  .then((fullAccounts: {user: UserInterface, account: UserAccountInterface, ok: boolean}[]) => {
                    for(let account of fullAccounts) {
                      if(account.ok) {
                        let id: palantiri.AccountGlobalId = null;
                        return account.account.getGlobalId()
                          .then((globalID: palantiri.AccountGlobalId) => {
                            id = globalID;
                            return account.account.getOrCreateApi()
                          })
                          .then((api: palantiri.Api) => {
                            return api.createDiscussion([id]);
                          })
                          .then((discuss: palantiri.Discussion) => {
                            this.subDiscussions.push({subdiscussion: new SimpleDiscussion(discuss), added: new Date(), removed: null});
                          })
                      }
                    }
                    // oups, that's not a known contact...
                    return Bluebird.reject(new Incident("Unknown contact", contactAccount, "This contact is unknown."));
                  })
              })
              .thenReturn(this);
          });
      })
      .thenReturn(this);
  }

  /**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   */
  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<MetaDiscussion> {
    let contactID: palantiri.AccountGlobalId = null;
    return Bluebird
      .resolve(contactAccount.getGlobalId())
      .then((id: palantiri.AccountGlobalId) => {
        contactID = id;
        return this.getSubDiscussions();
      })
      .map((subdiscuss: SimpleDiscussion) => {
        return subdiscuss.getParticipants()
          .map((part: ContactAccountInterface) => {
            return part.getGlobalId();
          })
          .then((ids: palantiri.AccountGlobalId[]) => {
            return {subdiscuss: subdiscuss, membersIDs: ids};
          });
      })
      .then((memberedSubdiscussions: {subdiscuss: SimpleDiscussion, membersIDs: palantiri.AccountGlobalId[]}[]) => {
        for(let discuss of memberedSubdiscussions) {
          if(discuss.membersIDs.indexOf(contactID) !== -1) {
            return discuss.subdiscuss.removeParticipants(contactAccount)
              .thenReturn(this);
          }
        }
        // TODO: reject ?
        return this;
      });
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
  }

	/**
   * Returns a boolean indicating wether multiple userAccounts
   * are used in the subtree or not.
   */
  isHeterogeneous(): Bluebird<boolean> {
    if(!this.subDiscussions || this.subDiscussions.length === 0) {
      return Bluebird.resolve(false);
    }
    let heterogeneous: boolean = false;
    let protocols: string[] = [];
    let userAccountIDs: palantiri.AccountGlobalId[] = [];
    return Bluebird
      .resolve(this.getSubDiscussions())
      .map((subdiscussion: SimpleDiscussion) => {
        return subdiscussion.getProtocol()
      })
      .then((p: string[]) => {
        protocols = p;
        return this.getSubDiscussions();
      })
      .map((subdiscussion: SimpleDiscussion) => {
        return subdiscussion.getUserAccountGlobalID();
      })
      .then((ids: palantiri.AccountGlobalId[]) => {
        userAccountIDs = ids;
        for(let protocol of protocols) {
          if(protocol !== protocols[0]) {
            heterogeneous = true;
            break;
          }
        }
        if(!heterogeneous) {
          for(let id of userAccountIDs) {
            if(id !== userAccountIDs[0]) {
              heterogeneous = true;
              break;
            }
          }
        }
        return heterogeneous;
      });
  }

  /**
   * Return the list of all the simple-discussions constituting the
   * current MetaDiscussion.
   */
  getSubDiscussions (): Bluebird<SimpleDiscussion[]> {
    return Bluebird.try(() => {
      let subdiscuss: SimpleDiscussion[] = [];
      for(let discuss of this.subDiscussions) {
        subdiscuss.push(discuss.subdiscussion);
      }
      return subdiscuss;
    });
  }

  /**
   * Return the list of all the simple-discussions constituting the
   * current MetaDiscussion, with their date of adding and removing.
   */
  getDatedSubdiscussions(): Bluebird<Subdiscussion[]> {
    return Bluebird.resolve(this.subDiscussions);
  }

	/**
   * Add a whole subdiscussion to the current meta-discussion.
   * If this subdiscussion can be merged with an existing one,
   * it will be merged.
   */
	addSubdiscussion(subDiscussion: SimpleDiscussion): Bluebird<MetaDiscussion> {
    let protocols: string[] = [];
    let userAccountIDs: palantiri.AccountGlobalId[] = [];
    let subdiscussions: SimpleDiscussion[] = [];
    let subdiscussionsIDs: palantiri.DiscussionGlobalId[] = [];
    let accountID: palantiri.AccountGlobalId = null;
    let protocol: string = null;
    let subdiscussID: palantiri.DiscussionGlobalId = null;
    return Bluebird
      .try(() => {
        return subDiscussion.getProtocol()
          .then((p: string) => {
            protocol = p;
            return subDiscussion.getUserAccountGlobalID();
          })
          .then((localId: palantiri.AccountGlobalId) => {
            accountID = localId;
            return subDiscussion.getGlobalID();
          })
          .then((globalId: palantiri.DiscussionGlobalId) => {
            subdiscussID = globalId;
          });
      })
      .then(() => {
        // NOTE: the fact that subDiscussion.user is not used by an account of the current User is not supported yet,
        //       but should not appear for the moment anyway.
        return this.getSubDiscussions();
      })
      .map((subdiscuss: SimpleDiscussion) => {
        subdiscussions.push(subdiscuss);
        return subdiscuss.getProtocol();
      })
      .then((p: string[]) => {
        protocols = p;
        return subdiscussions;
      })
      .map((subdiscuss: SimpleDiscussion) => {
        return subdiscuss.getGlobalID();
      })
      .then((ids: palantiri.DiscussionGlobalId[]) => {
        subdiscussionsIDs = ids;
        return subdiscussions;
      })
      .map((subdiscuss: SimpleDiscussion) => {
        return subdiscuss.getUserAccountGlobalID();
      })
      .then((ids: palantiri.AccountGlobalId[]) => {
        userAccountIDs = ids;
        for(let subdiscussionID of subdiscussionsIDs) {
          if(subdiscussionID === subdiscussID) {
            return Bluebird.reject(new Incident("Already existing", subDiscussion, "This subdiscussion already exists in the current meta-discussion."));
          }
        }
        let found: boolean = false;
        for(let i: number = 0; i < protocols.length; i++) {
          if(protocols[i] === protocol && userAccountIDs[i] === accountID && !this.subDiscussions[i].removed) {
            this.subDiscussions[i].subdiscussion.merge(subDiscussion);
            found = true;
            break;
          }
        }
        if(!found) {
          this.subDiscussions.push({subdiscussion: subDiscussion, added: new Date(), removed: null});
        }
      })
      .thenReturn(this);
  }

  removeSubdiscussion(subDiscussion: SimpleDiscussion): Bluebird<MetaDiscussion> {
    return Bluebird
      .try(() => {
        if(this.subDiscussions.length === 0) {
          return Bluebird.reject(new Incident("Empty meta-discussion", "This meta-discussion has no subdiscussion for the moment."));
        }
        return this.getDatedSubdiscussions();
      })
      .map((subdiscuss: Subdiscussion) => {
        return subDiscussion.isTheSameAs(subdiscuss.subdiscussion);
      })
      .then((sames: boolean[]) => {
        let found: boolean = false;
        for(let i: number; i = 0; i++) {
          let same = sames[i];
          if(same && !this.subDiscussions[i].removed) {
            this.subDiscussions[i].removed = new Date();
            found = true;
            break;
          }
        }
        if(!found) {
          return Bluebird.reject(new Incident("No such discussion", subDiscussion, "This subdiscussion does not exist or was already removed."));
        }
        return this;
      });
  }

	/**
   * Return the discussions were the given contact can be added.
   */
  protected getDiscussionsCompatibleWithContact (contactAccount: ContactAccountInterface): Bluebird<SimpleDiscussion[]> {
    return this.getSubDiscussions()
      .filter((discu: SimpleDiscussion) => {
        return discu.getLocalUserAccount().then(acc => acc.hasContact(contactAccount));
      });
  }

}

/**
 * This represents a subdiscussion in a meta-discussion.
 */
export interface Subdiscussion {
  subdiscussion: SimpleDiscussion;
  added: Date;
  removed: Date;
}

export default MetaDiscussion;
