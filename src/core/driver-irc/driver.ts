import {Proxy} from '../interfaces';
import {Contact} from "../interfaces";
import {Account} from "../interfaces";
import {Discussion} from "../interfaces";
import {Message} from "../interfaces";

export class DriverIRC implements Proxy{

  constructor(){

  }

  isCompatibleWith(protocol:string):boolean {
    return protocol == 'string';
  }

  getContacts(account:Account):Contact[] {
    return [];
  }

  sendMessage(msg:Message, discussion:Discussion, target:Contact) {

  }
}
