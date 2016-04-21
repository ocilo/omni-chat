import * as Bluebird from "bluebird";
import {Connection} from "./connection";
import {Discussion} from "./discussion";
import {ContactAccount} from "./contact-account";
import {GroupAccount} from "./group-account";
import {Message} from "./message";
import {Dictionary} from "./utils";

/***************************************************************
 * UserAccount represente one account used by an user of
 * Omni-Chat. This user can use several accounts at the same
 * time : that's the reason why Omni-Chat was created.
 * UserAccount is totally DIFFERENT from ContactAccount. An user
 * can plenty acceed to all his accounts, and do (almost)
 * everything he can do by using directly his accounts, without
 * using Omni-Chat.
 * The method getOrCreateConnection will sometimes need to
 * instanciate a new Connection. Or Connections objects are
 * specific, and the library has no clue about which one is
 * available. Therefore, when creating a new module, devs must
 * also create a new UserAccount too.
 ***************************************************************/
export interface UserAccount {
  username: string;       //  Le nom sous lequel peut se connecter l'utilisateur.

	protocol: string;       //  The protocol used by this account.

  connection: Connection; //  Une connection, existante ou non, allumee ou non,
                          //  etablie entre l'utilisateur et le service desire.

  data: Dictionary<any>;  //  Les autres donnees du compte.
                          //  Permet aux implementations de travailler avec
                          //  plus de details.

  getContacts(): Bluebird.Thenable<ContactAccount[]>;
  //  Accede a la liste des contacts du compte courant,
  //  et les retourne sous forme de tableau de contacts.

  hasContactAccount(account: ContactAccount): Bluebird.Thenable<boolean>;
  //  Retourne vrai si et seulement si le contact "account"
  //  peut etre accede a partir du compte courant.
  //  Necessite que account.localID soit defini.
  //  Necessite que la connectio soit etablie.

  getDiscussions(max?: number, filter?: (discuss: Discussion) => boolean): Bluebird.Thenable<Discussion[]>;
  //  Accede a la liste des discussions du compte courant
  //  et retourne jusqu'a "max" Discussions dans un tableau.
  //  Si filter est precise, ne retourne dans le tableau que les discussions
  //  pour lesquelles la fonction "filter" retourne true.

  getOrCreateConnection(): Bluebird.Thenable<Connection>;
  //  Connecte le compte courant, ou recupere la connexion existante.
  //  Si la connexion n'existait pas, elle sera cree et directement accessible,
  //  sauf erreur.

  sendMessageTo(recipients: GroupAccount, msg: Message, callback?: (err: Error, succes: Message) => any): Bluebird.Thenable<UserAccount>;
  //  Envoie le message "msg" aux contacts "recipients"
  //  dans UNE SEULE conversation, sauf si le protocole
  //  ne supporte pas les groupes.
  //  Si le message ne peut pas etre envoye, err sera non nul.
}
