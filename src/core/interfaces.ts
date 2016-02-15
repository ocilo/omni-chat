/***************************************************************
 ***************************************************************
 *                    OMNICHAT - Interfaces
 *
 *  Disclaimer :    This document is NOT part of the OmniChat
 *                  sources files. This is just a brainstorming
 *                  about how to construct OmniChat and an help
 *                  to specifie wich interfaces OmniChat library
 *                  provides to users.
 *
 *  This document were created to help developpers to specify
 *  most of the interfaces that OmniChat library will provides
 *  to users. However, somes interfaces will be shown as classes
 *  and some methods will show a small body. This is just in
 *  order to help us to have a bigger understanding of the way
 *  that the library will work.
 *
 *  Some parts of this documents will probably become a more
 *  official wiki later on. That's why it's written mostly in
 *  english. The french parts are for developpers only.
 *
 ***************************************************************
 ***************************************************************/


/***************************************************************
 * Client is the entry point for the library.
 * Maintains the list of available proxies and connected users.
 ***************************************************************/
/***************************************************************
 * Le tableau proxies est en fait un tableau de constructeurs
 * de proxy : un pour chaque classe XXXProxy implementant
 * l'interface de StaticProxy et que le client est capable
 * de gerer.
 * Plus de details sur les proxys dans l'interface en question.
 ***************************************************************/
export class Client{
  proxies: Proxy[];   // Les proxys disponibles pour ce client
  users: User[];            // Les utilisateurs connectes a ce client

  //    useProxy(p: Proxy);
  //    Cette methode est commentee : cela signifie que son fonctionnement
  //    n'est pas encore clair, ou qu'elle sera supprimee.

  getProxyFor(protocol: string): Proxy{
    //    Retourne le premier constructeur de de proxy dont la classe
    //    sera compatible avec le protocole de communication protocol.
    //    Protocol sera peut-etre encapsule dans une enum ou une struct
    //    par la suite.
    for(let i=0; i<this.proxies.length; i++){
      if(this.proxies[i].isCompatibleWith(protocol)){
        return this.proxies[i];
      }
    }
  }
}

/***************************************************************
 * Proxies are specific ways to connect to an account.
 * For example, send a message to someone using IRC won't be
 * done than for someone using facebook.
 * This imply that creating a new module (i.e to allow OmniChat
 * to communicate with other accounts) devs must create a new
 * proxy too.
 * In the way we thought about it, a proxy must not be
 * instanciate to do some actions. It just exists.
 * So the implemented classes will probably define these methods
 * as static (impossible to do in an interface).
 ***************************************************************/
/***************************************************************
 * Cette interface est probablement incomplete.
 * A en croire le corps desormais vide de la seconde interface
 * de proxy, Proxy, toutes les methodes des proxys seront
 * statiques. C'est pour cela que le tableau de proxys de Client
 * est un tableau de constructeurs : on pourra appeler les
 * methodes de classe dessus.
 * En revanche, cela ne facilite pas la comprehension du code (et
 * en particulier pour les eventuels devs qui voudront rajouter
 * un module : que se passera-t-il s'ils ne creent pas une classe
 * proxy en declarant les methodes statiques ? Car pour le
 * moment, rien ne les empeche de le faire).
 * Separer les interfaces en deux parties - statique etc
 * d'instance - est toutefois une pratique tres courante.
 ***************************************************************/
export interface Proxy{
  isCompatibleWith(protocol: string): boolean;
  //    Retourne vrai si le protocole protocol est compatible avec ce proxy.
  //    Protocol sera peut-etre encapsule dans une enum ou une struct
  //    par la suite.

  getContacts(account: Account): Contact[];
  //    Accede a la liste des contacts du compte Account,
  //    et les retourne sous forme de tableau de contacts.
  //

  sendMessage(msg: Message, discussion: Discussion, target: Contact): any;
}
//  interface Proxy{}   //  Cette interface est commentee : cela signifie que son fonctionnement
//  n'est pas encore clair, ou qu'elle sera supprimee.


// A NOTER :    On pourrait implementer uniquement certaines methodes en faisant
//              une implementation implicite : on ne declare pas la classe comme
//              "implements ...", mais on redefinie uniquement les methodes qui nous
//              interessent. Le compilo TypeScript comprendra alors que la classe
//              implemente tout de meme l'interface en question.
//              Ce fonctionnement est toutefois DANGEREUX : que se passe-t-il si
//              on tente d'appeler une methode de maniere polymorphe (par exemple
//              une methode statique sur l'un des constructeurs du tableau proxies
//              de la classe Client, mais que celle-ci n'est pas defini pour la classe
//              en question) ?


/***************************************************************
 * Contact is the representation of someone you can chat with.
 * A contact may be the same for differents accounts. That's why
 * it contains a list of accounts : those were the contact is
 * identified as the same as in the others.
 ***************************************************************/
/***************************************************************
 * La seule maniere de discuter avec un contact et de commencer
 * une discussion avec lui : creer un objet Discussion.
 * Des participants a la discussion pourront etre ajoutes via
 * l'interface de Discussion. On pourrait eventuellement definir
 * une methode addToDiscussion(d : Discussion); ici.
 * En revanche, le fait de pouvoir creer une discussion ici
 * commence a faire penser au pattern factory. Il serait peut
 * etre interessant de creuser cette branche et d'eventuellement
 * se reposer completement sur ce pattern.
 ***************************************************************/
export interface Contact{
  accounts: Account[];  //  La liste des comptes connus de l'utilisateur
                        //  pour lesquels ce contact est le meme.
  // A NOTER :    ce sont les comptes du contact qui sont connus
  //              de l'utiliateurs, ou les comptes de l'utilisateur
  //              qui connaissent ce contact sous differents pseudos ?

  name: string;         //  Le nom du contact
  _id: any;             //  Un eventuel identifiant

  getAccounts(): Account[];
  //    Retourne la liste des comptes connus de l'utilisateur
  //    pour lesquels ce contact est le meme.

  // Fusionne les comptes du contact courant avec les ceux du contact fourni
  // Le contact fournit devient une référence vers ce contact ci

  // TODO: Be able to undo the merge
  addAccount(account: Account): any;

  removeAccount(accout: Account): any;

  getOwner(): Contact;
}

/***************************************************************
 * User is the representation of someone connected with OmniChat.
 * An user works quite like a Contact : you just have more
 * rights as an user (for example acceed to your own contacts).
 * So User will probably inherit from Contact.
 ***************************************************************/
/***************************************************************
 * Seul point a noter : le fonctionnement recursif de
 * getAccounts(). Voir plus bas.
 * Attention si on venait a faire heriter User the Contact.
 * Cela serait certes pratique, mais bien que les deux classes
 * partageront a priori des attributs communs, leurs
 * significations et utilisations pourront differer.
 ***************************************************************/
export interface User{
  startDiscussion(contacts: Contact[]) : Discussion;
  //    Permet de commencer une discussion avec un contact.
  //    C'est le seul moyen de communiquer avec quelqu'un.
  // Garanti que l'iniateur de la conversation est présent

  leaveDiscussion(discussion: Discussion): any;

  getAccounts(): Account[];
  //    Retourne la liste des comptes de l'utilisateurs.
  //    Ce comptes peuvent bien entendu etre de tout type :
  //    IRC, Skype, Facebook... mais aussi OmniChat (recursivite).
  //    Probablement une surcharge de celle de Contact.

  getContacts(): Contact[];
  //    Retourne la liste des contacts de l'utilisateur courant.
  //    Fera appel a StaticProxy.getContacts(a: Accounts) pour
  //    chaque compte de lie a l'utiliateur.

  addContact(contact: Contact): any;

  removeContact(contact: Contact): any;

  onDiscussionRequest(callback: (disc:Discussion) => any): any;

  onContactRequest(callback: (contact: Contact) => any): any;
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
  name: String;         // Nom de la conversation
  isPrivate: boolean;

  getMessages(): Message[];
  //    Retourne une liste des messages echanges pendant la discussion.
  //    Equivalent a un espece de getHistory {dateMax, dateMin, nbMessages}.
  //    Un filtre pourra certainement etre applique par la suite,
  //    via utilisation de lambdas ou/et de hasmaps.

  // TODO: add filter
  // ex:
  //{
  //  protocols: string | string[]
  //  accounts: Account | Account[]
  //}
  sendMessage(msg: Message): any;
  //    Envoie le message à tous les participants de la discussion.
  //    Devra sans doute faire appel a StaticProxy.sendMessage().
  //    Mais un probleme se pose : sur quel compte du contact envoyer
  //    le message ?

  addParticipants(p: Contact[]): any;
  //    Ajoute des participants a la conversation.
  //    Peut etre n'ajouter qu'un seul compte des contacts,
  //    et transformer la discussion en tant qu'agregation
  //    de comptes et non plus de Contacts.

  getParticipants(): Contact[];
  //    Retourne une liste des participants a la conversation.

  onMessage(callback: (msg: Message) => any): any;
  //    Appelle la methode a executer lors de la reception du message.
  //    Le detection d'un message se fera sans doute via un ecouteur
  //    qui ecoutera... quoi ?

  getName(): string;
  //    Retourne le nom de la discussion.

  getDescription(): string;
  //    Retourne une description de la discussion.
  //    Reste a definir ce que doit etre cette description.

  getSettings(): any;
  //    Retourne tout les paramètres de la discussion, même spécifiques (map).
  //    Bien evidemment, nous ne pourrons pas tout traiter.
  //    Nous essayerons cependant de faire du mieux possible sans pour autant
  //    y passer des heures entieres.
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
  //    Retourne une representation du message sous forme de String.
  //    Tout message (texte, image, autre fichier) doit avoir cette
  //    représentation pour toujours avoir quelque chose à afficher
  //    (erreur de chargement, etc).

  getCreationDate(): Date;
  //    Retourne la date de creation du message.

  getLastUpdateDate(): Date;
  //    Retourne la date de derniere modification du message.
  //    Cela ne vaut bien sur que si les messages sont editables,
  //    ce qui conduira peut-etre a supprimer cette methode
  //    de l'interface globale.

  getAuthor(): Contact;
  //    Retourne l'auteur du message.

  getContent(): any;
  //    Renvoi un contenu plus pertinent.
  //    Chaque type de message devra implementer elle-meme cette methode.
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
  protocols: string;    //  Une representation du protocole de communication
                        //  utilise par ce compte.
                        //  Protocol sera peut-etre encapsule dans une enum ou une struct
                        //  par la suite.
  data: any;            //  Les donnees du comptes. A definir

  createDiscussion(name: string): Promise<Discussion>;
}
