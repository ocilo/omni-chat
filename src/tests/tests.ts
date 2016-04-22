import {OChatApp} from "../app";
import {OChatUser} from "../user";
import {UserAccount} from "palantiri";  // TODO : use FacebookUserAccount
import {Message} from "palantiri";
import {MessageFlags} from "palantiri-interfaces";

let app = new OChatApp();
let user = new OChatUser();
let fbacc = new UserAccount();
fbacc.protocol = "facebook";
fbacc.username = "ochat.frif";
user.addAccount(fbacc);
fbacc.getOrCreateConnection()
	.then((co) => {
		user.username = "ochat.frif";
		app.addUser(user);
		return user.getContacts();
	})
	.then((contacts) => {
		return user.getOrCreateDiscussion(contacts[0]);
	})
	.then((discuss) =>{
		let msg: Message = new Message();
		msg.author = fbacc;
		msg.body = "Hello !";
		msg.content = undefined;
		msg.creationDate = new Date();
		msg.flags = MessageFlags.TEXT;
		user.sendMessage(msg, discuss);
	});