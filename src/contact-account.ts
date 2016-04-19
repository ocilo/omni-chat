import {ContactAccount} from "./interfaces/contact-account";

export class OChatContactAccount implements ContactAccount {
  contactName: string;

  protocol: string;

  localID: number;
}
