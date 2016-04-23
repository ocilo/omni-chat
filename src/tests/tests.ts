import {OChatApp} from "../app";
import {OChatUser} from "../user";
import {Message} from "palantiri";
import {MessageFlags, Connection, Api} from "palantiri-interfaces";
import {getConnection} from "./connections/facebook";

let app = new OChatApp();
let user = new OChatUser(app, "username");

getConnection().then((connection: Connection) => {
  connection.connect().then((api: Api) => {
    api.getCurrentUser()
      .then(userAccount => user.addAccount(userAccount))
      .then(() => {
        user.username = "ochat.frif";
        app.addUser(user);
        return user.getContacts();
      })
      .then((contacts) => {
        let firstContact = contacts[0];
        let firstAccountOfFirstContact = firstContact.accounts[0];
        return user.getOrCreateDiscussion(firstAccountOfFirstContact);
      })
      .then((discussion) =>{
        let msg: Message = new Message();
        msg.author = fbacc;
        msg.body = "Hello !";
        msg.content = undefined;
        msg.creationDate = new Date();
        msg.flags = MessageFlags.TEXT;
        user.sendMessage(msg, discuss);
      });
  });
});
