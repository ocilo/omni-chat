import * as palantiri from "palantiri-interfaces";
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
   * Returns a global id for this discussion
   */
  getGlobalId(): Thenable<palantiri.MessageGlobalId>;

  /**
   * Synchronous version of getGlobalId
   */
  getGlobalIdSync(): palantiri.MessageGlobalId;

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
   * Return all the participants of the current Discussion,
   * accordingly to the options parameter.
   * @param options
   */
  getParticipants(options?: GetParticipantsOptions): Thenable<ContactAccountInterface[]>;

	/**
   * Add a member to the current Discussion.
   * Be careful, the behavior of this method will vary with implementations :
   * If this is sa single-protocol and single-account discussion,
   * it will throw an error if the contact is unknown.
   */
  addParticipant(contactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;

	/**
   * Remove a member from the current Discussion.
   * This depends of your rights for the current Discussion.
   * Be careful, the behavior of this method will vary with implementations :
   * If this is sa single-protocol and single-account discussion,
   * it will throw an error if the contact is unknown.
   */
  removeParticipants(contactAccount: ContactAccountInterface): Thenable<DiscussionInterface>;

  /**
   * Sends the message newMessage to the current discussion.
   * Returns then the sent Message, completed with informations
   * acquired after the send.
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
 * A passive object that represents the possible options
 * when we want to acquire the participants from a Discussion.
 */
export interface GetParticipantsOptions {
  maxParticipants?: number;
  filter?: (part: ContactAccountInterface) => boolean;
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
