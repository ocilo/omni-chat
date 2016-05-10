import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import {Incident} from "incident";
import {ContactAccountInterface} from "./interfaces/contact-account";
import {DiscussionInterface} from "./interfaces/discussion";
import {MessageInterface} from "./interfaces/message";
import {UserAccountInterface} from "./interfaces/user-account";
import {GetMessagesOptions, NewMessage} from "./interfaces/discussion";
import {SimpleMessage} from "./simple-message";

/**
 * This class is a high-level wrapper for a palantiri discussion
 * (mono-account, mono-driver) bound to a single account of a single user.
 */
export class SimpleDiscussion implements DiscussionInterface {
	/**
   * The account of the user who uses this Discussion.
   */
  private account: UserAccountInterface;

	/**
   * The low-level passive object representing the current Discussion.
   */
  private discussionData: palantiri.Discussion;

  constructor (account: UserAccountInterface, discussionData?: palantiri.Discussion) {
    this.account = account;
    this.discussionData = discussionData ? discussionData : null;
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
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:getMessages is not implemented"));

    // TODO: add .getMessages to palantiri api
    /*
      let palOptions: palantiri.Api.GetMessagesOptions;
      palOptions = {
        max: options.maxNumber,
        etc.
      };
      return this.account.getOrCreateApi()
        .then(api => api.getMessages(palOptions))
        .map(...) // wrap the palantiri messages in a higher-level object
        .filter(...);
    */
  }

  /**
   * Add a member to the current Discussion.
   * Be careful, the behavior of this method will vary with implementations.
   * And the state of the current Object may vary too.
   * For example, trying to add an account using a different protocol that
   * the one currently used by a mono-protocol Discussion will probably return
   * an heterogeneous Discussion, so another implementation.
   * TODO : well, that's dangerous, but i like that.
   */
  addParticipant(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:addParticipant is not implemented"));
  }

  /**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   * Be careful, the behavior of this method will vary with implementations.
   * For example, trying to remove all accounts using one of two protocols
   * used by the current multi-protocols Discussion will probably return
   * an homogeneous Discussion, so another implementation.
   * TODO : well, that's dangerous, but i like that.
   */
  removeParticipants(contactAccount: ContactAccountInterface): Bluebird<this> {
    return Bluebird.reject(new Incident("todo", "SimpleDiscussion:removeParticipants is not implemented"));
  }

  /**
   * Sends the message newMessage to the discussion.
   * Returns then sent Message, completed with informations
   * acquired after the sends.
   */
  sendMessage(newMessage: NewMessage): Bluebird<SimpleMessage> {
    return Bluebird.resolve(this.account.getOrCreateApi())
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
    return Bluebird.resolve(this.account);
  }

  /**
   * Private: fetch the data about this discussion from the service
   * @returns {Thenable<palantiri.Discussion>}
   */
  private getDiscussionInfo(): Bluebird<palantiri.Discussion> {
    return Bluebird.resolve(this.account.getOrCreateApi())
      .then((api: palantiri.Api) => {
        // TODO: fetch the real informations
        // return api.getDiscussionInfo(this.discussionReference);

        return Bluebird.resolve(this.discussionData);
      });
  }
}

export default SimpleDiscussion;
