import * as Bluebird from "bluebird";
import {DiscussionInterface} from "./discussion";
import {ContactAccountInterface} from "./contact-account";
import {UserAccountInterface} from "./user-account";
import {MessageInterface} from "./message";

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * It allows you to acceed to yout own Accounts, acceed to your
 * own Contacts, create Discussions with them, and so on.
 ***************************************************************/
// TODO: this needs to be reworked.
export interface UserInterface extends UserEmitter {
  accounts: UserAccountInterface[];  //  La liste des comptes connus de l'utilisateur.

  globalUsername: string;            //  Le nom complet de l'utilisateur.

  getOrCreateDiscussion(contactAccount: ContactAccountInterface): Bluebird<DiscussionInterface>;
  //  Permet de commencer une discussion avec un contact ou
	//  de recuperer une discussion existante, sur un compte
	//  utilisant un protocol specifique.

	getAllDiscussions(filter?: (discussion: DiscussionInterface) => boolean): Bluebird<DiscussionInterface[]>;
	//  Permet de recuperer toutes les Discussions de l'utilisateur :
	//  Celles pour chacun de ces comptes.
	//  Celles heterogenes.
	//  Si "filter" est precise, ne retourne que les Discussions pour
	//  lesquelles "filter" retourne vrai.

  // TODO: rename cross-local-account discussions as "meta-discussions" and normalize it everywhere ?
	getHeterogeneousDiscussions(filter?: (discussion: DiscussionInterface) => boolean): Bluebird<DiscussionInterface[]>;
	//  Retourne toutes les Discussions de l'utilisateur courant
	//  qui sont heterogenes.
	//  Cette methode est plus rapide que d'appeler getAllDiscussions
	//  et de filtrer les Discussions heterogenes.
	//  Si "filter" est precise, ne retourne que les Discussions pour
	//  lesquelles "filter" retourne vrai.

	leaveDiscussion(discussion: DiscussionInterface): Bluebird<UserInterface>;
	//  Permet de quitter la Discussion "discussion" et de ne plus
	//  recevoir les notifications associées.

	sendMessage(msg: MessageInterface, discussion: DiscussionInterface): Bluebird<UserInterface>;
	//  Envoie le Message "msg" dans la Discussion "discussion".
	//  Si un des participants a la Discussion ne peut pas recevoir
	//  le Message, "err" sera non nul.
	//  A noter qu'un message textuel sera toujours envoye,
	//  meme si le protocole utilise par le compte ne supporte pas
	//  le type de Message.

  getAccounts(protocols?: string[]): Bluebird<UserAccountInterface[]>;
  //  Retourne la liste des comptes de l'utilisateurs.
  //  Si "protocol" est precise, ne retourne que la lite des
  //  comptes de l'utilisateur courant qui utilise le
  //  protocole "protocol".

  addAccount(account: UserAccountInterface): Bluebird<UserInterface>;
  //  Ajoute un compte a l'utilisateur courant.

  removeAccount(account: UserAccountInterface): Bluebird<UserInterface>;
  //  Supprime un compte de l'utilisateur courant.
}

/**
 * TODO: add other events
 */
export interface UserEmitter extends NodeJS.EventEmitter {
  addListener(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  addListener(event: string, listener: Function): this;

  on(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  on(event: string, listener: Function): this;

  once(event: "message", listener: (eventObject?: MessageEvent) => any): this;
  once(event: string, listener: Function): this;

  emit(event: "message", eventObject: MessageEvent): boolean;
  emit(event: string, ...args: any[]): boolean;
}

export interface MessageEvent {
  // userAccount: UserAccountInterface,
  discussion: DiscussionInterface,
  message: MessageInterface
}

export default UserInterface;
