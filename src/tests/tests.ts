import {App} from "../app";
import {User} from "../user";
import {UserAccount} from "../user-account";

import UserAccountInterface from "../interfaces/user-account";

import * as facebook from "./connections/facebook";

let app = new App();

app.useDriver(<any> facebook.Connection, facebook.fromConsole);

let user = new User(app, "ochat.frif");

let fbacc = new UserAccount(app, {
  driver: "facebook",
  id: "0000123456789", // a unique string identifying this account
  username: "ochat.frif"
});

user.addAccount(fbacc);

// app.getUsers().then(users => users[0]).then(user =>
user
  .getAccounts()
  .then((accounts: UserAccountInterface[]) => {
    console.log("Registered accounts: " + accounts.join(", "));
    let localAccount = accounts[0];
    // normally, localAccount === fbacc

    return localAccount.getDiscussions()
      .then(discussions => {
        console.log("Found discussions: " + discussions.join(", "));
        let msg = {body: "Hello!"};
        // return discussion.sendMessage(msg);
      });

    // return localAccount.getContactAccounts()
    //   .then(contactAccounts => {
    //     console.log("Contacts found for first account: " + accounts.join(", "));
    //     return contactAccounts[0];
    //   })
    //   .then(contactAccount => {
    //     return localAccount.getOrCreateDiscussion(contactAccount)
    //   })
    //   .then(discussions => {
    //     console.log("Found discussions: " + discussions.join(", "));
    //     let msg = {body: "Hello!"};
    //     // return discussion.sendMessage(msg);
    //   });
  });
