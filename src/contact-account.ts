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

  getGlobalId(): Bluebird<palantiri.AccountGlobalId> {
    return Bluebird.resolve(palantiri.Id.asGlobalId(this.accountData));
  }

  getName(): Bluebird<string> {
    return Bluebird.resolve(this.accountData.name);
  }

  getAvatarUrl(): Bluebird<string> {
    return Bluebird.resolve(this.accountData.avatarUrl);
  }
}

export default ContactAccount;
