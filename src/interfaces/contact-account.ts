import {Thenable} from "bluebird";
import * as palantiri from "palantiri-interfaces";

/***************************************************************
 * ContactAccount represents a mono-protocol Contact, reachable
 * through one UserAccount.
 ***************************************************************/
export interface ContactAccountInterface {
  /**
   * Returns the global id (driver + internal id) of this contact-account.
   */
  getGlobalId(): Thenable<palantiri.AccountGlobalId>;

  /**
   * Returns a human-readable name for this contact-account.
   */
  getName(): Thenable<string>;

  /**
   * Returns a promise for an url to the avatar/profile picture or null if not available.
   */
  getAvatarUrl(): Thenable<string>;

  // TODO: maybe we can add other useful getters.
}

export default ContactAccountInterface;
