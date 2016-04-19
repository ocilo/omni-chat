import * as Bluebird from "bluebird";
import {GroupAccount} from "./group-account";
import {User} from "./user";
import {Message} from "./message";
import {ContactAccount} from "./contact-account";
import {Dictionary} from "./utils";

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

  heterogeneous: boolean;         // Est vrai si la discussion est heterogene,
                                  // c'est-a-dire composee de plusieurs participants
                                  // utilisant des protocoles differents.

  isPrivate: boolean;             // Privacite de la conversation

  participants: GroupAccount[];   // Liste des participants a la conversation.
                                  // L'utilisateur n'en fait pas partie.

  owner: User;                    // L'utilisateur d'Omni-Chat qui utilise
                                  // cette discussion.

  settings: Dictionary<any>;     // La liste des autres parametres de la discussion,
                                  // meme specifiques.
                                  // Cela permet aux implementations de travailler
                                  // avec plus de donnees.

  getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Bluebird.Thenable<Message[]>;
  //  Retourne une liste des maxMessages derniers messages echanges pendant la discussion,
  //  au plus : s'il y en a moins, alors retourne le nombre de messages disponibles.
  //  Si afterDate est precise, ne retourne que les messages posterieurs a afterDate.
  //  Si filter est precise, ne retourne que les messages dont l'application de la fonction
  //  filter ne retourne true.

  sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): void;
  //  Envoie le message "msg" a tous les participants de la discussion.
  //  Cette methode fait appel au proxy pour chaque Account de "participants".

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
  //  chat et de la conversation du cote du service (via un Proxy).
  //  A noter que si jamais "contactAccount" etait present
  //  dans plusieurs GroupAccounts de this.participants, il ne
  //  sera supprime qu'une seule fois.

  getParticipants(): Bluebird.Thenable<GroupAccount[]>;
  //  Retourne une liste des participants de la discussion courante.

  onMessage(callback: (msg: Message) => any): Bluebird.Thenable<Discussion>;
  //  Met a jour la methode a executer lors de la reception du message.
  //  Retourne la discussion courante pour permettre de chainer
  //  les appels.
  //  TODO : this should maybe be somewhere else.

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
