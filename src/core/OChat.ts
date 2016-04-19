import * as _ from 'lodash';
import * as Promise from "bluebird";
import {Client} from "./interfaces";
import {Proxy} from "./interfaces";
import {User} from "./interfaces";
import {Contact} from "./interfaces";
import {Discussion} from "./interfaces";
import {UserAccount} from "./interfaces";
import {ContactAccount} from "./interfaces";
import {Message} from "./interfaces";
import {Connection} from "./interfaces";
import {Listener} from "./interfaces";
import {GroupAccount} from "./interfaces";
import {EventEmitter} from 'events';
import {MSG_FLAG_EDI} from "./interfaces";

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
		for(let prox of this.drivers) {
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

	getOrCreateDiscussion(accounts: GroupAccount[]): Promise<Discussion> {
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

	leaveDiscussion(discussion: Discussion, callback?: (err: Error, succes: Discussion) => any): void {

	}

	getAccounts(protocols?: string[]): Promise<UserAccount[]> {
		if(protocols) {
			let accounts: UserAccount[] = [];
			for(let account of this.accounts) {
				for(let protocol of protocols) {
					if(account.driver.isCompatibleWith(protocol)) {
						accounts.push(account);
						break;
					}
				}
			}
			return Promise.resolve(accounts);
		}
		return Promise.resolve(this.accounts);
	}

	getContacts(): Promise<Contact[]> {
		// TODO : we can do lots of improvements :
		//        -do not compare otherContact with other someContacts we already added to contacts
		//        -improve how we check if ContactAccount are the same Contact
		//        -check in base if the user specified some time ago that some accounts are the same
		let contacts: Contact[] = null;
		for(let account of this.accounts) {
			account.getContacts().then((someContacts) => {
				if(!contacts) {
					contacts = someContacts;
				} else {
					for(let otherContact of someContacts) {
						let merge: boolean = false;
						for(let actualContact of contacts) {
							if(otherContact.fullname === actualContact.fullname) {
								actualContact.mergeContacts(otherContact);
								merge = true;
								break;
							}
						}
						if(!merge) {
							contacts.push(otherContact);
						}
					}
				}
			})
		}
		return Promise.resolve(contacts);
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
		// TODO : this is advanced option.
		//        It's about writing on an account,
		//        and not only reading it.
		//        We will do this later.
	}

	removeContact(contact: Contact, callback?: (err: Error, succes: Contact[]) => any): void {
		// WARNING : we need to warn the user that this will remove the contact from all his accounts
		// TODO : this is advanced option.
		//        It's about writing on an account,
		//        and not only reading it.
		//        We will do this later.
	}

	onDiscussionRequest(callback: (disc: Discussion) => any): User {
		// TODO : see troubles in interfaces.ts before
		return undefined;
	}

	onContactRequest(callback: (contact: Contact)=> any): User {
		// TODO : see troubles in interfaces.ts before
		return undefined;
	}
}

export class OChatContact implements Contact {
	fullname: string;

	nicknames: string[];

	accounts: ContactAccount[];

	getAccounts(): Promise<ContactAccount[]> {
		return Promise.resolve(this.accounts);
	}

	getNicknames(): string[] {
		return this.nicknames;
	}

	getPrincipalName(): string {
		return this.fullname;
	}

	setPrincipalName(newPrincipalName: string): void {
		this.fullname = newPrincipalName;
	}

	mergeContacts(contact: Contact, callback?: (err: Error, succes: Contact) => any): Contact {
		let error: Error = null;
		let numberOfErrors: number = 0;
		for(let contactAccount of contact.accounts) {
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
		for(let contactAccount of contact.accounts) {
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

	addAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.nicknames.push(account.contactName);
			if(!this.fullname) {
				this.fullname = account.contactName;
			}
			this.accounts.push(account);
		} else {
			err = new Error("This account already exists for this contact.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}

	removeAccount(account: ContactAccount, callback? : (err: Error, succes: ContactAccount[]) => any): void {
		let index: number = this.accounts.indexOf(account);
		let err: Error = null;
		if(index === -1) {
			this.accounts.splice(0, 1, account);
			this.nicknames.splice(0, 1, account.contactName);
		} else {
			err = new Error("This account does not exist for this contact.");
		}
		if(callback) {
			callback(err, this.accounts);
		}
	}
}

export class OChatDiscussion implements Discussion {
	creationDate: Date;

	name: string;

	isPrivate: boolean;

	heterogeneous: boolean;

	description: string;

	participants: GroupAccount[];

	owner: User;

	settings: Map<string, any>;

	getMessages(maxMessages: number, afterDate?: Date, filter?: (msg: Message) => boolean): Promise<Message[]> {
		// TODO : this depends on how we manage heterogeneous ContactAccount
		//        see above in OchatUser.getOrCreateDiscussion
		return undefined;
	}

	sendMessage(msg: Message, callback?: (err: Error, succes: Message) => any): void {
		let err: Error = null;
		for(let recipient of this.participants) {
			let gotIt: boolean = false;
			// TODO : rework this
			for(let ownerAccount of this.owner.accounts) {
				if(ownerAccount.driver.isCompatibleWith(recipient.protocol)) {
					ownerAccount.sendMessageTo(recipient, msg, callback);
					gotIt = true;
					break;
				}
			}
			if(!err && !gotIt) {
				err = new Error("At least one recipient could not be served.");
			}
		}
		callback(err, msg);
	}

	addParticipants(p: GroupAccount): Promise<Discussion> {
		if(this.participants.indexOf(p) === -1) {
			let param: string[] = [p.protocol];
			this.owner.getAccounts(param).then((ownerAccounts) => {
				let compatibleParticipants: GroupAccount[] = [];
				for(let participant of this.participants) {
					if(participant.protocol === p.protocol) {
						compatibleParticipants.push(participant);
					}
				}
				let gotIt: boolean = false;
				for(let compatibleParticipant of compatibleParticipants) {
					for(let ownerAccount of ownerAccounts) {
						if(ownerAccount.hasContactAccount(compatibleParticipant.members[0])) {
							// Ok, we have determined which one of the user's accounts
							// owns the current compatible participant.
							// Now if it owns the ContactAccounts that we want to add
							// to this discussion too, we win.
							if(ownerAccount.hasContactAccount(p.members[0])) {
								// That's it, we win !
								ownerAccount.driver.addMembersToGroupChat(p.members, compatibleParticipant, (err) => {
									if(!err) {
										compatibleParticipant.addMembers(p.members);
									}
								});
								gotIt = true;
								break;
							}
						}
					}
					if(gotIt) {
						break;
					}
				}
				// In the case where we still not have been able to add these participants,
				// there is two solutions :
				if(!gotIt) {
					if(compatibleParticipants.length === 0) {
						// First, we are trying to add accounts using a protocol which is
						// not in this discussion yet. We just have to add these participants
						// to this discussion, which will become heterogeneous.
						this.participants.push(p);
						this.heterogeneous = true;
					} else {
						// Second, we are trying to add accounts from an UserAccount which has
						// no current contacts in this discussion. We just have to add them.
						this.participants.push(p);
					}
					// TODO : but how the new participants will know that they are in this discussion ?
					//        For the moment, they won't know until we send a message to them.
					//        I don't think that it is a real problem.
					//        If it is, we coud just auto-send a message to them.
				}
			});
		}
		return Promise.resolve(this);
	}

	removeParticipants(contactAccount: ContactAccount): Promise<Discussion> {
		// TODO
		return Promise.resolve(this);
	}

	getParticipants(): Promise<GroupAccount[]> {
		return Promise.resolve(this.participants);
	}

	onMessage(callback: (msg :Message) => any): Promise<Discussion> {
		// TODO : see troubles in interfaces.ts before
		return undefined;
	}

	getName(): Promise<string> {
		return Promise.resolve(this.name);
	}

	getDescription(): Promise<string> {
		return Promise.resolve(this.description);
	}

	getSettings(): Promise<Map<string, any>> {
		return Promise.resolve(this.settings);
	}
}

export class OChatMessage implements Message {
	author: ContactAccount | UserAccount;

	body: string;

	content: any;

	flags: number;

	creationDate: Date;

	lastUpdated: Date;

	getText(): Promise<string> {
		return Promise.resolve(this.body);
	}

	getCreationDate(): Promise<Date> {
		return Promise.resolve(this.creationDate);
	}

	getLastUpdateDate(): Promise<Date> {
		return Promise.resolve(this.lastUpdated);
	}

	getAuthor(): Promise<ContactAccount | UserAccount> {
		return Promise.resolve(this.author);
	}

	getContent(): Promise<any> {
		return Promise.resolve(this.content);
	}

	getFlags():Promise<number> {
		return Promise.resolve(this.flags);
	}

	isEditable(): boolean {
		return (this.flags & MSG_FLAG_EDI) === MSG_FLAG_EDI;
	}
}

export class OChatConnection implements Connection {
	emitter: EventEmitter;

	connected: boolean;

	listeners: Listener[];

	getAllEventListeners(event?: string): Promise<Listener[]> {
		if(event) {
			let wantedListeners: Listener[] = [];
			for(let listener of this.listeners) {
				if(listener.event === event) {
					wantedListeners.push(listener);
				}
			}
			return Promise.resolve(wantedListeners);
		} else {
			return Promise.resolve(this.listeners);
		}
	}

	addEventListener(listener: Listener, callback?:(err: Error, succes: Listener[]) => any): void {
		this.emitter.addListener(listener.event, listener.handler);
		this.listeners.push(listener);
		if(callback) {
			callback(null, this.listeners);
		}
	}

	removeEventListener(listener: Listener, callback?: (err: Error, succes: Listener[]) => any): void {
		let err: Error = null;
		if(this.listeners.indexOf(listener) === -1) {
			err = new Error("This listener does not exist for this connection.");
		} else {
			this.emitter.removeListener(listener.event, listener.handler);
			this.listeners.splice(0, 1, listener);
		}
		if(callback) {
			callback(err, this.listeners);
		}
	}

	removeAllEventListeners(eventNames?: string[], callback?: (err: Error) => any): void {
		let err: Error = null;
		let originalLength: number = this.listeners.length;
		if(eventNames) {
			for(let name of eventNames) {
				for(let listener of this.listeners) {
					if(listener.event === name) {
						this.listeners.splice(0, 1, listener);
					}
				}
			}
			if(originalLength === this.listeners.length) {
				err = new Error("At least one of the specified events was not handled by this connection.")
			}
		} else {
			this.listeners = [];  // There is no other references to this array, so we can do that
		}
		if(callback) {
			callback(err);
		}
	}

	dispatchEvent(eventName: string, ...parameters: any[]): void {
		this.emitter.emit(eventName, parameters);
	}
}

export class OChatUserAccount implements UserAccount {
	username: string;

	driver: Proxy;

	connection: Connection;

	data: Map<string, any>;

	owner: User;

	getContacts(): Promise<Contact[]> {
		return this.driver.getContacts(this);
	}

	hasContactAccount(account: ContactAccount): Promise<boolean> {
		return Promise.resolve(this.getContacts().then((contacts): boolean => {
			for(let contact of contacts) {
				if(contact.accounts[0].localID === account.localID) {
					return true;
				}
			}
			return false;
		}));
	}

	getDiscussions(max?: number, filter?: (discuss: Discussion) => boolean): Promise<Discussion[]> {
		return this.driver.getDiscussions(this, max, filter);
	}

	getOwner(): Promise<User> {
		return Promise.resolve(this.owner);
	}

	getOrCreateConnection(): Promise<Connection> {
		if(this.connection && this.connection.connected) {
			return Promise.resolve(this.connection);
		}
		return this.driver.createConnection(this);
	}

	sendMessageTo(recipients: GroupAccount, msg: Message, callback?: (err: Error, succes: Message) => any): void {
		this.driver.sendMessage(msg, recipients, callback);
	}

	constructor(owner: User) {
		this.owner = owner;
	}
}

export class OChatContactAccount implements ContactAccount {
	contactName: string;

	protocol: string;

	localID: number;
}

export class OChatGroupAccount implements GroupAccount {
	protocol: string;

	members: ContactAccount[];

	localDiscussionID: number;

	addMembers(members: ContactAccount[], callback?: (err: Error, members: ContactAccount[]) => any): void {
		let err: Error = null;

		for(let account of members) {
			if(account.protocol.toLocaleLowerCase() !== this.protocol.toLocaleLowerCase()) {
				if(!err) {
					err = new Error("One of the accounts does not have the right protocol.");
				}
			} else {
				if(this.members.indexOf(account) !== -1) {
					if(!err) {
						err = new Error("One of the account is already a member.");
					}
				} else {
					this.members.push(account);
					//this.localDiscussionID = null;  // We maybe need to do this
					// TODO : we must add the member to the real group too,
					//        i.e. through the driver.
					//        Could we do this directly in Discussion.addParticipants() ?
				}
			}
		}

		if(callback) {
			callback(err, this.members);
		}
	}

}
