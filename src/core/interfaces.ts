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
 * TODO : is last point still right ? If not, remove it
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
 * TODO : use proxies as static methods ?
 ***************************************************************/
export interface Proxy {
	protocol: string;  // La liste des protocoles supportes par le proxy

  isCompatibleWith(protocol: string): boolean;
  //  Retourne vrai si le protocole protocol est compatible avec ce proxy.
  //  Protocol sera peut-etre encapsule dans une enum ou une struct
  //  par la suite.

	getOrCreateConnection(account: Account): Promise<any>;
	//  Cree une connexion au compte Account.
	//  TODO :  definir un template (interface) pour une connexion

  getContacts(account: Account): Promise<Contact[]>;
  //  Accede a la liste des contacts du compte Account,
  //  et les retourne sous forme de tableau de contacts.

	getDiscussions(account: Account, max?: number, filter?: (discuss: Discussion) => boolean): Promise<Discussion[]>;
	//  Accede a la liste des discussions du compte "account"
	//  et retourne jusqu'a "max" Discussions dans un tableau.
	//  Si filter est precise, ne retourne dans le tableau que les discussions
	//  pour lesquelles la fonction "filter" retourne true.

  sendMessage(msg: Message, discussion: Discussion, callback?: (err: Error, succesM: Message, succesD: Discussion) => any): void;
	//  Envoie le message "msg" dans la discussion "discussion"

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
  accounts: Account[];  //  La liste des comptes connus de l'utilisateur
                        //  pour lesquels ce contact est le meme.

  fullname: string;     //  Le nom complet du contact.

	nicknames: string[];  //  Les noms sous lesquels le contact est connu.

	localID: number;      //  Permet de distinguer deux Contacts qui portent
												//  le meme nom.
												//  N'est valide que pour une session donnée.
												//  Pourra servir a identifier clairement un contact.

  getAccounts(): Promise<Account[]>;
  //  Retourne la liste des comptes connus de l'utilisateur
  //  pour lesquels ce contact est le meme.

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

  addAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void;
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

  removeAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void;
	// Supprime un compte du contact courant.
	// Cette operation est differente de mergeContacts() dans le sens ou
	// on supprime un compte d'un certain type a un contact, mais que ce
	// contact reste le meme.
	// Exemple d'utilisation : un compte que le contact n'utilise plus.

  getOwner(): Contact;
	// TODO : C'est quoi ça ? Je pense que ca a pour vocation de trouver le Contact associe
	//        a un certain Account. Si c'est le cas, ca doit dependre de l'utilisateur,
	//        et du coup sa place est dans User.
}

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * An user works quite like a Contact : you just have more
 * rights as an user (for example acceed to your own contacts).
 ***************************************************************/
export interface User {
	accounts: Account[];  //  La liste des comptes connus de l'utilisateur

	username: string;     //  Le nom complet de l'utilisateur

  getOrCreateDiscussion(accounts: Account[]) : Promise<Discussion>;
  //  Permet de commencer une discussion avec un contact,
	//  ou de recuperer une discussion existante.
  //  C'est le seul moyen de communiquer avec quelqu'un.
  //  En cas de création, garanti que l'initiateur de la
	//  conversation est présent en tant que participant.
	//  TODO(Ruben) : this must be done by using proxy. So future me, go update Proxy !

  leaveDiscussion(discussion: Discussion, callback?: (err: Error, succes: Discussion) => any): void;
	//  Permet de quitter la discussion "discussion" et de ne plus
	//  recevoir les notifications associées.

  getAccounts(): Promise<Account[]>;
  //  Retourne la liste des comptes de l'utilisateurs.
  //  Ce comptes peuvent bien entendu etre de tout type :
  //  IRC, Skype, Facebook... mais aussi OmniChat (recursivite).
  //  Probablement une surcharge de celle de Contact.

  getContacts(): Promise<Contact[]>;
  //  Retourne la liste des contacts de l'utilisateur courant.
  //  Pour chaque compte lie a l'utilisateur,

	addAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void;
	// Ajoute un compte a l'utilisateur courant

	removeAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void;
	// Supprime un compte de l'utilisateur courant

  addContact(contact: Contact, callback? : (err: Error, succes: Account[]) => any): void;
	// Ajoute un contact a l'utilisateur courant

  removeContact(contact: Contact, callback?: (err: Error, succes: Account[]) => any): void;
	// Supprime un contact de l'utilisateur courant

  onDiscussionRequest(callback: (disc:Discussion) => any): User;
	// TODO : a quoi sert le retour ?

  onContactRequest(callback: (contact: Contact) => any): User;
	// TODO : a quoi sert le retour ?
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
  creationDate: Date;       // Date de creation de la conversation

  name: string;             // Nom de la conversation

  isPrivate: boolean;       // Privacite de la conversation

	participants: Account[];  // Liste des participants a la conversation
	// TODO : is owner implicit ? Should he be in participants ?

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Promise<Message[]>;
  //  Retourne une liste des maxMessages derniers messages echanges pendant la discussion,
	//  au plus : s'il y en a moins, alors retourne le nombre de messages disponibles.
	//  Si afterDate est precise, ne retourne que les messages posterieurs a afterDate.
  //  Si filter est precise, ne retourne que les messages dont l'application de la fonction
	//  filter ne retourne true.

  sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): void;
  //  Envoie le message "msg" a tous les participants de la discussion.
  //  Cette methode fait appel au proxy pour chaque Account de "participants".
	//  TODO : le retour par Promise<Message> servait a quoi ?

  addParticipants(p: Account[], callback?: (err: Error, succes: Account[]) => any): void;
  //  Ajoute des participants a la conversation

  getParticipants(): Promise<Contact[]>;
  //  Retourne une liste des participants a la conversation.

  onMessage(callback: (msg: Message) => any): Promise<Discussion>;
  //  Appelle la methode a executer lors de la reception du message.
  //  TODO : callback ET retour par promesse ?

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
 * Message is the object exchanged during a Discussion.
 * Examples of classes which can inherit from Message are :
 * TextMessage, ImageMessage, VideoMessage...
 ***************************************************************/
export interface Message {
	editable: boolean;    // Vrai si le message est editable

	author: Account;      // L'auteur du message.
                        // Ce ne peut pas etre un objet de type
                        // Contact. L'association entre Account
												// et Contact se fera plus tard, car peut
												// dependre de l'utilisateur.

	body: string;         // Une representation sous forme de string
												// du message.

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

  getAuthor(): Promise<Account>;
  //  Retourne l'auteur du message.

  getContent(): Promise<any>;
  //  Renvoi un contenu plus pertinent.
  //  Chaque type de message devra implementer elle-meme cette methode.
}

/***************************************************************
 * Account is the representation of a chat account.
 * Examples of classes which can inherit from Account are :
 * IRCAccount, FacebookAccount... and OmniChatAccount.
 ***************************************************************/
export interface Account {
	protocol: string;       //  Une representation du protocole de communication
		                      //  utilise par ce compte.
							            //  Protocol sera peut-etre encapsule dans une enum ou une struct
							            //  par la suite.

  data: Map<string, any>; //  Les donnees du compte.
													// TODO : ma map est-elle bonne ?

	nickName: string;       //  Le nom sous lequel le proprietaire du compte se fait connaitre.

	// NB : Account n'apparait presque plus que comme une couche d'abstraction pratique.
	//      TODO : Tu vois des methodes qui lui sont specifiques ? onReceptionMessage peut-être ?
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