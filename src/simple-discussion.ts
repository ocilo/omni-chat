import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import * as _ from "lodash";
import {ContactAccountInterface} from "./interfaces/contact-account";
import {DiscussionInterface, GetParticipantsOptions} from "./interfaces/discussion";
import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import {MessageInterface} from "./interfaces/message";
import {UserAccountInterface} from "./interfaces/user-account";
import {SimpleMessage} from "./simple-message";
import {UserAccount} from "./user-account";
import {ContactAccount} from "./contact-account";

/**
 * This class is a high-level wrapper for a palantiri discussion
 * (mono-account, mono-driver) bound to a single account of a single user.
 */
export class SimpleDiscussion implements DiscussionInterface {
	/**
   * The low-level passive object representing the current Discussion.
   */
  private discussionData: palantiri.Discussion;

  constructor (discussionData: palantiri.Discussion) {
    this.discussionData = discussionData;
  }

  /* DiscussionInterface implementation */
  /**
   * Return the name of the Discussion, if it exists.
   * If not, we will generate it.
   */
  getName(): Bluebird<string> {
    return this.getDiscussionInfo()
      .then(info => {
        if(info.name) {
          return info.name;
        }
        let name: string = "Discussion with ";
        for(let i = 0; i<info.participants.length; i++) {
          let part = info.participants[i];
          name += part.name;
          if(i != info.participants.length -1) {
            name += ", ";
          }
        }
        return name;
      });
  }

  /**
   * Return a string which represents the Discussion.
   */
  getDescription(): Bluebird<string> {
    return this.getDiscussionInfo().then(info => {
      return info.description ? info.description : this.getName();
    });
  }

  /**
   * Return the creation date of the current Discussion.
   * This is very important for multi-accounts and multi-protocols Discussions.
   */
  getCreationDate(): Bluebird<Date> {
    return this.getDiscussionInfo().then(info => info.creationDate);
  }

  /**
   * Return all the message of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getMessages (options?: GetMessagesOptions): Bluebird<MessageInterface[]> {
    return Bluebird.resolve((new UserAccount(this.discussionData.owner)).getOrCreateApi())
      .then((api: palantiri.Api) => {
        let palOptions: palantiri.Api.GetMessagesFromDiscussionOptions = null;
        if(options) {
          let palFilter = (msg: palantiri.Message): boolean => {
            if(options.afterDate) {
              if(msg.lastUpdated < options.afterDate) {
                return false;
              }
            }
            if(options.filter) {
              let ocmsg = new SimpleMessage(msg);
              ocmsg.setDelivered();
              return options.filter(ocmsg);
            }
            return true;
          };
          palOptions = {
            max: options.maxMessages,
            filter: palFilter
          };
        }
        return api.getMessagesFromDiscussion(this.discussionData, palOptions);
      })
      .map((message: palantiri.Message) => {
        return new SimpleMessage(message).setDelivered();
        // TODO : we need to find who is the author of this message
      });
  }

  /**
   * Return all the participants of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getParticipants(options?: GetParticipantsOptions): Bluebird<ContactAccountInterface[]> {
    return Bluebird.try(() => {
      let participants: ContactAccountInterface[] = [];
      for(let part of this.discussionData.participants) {
        participants.push(new ContactAccount(part));
      }
      return participants;
    });
  }

  /**
   * Add a member to the current Discussion.
   * Be careful, the behavior of this method will vary with implementations :
   * If this is sa single-protocol and single-account discussion,
   * it will throw an error if the contact is unknown.
   */
  addParticipant(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface> {
    let contactID: palantiri.AccountGlobalId[] = [];
    return Bluebird.resolve(contactAccount.getGlobalId())
      .then((id: palantiri.AccountGlobalId) => {
        contactID.push(id);
        return (new UserAccount(this.discussionData.owner)).getOrCreateApi();
      })
      .then((api: palantiri.Api) => {
        api.addMembersToDiscussion(contactID, palantiri.Id.asGlobalId(this.discussionData));
      })
      .thenReturn(this);
    // TODO: handle errors (not the right protocol or account for the contact)
  }

  /**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   * Be careful, the behavior of this method will vary with implementations :
   * If this is sa single-protocol and single-account discussion,
   * it will throw an error if the contact is unknown.
   */
  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<this> {
    let contactID: palantiri.AccountGlobalId[] = [];
    return Bluebird.resolve(contactAccount.getGlobalId())
      .then((id: palantiri.AccountGlobalId) => {
        contactID.push(id);
        return (new UserAccount(this.discussionData.owner)).getOrCreateApi();
      })
      .then((api: palantiri.Api) => {
        api.removeMembersFromDiscussion(contactID, palantiri.Id.asGlobalId(this.discussionData));
      })
      .thenReturn(this);
    // TODO: handle errors (not the right protocol or account for the contact)
  }

  /**
   * Sends the message newMessage to the current discussion.
   * Returns then the sent Message, completed with informations
   * acquired after the send.
   */
  sendMessage(newMessage: NewMessage): Bluebird<SimpleMessage> {
    return Bluebird.resolve((new UserAccount(this.discussionData.owner)).getOrCreateApi())
      .then((api: palantiri.Api) => {
        return api.sendMessage(newMessage, this.discussionData.id);
      })
      .then((message: palantiri.Message) => {
        return new SimpleMessage(message);
      });
  }

  /* Scpecific methods */
	/**
   * Return the user-account that is used to communicate in the current Discussion.
   */
  getLocalUserAccount(): Bluebird.Thenable<UserAccountInterface> {
    return Bluebird.resolve(new UserAccount(this.discussionData.owner));
  }

	/**
   * Return the global ID of the low-level user-account that is used
   * in the current Discussion.
   */
  getUserAccountGlobalID(): Bluebird.Thenable<palantiri.AccountGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.discussionData.owner));
  }

  /**
   * Return the global ID of the low-level discussion that is used
   * in the current Discussion.
   */
  getGlobalID(): Bluebird.Thenable<palantiri.DiscussionGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.discussionData));
  }

	/**
   * Return the protocol used by this discussion.
   */
  getProtocol(): Bluebird.Thenable<string> {
    return Bluebird.try( () => {
      let globalid = palantiri.Id.asGlobalId(this.discussionData);
      return globalid.split(":",2)[0];  // The syntax is "protocol:localID"
    })
  }

	/**
   * Return true only if the current discussion and the one given as parameter
   * have the same globalID.
   */
  isTheSameAs(simpleDiscussion: SimpleDiscussion): Bluebird.Thenable<boolean> {
    return Bluebird.resolve(
      palantiri.Id.asGlobalId(this.discussionData) === palantiri.Id.asGlobalId(simpleDiscussion.discussionData)
    );
  }

	/**
   * Add the discussion given in parameter to the current one.
   * This adds the members of the given discussion to those of the current.
   * If a member is already in the current discussion, he won't be added.
   * It returns the current discussion to chain calls.
   */
  merge(discuss: SimpleDiscussion): Bluebird.Thenable<SimpleDiscussion> {
    let toAdd: {contact: ContactAccountInterface, id: palantiri.AccountGlobalId}[] = [];
    return Bluebird
      .resolve(discuss.getParticipants())
      .map((part: ContactAccountInterface) => {
        return part.getGlobalId()
          .then((id: palantiri.AccountGlobalId) => {
            return {contact: part, id: id};
          });
      })
      .then((contacts: {contact: ContactAccountInterface, id: palantiri.AccountGlobalId}[]) => {
        toAdd = contacts;
        return this.getParticipants();
      })
      .map((part: ContactAccountInterface) => {
        return part.getGlobalId();
      })
      .then((ids: palantiri.AccountGlobalId[]) => {
        return Bluebird.all(_.map(toAdd, (contact: {contact: ContactAccountInterface, id: palantiri.AccountGlobalId}) => {
          if(ids.indexOf(contact.id) === -1) {
            return this.addParticipant(contact.contact);
          }
          return this;
        }));
      })
      .thenReturn(this);
  }

  /**
   * Private: fetch the data about this discussion from the service
   */
  private getDiscussionInfo(): Bluebird<palantiri.Discussion> {
    return Bluebird.resolve((new UserAccount(this.discussionData.owner)).getOrCreateApi())
      .then((api: palantiri.Api) => {
        // TODO: fetch the real informations
        // return api.getDiscussionInfo(this.discussionReference);

        return Bluebird.resolve(this.discussionData);
      });
  }
}

export default SimpleDiscussion;
