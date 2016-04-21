import * as Bluebird from "bluebird";
import {UserAccount} from "./user-account";
import {GroupAccount} from "./group-account";
import {Contact} from "./contact";
import {Discussion} from "./discussion";
import {EventEmitter} from "events";

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * An user works quite like a Contact : you just have more
 * rights as an user (for example acceed to your own contacts).
 ***************************************************************/
export interface User extends EventEmitter{
  accounts: UserAccount[];  //  La liste des comptes connus de l'utilisateur

  username: string;         //  Le nom complet de l'utilisateur

  getOrCreateDiscussion(accounts: GroupAccount[]) : Bluebird.Thenable<Discussion>;
  //  Permet de commencer une discussion avec un contact,
  //  ou de recuperer une discussion existante.
  //  C'est le seul moyen de communiquer avec quelqu'un.
  //  En cas de création, garanti que l'initiateur de la
  //  conversation est present en tant que participant.

  leaveDiscussion(discussion: Discussion): Bluebird.Thenable<User>;
  //  Permet de quitter la discussion "discussion" et de ne plus
  //  recevoir les notifications associées.

  getAccounts(protocols?: string[]): Bluebird.Thenable<UserAccount[]>;
  //  Retourne la liste des comptes de l'utilisateurs.
  //  Si "protocol" est precise, ne retourne que la lite des
  //  comptes de l'utilisateur courant qui utilise le
  //  protocole "protocol".
  //  Ce comptes peuvent bien entendu etre de tout type :
  //  IRC, Skype, Facebook... mais aussi OmniChat (recursivite).

  getContacts(): Bluebird.Thenable<Contact[]>;
  //  Retourne la liste des contacts de l'utilisateur courant.
  //  Pour chaque compte lie a l'utilisateur,

  addAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User>;
  //  Ajoute un compte a l'utilisateur courant

  removeAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User>;
  //  Supprime un compte de l'utilisateur courant

  addContact(contact: Contact, callback? : (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User>;
  //  Ajoute un contact a l'utilisateur courant

  removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User>;
  //  Supprime un contact de l'utilisateur courant

	connectionsOn(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User>;
	//  Allows all current Connections of all accounts to react
	//  to the event "event" by triggering the function "handler".
	//  Note that this will take effect only on the connections
	//  already established.

	connectionsOnce(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User>;
	//  Allows all current Connections of all accounts to react
	//  to the event "event" by triggering the function "handler",
	//  but only once.
	//  Note that this will take effect only on the connections
	//  already established.

	removeConnectionsListener(event: string, handler: (...args: any[]) => any): Bluebird.Thenable<User>;
	//  Remove all current listeners for the event "event" which
	//  trigger "handler" of each current connections of all accounts.
	//  Note that this will take effect only on the connections
	//  already established.

	connectionsSetMaxListeners(n: number): Bluebird.Thenable<User>;
	//  Set the maximum number of listeners that each Connection
	//  of all accounts could use.
	//  Note that this will take effect only on the connections
	//  already established.
}
