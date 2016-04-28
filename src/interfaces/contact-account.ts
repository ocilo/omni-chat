import {Thenable} from "bluebird";
import * as palantiri from "palantiri-interfaces";

/***************************************************************
 * ContactAccount represents a mono-protocol Contact, reachable
 * through one UserAccount.
 * The type alias prevent some misunderstandings.
 ***************************************************************/
export interface ContactAccountInterface {
  /**
   * Returns the palantiri token (driver + internal id) of this contact-account
   */
  getPalantiriToken(): Thenable<palantiri.AccountToken>;

  /**
   * Returns a human-readable name for this contact-account
   */
  getName(): Thenable<string>;
}

export default ContactAccountInterface;
