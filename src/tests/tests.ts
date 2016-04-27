import app from "../app";
import {User} from "../user";
import {UserAccount} from "../user-account";

import UserAccountInterface from "../interfaces/user-account";

import * as facebook from "./connections/facebook-cli";

app.useDriver(<any> facebook.Connection, facebook.fromConsole);

let user = new User("ochat.frif");

let fbacc = new UserAccount({
  driver: "facebook",
  id: "0000123456789", // a unique string identifying this account
  username: "ochat.frif"
});

user.addAccount(fbacc);

// app.getUsers().then(users => users[0]).then(user =>
user
  .getAccounts()
  .then((accounts: UserAccountInterface[]) => {
    console.log("Registered accounts: ");
    for(let account of accounts) {
      console.log(account);
    }
    let localAccount = accounts[0];
    // normally, localAccount === fbacc

    return localAccount.getDiscussions()
      .then(discussions => {
        console.log("Found discussions: ");
        for(let discussion of discussions) {
          console.log(discussion);
        }
        let msg = {body: "Hello!"};
        return discussions[0].sendMessage(msg);
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
