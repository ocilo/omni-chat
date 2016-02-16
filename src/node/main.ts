import {OChat} from "../core/OChat";
import {DriverIRC} from "../core/driver-irc/driver";
import {AccountIRC} from "../core/driver-irc/account";
import {oChatUser} from "../core/OChat";
import {oChatApp} from "../core/OChat";
import {Discussion} from "../core/interfaces";
import {DiscussionIRC} from "../core/driver-irc/discussion";
import {Account} from "../core/interfaces";

// Initialize oChat by creating a new instance and registering the driver
let app = new oChatApp();
let driver = new DriverIRC();
app.useDriver(driver);

// -- start of account creation/binding, normally you use an already existing account --
// User creation and account binding
let testUser = new oChatUser(app); // this user uses this instance of oChat during this session

// Create a new account manually
// An account of a given type serves as the entry point to the action available by a protocol (instead of driver ?)
// It takes as parameters a data object that holds the required data: here, IRC needs at least a server and username
let accountIRC = new AccountIRC({
  server: "localhost",
  username: "testUser"
});

// bind the account to the user
testUser.addAccount(accountIRC);

// -- end of account creation/binding --

// use app
let accounts: Account[] = testUser.getAccounts(); // get the list of all available accounts
let ircAccount: AccountIRC = <AccountIRC>accounts[0]; // casting here to do some tests, normally the Account interface should be enough

ircAccount
  .connect() // check connection (not required: this is done anyway when using the account)
             // once connected, the account can receive events like invitations
  .then(() => { // now we are connected to the server
    return ircAccount
      .createDiscussion("test"); // create a new global discussion called "test" (the discussion constructor should be better defined)
  })
  .then((discussion: DiscussionIRC) => { // the discussion is created
    return discussion
      .sendMessageString("Hello world!"); // send a message to the participants of the discussion (normally I should first create a Message object and then pass it but a short hand method to send strings can be useful)
  })
  .then(() => { // end of the execution
    console.log("Successfully sent message");
  })
  .catch((err: Error) => { // deal with errors if something wrong happened
    console.error(err);
  });

// TODO: ircAccount.sendMessage(discussion, msg) seems more logical
// We should avoid discussion.send(msg) because it requires us to bind an account to a discussion during runtime - how to deal with the database ?

// export = OChat;
