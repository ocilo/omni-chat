import * as _ from 'lodash';
import {Proxy} from "./interfaces";
import {User} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";
import {Account} from "./interfaces";

export class oChatApp {
  drivers: Proxy[] = [];

  useDriver(driver: Proxy){
    this.drivers.push(driver);
  }
}

export interface getAccountOptions{
  protocols?: string[]
}

export class oChatUser implements User{
  app: oChatApp;
  accounts: Account[] = [];

  constructor(app: oChatApp){
    this.app = app;
  }

  startDiscussion(contacts:Contact[]):Discussion {
    return undefined;
  }

  leaveDiscussion(discussion:Discussion) {
  }

  addAccount(account: Account){
    this.accounts.push(account);
  }

  getAccounts(options?: getAccountOptions): Account[] {
    if(options && options.protocols){
      let accounts: Account[] = [];

      // TODO(Charles): add isCompatibleWith to accounts

      //for(let i = 0, l = this.accounts.length; i < l; i++){
      //  let isCompatible = false;
      //  for(let j = 0, k = options.protocols.length; j < k; j++){
      //    let curProtocol = options.protocols[j];
      //    if(this.accounts[i].isCompatibleWith(curProtocol)){
      //      isCompatible = true;
      //      break;
      //    }
      //  }
      //  if(isCompatible){
      //    accounts.push(this.accounts[i]);
      //  }
      //}

      return accounts;
    }else{
      return _.clone(this.accounts); // shallow copy
    }
  }

  getContacts():Contact[] {
    return undefined;
  }

  addContact(contact:Contact) {
  }

  removeContact(contact:Contact) {
  }

  onDiscussionRequest(callback:(disc:Discussion)=>any) {
  }

  onContactRequest(callback:(contact:Contact)=>any) {
  }
}

export class OChat{
  static useDriver(driver: any){
    return this;
  }
}
