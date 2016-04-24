import {App} from "../app";
import {User} from "../user";
import {UserAccount} from "../user-account";
import {Message} from "palantiri";
import {MessageFlags, Connection, Api} from "palantiri-interfaces";
import * as facebook from "./connections/facebook";
import UserAccountInterface from "../interfaces/user-account";

let app = new App();

app.useDriver(<any> facebook.Connection, facebook.fromConsole);

let user = new User(app, "ochat.frif");

let fbacc = new UserAccount(app, {
  driver: "facebook",
  id: "fb:ochat.frif", // a unique string identifying this account
  username: "ochat.frif"
});

user.addAccount(fbacc);

// app.getUsers().then(users => users[0]).then(user =>
user
  .getAccounts()
  .then((accounts: UserAccountInterface[]) => {
    console.log("Registered accounts: " + accounts.join(", "));
    let firstAccount = accounts[0];
    // normally, fbacc === firstAccount

    return user.getContacts()
      .then((contacts) => {
        let firstContact = contacts[0];
        let firstAccountOfFirstContact = firstContact.accounts[0];
        // get or create a discussion with this contact
        return user.getOrCreateDiscussion(firstAccountOfFirstContact);
      })
      .then((discussion) =>{
        let msg: Message = new Message();
        msg.author = fbacc;
        msg.body = "Hello !";
        msg.content = msg.body;
        msg.creationDate = new Date();
        msg.flags = MessageFlags.TEXT;
        user.sendMessage(msg, discussion);
      });
  });
