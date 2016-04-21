import * as Bluebird from "bluebird";

import {ContactAccount} from "palantiri-interfaces";
import {Discussion} from "palantiri-interfaces";
import {Connection} from "palantiri-interfaces";
import {GroupAccount} from "palantiri-interfaces";
import {Message} from "palantiri-interfaces";
import {UserAccount} from "palantiri-interfaces";
import {utils} from "palantiri-interfaces";

export abstract class OChatUserAccount implements UserAccount {
  username: string;

	protocol: string;

  connection: Connection;

  data: utils.Dictionary<any>;

  getContacts(): Bluebird<ContactAccount[]> {
	  let accounts: ContactAccount[] = [];
	  let that = this;
	  if(this.connection && this.connection.connected) {
		  this.connection.getConnectedApi()
			  .then((api) => {
				  return api.getContacts(that);
			  })
		    .then((contactsAccounts) => {
			    accounts = contactsAccounts;
		    });
	  }
    return Bluebird.resolve(accounts);
	  // TODO : mon enchainement de promesse est-il bon ?
	  // TODO : de maniere plus generale, est ce que mes retours par promesse sont bons ?
  }

  hasContactAccount(account: ContactAccount): Bluebird<boolean> {
    return Bluebird.resolve(this.getContacts().then((contacts): boolean => {
      for(let contact of contacts) {
        if(contact.localID === account.localID) {
          return true;
        }
      }
      return false;
    }));
	  // TODO : et celui-la de retour, il est bon ?
  }

  getDiscussions(max?: number, filter?: (discuss: Discussion) => boolean): Bluebird<Discussion[]> {
	  let discuss: Discussion[] = [];
	  let that = this;
	  if(this.connection && this.connection.connected) {
		  this.connection.getConnectedApi()
			  .then((api) => {
				  return api.getDiscussions(that, max, filter);
			  })
		    .then((discussions) => {
			    discuss = discussions;
		    });
	  }
    return Bluebird.resolve(discuss);
  }

  abstract getOrCreateConnection(): Bluebird<Connection>;
	//  This method is abstract because specific :
	//  We can't instanciate a new Connection object without
	//  just with new Connection(), because it depends of
	//  the used protocol of this account.

  sendMessageTo(recipients: GroupAccount, msg: Message, callback?: (err: Error, succes: Message) => any): Bluebird.Thenable<UserAccount> {
    let error: Error = null;
		if(recipients.protocol !== this.protocol) {
			error = new Error("Protocols are inconpatible.");
		} else if (!this.connection || !this.connection.connected) {
			error = new Error("You are not connected to the current account.");
		} else {
			this.connection.getConnectedApi().then((api) => {
				api.sendMessage(msg, recipients, (err, message) => {
					if(err) {
						error = err;
					}
				});
			});
		}

	  // TODO : et la, ca ne fait pas de la merde par hasard entre la promesse
	  //        et les deux callbacks et le retour par promesse ?

		if(callback) {
			callback(error, msg);
		}

	  return Bluebird.resolve(this);
  }
}
