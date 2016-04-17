/***************************************************************
 ***************************************************************
 *          OMNICHAT - Interfaces
 *
 *  Some parts of this documents will probably become a more
 *  official wiki later on. That's why it's written mostly in
 *  english. The french parts are for developpers only.
 *
 *  This file is migrating to an other status : official
 *  interfaces of omni-chat library.
 *
 ***************************************************************
 ***************************************************************/

import * as Promise from 'bluebird';
import {EventEmitter} from 'events';

/***************************************************************
 * Client is the entry point for the library.
 * Maintains the list of available proxies and connected users.
 ***************************************************************/
export interface Client {
	drivers: Proxy[];   // Les proxys disponibles pour ce client

	users: User[];      // Les utilisateurs connectes a ce client

	getProxyFor(protocol: string): Promise<Proxy>;
	//  Retourne le premier proxy permettant d'utiliser
	//  le protocole "protocol".

	addDriver(driver: Proxy, callback?: (err: Error, drivers: Proxy[]) => any): Client;
	//  Ajoute le proxy "driver" a la liste des drivers supportes
	//  par ce client, si le client ne possede pas deja un proxy
	//  qui gere le meme protocole que "driver".
	//  Sinon, err sera non nul.

	removeDriversFor(protocol: string, callback?: (err: Error, drivers: Proxy[]) => any): Client;
	//  Supprime tout les drivers connus du client qui supportent
	//  le protocole "protocol".
	//  Ne fait rien si aucun des drivers connus ne supporte
	//  le protocole "protocol". Dans ce cas, err sera non nul.

	addUser(user: User, callback?: (err: Error, users: User[]) => any): Client;
	//  Ajoute l'utilisateur "user" a la liste des utilisateurs
	//  qui utilisent le Client courant, si "user" ne fait pas
	//  deja partie de ceux qui utilisent ce Client.
	//  Sinon, err sera non nul.

	removeUser(user: User, callback?: (err: Error, users: User[]) => any): Client;
	//  Supprime l'utilisateur "user" de la liste des utilisateurs
	//  qui utilise le Client courant, si "user" faisait deja
	//  partie de la liste.
	//  Sinon, ne fait rien , et err sera non nul.
}

/***************************************************************
 * Proxies are specific ways to connect to an account.
 * For example, sending a message to someone using IRC won't be
 * done the same way than to someone using facebook.
 * This imply that creating a new module (i.e to allow OmniChat
 * to communicate with other accounts) devs must create a new
 * proxy too.
 ***************************************************************/
export interface Proxy {
	protocol: string;       //  La liste des protocoles supportes par le proxy
													//  Varie selon l'implementation de l'interface.

	connection: Connection; //  Une connection, existante ou non, allumee ou non,
													//  etablie entre l'utilisateur et le service desire

  isCompatibleWith(protocol: string): boolean;
  //  Retourne vrai si le protocole protocol est compatible avec ce proxy.
  //  Protocol sera peut-etre encapsule dans une enum ou une struct
  //  par la suite.

	getOrCreateConnection(account: UserAccount): Promise<Connection>;
	//  Cree une connexion au compte "account".
	//  Si l'objet connection existe mais n'est pas actif,
	//  i.e. il y a eu une deconnexion, une tentative de
	//  reconnexion sera faite. Ceci peut se traduire par un nouvel
	//  objet connection.

  getContacts(account: UserAccount): Promise<Contact[]>;
  //  Accede a la liste des contacts du compte "account",
  //  et les retourne sous forme de tableau de contacts.

	getDiscussions(account: UserAccount, max?: number, filter?: (discuss: Discussion) => boolean): Promise<Discussion[]>;
	//  Accede a la liste des discussions du compte "account"
	//  et retourne jusqu'a "max" Discussions dans un tableau.
	//  Si filter est precise, ne retourne dans le tableau que les discussions
	//  pour lesquelles la fonction "filter" retourne true.

  sendMessage(msg: Message, recipient: ContactAccount, callback?: (err: Error, succesM: Message) => any): void;
	//  Envoie le message "msg" au destinataire "recipient".
	//  Si le message ne peut pas etre envoye,
	//  err sera non nul.

}

// A NOTER :  On pourrait implementer uniquement certaines methodes en faisant
//        une implementation implicite : on ne declare pas la classe comme
//        "implements ...", mais on redefinie uniquement les methodes qui nous
//        interessent. Le compilo TypeScript comprendra alors que la classe
//        implemente tout de meme l'interface en question.
//        Ce fonctionnement est toutefois DANGEREUX : que se passe-t-il si
//        on tente d'appeler une methode de maniere polymorphe (par exemple
//        une methode statique sur l'un des constructeurs du tableau proxies
//        de la classe Client, mais que celle-ci n'est pas defini pour la classe
//        en question) ?


/***************************************************************
 * Contact is the representation of someone you can chat with.
 * A contact may be the same for differents accounts. That's why
 * it contains a list of accounts : those were the contact is
 * identified as the same as in the others.
 * The only way to tchat with someone is to start a discussion
 * with him. Other participants could be added through the
 * interface Discussion.
 ***************************************************************/
export interface Contact{
  accounts: ContactAccount[]; //  La liste des comptes connus de l'utilisateur
                              //  pour lesquels ce contact est le meme.

  fullname: string;           //  Le nom complet du contact.

	nicknames: string[];        //  Les noms sous lesquels le contact est connu.
															//  Ne contient que les noms present pour les
															//  differents comptes connus.

  getAccounts(): Promise<ContactAccount[]>;
  //  Retourne la liste des comptes connus de l'utilisateur
  //  pour lesquels ce contact est le meme.

	getNicknames(): string[];
	//  Retourne la liste des surnoms connus du contact courant.

	getPrincipalName(): string;
	//  Retourne la valeur du champ fullname.

	setPrincipalName(newPrincipalName: string): void;
	//  Met a jour le champ "fullname" du contact courant.
	//  Ne modifie pas nicknames.

	mergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Contact;
  // Fusionne les comptes du contact courant avec ceux du contact fourni.
  // La gestion du contact fourni apres cette methode est a la charge de l'appelant.
	// Retourne le contact courrant apres eventuelles modifications.

	unmergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Contact;
	// Defusionne les comptes du contact courant afin de former deux contacts :
	// Le contact fourni.
	// Le contact courant MINUS le contact fourni.
	// Ne fait rien si l'operation unmerge est impossible
	// (i.e. l'un des deux contacts ressultant est nul, ou si "contact" ne fait pas
	// partie du contact courant).
	// La gestion du contact fourni apres cette methode est a la charge de l'appelant.
	// Retourne le contact courrant apres eventuelles modifications.

  addAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): void;
	// Ajoute un compte au contact courant.
	// Cette operation est differente de mergeContacts() dans le sens ou
	// on rajoute un compte d'un certain type a un contact, mais que ce
	// compte n'etait pas connu a travers les comptes de l'tilisateur
	// connecte. C'est une operation "manuelle".
	// Lorsque cela est possible, ce contact va etre rajoute a la liste des
	// contact sur un des comptes de l'utilisateur. L'utilisateur aura donc
	// acces a ce contact par la suite meme sans passer par OmniChat.
	// Cette operation necessite que l'utilisateur se serve d'un client qui
	// supporte le protocole utilise par le compte "account".

  removeAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): void;
	// Supprime un compte du contact courant.
	// Cette operation est differente de mergeContacts() dans le sens ou
	// on supprime un compte d'un certain type a un contact, mais que ce
	// contact reste le meme.
	// Exemple d'utilisation : un compte que le contact n'utilise plus.
}

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * An user works quite like a Contact : you just have more
 * rights as an user (for example acceed to your own contacts).
 ***************************************************************/
export interface User {
	accounts: UserAccount[];  //  La liste des comptes connus de l'utilisateur

	username: string;         //  Le nom complet de l'utilisateur

  getOrCreateDiscussion(accounts: ContactAccount[]) : Promise<Discussion>;
  //  Permet de commencer une discussion avec un contact,
	//  ou de recuperer une discussion existante.
  //  C'est le seul moyen de communiquer avec quelqu'un.
  //  En cas de création, garanti que l'initiateur de la
	//  conversation est présent en tant que participant.

  leaveDiscussion(discussion: Discussion, callback?: (err: Error, succes: Discussion) => any): void;
	//  Permet de quitter la discussion "discussion" et de ne plus
	//  recevoir les notifications associées.

  getAccounts(): Promise<UserAccount[]>;
  //  Retourne la liste des comptes de l'utilisateurs.
  //  Ce comptes peuvent bien entendu etre de tout type :
  //  IRC, Skype, Facebook... mais aussi OmniChat (recursivite).
  //  Probablement une surcharge de celle de Contact.

  getContacts(): Promise<Contact[]>;
  //  Retourne la liste des contacts de l'utilisateur courant.
  //  Pour chaque compte lie a l'utilisateur,

	addAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): void;
	// Ajoute un compte a l'utilisateur courant

	removeAccount(account: UserAccount, callback? : (err: Error, succes: UserAccount[]) => any): void;
	// Supprime un compte de l'utilisateur courant

  addContact(contact: Contact, callback? : (err: Error, succes: Contact[]) => any): void;
	// Ajoute un contact a l'utilisateur courant

  removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void;
	// Supprime un contact de l'utilisateur courant

  onDiscussionRequest(callback: (disc: Discussion) => any): void;
  onContactRequest(callback: (contact: Contact) => any): void;
	// TODO : i'm not sure about how these two methods are supposed to work
}

/***************************************************************
 * DiscussionAuthorization represent all the right you can have
 * in a discussion.
 ***************************************************************/
export interface DiscussionAuthorization{
  write: boolean;   // Right to write
  talk: boolean;    // Right to use microphone
  video: boolean;   // Right to use camera
  invite: boolean;  // Right to invite other peoples
  kick: boolean;    // Right to kick someone
  ban: boolean;     // Right to kick + prevent someone from coming back
}

/***************************************************************
 * Discussion is the only thing you can use to chat with someone.
 * It provides you methods to send a message, do something when
 * you receive a message and so on.
 ***************************************************************/
export interface Discussion {
  creationDate: Date;             // Date de creation de la conversation

  name: string;                   // Nom de la conversation

	description: string;            // Une description brève de la discussion,
																	// sous forme textuelle.

  isPrivate: boolean;             // Privacite de la conversation

	participants: ContactAccount[]; // Liste des participants a la conversation.
																	// L'utilisateur n'en fait pas partie.

	owner: User;                    // L'utilisateur d'Omni-Chat qui utilise
																	// cette discussion.

	settings: Map<string, any>;     // La liste des autres parametres de la discussion,
																	// meme specifiques.
																	// Cela permet aux implementations de travailler
																	// avec plus de donnees.

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Promise<Message[]>;
  //  Retourne une liste des maxMessages derniers messages echanges pendant la discussion,
	//  au plus : s'il y en a moins, alors retourne le nombre de messages disponibles.
	//  Si afterDate est precise, ne retourne que les messages posterieurs a afterDate.
  //  Si filter est precise, ne retourne que les messages dont l'application de la fonction
	//  filter ne retourne true.

  sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): void;
  //  Envoie le message "msg" a tous les participants de la discussion.
  //  Cette methode fait appel au proxy pour chaque Account de "participants".

  addParticipants(p: ContactAccount[], callback?: (err: Error, succes: ContactAccount[]) => any): void;
  //  Ajoute des participants a la conversation

  getParticipants(): Promise<ContactAccount[]>;
  //  Retourne une liste des participants a la conversation.

  onMessage(callback: (msg: Message) => any): Promise<Discussion>;
  //  Appelle la methode a executer lors de la reception du message.
  //  TODO : callback ET retour par promesse ?
	//  TODO : i'm not sure about how this method is supposed to work.

  getName(): Promise<string>;
  //  Retourne le nom de la discussion.

  getDescription(): Promise<string>;
  //  Retourne une description de la discussion.

  getSettings(): Promise<Map<string, any>>;
  //  Retourne tout les paramètres de la discussion, même spécifiques (map).
  //  Bien evidemment, nous ne pourrons pas tout traiter.
  //  Nous essayerons cependant de faire du mieux possible sans pour autant
  //  y passer des heures entieres.
	//  TODO : ma map est-elle bonne ?
}

/***************************************************************
 * MSG_FLAG constants are flags that are used to help us sending
 * messages with different protocols (with Proxies).
 * Whatever the messages content, text will always be send,
 * even if the message does not contain any text. So every
 * protocols will always be able to send something.
 ***************************************************************/
export const MSG_FLAG_TXT = 0x0001;   //  The message contains text
export const MSG_FLAG_IMG = 0x0002;   //  The message contains picture(s)
export const MSG_FLAG_VID = 0x0004;   //  The message contains video(s)
export const MSG_FLAG_FIL = 0x0008;   //  The message contains other file(s)
export const MSG_FLAG_EDI = 0x0010;   //  The message is editable

/***************************************************************
 * Message is the object exchanged during a Discussion.
 * Examples of classes which can inherit from Message are :
 * TextMessage, ImageMessage, VideoMessage...
 ***************************************************************/
export interface Message {
	author: ContactAccount | UserAccount; // L'auteur du message.
								                        // Ce ne peut pas etre un objet de type
								                        // Contact. L'association entre ContactAccount
																				// et Contact se fera plus tard, car peut
																				// dependre de l'utilisateur.

	body: string;         // Une representation sous forme de string
												// du message.

	content: any;         // Le contenu du message.
												// Si le message contient uniquement du texte,
												// body et content contiennent la meme string.

	flags: number;        // Les flags du message.

	creationDate: Date;   // La date de creation du message,
												// si elle est disponible.

	lastUpdated: Date;    // La date de derniere modification
												// du message, si disponible.

  getText(): Promise<string>;
  //  Retourne une representation du message sous forme de String.
  //  Tout message (texte, image, autre fichier) doit avoir cette
  //  représentation pour toujours avoir quelque chose à afficher
  //  (erreur de chargement, etc).

  getCreationDate(): Promise<Date>;
  //  Retourne la date de creation du message.

  getLastUpdateDate(): Promise<Date>;
  //  Retourne la date de derniere modification du message.
  //  Cela ne vaut bien sur que si les messages sont editables,
  //  ce qui conduira peut-etre a supprimer cette methode
  //  de l'interface globale.

  getAuthor(): Promise<ContactAccount | UserAccount>;
  //  Retourne l'auteur du message.

  getContent(): Promise<any>;
  //  Renvoi un contenu plus pertinent.
  //  Chaque type de message devra implementer elle-meme cette methode.

	getFlags(): Promise<number>;
	//  Retourne les flags du message.

	isEditable(): boolean;
	//  Retourne vrai si et seulement si le message courant est editable,
	//  i.e. le flag MSG_FLAG_EDI est present.
}

/***************************************************************
 * UserAccount represente one account used by an user of
 * Omni-Chat. This user can use several accounts at the same
 * time : that's the reason why Omni-Chat was created.
 * UserAccount is totally DIFFERENT from ContactAccount. An user
 * can plenty acceed to all his accounts, and do (almost)
 * everything he can do by using directly his accounts, without
 * using Omni-Chat.
 ***************************************************************/
export interface UserAccount {
	username: string;       //  Le nom sous lequel peut se connecter l'utilisateur.

	driver: Proxy;          //  Le pilote permettant d'acceder a ce compte.

  data: Map<string, any>; //  Les autres donnees du compte.
													//  Permet aux implementations de travailler avec
													//  plus de details.
													// TODO : ma map est-elle bonne ?

	getContacts(): Promise<Contact[]>;
	//  Accede a la liste des contacts du compte courant,
	//  et les retourne sous forme de tableau de contacts.

	getDiscussions(max?: number, filter?: (discuss: Discussion) => boolean): Promise<Discussion[]>;
	//  Accede a la liste des discussions du compte courant
	//  et retourne jusqu'a "max" Discussions dans un tableau.
	//  Si filter est precise, ne retourne dans le tableau que les discussions
	//  pour lesquelles la fonction "filter" retourne true.

	getOrCreateConnection(): Promise<Connection>;
	//  Connecte le compte courant, ou recupere la connexion existante.
	//  Si la connexion n'existait pas, elle sera cree et directement accessible,
	//  sauf erreur.

	sendMessageTo(recipient: ContactAccount, msg: Message, callback?: (err: Error, succes: Message) => any): void;
	//  Envoie le message "msg" au contact "recipient".
	//  Si le message ne peut pas etre envoye, err sera non nul.
}

/***************************************************************
 * UserAccount represente one account used by a Contact of one
 * user of Omni-Chat. This is just an username associated with
 * a protocol through which the user can send messages.
 * ContactAccount is totally DIFFERENT from UserAccount. An user
 * can not acceed to his contacts accounts. All he wants is to
 * send messages to them, so all he needs to know is how to
 * identify them and how to communicate with them.
 ***************************************************************/
export interface ContactAccount {
	contactName: string;    //  Le nom sous lequel se fait connaitre
													//  le contact.

	protocol: string;       //  Le protocole associe a ce compte.
}

/***************************************************************
 * OChatEmitter is the object that send Events to Connections.
 * You can handle any sort of Events by using .on().
 * You can send any Event by using .emit(). Events for which
 * there is no known handler will be ignored.
 ***************************************************************/
export interface OChatEmitter extends EventEmitter {
	// Empty for the moment
}

/***************************************************************
 * Listener represent a function attached to an Event.
 * When the event is triggered, the associated handler is fired.
 * This is just a structure wich helps us to manage events.
 ***************************************************************/
export interface Listener {
	event: string;                    //  Le nom de l'event surveille.

	handler: (...args: any[]) => any; //  La fonction associee a l'event.
}

/***************************************************************
 * Connection represents a connection to a certain type of
 * Account. It can establish and maintain a link between you and
 * the Account you want be connected to, but it can also turn it
 * off when you're done. It also allows you to add and remove
 * some events listeners to precise what you want your
 * connection to do.
 ***************************************************************/
export interface Connection {
	emitter: OChatEmitter;  //  The emitter for this connection.

	connected: boolean;     //  The actual state of this connection.
													//  If it's already connected, it's true,
													//  and false otherwise.

	listeners: Listener[];  //  The list of all know listeners for
													//  this connection.

	getAllEventListeners(event?: string): Promise<Listener[]>;
	//  Return all the known listeners for the current connection,
	//  or all the listeners know for the event "event".

	addEventListener(listener: Listener, callback?: (err: Error, succes: Listener[]) => any): void;
	//  After this call, whenever the event "eventName" is emitted,
	//  the function "handler" will be tiggered.
	//  Note that you can have several handlers for the same event.

	removeEventListener(listener: Listener, callback?: (err: Error, succes: Listener[]) => any): void;
	//  After this call, the function "handler" won't be triggered anymore
	//  whenever "eventName" is emitted.
	//  If "handler" was the last existing handler for "eventName",
	//  after this call "eventName" will be ignored.
	//  Note that other handlers won't be deleted by this method.

	removeAllEventListeners(eventNames?: string[], callback?: (err: Error) => any): void;
	//  Remove all know events listeners for the current Connection,
	//  or all those in "eventNames".
	//  Note that this is generally a bad practice, since the listeners
	//  are generally added elsewhere in the code.

	dispatchEvent(eventName: string, ...parameters: any[]): void;
	//  Connections are like tubes between you and the service you want to acces.
	//  Nothing can cross the tube, but the connection is able to react to events.
	//  By calling this method, the connection will be aware that an event
	//  has occurred, and will adopt the behavior wanted. This behavior is of
	//  course the one specified by the existsing handler(s) for "eventName".
	//  If no handlers are specified for "eventName", the event will be ignored.
}
