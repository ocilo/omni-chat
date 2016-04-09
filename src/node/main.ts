import {OChat} from "../core/OChat";
import {Account as IrcAccount} from "../core/driver-irc/account";
import {oChatUser} from "../core/OChat";
import {oChatApp} from "../core/OChat";
import {Discussion} from "../core/interfaces";
import {lineReader} from "../core/driver-irc/client/line-reader";

let ircAccount = new IrcAccount({
  server: "localhost",
  username: "testUser"
});

// create app and bind drivers
let app = new oChatApp();
//let driver = new DriverIRC();
//app.useDriver(driver);

// account creation
let testUser = new oChatUser(app); // TODO: app.createUser();
testUser.addAccount(ircAccount);

// use app
let accounts = testUser.getAccounts();
// let ircAccount = accounts[0];

ircAccount
  .createDiscussion('#ochat-test')
  .then((discussion: Discussion) => {
    console.log("Starting cli-client");
    enableCliClient(discussion);
    // discussion.sendMessage();
  });

function enableCliClient(discussion: Discussion): void {
  process.stdin.pipe(lineReader()).on("data", (line:string) => {
    discussion.sendText(ircAccount, line);
    console.log(`>> ${line}`);
  });
}

export = OChat;
