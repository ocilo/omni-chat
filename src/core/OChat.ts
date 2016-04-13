import * as _ from 'lodash';
import * as Promise from "bluebird";
import {Proxy} from "./interfaces";
import {User} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";
import {Account} from "./interfaces";

export class OChatApp {
	drivers: Proxy[] = [];  // All drivers supported by the app

	// Add a driver to the current app, if the app not already has one equivalent
	addDriver(driver: Proxy, callback?: (err: Error, drivers: Proxy[]) => any): OChatApp {
		let err: Error = null;
		for(let prox: Proxy of this.drivers) {
			if(prox.isCompatibleWith(driver.protocol)) {
				err = new Error("This app already has a compatible protocol");
			}
		}
		if(!err) {
			this.drivers.push(driver);
		}
		if(callback) {
			callback(err, this.drivers);
		}
		return this;
	}

	// Remove all drivers using the protocol given in parameters
	removeDriversFor(protocol: string, callback?: (err: Error, drivers: Proxy[]) => any): OChatApp {
		let err = new Error("This app does not support protocol " + protocol);
		for(let index: number = 0; index<this.drivers.length; index++) {
			let prox = this.drivers[index];
			if(prox.isCompatibleWith(protocol)) {
				err = null;
				this.drivers.splice(index, 1);
			}
		}
		if(callback) {
			callback(err, this.drivers);
		}
		return this;
	}
}

export class OChatUser implements User {

	username: string;
	app: OChatApp;
	accounts: Account[] = [];

	getOrCreateDiscussion(accounts: Account[]): Promise<Discussion> {
		let discussion: Discussion; // The discussion we are looking for

		// For each account
		for(let account: Account of this.accounts) {
			let proxy: Proxy = null;
			for(let driver: Proxy of this.app.drivers) {
				if(driver.isCompatibleWith(account.protocol)) {
					proxy = driver;
					break;
				}
				if(proxy) {
					proxy.getDiscussions(account).then(
						() => {
							// TODO : Oups, we have forgotten something.
							//        There's three different cases :
							//        * accounts contains only one account : easy as pie
							//        * accounts contains several accounts but using the same protocol : easy
							//        * accounts contains severas accounts using different protocols : the oups is here
							//        What do we do here ? Trying to merge several discussions from differents protocols,
							//        or using our own database to store these discussions ?
						}
					)
				} else {
					return Promise.reject(new Error("One of the accounts is not supported by the app."));
				}
			}
		}

		return Promise.resolve(discussion);
	}

	leaveDiscussion(discussion:Discussion, callback?:(err:Error, succes:Discussion)=>any): void {

	}

	getAccounts(): Promise<Account[]> {
		return Promise.resolve(this.accounts);
	}

	getContacts(): Promise<Contact[]> {
		return undefined;
		// TODO : here goes the algotithm wich allow us to predict if two different accounts
		//        represent the same personne, i.e. the same Contact.
	}

	addAccount(account: Account, callback?: (err: Error, succes: Account[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.accounts.push(account);
		} else {
			err = new Error("This account already exists.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}

	removeAccount(account: Account, callback?: (err: Error, succes: Account[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.accounts.splice(0, 1, account);
		} else {
			err = new Error("This account does not exist.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}

	addContact(contact: Contact, callback?: (err: Error, succes: Account[]) => any): void {
	}

	removeContact(contact: Contact, callback?: (err: Error, succes: Account[]) => any): void {
		// WARNING : we need to warn the user that this will remove the contact from all his accounts
		//this.getContacts().then( (friends: Contact[]) => {
		//	let contactAccounts: Account[] = contact.accounts;
		//	for(let userAccount: Account of this.accounts) {  // NOPE
		//		for(let oneContactAccount: Account of contactAccounts) {
		//			if(userAccount.protocol === oneContactAccount.protocol) {
		//				// TODO : trop complique. Il serait plus simple que chaque compte soit lie a un proxy
		//			}
		//		}
		//
		//	}
		//
		//});
		// TODO : an important problem appears when we try to implement this method
		//        protocol being a simple string and proxies being present only in user and
		//        not linked to any account, the complexity of this algorithm become way
		//        to high.
		//        We need to think again about the way we use proxies, and to think about
		//        the data structures that we are using (array are maybe not the key).
	}

	onDiscussionRequest(callback: (disc: Discussion) => any): User {
		return undefined;
	}

	onContactRequest(callback: (contact: Contact)=> any): User {
		return undefined;
	}
}

export class OChat{
	static useDriver(driver: any) {
		return this;
	}
}
