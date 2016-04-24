import {Thenable} from "bluebird";
import * as palantiri from "palantiri-interfaces";
import {Contact} from "./contact";

/***************************************************************
 * ContactAccount represents a mono-protocol Contact, reachable
 * through one UserAccount.
 * The type alias prevent some misunderstandings.
 ***************************************************************/
export interface ContactAccount {
  /**
   * Returns the contact owning this contact-account
   */
  getContact(): Thenable<Contact>;

  /**
   * Returns the palantiri token (driver + internal id) of this contact-account
   */
  getPalantiriToken(): Thenable<palantiri.AccountToken>;

  /**
   * Returns a human-readable name for this account
   */
  getName(): Thenable<string>;
}

export default ContactAccount;
