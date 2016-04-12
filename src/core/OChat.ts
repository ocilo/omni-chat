import * as _ from 'lodash';
import * as Promise from "bluebird";
import {Proxy} from "./interfaces";
import {User} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";
import {Account} from "./interfaces";

export class OChatApp {
	drivers: Proxy[] = [];

	addDriver(driver: Proxy, callback?: (err: Error, drivers: Proxy[]) => any): void {
		let err: Error = null;
		for(let prox: Proxy of this.drivers) {
			if(prox.isCompatibleWith(driver.protocol)) {
				err = new Error("This app already has a compatible protocol");
			}
		}
		if(!err) {
			this.drivers.push(driver);
		}
		callback(err, this.drivers);
	}
}

export interface getAccountOptions{
	protocols?: string[]
}

export class oChatUser implements User{
	username:string;

	getOrCreateDiscussion(contacts:Contact[]):Promise<Discussion> {
		return undefined;
	}

	getAccounts():Promise<Account[]> {
		return undefined;
	}

	getContacts():Promise<Contact[]> {
		return undefined;
	}

	removeAccount(accout:Account):Promise<any> {
		return undefined;
	}
	app: OChatApp;
	accounts: Account[] = [];

	constructor(app: OChatApp){
		this.app = app;
	}

	leaveDiscussion(discussion:Discussion): Promise<any> {
		return null;
	}

	addAccount(account: Account): Promise<any> {
		this.accounts.push(account);
		return null;
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

	addContact(contact:Contact): Promise<any> {
		return null;
	}

	removeContact(contact:Contact): Promise<any> {
		return null;
	}

	onDiscussionRequest(callback:(disc:Discussion)=>any): User {
		return this;
	}

	onContactRequest(callback:(contact:Contact)=>any): User {
		return this;
	}
}

export class OChat{
	static useDriver(driver: any) {
		return this;
	}
}
