import {ContactAccount} from "palantiri-interfaces";

export class OChatContactAccount implements ContactAccount {
  contactName: string;

  protocol: string;

  localID: number;
}
