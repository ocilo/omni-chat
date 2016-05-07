import {Thenable} from "bluebird";
import {ContactAccountInterface} from "./contact-account";
import {MessageInterface} from "./message";

/***************************************************************
 * Discussion is the only thing you can use to chat with
 * someone. It provides you methods to send a message, add and
 * remove participants, and so on.
 * This abstracts the concept of Discussion, and this will allow
 * us to provide two different types of Discussion :
 * mono-account and mono-protocol.
 * multi-accounts and multi-protocols.
 ***************************************************************/
export interface DiscussionInterface {

	/**
   * Return the name of the Discussion, if it exists.
   * If not, we will generate it.
   */
  getName(): Thenable<string>;

	/**
   * Return a string which represents the Discussion.
   */
  getDescription(): Thenable<string>;

	/**
   * Return true only if the current Discussion is
   * multi-accounts and multi-protocols.
   */
  isHeterogeneous(): Thenable<boolean>;

	/**
   * Return the creation date of the current Discussion.
   * This is very important for multi-accounts and multi-protocols Discussions.
   */
  getCreationDate(): Thenable<Date>;

	/**
   * Return all the message of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getMessages(options?: GetMessagesOptions): Thenable<MessageInterface[]>;

	/**
   * Add a member to the current Discussion.
   * Be careful, the behavior of this method will vary with implementations.
   * And the state of the current Object may vary too.
   * For example, trying to add an account using a different protocol that
   * the one currently used by a mono-protocol Discussion will probably return
   * an heterogeneous Discussion, so another implementation.
   * TODO : well, that's dangerous, but i like that.
   * @param contactAccount
   */
  addParticipant(contactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;

	/**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   * Be careful, the behavior of this method will vary with implementations.
   * For example, trying to remove all accounts using one of two protocols
   * used by the current multi-protocols Discussion will probably return
   * an homogeneous Discussion, so another implementation.
   * TODO : well, that's dangerous, but i like that.
   * @param contactAccount
   */
  removeParticipants(contactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;

	/**
   * Return the list of all the subdiscussions constituting the
   * current Discussion. Note that this is a mono-protcol and mono-account
   * Discussion, it will return a list of one item.
   */
  getSubdiscussions(): Thenable<DiscussionInterface[]>;

  /**
   * Sends the message newMessage to the discussion.
   * Returns then sent Message, completed with informations
   * acquired after the sends.
   */
  sendMessage(newMessage: NewMessage): Thenable<MessageInterface>;
}

/**
 * A passive object that represents the possible options
 * when we want to acquire the messages from a Discussion.
 */
export interface GetMessagesOptions {
  maxMessages: number;
  afterDate?: Date;
  filter?: (msg: MessageInterface) => boolean
}

/**
 * A passive basic object which represents a fresh message before
 * we send it in a Discussion.
 */
export interface NewMessage {
  body: string;
  date?: Date;
}

export default DiscussionInterface;
