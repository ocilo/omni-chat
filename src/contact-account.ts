import * as Bluebird from "bluebird";
import Incident from "incident";
import * as palantiri from "palantiri-interfaces";

import AppInterface from "./interfaces/app";
import ContactInterface from "./interfaces/contact";
import ContactAccountInterface from "./interfaces/contact-account";
import UserAccountInterface from "./interfaces/user-account";

export class ContactAccount implements ContactAccountInterface {
  /**
   * The app context
   */
  app: AppInterface = null;

  /**
   * The account of localAccount -> this ContactAccount is a contact of localAccount
   * It means that you can talk to this remote contact by using this localAccount
   */
  localAccount: UserAccountInterface = null;

  /**
   * A palantiri driver/id pair
   */
  token: palantiri.AccountToken = null;

  constructor (app: AppInterface, localAccount: UserAccountInterface, token: palantiri.AccountToken) {
    this.app = app;
    this.localAccount = localAccount;
    this.token = token;
  }

  getContact(): Bluebird<ContactInterface> {
    // TODO: retrieve contact owning this contact-account
    return Bluebird.reject(new Incident("todo", "ContactAccount:getContact is not implemented"));
  }

  getPalantiriToken(): Bluebird<palantiri.AccountToken> {
    return Bluebird.resolve(this.token);
  }

  getName(): Bluebird<string> {
    // TODO: implement api.getContactInfo
    return Bluebird.resolve(this.localAccount.getOrCreateApi())
      // .then(api => api.getContactInfo(this.token))
      // .then(info => info.name)
      .thenReturn("todo-contact-account-getname");
  }
}

export default ContactAccount;
