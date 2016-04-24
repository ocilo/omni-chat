import {Thenable} from "bluebird";
import {ContactAccount} from "./contact-account";

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
  getAccounts(): Thenable<ContactAccount[]>;
  //  Retourne la liste des comptes connus de l'utilisateur
  //  pour lesquels le Contact courant est le meme.

  /**
   * Returns the list of the known names of this account
   */
  getNicknames(): Thenable<string[]>;

  /**
   * Returns the main (full) name of the contact
   */
  getName(): Thenable<string>;

  /**
   * Set the main name of this contact.
   * Does not change the nicknames
   * @param newPrincipalName
   */
  setName(newName: string): Thenable<this>;

  /**
   * Adds the accounts of the supplied account to this account.
   * The supplied account is not modified
   * The current contact keeps its name
   * Returns the updated contact
   * @param contact
   */
  mergeWithContact (otherContact: Contact): Thenable<this>;

  // TODO: the original implementation was more powerful (tree of contacts, each one having its own accounts)
  //       Now its just a set of accounts.
  //       It might be good to restore the original behaviour.
  /**
   * Updates the associated accounts: updatedAccounts = currentAccounts - otherCountactAccounts
   * The supplied account is not modified.
   * Returns the updated contact.
   * @param contact
   * @param callback
   */
  unmergeWithContact (otherContact: Contact): Thenable<this>;

  /**
   * Register a new account for this contact
   * Returns the updated contact
   * @param account
   * @param callback
   */
  addAccount(account: ContactAccount): Thenable<this>;

  // TODO: the old behaviour was related to having a tree of contacts ? Might be good to restore it
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

  /**
   * Removes the supplied account from this contact
   * Returns the updated contact
   * @param account
   */
  removeAccount(account: ContactAccount): Thenable<this>;

  // TODO: the old behaviour was related to having a tree of contacts ? Might be good to restore it
  // Supprime un compte du Contact courant.
  // Cette operation est differente de unmergeContacts() dans le sens ou
  // on supprime un compte d'un certain type a un Contact, mais que ce
  // Contact reste le meme.
  // Exemple d'utilisation : un compte que le Contact n'utilise plus.
}

export default Contact;
