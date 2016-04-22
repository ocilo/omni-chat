import {ContactAccount} from "./contact-account";
import * as Bluebird from "bluebird";

/***************************************************************
 * Contact is the representation of someone you can chat with.
 * A contact may be the same for differents accounts. That's why
 * it contains a list of accounts : those were the contact is
 * identified as the same as in the others.
 * The only way to chat with someone is to start a discussion
 * with him. Other participants could be added through the
 * interface Discussion.
 ***************************************************************/
export interface Contact {
  accounts: ContactAccount[]; //  La liste des comptes connus de l'utilisateur
                              //  pour lesquels ce contact est le meme.

  fullname: string;           //  Le nom complet du contact.

  nicknames: string[];        //  Les noms sous lesquels le contact est connu.
                              //  Ne contient que les noms present pour les
                              //  differents comptes connus.

  getAccounts(): Bluebird.Thenable<ContactAccount[]>;
  //  Retourne la liste des comptes connus de l'utilisateur
  //  pour lesquels le Contact courant est le meme.

  getNicknames(): string[];
  //  Retourne la liste des surnoms connus du Contact courant.

  getPrincipalName(): string;
  //  Retourne la valeur du champ fullname.

  setPrincipalName(newPrincipalName: string): Bluebird.Thenable<Contact>;
  //  Met a jour le champ "fullname" du Contact courant.
  //  Ne modifie pas nicknames.

  mergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Bluebird.Thenable<Contact>;
  // Fusionne les comptes du Contact courant avec ceux du Contact fourni.
  // La gestion du contact fourni apres cette methode est a la charge de l'appelant.
	// Le nom principal du Contact resultant sera celui du Contact courant.
  // Retourne le contact courrant apres eventuelles modifications.

  unmergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Bluebird.Thenable<Contact>;
  // Defusionne les comptes du Contact courant afin de former deux contacts :
  // Le Contact fourni.
  // Le Contact courant MINUS le Contact fourni.
  // Ne fait rien si l'operation unmerge est impossible
  // (i.e. l'un des deux Contacts ressultant est nul, ou si "contact" ne fait pas
  // partie du Contact courant).
  // La gestion du Contact fourni apres cette methode est a la charge de l'appelant.
  // Retourne le Contact courrant apres eventuelles modifications.

  addAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): Bluebird.Thenable<Contact>;
  // Ajoute un compte au Contact courant.
  // Cette operation est differente de mergeContacts() dans le sens ou
  // on rajoute un compte d'un certain type a un Contact, mais que ce
  // compte n'etait pas connu a travers les comptes de l'tilisateur
  // connecte. C'est une operation "manuelle".
  // Lorsque cela est possible, ce Contact va etre rajoute a la liste des
  // Contact sur un des comptes de l'utilisateur. L'utilisateur aura donc
  // acces a ce Contact par la suite meme sans passer par OmniChat.
  // Cette operation necessite que l'utilisateur se serve d'un client qui
  // supporte le protocole utilise par le compte "account".

  removeAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): Bluebird.Thenable<Contact>;
  // Supprime un compte du Contact courant.
  // Cette operation est differente de unmergeContacts() dans le sens ou
  // on supprime un compte d'un certain type a un Contact, mais que ce
  // Contact reste le meme.
  // Exemple d'utilisation : un compte que le Contact n'utilise plus.
}
