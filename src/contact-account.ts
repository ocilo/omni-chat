import * as Bluebird from "bluebird";
import Incident from "incident";
import * as palantiri from "palantiri-interfaces";

import ContactAccountInterface from "./interfaces/contact-account";

export class ContactAccount implements ContactAccountInterface {
  /**
   * A palantiri driver/id pair
   */
  token: palantiri.AccountToken = null;

  constructor (token: palantiri.AccountToken) {
    this.token = token;
  }

  getPalantiriToken(): Bluebird<palantiri.AccountToken> {
    return Bluebird.resolve(this.token);
  }

  getName(): Bluebird<string> {
    // TODO: implement api.getContactInfo
    return Bluebird.reject(new Incident("todo", "ontactAccount.getName is not implemented yet"));
  }
}

export default ContactAccount;
