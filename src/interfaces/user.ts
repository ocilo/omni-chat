import * as Bluebird from "bluebird";
import {Contact} from "./contact";
import {Discussion} from "./discussion";
import {ContactAccount} from "./contact-account";
import {UserAccount} from "./user-account";
import {Message} from "./message";

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * It allows you to acceed to yout own Accounts, acceed to your
 * own Contacts, create Discussions with them, and so on.
 ***************************************************************/
export interface User {
  accounts: UserAccount[];  //  La liste des comptes connus de l'utilisateur.

  username: string;         //  Le nom complet de l'utilisateur.

  getOrCreateDiscussion(contactAccount: ContactAccount): Bluebird.Thenable<Discussion>;
  //  Permet de commencer une discussion avec un contact ou
	//  de recuperer une discussion existante, sur un compte
	//  utilisant un protocol specifique.

	getAllDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]>;
	//  Permet de recuperer toutes les Discussions de l'utilisateur :
	//  Celles pour chacun de ces comptes.
	//  Celles heterogenes.
	//  Si "filter" est precise, ne retourne que les Discussions pour
	//  lesquelles "filter" retourne vrai.

	getHeterogeneousDiscussions(filter?: (discussion: Discussion) => boolean): Bluebird.Thenable<Discussion[]>;
	//  Retourne toutes les Discussions de l'utilisateur courant
	//  qui sont heterogenes.
	//  Cette methode est plus rapide que d'appeler getAllDiscussions
	//  et de filtrer les Discussions heterogenes.
	//  Si "filter" est precise, ne retourne que les Discussions pour
	//  lesquelles "filter" retourne vrai.

	leaveDiscussion(discussion: Discussion): Bluebird.Thenable<User>;
	//  Permet de quitter la Discussion "discussion" et de ne plus
	//  recevoir les notifications associées.

	sendMessage(msg: Message, discussion: Discussion, callback?: (err: Error) => any): Bluebird.Thenable<User>;
	//  Envoie le Message "msg" dans la Discussion "discussion".
	//  Si un des participants a la Discussion ne peut pas recevoir
	//  le Message, "err" sera non nul.
	//  A noter qu'un message textuel sera toujours envoye,
	//  meme si le protocole utilise par le compte ne supporte pas
	//  le type de Message.

	getContacts(filter?: (contact: Contact) => boolean): Bluebird.Thenable<Contact[]>;
	//  Retourne la liste des contacts de l'utilisateur courant,
	//  c'est a dire ceux de tous ses comptes, et fusionnes
	//  lorsqu'il est avere que les comptes representent la
	//  meme personne.

	addContact(contact: Contact, callback? : (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User>;
	//  Ajoute un contact a l'utilisateur courant.

	removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): Bluebird.Thenable<User>;
	//  Supprime un contact de l'utilisateur courant.

  getAccounts(protocols?: string[]): Bluebird.Thenable<UserAccount[]>;
  //  Retourne la liste des comptes de l'utilisateurs.
  //  Si "protocol" est precise, ne retourne que la lite des
  //  comptes de l'utilisateur courant qui utilise le
  //  protocole "protocol".

  addAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User>;
  //  Ajoute un compte a l'utilisateur courant.

  removeAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): Bluebird.Thenable<User>;
  //  Supprime un compte de l'utilisateur courant.

	on(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User>;
	//  Permet d'enregistrer l'utilisateur courant en tant que
	//  consommateur de l'Event "eventname", envoye par les
	//  differentes Connections de ses comptes.
	//  A chaque fois que l'utilisateur courant recevra l'Event
	//  "eventname", il déclenchera la fonction "handler".

	once(eventname: string, handler: (...args: any[]) => any): Bluebird.Thenable<User>;
	//  Permet d'enregistrer l'utilisateur courant en tant que
	//  consommateur de l'Event "eventname", envoye par les
	//  differentes Connections de ses comptes.
	//  Lorsque l'utilisateur courant recevra l'Event "eventname",
	//  il déclenchera une seule fois la fonction "handler",
	//  puis ne surveillera plis l'Event "eventname".
}

export default User;
