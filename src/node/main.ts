//import {Writable} from "stream";
//import {Readable} from "stream";
//import {Duplex} from "stream";
//import {Transform} from "stream";
//import {lineReader} from "../core/driver-irc/client/line-reader";
//
////let transform = new Transform({
////  readableObjectMode: true,
////  transform: function (chunk: any, encoding: string, cb: Function) {
////    this.push("hoy");
////    cb(null);
////  }
////});
//
//let transform = lineReader();
//
//process.stdin.pipe(transform);
//
//transform.on("data", (data: any) => {
//  console.log(data);
//  console.log(typeof data);
//});


import {OChat} from "../core/OChat";
import {Account as IrcAccount} from "../core/driver-irc/account";
import {oChatUser} from "../core/OChat";
import {oChatApp} from "../core/OChat";
import {Discussion} from "../core/interfaces";
import {lineReader} from "../core/driver-irc/client/line-reader";



let ircAccount = new IrcAccount({
  server: "euroserv.fr.quakenet.org",
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
  .createDiscussion('ochat-test')
  .then((discussion: Discussion) => {
    console.log("Starting cli-client");
    enableCliClient(discussion);
    // discussion.sendMessage();
  });

interface splitLinesResult {
  lines: string[],
  remainder: string
}

function splitLines(text: string) {
  let lines: string[] = text.split(/\r\n|\r|\n/);
  let remainder = lines.pop();
  return {
    lines: lines,
    remainder: remainder
  }
}

function enableCliClient(discussion: Discussion): void {
  process.stdin.pipe(lineReader()).on("data", (line:string) => {
    discussion.sendText(ircAccount, line);
    console.log(`>> ${line}`);
  });
}

export = OChat;
