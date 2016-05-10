import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";
import ContactAccountInterface from "./interfaces/contact-account";

export class ContactAccount implements ContactAccountInterface {
  /**
   * The palantiri infos.
   */
  protected accountData: palantiri.Account = null;

  constructor (accountData: palantiri.Account) {
    this.accountData = accountData;
  }

  /**
   * Returns the global id (driver + internal id) of this contact-account.
   */
  getGlobalId(): Bluebird<palantiri.AccountGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.accountData));
  }

  /**
   * Returns a human-readable name for this contact-account.
   */
  getName(): Bluebird<string> {
    return Bluebird.resolve(this.accountData.name);
  }

  /**
   * Returns a promise for an url to the avatar/profile picture or null if not available.
   */
  getAvatarUrl(): Bluebird<string> {
    return Bluebird.resolve(this.accountData.avatarUrl);
  }
}

export default ContactAccount;
