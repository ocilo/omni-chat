import {OChat} from "../core/OChat";
import {DriverIRC} from "../core/driver-irc/driver";
import {AccountIRC} from "../core/driver-irc/account";
import {oChatUser} from "../core/OChat";
import {oChatApp} from "../core/OChat";
import {Discussion} from "../core/interfaces";


let accountIRC = new AccountIRC("euroserv.fr.quakenet.org", "testUser");

// create app and bind drivers
let app = new oChatApp();
let driver = new DriverIRC();
app.useDriver(driver);

// account creation
let testUser = new oChatUser(app);
testUser.addAccount(accountIRC);

// use app
let accounts = testUser.getAccounts();
let ircAccount = accounts[0];

ircAccount
  .createDiscussion('ochat-test')
  .then((discussion: Discussion) => {
    // discussion.sendMessage();
  });


export = OChat;
