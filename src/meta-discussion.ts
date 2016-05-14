import * as Bluebird from "bluebird";
import {Incident} from "incident";
import * as palantiri from "palantiri-interfaces";
import {ContactAccountInterface} from "./interfaces/contact-account";
import {DiscussionInterface} from "./interfaces/discussion";
import {UserInterface} from "./interfaces/user";
import {MessageInterface} from "./interfaces/message";
import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import {MetaMessage} from "./meta-message";
import {SimpleDiscussion} from "./simple-discussion";

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
    return Bluebird.reject(new Incident("todo", "Discussion:addParticipant is not implemented"));
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
   */
  // TODO: do we need to maintain different subdiscussion even if they are used
  //       by the same user-account and the same protocol ?
	addSubdiscussion(subDiscussion: SimpleDiscussion): Bluebird<MetaDiscussion> {
    return Bluebird
      .try(() => {
        // NOTE: the fact that subDiscussion.user is not used by an account of the current User is not supported yet,
        //       but should not appear for the moment anyway.
        return this.getSubDiscussions();
      })
      .then((subdiscuss: DiscussionInterface[]) => {
        if(subdiscuss.indexOf(subDiscussion) !== -1) {
          return Bluebird.reject(new Incident("Already existing", subDiscussion, "This subdiscussion already exists in the current meta-discussion."));
        }
        this.subDiscussions.push({subdiscussion: subDiscussion, added: new Date(), removed: null});
        // TODO: see the global todo at the beggining of this method.
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
