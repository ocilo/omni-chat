import * as _ from 'lodash';
import * as Promise from "bluebird";
import {Client} from "./interfaces";
import {Proxy} from "./interfaces";
import {User} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";
import {UserAccount} from "./interfaces";
import {ContactAccount} from "./interfaces";

// TODO(Ruben) : Passer sur la refonte de l'utilisation des proxies.
//               Ca devrait permettre de finir d'implémenter OChatUser, a part ce qui touche aux discussions.
//               L'algo qui gere les Contacts pourra etre implemente en premiere approche de maniere basique.

export class OChatApp implements Client {
	drivers: Proxy[] = [];  // All drivers supported by the app

	users: User[];          // All users connected to this client

	getProxyFor(protocol: string): Promise<Proxy> {
		for(let i=0; i<this.drivers.length; i++){
			if(this.drivers[i].isCompatibleWith(protocol)){
				return Promise.resolve(this.drivers[i]);
			}
		}
	}

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

	addUser(user: User, callback?: (err: Error, users: User[]) => any): OChatApp {
		let err: Error = null;
		if(this.users.indexOf(user) === -1) {
			err = new Error("This user is already connected to this client.");
		} else {
			this.users.push(user);
		}
		if(callback) {
			callback(err, this.users);
		}
		return this;
	}

	removeUser(user: User, callback?: (err: Error, users: User[]) => any): OChatApp {
		let err: Error = null;
		if(this.users.indexOf(user) === -1) {
			err = new Error("This user was not connected to this client.");
		} else {
			this.users.splice(0, 1, user);
		}
		if(callback) {
			callback(err, this.users);
		}
		return this;
	}
}

export class OChatUser implements User {
	username: string;

	app: OChatApp;

	accounts: UserAccount[] = [];

	getOrCreateDiscussion(accounts: ContactAccount[]): Promise<Discussion> {
		let discussion: Discussion; // The discussion we are looking for

							// TODO : Oups, we have forgotten something.
							//        There's three different cases :
							//        * accounts contains only one account : easy as pie
							//        * accounts contains several accounts but using the same protocol : easy
							//        * accounts contains severas accounts using different protocols : the oups is here
							//        What do we do here ? Trying to merge several discussions from differents protocols,
							//        or using our own database to store these discussions ?
			// NB : now we just have to use Proxy in each account this.accounts to get discussions.
			//      That's a solved problem.
		return Promise.resolve(discussion);
	}

	leaveDiscussion(discussion:Discussion, callback?:(err:Error, succes:Discussion)=>any): void {

	}

	getAccounts(): Promise<UserAccount[]> {
		return Promise.resolve(this.accounts);
	}

	getContacts(): Promise<Contact[]> {
		return undefined;
		// TODO : here goes the algotithm wich allow us to predict if two different accounts
		//        represent the same personne, i.e. the same Contact.
	}

	addAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): void {
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

	removeAccount(account: UserAccount, callback?: (err: Error, succes: UserAccount[]) => any): void {
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

	addContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void {
	}

	removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void {
		// WARNING : we need to warn the user that this will remove the contact from all his accounts

	}

	onDiscussionRequest(callback: (disc: Discussion) => any): User {
		return undefined;
	}

	onContactRequest(callback: (contact: Contact)=> any): User {
		return undefined;
	}
}

export class OChatContact implements Contact {
	accounts: Account[];

	fullname: string;

	nicknames: string[];

	localID: number;

	getAccounts(): Promise<Account[]> {
		return Promise.resolve(this.accounts);
	}

	mergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Contact {
		let error: Error = null;
		let numberOfErrors: number = 0;
		for(let contactAccount: Account of contact.accounts) {
			this.addAccount(contactAccount, (err, acc) => {
				if(err) {
					numberOfErrors++;
				}
			});
		}
		if(numberOfErrors === contact.accounts.length) {
			error = new Error("Unable to merge contact. Maybe the second was part of the current.");
		} else if(numberOfErrors !== 0) {
			error = new Error(numberOfErrors + " account of the contact in parameters could not be added to the current contact.");
		}
		if(callback) {
			callback(error, this);
		}
		return this;
	}

	unmergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Contact {
		let error: Error = null;
		for(let contactAccount: Account of contact.accounts) {
			this.removeAccount(contactAccount, (err, acc) => {
				if(err) {
					error = new Error("Unable to unmerge contact. One account in the parameters is not part of the current Contact.");
				}
			});
			if(error)
			{
				break;
			}
		}
		if(callback) {
			callback(error, this);
		}
		return this;
	}

	addAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.accounts.push(account);
		} else {
			err = new Error("This account already exists for this contact.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}

	removeAccount(account: Account, callback? : (err: Error, succes: Account[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.accounts.splice(0, 1, account);
		} else {
			err = new Error("This account does not exist for this contact.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}

	getOwner(): Contact {
		return undefined;
	}

}

export class OChat{
	static useDriver(driver: any) {
		return this;
	}
}
