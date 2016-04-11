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

/***************************************************************
 * Client is the entry point for the library.
 * Maintains the list of available proxies and connected users.
 * TODO : is last point still right ? If not, remove it
 ***************************************************************/
export class Client{
  proxies: Proxy[];   // Les proxys disponibles pour ce client
  users: User[];    // Les utilisateurs connectes a ce client

	// Retourne le premier proxy permettant d'utiliser
	// le protocole "protocol"
  getProxyFor(protocol: string): Promise<Proxy> {
  for(let i=0; i<this.proxies.length; i++){
    if(this.proxies[i].isCompatibleWith(protocol)){
    return Promise.resolve(this.proxies[i]);
    }
  }
  }
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
export interface Proxy{
  isCompatibleWith(protocol: string): boolean;
  //  Retourne vrai si le protocole protocol est compatible avec ce proxy.
  //  Protocol sera peut-etre encapsule dans une enum ou une struct
  //  par la suite.

  getContacts(account: Account): Promise<Contact[]>;
  //  Accede a la liste des contacts du compte Account,
  //  et les retourne sous forme de tableau de contacts.

  sendMessage(msg: Message, discussion: Discussion, callback?: (err: Error, succes: any) => any): void;
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
 * with him. Other participants coul be added through the
 * interface Discussion.
 ***************************************************************/
export interface Contact{
  accounts: Account[];  //  La liste des comptes connus de l'utilisateur
                        //  pour lesquels ce contact est le meme.

  fullname: string;     //  Le nom complet du contact

	nicknames: string[];  //  Les noms sous lesquels le contact est connu

	localID: number;      //  Permet de distinguer deux Contacts qui portent
												//  le meme nom
												//  N'est valide que pour une session donnée
												//  Pourra servir a fusionner des comptes
												//  et à identifier clairement un contact

  getAccounts(): Promise<Account[]>;
  //  Retourne la liste des comptes connus de l'utilisateur
  //  pour lesquels ce contact est le meme.

	mergeContacts(contact: Contact, callback?: (err: Error, succes: any) => any): void;
  // Fusionne les comptes du contact courant avec ceux du contact fourni
  // Le contact fournit devient une référence vers ce contact ci

	unmergeContacts(contact: Contact, callback?: (err: Error, succes: any) => any): void;
	// Defusionne les comptes du contact courant avec ceux du contact fourni

  addAccount(account: Account): Promise<any>;
	// Ajoute un compte au contact courant

  removeAccount(accout: Account): Promise<any>;
	// Supprime un compte du contact courant

  getOwner(): Contact;
	// TODO : C'est quoi ça ?
}

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * An user works quite like a Contact : you just have more
 * rights as an user (for example acceed to your own contacts).
 * So User will probably inherit from Contact later.
 * TODO: inherit or not ? If yes, what is the purpose of merge ?
 ***************************************************************/
export interface User {
	accounts: Account[];  //  La liste des comptes connus de l'utilisateur

	username: string;     //  Le nom complet de l'utilisateur

  getOrCreateDiscussion(contacts: Contact[]) : Promise<Discussion>;
  //  Permet de commencer une discussion avec un contact,
	//  ou de recuperer une discussion existante.
  //  C'est le seul moyen de communiquer avec quelqu'un.
  //  En cas de création, garanti que l'initiateur de la
	//  conversation est présent en tant que participant.

  leaveDiscussion(discussion: Discussion, callback?: (err: Error, succes: any) => any): void;
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

	addAccount(account: Account): Promise<any>;
	// Ajoute un compte a l'utilisateur courant

	removeAccount(accout: Account): Promise<any>;
	// Supprime un compte de l'utilisateur courant

  addContact(contact: Contact): Promise<any>;
	// Ajoute un contact a l'utilisateur courant

  removeContact(contact: Contact): Promise<any>;
	// Supprime un contact de l'utilisateur courant

  onDiscussionRequest(callback: (disc:Discussion) => any): User;
	// TODO : a quoi sert le retour ?

  onContactRequest(callback: (contact: Contact) => any): User;
	// TODO : a quoi sert le retour ?
}

/***************************************************************
 * Discussion is the only thing you can use to chat with someone.
 * It provides you methods to send a message, do something when
 * you receive a message and so on.
 ***************************************************************/
/***************************************************************
 * Petit probleme concernant le fonctionnement de Discusssion :
 * imaginons Bob et Boby utilisant chacun OmniChat et etant
 * chacun dans la liste des contacts de l'autre. Bob commence
 * une conversation avec Boby. Il possede donc un objet de type
 * Discussion. A quel moment l'objet Discussion de Boby est-il
 * cree ? Est-il partage avec celui de Bob ? Et si Bob etait sur
 * Facebook ?
 * Deuxieme petit probleme avec le fonctionnement de Discussion:
 * reprenons Bob et Boby tout deux sur Omnichat, avec le probleme
 * de la conversation regle en la partageant. La methode
 * onMessage(lambda) devient commune, et Boby ne peut plus faire
 * ce qu'il veut des messages de Bob, il doit faire comme Bob.
 * Reste donc a regler la question de comment une discussion est
 * creee depuis l'exterieur d'OmniChat, lorsque Bob n'a pas
 * l'initiative d'une Discussion avec un vilain utilisateur qui
 * n'utilise pas OmniChat.
 * Troisieme petit probleme avec le fonctionnement de Discussion:
 * lorsqu'on envoie un message aux membres de la discussion,
 * comment choisir le compte du contact sur lequel envoyer le
 * message ? Il ne faut pas spammer tout les comptes... Une
 * reponse se trouve peut-etre dans la description de
 * addParticipants(...).
 ***************************************************************/

export interface DiscussionAuthorization{
  write: boolean;
  talk: boolean;
  video: boolean;
  invite: boolean;
  kick: boolean;
  ban: boolean; // kick + interdiction de revenir
}

export interface Discussion{
  creationDate: Date;   // Date de creation de la conversatio
  name: String;     // Nom de la conversation
  isPrivate: boolean;

  getMessages(): Message[];
  //  Retourne une liste des messages echanges pendant la discussion.
  //  Equivalent a un espece de getHistory {dateMax, dateMin, nbMessages}.
  //  Un filtre pourra certainement etre applique par la suite,
  //  via utilisation de lambdas ou/et de hasmaps.

  // TODO: add filter
  // ex:
  //{
  //  protocols: string | string[]
  //  accounts: Account | Account[]
  //}
  sendMessage(author: Account, msg: Message): Promise<Message>;
  //  Envoie le message à tous les participants de la discussion.
  //  Devra sans doute faire appel a StaticProxy.sendMessage().
  //  Mais un probleme se pose : sur quel compte du contact envoyer
  //  le message ?
  sendText(author: Account, text: string): Promise<Message>;

  addParticipants(p: Contact[]): Promise<any>;
  //  Ajoute des participants a la conversation.
  //  Peut etre n'ajouter qu'un seul compte des contacts,
  //  et transformer la discussion en tant qu'agregation
  //  de comptes et non plus de Contacts.

  getParticipants(): Contact[];
  //  Retourne une liste des participants a la conversation.

  onMessage(callback: (msg: Message) => any): Discussion;
  //  Appelle la methode a executer lors de la reception du message.
  //  Le detection d'un message se fera sans doute via un ecouteur
  //  qui ecoutera... quoi ?

  getName(): string;
  //  Retourne le nom de la discussion.

  getDescription(): string;
  //  Retourne une description de la discussion.
  //  Reste a definir ce que doit etre cette description.

  getSettings(): any;
  //  Retourne tout les paramètres de la discussion, même spécifiques (map).
  //  Bien evidemment, nous ne pourrons pas tout traiter.
  //  Nous essayerons cependant de faire du mieux possible sans pour autant
  //  y passer des heures entieres.
}

/***************************************************************
 * Message is the object exchanged during a Discussion.
 * Examples of classes which can inherit from Message are :
 * TextMessage, ImageMessage, VideoMessage...
 ***************************************************************/
/***************************************************************
 * Un debat avait eu lieu concernant comment traiter les
 * messages. L'utilisation du polymorphisme reste la plus saine,
 * mais risque d'etre insuffisante pour certains cas.
 * L'utilisation de instanceof ou d'un equivalent deviendra
 * peut-etre necessaire. Il faudra definir ces cas.
 ***************************************************************/
export interface Message{
  getText(): string;
  //  Retourne une representation du message sous forme de String.
  //  Tout message (texte, image, autre fichier) doit avoir cette
  //  représentation pour toujours avoir quelque chose à afficher
  //  (erreur de chargement, etc).

  getCreationDate(): Date;
  //  Retourne la date de creation du message.

  getLastUpdateDate(): Date;
  //  Retourne la date de derniere modification du message.
  //  Cela ne vaut bien sur que si les messages sont editables,
  //  ce qui conduira peut-etre a supprimer cette methode
  //  de l'interface globale.

  getAuthor(): Account;
  //  Retourne l'auteur du message.

  getContent(): any;
  //  Renvoi un contenu plus pertinent.
  //  Chaque type de message devra implementer elle-meme cette methode.
}

/***************************************************************
 * Account is the representation of a chat account.
 * Examples of classes which can inherit from Account are :
 * IRCAccount, FacebookAccount... and OmniChatAccount.
 ***************************************************************/
/***************************************************************
 * La classe Account reste encore partiellement a definir.
 * Quelle methodes pourront etre appelees sur un compte ?
 ***************************************************************/
export interface Account{
  protocols: string;  //  Une representation du protocole de communication
            //  utilise par ce compte.
            //  Protocol sera peut-etre encapsule dans une enum ou une struct
            //  par la suite.
  data: any;      //  Les donnees du comptes. A definir

  createDiscussion(name: string): Promise<Discussion>;
}
