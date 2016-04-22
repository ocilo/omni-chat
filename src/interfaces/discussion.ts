import * as Bluebird from "bluebird";
import {User} from "./user";
import {ContactAccount} from "./contact-account";
import {GroupChat} from "./group-chat";
import {Subdiscussion} from "./group-chat";
import {Message} from "palantiri-interfaces";

/***************************************************************
 * Discussion is the only thing you can use to chat with
 * someone. It provides you methods to send a message, add and
 * remove participants, and so on.
 * It is basically constituted of several smaller Discussions,
 * knows as GroupChat.
 * Discussion is multi-protocols and multi-accounts. This means
 * that you can send the same message to several Contacts which
 * are reachable from as many accounts as you want, using as
 * many protocols as you want.
 ***************************************************************/
// TODO(important) : where do we put the methods that send to other types of accounts
//                   a message received from a contactin an heterogeneous discussion ?
export interface Discussion {
  creationDate: Date;             // Date de creation de la Discussion.

  name: string;                   // Nom de la Discussion.

  description: string;            // Une description brève de la Discussion,
                                  // sous forme textuelle.

  heterogeneous: boolean;         // Est vrai si la Discussion est heterogene,
                                  // c'est-a-dire composee de plusieurs sous
                                  // discussions utilisant des protocoles differents.
	
  subdiscussions: Subdiscussion;  // Ensemble des conversations mono-protocole,
																	// mono-compte dont est compose la Discussion.
																	// La date permet une recuperation correcte des
																	// messages de la Discussion.

  owner: User;                    // L'utilisateur d'Omni-Chat qui utilise
                                  // cette Discussion.

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Bluebird.Thenable<Message[]>;
  //  Retourne une liste des "maxMessages" derniers messages echanges pendant la Discussion,
  //  au plus : s'il y en a moins, alors retourne le nombre de messages disponibles.
  //  Si afterDate est precise, ne retourne que les messages posterieurs a afterDate.
  //  Si filter est precise, ne retourne que les messages dont l'application de la fonction
  //  filter ne retourne true.
	//  Il est a noter qu'aucun message anterieur a la date d'ajout de chaque subdiscussion
	//  ne sera recupere, cela n'ayant aucune signification pour nous.

  addSubdiscussion(subdiscuss: GroupChat): Bluebird.Thenable<Discussion>;
  //  Ajoute la sous discussion "subdiscuss" a la Discussion courante.
  //  Si il existe deja un GroupChat utilisant le meme protocole et
	//  le meme compte, "subdiscuss" sera ajoute a ce groupe.
	//  Si la sous discussion n'exsite pas, elle sera creee. Et si le
	//  prtocole utilise le permet, les membres de la sous discussion
	//  en seront informes. Sinon, ils ne le seront que lors de l'envoie
	//  d'un message.

  removeParticipants(contactAccount: ContactAccount): Bluebird.Thenable<Discussion>;
  //  Enleve le participant "contactAccount" de la Discussion
  //  courante. Plus exactement, supprime "contactAccount" d'un
  //  GroupAccount de this.subdiscussion et l'evince du groupe de
  //  chat et de la conversation du cote du service (via un ConnectedApi).
  //  A noter que si jamais "contactAccount" etait present
  //  dans plusieurs GroupAccounts de this.participants, il ne
  //  sera supprime qu'une seule fois.
	//  Si cela supprime le dernier participant d'une sous discussion,
	//  la sous discussion sera supprimee.

  getSubdiscussions(): Bluebird.Thenable<Subdiscussion>;
  //  Retourne une liste des sous discussions de la Discussion courante.

  getName(): string;
  //  Retourne le nom de la discussion.

  getDescription(): string;
  //  Retourne une description de la discussion.
}
