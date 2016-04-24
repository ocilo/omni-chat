import * as Bluebird from "bluebird";
import * as palantiri from "palantiri-interfaces";

import ContactInterface from "./interfaces/contact";
import ContactAccountInterface from "./interfaces/contact-account";

export class ContactAccount implements ContactAccountInterface {
  getContact(): Bluebird<ContactInterface> {
    return null;
  }

  getPalantiriToken(): Bluebird<palantiri.AccountToken> {
    return null;
  }

  getName(): Bluebird<string> {
    return null;
  }
}

export default ContactAccount;
