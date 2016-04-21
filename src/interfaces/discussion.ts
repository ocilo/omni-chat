import * as Bluebird from "bluebird";
import {GroupAccount} from "./group-account";
import {User} from "./user";
import {Message} from "./message";
import {ContactAccount} from "./contact-account";
import {Dictionary} from "./utils";

/***************************************************************
 * Discussion is the only thing you can use to chat with someone.
 * It provides you methods to send a message, add and remove
 * participants, and so on.
 ***************************************************************/
export interface Discussion {
  creationDate: Date;             // Date de creation de la conversation

  name: string;                   // Nom de la conversation

  description: string;            // Une description brève de la discussion,
                                  // sous forme textuelle.

  heterogeneous: boolean;         // Est vrai si la discussion est heterogene,
                                  // c'est-a-dire composee de plusieurs participants
                                  // utilisant des protocoles differents.

  isPrivate: boolean;             // Privacite de la conversation

  participants: GroupAccount[];   // Liste des participants a la conversation.
                                  // L'utilisateur n'en fait pas partie.

  owner: User;                    // L'utilisateur d'Omni-Chat qui utilise
                                  // cette discussion.

  settings: Dictionary<any>;      // La liste des autres parametres de la discussion,
		                              // meme specifiques.
		                              // Cela permet aux implementations de travailler
																	// avec plus de donnees.

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Bluebird.Thenable<Message[]>;
  //  Retourne une liste des maxMessages derniers messages echanges pendant la discussion,
  //  au plus : s'il y en a moins, alors retourne le nombre de messages disponibles.
  //  Si afterDate est precise, ne retourne que les messages posterieurs a afterDate.
  //  Si filter est precise, ne retourne que les messages dont l'application de la fonction
  //  filter ne retourne true.

  sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): Bluebird.Thenable<Discussion>;
  //  Envoie le message "msg" a tous les participants de la discussion.
  //  Il est a noter que le message ne pourra etre envoye que si
	//  les comptes de l'utilisateurs necessaires a cet envoie
	//  disposent tous d'une connection allumee.

  addParticipants(p: GroupAccount): Bluebird.Thenable<Discussion>;
  //  Ajoute les membres de "p" a la discussion courante.
  //  Ces participants peuvent aussi bien etre un groupe
  //  (deja existants ou non) qu'une personne seule.
  //  Si il existe deja un GroupAccount utilisant le meme
  //  protocole, p sera ajoute a ce groupe.

  removeParticipants(contactAccount: ContactAccount): Bluebird.Thenable<Discussion>;
  //  Enleve le participant "contactAccount" de la discussion
  //  courante. Plus exactement, supprime "contactAccount" d'un
  //  GroupAccount de this.participants et l'evince du groupe de
  //  chat et de la conversation du cote du service (via un ConnectedApi).
  //  A noter que si jamais "contactAccount" etait present
  //  dans plusieurs GroupAccounts de this.participants, il ne
  //  sera supprime qu'une seule fois.

  getParticipants(): Bluebird.Thenable<GroupAccount[]>;
  //  Retourne une liste des participants de la discussion courante.

  getName(): Bluebird.Thenable<string>;
  //  Retourne le nom de la discussion.

  getDescription(): Bluebird.Thenable<string>;
  //  Retourne une description de la discussion.

  getSettings(): Bluebird.Thenable<Dictionary<any>>;
  //  Retourne tout les paramètres de la discussion, même spécifiques (map).
  //  Bien evidemment, nous ne pourrons pas tout traiter.
  //  Nous essayerons cependant de faire du mieux possible sans pour autant
  //  y passer des heures entieres.
}
